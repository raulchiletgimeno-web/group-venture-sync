import { useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

const markSeen = async (tripId: string, section: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("trip_last_seen").upsert(
    { trip_id: tripId, user_id: user.id, section, last_seen_at: new Date().toISOString() },
    { onConflict: "trip_id,user_id,section" }
  );
  window.dispatchEvent(new CustomEvent("section-seen", { detail: { tripId, section } }));
};

export function useMarkSectionSeen(tripId: string | undefined, section: string) {
  const mark = useCallback(() => {
    if (tripId) markSeen(tripId, section);
  }, [tripId, section]);

  useEffect(() => {
    mark();
    return () => { mark(); };
  }, [mark]);
}
