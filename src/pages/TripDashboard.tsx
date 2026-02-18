import { useParams, Link } from "react-router-dom";
import {
  Plane,
  Hotel,
  Receipt,
  Camera,
  MessageCircle,
  CloudSun,
  CalendarDays,
  Users,
  MapPin,
  Calendar,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const sections = [
  { path: "transport", label: "Transporte", icon: Plane, color: "bg-primary/10 text-primary" },
  { path: "accommodation", label: "Alojamiento", icon: Hotel, color: "bg-accent/10 text-accent" },
  { path: "expenses", label: "Gastos", icon: Receipt, color: "bg-secondary text-secondary-foreground" },
  { path: "photos", label: "Fotos", icon: Camera, color: "bg-primary/10 text-primary" },
  { path: "chat", label: "Chat", icon: MessageCircle, color: "bg-accent/10 text-accent" },
  { path: "weather", label: "El Tiempo", icon: CloudSun, color: "bg-secondary text-secondary-foreground" },
  { path: "schedule", label: "Horario", icon: CalendarDays, color: "bg-primary/10 text-primary" },
];

const TripDashboard = () => {
  const { tripId } = useParams();

  return (
    <div className="animate-fade-in">
      {/* Trip Info Card */}
      <div className="rounded-xl bg-card p-5 shadow-card mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-card-foreground">Barcelona con amigos</h2>
            <div className="flex items-center gap-1.5 mt-2 text-muted-foreground text-sm">
              <MapPin className="h-3.5 w-3.5" />
              <span>Barcelona, España</span>
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-muted-foreground text-sm">
              <Calendar className="h-3.5 w-3.5" />
              <span>15 Mar — 20 Mar 2026</span>
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-muted-foreground text-sm">
              <Users className="h-3.5 w-3.5" />
              <span>6 miembros</span>
            </div>
          </div>
          <span className="gradient-hero text-primary-foreground text-xs font-medium px-2.5 py-1 rounded-full">
            En curso
          </span>
        </div>
        <div className="mt-4">
          <Button variant="outline" size="sm" className="text-sm">
            <Share2 className="h-3.5 w-3.5 mr-1.5" />
            Invitar amigos
          </Button>
        </div>
      </div>

      {/* Quick Access Grid */}
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
        Secciones
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {sections.map(({ path, label, icon: Icon, color }) => (
          <Link
            key={path}
            to={`/trip/${tripId}/${path}`}
            className="flex items-center gap-3 rounded-xl bg-card p-4 shadow-card hover:shadow-card-hover transition-all duration-300"
          >
            <div className={`rounded-lg p-2.5 ${color}`}>
              <Icon className="h-5 w-5" />
            </div>
            <span className="text-sm font-semibold text-card-foreground">{label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default TripDashboard;
