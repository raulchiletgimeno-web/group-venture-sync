
## Plan: Calendario interactivo en la pestaña de Actividades

### Resumen
Al abrir la pestaña de Actividades, en lugar de mostrar directamente la lista de actividades, se mostrara primero un calendario visual con los dias del viaje. Al pulsar en un dia concreto, se desplegaran las actividades programadas para ese dia, ordenadas cronologicamente. Los dias con actividades tendran un indicador visual (punto).

### Cambios necesarios

**Archivo: `src/pages/trips/Schedule.tsx`**

1. **Obtener las fechas del viaje**: Hacer una consulta adicional a la tabla `trips` para obtener `start_date` y `end_date` del viaje actual.

2. **Nuevo estado `selectedDate`**: Inicialmente `null`. Controla si se muestra el calendario (cuando es `null`) o las actividades del dia seleccionado.

3. **Vista calendario (estado inicial)**: 
   - Mostrar el titulo "Actividades" con el boton "Añadir" del creador.
   - Renderizar un calendario usando el componente `Calendar` (DayPicker) ya existente en el proyecto.
   - Configurar el calendario para que solo muestre como seleccionables los dias dentro del rango `start_date` - `end_date` del viaje (los demas dias estaran deshabilitados).
   - Los dias que tengan actividades programadas mostraran un punto/indicador visual debajo del numero.
   - Al hacer clic en un dia, se establece `selectedDate` a esa fecha.

4. **Vista actividades del dia (cuando `selectedDate` tiene valor)**:
   - Mostrar un boton "Volver al calendario" para regresar a la vista de calendario.
   - Mostrar la fecha seleccionada como encabezado.
   - Listar las actividades de ese dia ordenadas por hora, con el mismo formato de tarjeta actual.
   - El boton "Añadir" (para creadores) pre-rellenara el campo de fecha con el dia seleccionado.

### Detalle tecnico

```text
+---------------------------+
|  Actividades       [+ Add]|
+---------------------------+
|                           |
|   <<  Abril/Mayo 2025  >> |
|  Lu Ma Mi Ju Vi Sa Do     |
|           ...              |
|  [30] 1  2  3             |
|   .       .               |  <-- puntos = dias con actividades
|                           |
+---------------------------+
        |  click en "30"
        v
+---------------------------+
|  <- Calendario     [+ Add]|
|  Mie, 30 Abr              |
+---------------------------+
|  09:00 Visita al Prado    |
|  14:00 Comida en Botin    |
+---------------------------+
```

**Componentes y dependencias usados:**
- `Calendar` de `@/components/ui/calendar` (ya existe, usa `react-day-picker`)
- `date-fns` (ya instalado) para generar el rango de dias y comparaciones
- `eachDayOfInterval`, `isSameDay`, `parseISO` de `date-fns`

**Estilos del calendario:**
- Se usara CSS personalizado (via `classNames` o `modifiers` de DayPicker) para mostrar un punto debajo de los dias que tengan actividades.
- Los dias fuera del rango del viaje se deshabilitaran con la prop `disabled`.

**Flujo de datos:**
1. Al montar el componente, se obtienen en paralelo: datos del viaje (fechas) y actividades.
2. Se calcula un `Set` de fechas con actividades para marcar los dias en el calendario.
3. Al seleccionar un dia, se filtran las actividades de `items` para ese dia.

**Pre-rellenado de fecha en formulario:**
- Cuando `selectedDate` esta activo y el creador pulsa "Añadir", el campo `date` del formulario se pre-rellena con la fecha seleccionada (formato `YYYY-MM-DD`).
