## Problema

El bucket `trip-photos` está marcado como `public = true` y tiene la policy `"Public can view trip photos" USING (bucket_id = 'trip-photos')` en `storage.objects`. Consecuencia: cualquier persona en Internet con la URL `…/storage/v1/object/public/trip-photos/<tripId>/…` ve la foto sin autenticarse ni ser miembro del viaje. En el código, todos los puntos generan URLs públicas vía `getPublicUrl()`:

- `src/pages/trips/Photos.tsx` (galería, viewer, miniaturas)
- `src/pages/trips/Chat.tsx` (imágenes, audios y ficheros del chat)
- `src/pages/trips/Accommodation.tsx` (booking files)
- `src/pages/trips/Expenses.tsx` (receipts)
- `src/components/TicketManager.tsx` (tickets de transporte)
- `src/components/ActivityTicketManager.tsx` (tickets de actividades)

Todas las rutas suben con el patrón `${tripId}/...`, así que podemos validar pertenencia con `(storage.foldername(name))[1]::uuid` + `is_trip_member()`.

## Cambios

### 1. Migración SQL (única tabla tocada: `storage.objects` + `storage.buckets`)

```sql
-- Privatizar el bucket
UPDATE storage.buckets SET public = false WHERE id = 'trip-photos';

-- Quitar la policy permisiva
DROP POLICY IF EXISTS "Public can view trip photos" ON storage.objects;

-- Solo miembros aprobados del viaje pueden leer el objeto
CREATE POLICY "Trip members can view trip photos"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'trip-photos'
  AND public.is_trip_member( (storage.foldername(name))[1]::uuid )
);
```

Efecto inmediato: las URLs públicas (`…/object/public/trip-photos/…`) dejan de servir contenido (404/403). Cualquier enlace público antiguo queda invalidado de raíz. Sólo funciona el acceso autenticado vía Signed URLs o la API `download` con sesión.

Las policies de INSERT y DELETE existentes (que ya filtran por `is_trip_member` y `is_trip_creator`) se mantienen sin tocar.

### 2. Helper de Signed URLs en cliente (1 fichero nuevo, sin cambios de UI)

`src/lib/signedUrl.ts`: caché en memoria por `file_path` con expiración. Devuelve URL firmada válida 1 hora; refresca si quedan <5 minutos. Una sola entrada por path.

```ts
export async function getSignedUrl(path: string, expiresIn = 3600): Promise<string>
export async function getSignedUrls(paths: string[], expiresIn = 3600): Promise<Record<string,string>>
```

Internamente usa `supabase.storage.from('trip-photos').createSignedUrl(...)` o `createSignedUrls(...)` en lote.

### 3. Componente `<SignedImg>` (1 fichero nuevo)

`src/components/SignedImg.tsx`: wrapper sobre `<img>` que recibe `path` en lugar de `src`, resuelve la signed URL vía el helper y la pinta. Acepta `className`, `onClick`, `loading`, `alt`, etc. para no tocar diseño. Maneja loading skeleton igual que el render actual cuando aplica.

### 4. Sustitución mecánica de `getPublicUrl` por equivalente firmado

Sólo se cambia la fuente de la URL, no la UI ni la lógica:

| Archivo | Cambio |
|---|---|
| `src/pages/trips/Photos.tsx` | Prefetch en lote de signed URLs al cargar `photos` (`getSignedUrls(paths)`), guardar en `useState<Record<path,url>>` y usar ese mapa en miniaturas y viewer en lugar de `getPublicUrl`. Para el botón "abrir/compartir" se llama `getSignedUrl(path)` on-demand. |
| `src/pages/trips/Chat.tsx` | `getFileUrl` pasa a ser async vía helper. Las imágenes/audio del chat se renderizan con `<SignedImg>` o resolviendo la URL en un pequeño hook local. |
| `src/pages/trips/Accommodation.tsx` | El enlace al booking file llama `getSignedUrl(path)` al hacer click (no se renderiza embebido). |
| `src/pages/trips/Expenses.tsx` | El enlace al receipt llama `getSignedUrl(path)` al hacer click. |
| `src/components/TicketManager.tsx` | Igual: signed URL on-demand. |
| `src/components/ActivityTicketManager.tsx` | Igual: signed URL on-demand. |

No se cambia: layout, estilos, navegación, animaciones, lazy loading, swiper del viewer, ni copy. La sustitución es 1:1 a nivel de origen de URL.

### 5. Nada más se toca

No se modifica: diseño, navegación, chat (lógica), gastos (lógica), emails, otras policies, otras tablas, edge functions, i18n, ni el resto de findings del escáner.

## Validación

1. **No autenticado**: abrir directamente `https://<proyecto>.supabase.co/storage/v1/object/public/trip-photos/<tripId>/<file>` → 400/404. Listar el bucket sin auth → vacío.
2. **Autenticado no miembro**: intentar `createSignedUrl` desde el cliente con un `tripId` ajeno → error (RLS rechaza). Intentar abrir una signed URL no propia → 403 al expirar / no obtenible.
3. **Miembro aprobado**: la galería, el chat, los recibos de gastos, los booking files y los tickets cargan exactamente igual que ahora.
4. **Smoke test en preview**: subir foto en galería, abrir viewer, abrir recibo, abrir ticket, enviar imagen al chat — todo visible.
5. Re-ejecutar el escáner: el finding `PUBLIC_STORAGE_EXPOSURE` y `SUPA_public_bucket_allows_listing` deben desaparecer.

## Resumen

- 1 migración: bucket privado + policy `SELECT` restringida a `is_trip_member`.
- 2 ficheros nuevos: helper `signedUrl.ts` y componente `SignedImg.tsx`.
- 6 ficheros front modificados solo para cambiar el origen de la URL (de pública a firmada). Cero cambios funcionales, visuales o de negocio.
- URLs públicas antiguas invalidadas automáticamente al privatizar el bucket.