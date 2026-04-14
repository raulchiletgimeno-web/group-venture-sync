

## Enviar email al cobrador cuando el deudor marca un pago

### Resumen

Cuando el deudor confirma un pago en Gastos → Saldos, se enviará automáticamente un email al usuario cobrador informándole del pago registrado, con tono YORMIT (amistoso, premium, simpático).

### Cambios

#### 1. Nueva plantilla de email: `payment-notification.tsx`

Crear `supabase/functions/_shared/transactional-email-templates/payment-notification.tsx`:

- Props: `debtorName`, `creditorName`, `amount`, `tripName`, `paymentMethod`, `paidAt`
- Estilo visual idéntico al de `debt-reminder.tsx` (header azul YORMIT, tarjeta central, branding premium)
- Tono amistoso: "¡Buenas noticias! {debtorName} ha marcado como pagados {amount} € del viaje {tripName}..."
- Detalle del método de pago y fecha
- Asuntos variados y simpáticos (ej: "💰 ¡Te han pagado! {debtorName} ha saldado su deuda")

#### 2. Actualizar `registry.ts`

Añadir import y entrada `'payment-notification'` en el mapa `TEMPLATES`.

#### 3. Modificar `handleConfirmPayment` en `Expenses.tsx`

Después de insertar el pago con éxito (línea ~394), añadir:

```typescript
// Obtener datos para el email
const creditorProfile = members.find(m => m.user_id === paymentDebt.to);
const debtorProfile = members.find(m => m.user_id === paymentDebt.from);
const tripData = await supabase.from("trips").select("title").eq("id", tripId).single();

// Obtener email del cobrador
const { data: creditorData } = await supabase
  .from("profiles").select("email").eq("id", paymentDebt.to).single();

if (creditorData?.email) {
  await supabase.functions.invoke('send-transactional-email', {
    body: {
      templateName: 'payment-notification',
      recipientEmail: creditorData.email,
      idempotencyKey: `payment-notif-${insertedId}`,
      templateData: {
        debtorName: debtorProfile?.name,
        creditorName: creditorProfile?.name,
        amount: paymentDebt.amount.toFixed(2),
        tripName: tripData?.data?.title,
        paymentMethod: paymentMethod,
        paidAt: new Date().toISOString(),
      },
    },
  });
}
```

#### 4. Redesplegar Edge Functions

Desplegar `send-transactional-email` para que cargue la nueva plantilla del registry.

### Ficheros afectados

| Fichero | Cambio |
|---------|--------|
| `supabase/functions/_shared/transactional-email-templates/payment-notification.tsx` | Nueva plantilla de email |
| `supabase/functions/_shared/transactional-email-templates/registry.ts` | Registrar nueva plantilla |
| `src/pages/trips/Expenses.tsx` | Invocar envío de email tras confirmar pago |

No se toca ninguna otra parte de la app.

