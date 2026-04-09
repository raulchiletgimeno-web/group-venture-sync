

## Fix: Chat scroll should land on first unread message, not always at bottom

### Problem
Currently, on initial load the chat always jumps to the very bottom (`vp.scrollTop = vp.scrollHeight`). The user has no way to see where they left off — they land at the end and must scroll up manually to find what's new. This is unlike modern messaging apps (WhatsApp, Telegram) where the view starts at the first unread message.

### How it works today
- `trip_last_seen` table stores per-user, per-section `last_seen_at` timestamp
- `useMarkSectionSeen` upserts this timestamp when entering/leaving the chat
- The initial scroll effect (line 75-87) always scrolls to the very bottom on first load
- There's no query for the user's `last_seen_at` value inside the Chat component

### Fix — single file: `src/pages/trips/Chat.tsx`

**Change 1: Fetch the user's `last_seen_at` for this chat on mount**

Before messages load, query `trip_last_seen` for the current user + trip + section="chat" to get the timestamp of when they last viewed the chat.

```ts
const [lastSeenAt, setLastSeenAt] = useState<string | null>(null);

useEffect(() => {
  if (!tripId || !user) return;
  supabase.from("trip_last_seen")
    .select("last_seen_at")
    .eq("trip_id", tripId)
    .eq("user_id", user.id)
    .eq("section", "chat")
    .maybeSingle()
    .then(({ data }) => {
      setLastSeenAt(data?.last_seen_at ?? null);
    });
}, [tripId, user]);
```

**Change 2: Replace the initial scroll logic to target the first unread message**

On initial load, instead of scrolling to the bottom, find the first message whose `created_at` is after `lastSeenAt`. If found, scroll that message's DOM element into view. If no unread messages exist (or `lastSeenAt` is null — first visit), scroll to bottom as before.

Each message `div` gets a `data-msg-id` attribute. On initial load:

```ts
useEffect(() => {
  const vp = viewportRef.current;
  if (!vp || !isInitialLoad.current) {
    // For subsequent new messages, auto-scroll only if near bottom
    if (vp) {
      const isNearBottom = vp.scrollHeight - vp.scrollTop - vp.clientHeight < 150;
      if (isNearBottom) requestAnimationFrame(() => { vp.scrollTop = vp.scrollHeight; });
    }
    return;
  }
  // Wait until lastSeenAt has been fetched (null means loading, undefined would mean no record)
  if (lastSeenAt === null && user) return; // still loading

  // Find the first unread message
  const firstUnreadIdx = lastSeenAt
    ? messages.findIndex(m => m.user_id !== user?.id && m.created_at > lastSeenAt)
    : -1;

  requestAnimationFrame(() => {
    if (firstUnreadIdx > 0) {
      // Scroll to the unread message element
      const el = vp.querySelector(`[data-msg-idx="${firstUnreadIdx}"]`);
      if (el) {
        (el as HTMLElement).scrollIntoView({ block: "start" });
        isInitialLoad.current = false;
        return;
      }
    }
    // Fallback: scroll to bottom
    vp.scrollTop = vp.scrollHeight;
    isInitialLoad.current = false;
  });
}, [messages, lastSeenAt]);
```

**Change 3: Add a visual "unread messages" separator**

Between the last read message and the first unread message, render a small banner like modern messaging apps:

```tsx
{firstUnreadIdx === idx && (
  <div className="flex items-center gap-2 my-3">
    <div className="flex-1 border-t border-primary/30" />
    <span className="text-xs text-primary font-medium px-2">{t.newMessages ?? "Mensajes nuevos"}</span>
    <div className="flex-1 border-t border-primary/30" />
  </div>
)}
```

**Change 4: Add `data-msg-idx` to each message wrapper**

```tsx
<div key={msg.id} data-msg-idx={idx}>
```

**Change 5: Use a distinct sentinel for "lastSeenAt not yet fetched" vs "no record"**

Use `undefined` for "not yet fetched" and `null` for "no record found":
- Initialize as `undefined`
- Set to `data?.last_seen_at ?? null` after query

### Translation key
Add `newMessages` to the translations object (Spanish: "Mensajes nuevos", English: "New messages", etc.).

### Summary
- **1 file changed**: `src/pages/trips/Chat.tsx`
- **1 file touched**: `src/i18n/translations.ts` (add `newMessages` key)
- Fetches `last_seen_at` from `trip_last_seen` on mount
- Scrolls to the first unread message instead of the bottom
- Shows a visual "New messages" separator line
- Falls back to bottom scroll if no unread messages or first visit
- Auto-scroll on new messages only if user is near the bottom (unchanged)
- No other files or features touched

