

## Restrict photo deletion to author only

### Current state

- **RLS policy** (`Author or creator can delete trip photos`): allows deletion when `auth.uid() = user_id OR is_trip_creator(trip_id)` — creators can delete anyone's photos
- **UI** (`Photos.tsx` line): delete button visible when `photo.user_id === user?.id || isCreator` — creators see delete on all photos

### Changes

**1. Database migration — tighten RLS policy**

Drop existing DELETE policy and replace with author-only:

```sql
DROP POLICY "Author or creator can delete trip photos" ON public.trip_photos;

CREATE POLICY "Only author can delete own photos"
ON public.trip_photos
FOR DELETE
TO public
USING (auth.uid() = user_id);
```

**2. UI — `src/pages/trips/Photos.tsx`**

Remove `isCreator` from the delete button condition:

```tsx
// Before
{(photo.user_id === user?.id || isCreator) && (

// After
{photo.user_id === user?.id && (
```

Also remove the unused `useTripRole` import and `isCreator` variable since they're no longer needed in this component.

### Security layers

| Layer | Protection |
|-------|-----------|
| UI | Delete button hidden for non-authors |
| RLS (database) | `auth.uid() = user_id` — backend rejects unauthorized deletes even if button is bypassed |

