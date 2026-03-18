

## Plan: Replace promotional video with new upload

1. **Copy uploaded video** `user-uploads://Video_Yormit_Vertical.mov` → `public/videos/YORMIT_VIDEO.mov` (overwrites existing)

2. **No code changes needed** — `src/pages/Landing.tsx` already references `/videos/YORMIT_VIDEO.mov` in both the thumbnail preview and the modal. All existing behavior (muted autoplay preview, click-to-open modal, programmatic unmute, auto-close on end) is preserved automatically.

