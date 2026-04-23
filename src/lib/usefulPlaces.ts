// Useful Places helpers — Overpass (OSM) + Open-Meteo geocoding (no API keys)

export type PlaceCategory =
  | "restaurants"
  | "cafes"
  | "supermarkets"
  | "pharmacies"
  | "hotels"
  | "touristic";

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
    'nwr["amenity"~"^(restaurant|fast_food|food_court|bbq)$"]',
  cafes:
    'nwr["amenity"~"^(cafe|bar|pub|biergarten|nightclub)$"];nwr["shop"~"^(coffee|tea)$"]',
  supermarkets:
    'nwr["shop"~"^(supermarket|convenience|bakery|butcher|greengrocer|deli)$"];nwr["amenity"="marketplace"]',
  pharmacies: 'nwr["amenity"="pharmacy"];nwr["shop"="chemist"]',
  hotels:
    'nwr["tourism"~"^(hotel|hostel|guest_house|motel|apartment|chalet)$"]',
  touristic:
    'nwr["tourism"~"^(attraction|museum|monument|viewpoint|artwork)$"];nwr["historic"]',
};

const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];

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

async function overpassQuery(query: string): Promise<OverpassElement[]> {
  let lastErr: unknown = null;
  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `data=${encodeURIComponent(query)}`,
      });
      if (!res.ok) {
        lastErr = new Error(`Overpass ${res.status}`);
        continue;
      }
      const json = await res.json();
      return (json.elements ?? []) as OverpassElement[];
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr ?? new Error("Overpass error");
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

const RADIUS_STEPS = [1500, 3000, 5000];

export async function searchPlaces(
  category: PlaceCategory,
  center: LatLon,
): Promise<{ places: Place[]; radius: number }> {
  let elements: OverpassElement[] = [];
  let usedRadius = RADIUS_STEPS[RADIUS_STEPS.length - 1];

  for (const radius of RADIUS_STEPS) {
    const query = buildQuery(category, center, radius);
    elements = await overpassQuery(query);
    const named = elements.filter((e) => e.tags?.name);
    if (named.length >= 8) {
      usedRadius = radius;
      break;
    }
    usedRadius = radius;
  }

  const seen = new Set<string>();
  const places: Place[] = [];
  for (const el of elements) {
    const tags = el.tags ?? {};
    const name = tags.name;
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

  // Pre-filter: drop score=0 noise only when we have ≥15 quality candidates
  const quality = places.filter((p) => p.score > 0);
  const filtered = quality.length >= 15 ? quality : places;

  // Sort by distance ascending; soft tie-breaker by quality when within 75m
  filtered.sort((a, b) => {
    const d = a.distance - b.distance;
    if (Math.abs(d) < 75) return b.score - a.score;
    return d;
  });

  return { places: filtered.slice(0, 60), radius: usedRadius };
}

// Normalize a free-form address to improve geocoding hit rate
function normalizeAddress(query: string): string {
  return query
    .replace(/n[ºo°]\s*/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

async function nominatimSearch(query: string): Promise<LatLon | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(
      query,
    )}`;
    const res = await fetch(url, {
      headers: {
        "Accept-Language": "es,en",
      },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as Array<{ lat: string; lon: string }>;
    const first = json?.[0];
    if (!first) return null;
    const lat = parseFloat(first.lat);
    const lon = parseFloat(first.lon);
    if (Number.isNaN(lat) || Number.isNaN(lon)) return null;
    return { lat, lon };
  } catch {
    return null;
  }
}

async function openMeteoSearch(query: string): Promise<LatLon | null> {
  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      query,
    )}&count=1&language=en&format=json`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const json = await res.json();
    const first = json?.results?.[0];
    if (!first) return null;
    return { lat: first.latitude, lon: first.longitude };
  } catch {
    return null;
  }
}

// Extract a likely city/locality token from a free-form address
function extractCity(query: string): string | null {
  // Match a 5-digit postal code followed by city words (e.g. "28012 Madrid")
  const postalMatch = query.match(/\b\d{4,5}\s+([A-Za-zÀ-ÿ' .-]{2,})$/);
  if (postalMatch) return postalMatch[1].trim();
  // Fallback: last comma-separated chunk
  const parts = query.split(",").map((p) => p.trim()).filter(Boolean);
  if (parts.length > 1) return parts[parts.length - 1];
  // Fallback: last word
  const words = query.trim().split(/\s+/);
  return words.length ? words[words.length - 1] : null;
}

// Geocode a free-form address with cascade fallbacks (Nominatim → normalized → city → Open-Meteo)
export async function geocodeAddress(query: string): Promise<LatLon | null> {
  const trimmed = query.trim();
  if (!trimmed) return null;

  // 1. Full address via Nominatim
  const direct = await nominatimSearch(trimmed);
  if (direct) return direct;

  // 2. Normalized address via Nominatim
  const normalized = normalizeAddress(trimmed);
  if (normalized && normalized !== trimmed) {
    const norm = await nominatimSearch(normalized);
    if (norm) return norm;
  }

  // 3. City fallback via Nominatim
  const city = extractCity(normalized || trimmed);
  if (city) {
    const cityHit = await nominatimSearch(city);
    if (cityHit) return cityHit;
  }

  // 4. Last resort: Open-Meteo with city or full query
  const openMeteoQuery = city || trimmed;
  return openMeteoSearch(openMeteoQuery);
}

export function googleMapsUrlFor(place: Place): string {
  const q = encodeURIComponent(`${place.name} ${place.address ?? ""}`.trim());
  return `https://www.google.com/maps/search/?api=1&query=${q}&query_place_id=&center=${place.lat},${place.lon}`;
}

export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}
