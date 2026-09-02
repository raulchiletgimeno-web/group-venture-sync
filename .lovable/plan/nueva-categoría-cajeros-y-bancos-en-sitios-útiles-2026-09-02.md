# Nueva categoría "Cajeros y bancos" en Sitios útiles

Añadir una séptima categoría a Sitios útiles reutilizando exactamente el sistema actual (Overpass / OpenStreetMap, sin API keys). Ningún cambio en las 6 categorías existentes ni en ninguna otra sección.

## Cambios

### 1. `src/lib/usefulPlaces.ts`
- Añadir `"atms"` al tipo `PlaceCategory`.
- Añadir filtro Overpass priorizando cajeros automáticos:
  ```
  nwr["amenity"="atm"];nwr["amenity"="bank"]
  ```
  (ATM primero = prioridad a retirada de efectivo; bancos como sucursales.)
- En `resolveName` ya hay fallback `brand → operator`, que cubre cajeros sin nombre propio (p. ej. operator "CaixaBank") — no requiere cambio.

### 2. `src/pages/trips/UsefulPlaces.tsx`
- Añadir entrada al array `categories`: key `atms`, icono `Banknote` (lucide, claro y distinto de los usados), mismas clases de color alterno (`bg-primary/10 text-primary`).

### 3. `src/pages/trips/UsefulPlacesCategory.tsx`
- Añadir `atms: { labelKey: "placesAtmsBanks", icon: Banknote }` a `CATEGORY_META`.
- El resto del flujo (Cerca de mi ubicación / Cerca del alojamiento, mapa, lista, ordenación por distancia) es genérico por categoría y funcionará sin tocar nada más.

### 4. `src/i18n/translations.ts`
- Nueva clave `placesAtmsBanks` en la interfaz y en los 7 idiomas:
  - es: "Cajeros y bancos"
  - en: "ATMs & banks"
  - fr: "DAB et banques"
  - pt: "Multibanco e bancos"
  - it: "Bancomat e banche"
  - zh: "ATM 和银行"
  - de: "Geldautomaten & Banken"

## Proveedor reutilizado
Overpass API (OpenStreetMap) — el mismo que restaurantes, farmacias, etc. Tags OSM: `amenity=atm` y `amenity=bank`.

## No se toca
Las 6 categorías actuales, geolocalización, mapas, permisos, diseño, ni ninguna otra sección de YORMIT.

## Validación
- Aparecen 7 categorías; la nueva se llama "Cajeros y bancos".
- Búsqueda "Cerca de mi ubicación" devuelve cajeros/bancos reales ordenados por proximidad.
- "Cerca del alojamiento" usa la ubicación del alojamiento como hoy.
- Las otras 6 categorías siguen funcionando igual.
- `tsgo --noEmit` sin errores; prueba visual en la preview.
