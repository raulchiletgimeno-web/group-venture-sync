

## Fix: Authenticated users seeing Landing page when reopening YORMIT

### Problem
The `/` route always renders the `Landing` page with no authentication check. When a logged-in user reopens the app (from the icon, standby, background), the PWA's `start_url` is `/`, so they land on the public page instead of their Dashboard.

### Root cause
`Landing` component never checks for an active session. Unlike `Auth.tsx` (which redirects to `/dashboard` if authenticated), `Landing` has zero auth awareness.

### Fix — single change in `src/pages/Landing.tsx`

Add a `useEffect` at the top of the `Landing` component that checks for an existing session and redirects to `/dashboard` if the user is already authenticated:

```ts
import { useAuth } from "@/contexts/AuthContext";

// Inside the Landing component, before other effects:
const { session, loading } = useAuth();

useEffect(() => {
  if (!loading && session) {
    navigate("/dashboard", { replace: true });
  }
}, [session, loading, navigate]);
```

While `loading` is true (session being restored), the Landing page renders normally for a brief moment — this is fine because the auth check resolves quickly and the redirect happens seamlessly.

### What stays the same
- All routing in `App.tsx` — unchanged
- `ProtectedRoute` logic — unchanged
- Auth page, Dashboard, all trip pages — unchanged
- PWA manifest `start_url: "/"` — unchanged (the redirect handles it)
- Landing page design and content — unchanged for non-authenticated visitors
- No other files touched

