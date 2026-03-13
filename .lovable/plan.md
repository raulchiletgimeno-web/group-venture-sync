

## Plan: Sistema de Notificaciones No Vistas

### Arquitectura

El sistema se basa en una tabla `trip_last_seen` que almacena cuándo cada usuario visitó por última vez cada viaje. Al comparar ese timestamp con los `created_at` más recientes de las tablas de contenido, se calcula cuántas novedades hay sin leer.

### 1. Nueva tabla en base de datos

```sql
CREATE TABLE public.trip_last_seen (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (trip_id, user_id)
);

ALTER TABLE public.trip_last_seen ENABLE ROW LEVEL SECURITY;

-- Users can read/upsert their own rows
CREATE POLICY "Users can view own last_seen" ON public.trip_last_seen
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Users can upsert own last_seen" ON public.trip_last_seen
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own last_seen" ON public.trip_last_seen
  FOR UPDATE TO authenticated USING (user_id = auth.uid());
```

### 2. Función SQL para contar novedades

Una función `get_unseen_counts(p_user_id uuid)` que devuelve `trip_id, unseen_count` para cada viaje activo del usuario. Cuenta filas con `created_at > last_seen_at` en las tablas: `trip_messages`, `trip_photos`, `trip_expenses`, `trip_accommodation`, `trip_transport`, `trip_schedule`.

### 3. Hook `useUnseenCounts`

Nuevo hook `src/hooks/use-unseen-counts.ts`:
- Llama a la función SQL al montar y periódicamente (cada 30s)
- Suscribe a cambios realtime en las tablas relevantes para refrescar
- Devuelve `Map<tripId, count>` y `totalUnseen`
- Actualiza el badge del icono PWA vía `navigator.setAppBadge(total)` cuando está disponible

### 4. Marcar como visto

Al entrar en un viaje (`TripDashboard` monta), se hace upsert en `trip_last_seen` con `now()`:
```ts
await supabase.from("trip_last_seen")
  .upsert({ trip_id: tripId, user_id: user.id, last_seen_at: new Date().toISOString() });
```

### 5. Badge en TripCard

Nuevo prop `unseenCount` en `TripCard`. Si > 0, mostrar un badge circular pequeño con el número, posicionado en la esquina superior derecha de la tarjeta:
- Fondo `bg-red-500`, texto blanco, `min-w-5 h-5`, `text-xs font-bold`, `rounded-full`
- Estilo premium: sombra sutil, sin animaciones excesivas

### 6. Dashboard: integrar contadores

En `Dashboard.tsx`, usar `useUnseenCounts` y pasar el count a cada `TripCard`.

### 7. Badge en icono PWA

Dentro de `useUnseenCounts`, cuando cambia `totalUnseen`:
```ts
if ("setAppBadge" in navigator) {
  if (total > 0) navigator.setAppBadge(total);
  else navigator.clearAppBadge();
}
```

### Archivos a crear/modificar

| Archivo | Cambio |
|---|---|
| Migración SQL | Nueva tabla `trip_last_seen` + función `get_unseen_counts` |
| `src/hooks/use-unseen-counts.ts` | Nuevo hook |
| `src/components/TripCard.tsx` | Prop `unseenCount`, renderizar badge |
| `src/pages/Dashboard.tsx` | Integrar hook, pasar counts a cards |
| `src/pages/TripDashboard.tsx` | Upsert `last_seen_at` al montar |

