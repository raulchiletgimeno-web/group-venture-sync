

## Mejorar "Sitios útiles": cobertura, búsquedas y velocidad

### Fuente de datos (sin cambios)
Sigue siendo **Overpass API de OpenStreetMap** (gratis, sin API key). No se cambia el proveedor: el problema no es la fuente, es que las consultas eran demasiado estrechas y el flujo móvil hacía esperas innecesarias.

> Por qué no Google Places: requiere API key de pago + cumplir condiciones de uso/atribución comerciales. OSM bien consultado tiene cobertura comparable en las categorías que necesita YORMIT.

### Cambios — solo en `src/lib/usefulPlaces.ts` y `src/pages/trips/UsefulPlacesCategory.tsx`

**1. Búsquedas mucho más amplias por categoría** (`CATEGORY_FILTERS` en `usefulPlaces.ts`)

| Categoría | Antes | Después |
|---|---|---|
| Restaurantes | `amenity=restaurant` | `restaurant` + `fast_food` + `food_court` + `bbq` |
| Cafés y bares | `cafe\|bar\|pub` | `cafe` + `bar` + `pub` + `biergarten` + `nightclub` + `shop=coffee` + `shop=tea` |
| Supermercados | `supermarket\|convenience` | `supermarket` + `convenience` + `bakery` + `butcher` + `greengrocer` + `deli` + `marketplace` |
| Farmacias | `amenity=pharmacy` | `amenity=pharmacy` + `shop=chemist` |
| Hoteles | `hotel\|hostel\|guest_house` | + `motel` + `apartment` + `chalet` |
| Turísticos | igual | igual (ya es amplio) |

Resultado: la consulta a Overpass devuelve muchas más opciones reales sin perder relevancia.

**2. Más resultados visibles**
- Subir el tope final de la lista de **60 → 80** sitios (mantiene fluidez en móvil sin abrumar).
- Mantener `out center tags 150` y radios progresivos 1500 → 3000 → 5000 m.

**3. Orden por cercanía (sin cambios)**
- Sigue ordenándose por **distancia haversine ascendente** al `center` elegido.
- Desempate suave por calidad (`score`) cuando dos sitios están a <75 m.
- Pre-filtro de ruido (`score=0`) solo si quedan ≥15 candidatos de calidad.

**4. Velocidad en móvil**

a) **Quitar el doble `setLoading(true)`** en `UsefulPlacesCategory.tsx`: ahora mismo `handleNearMe` y `handleNearAccommodation` ponen `loading=true`, luego `setCenter` dispara el `useEffect` que vuelve a hacer `setLoading(true)` y lanza la búsqueda. No es lento por la red, pero el spinner parpadea y se sienten dos pasos. Se unifica.

b) **Geolocalización más rápida**: cambiar `enableHighAccuracy: true` a `false` y bajar `maximumAge` aceptable a 5 min. En móvil, `enableHighAccuracy: true` activa GPS real y puede tardar 5-10 s; para "sitios cercanos" basta con la red/IP (precisión ~50-100 m, suficiente para Overpass). Se baja `timeout` a 7 s y, si falla, fallback automático a alta precisión.

c) **Cortar búsqueda en cuanto haya resultados suficientes**: la lógica actual recorre los 3 radios solo si hay <8 resultados con nombre; se baja a `<12` para no saltar a 5 km cuando 1.5 km ya da suficiente — esto reduce el tiempo medio porque la primera consulta (1.5 km) suele bastar.

d) **`scrollWheelZoom` ya está off** (bien, evita reflows). Mantener.

### Lo que NO se toca
- Cero cambios en `UsefulPlaces.tsx`, `TripLayout`, navegación, traducciones, diseño, BD, RLS, edge functions, otras secciones.
- Cero cambios en cómo se abre Google Maps al pulsar un sitio.
- Cero cambios en geocoding del alojamiento.
- Cero cambios en el Service Worker o `main.tsx`.

### Ficheros afectados

| Fichero | Cambio |
|---------|--------|
| `src/lib/usefulPlaces.ts` | Ampliar `CATEGORY_FILTERS` para 5 categorías; tope 60→80; corte de radio progresivo en 12 |
| `src/pages/trips/UsefulPlacesCategory.tsx` | Geolocalización low-accuracy con fallback; eliminar doble loading |

### Validación posterior
1. Cafés y bares → Cerca de mi ubicación → confirmar más resultados que antes (cafés, bares, pubs, coffee shops…).
2. Restaurantes → confirmar que aparecen también fast food y food courts.
3. Supermercados → confirmar que aparecen panaderías, carnicerías, mercados.
4. Confirmar que el primer resultado sigue siendo el más cercano.
5. Confirmar que en móvil el tiempo desde "Cerca de mi ubicación" hasta ver la lista baja notablemente.

