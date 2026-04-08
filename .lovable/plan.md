

## Fix: Notification cleanup not fully synchronized after viewing content

### Problem
When the user views the content that triggered a notification, two things fail to clear:
1. **System notifications** (in the OS notification tray) — never dismissed programmatically
2. **PWA badge** (number on app icon) — only updates on 30s polling or realtime INSERT events; no refresh on app focus/resume

Result: "ghost" badges and stale notifications persist even after content is seen.

### Root cause
- `useMarkSectionSeen` marks the DB and dispatches `section-seen`, which updates internal counters and the PWA badge number — but **never touches system notifications**
- There is **no visibility/focus listener** to refetch counts when the user returns to the app (e.g. tapping the icon), so the badge can be stale until the next 30s poll
- The Service Worker closes the notification on click (`notificationclick`), but only **that one** notification — others for the same trip/section remain

### Fix — 3 targeted changes, 2 files

**File 1: `src/hooks/use-mark-section-seen.ts`**

After upserting `trip_last_seen` and dispatching the `section-seen` event, call the Notifications API to close any system notifications whose tag matches the current trip+section deep link (`/trip/{tripId}/{section}`).

```ts
// After the existing window.dispatchEvent(...)
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.ready.then((reg) => {
    reg.getNotifications({ tag: `/trip/${tripId}/${section}` }).then((notifs) => {
      notifs.forEach((n) => n.close());
    });
  }).catch(() => {});
}
```

This uses the same `tag` value set in `custom-sw.js` (`tag: data.url`), so matching is exact.

**File 2: `src/hooks/use-unseen-counts.ts`**

**Change A** — Add a `visibilitychange` listener so counts (and thus the PWA badge) refresh instantly when the user switches back to the app, instead of waiting up to 30 seconds:

```ts
useEffect(() => {
  const handler = () => {
    if (document.visibilityState === "visible") fetchCounts();
  };
  document.addEventListener("visibilitychange", handler);
  return () => document.removeEventListener("visibilitychange", handler);
}, [fetchCounts]);
```

**Change B** — When `badgeTotal` drops to 0, also clear **all** remaining system notifications to ensure no orphans:

```ts
// Inside the existing badgeTotal useEffect, after clearAppBadge:
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.ready.then((reg) => {
    reg.getNotifications().then((notifs) => {
      notifs.forEach((n) => n.close());
    });
  }).catch(() => {});
}
```

### How it all fits together

```text
User taps notification          User taps app icon         User opens section in-app
        │                              │                           │
  SW closes THAT notif         visibilitychange fires       useMarkSectionSeen runs
        │                              │                           │
  deep link → section          fetchCounts() immediate      upsert trip_last_seen
        │                              │                           │
  useMarkSectionSeen           badgeTotal recalculated      close matching system notifs
        │                              │                           │
  close matching notifs        setAppBadge / clearBadge     dispatch section-seen
        │                              │                           │
  dispatch section-seen        if 0 → clear all notifs      fetchCounts → badge update
        │                              │                           │
  fetchCounts → badge=0        ✓ clean                      ✓ clean
        │
  clearAppBadge + clear all
        │
  ✓ clean
```

### What stays the same
- All other app functionality — zero changes outside these 2 files
- Push notification sending logic (edge functions) — unchanged
- Notification display format, deep linking, throttling — unchanged
- Realtime subscriptions, polling interval, badge styling — unchanged

