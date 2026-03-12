

## Plan: Transición visual suave entre Hero y Video Section

### Enfoque
Extender el video de fondo del hero para que cubra también la sección de video, creando una única zona visual inmersiva con transición gradual hacia el resto de la página.

### Cambios en `src/pages/Landing.tsx`

1. **Envolver Hero + Video Section en un contenedor común** con el video de fondo compartido:
   - Un `div` padre con `relative overflow-hidden` que contenga ambas secciones
   - El video de fondo y overlay oscuro se mueven al contenedor padre
   - El hero section pierde su propio fondo (pasa a ser `relative` sin video)
   - La video section mantiene su contenido pero con textos en blanco/claro en vez de `text-muted-foreground`

2. **Añadir un degradado de transición** al final del contenedor combinado:
   - Un `div` con gradiente de transparente a `bg-background` en la parte inferior para fundir suavemente con la siguiente sección

3. **Ajustar estilos de texto** de la video section para legibilidad sobre fondo oscuro:
   - Texto descriptivo: `text-white/70` en lugar de `text-muted-foreground`

### Estructura resultante
```text
┌─────────────────────────────┐
│  Video background + overlay │
│  ┌───────────────────────┐  │
│  │   HERO content        │  │
│  └───────────────────────┘  │
│  ┌───────────────────────┐  │
│  │   VIDEO section       │  │
│  │   (texto claro)       │  │
│  └───────────────────────┘  │
│  ▓▓▓ gradient fade ▓▓▓▓▓▓  │
└─────────────────────────────┘
│  PROBLEM section (normal)   │
```

### Publicación
Se publicarán los cambios tras implementar.

