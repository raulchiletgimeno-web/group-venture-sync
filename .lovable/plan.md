## Causa raíz del "Error al enviar"

El insert en `trip_messages` con `type: "location"` está siendo **rechazado por la base de datos**. La tabla tiene un CHECK constraint:

```
trip_messages_type_check  CHECK (type = ANY (ARRAY['text','audio','image']))
```

Es decir: cuando se añadió el tipo `'location'` en el cliente, **nunca se actualizó la restricción de la base de datos**, así que cualquier intento de guardar una ubicación falla con error 23514. La geolocalización del navegador, los permisos, el JSON de coordenadas y RLS funcionan bien — el único punto roto es el constraint. Esto explica por qué falla siempre (no es específico del viaje "Estrasburgo": es global, simplemente lo has probado allí).

## Cambios

### 1. Migración SQL — desbloquear el tipo `location`

Reemplazar el CHECK constraint para incluir `'location'`:

```sql
ALTER TABLE public.trip_messages
  DROP CONSTRAINT IF EXISTS trip_messages_type_check;

ALTER TABLE public.trip_messages
  ADD CONSTRAINT trip_messages_type_check
  CHECK (type = ANY (ARRAY['text','audio','image','location']));
```

Sin tocar RLS, columnas, ni datos existentes. Los 514 mensajes `text`, 24 `image` y 8 `audio` siguen siendo válidos.

### 2. `src/pages/trips/Chat.tsx` — mensajes de error más claros y redacción "Tú"

a) Mejorar el feedback del usuario en `sendLocation` (líneas 225–250) para que el toast no sea genérico cuando se puede detectar la causa real (denegado, timeout, no disponible, error de guardado), usando `error.code` de `GeolocationPositionError` y mostrando `error.message` de Supabase si lo hay:

- `PERMISSION_DENIED` (1) → `t.locationDenied`
- `POSITION_UNAVAILABLE` (2) → `t.locationUnavailable`
- `TIMEOUT` (3) → nuevo `t.locationTimeout`
- error en insert → `t.errorSending` con `description: error.message`

b) Corregir la redacción del mensaje de ubicación cuando el autor es el propio usuario (líneas 413–419). En lugar de `"Tú ha compartido su ubicación actual"`, renderizar dos variantes:

```tsx
{isOwn ? (
  <p className="text-[15px] text-foreground/80 leading-snug">
    {t.youSharedYourLocation}
  </p>
) : (
  <p className="text-[15px] text-foreground/80 leading-snug">
    <span className="font-semibold text-foreground">{getMemberName(msg.user_id)}</span>{" "}
    {t.sharedCurrentLocationBy}
  </p>
)}
```

`sharedCurrentLocationBy` se sigue usando tal cual para terceros (ya está bien traducido en los 7 idiomas). La nueva clave `youSharedYourLocation` es una frase completa porque en muchos idiomas no es un simple "Tú + verbo".

### 3. `src/i18n/translations.ts` — añadir 2 claves en 7 idiomas

- `youSharedYourLocation`:
  - es: "Has compartido tu ubicación actual"
  - en: "You shared your current location"
  - fr: "Vous avez partagé votre position actuelle"
  - pt: "Partilhou a sua localização atual"
  - it: "Hai condiviso la tua posizione attuale"
  - zh: "您分享了当前位置"
  - de: "Du hast deinen aktuellen Standort geteilt"
- `locationTimeout`:
  - es: "No se pudo obtener tu ubicación a tiempo"
  - en: "Couldn't get your location in time"
  - fr: "Impossible d'obtenir votre position à temps"
  - pt: "Não foi possível obter a sua localização a tempo"
  - it: "Impossibile ottenere la tua posizione in tempo"
  - zh: "无法及时获取您的位置"
  - de: "Standort konnte nicht rechtzeitig ermittelt werden"

`sharedCurrentLocationBy`, `sharedLocation`, `viewOnMap`, `locationDenied`, `locationUnavailable` quedan intactos.

## Validación tras implementar

1. En el chat del viaje "Estrasburgo" (o cualquier otro), pulsar **+ → Enviar mi ubicación actual** → se concede el permiso → aparece la burbuja con el mapa, sin "Error al enviar".
2. La burbuja propia muestra **"Has compartido tu ubicación actual"** (no "Tú ha compartido…").
3. Para otros, sigue mostrando **"Raúl Ga. ha compartido su ubicación actual"**.
4. La tarjeta abre Google Maps al pulsarla.
5. Si el usuario deniega permisos → toast claro "Permiso de ubicación denegado". Si tarda más de 10s → "No se pudo obtener tu ubicación a tiempo".

## Lo que NO se toca

Fotos, audio, texto, replies, swipe, scroll, realtime, notificaciones, micrófono, popover de adjuntar, header de burbuja, RLS, otros ficheros del proyecto.
