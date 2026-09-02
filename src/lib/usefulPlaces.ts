// Useful Places helpers — Overpass (OSM) + Open-Meteo geocoding (no API keys)

export type PlaceCategory =
  | "restaurants"
  | "cafes"
  | "supermarkets"
  | "pharmacies"
  | "hotels"
  | "touristic"
  | "atms";

export interface Place {
  id: string;
  name: string;
  lat: number;
  lon: number;
  category: PlaceCategory;
  distance: number; // meters
  score: number;
  website?: string;
  phone?: string;
  openingHours?: string;
  cuisine?: string;
  brand?: string;
  address?: string;
  wikidata?: string;
}

export interface LatLon {
  lat: number;
  lon: number;
}

// Overpass filter for each category — multiple nwr clauses joined with ';' for broader coverage
const CATEGORY_FILTERS: Record<PlaceCategory, string> = {
  restaurants:
    'nwr["amenity"~"^(restaurant|fast_food|food_court|bbq|ice_cream)$"]',
  cafes:
    'nwr["amenity"~"^(cafe|bar|pub|biergarten|nightclub)$"];nwr["shop"~"^(coffee|tea)$"];nwr["amenity"="restaurant"]["cuisine"~"spanish|tapas|wine_bar|wine"]',
  supermarkets:
    'nwr["shop"~"^(supermarket|convenience|bakery|butcher|greengrocer|deli)$"];nwr["amenity"="marketplace"]',
  pharmacies: 'nwr["amenity"="pharmacy"];nwr["shop"="chemist"]',
  hotels:
    'nwr["tourism"~"^(hotel|hostel|guest_house|motel|apartment|chalet)$"]',
  touristic:
    'nwr["tourism"~"^(attraction|museum|monument|viewpoint|artwork)$"];nwr["historic"]',
  atms: 'nwr["amenity"="atm"];nwr["amenity"="bank"]',
};

const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];

const OVERPASS_TIMEOUT_MS = 8000;

// Local polyfill of Promise.any so we don't need to bump tsconfig lib version.
// Resolves with the first fulfilled promise, rejects only if ALL reject.
function promiseAny<T>(promises: Promise<T>[]): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    if (promises.length === 0) {
      reject(new Error("No promises"));
      return;
    }
    let rejections = 0;
    const errors: unknown[] = [];
    promises.forEach((p, i) => {
      Promise.resolve(p).then(resolve, (err) => {
        errors[i] = err;
        rejections++;
        if (rejections === promises.length) {
          reject(new Error("All promises were rejected"));
        }
      });
    });
  });
}

// Haversine distance in meters
function distanceMeters(a: LatLon, b: LatLon): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(h));
}

interface OverpassElement {
  type: "node" | "way" | "relation";
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

// Race the same query against ALL endpoints in parallel — first successful response wins.
// Aborts the loser. Returns null if every endpoint failed/timed out.
async function overpassQuery(query: string): Promise<OverpassElement[] | null> {
  const controllers = OVERPASS_ENDPOINTS.map(() => new AbortController());
  const timers = controllers.map((c) =>
    setTimeout(() => c.abort(), OVERPASS_TIMEOUT_MS),
  );

  const attempts = OVERPASS_ENDPOINTS.map(async (endpoint, i) => {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `data=${encodeURIComponent(query)}`,
      signal: controllers[i].signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return (json.elements ?? []) as OverpassElement[];
  });

  try {
    const winner = await promiseAny(attempts);
    // Abort the losers to free resources
    controllers.forEach((c, i) => {
      if (!c.signal.aborted) c.abort();
      clearTimeout(timers[i]);
    });
    return winner;
  } catch {
    timers.forEach(clearTimeout);
    return null;
  }
}

function buildQuery(
  category: PlaceCategory,
  center: LatLon,
  radius: number,
): string {
  const filter = CATEGORY_FILTERS[category];
  // Inject around clause into each nwr filter
  const aroundFilter = filter
    .split(";")
    .filter(Boolean)
    .map((f) => `${f}(around:${radius},${center.lat},${center.lon});`)
    .join("");
  return `[out:json][timeout:25];(${aroundFilter});out center tags 150;`;
}

function scorePlace(
  el: OverpassElement,
  category: PlaceCategory,
): number {
  const tags = el.tags ?? {};
  let score = 0;
  if (tags.website || tags["contact:website"]) score += 1;
  if (tags.phone || tags["contact:phone"]) score += 1;
  if (tags.opening_hours) score += 1;
  if (tags.cuisine || tags.brand) score += 1;
  if (category === "touristic" && (tags.wikidata || tags.wikipedia)) score += 2;
  return score;
}

function elementCoords(el: OverpassElement): LatLon | null {
  if (typeof el.lat === "number" && typeof el.lon === "number") {
    return { lat: el.lat, lon: el.lon };
  }
  if (el.center) return { lat: el.center.lat, lon: el.center.lon };
  return null;
}

function buildAddress(tags: Record<string, string>): string | undefined {
  const street = tags["addr:street"];
  const num = tags["addr:housenumber"];
  const city = tags["addr:city"];
  if (!street && !city) return undefined;
  const parts: string[] = [];
  if (street) parts.push(num ? `${street} ${num}` : street);
  if (city) parts.push(city);
  return parts.join(", ");
}

// Fallback name builder: if the POI has no `name` tag, try brand → operator → cuisine.
// Returns null if nothing usable is available.
function resolveName(tags: Record<string, string>): string | null {
  if (tags.name) return tags.name;
  if (tags.brand) return tags.brand;
  if (tags.operator) return tags.operator;
  if (tags.cuisine) {
    // "spanish;tapas" → "Spanish, Tapas"
    const pretty = tags.cuisine
      .split(/[;,]/)
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
      .join(", ");
    return pretty || null;
  }
  return null;
}

// Aggressive radii: start tight, reach mid-density quickly, only escalate to 4 km
// when the area is genuinely sparse.
const RADIUS_STEPS = [800, 2000, 4000];
const ENOUGH_RESULTS = 25;

// ---------------- In-memory caches ----------------
// Search cache: keyed by category + ~110 m grid. TTL 10 min.
const SEARCH_CACHE_TTL_MS = 10 * 60 * 1000;
interface SearchCacheEntry {
  ts: number;
  data: { places: Place[]; radius: number };
}
const searchCache = new Map<string, SearchCacheEntry>();

function searchCacheKey(category: PlaceCategory, center: LatLon): string {
  return `${category}|${center.lat.toFixed(3)}|${center.lon.toFixed(3)}`;
}

// Geocoding cache: keyed by normalized query. TTL 1 hour.
const GEOCODE_CACHE_TTL_MS = 60 * 60 * 1000;
interface GeocodeCacheEntry {
  ts: number;
  data: LatLon | null;
}
const geocodeCache = new Map<string, GeocodeCacheEntry>();

function buildPlacesFromElements(
  elements: OverpassElement[],
  center: LatLon,
  category: PlaceCategory,
): Place[] {
  const seen = new Set<string>();
  const places: Place[] = [];
  for (const el of elements) {
    const tags = el.tags ?? {};
    const name = resolveName(tags);
    if (!name) continue;
    const coords = elementCoords(el);
    if (!coords) continue;
    const key = `${name}|${coords.lat.toFixed(5)}|${coords.lon.toFixed(5)}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const distance = distanceMeters(center, coords);
    places.push({
      id: `${el.type}/${el.id}`,
      name,
      lat: coords.lat,
      lon: coords.lon,
      category,
      distance,
      score: scorePlace(el, category),
      website: tags.website || tags["contact:website"],
      phone: tags.phone || tags["contact:phone"],
      openingHours: tags.opening_hours,
      cuisine: tags.cuisine,
      brand: tags.brand,
      address: buildAddress(tags),
      wikidata: tags.wikidata,
    });
  }

  // Pre-filter: drop score=0 noise only when we have ≥25 quality candidates
  const quality = places.filter((p) => p.score > 0);
  const filtered = quality.length >= 25 ? quality : places;

  // Sort by distance ascending; soft tie-breaker by quality when within 75m
  filtered.sort((a, b) => {
    const d = a.distance - b.distance;
    if (Math.abs(d) < 75) return b.score - a.score;
    return d;
  });

  return filtered.slice(0, 120);
}

export async function searchPlaces(
  category: PlaceCategory,
  center: LatLon,
): Promise<{ places: Place[]; radius: number }> {
  // Cache hit: instant return, zero network.
  const cacheKey = searchCacheKey(category, center);
  const cached = searchCache.get(cacheKey);
  if (cached && Date.now() - cached.ts < SEARCH_CACHE_TTL_MS) {
    return cached.data;
  }

  // Launch all radii in parallel. We resolve as soon as the smallest radius
  // returns enough usable results; otherwise we wait for the next one up.
  const promises = RADIUS_STEPS.map((r) => overpassQuery(buildQuery(category, center, r)));

  let bestElements: OverpassElement[] = [];
  let bestRadius = RADIUS_STEPS[RADIUS_STEPS.length - 1];

  for (let i = 0; i < promises.length; i++) {
    const elements = await promises[i];
    if (elements === null) continue;
    bestElements = elements;
    bestRadius = RADIUS_STEPS[i];
    const usable = elements.filter((e) => resolveName(e.tags ?? {}) !== null);
    if (usable.length >= ENOUGH_RESULTS) break;
  }

  const places = buildPlacesFromElements(bestElements, center, category);
  const result = { places, radius: bestRadius };

  // Only cache successful, non-empty results to avoid pinning failures.
  if (places.length > 0) {
    searchCache.set(cacheKey, { ts: Date.now(), data: result });
  }

  return result;
}

// Country tokens we want to strip / ignore when extracting a city fallback
const COUNTRY_TOKENS = new Set([
  "españa", "espana", "spain", "es",
  "portugal", "pt",
  "francia", "france", "fr",
  "italia", "italy", "it",
  "alemania", "germany", "deutschland", "de",
  "reino unido", "uk", "united kingdom", "england", "inglaterra",
  "marruecos", "morocco",
  "andorra",
]);

function isCountryToken(s: string): boolean {
  return COUNTRY_TOKENS.has(s.trim().toLowerCase());
}

// Normalize a free-form address to improve geocoding hit rate.
// Handles Spanish-style messy addresses: "32 Calle X 4º-1º, 26003 Logroño, España"
function normalizeAddress(query: string): string {
  let s = query;

  // 1. Remove "nº/no/n°" prefixes before numbers
  s = s.replace(/\bn[ºo°·]\s*/gi, "");

  // 2. Remove planta-puerta noise: "4º-1º", "3ºA", "1º D", "Bajo B", "Ático",
  //    "Esc. 2", "Pta 1", "Piso 4", "Pl. 3", "Esc 1", etc.
  //    Strategy: strip ordinal floor markers and common abbreviations.
  s = s.replace(/\b\d+\s*[ºª°]\s*[-,\s]?\s*\d*\s*[ºª°]?\s*[A-Za-z]?\b/g, " "); // 4º-1º, 3ºA, 1º D
  s = s.replace(/\b(piso|planta|pta|puerta|esc|escalera|pl|bajo|atico|ático|entresuelo|sótano|sotano|principal)\b\.?\s*\d*\s*[A-Za-z]?\b/gi, " ");

  // 3. Remove trailing country tokens (", España", ", Spain", ", ES")
  //    so the fallback "extract city from last chunk" doesn't pick the country.
  s = s.replace(/,\s*(españa|espana|spain|es|portugal|pt|francia|france|fr|italia|italy|it|alemania|germany|deutschland|de|reino unido|uk|united kingdom|andorra)\s*$/gi, "");

  // 4. Reorder leading number: "32 Calle X" → "Calle X 32"
  //    (Nominatim handles trailing house numbers far better in ES/EU.)
  const leadingNumMatch = s.match(/^\s*(\d{1,5})\s+([A-Za-zÀ-ÿ].+?)(,|$)/);
  if (leadingNumMatch) {
    const num = leadingNumMatch[1];
    const street = leadingNumMatch[2].trim();
    const rest = s.slice(leadingNumMatch[0].length - (leadingNumMatch[3] ? leadingNumMatch[3].length : 0));
    s = `${street} ${num}${rest}`;
  }

  // 5. Strip stray ordinal markers left behind ("º", "ª")
  s = s.replace(/\s[ºª°]\s/g, " ").replace(/\s[ºª°],/g, ",").replace(/\s[ºª°]$/g, "");
  // 6. Collapse repeated commas/whitespace
  s = s.replace(/,\s*,/g, ",").replace(/\s{2,}/g, " ").replace(/\s+,/g, ",").trim();
  return s;
}

// Reject Nominatim hits that are too coarse to be useful (country/state centroids).
// place_rank: ~4=country, ~8=state, ~12=county, ~16=city, ~20=suburb, ~26+=street, 30=house
interface NominatimHit {
  lat: string;
  lon: string;
  place_rank?: number;
  addresstype?: string;
  class?: string;
  type?: string;
}

function isUsefulHit(hit: NominatimHit): boolean {
  if (hit.addresstype === "country" || hit.type === "country") return false;
  if (typeof hit.place_rank === "number" && hit.place_rank < 12) return false;
  return true;
}

async function nominatimSearch(query: string, signal?: AbortSignal): Promise<LatLon | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=3&addressdetails=0&q=${encodeURIComponent(
      query,
    )}`;
    const res = await fetch(url, {
      headers: { "Accept-Language": "es,en" },
      signal,
    });
    if (!res.ok) return null;
    const json = (await res.json()) as NominatimHit[];
    const first = (json ?? []).find(isUsefulHit);
    if (!first) return null;
    const lat = parseFloat(first.lat);
    const lon = parseFloat(first.lon);
    if (Number.isNaN(lat) || Number.isNaN(lon)) return null;
    return { lat, lon };
  } catch {
    return null;
  }
}

async function openMeteoSearch(query: string, signal?: AbortSignal): Promise<LatLon | null> {
  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      query,
    )}&count=1&language=en&format=json`;
    const res = await fetch(url, { signal });
    if (!res.ok) return null;
    const json = await res.json();
    const first = json?.results?.[0];
    if (!first) return null;
    return { lat: first.latitude, lon: first.longitude };
  } catch {
    return null;
  }
}

// Extract a likely city/locality token from a free-form address.
// Skips country tokens so "..., España" doesn't return "España".
function extractCity(query: string): string | null {
  // 1. "28012 Madrid" anywhere in the string (postal code + city words, possibly mid-string)
  const postalMatch = query.match(/\b\d{4,5}\s+([A-Za-zÀ-ÿ' .-]{2,}?)(?=,|$)/);
  if (postalMatch) {
    const candidate = postalMatch[1].trim();
    if (!isCountryToken(candidate)) return candidate;
  }
  // 2. Walk comma-separated chunks from the end, skipping countries
  const parts = query.split(",").map((p) => p.trim()).filter(Boolean);
  for (let i = parts.length - 1; i >= 0; i--) {
    const p = parts[i];
    if (isCountryToken(p)) continue;
    // Skip pure postal codes
    if (/^\d{4,5}$/.test(p)) continue;
    // Strip leading postal code from chunk: "26003 Logroño" → "Logroño"
    const stripped = p.replace(/^\d{4,5}\s+/, "").trim();
    if (stripped && !isCountryToken(stripped)) return stripped;
  }
  // 3. Last resort: last non-country word
  const words = query.trim().split(/[\s,]+/).filter(Boolean);
  for (let i = words.length - 1; i >= 0; i--) {
    if (!isCountryToken(words[i]) && !/^\d+$/.test(words[i])) return words[i];
  }
  return null;
}

export type GeocodePrecision = "address" | "locality" | "approximate";

export interface GeocodeResult {
  coords: LatLon;
  precision: GeocodePrecision;
}

async function nominatimSearchRanked(
  query: string,
): Promise<{ coords: LatLon; rank: number } | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=3&addressdetails=0&q=${encodeURIComponent(
      query,
    )}`;
    const res = await fetch(url, { headers: { "Accept-Language": "es,en" } });
    if (!res.ok) return null;
    const json = (await res.json()) as NominatimHit[];
    const first = (json ?? []).find(isUsefulHit);
    if (!first) return null;
    const lat = parseFloat(first.lat);
    const lon = parseFloat(first.lon);
    if (Number.isNaN(lat) || Number.isNaN(lon)) return null;
    return { coords: { lat, lon }, rank: typeof first.place_rank === "number" ? first.place_rank : 16 };
  } catch {
    return null;
  }
}

// Geocode a free-form address by PRECISION, not by speed.
// Tier 1: full address (raw, then normalized) via Nominatim → street/house level.
// Tier 2: extracted city via Nominatim → locality level.
// Tier 3: Open-Meteo (city or raw) → approximate, last resort.
export async function geocodeAddressDetailed(
  query: string,
): Promise<GeocodeResult | null> {
  const trimmed = query.trim();
  if (!trimmed) return null;

  const normalized = normalizeAddress(trimmed);
  const city = extractCity(normalized || trimmed);

  // Tier 1 — full address
  const fullQueries = normalized && normalized !== trimmed ? [trimmed, normalized] : [trimmed];
  for (const q of fullQueries) {
    const hit = await nominatimSearchRanked(q);
    if (hit) {
      // rank >= 20 → suburb/street/house level: treat as a real address match
      return { coords: hit.coords, precision: hit.rank >= 20 ? "address" : "locality" };
    }
  }

  // Tier 2 — city via Nominatim
  if (city) {
    const hit = await nominatimSearchRanked(city);
    if (hit) return { coords: hit.coords, precision: "locality" };
  }

  // Tier 3 — Open-Meteo, approximate only
  const om = await openMeteoSearch(city || trimmed);
  if (om) return { coords: om, precision: "approximate" };

  return null;
}

// Backwards-compatible wrapper (cached).
export async function geocodeAddress(query: string): Promise<LatLon | null> {
  const trimmed = query.trim();
  if (!trimmed) return null;

  const cached = geocodeCache.get(trimmed);
  if (cached && Date.now() - cached.ts < GEOCODE_CACHE_TTL_MS) {
    return cached.data;
  }

  const detailed = await geocodeAddressDetailed(trimmed);
  const result = detailed?.coords ?? null;
  geocodeCache.set(trimmed, { ts: Date.now(), data: result });
  return result;
}


export function googleMapsUrlFor(place: Place): string {
  const q = encodeURIComponent(`${place.name} ${place.address ?? ""}`.trim());
  return `https://www.google.com/maps/search/?api=1&query=${q}&query_place_id=&center=${place.lat},${place.lon}`;
}

export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

// ---------------- Geolocation cache (5 min) ----------------
const POSITION_CACHE_TTL_MS = 5 * 60 * 1000;
let cachedPosition: { ts: number; coords: LatLon } | null = null;

export function getCachedPosition(): LatLon | null {
  if (!cachedPosition) return null;
  if (Date.now() - cachedPosition.ts > POSITION_CACHE_TTL_MS) return null;
  return cachedPosition.coords;
}

export function setCachedPosition(coords: LatLon): void {
  cachedPosition = { ts: Date.now(), coords };
}
