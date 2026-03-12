

## Plan: Rediseño completo de la Landing Page de YORMIT

### Resumen
Reestructurar `src/pages/Landing.tsx` con una nueva arquitectura de secciones orientada a conversión, y actualizar las traducciones en español en `src/i18n/translations.ts` con nuevo copy para las secciones adicionales.

### Archivos a modificar

**1. `src/i18n/translations.ts`** -- Nuevas claves de traducción (solo español inicialmente)

Añadir claves para las nuevas secciones:
- `landingVideoSectionText`: "Descubre en menos de un minuto cómo organizar un viaje en grupo de forma fácil y sin estrés."
- `landingCtaSecondary`: "Ver cómo funciona"
- `landingProblemTitle`: "¿Te suena esto?"
- `landingProblemDesc`: breve intro
- 5 pain points: chats caóticos, reservas dispersas, gastos desordenados, planes difíciles de encontrar, info repartida
- `landingSolutionTitle`: "YORMIT lo resuelve todo"
- `landingSolutionDesc`: breve intro
- `landingHowTitle`: "Así de fácil"
- 3 pasos: crear viaje, organizar, compartir y disfrutar
- Actualizar beneficios: menos caos, menos estrés, más organización, mejor experiencia, ahorro de tiempo (5 en vez de 4)
- Mantener FAQ existentes, actualizar si hace falta

**2. `src/pages/Landing.tsx`** -- Rediseño completo de estructura

Nueva estructura de secciones (en orden):

1. **Hero** -- Más limpio y estratégico
   - Logo YORMIT (ligeramente más pequeño: `text-4xl md:text-6xl`)
   - Titular + subtítulo con mejor jerarquía
   - Dos CTAs lado a lado: "Empezar gratis" (primary) + "Ver cómo funciona" (outline/ghost, hace scroll o abre vídeo)
   - Selector de idiomas movido a esquina superior derecha, más discreto (opacidad más baja, tamaño más pequeño)
   - Eliminar la miniatura de vídeo del hero para mayor limpieza

2. **Vídeo explicativo** -- Sección independiente elegante
   - Texto de apoyo + miniatura de vídeo centrada con play overlay
   - Fondo sutil (muted/30), aspecto premium
   - El CTA "Ver cómo funciona" del hero hace scroll hasta aquí

3. **Bloque del problema** -- Conexión emocional
   - Titular "¿Te suena esto?"
   - Grid/lista de 5 pain points con iconos (MessageSquare, MapPin, Receipt, Search, FolderOpen o similares)
   - Diseño limpio, cards o lista con iconos

4. **Bloque de solución** -- Lo que ofrece YORMIT
   - Reutilizar la sección features actual (8 features) con el titular "YORMIT lo centraliza todo"
   - Mantener el grid de cards con iconos

5. **Cómo funciona** -- 3 pasos
   - Numbered steps (1, 2, 3) con icono, título y descripción breve
   - Diseño horizontal en desktop, vertical en móvil

6. **Beneficios** -- 5 beneficios orientados a resultado
   - Actualizar de 4 a 5 beneficios con nuevo copy enfocado en outcomes
   - Mantener diseño actual de cards

7. **FAQ** -- Mantener estructura actual con Accordion

8. **CTA Final** -- Mantener con gradient-hero

9. **Footer** -- Mantener actual

### Cambios de diseño
- Selector de idiomas: mover a `top-3 right-4`, reducir a `w-5 h-3.5`, opacidad base `opacity-50`
- Logo en hero: reducir de `text-5xl md:text-8xl` a `text-4xl md:text-6xl`
- Eliminar badge "Organiza viajes en grupo sin caos" del hero (redundante con el subtítulo)
- Eliminar sección "App Preview" actual (reemplazada por las nuevas secciones de problema/solución)
- Añadir nuevos iconos de lucide: `MessagesSquare, MapPinOff, ReceiptText, SearchX, FolderOpen, Clock, Smile, ListChecks`

### Publicación
Publicar los cambios tras la implementación.

