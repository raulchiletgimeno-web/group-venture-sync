

## Phase 2: End-to-end push notification test

### What we'll build

1. **Edge Function `send-push`** — receives a user ID and payload, fetches their push subscriptions from the database, and sends Web Push notifications using the VAPID keys already stored as secrets (`VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`).

2. **Edge Function `test-push`** — a simple authenticated endpoint that sends a test notification to the calling user's own subscribed devices. This is the easiest way to validate the full pipeline without wiring up trip events yet.

3. **"Test notification" button** in the Dashboard (temporary) — visible only when the user is subscribed. Calls `test-push`, which triggers `send-push` internally.

### Architecture

```text
[Dashboard]
   │  Button click
   ▼
supabase.functions.invoke("test-push")
   │  Auth header (JWT)
   ▼
Edge Function "test-push"
   │  Validates JWT → gets user_id
   │  Calls send-push logic internally
   ▼
Edge Function "send-push"
   │  Queries push_subscriptions for user_id
   │  Sends Web Push via web-push library
   │  Payload: { title, body, icon, data: { url } }
   ▼
[Service Worker] push event → showNotification
   │  User taps
   ▼
notificationclick → opens /dashboard (or any deep link URL)
```

### Technical details

#### Edge Function: `supabase/functions/send-push/index.ts`
- Uses `npm:web-push` (available in Deno via `npm:` specifier)
- Reads `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` from env
- Accepts `{ user_id, title, body, url }` in the request body
- Queries `push_subscriptions` table with service role client
- Sends to all endpoints for that user
- Cleans up expired/invalid subscriptions (status 410)

#### Edge Function: `supabase/functions/test-push/index.ts`
- Authenticated endpoint (validates JWT via `getClaims`)
- Extracts `user_id` from claims
- Calls `send-push` internally (direct function call, not HTTP)
- Actually, since edge functions are separate, it will query subscriptions and send push directly (same logic as send-push but self-contained for the test)
- Payload: `{ title: "YORMIT · Test", body: "🔔 Push notifications working!", data: { url: "/dashboard" } }`

#### Dashboard button (temporary)
- In `src/pages/Dashboard.tsx`, add a small "🔔 Test" button near the push banner area
- Only visible when `isSubscribed === true`
- Calls `supabase.functions.invoke("test-push")` with auth header
- Shows toast on success/failure

### Config
- Add `[functions.send-push]` and `[functions.test-push]` to `supabase/config.toml` with `verify_jwt = false` (JWT validated in code)

### Files to create/modify
1. **Create** `supabase/functions/send-push/index.ts`
2. **Create** `supabase/functions/test-push/index.ts`
3. **Modify** `supabase/config.toml` — add function entries
4. **Modify** `src/pages/Dashboard.tsx` — add temporary test button

### Verification
After publishing:
1. Open YORMIT from home screen on your Samsung
2. Log in → Dashboard
3. Tap the "Test notification" button
4. Minimize YORMIT or lock the screen
5. Within seconds, you should receive a push notification
6. Tap the notification → YORMIT opens on `/dashboard`

