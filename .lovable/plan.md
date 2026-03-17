

## Plan: Compute trip status client-side based on dates

### Problem
The trip status badge currently uses the `status` field from the database, which may not be updated when a trip's end date passes. Users see stale statuses instead of "Finalizado" for past trips.

### Solution
In `src/pages/Dashboard.tsx`, compute the display status client-side by comparing `end_date` and `start_date` against today's date, overriding the database `status` field.

### Change: `src/pages/Dashboard.tsx` (~line 79-85)

Replace the line that reads `status: trip.status as Trip["status"]` with logic:

```typescript
const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

// Inside the map:
const computedStatus: Trip["status"] = 
  trip.end_date < today ? "finished" :
  trip.start_date <= today ? "active" : 
  "upcoming";

// Use computedStatus instead of trip.status
```

This ensures:
- **end_date < today** → "Finalizado"
- **start_date <= today <= end_date** → "Activo" 
- **start_date > today** → "Próximo"

Single file change, no database migration needed.

