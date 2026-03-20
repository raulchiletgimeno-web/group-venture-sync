

## Plan: Push Notifications System for YORMIT

### Architecture Overview

```text
┌─────────────┐     ┌──────────────────┐     ┌────────────────┐
│  Browser SW  │◄────│  Push Service     │◄────│  Edge Function  │
│  (receives)  │     │  (FCM/Apple/etc)  │     │  send-push      │
└─────────────┘     └──────────────────┘     └────────┬───────┘
                                                       │
                                              ┌────────┴───────┐
                                              │  DB Triggers    │
                                              │  (webhook on    │
                                              │   INSERT)       │
                                              └────────────────┘
```

The Web Push API with VAPID keys is the standard for PWA push notifications. It works on Android (Chrome, Edge, Firefox), desktop browsers, and Safari 16.4+ on iOS. No third-party service needed.

### Components to Build

#### 1. Generate VAPID keys and store as secrets
- Generate a VAPID key pair (public + private)
- Store `VAPID_PUBLIC_KEY` and `VAPID_PRIVATE_KEY` as secrets
- Expose the public key in the frontend

#### 2. Database: `push_subscriptions` table
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
-- RLS: users can manage their own subscriptions
```

#### 3. Custom Service Worker (`public/custom-sw.js`)
- Listen for `push` events → show notification with trip title + section
- Listen for `notificationclick` → open the correct deep link (`/trip/{id}/{section}`)
- vite-plugin-pwa's `injectManifest` strategy to merge with the custom SW

#### 4. Frontend: Permission prompt + subscription
- New hook `usePushNotifications` that:
  - Checks if push is supported
  - Subscribes to push using VAPID public key
  - Sends the subscription to the database
- Smart permission UX: show a styled in-app banner on the Dashboard (after first login, not immediately) explaining the value, then trigger the browser prompt only when user clicks "Activar"

#### 5. Edge Function: `send-push`
- Receives: `{ tripId, section, excludeUserId }`
- Queries trip title, trip members (excluding the actor)
- Fetches their push subscriptions from `push_subscriptions`
- Sends web push notification using `npm:web-push` with VAPID keys
- Notification body: `"Novedad en tu viaje a {destination}: {sectionName}"`
- Data payload includes deep link URL

#### 6. Trigger notifications from existing code
Add `supabase.functions.invoke("send-push", ...)` calls in the existing pages after successful inserts:
- **Chat.tsx**: after sending text/image/audio message
- **Photos.tsx**: after uploading a photo
- **Expenses.tsx**: after creating/editing an expense
- **Transport.tsx**: after creating/editing transport
- **Accommodation.tsx**: after creating/editing accommodation
- **Schedule.tsx**: after creating/editing an activity

Each call passes `{ tripId, section: "chat"|"photos"|..., excludeUserId: user.id }`.

#### 7. Service Worker config change
Switch vite-plugin-pwa from `generateSW` to `injectManifest` mode so we can add push event handlers to the service worker while keeping the existing caching behavior.

### Notification content format
- Title: `"YORMIT · {Trip Title}"`
- Body: `"Novedad en el apartado de {section name}"`
- Icon: `/pwa-icon-192.png`
- Data: `{ url: "/trip/{tripId}/{section}" }`

### Permission UX
A subtle banner on the Dashboard (below the install banner) that appears once after login if the user hasn't been asked yet. Shows: "Activa las notificaciones para enterarte de los cambios en tus viajes" with a primary "Activar" button. Dismissible and persisted in localStorage.

### What's included in this phase
- Full push subscription flow
- Notifications for all 6 content sections
- Deep linking to the correct trip/section
- Smart permission prompt
- Works on Android, desktop, and iOS Safari 16.4+

### What's deferred to a future phase
- Per-section notification preferences (architecture is ready — add a `preferences` JSONB column to `push_subscriptions` later)
- Notification history/inbox in-app

### Files to create/modify
1. **Create** `public/custom-sw.js` — push + notificationclick handlers
2. **Modify** `vite.config.ts` — switch to injectManifest mode
3. **Create** DB migration — `push_subscriptions` table with RLS
4. **Create** `src/hooks/use-push-notifications.ts` — subscription logic
5. **Create** `src/components/PushNotificationBanner.tsx` — permission prompt UI
6. **Modify** `src/pages/Dashboard.tsx` — add the banner
7. **Create** `supabase/functions/send-push/index.ts` — edge function
8. **Modify** `supabase/config.toml` — add send-push function config
9. **Modify** 6 trip pages (Chat, Photos, Expenses, Transport, Accommodation, Schedule) — add send-push calls after successful mutations
10. **Add secrets**: `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`

