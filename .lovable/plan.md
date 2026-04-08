

## Fix: Chat scroll not jumping to latest/unread messages on entry

### Problem
Line 74 uses `scrollIntoView({ behavior: "smooth" })` on every `messages` state change. This fires during the initial load, but because `ScrollArea` uses a virtualized/custom scrollable container, `scrollIntoView` on a plain `div` ref inside it often doesn't reach the bottom — especially on mobile or when images/audio are still loading. The smooth animation can also lose the race against rendering.

### Root cause
`scrollRef.current?.scrollIntoView()` targets a div inside `ScrollArea`, but `ScrollArea` (Radix) uses an internal viewport element. The `scrollIntoView` call may not propagate correctly to the Radix scroll viewport. Additionally, the initial scroll fires before images/media have loaded, so the container height is wrong.

### Fix — single file: `src/pages/trips/Chat.tsx`

**Change 1: Target the ScrollArea viewport directly for reliable scrolling**

Replace the current scroll approach. Instead of using `scrollIntoView` on a dummy div, get the actual scrollable viewport from the `ScrollArea` and set its `scrollTop` directly.

Replace:
```ts
const scrollRef = useRef<HTMLDivElement>(null);
```
With a ref that targets the ScrollArea's viewport:
```ts
const viewportRef = useRef<HTMLDivElement>(null);
```

**Change 2: Scroll to bottom reliably after initial load and new messages**

Replace line 74:
```ts
useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
```
With:
```ts
const isInitialLoad = useRef(true);

useEffect(() => {
  const vp = viewportRef.current;
  if (!vp) return;

  if (isInitialLoad.current) {
    // On first load, jump instantly to bottom (no smooth — avoids race)
    requestAnimationFrame(() => {
      vp.scrollTop = vp.scrollHeight;
    });
    isInitialLoad.current = false;
  } else {
    // For new messages, smooth scroll only if user is already near the bottom
    const isNearBottom = vp.scrollHeight - vp.scrollTop - vp.clientHeight < 150;
    if (isNearBottom) {
      requestAnimationFrame(() => {
        vp.scrollTop = vp.scrollHeight;
      });
    }
  }
}, [messages]);
```

**Change 3: Attach the ref to the ScrollArea viewport**

Update the `ScrollArea` JSX to pass the viewport ref. The Radix `ScrollArea` renders a `[data-radix-scroll-area-viewport]` element. Use a callback ref or wrap with a `ScrollArea` that forwards the viewport ref.

Simplest approach — replace `ScrollArea` with a plain `div` with `overflow-y: auto` (avoids the Radix viewport indirection entirely, and the chat doesn't need fancy scrollbar styling):

```tsx
<div ref={viewportRef} className="flex-1 overflow-y-auto px-2">
  <div className="flex flex-col gap-1 py-2">
    {messages.map(...)}
  </div>
</div>
```

Remove the `<div ref={scrollRef} />` sentinel at line 214 — no longer needed.

**Change 4: Remove the old scrollRef**

Delete `const scrollRef = useRef<HTMLDivElement>(null);` and the `<div ref={scrollRef} />`.

### Summary of changes
- **1 file changed**: `src/pages/trips/Chat.tsx`
- Replace `ScrollArea` with a plain scrollable div to get a reliable scroll target
- On initial load: instant jump to bottom via `requestAnimationFrame` + `scrollTop`
- On new messages: auto-scroll only if user is already near the bottom (within 150px)
- Removes the unreliable `scrollIntoView` approach

### What stays the same
- All message rendering, sending, deleting, recording — unchanged
- All other pages and components — untouched
- Chat styling and layout — identical

