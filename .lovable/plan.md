

## Mostrar/ocultar contraseña en el formulario de autenticacion

Se agregara un boton con icono de ojo dentro del campo de contraseña para alternar entre ver el texto plano y los puntos ocultos.

### Cambios

**Archivo:** `src/pages/Auth.tsx`

1. Importar el icono `Eye` y `EyeOff` de `lucide-react`
2. Agregar un estado `showPassword` (boolean, inicializado en `false`)
3. En el input de contraseña:
   - Cambiar `type` de `"password"` fijo a `showPassword ? "text" : "password"`
   - Agregar un boton a la derecha del input con el icono `Eye` o `EyeOff` segun el estado
   - Ajustar padding derecho del input (`pr-10`) para dejar espacio al boton

### Detalles tecnicos

- El boton sera de tipo `button` (no `submit`) para evitar enviar el formulario
- Se usara posicionamiento absoluto (`absolute right-3 top-1/2 -translate-y-1/2`) igual que el icono izquierdo
- El icono cambiara entre `Eye` (cuando la contraseña esta oculta) y `EyeOff` (cuando esta visible)

