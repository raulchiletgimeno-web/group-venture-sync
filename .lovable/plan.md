

## Mejorar "Sitios útiles": fuente, cantidad y orden por cercanía

### Fuente de datos (sin cambios — confirmar al usuario)
- **Overpass API de OpenStreetMap** (gratis, sin API key) → POIs filtrados por categoría.
- **Nominatim (OSM)** → geocodifica la dirección del alojamiento.
- **Google Maps** → solo se abre al hacer tap en un sitio (ficha externa con reseñas/fotos).

OSM no expone reseñas/ratings, por eso usamos metadatos (web, teléfono, horario, marca, wikidata) como proxy de fiabilidad.

### Qué se va a cambiar (solo `src/lib/usefulPlaces.ts`)

**1. Más resultados útiles**
- Pedir hasta **150 elementos** a Overpass (`out center tags 150`) en lugar de 80.
- Subir el límite final de la lista de **40 → 60** sitios.
- Mantener el radio progresivo 1500 → 3000 → 5000 m (sigue priorizando lo cercano antes de ampliar).

**2. Orden visualmente claro por cercanía**

Cambiar la lógica de ordenación para que el listado se vea claramente ordenado de más cercano a más lejano, sin perder del todo la señal de calidad:

- **Pre-filtro de calidad** (descarta ruido sin sacrificar cercanía): se eliminan POIs con `score` interno = 0 **solo** cuando hay ≥15 candidatos con score>0 dentro del mismo radio. Si hay pocos resultados, se conservan todos para no dejar al usuario con la lista vacía.
- **Orden principal: distancia ascendente** (haversine real al `center` elegido).
- **Desempate suave por calidad**: cuando dos sitios están a una distancia muy similar (diferencia <75 m), gana el de mayor `score`. Esto preserva la sensación de "ordenado por cercanía" pero, a igualdad de distancia, prioriza el más fiable.

Resultado visual: el #1 es el más cercano al punto de referencia, el #2 el siguiente más cercano, etc. — exactamente lo que pide el usuario.

**3. Eliminar el bonus de proximidad del score**
- El `score` actual incluye un `proximityBonus` que mezcla cercanía con calidad y distorsiona el orden. Se quita: `score` pasa a ser solo señal de calidad (web/tel/horario/marca/wikidata), y la cercanía se gestiona aparte como criterio principal de orden.

### Comportamiento garantizado
- **"Cerca de mi ubicación"** → centro = GPS del usuario → lista ordenada por distancia ascendente al usuario.
- **"Cerca del alojamiento"** → centro = coords del alojamiento geocodificado → lista ordenada por distancia ascendente al alojamiento.
- Mismo orden en el mapa (los markers no cambian de orden visible) y en la lista de abajo.

### Lo que NO se toca
- Cero cambios en `UsefulPlacesCategory.tsx`, `UsefulPlaces.tsx`, navegación, traducciones, diseño, otras secciones del viaje, BD, RLS, edge functions.
- Cero cambios en la lógica de geocoding del alojamiento (la corrección anterior se mantiene).
- Cero cambios en la apertura de la ficha en Google Maps.

### Ficheros afectados

| Fichero | Cambio |
|---------|--------|
| `src/lib/usefulPlaces.ts` | Subir tope a 150/60 resultados, quitar `proximityBonus` del score, reordenar por distancia ascendente con desempate por calidad, pre-filtrar score=0 solo si hay suficiente alternativa |

Un único fichero. Cero impacto fuera de "Sitios útiles".

### Validación posterior
1. Restaurantes → Cerca de mi ubicación → confirmar que el primero es el más próximo al GPS.
2. Restaurantes → Cerca del alojamiento (Madrid) → confirmar que el primero es el más próximo a Calle Esparteros 6.
3. Repetir con otra categoría (Farmacias o Supermercados) para verificar consistencia.

