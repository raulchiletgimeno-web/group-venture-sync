

## Plan: Mover botón "Instalar en móvil" debajo del botón FAQ

### Cambio único en `src/pages/Landing.tsx`

Intercambiar las posiciones verticales: el botón FAQ queda arriba y el de instalar debajo.

- Botón FAQ: mantener `bottom-52` (actual)
- Botón Instalar: cambiar de `bottom-[17rem]` a `bottom-40` (debajo del FAQ)

