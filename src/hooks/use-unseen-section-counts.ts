import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useUnseenSectionCounts(tripId: string | undefined) {
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!tripId) return;

    const fetch = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase.rpc("get_unseen_section_counts", {
        p_user_id: user.id,
        p_trip_id: tripId,
      });

      if (!error && data) {
        const map: Record<string, number> = {};
        (data as { section: string; unseen_count: number }[]).forEach((r) => {
          map[r.section] = Number(r.unseen_count);
        });
        setCounts(map);
      }
    };

    fetch();
  }, [tripId]);

  return counts;
}
