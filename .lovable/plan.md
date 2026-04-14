

## Añadir botón de galería en el formulario de gastos

### Cambio

En la pantalla de añadir/editar gasto, junto al botón de cámara ("Hacer foto"), añadir un segundo botón con icono de galería (`ImageIcon`) que permita seleccionar una imagen existente del dispositivo.

### Implementación

**Fichero**: `src/pages/trips/Expenses.tsx`

1. Añadir un segundo `<input type="file">` oculto con `accept="image/*"` pero **sin** el atributo `capture` (esto abre la galería del móvil en lugar de la cámara).
2. Añadir un nuevo `ref` (`galleryInputRef`) para ese input.
3. Donde ahora hay un solo botón de cámara, mostrar dos botones lado a lado:
   - **Cámara** (icono `Camera`) → abre el input con `capture="environment"` (comportamiento actual)
   - **Galería** (icono `ImageIcon`) → abre el input sin `capture` (abre selector de archivos/galería)
4. Ambos inputs comparten el mismo `handleFileChange`, por lo que el resto de la lógica no cambia.

### Resultado visual

Cuando no hay imagen adjunta, se verán dos botones:
```text
[ 📷 Hacer foto ]  [ 🖼 Galería ]
```

No se toca ningún otro fichero ni funcionalidad.

