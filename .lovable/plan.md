# Sitios útiles: "Cerca del alojamiento" debe usar el alojamiento real

## Causa confirmada del error de Viveiro

El alojamiento de Viveiro sí tiene dirección completa: `Camiño da Cruz, 20, 27861 Covas, Lugo`.
Comprobado contra los proveedores actuales:

- Nominatim con la dirección completa devuelve el punto correcto: `43.6763, -7.6146` (Covas, Viveiro), precisión de calle.
- Pero la geocodificación actual lanza **todas** las estrategias en paralelo y se queda con la **primera que responde**, no con la más precisa. Entre esas estrategias está Open-Meteo con solo la ciudad extraída ("Covas"), que devuelve `42.30, -7.55` — un "Covas" del interior, a más de 100 km del hotel. Open-Meteo suele responder antes que Nominatim, así que gana la carrera.
- Además existe una red de seguridad que, si el resultado queda a más de 50 km del destino del viaje, sustituye silenciosamente las coordenadas por las del **destino del viaje**. Eso convierte el error en un centro genérico de la zona en lugar del hotel.

Resumen: no se estaba usando el hotel, sino un resultado difuso ganador por velocidad y/o el fallback silencioso al destino del viaje.

## Qué se va a cambiar

1. **Geocodificación por precisión, no por velocidad** (`src/lib/usefulPlaces.ts`)
   - La búsqueda de una dirección pasa a ser por niveles: primero dirección completa (y variante normalizada) contra Nominatim; solo si eso falla se prueba la ciudad; Open-Meteo queda como último recurso.
   - Se devuelve además el nivel de precisión obtenido, para poder distinguir "hotel localizado" de "solo he localizado un pueblo".
   - No cambia el proveedor (Overpass/OpenStreetMap + Nominatim), ni la caché, ni "Cerca de mi ubicación".

2. **Sin fallback silencioso al destino** (`src/pages/trips/UsefulPlacesCategory.tsx`)
   - Se elimina la sustitución por el destino del viaje y el descarte por distancia >50 km.
   - Si el alojamiento no se puede localizar con precisión suficiente, se muestra el aviso:
     "No hemos podido localizar correctamente este alojamiento. Revisa su dirección para buscar lugares cercanos."
     manteniendo el enlace ya existente para usar la ubicación propia.

3. **Selector cuando hay varios alojamientos** (`src/pages/trips/UsefulPlacesCategory.tsx`)
   - Se leen todos los alojamientos del viaje (ordenados por check-in), no solo el primero.
   - 1 alojamiento → se usa automáticamente, sin preguntar.
   - 2 o más → paso intermedio con el mismo estilo de tarjetas actual: "¿Cerca de qué alojamiento quieres buscar?" con nombre + dirección de cada uno. Al elegir, se busca solo alrededor de ese alojamiento.
   - Igual para las 7 categorías (usan el mismo componente).

4. **Traducciones** (`src/i18n/translations.ts`)
   - Nuevas claves para el título del selector y el mensaje de alojamiento no localizable, en los 7 idiomas.

## Detalles técnicos

- `geocodeAddress` mantiene su firma actual (`Promise<LatLon | null>`); se añade internamente una función por niveles y se expone una variante que también devuelve la precisión, usada solo por Sitios útiles.
- Umbral de precisión aceptable: se rechazan resultados de rango país/estado (ya existente) y, para el alojamiento, se exige que la dirección completa haya resuelto, o que el resultado sea de nivel localidad concreta procedente de Nominatim.
- No se añaden columnas de latitud/longitud a `trip_accommodation`: hoy no existen y añadirlas implicaría tocar Alojamiento. Se geocodifica la dirección guardada y se cachea en memoria como ya se hace.
- Sin cambios en Overpass, radios, orden por proximidad, mapa, permisos ni diseño.

## Archivos a modificar

- `src/lib/usefulPlaces.ts`
- `src/pages/trips/UsefulPlacesCategory.tsx`
- `src/i18n/translations.ts`

## Validación

- Viveiro: Supermercados, Farmacias, Sitios turísticos y Cajeros y bancos centrados en Covas/Viveiro (~43.676, -7.615), no en Lugo ciudad.
- Viaje con un solo alojamiento (Rioja Bike Race): sin selector, resultados en Logroño centro.
- Viaje con varios alojamientos (Tracks Monte Perdido / Málaga): aparece el selector y cada opción devuelve resultados en su propia zona.
- Alojamiento sin dirección (Pirineus 2026): mensaje de aviso, sin resultados de otra ciudad.
