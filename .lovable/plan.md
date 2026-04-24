
## Optimizar la velocidad de carga de "Sitios útiles"

Mantengo la fuente actual (OpenStreetMap / Overpass, gratis) y la sección tal cual. Solo toco la lógica de red, caché y la sensación visual mientras se cargan los resultados. **No se modifica ninguna otra parte de la app.**

---

### Por qué ahora va lento

Tras revisar el código actual:

1. **Las búsquedas por radio son secuenciales.** Pedimos 800 m, esperamos respuesta; si hay pocos, pedimos 2 000 m, esperamos; si aún hay pocos, pedimos 4 000 m. En móvil son 1–3 s por petición → hasta 9 s solo de Overpass.
2. **El failover entre endpoints también es secuencial.** Si `overpass-api.de` está lento, esperamos hasta 20 s antes de probar el segundo endpoint.
3. **Cero caché.** Si el usuario entra a "Cafés y bares" → vuelve atrás → entra a "Restaurantes" → vuelve a "Cafés y bares" en 1 minuto, repetimos toda la red.
4. **El mapa Leaflet** se monta y descarga tiles **después** de tener resultados, retrasando lo que el usuario percibe como "ya cargó".
5. **Spinner plano** — sin skeleton, la espera se siente más larga de lo que es.
6. **Geolocalización**: el fallback de alta precisión añade hasta 10 s extra al timeout inicial de 7 s.
7. **Geocoding del alojamiento**: 4 intentos en cascada totalmente secuenciales.

---

### Cambios (archivos `src/lib/usefulPlaces.ts` y `src/pages/trips/UsefulPlacesCategory.tsx`)

#### 1. Race entre endpoints Overpass (en lugar de failover secuencial)
- Lanzar la consulta a **los dos endpoints a la vez** con `Promise.any`.
- Gana el primero que responda OK. El otro se aborta.
- Timeout por petición bajado de **20 s → 8 s** (si no responde en 8 s, casi seguro que está caído).
- Resultado típico: latencia ≈ la del endpoint más rápido en ese momento, no la del más lento.

#### 2. Búsqueda por radio en paralelo con corte temprano
- En vez de `800 → 2000 → 4000` secuencial, lanzar las 3 a la vez.
- En cuanto la de **800 m** llega y tiene ≥ 25 resultados utilizables, **renderizamos ya** y descartamos las otras.
- Si 800 m no llega a 25, esperamos a la de 2 000 m; etc.
- Caso típico zona urbana: el usuario ve resultados en cuanto responde la consulta más pequeña (la más rápida de procesar en Overpass).

#### 3. Caché en memoria (TTL 10 min)
- Clave: `categoría + lat redondeada a 3 decimales + lon redondeada a 3 decimales` (~110 m de granularidad).
- Si el usuario vuelve a la misma categoría / zona en menos de 10 min → **resultados instantáneos, 0 red**.
- Caché también para geocoding del alojamiento (clave = string de dirección normalizada).
- Es solo memoria de la sesión (Map en módulo). Sin localStorage, sin persistencia, sin riesgos.

#### 4. Geolocalización más rápida y menos bloqueante
- Si tenemos una posición cacheada de los últimos 5 min, usarla **inmediatamente** y refrescar en segundo plano.
- Bajar el fallback de alta precisión: timeout 6 s en vez de 10 s.
- Total worst-case: 7 s + 6 s = 13 s → 7 s + 6 s, pero con caché de posición casi siempre será **0 ms**.

#### 5. Geocoding del alojamiento en paralelo
- Lanzar Nominatim (dirección completa), Nominatim (dirección normalizada) y Open-Meteo (ciudad) **a la vez** con `Promise.any`.
- Quien responda primero con coordenadas válidas gana.
- Caché en memoria del resultado por dirección.

#### 6. Skeleton UI elegante (percepción de velocidad)
- Sustituir el spinner actual por un **skeleton premium**:
  - Una caja con altura de 240 px (placeholder del mapa) con shimmer suave.
  - 6 filas de tarjetas de resultado en gris muy claro con shimmer.
- Reusa `<Skeleton>` de shadcn que ya está en el proyecto (no añade dependencias).
- El usuario ve **estructura inmediata** en vez de un spinner vacío.

#### 7. Render incremental: mapa visible antes que la lista
- En cuanto tenemos `center` (geolocalización resuelta) montamos ya el `<MapContainer>` con el marcador del centro, **sin esperar** a Overpass.
- Cuando llegan los lugares, se añaden los marcadores encima.
- El usuario ve "ya está sucediendo algo" 1–2 s antes.

#### 8. Evitar re-renders innecesarios
- Memoizar la lista de markers con `useMemo` sobre `places`.
- Memoizar `googleMapsUrlFor` por lugar (evita recalcular URL en cada render).
- Mantener el `key` del `MapContainer` solo cambia cuando cambian las coords del centro (ya estaba bien).

---

### Tabla resumen

| Problema actual | Optimización |
|---|---|
| Endpoints Overpass secuenciales (hasta 20 s de espera) | `Promise.any` entre los 2 endpoints, timeout 8 s |
| Radios 800/2000/4000 secuenciales (hasta 9 s) | 3 radios en paralelo, corte en cuanto el más pequeño cumple |
| Sin caché → red repetida cada visita | Caché en memoria 10 min por (categoría, zona) |
| Geolocalización lenta y repetida | Posición cacheada 5 min, fallback más corto |
| Geocoding alojamiento en cascada (hasta 4 saltos) | 3 estrategias en paralelo con `Promise.any` |
| Spinner vacío durante 3-9 s | Skeleton con shimmer (mapa + 6 tarjetas) |
| Mapa aparece solo al final | Mapa visible en cuanto hay coordenadas |
| Re-renders / recálculo de URLs | `useMemo` para markers y URLs |

---

### Lo que NO se toca

- Fuente de datos: sigue siendo OpenStreetMap / Overpass, **0 € de coste**.
- Ningún otro archivo de la app.
- UI / diseño / estructura visual de la sección (solo se añade el skeleton durante la carga).
- Lógica de filtros por categoría, ordenación por distancia, fallbacks de nombre, etc. (se mantiene tal cual).
- Service worker, autenticación, traducciones, mapa, push, etc.

---

### Validación posterior

1. **Cerca de mi ubicación** en zona urbana: resultados visibles en < 2 s en la mayoría de los casos (red 4G normal).
2. **Volver a entrar** a la misma categoría en < 10 min: resultados **instantáneos** (caché).
3. **Cerca del alojamiento** en "Fin de semana en Madrid": geocoding más rápido, primera vez 1-2 s; segunda vez instantáneo.
4. Durante la carga: skeleton elegante en vez de spinner vacío.
5. El resto de la app (chat, fotos, gastos, alojamiento, transporte, push, etc.) sigue exactamente igual.
