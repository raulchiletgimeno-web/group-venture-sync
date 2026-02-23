import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const generateInviteCode = () =>
  Array.from(crypto.getRandomValues(new Uint8Array(6)))
    .map((b) => b.toString(36).padStart(2, "0"))
    .join("")
    .slice(0, 8)
    .toUpperCase();

interface CreateTripDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateTripDialog = ({ open, onOpenChange }: CreateTripDialogProps) => {
  const [title, setTitle] = useState("");
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);

    const inviteCode = generateInviteCode();

    const { data: trip, error } = await supabase
      .from("trips")
      .insert({
        title,
        destination,
        start_date: startDate,
        end_date: endDate,
        created_by: user.id,
        invite_code: inviteCode,
      })
      .select()
      .single();

    if (error || !trip) {
      toast({ title: t.errorCreatingTrip, description: error?.message, variant: "destructive" });
      setSubmitting(false);
      return;
    }

    await supabase.from("trip_members").insert({
      trip_id: trip.id,
      user_id: user.id,
      role: "creator",
    });

    toast({ title: t.tripCreated, description: `${t.inviteCode}: ${inviteCode}` });
    onOpenChange(false);
    setTitle("");
    setDestination("");
    setStartDate("");
    setEndDate("");
    setSubmitting(false);
    navigate(`/trip/${trip.id}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm mx-auto">
        <DialogHeader>
          <DialogTitle>{t.createTripTitle}</DialogTitle>
          <DialogDescription>{t.createTripDesc}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="trip-title">{t.title}</Label>
            <Input id="trip-title" placeholder={t.titlePlaceholder} value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="trip-dest">{t.destination}</Label>
            <Input id="trip-dest" placeholder={t.destinationPlaceholder} value={destination} onChange={(e) => setDestination(e.target.value)} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="trip-start">{t.start}</Label>
              <Input id="trip-start" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="trip-end">{t.end}</Label>
              <Input id="trip-end" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
            </div>
          </div>
          <Button type="submit" className="w-full font-semibold" disabled={submitting}>
            {submitting ? t.creating : t.createTrip}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTripDialog;
