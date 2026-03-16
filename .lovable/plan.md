

## Plan: Fix timezone offset in transport times

### Root Cause

The `trip_transport` table uses `timestamp with time zone` columns. When the user enters "10:00" in a `datetime-local` input, the string "2025-03-16T10:00" is sent to Supabase, which interprets it as UTC (10:00 UTC). When displaying, `new Date(d).toLocaleString()` converts from UTC to the user's local timezone (e.g., UTC+2 in Spain), showing "12:00" instead of "10:00". This causes the +2 hour shift.

### Affected modules

- **Transport** (`trip_transport.departure_datetime`, `trip_transport.arrival_datetime`): Both `timestamptz` columns. **This is the problem.**
- **Schedule** (`trip_schedule.date`, `trip_schedule.time`): Uses `date` and `time without time zone`. **No issue.**
- **Accommodation** (`trip_accommodation.check_in`, `check_out`): Uses `date`. **No issue.**

### Fix in `src/pages/trips/Transport.tsx`

1. **Display (`formatDt`)**: Add `timeZone: 'UTC'` to `toLocaleString()` so the stored UTC value is displayed as-is (matching what the user originally typed):

```typescript
const formatDt = (d: string) =>
  new Date(d).toLocaleString(getLocale(language), {
    day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
    timeZone: "UTC"
  });
```

2. **Edit form pre-fill**: The existing `item.departure_datetime.slice(0, 16)` already works correctly because the ISO string from Supabase is in UTC format (e.g., "2025-03-16T10:00:00+00:00" → slices to "2025-03-16T10:00"), which matches what the user originally entered. No change needed here.

3. **Save**: The current behavior (sending the raw datetime-local string) is fine because Supabase interprets it as UTC, and we now display as UTC too. Consistent round-trip.

### Summary

Single change: add `timeZone: "UTC"` to the `formatDt` function in Transport.tsx. This ensures the time displayed matches the time entered, with no timezone conversion applied.

