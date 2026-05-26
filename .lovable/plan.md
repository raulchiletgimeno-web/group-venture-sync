
# Sistema interno de alertas YORMIT

Objetivo: avisar automáticamente a **info@yormit.com** ante incidencias relevantes, con niveles, deduplicación, trazabilidad y resumen diario. Cero cambios para el usuario final.

## Alcance

Se añade **solo** infraestructura interna nueva. No se toca diseño, navegación, auth, RLS existente, edge functions de negocio, frontend ni flujos de usuario.

## 1. Tabla de incidencias (trazabilidad)

Nueva tabla `internal_alerts` (solo `service_role`, RLS denegando a `authenticated`/`anon`):

- `id`, `created_at`, `updated_at`
- `severity` — `critical` | `warning` | `info`
- `source` — módulo (`auth`, `storage`, `rls`, `edge_function`, `cron`, `email`, `security_scan`, `db`, `other`)
- `event_key` — clave estable para deduplicar (ej. `edge:check-trip-debts:500`)
- `title`, `description`, `impact`, `recommended_action`
- `metadata` jsonb (función, request id, stack, etc.)
- `occurrences` int (incrementa en duplicados dentro de ventana)
- `first_seen_at`, `last_seen_at`
- `status` — `open` | `resolved`
- `resolved_at`, `resolution_notes`
- `notified_immediately_at`, `included_in_digest_at`

Índices por `event_key`, `status`, `severity`, `created_at`.

## 2. Edge function `internal-alert` (ingesta)

Endpoint interno (`verify_jwt = false`, protegido por header `x-internal-secret` contra secreto `INTERNAL_ALERT_SECRET`).

Recibe: `{severity, source, event_key, title, description, impact?, recommended_action?, metadata?}`.

Lógica:
1. Busca incidencia abierta con mismo `event_key` en ventana de **24h**.
2. Si existe → incrementa `occurrences`, actualiza `last_seen_at`. **No reenvía email.**
3. Si no existe → inserta nueva.
4. Si `severity = critical` y `notified_immediately_at IS NULL` → encola email inmediato vía `send-transactional-email` con template `internal-alert-critical` a `info@yormit.com` y marca `notified_immediately_at`.
5. `warning` / `info` → solo se registra; irá en el resumen diario.

Esto garantiza **deduplicación, idempotencia y no-spam**.

## 3. Templates de email (registry transaccional)

Tres templates nuevos premium, sobrios, sin tocar los existentes:

- `internal-alert-critical` — alerta inmediata individual.
- `internal-alert-digest` — resumen diario agrupado por severidad/source.
- `internal-alert-resolved` — notificación de resolución.

Cada email incluye: nivel, fecha/hora, módulo, descripción, impacto, acción recomendada, nº de ocurrencias, enlace interno (opcional).

## 4. Cron de resumen diario

Edge function `internal-alert-digest` programada vía pg_cron (1 vez/día, 08:00 UTC):

- Agrupa `warning`/`info` abiertas o nuevas de las últimas 24h.
- Si hay ≥1 incidencia → envía `internal-alert-digest` a `info@yormit.com`.
- Marca `included_in_digest_at`.
- Si no hay nada → **no envía email** (anti-spam).

## 5. Notificación de resolución

Nueva función SQL `mark_alert_resolved(alert_id, notes)` (`service_role`):

- Marca `status='resolved'`, `resolved_at=now()`.
- Si era `critical` → encola email `internal-alert-resolved` con detalle (qué, cuándo apareció, cuándo se resolvió, ocurrencias).

## 6. Fuentes de señales conectadas

Para que el sistema sea útil desde el día 1, se instrumentan estos puntos de emisión (llamadas a `internal-alert` desde cada origen) **sin modificar su lógica de negocio**:

1. **Edge functions críticas** — wrapper try/catch que reporta excepciones no controladas en: `check-trip-debts`, `check-trip-pre-departure`, `check-trip-post-departure`, `process-email-queue`, `send-transactional-email`, `submit-trip-feedback`, `notify-trip`, `notify-creator-join`, `auth-email-hook`.
   - Solo se añade un `reportInternalAlert(...)` en el bloque catch. No cambia comportamiento.
2. **Email queue** — si una entrada pasa a `dlq` en `email_send_log` → trigger DB que llama vía `pg_net` al endpoint `internal-alert` con severidad `critical`.
3. **Cron jobs** — comprobación diaria que verifica que `process-email-queue` y los cron de YORMIT (`check-trip-debts`, pre/post-departure) hayan ejecutado en la ventana esperada; si no, emite `critical`.
4. **Security scan** — endpoint manual `internal-alert/sync-security` que puede llamarse para volcar nuevos findings críticos del escáner como alertas (opcional, se deja preparado).
5. **DB health** — chequeo diario simple (conteo de errores en `postgres_logs` con `error_severity >= ERROR`) → si supera umbral → `warning`.

## 7. Anti-spam — reglas duras

- Deduplicación por `event_key` en ventana 24h.
- Solo `critical` envía email inmediato; máximo **1 email por `event_key` cada 24h**.
- Resumen diario solo se manda si hay contenido.
- Resolución solo se manda para incidencias que fueron `critical`.

## 8. Configuración

- Nuevo secret `INTERNAL_ALERT_SECRET` (se pedirá al usuario al implementar).
- Email destino fijo en código: `info@yormit.com` (constante, no editable por usuario final).
- `verify_jwt = false` para `internal-alert` y `internal-alert-digest` (autenticación por secret header y por cron).

## Detalles técnicos

```text
[origen] --reportInternalAlert--> [edge: internal-alert]
                                        |
                                        v
                               [DB: internal_alerts]
                              /                    \
                  (critical, nuevo)            (warning/info)
                          |                           |
              [send-transactional-email]      [acumula en tabla]
              template: critical                       |
                                              [cron diario 08:00]
                                                       |
                                              [send-transactional-email]
                                              template: digest
```

## Qué NO se toca

- UI / diseño / navegación.
- Auth, perfiles, viajes, chat, fotos, gastos, transporte, alojamiento, agenda, i18n, PWA.
- RLS ni grants existentes.
- Edge functions existentes: solo se añade un `try/catch` + `reportInternalAlert` en el catch raíz, sin alterar lógica.
- Templates de email existentes.

## Entregable de validación al terminar

Al finalizar implementación responderé con:
1. Qué se implementó (tabla, edge functions, templates, cron, instrumentación).
2. Qué dispara email inmediato.
3. Qué entra en resumen diario.
4. Cómo se evita spam/duplicados.
5. Confirmación de email a `info@yormit.com`.
6. Confirmación de que no se tocó nada más de la app.
