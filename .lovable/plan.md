# Eliminar el overload antiguo de save_trip_expense

## Estado actual (verificado en pg_proc)

Existen dos versiones de `public.save_trip_expense`:

- **Antigua (a eliminar)**: `save_trip_expense(uuid, text, numeric, uuid, uuid[], uuid, text, uuid)` — 8 parámetros, sin `p_clear_receipt`.
- **Nueva (se conserva)**: `save_trip_expense(uuid, text, numeric, uuid, uuid[], uuid, text, uuid, boolean)` — 9 parámetros, con `p_clear_receipt boolean default false`, idempotencia por `p_request_id`, mínimo 1 participante y transacción atómica.

PostgREST no puede decidir entre ambas y rechaza la llamada.

## Cambio único (migración)

```sql
DROP FUNCTION public.save_trip_expense(uuid, text, numeric, uuid, uuid[], uuid, text, uuid);
```

- Se elimina **solo** la versión de 8 parámetros.
- La versión de 9 parámetros queda intacta, con todos sus parámetros opcionales al final (`p_expense_id`, `p_receipt_path`, `p_request_id`, `p_clear_receipt`), por lo que sigue siendo compatible con todas las llamadas existentes del frontend.
- Tras la migración se verificará que `pg_proc` muestra una única versión activa.
- Los grants a `authenticated` se conservan (la versión que permanece ya los tiene; se re-verificará y, solo si faltara, se re-aplicará el GRANT, sin cambios de código).

## No se toca

Ninguna lógica de gastos, saldos, participantes, tickets, idempotencia, RLS, cierre/reapertura ni ninguna otra parte de la aplicación. No hay cambios de frontend.

## Validación

1. Consulta a `pg_proc`: una sola fila para `save_trip_expense`.
2. Crear gasto con participantes → funciona, sin error de función ambigua.
3. Crear gasto con ticket → funciona.
4. Editar gasto, añadir ticket después, quitar ticket → funcionan.
5. Doble clic → un solo gasto (idempotencia intacta).
6. Gasto sin participantes → rechazado.
