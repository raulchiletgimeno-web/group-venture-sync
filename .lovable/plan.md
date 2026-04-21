

## Ajuste del envío de mensajes en el chat grupal

### Cambio a realizar (solo en `src/pages/trips/Chat.tsx`)

**Eliminar el envío por tecla Enter**

En la línea 462, el input tiene un manejador `onKeyDown` que envía el mensaje al pulsar Enter:

```tsx
onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); if (imageFile) sendImage(imageFile); else sendText(); } }}
```

**Acción**: eliminar completamente esta prop `onKeyDown` del input. El mensaje solo se enviará al hacer clic en el botón con el icono `<Send />` (líneas 466-468), que ya funciona correctamente.

### Lo que NO se toca
- Cero cambios en el diseño visual del input o del botón.
- Cero cambios en la lógica de `sendText()`, `sendImage()`, grabación de audio, adjuntar imágenes, o respuestas.
- Cero cambios en otros componentes, páginas, hooks, contextos o estilos globales.

### Ficheros afectados

| Fichero | Cambio |
|---------|--------|
| `src/pages/trips/Chat.tsx` | Eliminar prop `onKeyDown` del input (línea 462) |

Un único fichero modificado, una única línea eliminada.

