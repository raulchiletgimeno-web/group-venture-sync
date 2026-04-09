

## Aumentar un poco más el tamaño del texto del chat

Solo se modifica `src/pages/trips/Chat.tsx`. Ningún otro archivo se toca.

### Cambios concretos

| Elemento | Actual | Nuevo |
|----------|--------|-------|
| Texto del mensaje | `text-base` (~16px) | `text-[17px]` (~17px) |
| Nombre del remitente | `text-xs` (~12px) | `text-sm` (~14px) |
| Hora del mensaje | `text-xs` (~12px) | `text-[13px]` (~13px) |
| Avatar | `h-8 w-8` | `h-9 w-9` |
| Iniciales en avatar | `text-xs` | `text-sm` |
| Burbuja padding | `px-3.5 py-2.5` | `px-4 py-3` |
| Icono papelera | `h-3.5 w-3.5` | `h-4 w-4` |
| Audio player | `h-11` | `h-12` |
| Separador de fecha | `text-xs` | `text-sm` |
| Separador "Mensajes nuevos" | `text-xs` | `text-sm` |

### Qué NO cambia
- Diseño general, colores, alineación, estructura
- Input de texto, botones de cámara/galería/micro/envío
- Lógica de scroll, realtime, envío, borrado
- Ningún otro archivo de la app

