import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useTripRole(tripId: string | undefined) {
  const [isCreator, setIsCreator] = useState(false);
  const [isOriginalCreator, setIsOriginalCreator] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tripId) return;

    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data } = await supabase
        .from("trip_members")
        .select("role")
        .eq("trip_id", tripId)
        .eq("user_id", user.id)
        .single();

      setIsCreator(data?.role === "creator" || data?.role === "co-creator");
      setIsOriginalCreator(data?.role === "creator");
      setLoading(false);
    };

    check();
  }, [tripId]);

  return { isCreator, isOriginalCreator, loading };
}
