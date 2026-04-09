

## Ajustes en la plantilla de email de recordatorio de deuda

### 1. Duplicación del símbolo € — Corrección en la plantilla

**Causa raíz:** La plantilla muestra `{amount} €`, y el valor por defecto del prop es `'0.00'` (sin €). En producción, `check-trip-debts` pasa `debt.amount.toFixed(2)` que da `"45.00"` (sin €), así que en producción debería salir bien. Sin embargo, en la prueba manual se pasó `"45.00 €"` como valor, causando `"45.00 € €"`.

**Solución:** Hacer la plantilla defensiva para que funcione correctamente en ambos casos. En `debt-reminder.tsx`, limpiar el valor del prop `amount` eliminando cualquier `€` antes de mostrarlo, de forma que nunca se duplique:

```
Antes:  <Text style={debtAmount}>{amount} €</Text>
Después: <Text style={debtAmount}>{amount.replace(/\s*€/g, '')} €</Text>
```

Y lo mismo en el `<Preview>` y en el `debtDetail` donde aparezca el importe.

**Fichero:** `supabase/functions/_shared/transactional-email-templates/debt-reminder.tsx`
Solo se toca este fichero.

### 2. Texto de baja / pie del email en inglés

Este texto ("You received this email because of an action on YORMIT" / "Unsubscribe from these emails") es un pie de página que el sistema añade automáticamente a todos los emails. No forma parte de la plantilla y no se puede modificar desde el código del proyecto — es gestionado por la infraestructura de envío.

**No es posible cambiarlo desde aquí.** Es una limitación del sistema de envío actual.

### Resumen de cambios

- **Se toca:** `debt-reminder.tsx` (sanitizar el símbolo € para evitar duplicación)
- **Se redespliegan:** `send-transactional-email` y `preview-transactional-email`
- **NO se toca:** ninguna otra parte de la app
- **Limitación:** el footer de baja en inglés no se puede modificar desde el proyecto

