

## Mejora visual del sistema de deudas pagadas en Gastos

### Problema actual
El botón "Marcar como pagado" es un pequeño icono azul (`CheckCircle2`) tipo `ghost` de 28px, sin texto, que no se entiende sin pasar el ratón por encima (tooltip). En móvil es prácticamente invisible y ambiguo.

### Cambios propuestos

Solo se modifica `src/pages/trips/Expenses.tsx`. Nada más.

#### 1. Botón "Marcar como pagado" → visible y con texto

Reemplazar el icono ghost actual (líneas 627-641) por un botón pequeño con texto e icono:

```text
┌─────────────────────────────────────────────────────┐
│ Carlos  →  Ana           45.00 €  [✓ Marcar pagado] │
└─────────────────────────────────────────────────────┘
```

- Botón `variant="outline"` con `size="sm"`
- Texto: traducción de `markAsPaid` (ya existe)
- Icono `CheckCircle2` al lado
- Colores: borde primary, texto primary
- Solo visible si el usuario es deudor o acreedor (sin cambios en la lógica)

#### 2. Historial de pagos → con acción "Ver detalle"

Cada pago en el historial actual muestra nombre→nombre, método y fecha en línea. Mejora:

- Añadir un botón/enlace discreto "Ver detalle" que abre un mini-dialog o expande info
- Usar un `Dialog` ligero que muestra: quién pagó, a quién, importe, método, fecha — todo formateado de forma clara y elegante
- Icono `Eye` o `Info` como acción

#### 3. Separación visual clara pendientes vs pagadas

- Las deudas pendientes mantienen el estilo actual con el nuevo botón
- Los pagos realizados en el historial llevan un badge verde "Pagado" para reforzar el estado

### Traducciones nuevas (7 idiomas)

Nuevas claves: `viewPaymentDetail`, `paymentDetail`, `settled` (pagado/settled badge)

### Ficheros afectados

| Fichero | Cambio |
|---------|--------|
| `src/pages/trips/Expenses.tsx` | Botón con texto, dialog de detalle de pago, badge "Pagado" en historial |
| `src/i18n/translations.ts` | ~3 claves nuevas en 7 idiomas |

No se toca ninguna otra parte de la app.

