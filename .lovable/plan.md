

## Eliminar iconos duplicados del menu inferior

Se eliminaran 5 elementos del menu de navegacion inferior (`TripBottomNav.tsx`) que ya aparecen en la cuadricula del dashboard:

- Transporte
- Alojamiento
- Gastos
- Fotos
- Chat

Se mantendran **Tiempo** y **Horario** en el menu inferior.

### Detalle tecnico

**Archivo:** `src/components/TripBottomNav.tsx`

- Reducir el array `navItems` de 7 elementos a solo 2:
  - `{ path: "weather", label: "Tiempo", icon: CloudSun }`
  - `{ path: "schedule", label: "Horario", icon: CalendarDays }`
- Eliminar los imports de `Plane`, `Hotel`, `Receipt`, `Camera` y `MessageCircle` que ya no se usaran.

