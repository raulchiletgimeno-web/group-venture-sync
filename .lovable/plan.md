

## Email automático "48 horas antes del viaje"

### Resumen
Nuevo email transaccional personalizado que se envía **una sola vez por usuario y por viaje**, exactamente cuando faltan ~48 horas para el inicio. Incluye datos del viaje, checklist de preparación y previsión del tiempo en destino.

### Componentes a crear

**1. Tabla `trip_pre_departure_reminders` (migración)**
Idempotencia robusta — clave única `(trip_id, user_id)` que impide duplicados.

```text
id uuid PK
trip_id uuid → trips
user_id uuid
sent_at timestamptz default now()
UNIQUE(trip_id, user_id)
```

RLS: solo service role escribe; miembros del viaje pueden leer (consistente con `debt_reminders`).

**2. Edge Function `check-trip-pre-departure`** (`verify_jwt = false`, llamada desde cron)
Lógica:
- Selecciona viajes cuyo `start_date` esté entre **36h y 60h** desde ahora (ventana amplia de 24h para tolerar fallos del cron sin perder envíos, y la tabla de idempotencia evita duplicados si se ejecuta varias veces).
- Para cada viaje, obtiene los miembros aprobados con email válido en `profiles`.
- Filtra los que ya tienen registro en `trip_pre_departure_reminders` para ese viaje.
- Para los restantes:
  - Geocodifica el destino con **Open-Meteo Geocoding API** (mismo proveedor que ya usa `Weather.tsx`, sin API key).
  - Llama a Open-Meteo Forecast para obtener `daily` (tmax, tmin, weathercode) entre `start_date` y `end_date` (máx. 16 días, suficiente para casi cualquier viaje).
  - Invoca `send-transactional-email` con template `trip-pre-departure` y `idempotencyKey = pre-departure-${trip.id}-${user.id}`.
  - Inserta en `trip_pre_departure_reminders` (UNIQUE evita carrera).
- Si la meteo falla, envía igualmente el email **sin** el bloque del tiempo (no bloquea el envío).

**3. Template React Email `trip-pre-departure.tsx`**
Estilo premium consistente con `debt-reminder.tsx` (mismo header `#0099dd`, misma tipografía, mismo footer).

Estructura visual:
```text
┌─────────────────────────────┐
│       YORMIT (header)       │
├─────────────────────────────┤
│  ¡Hola, {nombre}! 👋        │
│  En 48 horas empieza        │
│  {nombreViaje} ✈️           │
│                             │
│  ┌─ Datos del viaje ──┐     │
│  │ 📍 Destino         │     │
│  │ 📅 Inicio – Fin    │     │
│  └────────────────────┘     │
│                             │
│  📋 Checklist                │
│  ✓ Ropa y calzado…          │
│  ✓ DNI / pasaporte…         │
│  ✓ Cargador + batería…      │
│  ✓ Tarjeta sanitaria…       │
│  ✓ Tarjetas + efectivo…     │
│  ✓ Reservas / billetes…     │
│  ✓ Medicación personal…     │
│  ✓ Roaming / adaptadores…   │
│                             │
│  🌤️ El tiempo en {destino}  │
│  ┌──────────┬──────┬──────┐ │
│  │ Lun 22   │ ☀️   │28°/18°│ │
│  │ Mar 23   │ ⛅   │26°/17°│ │
│  └──────────┴──────┴──────┘ │
│  (solo si meteo disponible) │
│                             │
│  Lo importante ahora es     │
│  preparar lo necesario y    │
│  empezar a disfrutar…       │
│  Gracias por viajar         │
│  con YORMIT. Nos vemos      │
│  dentro. ✈️                 │
└─────────────────────────────┘
```

**Asunto**: rotación entre 4 variantes (mismo patrón que `debt-reminder`):
- `✈️ En 48 horas empieza tu viaje a {destino}`
- `🎒 Tu viaje está a la vuelta de la esquina, {nombre}`
- `🌍 En dos días empieza {nombreViaje}`
- `⏳ {nombreViaje} arranca en 48 horas`

`previewData` incluido para vista previa en el dashboard.

**4. Registro en `registry.ts`**
Añadir `'trip-pre-departure': tripPreDeparture`.

**5. Cron job (migración SQL con `INSERT` vía herramienta de inserts)**
Programado **cada hora** (al minuto 0) — granularidad suficiente para acertar la ventana de 48h con tolerancia. La ventana de 36-60h y la tabla de idempotencia garantizan exactamente un envío por usuario.

```sql
SELECT cron.schedule(
  'check-trip-pre-departure-hourly',
  '0 * * * *',
  $$ SELECT net.http_post(
       url := 'https://oktrzxlwaflyirjfjlad.supabase.co/functions/v1/check-trip-pre-departure',
       headers := '{"Content-Type":"application/json","Authorization":"Bearer <ANON_KEY>"}'::jsonb,
       body := '{}'::jsonb
     ); $$
);
```

**6. `supabase/config.toml`**
Añadir bloque `[functions.check-trip-pre-departure]` con `verify_jwt = false`.

### Garantías clave

| Requisito | Cómo se cumple |
|-----------|----------------|
| Solo una vez por usuario+viaje | Tabla con `UNIQUE(trip_id, user_id)` + check previo |
| ~48h antes del inicio | Ventana 36-60h sobre `start_date` + cron horario |
| Solo miembros aprobados con email | Filtro `status='approved'` + `profiles.email IS NOT NULL` |
| Idempotencia en send | `idempotencyKey` único por (trip,user) en `send-transactional-email` |
| Resistente a fallos de meteo | Try/catch — el email se envía sin tiempo si Open-Meteo falla |
| Resistente a fallos de cron | Ventana de 24h compensa una caída puntual; UNIQUE evita duplicados al recuperarse |

### Meteorología — viable
**Sí, totalmente viable** sin API keys: ya usamos Open-Meteo en `Weather.tsx`. La función llamará a:
1. `https://geocoding-api.open-meteo.com/v1/search?name={destino}&count=1` → lat/lon
2. `https://api.open-meteo.com/v1/forecast?latitude=…&longitude=…&daily=temperature_2m_max,temperature_2m_min,weathercode&start_date=…&end_date=…&timezone=auto`

Las descripciones de los `weathercode` se mapean a emojis (☀️ ⛅ 🌧️ ❄️ ⛈️ 🌫️) e idioma español dentro del template.

### Lo que NO se toca
- Cero cambios en hero, landing, dashboard, navegación, otros emails, traducciones, componentes UI, hooks, contextos, o cualquier otra Edge Function.
- Cero cambios en `Landing.tsx`, `TripDashboard.tsx`, `Weather.tsx`, etc.
- Templates `debt-reminder` y `payment-notification` intactos.

### Ficheros afectados

| Fichero | Acción |
|---------|--------|
| `supabase/migrations/<nuevo>.sql` | Crear tabla `trip_pre_departure_reminders` + RLS |
| `supabase/functions/_shared/transactional-email-templates/trip-pre-departure.tsx` | Crear template React Email |
| `supabase/functions/_shared/transactional-email-templates/registry.ts` | Registrar nuevo template |
| `supabase/functions/check-trip-pre-departure/index.ts` | Crear Edge Function |
| `supabase/config.toml` | Añadir bloque `verify_jwt = false` |
| Cron job (vía `INSERT` SQL) | Programar ejecución horaria |

### Validación posterior
Tras desplegar, podemos invocar manualmente la función con curl para forzar un ciclo y verificar logs sin esperar a la hora exacta.

