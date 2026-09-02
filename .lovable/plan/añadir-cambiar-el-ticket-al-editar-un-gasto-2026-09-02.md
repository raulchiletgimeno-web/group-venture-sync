# Añadir/cambiar el ticket al editar un gasto

## Estado actual (verificado leyendo `src/pages/trips/Expenses.tsx`)

El formulario de edición ya muestra la sección de ticket (botones Cámara/Galería, previsualización y botón de quitar), y en la edición `handleSubmit` llama a `uploadReceipt(editingId)` y pasa el resultado como `p_receipt_path` a `save_trip_expense`. Aun así el usuario reporta que al editar no se puede añadir el ticket. Además hay un detalle confirmado en el backend: `save_trip_expense` actualiza con `receipt_path = COALESCE(p_receipt_path, receipt_path)`, de modo que un `null` nunca borra el ticket existente (la opción de quitar el ticket en edición no llega a aplicarse en la base de datos).

## Paso 1 — Diagnóstico (antes de tocar nada)

- Reproducir el fallo en la preview: crear un gasto sin ticket, editarlo, adjuntar ticket y guardar; observar consola/red (error de Storage, de la RPC o silencioso).
- Consultar las policies de `storage.objects` del bucket `trip-photos` para confirmar que la subida/upsert en la ruta `{tripId}/receipts/{expenseId}.{ext}` está permitida al editar (la ruta de creación funciona, pero se verificará que no haya una condición que solo cubra el alta).
- Confirmar el comportamiento de la rama de actualización de `save_trip_expense` con `p_receipt_path`.

## Paso 2 — Corrección quirúrgica

Solo se tocará `src/pages/trips/Expenses.tsx` y, si el diagnóstico lo confirma, la función `save_trip_expense` (migración):

- **Añadir ticket en edición**: corregir la causa concreta encontrada en el paso 1 (p. ej. ruta de Storage, manejo del error de subida que hoy devuelve silenciosamente el path anterior, o la propia RPC), de modo que adjuntar una foto en Editar actualice el mismo gasto, mismo `id`.
- **Sustituir ticket**: ya usa `upsert: true`; se mantendrá.
- **Quitar ticket en edición**: hacer que un `p_receipt_path` nulo explícito (usuario pulsó quitar) sí borre la referencia, sin romper el comportamiento de creación. Opción segura: nuevo parámetro opcional `p_clear_receipt boolean default false` en `save_trip_expense` que ponga `receipt_path = null` solo cuando se indique; sin ese parámetro se mantiene el `COALESCE` actual (no rompe llamadas existentes).
- Al quitar/sustituir, eliminar el archivo antiguo del bucket si la extensión cambia (evitar huérfanos), sin abrir permisos.

## Se mantiene intacto

- `save_trip_expense`: mínimo 1 participante, transacción atómica, `request_id`/idempotencia, RLS y trigger de integridad.
- Bloqueo de doble clic (`submittingExpense`, spinner, `aria-busy`).
- Bloqueo de edición con el viaje cerrado (`isLocked` ya corta `openEdit`: sin excepciones para el ticket).
- Bucket privado, policies y URLs firmadas (`SignedImg`/`getSignedUrl`).
- Saldos, total gastado, pagos, reembolsos, cierre/reapertura, notificaciones y el resto de la app. Editar el ticket no crea gastos nuevos ni altera importe, participantes ni pagador.

## Validación

1. Crear gasto sin ticket → funciona.
2. Editarlo y añadir ticket → guarda, mismo `id`, ticket visible con URL firmada.
3. Editar de nuevo y sustituir el ticket → se muestra el nuevo.
4. Editar y quitar el ticket → `receipt_path` queda vacío.
5. En todos los casos: importe, participantes, pagador y saldos sin cambios; ningún gasto duplicado.
6. Viaje cerrado → edición sigue bloqueada.
7. `npx tsgo --noEmit` sin errores.

## Informe final

Se indicará la causa exacta encontrada, los archivos/función modificados y el flujo resultante de edición del ticket.
