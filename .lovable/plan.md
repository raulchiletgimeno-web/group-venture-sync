

## Plan: Cambio de titular + mejora de legibilidad

### Cambios

**1. Actualizar texto del hero en español** (`src/i18n/translations.ts`)
- Línea 721: `"Tú viaje perfecto,"` → `"Tu viaje en grupo,"`
- Línea 723: Actualizar también la descripción para quitar la tilde incorrecta en "tú viaje" → "tu viaje"

**2. Oscurecer overlay del hero** (`src/pages/Landing.tsx`)
- Línea 91: `bg-black/40` → `bg-black/50` — suficiente para mejorar contraste sin apagar el video

**3. Publicar los cambios** tras aplicar las ediciones.

### Notas
- Solo se modifica el texto en español; los demás idiomas ya dicen "your group trip" o equivalente y no necesitan cambio.
- El overlay pasa de 40% a 50% de opacidad: mejora notable de legibilidad sin perder el atractivo visual del video.

