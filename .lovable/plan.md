## Objetivo

Enviar automáticamente un email premium a todos los miembros aprobados de un viaje **al día siguiente de su `end_date`**, una sola vez por usuario y viaje, con un enlace claro a un formulario de feedback cuyo resultado llega a **info@yormit.com**.

No se toca nada más de la app.

---

## Decisión clave: cómo se recoge el feedback

Comparé tres opciones (formulario embebido en el email, mailto con respuesta libre, y página propia dentro de YORMIT) y recomiendo la tercera porque es la más **fiable, premium y fácil de gestionar**, sin depender de Google Forms ni de servicios externos:

- **Página `/feedback?trip=<id>&token=<token>` dentro de la propia app YORMIT** (mismo branding, mismo CSS, móvil-first).
- El formulario envía las respuestas a una nueva edge function `submit-trip-feedback`, que:
  1. Guarda el feedback en una tabla `trip_feedback` (histórico interno consultable).
  2. Manda un email estructurado a **info@yormit.com** con todas las respuestas usando el sistema actual `send-transactional-email` y un template nuevo `trip-feedback-internal`.
- El enlace del email lleva un `token` único por (viaje, usuario) para que cada respuesta quede correctamente atribuida sin pedir login (los miembros pueden estar fuera de sesión al abrir el correo).

Ventajas frente a Google Forms / Typeform:
- Branding YORMIT 100%.
- Sin dependencias externas ni cuentas adicionales.
- El feedback queda también en la base de datos, no solo en el inbox.
- Identificación automática del viaje y usuario que responden.

---

## Asunto y cuerpo del email (versión propuesta)

**Asunto** (rotación entre 4 variantes premium):
1. ✨ ¿Qué tal ha ido tu experiencia con YORMIT en {tripName}?
2. 💬 Cuéntanos cómo ha sido tu viaje con YORMIT
3. ⭐ Tu opinión nos ayuda a mejorar YORMIT
4. 🙌 Gracias por viajar con YORMIT, ¿nos cuentas tu experiencia?

**Cuerpo** (estructura visual idéntica al template `trip-pre-departure`: header azul con marca, tarjeta con datos del viaje, secciones limpias):

```
Hola {nombre} 👋

Esperamos que hayas disfrutado mucho de {tripName} 😊

Ahora que el viaje ya ha terminado, nos encantaría conocer tu experiencia
con YORMIT para seguir mejorando la app y hacer que cada viaje en grupo sea
todavía más fácil, cómodo y útil.

[Tarjeta: 📍 Destino · 📅 Fechas]

Solo te llevará un par de minutos. Tu opinión nos importa de verdad.

[ Botón premium: Compartir mi experiencia ✨ ]

Gracias por formar parte de YORMIT y por ayudarnos a seguir mejorando.

Seguimos mejorando viaje a viaje ✈️
```

---

## Preguntas del formulario `/feedback`

Ordenadas, móvil-first, todas opcionales salvo la valoración:

1. **Valoración general** ⭐ (1–5, requerido)
2. Secciones más usadas (multiselección: Chat, Fotos, Gastos, Itinerario, Transporte, Alojamiento, Lugares útiles, Tiempo)
3. Sección que te resultó más útil (selección única)
4. Sección que mejorarías (selección única)
5. Funcionalidad que echaste de menos (texto libre)
6. Qué cambiarías para mejorar la experiencia (texto libre)
7. ¿Volverías a usar YORMIT en otro viaje? (Sí / Tal vez / No)
8. Comentario libre

**Datos opcionales del perfil** (sección colapsada "Cuéntanos un poco sobre ti"):
- Nombre, primer apellido, edad, lugar de residencia
- + un campo extra útil: **¿Con quién sueles viajar?** (familia / pareja / amigos / compañeros / mixto)

---

## Lógica de envío

Reutilizamos el patrón ya probado de `check-trip-pre-departure`:

- Nueva edge function **`check-trip-post-departure`** que se ejecuta cada hora vía pg_cron.
- Selecciona viajes con `end_date` entre `today - 3 days` y `today - 1 day` (ventana catch-up amplia).
- Para cada viaje, sólo envía si `end_date < today` (es decir, el viaje ya terminó) y **al menos han pasado las primeras horas del día siguiente** (filtro `hoursSinceEnd >= 18` para no salir a las 00:01 UTC sino más cerca de la mañana del día D+1 en horario europeo).
- Carga miembros aprobados con email válido.
- Filtra usuarios ya enviados via tabla nueva `trip_post_departure_reminders` con UNIQUE `(trip_id, user_id)`.
- Por cada destinatario:
  - Genera un token único (32 bytes hex) y lo guarda en `trip_feedback_tokens (token, trip_id, user_id, created_at, used_at)`.
  - Llama a `send-transactional-email` con template nuevo `trip-post-departure` pasando `feedbackUrl = https://www.yormit.com/feedback?token=<token>`.
  - Inserta fila en `trip_post_departure_reminders` (UNIQUE evita duplicados).
- Soporta `force_trip_id` para envíos manuales de catch-up.

**Cron**: nuevo job `check-trip-post-departure-hourly` (`0 * * * *`).

---

## Recogida y entrega del feedback a info@yormit.com

1. El usuario abre `/feedback?token=...` → la página llama (GET) a `submit-trip-feedback?token=...` para validar y obtener `tripName`, destino, nombre de usuario.
2. Al enviar el formulario (POST) con las respuestas:
   - Validación con Zod.
   - Inserta fila completa en `trip_feedback`.
   - Marca `trip_feedback_tokens.used_at`.
   - Llama a `send-transactional-email` con `templateName: 'trip-feedback-internal'` y `to: 'info@yormit.com'` (definido como recipiente fijo en el template).
3. El template `trip-feedback-internal` muestra todas las respuestas en formato tabla legible para el equipo.
4. Página de confirmación premium ("¡Gracias! 🙌").

---

## Detalles técnicos

**Archivos nuevos** (sólo afecta a esta funcionalidad):
- `supabase/functions/check-trip-post-departure/index.ts` — selector + envío.
- `supabase/functions/submit-trip-feedback/index.ts` — valida token + guarda + reenvía a info@yormit.com.
- `supabase/functions/_shared/transactional-email-templates/trip-post-departure.tsx` — email al usuario.
- `supabase/functions/_shared/transactional-email-templates/trip-feedback-internal.tsx` — email a info@yormit.com (con `to: 'info@yormit.com'` fijo).
- `src/pages/Feedback.tsx` — formulario premium móvil-first.
- Ruta `/feedback` añadida a `src/App.tsx` (única línea modificada fuera de la nueva funcionalidad).

**Migración SQL nueva** (sin tocar tablas existentes):
- Tabla `trip_post_departure_reminders` con UNIQUE `(trip_id, user_id)` + RLS.
- Tabla `trip_feedback_tokens (token PK, trip_id, user_id, created_at, used_at)` + RLS service-role.
- Tabla `trip_feedback (id, trip_id, user_id, rating, sections_used jsonb, most_useful_section, section_to_improve, missing_feature, what_to_change, would_use_again, free_comment, profile_first_name, profile_last_name, profile_age, profile_residence, profile_travels_with, created_at)` + RLS service-role.
- Registro en `registry.ts` de los dos templates nuevos.
- Bloques `[functions.check-trip-post-departure]` y `[functions.submit-trip-feedback]` con `verify_jwt = false` en `supabase/config.toml`.
- Cron job `check-trip-post-departure-hourly` (insertado vía herramienta de inserts, no migración, porque incluye anon key).

**No se modifica**: ningún componente existente, ni el cron de pre-departure, ni `send-transactional-email`, ni los templates actuales.

---

## Anti-duplicados

Tres capas:
1. **UNIQUE `(trip_id, user_id)`** en `trip_post_departure_reminders` (la base, idéntica al sistema pre-viaje que ya funciona).
2. **`idempotencyKey = post-departure-{trip_id}-{user_id}`** en `send-transactional-email`.
3. **Token de un solo uso** en `trip_feedback_tokens.used_at` para evitar respuestas múltiples al formulario.

---

## Validación final (lo que confirmaré tras implementar)

1. Asunto final elegido y rotación de variantes.
2. Texto y captura visual del email.
3. Cuándo se dispara: cron horario, ventana D+1 a D+3, filtro de "ya pasaron al menos 18h del end_date".
4. Cómo se evitan duplicados (3 capas anteriores).
5. Cómo se recoge el feedback: página `/feedback` con token + tabla `trip_feedback`.
6. Cómo llega a info@yormit.com: template `trip-feedback-internal` con destinatario fijo, enviado por `send-transactional-email`.
7. Confirmación de que ningún otro archivo de la app se ha tocado (solo añadido la ruta `/feedback`).

¿Lo apruebo y procedo?
