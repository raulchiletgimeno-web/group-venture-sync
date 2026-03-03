

## Plan: Añadir idioma chino (中文)

### Cambios necesarios

**1. `src/i18n/translations.ts`**

- Ampliar el tipo `Language` para incluir `"zh"`: `export type Language = "es" | "en" | "fr" | "pt" | "it" | "zh";`
- Añadir la bandera de China en `languageFlags`: `zh: "https://flagsapi.com/CN/flat/64.png"`
- Añadir el nombre en `languageNames`: `zh: "中文"`
- Añadir el locale en `getLocale`: `zh: "zh-CN"`
- Añadir un bloque completo `zh: { ... }` en el objeto `translations` con todas las ~290 claves traducidas al chino mandarín simplificado.

**2. `src/pages/Index.tsx`**

- Añadir `"zh"` al array `flagLanguages` (después de `"it"`):
  ```tsx
  const flagLanguages: Language[] = ["es", "en", "fr", "pt", "it", "zh"];
  ```

### Notas

- El bloque de traducciones chino contendrá todas las claves existentes traducidas al chino mandarín simplificado.
- La bandera usará el código `CN` de flagsapi.
- No se requieren cambios en base de datos ni en otros componentes; el sistema de idiomas ya es extensible.

