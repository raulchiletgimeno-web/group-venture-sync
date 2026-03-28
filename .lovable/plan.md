

## Fix: Back arrow in trips navigates to Dashboard instead of Landing

### Problem
Line 13 in `TripLayout.tsx`: when at the trip dashboard (not a sub-section), the back arrow links to `"/"` (public landing) instead of `"/dashboard"` (Mis viajes).

### Fix — single line change in `src/components/TripLayout.tsx`

Change line 13 from:
```tsx
const backTo = isSubSection ? `/trip/${tripId}` : "/";
```
to:
```tsx
const backTo = isSubSection ? `/trip/${tripId}` : "/dashboard";
```

This preserves the existing sub-section logic (Transport → Trip dashboard) and only changes the trip dashboard → back destination from `/` to `/dashboard`.

### What stays the same
- Sub-section back navigation (e.g. Transport → Trip dashboard) — unchanged
- All other navigation flows — unchanged
- No logic, auth, or database changes

