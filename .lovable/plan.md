

## Fix: Chat message bubbles getting clipped

### Root cause

The Radix `ScrollArea` viewport applies `overflow: hidden` internally, and the message bubble container uses `max-w-[75%]` inside a flex row without `min-w-0`. This combination causes the flex item (the bubble `div`) to overflow and get clipped by the scroll viewport, especially for longer messages or on narrower screens.

### Fix — single file: `src/pages/trips/Chat.tsx`

**Change 1** — Add `min-w-0` to the bubble container (line 187) so flex shrinking works correctly and text wraps instead of clipping:

```tsx
// From:
<div className={`max-w-[75%] rounded-2xl px-3 py-2 shadow-sm group ${isOwn ? "..." : "..."}`}>

// To:
<div className={`max-w-[75%] min-w-0 rounded-2xl px-3 py-2 shadow-sm group ${isOwn ? "..." : "..."}`}>
```

**Change 2** — Add `overflow-hidden` to the text paragraph (line 191) to ensure `break-words` works reliably, and use `overflow-wrap: anywhere` for extra safety with long unbroken strings:

```tsx
// From:
<p className="text-sm whitespace-pre-wrap break-words text-foreground">

// To:
<p className="text-sm whitespace-pre-wrap break-words overflow-hidden text-foreground" style={{ overflowWrap: "anywhere" }}>
```

### What stays the same
- All other chat functionality (send, delete, audio, images, realtime)
- All other pages and components — zero changes outside `Chat.tsx`
- Message styling/colors/layout remain visually identical, just no longer clipped

