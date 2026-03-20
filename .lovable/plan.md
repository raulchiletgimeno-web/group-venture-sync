

## Plan: Push Notifications System for YORMIT

### Architecture

```text
User action (Chat/Photos/etc.)
        │
        ▼
supabase.functions.invoke("send-push")
  { tripId, section, excludeUserId }
        │
        ▼
Edge Function "send-push"
  1. Query trip title from trips table
  2. Query trip_members (approved, excluding actor)
  3. Query push_subscriptions for those users
  4. Send Web Push via VAPID to each endpoint
        │
        ▼
Browser Service Worker receives push event
  → shows notification with title + body
  → on click → opens /trip/{tripId}/{section}
```

### Step-by-step implementation

#### 1. Generate VAPID keys & store as secrets
- Generate VAPID key pair via script
- Store `VAPID_PUBLIC_KEY` and `VAPID_PRIVATE_KEY` as project secrets
- Add `VITE_VAPID_PUBLIC_KEY` as a public constant in the frontend code (public keys are safe to embed)

#### 2. Database migration: `push_subscriptions` table
```sql
CREATE TABLE push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint text NOT NULL,
  p256dh text NOT NULL,
  auth text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, endpoint)
);
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
-- Users manage their own subscriptions
CREATE POLICY "Users can insert own" ON push_subscriptions FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can view own" ON push_subscriptions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can delete own" ON push_subscriptions FOR DELETE USING (user_id = auth.uid());
```

#### 3. Custom Service Worker — `public/custom-sw.js`
- Handle `push` event → extract data (title, body, icon, url) → `self.registration.showNotification()`
- Handle `notificationclick` → `clients.openWindow(data.url)` for deep linking
- Import Workbox precache manifest via `injectManifest` for caching continuity

#### 4. Switch vite-plugin-pwa to `injectManifest` mode
- Change `vite.config.ts`: set `strategies: "injectManifest"`, `srcDir: "public"`, `filename: "custom-sw.js"`
- Keep existing manifest and workbox config

#### 5. Create `src/hooks/use-push-notifications.ts`
- Check `'PushManager' in window` and `'serviceWorker' in navigator`
- `subscribe()`: get SW registration → `pushManager.subscribe()` with VAPID public key → upsert to `push_subscriptions`
- `unsubscribe()`: remove from DB + `subscription.unsubscribe()`
- Track permission state

#### 6. Create `src/components/PushNotificationBanner.tsx`
- Shown on Dashboard below install banner, only if push is supported and permission not yet granted/denied
- Dismissible (persisted in localStorage as `yormit-push-dismissed`)
- Copy: "Activa las notificaciones para no perderte nada de tus viajes" + "Activar" button
- On click → triggers the browser permission prompt via the hook

#### 7. Update `src/pages/Dashboard.tsx`
- Import and render `PushNotificationBanner` below `InstallAppBanner`

#### 8. Create Edge Function `supabase/functions/send-push/index.ts`
- Receives `{ tripId, section, excludeUserId }`
- Uses service role key to query `trips` (title), `trip_members` (approved members minus actor), `push_subscriptions` (their endpoints)
- Section name map: `{ chat: "chat 💬", photos: "fotos 📸", accommodation: "alojamiento 🏨", transport: "transporte 🚀", schedule: "actividades 📍", expenses: "gastos 💰" }`
- Notification payload:
  - Title: `YORMIT · {trip.title}`
  - Body: `Hay una novedad en el apartado de {sectionName}`
  - Icon: `/pwa-icon-192.png`
  - Data: `{ url: "/trip/{tripId}/{section}" }`
- Uses `web-push` npm library with VAPID keys
- Cleans up expired/invalid subscriptions (410 responses)
- Update `supabase/config.toml` with `[functions.send-push] verify_jwt = false`

#### 9. Add notification triggers in 6 trip pages
Fire-and-forget calls after successful mutations (no `await`, non-blocking):

- **Chat.tsx** — after `sendText`, `sendImage`, `stopRecording` (audio)
- **Photos.tsx** — after successful photo upload
- **Expenses.tsx** — after `handleSubmit` (create/edit)
- **Transport.tsx** — after `handleSubmit` (create/edit)
- **Accommodation.tsx** — after `handleSubmit` (create/edit)
- **Schedule.tsx** — after `handleSubmit` (create/edit)

Each call: `supabase.functions.invoke("send-push", { body: { tripId, section: "chat", excludeUserId: user.id } })`

### Notification copy (final)
- **Title**: `YORMIT · {Nombre del viaje}`
- **Body by section**:
  - chat: `Tienes un nuevo mensaje en el chat 💬`
  - photos: `Se ha subido una nueva foto 📸`
  - accommodation: `Se ha actualizado el alojamiento 🏨`
  - transport: `Hay novedades en el transporte 🚀`
  - schedule: `Se ha añadido o modificado una actividad 📍`
  - expenses: `Hay un nuevo movimiento en los gastos 💰`

### Secrets needed
- `VAPID_PUBLIC_KEY` — public key (also embedded in frontend code)
- `VAPID_PRIVATE_KEY` — private key (edge function only)

### Limitations
- **iOS Safari**: Push requires iOS 16.4+ and the app must be installed (Add to Home Screen). Cannot receive push in regular Safari tab.
- **Browser tab**: Works on Chrome, Edge, Firefox on desktop and Android. 
- **Per-section preferences**: Deferred — architecture supports adding a `preferences` JSONB column later.
- **Notification history in-app**: Deferred to future phase.

### Files to create/modify
1. **Create** `public/custom-sw.js`
2. **Modify** `vite.config.ts` — injectManifest mode
3. **Create** DB migration — `push_subscriptions` table
4. **Create** `src/hooks/use-push-notifications.ts`
5. **Create** `src/components/PushNotificationBanner.tsx`
6. **Modify** `src/pages/Dashboard.tsx` — add banner
7. **Create** `supabase/functions/send-push/index.ts`
8. **Modify** `supabase/config.toml` — add function config
9. **Modify** 6 trip pages — add send-push calls
10. **Add 2 secrets** — VAPID keys

