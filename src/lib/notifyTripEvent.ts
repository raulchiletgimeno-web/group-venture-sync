import { supabase } from "@/integrations/supabase/client";

/**
 * Throttle map: key = `${tripId}:${section}` → timestamp of last notification sent.
 * Prevents notification spam, especially in active chat conversations.
 */
const lastNotifyMap = new Map<string, number>();
const CHAT_THROTTLE_MS = 30_000; // 30 seconds for chat
const DEFAULT_THROTTLE_MS = 5_000; // 5 seconds for other sections (dedup rapid clicks)

/**
 * Fire-and-forget push notification to all trip members (except the actor).
 * Chat notifications are throttled to max 1 per 30s per trip to avoid spam.
 * Other sections are debounced at 5s to prevent duplicate rapid actions.
 * Errors are logged but never block the caller.
 */
export const notifyTripEvent = (
  tripId: string | undefined,
  section: string,
  actorUserId: string | undefined
) => {
  if (!tripId || !actorUserId) return;

  const key = `${tripId}:${section}`;
  const now = Date.now();
  const throttleMs = section === "chat" ? CHAT_THROTTLE_MS : DEFAULT_THROTTLE_MS;
  const lastSent = lastNotifyMap.get(key) ?? 0;

  if (now - lastSent < throttleMs) {
    return; // Skip — too soon since last notification for this trip+section
  }

  lastNotifyMap.set(key, now);

  supabase.functions
    .invoke("notify-trip", {
      body: { trip_id: tripId, section, actor_user_id: actorUserId },
    })
    .then(({ error }) => {
      if (error) console.warn("notifyTripEvent error:", error);
    })
    .catch((err) => console.warn("notifyTripEvent failed:", err));
};
