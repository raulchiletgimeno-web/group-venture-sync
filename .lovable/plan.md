## Problema

El finding `MISSING_REALTIME_AUTHORIZATION` indica que la tabla `realtime.messages` (la que Supabase Realtime usa internamente para autorizar suscripciones a canales) no tiene políticas RLS. Consecuencia: cualquier usuario autenticado puede invocar `supabase.channel('chat-<tripId>').subscribe()` con cualquier `tripId` y el broker abre el canal sin validar pertenencia al viaje.

Matiz importante: los datos reales de `postgres_changes` siguen filtrándose por la RLS de las tablas origen (`trip_messages`, `trip_expenses`, `trip_photos`, etc. ya usan `is_trip_member`), por lo que actualmente no se filtran filas a quien no es miembro. Pero el broker sí acepta la suscripción y eso es lo que el escáner marca como crítico. La solución oficial de Supabase es:

1. Activar canales "privados" en el cliente (`config: { private: true }`).
2. Nombrar los topics de forma determinista (`trip:<id>:...`, `user:<id>:...`).
3. Añadir políticas RLS en `realtime.messages` que sólo permitan SELECT cuando el topic pertenece a un viaje del que el usuario es miembro (o a su propio user_id).

## Cambios

### 1. Migración SQL (única tabla tocada: `realtime.messages`)

- `ALTER PUBLICATION supabase_realtime` ya cubre las tablas que necesitamos; no se toca.
- `ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY` (idempotente).
- Crear política `SELECT` (suscripción) y `INSERT` (broadcast/presence) para `authenticated`:

```sql
CREATE POLICY "Trip members authorize realtime topics"
ON realtime.messages
FOR SELECT TO authenticated
USING (
  CASE
    WHEN realtime.topic() LIKE 'trip:%'
      THEN public.is_trip_member( (split_part(realtime.topic(),':',2))::uuid )
    WHEN realtime.topic() LIKE 'user:%'
      THEN (split_part(realtime.topic(),':',2))::uuid = auth.uid()
    ELSE false
  END
);
-- misma lógica para INSERT (envío de broadcasts/presence)
```

Esto bloquea cualquier suscripción a un topic `trip:<otroId>:*` si el usuario no es miembro aprobado de ese viaje.

### 2. Renombrar topics y activar `private: true` en cliente (8 puntos)

Sólo se cambian los nombres de canal y se añade `{ config: { private: true } }`. No se altera lógica, UI, ni filtros de `postgres_changes`.

| Archivo | Topic actual | Topic nuevo |
|---|---|---|
| `src/hooks/use-member-status.ts` | `member-status-${tripId}` | `trip:${tripId}:members` |
| `src/hooks/use-unseen-section-counts.ts` | `unseen-section-${tripId}` | `trip:${tripId}:unseen` |
| `src/hooks/use-unseen-counts.ts` | `unseen-counts` | `user:${userId}:unseen` (requiere el `user.id` ya disponible en el hook) |
| `src/pages/Dashboard.tsx` | `pending-members-dashboard` | `user:${userId}:memberships` |
| `src/pages/TripDashboard.tsx` | `dashboard-members-${tripId}` | `trip:${tripId}:members` |
| `src/pages/trips/Chat.tsx` (mensajes) | `chat-${tripId}` | `trip:${tripId}:chat` |
| `src/pages/trips/Chat.tsx` (votos poll) | `poll-votes-${poll.id}` | `trip:${tripId}:poll:${poll.id}` (pasar `tripId` al PollComponent que ya está en scope) |
| `src/components/MemberApprovalManager.tsx` | `pending-members-${tripId}` | `trip:${tripId}:members` |

Notas:
- Para los dos canales "globales" (`unseen-counts`, `pending-members-dashboard`), pasamos al patrón `user:${userId}:...`. El postgres_changes filter sigue siendo el mismo, sólo cambiamos el nombre del topic para que la política RLS pueda autorizarlo.
- No se añaden, eliminan ni reordenan listeners; sólo se renombra el `.channel(...)` y se le añade el segundo argumento `{ config: { private: true } }`.

### 3. Nada más se toca

No se modifica: diseño, navegación, emails, chat (lógica), fotos, gastos, transporte, alojamiento, schedule, auth, otras políticas, edge functions, i18n, ni el resto de findings del escáner.

## Validación

1. **Usuario A intenta suscribirse a viaje ajeno**: `supabase.channel('trip:<otroId>:chat', { config:{ private:true }}).subscribe()` → estado `CHANNEL_ERROR` / no recibe eventos (RLS de `realtime.messages` lo bloquea).
2. **Miembro aprobado**: recibe inserts en chat, expenses, photos, members, polls, igual que antes.
3. **Smoke test en preview**: abrir chat de un viaje, enviar mensaje, comprobar que llega en tiempo real; abrir dashboard, aprobar un pending member y comprobar que la lista se actualiza.
4. Re-ejecutar el escáner de seguridad: el finding `MISSING_REALTIME_AUTHORIZATION` debe desaparecer.

## Resumen

- 1 migración SQL en `realtime.messages` (políticas RLS por topic).
- 8 ficheros front modificados sólo en la línea `.channel(...)` para usar topic determinista + `private: true`.
- Cero cambios funcionales, visuales o de negocio.