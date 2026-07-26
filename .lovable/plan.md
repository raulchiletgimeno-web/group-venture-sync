## Problema

En `src/pages/trips/Expenses.tsx` (línea 627-631), el botón "Añadir gasto" está envuelto en `<DialogTrigger asChild>`. Radix hace que el trigger llame internamente a `setOpen(true)` en el `Dialog`, independientemente de lo que haga `onClick={openCreate}`. Por eso el early-return de `openCreate` cuando `isLocked` no evita que se abra el formulario: abre el aviso y, además, Radix abre el Dialog. Al pulsar "Entendido" queda visible el formulario ya abierto por Radix.

## Corrección (mínima y quirúrgica)

Sacar el botón "Añadir gasto" fuera de `<DialogTrigger asChild>` para que sea únicamente `openCreate` quien controle la apertura del Dialog (ya llama a `setOpen(true)` al final cuando no está bloqueado).

Cambio único en `src/pages/trips/Expenses.tsx` alrededor de la línea 626:

- Eliminar el envoltorio `<DialogTrigger asChild>…</DialogTrigger>` alrededor del botón.
- Mantener el botón tal cual (mismo estilo, mismo `onClick={openCreate}`, mismo texto/icono).
- Mantener el `<Dialog open={open} onOpenChange={…}>` y su `<DialogContent>` intactos.

Resultado:
- Si `isLocked` es true → `openCreate` muestra el aviso y hace `return`; el formulario NO se abre.
- Al pulsar "Entendido" → se cierra el `AlertDialog` y el usuario permanece en la pantalla de Gastos compartidos.
- Si `isLocked` es false → el flujo actual sigue igual (openCreate hace `setOpen(true)` y aparece el formulario).

## Fuera de alcance

No se tocan: cálculos, RLS/policies, textos, traducciones, diseño, otras secciones ni el resto de la app.