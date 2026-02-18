

## Cambiar color de texto del boton "Unirse"

Cambiar el color del texto del boton "Unirse" en el hero de `src/pages/Index.tsx` de `text-primary-foreground` a `text-foreground` (negro) para que sea legible sobre el fondo semi-transparente.

### Cambio

**Archivo:** `src/pages/Index.tsx` (linea 116)

Reemplazar:
```
className="border-primary-foreground/60 text-primary-foreground bg-primary-foreground/15 hover:bg-primary-foreground/25 font-semibold backdrop-blur-sm"
```

Por:
```
className="border-primary-foreground/60 text-foreground bg-primary-foreground/15 hover:bg-primary-foreground/25 font-semibold backdrop-blur-sm"
```

Solo se cambia `text-primary-foreground` a `text-foreground` para que el texto se muestre en negro.

