

## Diagnosis confirmed with real data

### What's actually happening

**Database has 5 subscriptions** for your user — the auto-repair IS saving to DB. But `test-push` logs show **403 VAPID mismatch** on every send attempt. This means:

1. The frontend creates subscriptions with its `VAPID_PUBLIC_KEY`
2. The edge function signs them with the server's `VAPID_PRIVATE_KEY`  
3. These keys **still don't match** — the push service rejects every notification

### Problem 1: Banner disappears

The auto-repair (lines 87-114 in `use-push-notifications.ts`) detects desync → unsubscribes → re-subscribes → saves to DB → sets `isSubscribed=true` → banner hides. This all happens in ~1 second on mount, before you can interact.

**Fix:** Remove the auto-repair re-subscription. When desync is detected, just clean up the stale local subscription and leave `isSubscribed=false`. The banner stays visible, and the user controls when to subscribe.

### Problem 2: 0 devices (actually 403 on all 5)

The function finds your 5 subscriptions but every `sendNotification()` fails with 403. The catch block logs the error and increments nothing, so `sent=0`.

**Root cause:** VAPID key pair mismatch between frontend and server secrets.

**Fix:** 
1. Generate a verifiable key pair using a script, log both keys
2. Update the `VAPID_PUBLIC_KEY` and `VAPID_PRIVATE_KEY` secrets
3. Update the frontend constant to match
4. Delete all 5 stale subscriptions from DB
5. Add 403 cleanup logic to `test-push` so stale subs get removed automatically

### Changes

#### 1. `src/hooks/use-push-notifications.ts`
- Remove auto-repair re-subscription from `useEffect`. When local sub exists but DB record doesn't match: just `unsubscribe()` locally and set `isSubscribed=false`
- Banner stays visible until user explicitly taps "Activar"

#### 2. `supabase/functions/test-push/index.ts`
- Add cleanup of subscriptions that return 403 (same as 410 cleanup)
- Log the VAPID public key being used for debugging

#### 3. VAPID keys
- Generate new matching pair via edge function script
- Update both secrets
- Update frontend constant
- Delete all existing rows from `push_subscriptions`

### Files
1. **Modify** `src/hooks/use-push-notifications.ts` — remove auto-repair, keep desync detection as cleanup-only
2. **Modify** `supabase/functions/test-push/index.ts` — add 403 cleanup + VAPID debug log
3. **Update** secrets `VAPID_PUBLIC_KEY` and `VAPID_PRIVATE_KEY`
4. **Delete** all rows from `push_subscriptions`

### Verification steps on Samsung
1. Open YORMIT from home screen
2. Banner "Activar notificaciones" should appear and **stay visible**
3. Tap "Activar" → accept permission
4. Tap "🔔 Test" → should show "1 dispositivo"
5. Lock screen → notification arrives
6. Tap notification → opens `/dashboard`

