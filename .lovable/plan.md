

## Plan: Banderas de idioma en Landing + traducción completa

### Resumen
Añadir un selector de banderas en la esquina superior derecha de la Landing page y hacer que todo el contenido de la página se traduzca al idioma seleccionado.

### Cambios necesarios

**1. Añadir traducciones de la Landing en `src/i18n/translations.ts`**
- Añadir ~25 nuevas claves para todo el contenido de la Landing: título hero, subtítulo, botones, secciones de features (8), benefits (4), FAQs (5), sección CTA, footer, y textos de las previews.
- Traducir a los 7 idiomas (es, en, fr, pt, it, zh, de).

**2. Modificar `src/contexts/LanguageContext.tsx`**
- Actualmente depende de `useAuth` y no funciona sin usuario logueado (siempre usa "es" sin auth).
- Añadir persistencia en `localStorage` para usuarios no autenticados, de modo que la Landing pueda usar el idioma seleccionado.

**3. Modificar `src/pages/Landing.tsx`**
- Importar `useLanguage`, `languageFlags` y `Language`.
- Añadir las banderas en la esquina superior derecha (posición absoluta/fixed sobre el hero), usando las mismas imágenes de banderas que ya existen en el Dashboard (w-6 h-4, pequeñitas).
- Reemplazar todos los textos hardcodeados por claves de traducción `t.landingXxx`.
- Convertir los arrays `features`, `benefits`, `faqs` y previews en funciones que reciban `t` para devolver el contenido traducido.

### Estimación
- ~200 líneas nuevas de traducciones (25 claves × 7 idiomas + claves tipo).
- ~30 líneas modificadas en Landing.tsx.
- ~5 líneas en LanguageContext.tsx para localStorage fallback.

