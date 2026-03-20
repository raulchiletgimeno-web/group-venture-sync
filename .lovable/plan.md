

## Phase 3: Connect push notifications to real trip events

### Approach

Create a single reusable Edge Function `notify-trip` that accepts a `trip_id`, `section`, and `actor_user_id`, then:
1. Fetches the trip title
2. Fetches all approved members of that trip (excluding the actor)
3. Calls `send-push` logic for each member

Then add a lightweight client-side helper (`notifyTripEvent`) and call it from each section after successful inserts.

### Architecture

```text
[Chat/Photos/Expenses/etc.]
   │  After successful insert
   ▼
supabase.functions.invoke("notify-trip", {
  body: { trip_id, section, actor_user_id }
})
   │  Edge Function (service role)
   ▼
1. Fetch trip title from trips table
2. Fetch approved members excluding actor
3. For each member: query push_subscriptions, send webpush
4. Clean up expired subs (410/403/404)
   ▼
[Push arrives on each member's device]
   │  notificationclick deep link
   ▼
Opens /trip/{tripId}/{section}
```

### Changes

#### 1. Create `supabase/functions/notify-trip/index.ts`
- Accepts `{ trip_id, section, actor_user_id }` (no JWT needed, called from authenticated client)
- Uses service role to query `trips.title`, `trip_members` (approved, excluding actor), and `push_subscriptions` for each member
- Builds payload: title = `YORMIT · {trip_title}`, body = section-specific message, url = `/trip/{trip_id}/{section}`
- Section messages (in Spanish, matching app tone):
  - chat: `Tienes un nuevo mensaje en el chat 💬`
  - photos: `Se ha subido una nueva foto 📸`
  - expenses: `Hay un nuevo gasto compartido 💰`
  - transport: `Se ha actualizado el transporte 🚗`
  - accommodation: `Se ha actualizado el alojamiento 🏨`
  - schedule: `Hay una nueva actividad en el plan 📅`
- Sends push to all members' subscriptions, cleans up expired ones
- Returns `{ notified: N }` count

#### 2. Create `src/lib/notifyTripEvent.ts`
- Simple async helper: `notifyTripEvent(tripId, section, userId)` → calls `supabase.functions.invoke("notify-trip", ...)`
- Fire-and-forget (no await needed by callers, errors logged but not blocking)

#### 3. Modify 6 section files to call `notifyTripEvent` after successful actions

**`src/pages/trips/Chat.tsx`**
- After successful text insert (line 82): `notifyTripEvent(tripId, "chat", user.id)`
- After successful image insert (line 93): same
- After successful audio insert (line ~120): same

**`src/pages/trips/Photos.tsx`**
- After successful photo upload insert: `notifyTripEvent(tripId, "photos", user.id)`

**`src/pages/trips/Expenses.tsx`**
- After successful expense insert in `handleSubmit`: `notifyTripEvent(tripId, "expenses", user.id)`

**`src/pages/trips/Transport.tsx`**
- After successful transport insert/update in `handleSubmit`: `notifyTripEvent(tripId, "transport", user.id)`

**`src/pages/trips/Accommodation.tsx`**
- After successful accommodation insert/update in `handleSubmit`: `notifyTripEvent(tripId, "accommodation", user.id)`

**`src/pages/trips/Schedule.tsx`**
- After successful schedule insert/update in `handleSubmit`: `notifyTripEvent(tripId, "schedule", user.id)`

#### 4. Add to `supabase/config.toml`
```toml
[functions.notify-trip]
verify_jwt = false
```

### Deep linking
The notification `data.url` will be `/trip/{tripId}/{section}`, so tapping the notification opens the exact section. The existing `notificationclick` handler in `custom-sw.js` already supports this.

### Files
1. **Create** `supabase/functions/notify-trip/index.ts`
2. **Create** `src/lib/notifyTripEvent.ts`
3. **Modify** `supabase/config.toml` — add function entry
4. **Modify** `src/pages/trips/Chat.tsx` — add notify calls
5. **Modify** `src/pages/trips/Photos.tsx` — add notify call
6. **Modify** `src/pages/trips/Expenses.tsx` — add notify call
7. **Modify** `src/pages/trips/Transport.tsx` — add notify call
8. **Modify** `src/pages/trips/Accommodation.tsx` — add notify call
9. **Modify** `src/pages/trips/Schedule.tsx` — add notify call

### Testing
1. Use two different accounts on two devices (or one in browser + one on mobile)
2. Both users join the same trip
3. User A sends a chat message → User B receives push "Tienes un nuevo mensaje en el chat 💬"
4. User A uploads a photo → User B receives push about new photo
5. Tap notification → opens the correct trip and section

