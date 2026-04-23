

## Sustituir "Teléfonos de interés" por "Sitios útiles"

### Resumen del cambio
Reemplazo de la sección actual `Teléfonos de interés` (`/trip/:id/phones`) por una nueva sección `Sitios útiles` (`/trip/:id/places`) con 6 categorías, selector intermedio (mi ubicación / alojamiento) y mapa de resultados filtrados, ordenados por calidad y cercanía.

**Decisión clave de fuente de datos**: usar **Overpass API de OpenStreetMap** (gratis, sin API key, sin facturación, ya alineado con la filosofía del proyecto que usa Open-Meteo). Para la ficha de cada lugar, abrir Google Maps en una nueva pestaña vía URL pública (sin API key) — así el usuario ve reseñas reales, fotos y "cómo llegar" con la mejor experiencia posible y sin coste.

### Flujo de la nueva sección

```text
[Trip Dashboard]
        ↓ tap "Sitios útiles"
┌──────────────────────────┐
│  🍽️ Restaurantes        │
│  ☕ Cafés y bares        │
│  🛒 Supermercados        │
│  💊 Farmacias            │
│  🏨 Hoteles              │
│  🗺️ Sitios turísticos    │
└──────────────────────────┘
        ↓ tap categoría
┌──────────────────────────┐
│  📍 Cerca de mi ubicación│
│  🏠 Cerca del alojamiento│
└──────────────────────────┘
        ↓ tap opción
┌──────────────────────────┐
│  Mapa con pins filtrados │
│  + lista lateral         │
│  ordenada por calidad    │
└──────────────────────────┘
        ↓ tap pin/lugar
   Google Maps (nueva pestaña)
   con ficha completa
```

### Categorías → tags Overpass (OSM)

| Categoría | Icono | Filtros OSM |
|-----------|-------|-------------|
| Restaurantes | `UtensilsCrossed` | `amenity=restaurant` |
| Cafés y bares | `Coffee` | `amenity in [cafe, bar, pub]` |
| Supermercados | `ShoppingCart` | `shop in [supermarket, convenience]` |
| Farmacias | `Pill` | `amenity=pharmacy` |
| Hoteles | `Hotel` | `tourism in [hotel, hostel, guest_house]` |
| Sitios turísticos | `Landmark` | `tourism in [attraction, museum, monument, viewpoint, artwork] OR historic=*` |

### Lógica de ubicación

**Cerca de mi ubicación**: `navigator.geolocation.getCurrentPosition()`. Si el usuario rechaza permisos → mensaje claro con CTA para reintentar.

**Cerca del alojamiento**:
1. Consulta `trip_accommodation` por `trip_id`, ordenada por `check_in` ascendente, primer registro.
2. Geocodificar `address` (o `name` como fallback) con **Open-Meteo Geocoding** (mismo proveedor sin key que ya usa `Weather.tsx` y `check-trip-pre-departure`).
3. Si no hay alojamiento o falla la geocodificación → mensaje elegante: *"Todavía no hay un alojamiento guardado en este viaje para usarlo como referencia."* con botón "Volver" o "Usar mi ubicación".

### Lógica de radio progresivo
1. Buscar en **1500 m**.
2. Si <8 resultados → ampliar a **3000 m**.
3. Si <8 resultados → ampliar a **5000 m**.
4. Si sigue <3 resultados → mensaje "Pocos sitios encontrados en esta zona".

### Priorización de resultados
OSM no tiene ratings/reseñas propios, por lo que se calcula un score combinado:

```text
score = 
  (tiene_website ? 1 : 0) +
  (tiene_telefono ? 1 : 0) +
  (tiene_horario ? 1 : 0) +
  (tiene_cuisine/brand ? 1 : 0) +
  bonus_cercania(distancia)
```

Esto filtra POIs incompletos/dudosos y prioriza los bien documentados (proxy razonable de "sitios fiables") combinado con cercanía. Los resultados sin nombre se descartan.

Para los **sitios turísticos** se prioriza adicionalmente `wikidata`/`wikipedia` tags presentes (señal fuerte de relevancia turística real).

### Diseño visual (100% YORMIT)

Reutiliza exactamente los patrones existentes:
- **Pantalla de categorías**: mismo grid que el dashboard (`grid-cols-2 gap-2`, `rounded-xl bg-card p-3 shadow-card hover:shadow-card-hover`, icono en `rounded-lg p-2 bg-primary/10 text-primary` o `bg-accent/10 text-accent` alternando, label `text-xs font-semibold`).
- **Selector intermedio**: 2 cards apiladas verticalmente (`rounded-xl bg-card p-4 shadow-card`) con icono + título + subtítulo descriptivo. Mismo estilo que las cards actuales de `EmergencyPhones.tsx`.
- **Vista de mapa**: mapa en la mitad superior, lista scroll en la mitad inferior. Mapa con **Leaflet + react-leaflet + tiles OSM** (gratis, sin key). Markers con color primary. Tap en marker o en item de lista → abre `https://www.google.com/maps/search/?api=1&query={lat},{lon}&query_place_id=...` o búsqueda por nombre+coords.
- **Animaciones**: `animate-fade-in` igual que el resto.
- **Header**: mismo `TripLayout` (back arrow + título trip).

### Icono en el dashboard del viaje
Cambiar en `TripDashboard.tsx` línea 85:
- Antes: `{ path: "phones", label: t.emergencyPhones, icon: Phone, color: "bg-accent/10 text-accent" }`
- Después: `{ path: "places", label: t.usefulPlaces, icon: MapPinned, color: "bg-accent/10 text-accent" }`

Icono `MapPinned` (lucide-react) — coherente con `MapPin` ya usado en datos del viaje.

### Traducciones (7 idiomas)
Añadir nuevas claves a `src/i18n/translations.ts` para mantener i18n consistente:
- `usefulPlaces`: "Sitios útiles" / "Useful places" / "Lieux utiles" / "Locais úteis" / "Luoghi utili" / "实用场所" / "Nützliche Orte"
- `placesRestaurants`, `placesCafesBars`, `placesSupermarkets`, `placesPharmacies`, `placesHotels`, `placesTouristic`
- `placesNearMyLocation`, `placesNearAccommodation`
- `placesNoAccommodation`: "Todavía no hay un alojamiento guardado en este viaje para usarlo como referencia."
- `placesLocationDenied`, `placesLoading`, `placesNoResults`, `placesViewOnMap`

Las claves antiguas (`emergencyPhones`, `phoneEmergencies`, etc.) **se mantienen** en `translations.ts` para no tocar 7 idiomas masivamente — quedan como código muerto sin afectar funcionamiento.

### Ficheros afectados

| Fichero | Acción |
|---------|--------|
| `src/pages/trips/UsefulPlaces.tsx` | **Crear** — pantalla de 6 categorías |
| `src/pages/trips/UsefulPlacesCategory.tsx` | **Crear** — selector intermedio + vista de mapa con resultados |
| `src/lib/usefulPlaces.ts` | **Crear** — helpers: query Overpass, geocoding alojamiento, scoring/ordenación, búsqueda con radio progresivo |
| `src/pages/trips/EmergencyPhones.tsx` | **Eliminar** |
| `src/data/emergencyPhones.ts` | **Eliminar** (ya no se usa) |
| `src/App.tsx` | Sustituir ruta `phones` → `places` (con sub-ruta `/places/:category`); eliminar lazy import de `EmergencyPhones` |
| `src/pages/TripDashboard.tsx` | Cambiar entrada del array `sections` (línea 85): icono `MapPinned`, label `t.usefulPlaces`, path `places` |
| `src/i18n/translations.ts` | Añadir nuevas claves en los 7 idiomas + entrada en `TranslationKeys` |

### Dependencias nuevas
- `leaflet` + `react-leaflet` (mapa con tiles OSM gratis, sin API key, ~40 KB gzipped, lazy-loaded en la ruta).

### Lo que NO se toca
- Cero cambios en landing, dashboard general, auth, otras secciones del viaje (transport, accommodation, expenses, photos, chat, weather, schedule), navegación global, estilos globales, edge functions, base de datos, traducciones existentes.
- Cero cambios en la lógica de roles, RLS, push notifications, emails, o cualquier otra funcionalidad.

### Validación posterior
Tras desplegar:
1. Confirmaré que el dashboard del viaje muestra "Sitios útiles" en lugar de "Teléfonos de interés".
2. Probaré las 6 categorías con ambas opciones de ubicación.
3. Verificaré el mensaje cuando no haya alojamiento.
4. Confirmaré ordenación por calidad+cercanía y apertura de ficha en Google Maps.

