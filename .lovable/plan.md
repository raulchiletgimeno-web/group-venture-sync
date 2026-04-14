

## Añadir mensaje automático en el chat al registrar un pago

### Resumen

El email al cobrador ya está implementado (plantilla `payment-notification` + invocación en `handleConfirmPayment`). Solo falta añadir la publicación automática de un mensaje en el chat del viaje cuando se registra un pago.

### Cambio único: `src/pages/trips/Expenses.tsx`

Después del bloque de envío de email (línea ~418), añadir un bloque fire-and-forget que inserte un mensaje en `trip_messages` con el contenido del pago:

```typescript
// Post automatic chat message (fire-and-forget)
try {
  const debtorName = debtorProfile?.name || 'Alguien';
  const creditorName = creditorProfile?.name || 'su compañero/a';
  const formattedAmount = paymentDebt.amount.toFixed(2);

  const chatMessages = [
    `💸 ¡Cuentas claras! ${debtorName} ya ha pagado a ${creditorName} los ${formattedAmount} € pendientes.`,
    `✅ Movimiento registrado: ${debtorName} ha saldado ${formattedAmount} € con ${creditorName}. ¡Así da gusto viajar!`,
    `🎉 ${debtorName} ya está en paz con ${creditorName}: ${formattedAmount} € liquidados.`,
    `🤝 Deuda saldada: ${debtorName} → ${creditorName} · ${formattedAmount} €. ¡Viaje sin dramas!`,
    `💰 ${debtorName} ha pagado ${formattedAmount} € a ${creditorName}. Las cuentas del viaje van tomando forma.`,
  ];
  const msg = chatMessages[Math.floor(Math.random() * chatMessages.length)];

  await supabase.from("trip_messages").insert({
    trip_id: tripId,
    user_id: user.id,
    content: msg,
    type: "text",
  });
} catch (chatErr) {
  console.error('Failed to post payment chat message:', chatErr);
}
```

Se reutilizan las variables `debtorProfile`, `creditorProfile` y `tripData` que ya se obtienen para el email. El mensaje se inserta como un mensaje de texto normal del usuario actual, usando la tabla `trip_messages` existente con las políticas RLS ya configuradas.

### Ficheros afectados

| Fichero | Cambio |
|---------|--------|
| `src/pages/trips/Expenses.tsx` | Insertar mensaje automático en el chat tras registrar pago |

No se toca ningún otro fichero ni funcionalidad.

### Detalle técnico

- Se selecciona aleatoriamente entre 5 mensajes con tono YORMIT (simpático, premium, claro)
- El mensaje incluye: nombre del deudor, nombre del acreedor e importe
- Se inserta como mensaje de tipo `text` en `trip_messages` — no requiere cambios en el chat ni en la base de datos
- Es fire-and-forget: si falla, no bloquea el flujo de pago
- Las notificaciones push del chat se dispararán automáticamente si `notifyTripEvent` ya se invoca en el chat

