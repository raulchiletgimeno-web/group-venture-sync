import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Link, Outlet, useParams, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const TripLayout = () => {
  const { tripId } = useParams<{ tripId: string }>();
  const location = useLocation();
  const [tripTitle, setTripTitle] = useState("Cargando...");

  // If we're inside a sub-section, go back to the trip dashboard; otherwise go home
  const isSubSection = tripId && location.pathname !== `/trip/${tripId}`;
  const backTo = isSubSection ? `/trip/${tripId}` : "/";

  useEffect(() => {
    if (!tripId) return;
    supabase
      .from("trips")
      .select("title")
      .eq("id", tripId)
      .single()
      .then(({ data }) => {
        if (data) setTripTitle(data.title);
      });
  }, [tripId]);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-lg border-b border-border">
        <div className="flex items-center gap-3 px-4 h-14">
          <Link to={backTo} className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-base font-bold text-foreground truncate">{tripTitle}</h1>
        </div>
      </header>
      <main className="container max-w-lg mx-auto px-4 py-4">
        <Outlet />
      </main>
    </div>
  );
};

export default TripLayout;
