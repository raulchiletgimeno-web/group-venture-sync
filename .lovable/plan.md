

## Plan: Logo YORMIT sobre el badge del hero

### Cambio

En `src/pages/Landing.tsx`, en la sección Hero, añadir el logo YORMIT (texto + icono Luggage) justo encima del span "Organiza viajes en grupo sin caos", usando el color del gradiente hero (azul-verdoso, clase `text-primary` o color inline `hsl(200 80% 50%)`).

### Detalle

Insertar antes del `<span className="inline-block px-3 py-1 rounded-full...">` un elemento con el logo:

```tsx
<span className="text-2xl font-extrabold tracking-wider uppercase inline-flex items-center mb-4" style={{ color: 'hsl(182 50% 62%)' }}>
  Y<Luggage className="h-6 w-6" strokeWidth={2.5} />RMIT
</span>
```

El color será un azul-verdoso coherente con los iconos de funcionalidades (gradient-hero). Se usará un tono intermedio tipo `hsl(182 50% 62%)` para que destaque sobre el fondo oscuro del hero.

