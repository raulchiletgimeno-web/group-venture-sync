

## Plan: Mejorar visualización del vídeo de fondo en móvil

### Problema

El vídeo usa `object-cover` que en pantallas verticales (móvil) recorta los laterales, perdiendo la composición (los tres chicos + Coliseo). Actualmente en móvil no se carga el vídeo sino solo el poster, pero el poster tiene el mismo problema de recorte con `bg-cover bg-center`.

### Solución

Aplicar un `object-position` / `background-position` diferente en móvil para centrar mejor la escena, y además cargar el vídeo también en móvil (con la misma estrategia lazy) pero con un posicionamiento optimizado.

#### Cambios en `src/pages/Landing.tsx`:

1. **Poster image**: En móvil, cambiar `bg-center` a `bg-[center_30%]` (o similar) para desplazar el foco vertical hacia arriba donde están los personajes y el Coliseo. Ajustar también `bg-cover` para que no se recorte tanto la escena.

2. **Cargar el vídeo también en móvil**: Eliminar la restricción `!isMobile` para que el vídeo se cargue en ambos dispositivos, pero con un delay mayor en móvil (500ms vs 100ms) para priorizar el render inicial.

3. **object-position responsivo en el vídeo**: Aplicar `object-position: center 30%` en móvil (via clase condicional) para que el encuadre del vídeo muestre mejor la parte superior de la escena donde están los personajes.

4. **Alternativa si el rendimiento móvil es prioritario**: Mantener solo poster en móvil pero con `background-size: cover` y un `background-position` ajustado para mostrar la escena completa (e.g., `bg-[center_25%]`).

#### Enfoque recomendado (equilibrio rendimiento + visual):

- **Móvil**: Mantener solo poster (sin vídeo) para rendimiento, pero ajustar `background-position` a `center 25%` para encuadrar mejor los personajes y el Coliseo
- **Desktop**: Sin cambios (funciona bien)
- **Poster container**: Añadir clase condicional según `isMobile` para el posicionamiento

### Archivo a modificar

| Archivo | Cambio |
|---|---|
| `src/pages/Landing.tsx` | Clase condicional en poster div: `bg-[center_25%]` en móvil vs `bg-center` en desktop. Mismo ajuste en el `<video>` element con `object-[center_25%]` como clase responsive (`md:object-center`). |

### Resultado

En móvil el poster se encuadrará mostrando los personajes y el Coliseo centrados en la composición, en lugar del recorte lateral actual.

