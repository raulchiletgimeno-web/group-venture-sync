## Auditoría: funciones SECURITY DEFINER en `public`

Hay 10 funciones `SECURITY DEFINER` en el esquema `public`. Estos son sus permisos `EXECUTE` actuales y el problema concreto:

| Función | EXECUTE actual | ¿Quién la necesita? | Acción |
|---|---|---|---|
| `delete_email(text, bigint)` | anon, authenticated, service_role | solo edge functions (service_role) | **Revocar** de PUBLIC, anon, authenticated |
| `enqueue_email(text, jsonb)` | anon, authenticated, service_role | solo edge functions (service_role) | **Revocar** de PUBLIC, anon, authenticated |
| `read_email_batch(text, int, int)` | anon, authenticated, service_role | solo edge functions (service_role) | **Revocar** de PUBLIC, anon, authenticated |
| `move_to_dlq(text, text, bigint, jsonb)` | anon, authenticated, service_role | solo edge functions (service_role) | **Revocar** de PUBLIC, anon, authenticated |
| `handle_new_user()` | PUBLIC, anon, authenticated, service_role | solo el trigger sobre `auth.users` (corre como owner) | **Revocar** de PUBLIC, anon, authenticated, service_role |
| `is_trip_member(uuid)` | PUBLIC, anon, authenticated, service_role | RLS de tablas autenticadas y app cliente | **Revocar** de PUBLIC y anon. Mantener authenticated + service_role |
| `is_trip_creator(uuid)` | PUBLIC, anon, authenticated, service_role | RLS de tablas autenticadas | **Revocar** de PUBLIC y anon. Mantener authenticated + service_role |
| `get_unseen_counts(uuid)` | PUBLIC, anon, authenticated, service_role | hook `use-unseen-counts` (usuario autenticado) | **Revocar** de PUBLIC y anon. Mantener authenticated + service_role |
| `get_unseen_section_counts(uuid, uuid)` | PUBLIC, anon, authenticated, service_role | hook `use-unseen-section-counts` | **Revocar** de PUBLIC y anon. Mantener authenticated + service_role |
| `find_trip_id_by_invite_code(text)` | authenticated, service_role | `JoinTrip` (usuario autenticado) | Ya está OK (sin PUBLIC, sin anon). No tocar. |

### Por qué hay que revocar de PUBLIC y anon

- Las funciones de la **cola de emails** (`delete_email`, `enqueue_email`, `read_email_batch`, `move_to_dlq`) escriben en `pgmq` y deben ser invocadas únicamente desde los workers que corren con `service_role` (`process-email-queue`, `handle-email-suppression`). Cualquier cliente autenticado actualmente podría encolar emails arbitrarios o leer/borrar mensajes de la cola.
- `handle_new_user` es un **trigger function** sobre `auth.users`. Postgres ejecuta el trigger con privilegios del owner y no requiere `EXECUTE` para los roles del API. Mantenerlo público es ruido innecesario.
- `is_trip_member`, `is_trip_creator`, `get_unseen_counts`, `get_unseen_section_counts` no tienen sentido para `anon` (no hay `auth.uid()`) ni para el rol `PUBLIC`. Las RLS y las llamadas legítimas siempre vienen de `authenticated`.

## Migración SQL

```sql
-- 1) Cola de emails: solo service_role
REVOKE EXECUTE ON FUNCTION public.delete_email(text, bigint)            FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.enqueue_email(text, jsonb)            FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.read_email_batch(text, integer, integer) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) FROM PUBLIC, anon, authenticated;

-- 2) Trigger function: nadie a través del API
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated, service_role;

-- 3) Helpers de membresía + contadores: solo authenticated y service_role
REVOKE EXECUTE ON FUNCTION public.is_trip_member(uuid)              FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_trip_creator(uuid)             FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_unseen_counts(uuid)           FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_unseen_section_counts(uuid, uuid) FROM PUBLIC, anon;
```

No se altera ninguna policy, schema, columna, edge function, ni nada del frontend. Solo se reducen permisos `EXECUTE`.

## Validación técnica

Tras aplicar la migración, comprobaré con `pg_proc.proacl`:

- `delete_email`, `enqueue_email`, `read_email_batch`, `move_to_dlq` → solo `service_role=X` (y owner).
- `handle_new_user` → solo `postgres=X` (el trigger sigue funcionando porque corre como owner).
- `is_trip_member`, `is_trip_creator`, `get_unseen_counts`, `get_unseen_section_counts` → solo `authenticated=X`, `service_role=X`.
- `find_trip_id_by_invite_code` → sin cambios.

Funcionalidad verificada conceptualmente:
- Las RLS que llaman a `is_trip_member` / `is_trip_creator` siguen funcionando (las invoca el rol `authenticated`, que mantiene `EXECUTE`).
- Los hooks de contadores siguen funcionando (rol `authenticated`).
- Los workers de emails siguen funcionando (rol `service_role`).
- El trigger `on_auth_user_created` sigue creando perfiles (corre como owner del trigger).
- `JoinTrip` por código sigue funcionando (`find_trip_id_by_invite_code` no se toca).

Marcaré los findings `SUPA_anon_security_definer_function_executable` y `SUPA_authenticated_security_definer_function_executable` como resueltos.

## Lo que NO se toca

Diseño, navegación, emails automáticos, chat, fotos, gastos, transporte, alojamiento, schedule, auth flows, i18n, otras policies, RLS, esquemas, frontend, edge functions.