
## Cambios en la pantalla principal

Se realizaran 4 cambios en `src/pages/Index.tsx`:

### 1. Texto del usuario con prefijo "Usuario:"
- Linea 85: Cambiar `{profile.name}` por `Usuario: {profile.name}`
- Cambiar color de `text-primary-foreground/70` a `text-foreground` (negro)

### 2. Icono de logout en negro
- Linea 90: Cambiar `text-primary-foreground/70 hover:text-primary-foreground` a `text-foreground hover:text-foreground`

### 3. Boton "Crear viaje" - ya es blanco (bg-card), se mantiene igual

### 4. Boton "Unirse" - fondo blanco
- Linea 116: Cambiar `bg-primary-foreground/15 hover:bg-primary-foreground/25` a `bg-card hover:bg-card/90` para que tenga el mismo fondo blanco que "Crear viaje"

### Detalle tecnico

**Archivo:** `src/pages/Index.tsx`

- Linea 85: `<span className="text-xs font-medium text-foreground">Usuario: {profile.name}</span>`
- Linea 90: `className="h-8 w-8 text-foreground hover:text-foreground hover:bg-foreground/10"`
- Linea 116: `className="border-primary-foreground/60 text-foreground bg-card hover:bg-card/90 font-semibold shadow-card-hover"`
