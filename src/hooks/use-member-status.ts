import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useMemberStatus(tripId: string | undefined) {
  const [status, setStatus] = useState<"approved" | "pending" | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tripId) return;

    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data } = await supabase
        .from("trip_members")
        .select("status")
        .eq("trip_id", tripId)
        .eq("user_id", user.id)
        .single();

      setStatus((data?.status as "approved" | "pending") ?? null);
      setLoading(false);
    };

    check();

    // Subscribe to changes on this member's status
    const channel = supabase
      .channel(`trip:${tripId}:members`, { config: { private: true } })
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "trip_members",
          filter: `trip_id=eq.${tripId}`,
        },
        async () => {
          // Re-check status
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return;
          const { data } = await supabase
            .from("trip_members")
            .select("status")
            .eq("trip_id", tripId)
            .eq("user_id", user.id)
            .single();
          setStatus((data?.status as "approved" | "pending") ?? null);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [tripId]);

  return { status, loading };
}
