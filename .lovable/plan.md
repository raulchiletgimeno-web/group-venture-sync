

## Plan: Lógica de notificaciones robusta y profesional

### Problemas detectados

1. **`useUnseenSectionCounts`** solo consulta una vez al montar. Sin polling ni realtime. Cuando el usuario vuelve de una sección al TripDashboard, los badges no se actualizan.

2. **`useMarkSectionSeen`** no notifica a ningún otro hook que se ha marcado como visto. Los contadores quedan desactualizados hasta recargar.

3. **`useUnseenCounts`** (trip-level) no se refresca cuando el usuario marca una sección como vista. El badge en TripCard persiste tras visitar todas las secciones.

4. No hay realtime en `useUnseenSectionCounts`, así que si otro miembro añade contenido mientras estás en el TripDashboard, no lo ves.

### Solución

#### 1. Refactorizar `useUnseenSectionCounts` con polling + realtime

- Añadir polling cada 30s (igual que `useUnseenCounts`)
- Suscribirse a INSERT en las 6 tablas de contenido filtrando por `trip_id`
- Exponer un método `refetch` para que otros hooks puedan forzar la recarga
- Re-fetch al cambiar `tripId` (ya lo hace) y al volver al componente

#### 2. Refactorizar `useMarkSectionSeen` para invalidar caches

- Tras el upsert exitoso, emitir un evento custom `section-seen` via `window.dispatchEvent`
- `useUnseenSectionCounts` y `useUnseenCounts` escucharán este evento para refetch inmediato
- Esto garantiza que al salir de Chat y volver al TripDashboard, el badge de chat desaparece

#### 3. Mejorar `useUnseenCounts` para escuchar `section-seen`

- Añadir listener del evento `section-seen` para refetch inmediato
- Así el badge en TripCard del Dashboard principal también se actualiza

#### 4. Marcar como visto también al desmontar (no solo al montar)

- En `useMarkSectionSeen`, marcar también en el cleanup del `useEffect` (al salir de la sección)
- Esto cubre el caso donde el usuario está leyendo contenido nuevo que llega mientras está en la sección

### Archivos a modificar

| Archivo | Cambio |
|---|---|
| `src/hooks/use-unseen-section-counts.ts` | Polling 30s + realtime + listener de `section-seen` |
| `src/hooks/use-mark-section-seen.ts` | Emitir evento `section-seen` tras upsert + mark on unmount |
| `src/hooks/use-unseen-counts.ts` | Listener de `section-seen` para refetch |

