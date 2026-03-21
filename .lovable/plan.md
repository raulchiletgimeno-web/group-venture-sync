

## Fix: Persistent push notification banner state

### Root cause

Every time the app loads, `usePushNotifications` starts with `isSubscribed = false` and runs an async check (service worker ready → local subscription → DB query). During this async window (which can take seconds), the banner flashes because `isSubscribed` is temporarily `false`. If any step fails (auth not ready, SW slow, network issue), the banner stays visible despite the user being correctly subscribed.

### Solution

Add a localStorage optimistic flag that persists subscription state across sessions:

1. **On successful subscribe**: Set `localStorage("yormit-push-subscribed") = "true"`
2. **On initial load**: Initialize `isSubscribed` from this flag (optimistic = no flash)
3. **Async verification runs in background**: Only sets `isSubscribed = false` if verification **explicitly confirms** no subscription exists (not on errors/timeouts)
4. **On unsubscribe or confirmed loss**: Clear the flag

### Files to modify

**1. `src/hooks/use-push-notifications.ts`**
- Add `SUBSCRIBED_KEY = "yormit-push-subscribed"` constant
- Initialize `isSubscribed` from `localStorage.getItem(SUBSCRIBED_KEY) === "true"` instead of `false`
- In `syncSubscriptionState`: only set `isSubscribed(false)` + clear localStorage when we have **positive confirmation** of no subscription (DB returns empty, not on errors)
- On errors during sync: keep current optimistic state, don't flip to false
- In `subscribe` success: set localStorage flag
- In `unsubscribe`: clear localStorage flag

**2. `src/components/PushNotificationBanner.tsx`**
- Remove the dismissed localStorage key reset (v4 versioning). The dismiss state stays as-is.
- Add: after successful `subscribe()`, also clear the dismiss key so future logic is clean

### Banner visibility rules after fix

**Will NOT appear when:**
- User has successfully subscribed (flag persisted, verified in background)
- User dismissed the banner (dismiss key in localStorage)
- User denied permissions and dismissed the warning

**Will reappear ONLY when:**
- Background verification **confirms** subscription is gone (DB has no matching row AND local subscription is missing)
- User manually revoked permission (permission changed from granted to denied/default)
- Fresh device/browser with no history

### Technical detail

```text
Load flow:
1. isSubscribed = localStorage("yormit-push-subscribed") === "true"  ← optimistic
2. Banner hidden immediately if true
3. Background sync runs:
   - SW ready → local sub exists → DB confirms → keep true ✓
   - SW ready → local sub exists → DB empty → set false, clear flag, show banner
   - SW ready → no local sub → set false, clear flag, show banner  
   - Any error → keep current state (don't flash banner on transient failures)
```

