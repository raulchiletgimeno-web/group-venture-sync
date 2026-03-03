

## Plan: Logo YORMIT consistente y mas grande en la pagina Auth

### Cambio

En `src/pages/Auth.tsx` (lineas 65-68), reemplazar el icono `Compass` + texto "YORMIT" por el mismo logo usado en la pagina principal (Index.tsx): el texto "YORMIT" donde la O es el icono `Luggage`, mas grande y en blanco.

### Detalle

**Archivo: `src/pages/Auth.tsx`**

- Eliminar la importacion de `Compass` (ya no se usa).
- Importar `Luggage` de `lucide-react`.
- Reemplazar el bloque del logo (lineas 65-68) por:
  ```tsx
  <span className="text-4xl font-extrabold tracking-wider text-white uppercase inline-flex items-center">
    Y<Luggage className="h-8 w-8" strokeWidth={2.5} />RMIT
  </span>
  ```
  Esto usa `text-4xl` y `h-8 w-8` para el icono, haciendolo mas grande y prominente que el logo en Index (`text-xl` / `h-5 w-5`), manteniendo el color blanco.

