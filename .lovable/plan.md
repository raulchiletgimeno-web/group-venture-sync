

## Cleanup: Remove test-push button and related code from Dashboard

### What will be removed

1. **Test push button** (lines 226-235) — the `🔔 Test` button visible to subscribed users
2. **`handleTestPush` function** (lines 44-64) — the entire async handler
3. **`testingPush` state** (line 42) — `useState(false)` no longer needed
4. **`isSubscribed` import usage** (line 35) — `usePushNotifications` hook import, only used for the test button
5. **`usePushNotifications` import** (line 4) — no longer needed in Dashboard
6. **`Bell` icon import** (line 2) — only used by the test button

### What stays untouched

- `PushNotificationBanner` component and its import (handles real activation flow)
- `notify-trip` Edge Function (real push delivery)
- `test-push` Edge Function (kept on server for future debugging if needed)
- `use-push-notifications` hook (used by PushNotificationBanner)
- `notifyTripEvent` helper (used by trip section pages)
- `custom-sw.js` service worker

### Files

1. **Modify** `src/pages/Dashboard.tsx` — remove test button, handler, state, and unused imports

