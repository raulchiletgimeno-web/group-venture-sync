

## Reemplazar emojis de banderas por imagenes reales

Los emojis de banderas (🇬🇧🇫🇷🇵🇹🇮🇹) no se renderizan correctamente en algunos sistemas operativos como Windows, donde aparecen como texto "GB", "FR", etc. La solucion es usar imagenes SVG de banderas reales.

### Cambios:

1. **`src/i18n/translations.ts`**: Cambiar `languageFlags` de emojis (string) a URLs de imagenes SVG usando el servicio gratuito flagcdn.com (o similar).

2. **`src/pages/Index.tsx`**: Reemplazar el texto `{languageFlags[lang]}` por un elemento `<img>` que muestre la bandera como imagen, con un tamano adecuado (~28x20px) y bordes redondeados.

### Detalle tecnico:

- Se usaran imagenes SVG del servicio `https://flagcdn.com/` que es gratuito y fiable
  - GB: `https://flagcdn.com/w40/gb.svg`
  - FR: `https://flagcdn.com/w40/fr.svg`
  - PT: `https://flagcdn.com/w40/pt.svg`
  - IT: `https://flagcdn.com/w40/it.svg`
- El tipo de `languageFlags` cambiara de `Record<Language, string>` (emoji) a `Record<Language, string>` (URL), manteniendo compatibilidad
- Las imagenes se mostraran con `<img>` con clases de Tailwind para tamano y estilo visual

