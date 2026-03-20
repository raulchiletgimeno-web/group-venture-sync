import { supabase } from "@/integrations/supabase/client";

/**
 * Fire-and-forget push notification to all trip members (except the actor).
 * Errors are logged but never block the caller.
 */
export const notifyTripEvent = (
  tripId: string | undefined,
  section: string,
  actorUserId: string | undefined
) => {
  if (!tripId || !actorUserId) return;

  supabase.functions
    .invoke("notify-trip", {
      body: { trip_id: tripId, section, actor_user_id: actorUserId },
    })
    .then(({ error }) => {
      if (error) console.warn("notifyTripEvent error:", error);
    })
    .catch((err) => console.warn("notifyTripEvent failed:", err));
};
