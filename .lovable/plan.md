

## Plan: Añadir idioma alemán (Deutsch)

### Cambios

**1. `src/i18n/translations.ts`**

- Ampliar el tipo `Language`: `"es" | "en" | "fr" | "pt" | "it" | "zh" | "de"`
- Añadir en `languageFlags`: `de: "https://flagsapi.com/DE/flat/64.png"`
- Añadir en `languageNames`: `de: "Deutsch"`
- Añadir en `getLocale`: `de: "de-DE"`
- Añadir bloque completo `de: { ... }` con todas las ~290 claves traducidas al alemán.

**2. `src/pages/Index.tsx`**

- Añadir `"de"` al array `flagLanguages`:
  ```tsx
  const flagLanguages: Language[] = ["es", "en", "fr", "pt", "it", "zh", "de"];
  ```

Mismo patrón exacto que se usó para añadir el chino. No requiere cambios en base de datos.

