import { Plus, UserPlus, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import TripCard from "@/components/TripCard";
import heroImage from "@/assets/hero-travel.jpg";

const mockTrips = [
  {
    id: "1",
    title: "Barcelona con amigos",
    destination: "Barcelona, España",
    startDate: "15 Mar",
    endDate: "20 Mar",
    memberCount: 6,
    status: "active" as const,
  },
  {
    id: "2",
    title: "Fin de semana en Lisboa",
    destination: "Lisboa, Portugal",
    startDate: "5 Abr",
    endDate: "7 Abr",
    memberCount: 4,
    status: "upcoming" as const,
  },
  {
    id: "3",
    title: "Esquí en los Alpes",
    destination: "Chamonix, Francia",
    startDate: "10 Ene",
    endDate: "15 Ene",
    memberCount: 8,
    status: "finished" as const,
  },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Travel illustration"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 gradient-hero opacity-80" />
        </div>
        <div className="relative px-5 pt-14 pb-10">
          <div className="flex items-center gap-2 mb-1">
            <Compass className="h-6 w-6 text-primary-foreground" />
            <span className="text-sm font-semibold tracking-wider text-primary-foreground/80 uppercase">
              TripMate
            </span>
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
            >
              <Plus className="h-4 w-4 mr-2" />
              Crear viaje
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 font-semibold"
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
        <div className="flex flex-col gap-3">
          {mockTrips.map((trip) => (
            <TripCard key={trip.id} {...trip} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;
