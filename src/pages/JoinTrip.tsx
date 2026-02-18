import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const JoinTrip = () => {
  const { inviteCode } = useParams<{ inviteCode: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !inviteCode) return;

    const joinTrip = async () => {
      const { data: trip } = await supabase
        .from("trips")
        .select("id")
        .eq("invite_code", inviteCode.toUpperCase().trim())
        .single();

      if (!trip) {
        setError("Código de invitación inválido o viaje no encontrado.");
        return;
      }

      // Check membership
      const { data: existing } = await supabase
        .from("trip_members")
        .select("id")
        .eq("trip_id", trip.id)
        .eq("user_id", user.id)
        .maybeSingle();

      if (!existing) {
        const { error: insertError } = await supabase.from("trip_members").insert({
          trip_id: trip.id,
          user_id: user.id,
          role: "member",
        });
        if (insertError) {
          setError(insertError.message);
          return;
        }
        toast({ title: "¡Te has unido!", description: "Ahora eres parte del viaje." });
      }

      navigate(`/trip/${trip.id}`, { replace: true });
    };

    joinTrip();
  }, [user, inviteCode, navigate, toast]);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-5 text-center">
        <p className="text-destructive font-semibold mb-2">Error</p>
        <p className="text-muted-foreground text-sm">{error}</p>
        <button onClick={() => navigate("/")} className="mt-4 text-primary font-semibold text-sm hover:underline">
          Ir al inicio
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
};

export default JoinTrip;
