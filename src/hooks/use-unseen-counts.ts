import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface UnseenResult {
  counts: Record<string, number>;
  totalUnseen: number;
}

export function useUnseenCounts(): UnseenResult {
  const [counts, setCounts] = useState<Record<string, number>>({});

  const fetchCounts = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase.rpc("get_unseen_counts", {
      p_user_id: user.id,
    });

    if (error) {
      console.error("Error fetching unseen counts:", error);
      return;
    }

    const map: Record<string, number> = {};
    (data || []).forEach((row: { trip_id: string; unseen_count: number }) => {
      map[row.trip_id] = Number(row.unseen_count);
    });
    setCounts(map);
  }, []);

  useEffect(() => {
    fetchCounts();
    const interval = setInterval(fetchCounts, 30000);
    return () => clearInterval(interval);
  }, [fetchCounts]);

  // Listen for section-seen events to refetch immediately
  useEffect(() => {
    const handler = () => fetchCounts();
    window.addEventListener("section-seen", handler);
    return () => window.removeEventListener("section-seen", handler);
  }, [fetchCounts]);

  // Realtime subscriptions for relevant tables
  useEffect(() => {
    const tables = [
      "trip_messages",
      "trip_photos",
      "trip_expenses",
      "trip_accommodation",
      "trip_transport",
      "trip_schedule",
    ];

    const channel = supabase
      .channel("unseen-counts")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: tables[0] }, fetchCounts)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: tables[1] }, fetchCounts)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: tables[2] }, fetchCounts)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: tables[3] }, fetchCounts)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: tables[4] }, fetchCounts)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: tables[5] }, fetchCounts)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchCounts]);

  const totalUnseen = Object.values(counts).reduce((sum, c) => sum + c, 0);

  // PWA badge
  useEffect(() => {
    if ("setAppBadge" in navigator) {
      if (totalUnseen > 0) {
        (navigator as any).setAppBadge(totalUnseen);
      } else {
        (navigator as any).clearAppBadge?.();
      }
    }
  }, [totalUnseen]);

  return { counts, totalUnseen };
}
