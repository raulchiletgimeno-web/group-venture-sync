

## Plan: Replace promotional video with new upload

### What changes

1. **Copy the uploaded video** `user-uploads://YORMIT_VIDEO.mov` to `public/videos/YORMIT_VIDEO.mov`

2. **Update `src/pages/Landing.tsx`** — Replace all references to `/videos/Video_Publicidad_Yormit.mp4` with `/videos/YORMIT_VIDEO.mov` in three places:
   - The thumbnail/preview video in the video section (~line 155)
   - The modal `<video>` element (~line 250)
   - The modal autoplay logic remains identical (muted autoplay → unmute, auto-close on end)

All existing behavior is preserved: autoplay with programmatic unmute, auto-close modal on video end, metadata preload for thumbnail, click-to-open modal, and poster/overlay styling.

**Note:** `.mov` containers with H.264+AAC codecs work in modern browsers. If playback issues arise, the file would need re-encoding to `.mp4`.

