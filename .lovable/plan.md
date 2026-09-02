# Ajuste visual: mayor contraste en botones "Volver"

## Objetivo
Aumentar ligeramente el contraste/visual weight de los controles de retroceso inmediato en:
1. **Actividades** → flecha + texto "Calendario".
2. **Sitios útiles** → flecha + texto "Volver" (selector de ubicación y pantalla de resultados).

## Cambios planificados

### `src/pages/trips/Schedule.tsx`
- En el `Button` de retroceso del detalle de día (línea ~294):
  - Reemplazar `text-muted-foreground` por `text-foreground/80`.
  - Mantener `hover:text-foreground`, tamaño, posición, icono y texto.

### `src/pages/trips/UsefulPlacesCategory.tsx`
- En el `<button>` de retroceso del selector de ubicación (línea ~262):
  - Reemplazar `text-muted-foreground` por `text-foreground/80`.
  - Mantener `hover:text-foreground` y el resto de clases.
- En el `<button>` de retroceso de resultados (línea ~312):
  - Aplicar el mismo cambio.

## Qué no se toca
- Ninguna otra pantalla, componente, icono, texto o lógica de navegación.
- No se modifica la flecha principal que vuelve a la página principal del viaje.
- No se alteran tamaños, posiciones, layouts, funcionalidad, seguridad, backend ni traducciones.

## Validación
- Revisar visualmente en preview móvil y escritorio que los botones sean más legibles.
- Verificar que el resto del diseño permanece idéntico.
- Ejecutar `npx tsgo --noEmit` para confirmar que no hay errores de tipo.