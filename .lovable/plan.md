

## Mostrar el codigo de invitacion en el dashboard del viaje

Se anadira el codigo de invitacion visible junto al boton "Invitar amigos" en la tarjeta principal del viaje, para que el creador pueda verlo y compartirlo facilmente.

### Cambios

Se modificara el archivo `src/pages/TripDashboard.tsx`:

- Debajo del boton "Invitar amigos", se mostrara el codigo de invitacion en un formato copiable (por ejemplo: `Codigo: ABCD1234`).
- Al pulsar sobre el codigo, se copiara el enlace completo al portapapeles (igual que el boton actual).
- Solo se mostrara para los miembros del viaje (el codigo ya esta disponible en los datos del viaje).

### Resultado visual

El area de invitacion quedara asi:

```
[Invitar amigos]  Codigo: ABCD1234
```

El codigo sera un texto pequeno con estilo de "chip" que al pulsarlo copie el enlace completo y muestre un toast de confirmacion.

### Detalle tecnico

- Se reutiliza el campo `trip.invite_code` que ya se carga en el componente.
- Se anade un elemento clicable junto al boton que ejecute la misma logica de `handleShare` (copiar enlace al portapapeles).
- No se requieren cambios en la base de datos.

