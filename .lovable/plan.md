## Multiselección en Sitios > Fotos

Mejora aislada en `src/pages/trips/Photos.tsx`. No se toca ninguna otra parte de la app.

### Cómo entra el usuario en modo selección

- **Pulsación larga** (~500ms) sobre cualquier miniatura activa el modo selección y marca esa foto como seleccionada.
- En desktop, también un botón "Seleccionar" discreto aparecerá en la cabecera junto a los botones de subida (mismo estilo `gradient-hero`, icono `CheckSquare`).
- Salir del modo: botón ✕ en la barra de acciones, o tecla `Escape`, o cuando la selección queda vacía tras deseleccionar todo manualmente con "Cancelar".

### Cómo selecciona varias imágenes

- Una vez en modo selección, **un toque normal** alterna selección/deselección de cada foto (no abre el visor a pantalla completa).
- Cada foto seleccionada muestra:
  - Un **check circular** arriba a la izquierda (icono `Check` dentro de un círculo `bg-primary text-primary-foreground`, mismo lenguaje visual de YORMIT).
  - Un **anillo** `ring-2 ring-primary` y ligero `scale-[0.97]` para feedback premium.
  - Un velo sutil `bg-primary/10` sobre la imagen.
- El botón de borrar individual se oculta mientras está activo el modo selección (evita conflictos).

### Barra de acciones masivas

Barra **fija inferior** (sticky, safe-area iOS), con blur premium (`bg-background/85 backdrop-blur-xl border-t`), animación slide-up. Contiene:

- Izquierda: contador "**N seleccionadas**" + enlace "Seleccionar todo" / "Quitar selección".
- Derecha: tres botones icono (`gradient-hero` para coherencia):
  - **Descargar** (`Download`)
  - **Compartir** (`Share2`)
  - **Copiar** (`Copy`)
- Botón ✕ a la izquierda para salir del modo.

### Acciones disponibles sobre varias fotos

1. **Descargar varias**
   - Si hay 1 sola foto → descarga directa del archivo.
   - Si hay varias → se descargan **una a una** automáticamente (descargas secuenciales con pequeño delay), creando un `<a download>` por archivo. Es la forma fiable sin añadir dependencias (no metemos JSZip para no inflar el bundle).
   - Toast de progreso "Descargando 3/8…" y toast final.

2. **Compartir varias**
   - Si el navegador soporta `navigator.canShare({ files: [...] })` con varios archivos (Android Chrome, iOS Safari recientes) → se comparten todas en un único share sheet nativo.
   - Si solo soporta 1 archivo → fallback: compartir secuencialmente (abre el share sheet por cada foto, con confirmación visual).
   - Si no hay Web Share API → fallback automático a **descargar todas** + toast: "Tu navegador no permite compartir varias a la vez. Se han descargado para que las compartas manualmente."

3. **Copiar varias**
   - El portapapeles del navegador **solo permite 1 imagen a la vez** (limitación real del Clipboard API).
   - Implementación: si hay 1 seleccionada → copia al portapapeles con `ClipboardItem`. Si hay varias → toast informativo: "Solo se puede copiar 1 imagen al portapapeles. Se ha copiado la primera. Usa Descargar o Compartir para varias." y se copia la primera.
   - Esta limitación es de la plataforma, no del código; la UX explica claramente la alternativa.

4. **Vídeos**
   - Descargar y compartir funcionan igual con vídeos.
   - Copiar al portapapeles no aplica a vídeos → si la selección incluye vídeos, el botón Copiar los ignora y muestra toast "Los vídeos no se pueden copiar al portapapeles".

### Detalles técnicos

- Estado nuevo en `Photos.tsx`:
  - `selectionMode: boolean`
  - `selectedIds: Set<string>`
  - `longPressTimer: ref` para detectar pulsación larga sin romper el scroll vertical.
- Long-press: `onPointerDown` arranca timer 500ms; `onPointerMove` con desplazamiento >10px lo cancela (no interfiere con scroll); `onPointerUp` antes de 500ms ejecuta el comportamiento normal (abrir visor o toggle si ya está en modo selección).
- En modo selección, el click en miniatura **no abre el visor**; solo toggle.
- Auto-salida del modo selección tras ejecutar una acción masiva con éxito.
- Las descargas usan `fetch` del `publicUrl` → `blob` → `URL.createObjectURL` → `<a download>` para forzar descarga real (no abrir en nueva pestaña).
- i18n: nuevas claves se añadirán inline en el componente con textos en español (consistente con el resto: la app ya tiene mezcla y los labels críticos vienen de `t`); para no tocar `src/i18n/translations.ts` y respetar "no tocar nada más", los textos de la barra masiva irán **directamente en el componente** (decisión consciente para aislar el cambio).

### Lo que NO se cambia

- Visor a pantalla completa, swipe, navegación, subida, borrado individual, query, RLS, estilos globales: intactos.
- Solo se edita `src/pages/trips/Photos.tsx`.

### Validación post-implementación

1. Long-press en una foto → entra en modo selección, esa foto queda marcada.
2. Tap en otras fotos las añade/quita; contador actualiza.
3. Botón Descargar baja todas las fotos seleccionadas.
4. Botón Compartir abre share nativo con todas (o fallback claro).
5. Botón Copiar copia 1 al portapapeles e informa si hay más.
6. Salir con ✕ vuelve al estado normal; tap normal vuelve a abrir el visor.
7. Subida, borrado individual, swipe en visor: siguen funcionando igual.
