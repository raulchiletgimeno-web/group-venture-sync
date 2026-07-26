
## Objetivo
Mostrar los pagos ya registrados en `debt_payments` como **Reembolsos** dentro de la pestaña "Gastos" (listado general), sin duplicar datos, sin nueva tabla, sin tocar cálculos ni ninguna otra sección.

## Alcance
Un único archivo modificado: `src/pages/trips/Expenses.tsx`.
Añadir claves i18n en `src/i18n/translations.ts` (5 idiomas: `refund`, `refundPaidTo`).

Nada más: ni migración, ni edge functions, ni chat, ni emails, ni otras pestañas.

## Implementación

### 1. Fuente única de datos
No se crea ninguna tabla ni registro nuevo. Se reutiliza el array `payments` ya cargado desde `debt_payments` (fetch existente en `fetchPayments`).

### 2. Fusión en el listado "Gastos"
Dentro del `TabsContent value="gastos"` (el listado general de gastos), construir en memoria una lista combinada:
- Items tipo `"expense"` desde `expenses`
- Items tipo `"refund"` desde `payments`
- Ordenados por fecha descendente (`created_at` / `paid_at`)

### 3. Presentación del Reembolso
Tarjeta con el mismo estilo que un gasto normal pero visualmente diferenciada:
- Icono `Undo2` (o `ArrowLeftRight`) en un contenedor con tinte suave (`bg-green-50` / `text-green-700`, coherente con los colores ya usados en el historial de pagos)
- Etiqueta: **Reembolso** (badge sutil)
- Línea principal: `{pagador} → {receptor}`
- Línea secundaria: `{importe} € · {método} · {fecha}`
- Sin acciones de editar/borrar en esta vista (la edición sigue existiendo en Saldos → historial de pagos, como ahora)

### 4. Contabilidad — sin doble contabilización
Los cálculos de `totalExpenses`, `myExpenses`, `balances` y `debts` **no se tocan**. Los reembolsos son solo visualización dentro del listado; ya afectan a los saldos vía `payments` en el `useMemo` de `balances` existente.

Verificación explícita:
- `totalExpenses` → sigue usando `expenses.reduce(...)` únicamente
- `myExpenses` → sigue usando `expenses` únicamente
- Reembolso no genera splits, no aparece en `trip_expenses`

### 5. Edición / eliminación
Como el reembolso se renderiza a partir de `debt_payments`:
- Editar un pago (flujo actual en Saldos) → al refrescar `payments`, el reembolso mostrado en Gastos se actualiza solo
- Si un pago se elimina de `debt_payments` → desaparece automáticamente del listado

### 6. Retroactividad (Tracks Monte Perdido y cualquier viaje)
Al ser puramente derivado de `debt_payments`, todos los pagos históricos aparecen automáticamente como reembolsos sin migración, sin reenvío de emails, sin nuevos mensajes de chat, sin alterar importes ni fechas.

### 7. i18n
Añadir en los 5 idiomas:
- `refund` → "Reembolso" / "Refund" / "Remboursement" / "Reembolso" / "Rimborso"
- `refundPaidTo` → "{from} pagó a {to}" (o interpolación equivalente)

## Validación al terminar
Confirmar:
1. Los reembolsos aparecen en la pestaña Gastos, diferenciados visualmente.
2. `Total gastado` y `Mis gastos` no cambian tras registrar un pago.
3. Saldos siguen cuadrando.
4. No hay doble contabilización (no se inserta en `trip_expenses`).
5. Editar un pago actualiza el reembolso; borrarlo lo elimina.
6. Los pagos de "Tracks Monte Perdido" ya existentes se muestran retroactivamente.
7. No se han reenviado emails ni publicado mensajes de chat.
8. Solo se han modificado `Expenses.tsx` y `translations.ts`.
