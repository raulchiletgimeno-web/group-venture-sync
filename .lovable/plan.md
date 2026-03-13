

## Plan: Notificaciones por sección (no por viaje global)

### Problema actual
Al entrar al TripDashboard se hace upsert en `trip_last_seen` marcando TODO el viaje como visto. El usuario puede no haber revisado cada sección.

### Solución

#### 1. Cambiar la tabla `trip_last_seen` para incluir sección

Migración SQL:
- Eliminar la constraint unique actual `(trip_id, user_id)`
- Añadir columna `section text NOT NULL DEFAULT 'dashboard'`
- Nueva constraint unique `(trip_id, user_id, section)`
- Actualizar las RLS policies existentes (no cambian, siguen filtrando por `user_id = auth.uid()`)

Secciones válidas: `chat`, `photos`, `expenses`, `accommodation`, `transport`, `schedule`

#### 2. Actualizar la función SQL `get_unseen_counts`

Reescribirla para que compare cada tabla contra su `last_seen_at` de sección específica:
- `trip_messages` → sección `chat`
- `trip_photos` → sección `photos`
- `trip_expenses` → sección `expenses`
- `trip_accommodation` → sección `accommodation`
- `trip_transport` → sección `transport`
- `trip_schedule` → sección `schedule`

Suma los 6 parciales por viaje para devolver el total por trip.

#### 3. Marcar como visto por sección (en cada página de sección)

Añadir un hook reutilizable `useMarkSectionSeen(tripId, section)` que al montar haga:
```ts
supabase.from("trip_last_seen").upsert(
  { trip_id, user_id, section, last_seen_at: now() },
  { onConflict: "trip_id,user_id,section" }
)
```

Integrarlo en:
- `Chat.tsx` → sección `chat`
- `Photos.tsx` → sección `photos`
- `Expenses.tsx` → sección `expenses`
- `Accommodation.tsx` → sección `accommodation`
- `Transport.tsx` → sección `transport`
- `Schedule.tsx` → sección `schedule`

#### 4. Eliminar el mark-seen global del TripDashboard

Quitar el `useEffect` que hace upsert en `trip_last_seen` al entrar al TripDashboard (líneas 84-94). Ya no se marca todo como visto al abrir el viaje.

#### 5. Hook `useUnseenCounts` — sin cambios funcionales

La interfaz del hook no cambia porque la función SQL sigue devolviendo `(trip_id, unseen_count)`. El TripCard y Dashboard siguen funcionando igual.

### Archivos a modificar

| Archivo | Cambio |
|---|---|
| Migración SQL | Añadir columna `section`, nueva unique constraint, reescribir `get_unseen_counts` |
| `src/hooks/use-mark-section-seen.ts` | Nuevo hook reutilizable |
| `src/pages/TripDashboard.tsx` | Eliminar upsert global de `trip_last_seen` |
| `src/pages/trips/Chat.tsx` | Añadir `useMarkSectionSeen(tripId, "chat")` |
| `src/pages/trips/Photos.tsx` | Añadir `useMarkSectionSeen(tripId, "photos")` |
| `src/pages/trips/Expenses.tsx` | Añadir `useMarkSectionSeen(tripId, "expenses")` |
| `src/pages/trips/Accommodation.tsx` | Añadir `useMarkSectionSeen(tripId, "accommodation")` |
| `src/pages/trips/Transport.tsx` | Añadir `useMarkSectionSeen(tripId, "transport")` |
| `src/pages/trips/Schedule.tsx` | Añadir `useMarkSectionSeen(tripId, "schedule")` |

