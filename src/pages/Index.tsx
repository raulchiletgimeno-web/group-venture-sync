import { useState, useEffect } from "react";
import { Plus, UserPlus, Compass, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import TripCard from "@/components/TripCard";
import EmptyState from "@/components/EmptyState";
import CreateTripDialog from "@/components/CreateTripDialog";
import JoinTripDialog from "@/components/JoinTripDialog";
import { useAuth } from "@/contexts/AuthContext";
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

const formatDate = (d: string) => {
  const date = new Date(d + "T00:00:00");
  return date.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
};

const Index = () => {
  const { profile, signOut } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);

  const fetchTrips = async () => {
    const { data } = await supabase
      .from("trips")
      .select("*, trip_members!inner(user_id)")
      .order("start_date", { ascending: true });

    if (data) {
      // Get member counts for each trip
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
              <span className="text-sm font-semibold tracking-wider text-primary-foreground/80 uppercase">Nuestro viaje</span>
            </div>
            <div className="flex items-center gap-2">
              {profile?.name && (
                <span className="text-xs font-medium text-primary-foreground/70">{profile.name}</span>
              )}
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10"
                onClick={signOut}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <h1 className="text-3xl font-extrabold text-primary-foreground mt-3 leading-tight">
            Organiza viajes<br />en grupo, sin caos.
          </h1>
          <p className="text-sm text-primary-foreground/75 mt-3 max-w-xs leading-relaxed">
            Transporte, alojamiento, gastos, fotos y chat — todo en un solo lugar.
          </p>
          <div className="flex gap-3 mt-6">
            <Button
              size="lg"
              className="bg-card text-foreground hover:bg-card/90 font-semibold shadow-card-hover"
              onClick={() => setCreateOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Crear viaje
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-primary-foreground/60 text-foreground bg-primary-foreground/15 hover:bg-primary-foreground/25 font-semibold backdrop-blur-sm"
              onClick={() => setJoinOpen(true)}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Unirse
            </Button>
          </div>
        </div>
      </div>

      {/* Trips List */}
      <div className="px-5 py-6">
        <h2 className="text-lg font-bold text-foreground mb-4">Mis Viajes</h2>
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : trips.length === 0 ? (
          <EmptyState
            title="Sin viajes aún"
            description="Crea tu primer viaje o únete a uno con un código de invitación."
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
