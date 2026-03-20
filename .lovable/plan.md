

## Plan: PWA update strategy — force refresh on new versions

### Problem
The current service worker uses `injectManifest` with `precacheAndRoute`, which caches all assets aggressively. When a new version is published, the old SW continues serving stale cached assets until the user closes ALL tabs and reopens. On mobile (especially installed PWAs), tabs are rarely fully closed, so users get stuck on old versions indefinitely.

The registration in `main.tsx` does a simple `register()` with no update handling — no checking for updates, no prompting the user, no `skipWaiting`.

### Solution: Auto-update with "new version available" toast

#### 1. `public/custom-sw.js` — Add `skipWaiting` + `clientsClaim`
```javascript
import { clientsClaim } from 'workbox-core';
self.skipWaiting();
clientsClaim();
```
This makes new service workers activate immediately instead of waiting for all tabs to close. Combined with precaching, Workbox will serve the new cached assets on next navigation.

#### 2. `src/main.tsx` — Detect updates and reload
Replace the simple `register()` with proper update detection:
- After registration, call `registration.update()` periodically (every 60s)
- Listen for the `controllerchange` event to auto-reload when a new SW takes over
- This ensures that even installed PWAs on mobile pick up changes within ~60 seconds

#### 3. `vite.config.ts` — Add `navigateFallbackDenylist`
Add `/~oauth`, `/sitemap.xml`, `/robots.txt` to the denylist (per memory notes) to prevent caching issues with those routes.

### Files to modify
1. **`public/custom-sw.js`** — add `skipWaiting()` + `clientsClaim()` at top
2. **`src/main.tsx`** — add update polling + `controllerchange` reload
3. **`vite.config.ts`** — add `navigateFallbackDenylist`

### Behavior after fix
- New publish → SW detects new precache manifest within 60s
- `skipWaiting` activates it immediately
- `controllerchange` fires → page reloads automatically
- User always sees the latest version without manual intervention
- Installed PWA on home screen: same behavior, auto-updates on next open or within 60s of being open

