

## Push notification for join requests + pending badge on Dashboard

### What exists today

- `JoinTrip.tsx` calls `notify-creator-join` edge function when a user requests to join — but that function doesn't send a real push notification (it just logs to console)
- `notify-trip` edge function already has the full Web Push infrastructure (VAPID, web-push library, expired subscription cleanup)
- `MemberApprovalManager` shows pending requests inside the trip dashboard with realtime updates
- `TripCard` already shows an `unseenCount` badge and a "pending approval" chip
- PWA badge (Badging API) is already used in `use-unseen-counts.ts`

### Plan

**1. Rewrite `notify-creator-join` edge function to send real push notifications**

Replace the current placeholder logic with actual Web Push sending (reusing the same pattern as `notify-trip`):
- Accept `{ tripId }` from the authenticated caller
- Validate JWT to get the requester's user ID
- Fetch trip title and creator/co-creator user IDs from `trip_members` (roles `creator` and `co-creator`)
- Fetch requester's name from `profiles`
- Fetch push subscriptions for those admin users only
- Send push with:
  - Title: `YORMIT · {trip title}`
  - Body: `{requester name} quiere unirse a este viaje 🔔`
  - Deep link URL: `/trip/{tripId}` (opens the trip dashboard where MemberApprovalManager is visible)
- Clean up expired subscriptions (same 410/404/403 pattern)

**2. Add pending request count to Dashboard trip cards**

In `Dashboard.tsx` (`fetchTrips`):
- For each trip where the user is creator/co-creator, query `trip_members` count where `status = 'pending'`
- Pass a new `pendingCount` prop to `TripCard`

In `TripCard.tsx`:
- Accept `pendingCount` prop
- When `pendingCount > 0`, show a small amber badge (similar style to UnseenBadge but amber-themed) with the count, so the creator sees at a glance which trips have pending requests

**3. Include pending counts in the PWA app badge**

In `use-unseen-counts.ts` or a new `use-pending-counts.ts` hook:
- Fetch pending member count for trips where user is admin
- Add pending count to the `totalUnseen` used for `setAppBadge()`, so the PWA icon shows pending requests too

**4. Realtime refresh for pending counts on Dashboard**

Subscribe to `trip_members` INSERT/DELETE events in the Dashboard to refresh pending counts in real-time (same pattern as existing unseen counts realtime channel).

### Files to modify

| File | Change |
|------|--------|
| `supabase/functions/notify-creator-join/index.ts` | Full rewrite: real Web Push to admins only |
| `src/pages/Dashboard.tsx` | Fetch pending counts per trip, pass to TripCard |
| `src/components/TripCard.tsx` | New `pendingCount` prop, amber badge |
| `src/hooks/use-unseen-counts.ts` | Include pending requests in PWA badge total |

### Notification details

- **Recipients**: Only creator + co-creators of that trip
- **Not notified**: The requesting user, regular members
- **Deep link**: `/trip/{tripId}` — opens trip dashboard where `MemberApprovalManager` is already rendered
- **PWA badge**: Pending requests will add to the existing app badge number
- **Disappears**: When admin approves/rejects, the realtime subscription updates counts and the badge clears automatically

### Edge function security

The function validates the JWT from the Authorization header using `supabase.auth.getUser()`. Uses service role client only for cross-user queries (fetching admin subscriptions, trip data).

