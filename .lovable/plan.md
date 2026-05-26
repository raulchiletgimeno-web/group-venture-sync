## Funciones afectadas

Auditando las funciones del esquema `public`, hay **5 funciones sin `SET search_path` explícito**, que son las que disparan la advertencia "Function Search Path Mutable":

1. `public.delete_email(text, bigint)` — SECURITY DEFINER, sin search_path
2. `public.enqueue_email(text, jsonb)` — SECURITY DEFINER, sin search_path
3. `public.read_email_batch(text, integer, integer)` — SECURITY DEFINER, sin search_path
4. `public.move_to_dlq(text, text, bigint, jsonb)` — SECURITY DEFINER, sin search_path
5. `public.validate_trip_feedback_rating()` — trigger, sin search_path

Las otras 8 funciones (`is_trip_member`, `is_trip_creator`, `get_unseen_counts`, `get_unseen_section_counts`, `find_trip_id_by_invite_code`, `handle_new_user`, `ensure_expense_has_splits`, `prevent_duplicate_debt_payment`) ya tienen `SET search_path TO 'public'` y están correctas.

## Corrección

Las 4 funciones de cola de emails usan `pgmq.send`, `pgmq.read`, `pgmq.delete`, `pgmq.create` (esquema `pgmq`). Para que sigan funcionando con un search_path fijo y seguro, hay que incluir `pgmq` además de `public`.

`validate_trip_feedback_rating` no referencia ninguna tabla, solo `NEW.*`, así que `public` basta.

Migración (usa `ALTER FUNCTION ... SET search_path = ...`, sin tocar el cuerpo ni los permisos ya endurecidos en la migración anterior):

```sql
ALTER FUNCTION public.delete_email(text, bigint)
  SET search_path = public, pgmq;
ALTER FUNCTION public.enqueue_email(text, jsonb)
  SET search_path = public, pgmq;
ALTER FUNCTION public.read_email_batch(text, integer, integer)
  SET search_path = public, pgmq;
ALTER FUNCTION public.move_to_dlq(text, text, bigint, jsonb)
  SET search_path = public, pgmq;
ALTER FUNCTION public.validate_trip_feedback_rating()
  SET search_path = public;
```

## Validación

1. Ejecuto `supabase--linter` después de la migración y confirmo que `function_search_path_mutable` desaparece.
2. Consulto `pg_proc.proconfig` para verificar que las 5 funciones tienen `search_path=...` fijo.
3. No se modifica cuerpo, firma, permisos ni lógica → cola de emails, feedback y triggers siguen funcionando igual.

## Lo que NO se toca

Diseño, navegación, emails (lógica), chat, fotos, gastos, transport, accommodation, schedule, auth, i18n, RLS, otras funciones, edge functions, frontend. Solo `ALTER FUNCTION ... SET search_path`.
