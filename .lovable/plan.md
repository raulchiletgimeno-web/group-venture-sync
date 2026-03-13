

## Plan: Diseño Premium de Notificaciones + Indicadores por Sección

### Parte 1: Badge premium en TripCard

Refinar el badge actual en `TripCard.tsx`:
- Cambiar de `bg-destructive` a un gradiente sutil rojo-coral con sombra glow
- Añadir `shadow-[0_2px_8px_rgba(239,68,68,0.4)]` para efecto glow premium
- Tamaño ligeramente mayor: `min-w-[22px] h-[22px]`
- Tipografía: `text-[11px] font-bold tracking-tight`
- Posición: mantener `-top-2 -right-2` pero con `ring-2 ring-card` para separar visualmente del borde de la tarjeta

### Parte 2: Contadores por sección en TripDashboard

Necesita una nueva función SQL que devuelva conteos desglosados por sección y viaje, para mostrar indicadores en cada botón de sección dentro del dashboard del viaje.

**Migración SQL**: Nueva función `get_unseen_section_counts(p_user_id, p_trip_id)` que devuelve `(section text, unseen_count bigint)` para un viaje específico.

**Nuevo hook**: `useUnseenSectionCounts(tripId)` que llama a la función SQL y devuelve `Record<section, count>`.

**UI en TripDashboard** (grid de secciones, líneas 439-451):
- Si una sección tiene novedades > 0, mostrar un pequeño punto indicator (`w-2 h-2 rounded-full bg-primary`) junto al nombre de la sección
- Si el count es > 0, mostrar el número en un mini-badge discreto al lado derecho del botón
- Mapeo de secciones: `transport` → `transport`, `accommodation` → `accommodation`, `expenses` → `expenses`, `photos` → `photos`, `chat` → `chat`, `schedule` → `schedule`
- Las secciones `weather` y `phones` no tienen tracking (no generan contenido dinámico)

### Archivos a crear/modificar

| Archivo | Cambio |
|---|---|
| Migración SQL | Nueva función `get_unseen_section_counts` |
| `src/hooks/use-unseen-section-counts.ts` | Nuevo hook para conteos por sección |
| `src/components/TripCard.tsx` | Badge premium con glow y ring |
| `src/pages/TripDashboard.tsx` | Indicadores por sección en el grid |

