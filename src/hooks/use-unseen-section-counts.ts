import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useUnseenSectionCounts(tripId: string | undefined) {
  const [counts, setCounts] = useState<Record<string, number>>({});

  const fetchCounts = useCallback(async () => {
    if (!tripId) return;
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
  }, [tripId]);

  // Initial fetch + polling
  useEffect(() => {
    fetchCounts();
    const interval = setInterval(fetchCounts, 30000);
    return () => clearInterval(interval);
  }, [fetchCounts]);

  // Realtime subscriptions for content tables
  useEffect(() => {
    if (!tripId) return;

    const tables = [
      "trip_messages",
      "trip_photos",
      "trip_expenses",
      "trip_accommodation",
      "trip_transport",
      "trip_schedule",
    ];

    const channel = supabase
      .channel(`unseen-section-${tripId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: tables[0], filter: `trip_id=eq.${tripId}` }, fetchCounts)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: tables[1], filter: `trip_id=eq.${tripId}` }, fetchCounts)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: tables[2], filter: `trip_id=eq.${tripId}` }, fetchCounts)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: tables[3], filter: `trip_id=eq.${tripId}` }, fetchCounts)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: tables[4], filter: `trip_id=eq.${tripId}` }, fetchCounts)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: tables[5], filter: `trip_id=eq.${tripId}` }, fetchCounts)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tripId, fetchCounts]);

  // Listen for section-seen events to refetch immediately
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.tripId === tripId) {
        fetchCounts();
      }
    };
    window.addEventListener("section-seen", handler);
    return () => window.removeEventListener("section-seen", handler);
  }, [tripId, fetchCounts]);

  return counts;
}
