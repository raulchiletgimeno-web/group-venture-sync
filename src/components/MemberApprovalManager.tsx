import { useEffect, useState } from "react";
import { Check, X, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatDisplayName } from "@/lib/formatDisplayName";

interface PendingMember {
  id: string;
  user_id: string;
  name: string | null;
}

interface MemberApprovalManagerProps {
  tripId: string;
}

const MemberApprovalManager = ({ tripId }: MemberApprovalManagerProps) => {
  const [pending, setPending] = useState<PendingMember[]>([]);
  const { toast } = useToast();
  const { t } = useLanguage();

  const fetchPending = async () => {
    const { data } = await supabase
      .from("trip_members")
      .select("id, user_id")
      .eq("trip_id", tripId)
      .eq("status", "pending");

    if (!data || data.length === 0) {
      setPending([]);
      return;
    }

    // Get profiles for pending members
    const userIds = data.map((m) => m.user_id);
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, name")
      .in("id", userIds);

    const merged = data.map((m) => {
      const profile = profiles?.find((p) => p.id === m.user_id);
      return {
        id: m.id,
        user_id: m.user_id,
        name: profile?.name ?? null,
      };
    });

    setPending(merged);
  };

  useEffect(() => {
    fetchPending();

    const channel = supabase
      .channel(`trip:${tripId}:members`, { config: { private: true } })
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "trip_members",
          filter: `trip_id=eq.${tripId}`,
        },
        () => fetchPending()
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [tripId]);

  const handleApprove = async (memberId: string) => {
    const { error } = await supabase
      .from("trip_members")
      .update({ status: "approved" })
      .eq("id", memberId);

    if (error) {
      toast({ title: t.error, description: error.message, variant: "destructive" });
    } else {
      toast({ title: t.memberApproved });
      fetchPending();
    }
  };

  const handleReject = async (memberId: string) => {
    const { error } = await supabase
      .from("trip_members")
      .delete()
      .eq("id", memberId);

    if (error) {
      toast({ title: t.error, description: error.message, variant: "destructive" });
    } else {
      toast({ title: t.memberRejected });
      fetchPending();
    }
  };

  if (pending.length === 0) return null;

  return (
    <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <UserCheck className="h-4 w-4 text-amber-600" />
        <h3 className="text-sm font-semibold text-amber-800">
          {t.pendingRequests} ({pending.length})
        </h3>
      </div>
      <div className="space-y-2">
        {pending.map((member) => (
          <div
            key={member.id}
            className="flex items-center justify-between rounded-lg bg-card p-3"
          >
            <div>
              <p className="text-sm font-medium text-card-foreground">
                {formatDisplayName(member.name, t.usuario)}
              </p>
            </div>
            <div className="flex gap-1.5">
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-emerald-600 hover:bg-emerald-50"
                onClick={() => handleApprove(member.id)}
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-destructive hover:bg-destructive/10"
                onClick={() => handleReject(member.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MemberApprovalManager;
