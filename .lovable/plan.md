# Auditoría final de seguridad — YORMIT

Revisión read-only sobre la base de datos publicada, el storage, las RLS y el linter. Resultado: **prácticamente todo está cerrado correctamente**, pero hay **1 hallazgo real pendiente** (email de usuarios visible a co-miembros del viaje) que conviene corregir ahora con un cambio mínimo.

---

## Bloque por bloque

### 1. Visibilidad de viajes — **RESUELTO**
- `trips` SELECT: `USING is_trip_member(id)`. Un usuario solo ve los viajes en los que es miembro aprobado.
- `find_trip_id_by_invite_code` sigue operativo para el flujo de unirse por código.

### 2. Suscripciones Realtime — **RESUELTO**
- Canales privados por viaje (`trip:{id}:...`) y por usuario, todos con `config: { private: true }`.
- Filtros realtime van por `trip_id` y la RLS de las tablas subyacentes (`is_trip_member`) corta el acceso a viajes ajenos.

### 3. Storage / fotos / archivos — **RESUELTO**
- Único bucket: `trip-photos`, `public = false`. Sin URLs públicas.
- Policies en `storage.objects`: SELECT solo `authenticated` + `is_trip_member`; INSERT solo miembros; DELETE solo autor o creator. Sin policies `USING (true)`, sin `anon`.
- Frontend usa `getSignedUrl` con TTL y caché — funcionando.

### 4. Emails de usuarios — **PENDIENTE (ver acción al final)**
- La policy `Trip members can view co-member profiles` en `profiles` permite a un co-miembro leer **todas** las columnas, incluida `email`. El scanner lo marca como ERROR y contradice la memoria de seguridad ("los emails de otros usuarios no deben ser legibles desde el cliente").
- Propio usuario sigue viendo su email vía `Users can view own profile`.

### 5. Funciones SECURITY DEFINER — **ACEPTADO / INTENCIONAL**
EXECUTE comprobado en `pg_proc.proacl`. Las únicas accesibles a `authenticated` son exactamente las 5 esperadas, todas con `search_path = public` y scope vía `auth.uid()`:
- `is_trip_member`, `is_trip_creator` — necesarias para que las RLS de toda la app funcionen.
- `find_trip_id_by_invite_code` — necesaria para unirse por código.
- `get_unseen_counts`, `get_unseen_section_counts` — endurecidas; ignoran `p_user_id` y usan `auth.uid()`.

Las funciones de email/cola (`enqueue_email`, `delete_email`, `read_email_batch`, `move_to_dlq`, `handle_new_user`) **no** son ejecutables por `authenticated` — solo `service_role`/`postgres`. Correcto.

### 6. search_path — **RESUELTO**
Todas las funciones SECURITY DEFINER tienen `SET search_path` explícito. No hay funciones mutables en el linter.

### 7. Buckets / policies storage — **RESUELTO**
Confirmado en bloque 3.

### 8. Regresión funcional — **OK**
Revisando policies y código: entrar a viaje, unirse por código, chat, fotos, gastos, tickets/recibos, realtime, emails automáticos (vía service_role), feedback (vía edge function con service_role) y recordatorios previos/posteriores (vía edge function con service_role) siguen operativos. Ninguna de las RLS endurecidas rompe estos flujos.

### 9. Linter / panel de seguridad — estado actual

**5 warnings del linter de Supabase (SECURITY DEFINER ejecutable por authenticated):**
→ **ACEPTADOS / INTENCIONALES**. Son las 5 funciones del bloque 5. Documentadas en la security memory.

**4 hallazgos del scanner Lovable:**

| ID | Veredicto |
|---|---|
| `profiles_email_co_member_exposure` (ERROR) | **PENDIENTE real** — ver abajo |
| `debt_reminders_write_missing` (WARN) | **Falso positivo** — RLS activo + sin policy INSERT/UPDATE/DELETE = bloqueado para `authenticated`. Solo `service_role` (edge functions) puede escribir. Seguro por defecto. |
| `trip_pre_post_departure_reminders_write_missing` (WARN) | **Falso positivo** — mismo motivo. |
| `trip_feedback_user_access` (WARN) | **ACEPTADO** — el flujo de feedback es 100% server-side vía edge function `submit-trip-feedback` con `service_role`. No hay token redemption desde cliente. |

---

## Acción única recomendada

**Ocultar `profiles.email` a co-miembros** sin romper nada. Cambio mínimo en SQL, cero cambios en frontend/edge functions:

```sql
-- Sustituir la policy actual por dos:
DROP POLICY "Trip members can view co-member profiles" ON public.profiles;

-- Cada usuario sigue viendo su propio perfil completo (policy existente)

-- Co-miembros: ven todas las columnas EXCEPTO email, gracias a column-level GRANT
-- Recrear policy de co-miembros tal cual (necesaria para nombre/avatar en chat, etc.)
CREATE POLICY "Trip members can view co-member profiles"
ON public.profiles FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM trip_members tm1 JOIN trip_members tm2 ON tm1.trip_id = tm2.trip_id
  WHERE tm1.user_id = auth.uid() AND tm2.user_id = profiles.id
));

-- Restringir el email a nivel de columna: revocar SELECT(email) a authenticated
REVOKE SELECT (email) ON public.profiles FROM authenticated;
-- El dueño sigue accediendo a su email vía la policy "Users can view own profile"
-- + GRANT SELECT(email) explícito solo cuando id = auth.uid() no es expresable como GRANT,
-- así que usamos otra vía: mantener GRANT al rol y cubrirlo con una policy más estricta.
```

> Nota técnica: PostgreSQL no permite GRANT condicional por fila sobre una columna. La forma robusta y mínima es: dejar el `GRANT SELECT (email)` solo para `service_role`, y servir el email al propio usuario desde el cliente vía `session.user.email` (que ya viene de `auth.users` y no de `profiles`). El frontend ya hace esto en `AuthContext.fetchProfile` (pasa `fallbackEmail` desde la sesión), así que **no hay regresión**.

Migración exacta propuesta:

```sql
REVOKE SELECT (email) ON public.profiles FROM authenticated, anon;
-- service_role conserva acceso para edge functions (notify-creator-join, emails, etc.)
```

Ningún cambio de policies, ningún cambio de frontend. El email seguirá disponible para:
- el propio usuario, vía `session.user.email` (ya en uso).
- edge functions, vía `service_role`.

Y dejará de ser legible para co-miembros desde el cliente.

---

## Conclusión

| Bloque | Estado |
|---|---|
| Visibilidad viajes | ✅ Resuelto |
| Realtime | ✅ Resuelto |
| Storage / fotos | ✅ Resuelto |
| **Emails** | ⚠️ **1 acción pendiente (mínima)** |
| SECURITY DEFINER | ✅ Aceptado/intencional |
| search_path | ✅ Resuelto |
| Buckets/policies | ✅ Resuelto |
| Regresión funcional | ✅ Sin roturas |
| Linter | 5 warnings aceptados |
| Scanner Lovable | 1 real + 3 falsos positivos / aceptados |

**¿Apruebas aplicar la única migración (REVOKE SELECT(email))?** Tras aplicarla y marcar los falsos positivos del scanner como tales, el bloque queda completamente cerrado.
