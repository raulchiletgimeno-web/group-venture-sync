

## Correcciones en el email de recordatorio de deuda

### 1. Asunto: sanitizar el símbolo € (igual que en el cuerpo)

Las líneas 19 y 21 de `debt-reminder.tsx` usan `data.amount` directamente en el asunto y le añaden ` €`. Si el valor ya incluye `€`, se duplica.

**Solución:** Añadir una función helper `cleanAmount` que elimine cualquier `€` del valor, y usarla tanto en los asuntos como en `pickSubject`.

```
// Helper
function cleanAmount(raw: string | undefined): string {
  return (raw || '?').replace(/\s*€/g, '').trim()
}

// Líneas afectadas:
`🔔 ... deuda pendiente de ${cleanAmount(data.amount)} €`
`🤖 ... ${cleanAmount(data.amount)} € pendientes`
```

**Fichero:** `supabase/functions/_shared/transactional-email-templates/debt-reminder.tsx`

### 2. Pie del email en inglés — NO modificable

El texto "You received this email because of an action on YORMIT" y "Unsubscribe from these emails" es un footer inyectado automáticamente por la infraestructura de envío de emails. No forma parte de la plantilla ni del código del proyecto — se añade externamente al HTML renderizado.

**No es posible cambiarlo ni traducirlo desde aquí.** Es una limitación del sistema de envío actual que no depende de nuestro código.

### Resumen

| Cambio | Fichero | Resultado |
|--------|---------|-----------|
| Sanitizar `€` en asuntos | `debt-reminder.tsx` | Nunca se duplica el símbolo |
| Footer en inglés | — | No modificable (infraestructura externa) |

Se redesplegarán `send-transactional-email` y `preview-transactional-email`. No se toca ninguna otra parte de la app.

