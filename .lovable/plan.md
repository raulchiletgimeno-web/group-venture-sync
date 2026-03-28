

## Conservative Performance Optimization for YORMIT

### What will NOT be touched
- Authentication logic, chat, expenses, transport, accommodation, schedule, weather, emergency phones
- Database schema, RLS policies, realtime subscriptions
- PWA configuration, service worker
- Any existing flow or business logic

---

### 1. Video "Ver cómo funciona" — Fastest start (HIGH PRIORITY)

**Problem**: The modal video (`YORMIT_VIDEO.mov`) only starts loading when the user clicks. `.mov` is also a heavy container format.

**Changes in `Landing.tsx`**:
- Add a `<link rel="preload">` in a `useEffect` to start fetching the video as soon as the landing page mounts — so by the time the user clicks, most of the video is already buffered
- Show a poster frame + spinner in the modal while the video is buffering, so the user gets instant visual feedback instead of a black screen
- Use `preload="auto"` on the modal video element (currently has no preload hint)

This alone will dramatically reduce perceived wait time.

---

### 2. Route-level code splitting (MEDIUM PRIORITY)

**Problem**: All 10+ page components are eagerly imported in `App.tsx`, increasing the initial JS bundle.

**Changes in `App.tsx`**:
- Replace static imports with `React.lazy()` for all routes except `Landing` (which is the entry point)
- Wrap routes in `<Suspense>` with a minimal spinner fallback
- This reduces initial bundle size, making the app load faster on first visit

---

### 3. Dashboard N+1 query optimization (MEDIUM PRIORITY)

**Problem**: `fetchTrips` in `Dashboard.tsx` runs one query per trip to get member counts (lines 73-96).

**Changes in `Dashboard.tsx`**:
- Fetch all member counts in a single query using `.in("trip_id", tripIds)` with `select("trip_id", { count: "exact" })` grouped approach, or a single query returning all members and counting client-side
- Reduces N+1 database calls to 1, speeding up dashboard load

---

### 4. Image loading improvements (LOW-MEDIUM PRIORITY)

**Changes in `Photos.tsx`**:
- Already uses `loading="lazy"` — good
- Add `decoding="async"` to photo grid images for non-blocking decode
- Add a subtle fade-in animation on image load (CSS `opacity` transition) so images appear smoothly instead of popping in

**Changes in `Chat.tsx`**:
- Add `loading="lazy"` and `decoding="async"` to chat image messages

---

### 5. Auth perceived speed (LOW PRIORITY)

**Problem**: The Auth page uses `navigate()` during render when session exists, which can cause a flash.

**Changes in `Auth.tsx`**:
- Move the redirect into a `useEffect` to avoid rendering the auth form briefly before redirect
- Add a quick loading state while checking session

---

### 6. Skeleton loaders for perceived speed (LOW PRIORITY)

**Changes in `Dashboard.tsx`**:
- Replace the simple spinner with 2-3 skeleton card placeholders that match TripCard dimensions
- This gives users spatial context while loading, making it feel faster

---

### Summary of files changed

| File | Change | Risk |
|------|--------|------|
| `Landing.tsx` | Preload video, poster + spinner in modal | Very low |
| `App.tsx` | Lazy route imports + Suspense | Low |
| `Dashboard.tsx` | Batch member count query, skeleton loader | Low |
| `Photos.tsx` | `decoding="async"`, fade-in on load | Very low |
| `Chat.tsx` | `loading="lazy"` + `decoding="async"` on images | Very low |
| `Auth.tsx` | Move redirect to useEffect | Very low |

All changes are additive or refactors of existing patterns. No database, RLS, or business logic changes.

