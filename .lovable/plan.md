
Hallazgos confirmados

- Los logs reales de `test-push` no muestran una excepción de runtime; solo aparecen eventos de arranque (`booted`). Eso encaja con una salida controlada de la función, no con un crash interno.
- La consulta real a base de datos sobre `public.push_subscriptions` devuelve ahora mismo `[]`. No hay ninguna suscripción guardada.
- En `supabase/functions/test-push/index.ts`, la ruta exacta de error está en las líneas 52-56:
  - si no encuentra suscripciones, devuelve `404`
  - body: `{ "error": "no_subscriptions", "detail": ... }`
- Por tanto, el `non-2xx status code` real es `404`, no `500`.
- `send-push` no interviene todavía en este fallo; por eso no tiene logs.
- El problema no está en `webpush.sendNotification()`, VAPID, CORS ni secrets en esta ejecución concreta, porque esa parte empieza después y no se llega a ejecutar cuando no hay suscripciones.

Causa exacta

- El frontend considera `isSubscribed = true` solo porque existe una suscripción local en el navegador (`reg.pushManager.getSubscription()`), según `src/hooks/use-push-notifications.ts`, líneas 59-64.
- Pero ese hook no comprueba si esa suscripción existe también en `push_subscriptions`.
- Resultado: hay desincronización entre móvil y backend.
  - Navegador/PWA: cree que el dispositivo sigue suscrito
  - Backend: no tiene ninguna fila para ese usuario/dispositivo
- Por eso el botón `🔔 Test` aparece, pero `test-push` responde `404 no_subscriptions`.

Qué corregiré

1. `src/hooks/use-push-notifications.ts`
   - Añadir sincronización real entre la suscripción local y la tabla `push_subscriptions`.
   - No marcar `isSubscribed=true` solo por existir suscripción local.
   - Verificar también que exista fila en backend para el usuario actual.

2. Re-suscripción automática cuando haya desajuste
   - Si existe suscripción local pero no fila en backend, tratarla como suscripción desincronizada.
   - Forzar limpieza de la suscripción local y crear una nueva con la clave VAPID actual.
   - Guardarla de nuevo en `push_subscriptions`.

3. `subscribe()`
   - Dejar de reutilizar ciegamente `existingSubscription`.
   - Si hay una suscripción previa, recrearla correctamente antes de persistirla, para evitar estados “fantasma”.

4. `src/pages/Dashboard.tsx`
   - Mejorar el manejo del error de `test-push`.
   - Si la respuesta es `no_subscriptions`, mostrar un mensaje claro indicando que hay que reactivar/sincronizar notificaciones, en lugar del error genérico.

Qué resultado espero tras corregirlo

- El botón `Test` dejará de mostrarse por falso positivo.
- El móvil volverá a registrarse de verdad en `push_subscriptions`.
- `test-push` dejará de devolver `404`.
- La prueba debería pasar a `1 dispositivo`.

Cómo volver a probarlo después

1. Abrir YORMIT en el móvil real.
2. Dejar que el sistema detecte la desincronización.
3. Reactivar notificaciones si reaparece el banner.
4. Pulsar `🔔 Test`.
5. Resultado esperado: `Notificación enviada (1 dispositivo)`.

Resumen exacto pedido

- Status code exacto: `404`
- Error exacto: `no_subscriptions`
- Parte exacta donde falla: `supabase/functions/test-push/index.ts`, líneas `52-56`
- Causa exacta: el backend no tiene ninguna fila en `push_subscriptions`, pero el frontend sigue creyendo que el dispositivo está suscrito porque solo mira `PushManager` local
- Corrección necesaria: reconciliar estado local + backend y re-suscribir el dispositivo cuando haya desajuste
