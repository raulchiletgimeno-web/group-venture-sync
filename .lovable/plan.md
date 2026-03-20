

## Plan: Phase 1 — Push Notifications Infrastructure

### What we'll build

The technical foundation for push notifications: Service Worker, VAPID keys, subscription hook, and permission banner. No event triggers yet.

### Steps

#### 1. Store VAPID keys as secrets
- Use `add_secret` to store `VAPID_PUBLIC_KEY` and `VAPID_PRIVATE_KEY`
- Hardcode the public key in the frontend (public keys are safe to embed)

#### 2. Create `public/custom-sw.js`
Custom Service Worker with:
- `push` event handler → `self.registration.showNotification()` with title, body, icon, deep link data
- `notificationclick` handler → `clients.openWindow(data.url)` for deep linking to the correct trip/section
- Workbox `precacheAndRoute` call for the injected precache manifest

#### 3. Switch `vite.config.ts` to `injectManifest` mode
- Change VitePWA config: `strategies: "injectManifest"`, `srcDir: "public"`, `filename: "custom-sw.js"`
- Keep existing manifest, navigateFallbackDenylist, and glob patterns

#### 4. Create `src/hooks/use-push-notifications.ts`
- Detects if push is supported (`'PushManager' in window`)
- `subscribe()`: gets SW registration → `pushManager.subscribe({ applicationServerKey: VAPID_PUBLIC_KEY })` → upserts to `push_subscriptions` table
- `unsubscribe()`: removes from DB + calls `subscription.unsubscribe()`
- Exposes `isSupported`, `permission`, `isSubscribed`, `subscribe`, `unsubscribe`

#### 5. Create `src/components/PushNotificationBanner.tsx`
- Styled to match the existing `InstallAppBanner` (rounded card with icon, text, button, dismiss)
- Shows on Dashboard below the install banner, only when:
  - Push is supported
  - Permission is `"default"` (not yet asked)
  - Not dismissed (persisted in `localStorage` as `yormit-push-dismissed`)
- Copy: "Activa las notificaciones para estar al día de tus viajes" + "Activar" button with Bell icon
- On click → calls `subscribe()` from the hook, which triggers the browser permission prompt
- Dismissible with X button

#### 6. Add banner to `src/pages/Dashboard.tsx`
- Import and render `<PushNotificationBanner />` right after `<InstallAppBanner />`

#### 7. Add translation keys
- Add `pushTitle` and `pushButton` keys to the `TranslationKeys` interface and all 7 language objects in `translations.ts`

### Files to create/modify
1. **Create** `public/custom-sw.js`
2. **Modify** `vite.config.ts` — injectManifest mode
3. **Create** `src/hooks/use-push-notifications.ts`
4. **Create** `src/components/PushNotificationBanner.tsx`
5. **Modify** `src/pages/Dashboard.tsx` — add banner
6. **Modify** `src/i18n/translations.ts` — add 2 translation keys
7. **Add 2 secrets** — VAPID keys

### Testing
After deployment, you can test by:
1. Opening YORMIT on your phone browser
2. Logging in → Dashboard should show the notification banner
3. Tap "Activar" → browser permission prompt appears
4. Accept → subscription stored in DB (verifiable in backend)

