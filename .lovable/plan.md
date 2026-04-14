

## Corrección del botón "Marcar como pagado" en Gastos

### Problemas identificados

1. **Permiso incorrecto**: La condición actual (línea 629) permite que tanto el deudor como el acreedor marquen el pago (`user.id === d.from || user.id === d.to`). Debe ser solo el deudor (`user.id === d.from`).

2. **Botón demasiado grande**: El `Button variant="outline" size="sm"` con texto completo rompe la línea en móvil (390px viewport). Ocupa demasiado y baja a segunda fila por el `flex-wrap`.

3. **`flex-wrap` en la fila**: La clase `flex-wrap` en línea 624 permite que los elementos salten de línea, rompiendo la composición.

### Cambios propuestos

Solo se modifica `src/pages/trips/Expenses.tsx`. Nada más.

#### 1. Permiso: solo el deudor

Cambiar la condición de visibilidad de:
```
user.id === d.from || user.id === d.to
```
a:
```
user.id === d.from
```

#### 2. Botón compacto tipo icon con tooltip

Reemplazar el `Button outline size="sm"` con texto por un botón icono pequeño (`size="icon"`, `h-7 w-7`) con el icono `CheckCircle2` y un `Tooltip` que muestre el texto `markAsPaid`. Esto mantiene todo en una sola línea.

Estilo: fondo transparente, icono en color primary, hover suave. Mismo patrón que el botón "Ver detalle" del historial.

#### 3. Eliminar `flex-wrap`

Quitar `flex-wrap` de la fila de deuda para forzar una sola línea.

#### 4. RLS (ya protegido)

La política RLS de INSERT en `debt_payments` ya exige `from_user = auth.uid() OR to_user = auth.uid()`. Para mayor seguridad, podría restringirse solo a `from_user = auth.uid()`, pero esto requiere una migración. Lo incluyo como opcional.

### Resultado visual esperado

```text
┌──────────────────────────────────────────────────┐
│ Carlos → Ana          45.00 €  (✓)               │
└──────────────────────────────────────────────────┘
```

El `(✓)` es un icono compacto con tooltip. Solo visible para Carlos (el deudor).

### Ficheros afectados

| Fichero | Cambio |
|---------|--------|
| `src/pages/trips/Expenses.tsx` | Condición solo deudor, botón icon compacto con tooltip, quitar flex-wrap |

Opcionalmente:

| Fichero | Cambio |
|---------|--------|
| Migración SQL | Restringir INSERT RLS a `from_user = auth.uid()` solamente |

No se toca ninguna otra parte de la app.

