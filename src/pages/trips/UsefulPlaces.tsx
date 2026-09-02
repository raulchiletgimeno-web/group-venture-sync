import { Link, useParams } from "react-router-dom";
import {
  MapPinned,
  UtensilsCrossed,
  Coffee,
  ShoppingCart,
  Pill,
  Hotel,
  Landmark,
  Banknote,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import type { PlaceCategory } from "@/lib/usefulPlaces";

const UsefulPlaces = () => {
  const { tripId } = useParams();
  const { t } = useLanguage();

  const categories: {
    key: PlaceCategory;
    label: string;
    icon: typeof UtensilsCrossed;
    color: string;
  }[] = [
    { key: "restaurants", label: t.placesRestaurants, icon: UtensilsCrossed, color: "bg-primary/10 text-primary" },
    { key: "cafes", label: t.placesCafesBars, icon: Coffee, color: "bg-accent/10 text-accent" },
    { key: "supermarkets", label: t.placesSupermarkets, icon: ShoppingCart, color: "bg-primary/10 text-primary" },
    { key: "pharmacies", label: t.placesPharmacies, icon: Pill, color: "bg-accent/10 text-accent" },
    { key: "hotels", label: t.placesHotels, icon: Hotel, color: "bg-primary/10 text-primary" },
    { key: "touristic", label: t.placesTouristic, icon: Landmark, color: "bg-accent/10 text-accent" },
    { key: "atms", label: t.placesAtmsBanks, icon: Banknote, color: "bg-primary/10 text-primary" },
  ];

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-2 mb-1">
        <MapPinned className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-bold text-card-foreground">{t.usefulPlaces}</h2>
      </div>
      <p className="text-sm text-muted-foreground mb-4">{t.usefulPlacesDesc}</p>

      <div className="grid grid-cols-2 gap-2">
        {categories.map(({ key, label, icon: Icon, color }) => (
          <Link
            key={key}
            to={`/trip/${tripId}/places/${key}`}
            className="rounded-xl bg-card p-3 shadow-card hover:shadow-card-hover transition-all duration-300 active:scale-[0.98] flex flex-col items-start gap-2"
          >
            <div className={`rounded-lg p-2 ${color}`}>
              <Icon className="h-5 w-5" />
            </div>
            <span className="text-xs font-semibold text-card-foreground leading-tight">
              {label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default UsefulPlaces;
