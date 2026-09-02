# Evitar gastos duplicados al guardar

## Causa probable

Al pulsar Guardar, el formulario no bloquea el botón: `handleSubmit` en `src/pages/trips/Expenses.tsx` no tiene estado de envío y el botón (línea 741) no está deshabilitado. Dos pulsaciones rápidas lanzan dos llamadas a `save_trip_expense`, y en creación cada llamada inserta un gasto nuevo: para el backend son dos intentos legítimos e indistinguibles.

## Cambios

### 1. Bloqueo en frontend (`src/pages/trips/Expenses.tsx`)

- Nuevo estado `submittingExpense`.
- Al entrar en `handleSubmit`: si ya está en curso, salir inmediatamente; si no, activarlo (con un guard también por ref, para cubrir dobles clics en el mismo tick antes del re-render).
- Botón Guardar/Actualizar: `disabled` + `aria-busy` + spinner y texto "Guardando…" (clave `saving`, ya existente en los 7 idiomas).
- Mientras se guarda, el diálogo no se puede cerrar y los campos quedan deshabilitados.
- Éxito: cerrar diálogo, refrescar lista, toast actual. Error: reactivar el botón, mantener el formulario abierto y mostrar el error (comportamiento actual conservado).

### 2. Idempotencia en backend (migración)

- Añadir a `trip_expenses` una columna `request_id uuid` y un índice único parcial `where request_id is not null`.
- Ampliar `save_trip_expense` con un parámetro nuevo `p_request_id uuid default null` (parámetro opcional al final: no rompe llamadas existentes):
  - Creación: si llega `p_request_id`, primero se comprueba si ya existe un gasto con ese `request_id` en ese viaje; si existe se devuelve su id sin crear nada ni tocar splits.
  - Si dos peticiones simultáneas pasan a la vez esa comprobación, el índice único hace fallar la segunda; se captura `unique_violation` y se devuelve el id de la fila ya creada. Resultado: un único gasto, misma respuesta en ambas llamadas.
  - Edición: sin cambios de comportamiento (una actualización idempotente por naturaleza), protegida además por el bloqueo del botón.
- El frontend genera un `crypto.randomUUID()` por intento de guardado y lo reutiliza mientras ese intento no haya terminado con éxito; se genera uno nuevo al abrir el formulario para un gasto nuevo. Dos gastos legítimos idénticos creados en momentos distintos tienen `request_id` distintos, así que ambos se crean.

## Se mantiene intacto

- Validación de mínimo 1 participante, transacción atómica en `save_trip_expense`, constraint trigger `trip_expenses_require_split`, RLS y grants actuales.
- Cálculos de saldos, total gastado, mis gastos, deudas, pagos, reembolsos, cierre/reapertura y el resto de la app.

## Validación

Pruebas en base de datos: misma `request_id` dos veces → un solo gasto y mismo id devuelto; dos llamadas concurrentes con la misma clave → un solo gasto; claves distintas con mismos datos → dos gastos; 0 participantes → sigue fallando sin dejar registro. En UI: guardado simple, doble clic rápido y edición con doble clic.
