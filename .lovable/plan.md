

## Cambiar el botón de pago a pastilla roja con texto "Pagar"

### Cambio único

Solo se modifica `src/pages/trips/Expenses.tsx`, líneas 630-642.

Reemplazar el botón ghost icon azul actual por una pastilla compacta roja con el texto "Pagar":

```text
┌──────────────────────────────────────────────────────────┐
│ Carlos → Ana          45.00 €  [💲 Pagar]  ← rojo       │
└──────────────────────────────────────────────────────────┘
```

### Detalle técnico

- `Button` con `variant="destructive"` y `size="sm"`
- Clases: `h-7 px-2.5 text-xs rounded-full flex-shrink-0` para que sea compacto tipo "burbuja/pastilla"
- Icono `CheckCircle2` (h-3 w-3) + texto "Pagar"
- Eliminar el `Tooltip` wrapper ya que el texto es autoexplicativo
- Sin cambios en lógica, permisos ni ningún otro fichero

### Ficheros afectados

| Fichero | Cambio |
|---------|--------|
| `src/pages/trips/Expenses.tsx` | Reemplazar botón icon ghost azul por pastilla roja con texto "Pagar" |

No se toca ninguna otra parte de la app.

