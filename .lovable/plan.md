# Mejoras experiencia post-viaje YORMIT

Solo se tocarán 4 archivos relacionados con el feedback post-viaje. Ninguna otra parte de la app se modifica.

## 1. Email al usuario — más corto, ligero y premium

Archivo: `supabase/functions/_shared/transactional-email-templates/trip-post-departure.tsx`

**Asunto** (rotación entre 4 variantes cortas):
- "✨ Valóranos en 10 segundos"
- "💬 ¿Qué tal {tripName}? Cuéntanoslo en 10s"
- "⭐ Tu opinión sobre YORMIT (10 segundos)"
- "🙌 ¿Cómo ha ido {tripName}? Tu opinión cuenta"

**Estructura nueva** (mucho más corta, CTA arriba):
- Header YORMIT (igual)
- Saludo: "¡Hola, {nombre}! 👋"
- Frase única: "¿Qué tal ha ido **{tripName}**? Tu opinión nos ayuda a mejorar ✨"
- **Botón CTA grande**: "Valorar en 10 segundos →" (ya visible sin hacer scroll)
- Microcopy bajo el botón: "Solo 10 segundos. Prometido."
- Mini-bloque del viaje **discreto** (tipo chip, una línea): 📍 Lisboa · 22–26 nov
- Cierre breve: "Gracias por viajar con YORMIT 🙌"

Se elimina el bloque "⭐ Tu opinión nos importa" duplicado, los párrafos largos, el fallback de URL visible y la línea "Seguimos mejorando viaje a viaje". El email cabrá en una pantalla de móvil sin scroll.

## 2. Formulario de feedback — sensación de rapidez

Archivo: `src/pages/Feedback.tsx`

Reorganización visual (sin tocar lógica de envío ni payload):

- **Header reducido**: cabecera más fina, título más corto: "Valora tu experiencia ✨"
- Subtítulo: "Solo 10 segundos. Si quieres contarnos más, tienes espacio abajo."
- **Bloque destacado arriba (lo único obligatorio)**:
  1. ⭐ Estrellas 1-5 (más grandes, centradas)
  2. ¿Volverías a usar YORMIT? (Sí / Tal vez / No, chips grandes)
  3. Botón **"Enviar valoración ✨"** visible justo después
- **Separador visual** "¿Quieres contarnos algo más? (opcional)" que agrupa el resto en un acordeón abierto pero claramente marcado como opcional, con tipografía y color más suaves:
  - Secciones usadas
  - Sección más útil / a mejorar
  - Funcionalidad que echas de menos
  - Qué cambiarías
  - Comentario libre
- El bloque "Cuéntanos sobre ti" sigue colapsado como ahora.
- Segundo botón de envío al final (mismo handler) para quien rellene todo.

Resultado: al abrir, el usuario ve estrellas + 1 pregunta + botón. Puede enviar en 10 segundos o ampliar si quiere.

## 3. Email interno a info@yormit.com — pequeños retoques

Archivo: `supabase/functions/_shared/transactional-email-templates/trip-feedback-internal.tsx`

- **Bloque "Destacado" arriba** con fondo suave y borde acento que agrupa lo más accionable:
  - ⭐ Valoración (grande, ya existente, se mantiene)
  - Sección a mejorar
  - Qué cambiaría
  - Funcionalidad que echa de menos
- El resto de respuestas (secciones usadas, más útil, volvería a usar, comentario libre) en un bloque secundario más discreto.
- **Bloque "Perfil opcional"** con badge "Datos opcionales rellenados" cuando hay datos, para que se vea de un vistazo si el usuario completó esta parte.
- Sin cambios estructurales mayores: mismo header, mismo asunto, misma información.

## 4. Envío fijo: día siguiente a las 10:00

Archivo: `supabase/functions/check-trip-post-departure/index.ts` + reprogramación del cron.

**Lógica nueva en la edge function** (sin tocar nada más):

```text
- Cron pasa a ejecutarse 1 vez al día a las 10:00 Europe/Madrid
  (= 09:00 UTC en horario de verano CEST, 09:00 UTC ≈ 10:00 local)
- Para gestionar correctamente verano/invierno usamos un cron que dispara
  a las 08:00 y 09:00 UTC y la función decide si "ahora" es 10:00 en
  Europe/Madrid usando Intl.DateTimeFormat('Europe/Madrid'); si no, sale.
- Selección de viajes: end_date = ayer (en Europe/Madrid).
- Se elimina la ventana 24-96h y el chequeo por horas; se sustituye por
  "fecha local Madrid de hoy menos 1 día == end_date".
- Catch-up: si por algún motivo no se ejecutó ayer, también se incluye
  end_date = hace 2 días si no hay registro previo en
  trip_post_departure_reminders (idempotencia ya existente lo protege).
- force_trip_id sigue funcionando para envíos manuales.
```

**Cron**: se reprograma `check-trip-post-departure-hourly` → `check-trip-post-departure-daily-10` con schedule `0 8,9 * * *` (UTC) — la función internamente confirma que en Europe/Madrid son las 10:00 antes de procesar. Esto da una hora exacta y estable todo el año.

## Validación tras desplegar

- Confirmaré: nuevo asunto elegido (rotación), texto final del email, mejoras del formulario, retoques internos y la regla "día siguiente a las 10:00 Europe/Madrid".
- Confirmaré que **solo** se han modificado estos 4 archivos y la programación del cron, y nada más de la app.

## Archivos que se tocan

1. `supabase/functions/_shared/transactional-email-templates/trip-post-departure.tsx`
2. `src/pages/Feedback.tsx`
3. `supabase/functions/_shared/transactional-email-templates/trip-feedback-internal.tsx`
4. `supabase/functions/check-trip-post-departure/index.ts` + reprogramación del cron job (vía SQL insert, sin migración pública).

Nada más se modifica.
