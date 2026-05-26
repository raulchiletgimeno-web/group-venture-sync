import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface UnseenResult {
  counts: Record<string, number>;
  totalUnseen: number;
}

export function useUnseenCounts(): UnseenResult & { pendingTotal: number } {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [pendingTotal, setPendingTotal] = useState(0);

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

    // Fetch pending member counts for admin trips
    const { data: adminTrips } = await supabase
      .from("trip_members")
      .select("trip_id")
      .eq("user_id", user.id)
      .in("role", ["creator", "co-creator"])
      .eq("status", "approved");

    if (adminTrips && adminTrips.length > 0) {
      const tripIds = adminTrips.map((t) => t.trip_id);
      const { count } = await supabase
        .from("trip_members")
        .select("id", { count: "exact", head: true })
        .in("trip_id", tripIds)
        .eq("status", "pending");
      setPendingTotal(count ?? 0);
    } else {
      setPendingTotal(0);
    }
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

  // Refetch counts instantly when the app gains focus
  useEffect(() => {
    const handler = () => {
      if (document.visibilityState === "visible") fetchCounts();
    };
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
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
      "trip_members",
    ];

    let channel: ReturnType<typeof supabase.channel> | null = null;
    let cancelled = false;

    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || cancelled) return;
      channel = supabase
        .channel(`user:${user.id}:unseen`, { config: { private: true } })
        .on("postgres_changes", { event: "INSERT", schema: "public", table: tables[0] }, fetchCounts)
        .on("postgres_changes", { event: "INSERT", schema: "public", table: tables[1] }, fetchCounts)
        .on("postgres_changes", { event: "INSERT", schema: "public", table: tables[2] }, fetchCounts)
        .on("postgres_changes", { event: "INSERT", schema: "public", table: tables[3] }, fetchCounts)
        .on("postgres_changes", { event: "INSERT", schema: "public", table: tables[4] }, fetchCounts)
        .on("postgres_changes", { event: "INSERT", schema: "public", table: tables[5] }, fetchCounts)
        .on("postgres_changes", { event: "*", schema: "public", table: tables[6] }, fetchCounts)
        .subscribe();
    })();

    return () => {
      cancelled = true;
      if (channel) supabase.removeChannel(channel);
    };
  }, [fetchCounts]);

  const totalUnseen = Object.values(counts).reduce((sum, c) => sum + c, 0);
  const badgeTotal = totalUnseen + pendingTotal;

  // PWA badge (includes unseen + pending requests)
  useEffect(() => {
    if ("setAppBadge" in navigator) {
      if (badgeTotal > 0) {
        (navigator as any).setAppBadge(badgeTotal);
      } else {
        (navigator as any).clearAppBadge?.();
        // Clear all remaining system notifications when everything is read
        if ("serviceWorker" in navigator) {
          navigator.serviceWorker.ready.then((reg) => {
            reg.getNotifications().then((notifs) => {
              notifs.forEach((n) => n.close());
            });
          }).catch(() => {});
        }
      }
    }
  }, [badgeTotal]);

  return { counts, totalUnseen, pendingTotal };
}
