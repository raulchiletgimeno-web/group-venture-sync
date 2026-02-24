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

interface JoinTripDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const JoinTripDialog = ({ open, onOpenChange }: JoinTripDialogProps) => {
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const { t } = useLanguage();
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
      toast({ title: t.invalidCode, description: t.invalidCodeDesc, variant: "destructive" });
      setSubmitting(false);
      return;
    }

    const { data: existing } = await supabase
      .from("trip_members")
      .select("id, status")
      .eq("trip_id", trip.id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (existing) {
      if (existing.status === "pending") {
        toast({ title: t.joinRequestSent, description: t.joinRequestSentDesc });
      } else {
        toast({ title: t.alreadyMember, description: t.alreadyMemberDesc });
      }
    } else {
      const { error } = await supabase.from("trip_members").insert({
        trip_id: trip.id,
        user_id: user.id,
        role: "member",
        status: "pending",
      });
      if (error) {
        toast({ title: t.error, description: error.message, variant: "destructive" });
        setSubmitting(false);
        return;
      }

      // Notify creator (fire and forget)
      supabase.functions.invoke("notify-creator-join", {
        body: { tripId: trip.id },
      });

      toast({ title: t.joinRequestSent, description: t.joinRequestSentDesc });
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
          <DialogTitle>{t.joinTripTitle}</DialogTitle>
          <DialogDescription>{t.joinTripDesc}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="invite-code">{t.inviteCodeLabel}</Label>
            <Input
              id="invite-code"
              placeholder={t.inviteCodePlaceholder}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              className="uppercase tracking-widest text-center font-mono"
            />
          </div>
          <Button type="submit" className="w-full font-semibold" disabled={submitting}>
            {submitting ? t.searching : t.joinMe}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default JoinTripDialog;
