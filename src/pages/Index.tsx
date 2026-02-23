import { useState, useEffect } from "react";
import { Plus, UserPlus, Compass, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import TripCard from "@/components/TripCard";
import EmptyState from "@/components/EmptyState";
import CreateTripDialog from "@/components/CreateTripDialog";
import JoinTripDialog from "@/components/JoinTripDialog";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { languageFlags, Language } from "@/i18n/translations";
import { getLocale } from "@/i18n/translations";
import { supabase } from "@/integrations/supabase/client";
import heroImage from "@/assets/hero-travel.jpg";

interface Trip {
  id: string;
  title: string;
  destination: string;
  start_date: string;
  end_date: string;
  status: "upcoming" | "active" | "finished";
  memberCount: number;
}

const Index = () => {
  const { profile, signOut } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);

  const formatDate = (d: string) => {
    const date = new Date(d + "T00:00:00");
    return date.toLocaleDateString(getLocale(language), { day: "numeric", month: "short" });
  };

  const fetchTrips = async () => {
    const { data } = await supabase
      .from("trips")
      .select("*, trip_members!inner(user_id)")
      .order("start_date", { ascending: true });

    if (data) {
      const tripsWithCounts = await Promise.all(
        data.map(async (trip) => {
          const { count } = await supabase
            .from("trip_members")
            .select("id", { count: "exact", head: true })
            .eq("trip_id", trip.id);
          return {
            id: trip.id,
            title: trip.title,
            destination: trip.destination,
            start_date: trip.start_date,
            end_date: trip.end_date,
            status: trip.status as Trip["status"],
            memberCount: count ?? 0,
          };
        })
      );
      setTrips(tripsWithCounts);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const flagLanguages: Language[] = ["en", "fr", "pt", "it"];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImage} alt="Travel illustration" className="w-full h-full object-cover opacity-30" />
          <div className="absolute inset-0 gradient-hero opacity-80" />
        </div>
        <div className="relative px-5 pt-14 pb-10">
          {/* User header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Compass className="h-6 w-6 text-primary-foreground" />
              <span className="text-sm font-semibold tracking-wider text-primary-foreground/80 uppercase">LORMIT</span>
            </div>
            <div className="flex items-center gap-2">
              {profile?.name && (
                <span className="text-xs font-medium text-foreground">{t.user}: {profile.name}</span>
              )}
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-foreground hover:text-foreground hover:bg-foreground/10"
                onClick={signOut}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <h1 className="text-3xl font-extrabold text-primary-foreground mt-3 leading-tight whitespace-pre-line">
            {t.heroTitle}
          </h1>
          <p className="text-sm text-primary-foreground/75 mt-3 max-w-xs leading-relaxed">
            {t.heroSubtitle}
          </p>
          <div className="flex gap-3 mt-6">
            <Button
              size="lg"
              className="bg-card text-foreground hover:bg-card/90 font-semibold shadow-card-hover"
              onClick={() => setCreateOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              {t.createTrip}
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-primary-foreground/60 text-foreground bg-card hover:bg-card/90 font-semibold shadow-card-hover"
              onClick={() => setJoinOpen(true)}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              {t.joinTrip}
            </Button>
          </div>

          {/* Language flags */}
          <div className="flex items-center gap-3 mt-5">
            {flagLanguages.map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`transition-all duration-200 rounded-sm ${
                  language === lang
                    ? "scale-125 drop-shadow-lg ring-2 ring-white"
                    : "opacity-70 hover:opacity-100 hover:scale-110"
                }`}
                title={lang.toUpperCase()}
              >
                <img src={languageFlags[lang]} alt={lang.toUpperCase()} className="w-8 h-6 rounded-sm object-cover border border-white/30" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Trips List */}
      <div className="px-5 py-6">
        <h2 className="text-lg font-bold text-foreground mb-4">{t.myTrips}</h2>
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : trips.length === 0 ? (
          <EmptyState
            title={t.noTripsTitle}
            description={t.noTripsDesc}
          />
        ) : (
          <div className="flex flex-col gap-3">
            {trips.map((trip) => (
              <TripCard
                key={trip.id}
                id={trip.id}
                title={trip.title}
                destination={trip.destination}
                startDate={formatDate(trip.start_date)}
                endDate={formatDate(trip.end_date)}
                memberCount={trip.memberCount}
                status={trip.status}
              />
            ))}
          </div>
        )}
      </div>

      <CreateTripDialog open={createOpen} onOpenChange={setCreateOpen} />
      <JoinTripDialog open={joinOpen} onOpenChange={setJoinOpen} />
    </div>
  );
};

export default Index;
