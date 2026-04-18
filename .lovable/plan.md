

The user wants WhatsApp-style reply-to-message in chat. I need to:
1. Add `reply_to_id` column to `trip_messages` (nullable uuid, self-reference)
2. Add swipe-right gesture on messages (touch events, works on mobile + desktop)
3. Show quoted preview above input when replying (with cancel X)
4. Render quoted block inside reply messages, clickable to scroll to original

Schema check: trip_messages has no reply column → need migration. RLS unchanged since it's same table.

Scope is strictly Chat.tsx + one migration. No other files touched.

## Responder mensajes estilo WhatsApp en el chat

### Cambios

**1. Base de datos** (migración)
- Añadir columna `reply_to_id uuid NULL` a `trip_messages` (auto-referencia a `id`)
- Sin cambios en RLS (misma tabla)

**2. `src/pages/trips/Chat.tsx`** (único fichero de la app)

Gesto de swipe:
- Detectar `touchstart` / `touchmove` / `touchend` en cada burbuja de mensaje
- Si el desplazamiento horizontal es > 60px hacia la derecha (y vertical < 30px), activar respuesta
- Animación: la burbuja se traslada con el dedo y vuelve a su sitio al soltar
- En desktop: botón sutil de "responder" visible en hover (mismo grupo que el de borrar)

Vista previa antes de enviar:
- Cuando hay `replyTo` activo, mostrar bloque por encima del input con:
  - Barra vertical color primario
  - Nombre del autor del mensaje citado
  - Snippet del contenido (texto truncado, "📷 Imagen" o "🎤 Audio" según tipo)
  - Botón X para cancelar la respuesta

Envío:
- En `sendText` y `sendImage` y audio, incluir `reply_to_id: replyTo?.id ?? null` en el insert
- Limpiar `replyTo` tras enviar

Visualización de la respuesta:
- En cada mensaje con `reply_to_id`, renderizar un bloque dentro de la burbuja (encima del contenido) con:
  - Borde izquierdo color primario
  - Nombre del autor original + snippet (truncado a ~60 chars)
- Al pulsar la cita, hacer scroll suave hasta el mensaje original con un highlight breve
- Si el mensaje original fue eliminado, mostrar "Mensaje no disponible"

### Traducciones
- Añadir 2 claves nuevas en `src/i18n/translations.ts`: `reply` y `replyingTo` (ES/EN/FR/DE/IT/PT) — única excepción al "no tocar nada más", indispensable para el copy del bloque de respuesta

### Ficheros afectados

| Fichero | Cambio |
|---------|--------|
| Migración SQL | Añadir `reply_to_id` a `trip_messages` |
| `src/pages/trips/Chat.tsx` | Swipe, preview, envío con referencia, render del bloque citado |
| `src/i18n/translations.ts` | 2 claves nuevas (`reply`, `replyingTo`) |

No se toca ningún otro fichero, pantalla ni funcionalidad. La galería, fotos, gastos, recordatorios, transporte, etc. quedan intactos.

