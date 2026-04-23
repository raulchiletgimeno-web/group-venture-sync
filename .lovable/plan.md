

## Corrección: detección del alojamiento en "Sitios útiles"

### Qué estaba fallando
La función `geocodeAddress` (en `src/lib/usefulPlaces.ts`) usa **Open-Meteo Geocoding**, que es un geocodificador de **ciudades/localidades**, no de direcciones. Para `"Calle Esparteros nº6 28012 Madrid"` (alojamiento del viaje "Fin de semana en Madrid") devuelve cero resultados → la app interpreta que no hay alojamiento y muestra el mensaje incorrecto.

Verificado en vivo:
- Open-Meteo con esa dirección → `[]`
- Nominatim (OSM) con esa dirección → `Hostal Madrid, 6, Calle de Esparteros, Madrid` ✅

La consulta a la BD y la lectura del campo `address` funcionan correctamente — el alojamiento sí se lee. El fallo es **solo** en la geocodificación.

### Corrección (1 archivo)

**`src/lib/usefulPlaces.ts`** — sustituir la implementación de `geocodeAddress`:

1. **Geocodificador principal**: Nominatim (`https://nominatim.openstreetmap.org/search`) — gratis, sin API key, mismo proveedor OSM que ya usamos para Overpass. Entiende direcciones completas (calle + número + ciudad).
2. **Cabecera obligatoria**: `User-Agent: YORMIT/1.0 (yormit.com)` (requisito de uso de Nominatim).
3. **Estrategia de fallback en cascada** para maximizar tasa de éxito:
   - 1º intento: dirección completa (`address`)
   - 2º intento: dirección normalizada (sin `nº`, `n°`, espacios dobles)
   - 3º intento: nombre del alojamiento + ciudad detectada de la dirección
   - 4º intento (último recurso): Open-Meteo con el nombre/ciudad (comportamiento actual, por compatibilidad)
4. La firma pública `geocodeAddress(query: string): Promise<LatLon | null>` se mantiene igual → cero cambios en `UsefulPlacesCategory.tsx`.

Adicionalmente, en `handleNearAccommodation` (en `UsefulPlacesCategory.tsx`) se pasará la dirección con limpieza ligera (`nº` → ``, colapsar espacios) antes de enviarla al geocoder, para mejorar resultados.

### Lo que NO se toca
- Cero cambios en el diseño, UI, traducciones, otras categorías, otras secciones del viaje, dashboard, edge functions, BD o RLS.
- La lógica de "Cerca de mi ubicación" queda intacta.
- El mensaje "Todavía no hay un alojamiento guardado…" se mantiene **solo** para los casos en que realmente no haya alojamiento o falle todo el cascade de geocoding.

### Ficheros afectados

| Fichero | Cambio |
|---------|--------|
| `src/lib/usefulPlaces.ts` | Reescribir `geocodeAddress` con Nominatim + fallbacks |
| `src/pages/trips/UsefulPlacesCategory.tsx` | Limpieza ligera de la dirección antes de geocodificar (1-2 líneas) |

### Validación posterior
1. Entrar en "Fin de semana en Madrid" → Sitios útiles → Restaurantes → Cerca del alojamiento.
2. Confirmar que se centra en Calle Esparteros 6, Madrid y muestra restaurantes cercanos.
3. Confirmar que un viaje sin alojamiento sigue mostrando el mensaje correcto.

