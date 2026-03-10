

## Plan: Optimizar la landing page para vista movil (390px)

### Problemas actuales en movil
- Logo `text-8xl` es demasiado grande para 390px
- Titulo h1 `text-4xl` puede ser excesivo
- Video tiene `ml-20` que lo desplaza fuera de pantalla en movil
- Video y boton estan en columna (`flex-col`) pero el margen izquierdo del video sigue aplicandose
- Secciones con padding excesivo para movil

### Cambios propuestos en `src/pages/Landing.tsx`

1. **Logo**: Cambiar de `text-8xl` a `text-5xl md:text-8xl` para que escale bien en movil
2. **Titulo h1**: Cambiar de `text-4xl md:text-5xl` a `text-3xl md:text-5xl lg:text-6xl`
3. **Subtitulo p**: Cambiar de `text-lg md:text-xl` a `text-base md:text-xl`
4. **Video thumbnail**: Quitar `ml-20` en movil usando `sm:ml-20 ml-0`, y reducir tamaño a `w-56 h-32 sm:w-64 sm:h-36`
5. **Boton CTA**: Hacer ancho completo en movil con `w-full sm:w-auto`
6. **Hero padding**: Reducir padding vertical en movil: `py-12 md:py-28 lg:py-36`
7. **Play icon en video**: Reducir a `w-12 h-12 sm:w-16 sm:h-16`

Todos los cambios se limitan a clases de Tailwind responsive en un solo archivo.

