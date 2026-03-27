

## Add gallery image picker to Chat

### Current state
The chat has a single hidden `<input type="file" accept="image/*" capture="environment">` tied to the Camera button. The `capture="environment"` attribute forces the camera on mobile, preventing gallery access.

### Solution
Split into two separate file inputs and two buttons:
1. **Camera button** (existing) — keeps `capture="environment"` to open camera
2. **Gallery button** (new) — `<input type="file" accept="image/*">` WITHOUT `capture` attribute, which opens the device gallery

Both use the existing `handleImageSelect` → `sendImage` flow. No backend changes needed.

### Changes — single file: `src/pages/trips/Chat.tsx`

1. Add `ImageIcon` to the lucide imports (already imported but unused — verify)
2. Add a second `useRef` for gallery input: `galleryInputRef`
3. Add a second hidden input WITHOUT `capture` attribute
4. Add a gallery button next to the camera button with the `ImageIcon` icon
5. Keep camera button as-is

### Input bar layout
```
[📷 Camera] [🖼 Gallery] [____input____] [Send/Mic]
```

Both buttons share the same ghost style (`h-9 w-9`), consistent with current design.

