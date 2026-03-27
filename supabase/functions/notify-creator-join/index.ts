import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: corsHeaders,
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: corsHeaders,
      });
    }

    const requesterId = claimsData.claims.sub;

    const { tripId } = await req.json();
    if (!tripId) {
      return new Response(JSON.stringify({ error: "tripId required" }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    // Service role client for cross-user queries
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Fetch trip title
    const { data: trip } = await adminClient
      .from("trips")
      .select("title")
      .eq("id", tripId)
      .single();

    if (!trip) {
      return new Response(JSON.stringify({ error: "Trip not found" }), {
        status: 404,
        headers: corsHeaders,
      });
    }

    // Fetch requester name
    const { data: requesterProfile } = await adminClient
      .from("profiles")
      .select("name, email")
      .eq("id", requesterId)
      .single();

    const requesterName = requesterProfile?.name || requesterProfile?.email || "Alguien";

    // Fetch creator + co-creator user IDs (admins only)
    const { data: admins } = await adminClient
      .from("trip_members")
      .select("user_id")
      .eq("trip_id", tripId)
      .in("role", ["creator", "co-creator"])
      .eq("status", "approved");

    if (!admins || admins.length === 0) {
      return new Response(JSON.stringify({ notified: 0, message: "no_admins" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminIds = admins.map((a) => a.user_id);

    // Fetch push subscriptions for admins
    const { data: subscriptions } = await adminClient
      .from("push_subscriptions")
      .select("id, user_id, endpoint, p256dh, auth")
      .in("user_id", adminIds);

    if (!subscriptions || subscriptions.length === 0) {
      console.log(`notify-creator-join: no push subscriptions for admins of trip "${trip.title}"`);
      return new Response(JSON.stringify({ notified: 0, message: "no_subscriptions" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Configure VAPID
    const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY")!;
    const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY")!;
    webpush.setVapidDetails("mailto:noreply@yormit.app", vapidPublicKey, vapidPrivateKey);

    const payload = JSON.stringify({
      title: `YORMIT · ${trip.title}`,
      body: `${requesterName} quiere unirse a este viaje 🔔`,
      icon: "/pwa-icon-192.png",
      data: { url: `/trip/${tripId}` },
    });

    let sent = 0;
    const expired: string[] = [];

    for (const sub of subscriptions) {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload
        );
        sent++;
      } catch (err: any) {
        console.error(`Push failed for ${sub.endpoint}:`, err.statusCode, err.body);
        if (err.statusCode === 410 || err.statusCode === 404 || err.statusCode === 403) {
          expired.push(sub.id);
        }
      }
    }

    // Clean up expired subscriptions
    if (expired.length > 0) {
      await adminClient.from("push_subscriptions").delete().in("id", expired);
      console.log(`Cleaned up ${expired.length} expired subscriptions`);
    }

    console.log(
      `notify-creator-join: ${requesterName} → "${trip.title}", sent=${sent}/${subscriptions.length}`
    );

    return new Response(
      JSON.stringify({ notified: sent, total: subscriptions.length, expired: expired.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("notify-creator-join error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
