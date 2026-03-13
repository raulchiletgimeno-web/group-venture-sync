import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useMarkSectionSeen(tripId: string | undefined, section: string) {
  useEffect(() => {
    if (!tripId) return;
    const mark = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase.from("trip_last_seen").upsert(
        { trip_id: tripId, user_id: user.id, section, last_seen_at: new Date().toISOString() },
        { onConflict: "trip_id,user_id,section" }
      );
    };
    mark();
  }, [tripId, section]);
}
