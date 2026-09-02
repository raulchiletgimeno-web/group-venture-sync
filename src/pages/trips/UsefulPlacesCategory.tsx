import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  MapPin,
  Home,
  ArrowLeft,
  ExternalLink,
  UtensilsCrossed,
  Coffee,
  ShoppingCart,
  Pill,
  Hotel,
  Landmark,
  Banknote,
  AlertCircle,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  type Place,
  type PlaceCategory,
  type LatLon,
  type GeocodeResult,
  searchPlaces,
  geocodeAddressDetailed,
  googleMapsUrlFor,
  formatDistance,
  getCachedPosition,
  setCachedPosition,
} from "@/lib/usefulPlaces";
import { Skeleton } from "@/components/ui/skeleton";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default Leaflet marker icons (no bundler asset path)
const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const CATEGORY_META: Record<
  PlaceCategory,
  { labelKey: keyof ReturnType<typeof useLanguage>["t"]; icon: typeof UtensilsCrossed }
> = {
  restaurants: { labelKey: "placesRestaurants", icon: UtensilsCrossed },
  cafes: { labelKey: "placesCafesBars", icon: Coffee },
  supermarkets: { labelKey: "placesSupermarkets", icon: ShoppingCart },
  pharmacies: { labelKey: "placesPharmacies", icon: Pill },
  hotels: { labelKey: "placesHotels", icon: Hotel },
  touristic: { labelKey: "placesTouristic", icon: Landmark },
  atms: { labelKey: "placesAtmsBanks", icon: Banknote },
};

type LocationSource = "me" | "accommodation";

interface Accommodation {
  id: string;
  name: string;
  address: string | null;
}


const PlacesSkeleton = () => (
  <div className="space-y-3">
    <Skeleton className="w-full rounded-xl" style={{ height: 240 }} />
    <div className="space-y-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 rounded-xl bg-card p-3 shadow-card"
        >
          <Skeleton className="h-9 w-9 rounded-lg flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-2/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

const UsefulPlacesCategory = () => {
  const { tripId, category } = useParams<{ tripId: string; category: PlaceCategory }>();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const cat = (category && CATEGORY_META[category as PlaceCategory] ? category : "restaurants") as PlaceCategory;
  const meta = CATEGORY_META[cat];
  const Icon = meta.icon;
  const categoryLabel = t[meta.labelKey] as string;

  const [source, setSource] = useState<LocationSource | null>(null);
  const [center, setCenter] = useState<LatLon | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accOptions, setAccOptions] = useState<Accommodation[] | null>(null);


  const handleNearMe = () => {
    setError(null);
    setSource("me");
    if (!navigator.geolocation) {
      setError(t.placesLocationDenied);
      return;
    }

    // INSTANT path: if we have a fresh cached position, use it immediately.
    const cachedPos = getCachedPosition();
    if (cachedPos) {
      setLoading(true);
      setCenter(cachedPos);
      // Refresh in background, no UI blocking.
      navigator.geolocation.getCurrentPosition(
        (pos) => setCachedPosition({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
        () => {},
        { enableHighAccuracy: false, timeout: 7000, maximumAge: 5 * 60 * 1000 },
      );
      return;
    }

    setLoading(true);

    const onSuccess: PositionCallback = (pos) => {
      const coords = { lat: pos.coords.latitude, lon: pos.coords.longitude };
      setCachedPosition(coords);
      setCenter(coords);
    };

    // Fast path: low accuracy (network/IP based) — much faster on mobile
    navigator.geolocation.getCurrentPosition(
      onSuccess,
      () => {
        // Fallback: try high accuracy (GPS) once before giving up
        navigator.geolocation.getCurrentPosition(
          onSuccess,
          () => {
            setLoading(false);
            setError(t.placesLocationDenied);
          },
          { enableHighAccuracy: true, timeout: 6000, maximumAge: 60000 },
        );
      },
      { enableHighAccuracy: false, timeout: 7000, maximumAge: 5 * 60 * 1000 },
    );
  };

  const resolveAccommodation = async (acc: Accommodation) => {
    setError(null);
    setLoading(true);
    setAccOptions(null);

    // Prefer the most precise reference available: full address first,
    // then "name, address", then the name alone. Never fall back to the trip city.
    const rawAddress = acc.address?.trim() ?? "";
    const attempts: string[] = [];
    if (rawAddress) attempts.push(rawAddress);
    if (acc.name && rawAddress) attempts.push(`${acc.name}, ${rawAddress}`);
    if (acc.name) attempts.push(acc.name);

    let best: GeocodeResult | null = null;
    for (const q of attempts) {
      const res = await geocodeAddressDetailed(q);
      if (res && res.precision === "address") {
        best = res;
        break;
      }
      if (res && !best) best = res;
    }

    if (!best || best.precision === "approximate") {
      setLoading(false);
      setError(t.placesAccommodationNotLocated);
      return;
    }

    setCenter(best.coords);
  };

  const handleNearAccommodation = async () => {
    if (!tripId) return;
    setError(null);
    setSource("accommodation");
    setLoading(true);

    const { data: accData } = await supabase
      .from("trip_accommodation")
      .select("id, name, address")
      .eq("trip_id", tripId)
      .order("check_in", { ascending: true });

    const list = (accData ?? []) as Accommodation[];
    if (list.length === 0) {
      setLoading(false);
      setError(t.placesNoAccommodation);
      return;
    }

    if (list.length === 1) {
      await resolveAccommodation(list[0]);
      return;
    }

    setLoading(false);
    setAccOptions(list);
  };


  // When center becomes available, fetch places
  useEffect(() => {
    if (!center) return;
    let cancelled = false;
    setError(null);
    searchPlaces(cat, center)
      .then(({ places }) => {
        if (cancelled) return;
        setPlaces(places);
        if (places.length === 0) setError(t.placesNoResults);
      })
      .catch(() => {
        if (cancelled) return;
        setError(t.placesNoResults);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [center, cat, t.placesNoResults]);

  const mapKey = useMemo(
    () => (center ? `${center.lat.toFixed(4)}-${center.lon.toFixed(4)}` : "none"),
    [center],
  );

  // Pre-compute Google Maps URLs once per places change to avoid recalculation on each render
  const placesWithUrl = useMemo(
    () => places.map((p) => ({ place: p, url: googleMapsUrlFor(p) })),
    [places],
  );

  const handleReset = () => {
    setSource(null);
    setCenter(null);
    setPlaces([]);
    setError(null);
    setLoading(false);
  };

  // Step 1: location selector
  if (!source) {
    return (
      <div className="animate-fade-in">
        <button
          onClick={() => navigate(`/trip/${tripId}/places`)}
          className="flex items-center gap-1 text-sm text-foreground/80 hover:text-foreground mb-3"
        >
          <ArrowLeft className="h-4 w-4" />
          {t.back}
        </button>

        <div className="flex items-center gap-2 mb-1">
          <Icon className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-bold text-card-foreground">{categoryLabel}</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-4">{t.placesChooseLocation}</p>

        <div className="space-y-2">
          <button
            onClick={handleNearMe}
            className="w-full flex items-center gap-3 rounded-xl bg-card p-4 shadow-card hover:shadow-card-hover transition-all duration-300 active:scale-[0.98] text-left"
          >
            <div className="rounded-lg p-2.5 bg-primary/10 text-primary">
              <MapPin className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-card-foreground">
                {t.placesNearMyLocation}
              </p>
              <p className="text-xs text-muted-foreground">{t.placesNearMyLocationDesc}</p>
            </div>
          </button>

          <button
            onClick={handleNearAccommodation}
            className="w-full flex items-center gap-3 rounded-xl bg-card p-4 shadow-card hover:shadow-card-hover transition-all duration-300 active:scale-[0.98] text-left"
          >
            <div className="rounded-lg p-2.5 bg-accent/10 text-accent">
              <Home className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-card-foreground">
                {t.placesNearAccommodation}
              </p>
              <p className="text-xs text-muted-foreground">{t.placesNearAccommodationDesc}</p>
            </div>
          </button>
        </div>
      </div>
    );
  }

  // Step 2: results / loading / error
  return (
    <div className="animate-fade-in">
      <button
        onClick={handleReset}
        className="flex items-center gap-1 text-sm text-foreground/80 hover:text-foreground mb-3"
      >
        <ArrowLeft className="h-4 w-4" />
        {t.back}
      </button>

      <div className="flex items-center gap-2 mb-3">
        <Icon className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-bold text-card-foreground">{categoryLabel}</h2>
        <span className="text-xs text-muted-foreground ml-auto">
          {source === "me" ? t.placesNearMyLocation : t.placesNearAccommodation}
        </span>
      </div>

      {/* Loading: as soon as we have center, show the map; otherwise show full skeleton */}
      {loading && !center && <PlacesSkeleton />}

      {loading && center && (
        <>
          <div className="rounded-xl overflow-hidden shadow-card mb-3" style={{ height: 240 }}>
            <MapContainer
              key={mapKey}
              center={[center.lat, center.lon]}
              zoom={14}
              scrollWheelZoom={false}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={[center.lat, center.lon]} icon={markerIcon} />
            </MapContainer>
          </div>
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-xl bg-card p-3 shadow-card"
              >
                <Skeleton className="h-9 w-9 rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-2/3" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {!loading && error && (
        <div className="rounded-xl bg-card p-4 shadow-card flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-card-foreground">{error}</p>
            {source === "accommodation" && (
              <button
                onClick={handleNearMe}
                className="mt-3 text-xs font-semibold text-primary hover:underline"
              >
                {t.placesUseMyLocationInstead}
              </button>
            )}
          </div>
        </div>
      )}

      {!loading && !error && center && places.length > 0 && (
        <>
          <div className="rounded-xl overflow-hidden shadow-card mb-3" style={{ height: 240 }}>
            <MapContainer
              key={mapKey}
              center={[center.lat, center.lon]}
              zoom={14}
              scrollWheelZoom={false}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {placesWithUrl.map(({ place: p, url }) => (
                <Marker key={p.id} position={[p.lat, p.lon]} icon={markerIcon}>
                  <Popup>
                    <div className="text-xs">
                      <p className="font-semibold">{p.name}</p>
                      <p className="text-muted-foreground">{formatDistance(p.distance)}</p>
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary font-medium"
                      >
                        {t.placesViewOnMap} →
                      </a>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>

          <div className="space-y-2">
            {placesWithUrl.map(({ place: p, url }) => (
              <a
                key={p.id}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-xl bg-card p-3 shadow-card hover:shadow-card-hover transition-all duration-300 active:scale-[0.98]"
              >
                <div className="rounded-lg p-2 bg-primary/10 text-primary flex-shrink-0">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-card-foreground truncate">{p.name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {formatDistance(p.distance)}
                    {p.address ? ` · ${p.address}` : ""}
                  </p>
                </div>
                <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              </a>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default UsefulPlacesCategory;
