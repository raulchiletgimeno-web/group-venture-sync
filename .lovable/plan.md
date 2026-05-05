## Problema detectado en "Rioja Bike Race"

El viaje tiene un alojamiento real y bien guardado:

- **Nombre:** Las Columnas Centro
- **Dirección:** `32 Calle Duquesa de la Victoria 4º-1º, 26003 Logroño, España`

He probado esa dirección contra el geocoder de OpenStreetMap (Nominatim) tal como la usa la app hoy y devuelve **cero resultados** por dos motivos combinados:

1. La dirección incluye **planta y puerta** (`4º-1º`) — la normalización actual (`src/lib/usefulPlaces.ts` → `normalizeAddress`) solo elimina `nº/no/n°`, pero deja `4º-1º`, que confunde a Nominatim.
2. El número de portal (`32`) va **al principio** de la calle en vez de al final — Nominatim funciona mucho mejor con `Calle X 32` que con `32 Calle X`.

Cuando la consulta principal falla, el fallback `extractCity` actual toma la última palabra/chunk separado por coma. En esta dirección el último chunk es **`España`** (el país), no la ciudad. Resultado: la app geocodifica al **centroide de España** y busca restaurantes en un radio de 4 km alrededor de un punto en el medio de la península → **cero resultados** → mensaje "no hay sitios". Es exactamente el falso vacío descrito.

He verificado contra Nominatim que con una mínima limpieza (`Calle Duquesa de la Victoria 32, Logroño, España`) la dirección **sí** geocodifica perfectamente al portal exacto en Logroño (42.4648, -2.4400). La búsqueda de Overpass alrededor de ese punto devolverá restaurantes reales sin ningún problema.

## Qué voy a corregir

Toco **un solo archivo de lógica** (`src/lib/usefulPlaces.ts`) y la llamada en `UsefulPlacesCategory.tsx` para añadir un trozo final de validación. **No toco nada de UI, ni el diseño, ni otras secciones, ni Sitios útiles más allá de esta lógica.**

### 1. `normalizeAddress` mucho más robusta

Mejorar la limpieza previa al geocoding para que tolere los formatos reales que escriben los usuarios españoles:

- Eliminar **planta-puerta** (`4º-1º`, `3º A`, `Bajo B`, `Ático`, `Esc. 2`, `Pta 1`, `Piso 4`, `1ºD`, etc.) con un patrón más amplio.
- Eliminar el sufijo `, España` / `, Spain` / `, ES` para no confundir al fallback de ciudad.
- **Reordenar** cuando el número de portal va al principio: `32 Calle Duquesa de la Victoria` → `Calle Duquesa de la Victoria 32`.
- Colapsar comas duplicadas y espacios.

### 2. `extractCity` más fiable

- Ignorar tokens de país (`España`, `Spain`, `ES`, `Portugal`, `France`, `Francia`, `Italia`, `Italy`, etc.) cuando aparecen como último chunk.
- Preferir el chunk **anterior al país** si existe.
- Mantener el patrón actual de "código postal + ciudad" como prioritario (ya funciona en muchos casos).

### 3. Validación de coordenadas tras geocodificar

En `geocodeAddress` añadir un guard final: si el resultado tiene `addresstype === "country"` o `place_rank` muy bajo (centroide de país/región muy grande), **descartarlo** y seguir intentando con las siguientes estrategias. Esto evita el caso "geocodificado al centro de España".

### 4. Búsqueda enriquecida en `handleNearAccommodation`

En `UsefulPlacesCategory.tsx` (función `handleNearAccommodation`):

- Pasar a `geocodeAddress` la versión normalizada y, si falla, intentar también con el formato `name + ", " + city` y `street + ", " + city` por separado.
- Si después de todos los intentos las coordenadas resultantes están a más de ~50 km del **destino del viaje** (`trips.destination`), considerarlo geocodificación errónea y caer al destino del viaje como fallback razonable, mostrando los sitios alrededor del destino.

Esto último es la red de seguridad: si por cualquier motivo la dirección está mal escrita o es ambigua, al menos el usuario verá restaurantes reales del destino del viaje, no un falso "no hay sitios".

### 5. Mensaje de error más honesto

Solo mostrar "no se ha podido localizar el alojamiento" cuando **realmente** falle todo (incluido el fallback al destino del viaje). En cualquier otro caso, devolver resultados.

## Archivos modificados

- `src/lib/usefulPlaces.ts` — `normalizeAddress`, `extractCity`, `geocodeAddress` (validación de resultado)
- `src/pages/trips/UsefulPlacesCategory.tsx` — `handleNearAccommodation` (cadena de intentos + fallback al destino del viaje)

## Lo que NO toco

- Diseño y UI de Sitios útiles
- Resto de la app (chat, fotos, encuestas, transporte, etc.)
- Estructura de la base de datos
- Resto de funciones de `usefulPlaces.ts` (`searchPlaces`, caches, Overpass)

## Validación post-implementación

1. En "Rioja Bike Race" → Sitios útiles → Restaurantes → Cerca del alojamiento debe devolver restaurantes reales en Logroño centro.
2. El mapa debe centrarse en el portal correcto de Calle Duquesa de la Victoria 32.
3. Otros viajes con alojamiento bien escrito siguen funcionando igual.
4. Si un viaje no tiene alojamiento, el mensaje claro de "no hay alojamiento" se mantiene.
