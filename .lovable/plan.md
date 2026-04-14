

## Aumento global de tipografía en YORMIT

### Enfoque

La forma más segura y quirúrgica de aumentar todos los textos sin tocar ningún componente individual es subir el `font-size` base del `<html>` element. Tailwind y la mayoría de estilos usan `rem`, por lo que todo escala proporcionalmente: títulos, subtítulos, botones, etiquetas, textos auxiliares — manteniendo la jerarquía exacta.

### Cambio único

**Fichero**: `src/index.css`

Añadir en el bloque `@layer base` una regla para `html` que aumente el font-size base de 16px (default del navegador) a **17px**. Esto supone un ~6% de aumento — suficiente para mejorar legibilidad sin desajustar nada.

```css
@layer base {
  html {
    font-size: 17px;
  }
  * {
    @apply border-border;
  }
  /* ... resto sin cambios */
}
```

### Por qué funciona

- Todos los valores `rem` en Tailwind (`text-sm`, `text-base`, `text-lg`, `p-4`, `gap-2`, etc.) se calculan sobre el font-size raíz
- La jerarquía visual se mantiene intacta (un `text-lg` sigue siendo más grande que un `text-sm`)
- Márgenes, paddings y espaciados en `rem` también escalan proporcionalmente, evitando desajustes
- Los valores en `px` (como bordes y sombras) no cambian, lo cual es correcto

### Ficheros afectados

| Fichero | Cambio |
|---------|--------|
| `src/index.css` | 1 línea añadida: `font-size: 17px` en `html` |

No se toca ningún componente, página, lógica ni estructura.

