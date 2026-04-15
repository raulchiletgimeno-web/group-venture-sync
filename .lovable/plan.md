

## Corrección de la pantalla inicial de viaje en móvil

### Problema

Con el font-size global a 18px, las 8 secciones del dashboard de viaje no caben en una sola pantalla móvil. Los textos largos ("Alojamiento", "Actividades", "Teléfonos de interés") se salen de sus cápsulas.

### Cambios (solo en `src/pages/TripDashboard.tsx`)

Se ajustarán **únicamente** los estilos de la pantalla inicial de cada viaje. No se toca la tipografía global, ni otras pantallas, ni el interior de las secciones.

1. **Tarjeta de info del viaje**: reducir padding de `p-5` a `p-4` y margen inferior de `mb-6` a `mb-4`
2. **Grid de secciones**: reducir gap de `gap-3` a `gap-2`
3. **Cada sección (link)**: reducir padding de `p-4` a `p-3`, y el contenedor del icono de `p-2.5` a `p-2`
4. **Texto de cada sección**: reducir de `text-sm` a `text-xs` para que textos largos como "Teléfonos de interés" no se salgan de la cápsula
5. **Título "Secciones"**: reducir margen inferior de `mb-3` a `mb-2`

### Ficheros afectados

| Fichero | Qué cambia |
|---------|-----------|
| `src/pages/TripDashboard.tsx` | Paddings, gaps y tamaño de texto solo en la vista de secciones del trip dashboard |

No se toca ningún otro fichero, pantalla ni funcionalidad.

