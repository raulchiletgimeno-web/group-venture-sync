

## Añadir soporte de vídeo en la galería de Fotos

### Resumen

Añadir un tercer botón de "Vídeo" junto a los de Galería y Cámara. Los vídeos se suben al mismo bucket y tabla, diferenciados por una nueva columna `media_type`. En la galería se muestran con un icono de play superpuesto, y en el visor fullscreen se reproducen con un `<video>` nativo.

### 1. Migración de base de datos

Añadir columna `media_type` a `trip_photos`:

```sql
ALTER TABLE public.trip_photos
  ADD COLUMN media_type text NOT NULL DEFAULT 'image';
```

Esto no afecta a los registros existentes (todos quedan como `'image'`). No se necesitan cambios en RLS ni en storage (el bucket `trip-photos` ya es público y acepta cualquier tipo de archivo).

### 2. Traducciones (`src/i18n/translations.ts`)

Añadir las siguientes claves en todos los idiomas:

- `recordVideoBtn` — tooltip del botón de vídeo
- `videoUploaded` — toast de éxito
- `errorUploadingVideo` — toast de error

### 3. Cambios en `src/pages/trips/Photos.tsx`

**Botón de vídeo**:
- Nuevo `<input ref={videoInputRef} type="file" accept="video/*" capture="environment">` oculto
- Nuevo `<Button>` con icono `Video` de lucide-react junto a los existentes

**Upload**:
- Reutilizar `handleFileUpload` detectando si el archivo es vídeo (`file.type.startsWith('video/')`)
- Si es vídeo, insertar con `media_type: 'video'`; si no, `media_type: 'image'`

**Grid de miniaturas**:
- Función helper `isVideo(photo)` que comprueba `photo.media_type === 'video'` o la extensión del `file_path` (.mp4, .mov, .webm)
- Para vídeos: usar `<video>` con atributos `muted preload="metadata"` como miniatura, con un icono de play semitransparente superpuesto (icono `Play` de lucide, centrado, fondo negro/50%)
- Para fotos: mantener `<img>` actual sin cambios

**Visor fullscreen**:
- Si el elemento actual es vídeo: renderizar `<video controls autoPlay>` en lugar de `<img>`
- Si es foto: mantener `<img>` actual
- El swipe y la navegación por flechas/teclado siguen funcionando exactamente igual

### Ficheros afectados

| Fichero | Cambio |
|---------|--------|
| Migración SQL | Nueva columna `media_type` en `trip_photos` |
| `src/i18n/translations.ts` | 3 nuevas claves de traducción (7 idiomas) |
| `src/pages/trips/Photos.tsx` | Botón de vídeo, upload dual, miniatura con play, visor con `<video>` |

No se toca ningún otro fichero ni funcionalidad de la app.

