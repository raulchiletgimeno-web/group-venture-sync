## Mejorar la cantidad de resultados en "Sitios útiles"

### Diagnóstico real del problema

YORMIT usa **OpenStreetMap (Overpass API)** como fuente. No es la fuente la que falla — Madrid está extremadamente bien mapeado en OSM, con miles de cafés y bares. El problema está en **cómo se está consultando y filtrando**:

**Causa 1 — Radio inicial demasiado pequeño en zonas densas.**
Hoy se empieza con 1.500 m y solo se amplía si hay <12 resultados con nombre. Pero si el alojamiento está, por ejemplo, en un barrio menos turístico de Madrid, 1.500 m puede dar 8-10 resultados con nombre y NO se amplía a 3.000 m. Resultado: el usuario ve poco.

**Causa 2 — Se descartan sitios sin `name`.**
En OSM hay muchísimos bares pequeños sin tag `name` (pero con `cuisine`, `brand` o `addr:street`). Hoy se filtran de la lista *y* del conteo para decidir si ampliar el radio. Eso infla artificialmente la sensación de "pocos resultados".

**Causa 3 — Tope de 80 + corte temprano.**
Se corta en cuanto hay 12 con nombre en 1.500 m, aunque a 3.000 m hubiera 200. La lista debería ser claramente más amplia en ciudades.

**Causa 4 — "No hay resultados" se dispara con un solo Overpass error.**
Si Overpass devuelve un timeout (común en horas pico) o el primer endpoint falla a mitad de petición, hoy cae directamente al mensaje `No hay resultados`. El segundo endpoint solo se prueba si el primero responde con HTTP no-OK, NO si lanza excepción de red. Y un solo radio fallido tira la búsqueda entera.

**Causa 5 — Falta categoría intermedia.**
"Cafés y bares" en Madrid debería incluir también `restaurant` con `cuisine=spanish/tapas` (tabernas) que la gente percibe como bares. Pero es un cambio menor.

### Cambios — solo en `src/lib/usefulPlaces.ts`

**1. Estrategia de radios mucho más agresiva**

| Antes | Después |
|---|---|
| Radios `[1500, 3000, 5000]`, corta en cuanto haya ≥12 con nombre | Radios `[800, 2000, 4000]`, **siempre lanza la consulta de 2000 m** (no se corta antes), y solo escala a 4000 m si el resultado total queda <25 |

Razón: en zonas urbanas densas, 2 km es lo natural; saltar a 4 km solo cuando de verdad hace falta. En zonas rurales/periféricas escalará al máximo.

**2. Aceptar sitios sin `name` con fallback razonable**

Si un POI no tiene `name` pero tiene `brand`, `operator` o `cuisine`, se usa eso como nombre. Si no tiene ni `name` ni `brand`, se descarta (igual que hoy). Esto recupera bares de barrio, cadenas pequeñas y supermercados sin nombre puesto.

**3. Tope de la lista de 80 → 120**

La UI ya lista verticalmente con scroll suave; 120 cabe sin afectar rendimiento (cada item es un `<a>` ligero, no hay imágenes).

**4. Robustez de red en Overpass**

- Reintentar **cada radio** en los 2 endpoints (hoy se cambia de endpoint solo en errores HTTP, no en `fetch` rejection / timeout).
- Añadir `AbortController` con timeout de 20 s por petición para no colgar la UI.
- Si los **dos** endpoints fallan en un radio, pasar al siguiente radio en lugar de tirar toda la búsqueda.
- Solo devolver "no hay resultados" si TODOS los radios + TODOS los endpoints han fallado o han devuelto vacío.

**5. Ampliar 2 categorías que se quedan cortas**

| Categoría | Añadir |
|---|---|
| Cafes/bares | `amenity=restaurant` con `cuisine~"spanish\|tapas\|wine_bar"` (tabernas que en España son percibidas como bares) |
| Restaurantes | `amenity=ice_cream` (heladerías, que el usuario espera ver al buscar comida casual) |

El resto de categorías ya quedaron amplias en la iteración anterior.

**6. Mantener el orden por cercanía**

Sin cambios: haversine ascendente, desempate suave por `score` cuando dos sitios están a <75 m.

### Lo que NO se toca

- `UsefulPlacesCategory.tsx`: cero cambios (la lógica de loading, geolocalización y "Cerca del alojamiento" ya quedó bien en la iteración anterior).
- Cero cambios en navegación, traducciones, diseño, BD, RLS, edge functions, otras secciones, Service Worker, `main.tsx`, `UsefulPlaces.tsx`, `TripLayout`.
- Cero cambios en cómo se abre Google Maps al pulsar un sitio.
- Cero cambios en el geocoding del alojamiento.

### Ficheros afectados

| Fichero | Cambio |
|---------|--------|
| `src/lib/usefulPlaces.ts` | Radios 800/2000/4000 con escalado solo si <25 resultados; aceptar `brand`/`operator`/`cuisine` como nombre; tope 80→120; robustez Overpass (retry endpoints en errores de red, `AbortController` 20 s, no abortar búsqueda si un radio falla); +tabernas en cafés/bares; +heladerías en restaurantes |

### Validación posterior

1. Madrid · Cafés y bares · Cerca del alojamiento → confirmar lista mucho más larga (decenas de sitios).
2. Restaurantes en cualquier ciudad → confirmar que aparecen también heladerías y bares de tapas.
3. Confirmar que el primer resultado sigue siendo el más cercano.
4. Forzar (en DevTools) un fallo de red al primer endpoint Overpass → confirmar que los resultados llegan igual desde el segundo.
5. Confirmar que el resto de la app sigue exactamente igual.
