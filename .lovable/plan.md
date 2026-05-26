## Dónde se está exponiendo el email

El scanner marca correctamente este problema. Tras auditar el código y las policies, los emails se filtran en estos puntos:

1. **Base de datos — policy `Trip members can view co-member profiles` en `profiles`**
   La policy permite `SELECT *`, que incluye la columna `email`. Cualquier miembro aprobado de un viaje puede leer el email de cualquier co‑miembro vía la Data API. Este es el agujero real.

2. **Frontend — lecturas innecesarias de `email`** (puramente decorativas o evitables):
   - `src/components/MemberApprovalManager.tsx` → `select("id, name, email")` y pinta el email debajo del nombre del solicitante pendiente.
   - `src/components/TicketManager.tsx` → `select("user_id, profiles(name, email)")`, usa el email como fallback del nombre.
   - `src/components/ActivityTicketManager.tsx` → idéntico al anterior.
   - `src/pages/trips/Expenses.tsx` (línea 465) → lee `profiles.email` del acreedor en cliente para invocar `send-transactional-email` al confirmar un pago de deuda.
   - `src/contexts/AuthContext.tsx` → lee el email del propio usuario desde `profiles` (uso legítimo, pero puede obtenerse de `auth.user.email` y dejar de depender de la columna).

Los demás usos del literal "email" en el código son textos i18n, formularios de login/registro o tipos generados — no exponen datos de otros usuarios.

## Solución

Cierre **a nivel de datos** (no solo UI) revocando la visibilidad de la columna `email` para usuarios autenticados, y limpieza de los selects del frontend para que nadie pida la columna.

### 1. Migración SQL (capa de datos — la definitiva)

PostgREST respeta los `GRANT` a nivel de columna sobre `public.profiles`. La idea es: la fila sigue siendo legible (por las policies actuales), pero la columna `email` deja de ser seleccionable por el rol `authenticated`. El `service_role` (edge functions internas) mantiene acceso completo.

```sql
-- 1. Revocar SELECT amplio sobre profiles para authenticated
REVOKE SELECT ON public.profiles FROM authenticated;

-- 2. Conceder SELECT solo sobre columnas no sensibles
GRANT SELECT (id, name, avatar_url, language, created_at)
  ON public.profiles TO authenticated;

-- 3. Mantener INSERT/UPDATE como antes (las RLS siguen restringiendo a auth.uid())
GRANT INSERT, UPDATE ON public.profiles TO authenticated;

-- service_role ya tiene GRANT ALL — sin cambios
-- Las policies actuales se mantienen intactas
```

Efecto: cualquier `select("email")` desde cliente autenticado devolverá error de permiso, incluso para el propio usuario. Por eso el frontend deja de pedir esa columna y obtiene el email propio de `auth.user.email` (que sigue disponible vía sesión Supabase Auth).

### 2. Cambios frontend (mínimos, sin tocar diseño ni flujos)

| Archivo | Cambio |
|---|---|
| `src/contexts/AuthContext.tsx` | Quitar `email` del `select`. Rellenar `profile.email` desde `session.user.email` para mantener el tipo y el contrato existente. |
| `src/components/MemberApprovalManager.tsx` | `select("id, name")`. Quitar la línea decorativa `{member.email}` del bloque pendiente. Mantener el `formatDisplayName(member.name, t.usuario)` como fallback. |
| `src/components/TicketManager.tsx` | `select("user_id, profiles(name)")`. Sustituir los dos fallbacks `m.profiles?.email \|\| userId.slice(0,8)` por `userId.slice(0,8)` (comportamiento idéntico cuando no hay nombre — el email casi nunca se mostraba realmente). Ajustar el tipo `Member`. |
| `src/components/ActivityTicketManager.tsx` | Igual que TicketManager. |
| `src/pages/trips/Expenses.tsx` | Eliminar el `select("email")` del acreedor. En su lugar, pasar `recipientUserId: debt.to` a `send-transactional-email` y resolver el email en servidor. |

### 3. Edge function `send-transactional-email`

Añadir soporte opcional para `recipientUserId`: si llega, la función (que ya corre con `service_role`) hace `supabase.auth.admin.getUserById(recipientUserId)` y usa ese email como `effectiveRecipient`. Si llega `recipientEmail` directamente, se mantiene el comportamiento actual (lo usan los workers internos como `check-trip-debts`, `notify-trip`, etc., que ya operan en servidor con datos legítimos). Cambio aditivo, no rompe nada.

### 4. Validación técnica

- Como **usuario A autenticado** ejecutar en consola del navegador:
  `await supabase.from('profiles').select('email').eq('id', '<id_usuario_B>')`
  → debe devolver error `permission denied for column email`.
- `await supabase.from('profiles').select('id,name,avatar_url').eq('id', '<id_usuario_B>')` → sigue funcionando para co‑miembros (UI de miembros, expenses, fotos, chat).
- `supabase.auth.getUser()` sigue devolviendo el email propio (lo usa `AuthContext` ahora).
- Probar flujo de aprobación de miembros pendientes (sigue mostrando nombre), tickets de transporte/actividad (sigue mostrando nombre), confirmación de pago de deuda (sigue enviando email de notificación porque ahora se resuelve server‑side).
- Re‑ejecutar el security scan: la advertencia `profiles_email_co_member_exposure` debe desaparecer.

### Lo que NO se toca

Diseño, navegación, emails automáticos, chat, fotos, gastos (lógica), transporte, alojamiento, schedule, auth flows, i18n, otras policies, otros findings (function search_path, security definer executable, public bucket listing — quedan fuera de esta incidencia).