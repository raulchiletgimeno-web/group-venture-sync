

## Diagnosis: Why the banner doesn't appear on mobile

### Most likely cause

**localStorage dismissal from previous testing.** The user has been testing the banner for several sessions. Even though we changed the key to `yormit-push-dismissed-v2`, the user likely dismissed the v2 banner during a prior test attempt. Once dismissed, `shouldShow` is `false` and the banner returns `null`.

On PC incognito it works because incognito starts with empty localStorage.

### Secondary risk

The `shouldShow` logic has a gap: if `supportState` is `"unavailable"` AND `isMobile` is `false` (edge case detection failure), none of the three conditions (`requiresInstall`, `canRequestPermission`, `showFallbackState`) would be true, and the banner hides silently.

### Fix plan (3 changes)

#### 1. Bump dismiss key to `v3` in `PushNotificationBanner.tsx`
Change `DISMISS_KEY` from `"yormit-push-dismissed-v2"` to `"yormit-push-dismissed-v3"` so all mobile devices get a fresh state.

#### 2. Add temporary diagnostic console.log
Add a single `console.log` at the top of the component that prints the exact decision values:
```
[PushBanner] { supportState, permission, isSubscribed, isMobile, isInstalled, dismissed, requiresInstall, canRequestPermission, showFallbackState, shouldShow }
```
This will be visible in mobile browser DevTools (or via remote debugging) and will tell us exactly what's happening if the fix doesn't work.

#### 3. Make `shouldShow` logic unconditionally visible on mobile
Change the `shouldShow` calculation so that on mobile, if none of the three positive conditions are met but the user hasn't dismissed, it still shows via `showFallbackState`. Currently `showFallbackState` requires `!requiresInstall && !canRequestPermission` which is correct, but also requires `isMobile` — if `isMobile` detection fails, nothing shows. Add a desktop fallback too:

```typescript
const showFallbackState = !requiresInstall && !canRequestPermission && !isSubscribed && permission !== "denied";
```

Remove the `isMobile` gate from `showFallbackState` so the banner is visible everywhere as a last resort.

### Files to modify
1. `src/components/PushNotificationBanner.tsx` — bump key, add log, fix fallback logic

### Verification
After publishing, open on mobile → Dashboard. The diagnostic log will confirm exactly what state the hook returns. The banner should appear because the v3 key ensures a clean dismissed state.

