

## Mejorar legibilidad del chat

Solo se modifica `src/pages/trips/Chat.tsx`. Ningún otro archivo se toca.

### Cambios concretos

| Elemento | Actual | Nuevo |
|----------|--------|-------|
| Nombre del remitente | `text-[11px]` | `text-xs` (~12px) |
| Texto del mensaje | `text-sm` (~14px) | `text-base` (~16px) |
| Hora del mensaje | `text-[10px]` | `text-xs` (~12px) |
| Avatar | `h-7 w-7` | `h-8 w-8` |
| Iniciales en avatar | `text-[10px]` | `text-xs` |
| Icono papelera | `h-3 w-3` | `h-3.5 w-3.5` |
| Separador de fecha | `text-xs` | `text-xs` (sin cambio, ya legible) |
| Separador "Mensajes nuevos" | `text-xs` | `text-xs` (sin cambio) |
| Burbuja padding | `px-3 py-2` | `px-3.5 py-2.5` |
| Audio player | `h-10` | `h-11` |

### Qué NO cambia
- Diseño general, colores, alineación, estructura
- Input de texto, botones de cámara/galería/micro/envío
- Lógica de scroll, realtime, envío, borrado
- Ningún otro archivo de la app

