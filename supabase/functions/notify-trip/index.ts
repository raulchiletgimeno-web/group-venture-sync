import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const sectionMessages: Record<string, string> = {
  chat: "Tienes un nuevo mensaje en el chat 💬",
  photos: "Se ha subido una nueva foto 📸",
  expenses: "Hay un nuevo gasto compartido 💰",
  transport: "Se ha actualizado el transporte 🚗",
  accommodation: "Se ha actualizado el alojamiento 🏨",
  schedule: "Hay una nueva actividad en el plan 📅",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { trip_id, section, actor_user_id } = await req.json();

    if (!trip_id || !section || !actor_user_id) {
      return new Response(JSON.stringify({ error: "trip_id, section, actor_user_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY")!;
    const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY")!;

    webpush.setVapidDetails("mailto:noreply@yormit.app", vapidPublicKey, vapidPrivateKey);

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Fetch trip title
    const { data: trip, error: tripError } = await supabaseAdmin
      .from("trips")
      .select("title")
      .eq("id", trip_id)
      .single();

    if (tripError || !trip) {
      console.error("Trip not found:", tripError);
      return new Response(JSON.stringify({ error: "trip_not_found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch approved members excluding the actor
    const { data: members, error: membersError } = await supabaseAdmin
      .from("trip_members")
      .select("user_id")
      .eq("trip_id", trip_id)
      .eq("status", "approved")
      .neq("user_id", actor_user_id);

    if (membersError) {
      console.error("Error fetching members:", membersError);
      return new Response(JSON.stringify({ error: "members_error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!members || members.length === 0) {
      return new Response(JSON.stringify({ notified: 0, message: "no_other_members" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const memberIds = members.map((m) => m.user_id);

    // Fetch all push subscriptions for these members
    const { data: subscriptions, error: subError } = await supabaseAdmin
      .from("push_subscriptions")
      .select("id, user_id, endpoint, p256dh, auth")
      .in("user_id", memberIds);

    if (subError) {
      console.error("Error fetching subscriptions:", subError);
      return new Response(JSON.stringify({ error: "subscriptions_error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(JSON.stringify({ notified: 0, message: "no_subscriptions" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = sectionMessages[section] || `Nueva actualización en ${section}`;
    const deepUrl = `/trip/${trip_id}/${section}`;

    const payload = JSON.stringify({
      title: `YORMIT · ${trip.title}`,
      body,
      icon: "/pwa-icon-192.png",
      data: { url: deepUrl },
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
      await supabaseAdmin.from("push_subscriptions").delete().in("id", expired);
      console.log(`Cleaned up ${expired.length} expired subscriptions`);
    }

    console.log(`notify-trip: section=${section}, trip=${trip.title}, sent=${sent}/${subscriptions.length}`);

    return new Response(JSON.stringify({ notified: sent, total: subscriptions.length, expired: expired.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("notify-trip error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
