## Plan: Digital Asset Links para Android TWA

### What
Create a static JSON file at `/.well-known/assetlinks.json` so the Android Trusted Web Activity (Bubblewrap) can verify the app and run without the browser top bar.

### How
1. Create `public/.well-known/assetlinks.json` with the exact JSON content provided.
2. Vite automatically copies everything in `public/` to the build root, so the file will be served at the exact URL `https://yormit.com/.well-known/assetlinks.json` as valid JSON.
3. No route changes, no code changes, no config changes.

### Files to create
- `public/.well-known/assetlinks.json`

### No other files touched.
