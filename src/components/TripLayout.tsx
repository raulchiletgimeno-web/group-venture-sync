import { ArrowLeft } from "lucide-react";
import { Link, Outlet, useParams } from "react-router-dom";
import TripBottomNav from "./TripBottomNav";

const TripLayout = () => {
  const { tripId } = useParams<{ tripId: string }>();

  // Mock trip title for now
  const tripTitle = "Viaje a Barcelona";

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-lg border-b border-border">
        <div className="flex items-center gap-3 px-4 h-14">
          <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-base font-bold text-foreground truncate">{tripTitle}</h1>
        </div>
      </header>

      {/* Content */}
      <main className="container max-w-lg mx-auto px-4 py-4">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      {tripId && <TripBottomNav tripId={tripId} />}
    </div>
  );
};

export default TripLayout;
