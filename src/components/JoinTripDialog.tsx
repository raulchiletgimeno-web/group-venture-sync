import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface JoinTripDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const JoinTripDialog = ({ open, onOpenChange }: JoinTripDialogProps) => {
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);

    const { data: trip } = await supabase
      .from("trips")
      .select("id")
      .eq("invite_code", code.toUpperCase().trim())
      .single();

    if (!trip) {
      toast({ title: "Código inválido", description: "No se encontró ningún viaje con ese código.", variant: "destructive" });
      setSubmitting(false);
      return;
    }

    // Check if already a member
    const { data: existing } = await supabase
      .from("trip_members")
      .select("id")
      .eq("trip_id", trip.id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (existing) {
      toast({ title: "Ya eres miembro", description: "Ya formas parte de este viaje." });
    } else {
      const { error } = await supabase.from("trip_members").insert({
        trip_id: trip.id,
        user_id: user.id,
        role: "member",
      });
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
        setSubmitting(false);
        return;
      }
      toast({ title: "¡Te has unido!", description: "Ahora eres parte del viaje." });
    }

    onOpenChange(false);
    setCode("");
    setSubmitting(false);
    navigate(`/trip/${trip.id}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm mx-auto">
        <DialogHeader>
          <DialogTitle>Unirse a un viaje</DialogTitle>
          <DialogDescription>Pega el código de invitación que te compartieron.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="invite-code">Código de invitación</Label>
            <Input
              id="invite-code"
              placeholder="Ej: A1B2C3D4"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              className="uppercase tracking-widest text-center font-mono"
            />
          </div>
          <Button type="submit" className="w-full font-semibold" disabled={submitting}>
            {submitting ? "Buscando..." : "Unirme"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default JoinTripDialog;
