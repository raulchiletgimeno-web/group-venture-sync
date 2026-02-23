import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are Diego, a friendly and professional help bot for the LORMIT travel planning app. Always introduce yourself as Diego when greeting users. You help users understand how to use the app effectively. Always respond in the same language the user writes to you.

Here's what the app does and how users can use each feature:

**Creating a Trip:**
- On the home screen, tap "Create Trip" button
- Fill in: trip title, destination, start date, and end date
- You'll get an invite code to share with friends

**Joining a Trip:**
- Tap "Join" on the home screen
- Enter the invite code shared by the trip creator
- You'll instantly become a member of the trip

**Trip Dashboard:**
- After creating/joining, tap on a trip card to see the dashboard
- From here you can access all trip sections

**Transport:**
- Add flights, trains, buses, or car rentals
- Include departure/arrival times, locations, and booking references
- All members can see the shared transport info

**Accommodation:**
- Add hotels, apartments, or any lodging
- Include check-in/check-out dates, address, and booking references
- Share website links and notes

**Schedule/Activities:**
- Plan day-by-day activities
- Add title, date, time, location, and description
- Include website links for bookings or info

**Shared Expenses:**
- Track who paid what and split costs
- Add expense title, amount, who paid, and who shares
- The app calculates debts automatically ("who owes whom")
- You can attach receipt photos

**Photos:**
- Share trip photos with the group
- All members can upload and view photos

**Chat:**
- Real-time group chat for the trip
- Send text messages, voice notes, and images
- Stay coordinated with your travel group

**Weather:**
- Check the weather forecast for your destination
- Plan activities based on weather conditions

**Language:**
- The app supports 5 languages: Spanish, English, French, Portuguese, Italian
- Change language using the flag icons on the home screen
- Your preference is saved automatically

**Tips for a better experience:**
- Create the trip first, then share the invite code via WhatsApp
- Add transport and accommodation details early so everyone has the info
- Use the expense tracker throughout the trip to avoid confusion at the end
- Upload photos during the trip to share memories in real-time
- Use the chat to coordinate meeting points and plans

Be concise, helpful, and encouraging. If users ask about features not available, let them know politely.`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required" }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI gateway error");
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("help-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
