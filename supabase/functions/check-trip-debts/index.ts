import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Friendly chat messages (random rotation)
const CHAT_MESSAGES = [
  (debtor: string, creditor: string, amount: string) =>
    `🤖 ¡Psst! ${debtor}, recuerda que todavía debes ${amount} € a ${creditor}. ¡Seguro que se te había pasado! 😄`,
  (debtor: string, creditor: string, amount: string) =>
    `💸 ¡Ey ${debtor}! Tu cuenta con ${creditor} sigue pendiente: ${amount} €. ¡Un Bizum y listo! 🚀`,
  (debtor: string, creditor: string, amount: string) =>
    `🫣 ${debtor}, una cosita... quedan ${amount} € por ajustar con ${creditor}. ¡Nada que un cafecito no arregle! ☕`,
  (debtor: string, creditor: string, amount: string) =>
    `🔔 Recordatorio amistoso: ${debtor} → ${creditor}: ${amount} €. ¡Que no se te escape! 😉`,
];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

interface Expense {
  id: string;
  amount: number;
  paid_by: string;
  splits: string[];
}

interface Debt {
  from: string;
  to: string;
  amount: number;
}

function calculateDebts(expenses: Expense[], memberIds: string[]): Debt[] {
  // Calculate balances
  const balanceMap = new Map<string, number>();
  memberIds.forEach((id) => balanceMap.set(id, 0));

  expenses.forEach((exp) => {
    const share = exp.amount / (exp.splits.length || 1);
    balanceMap.set(exp.paid_by, (balanceMap.get(exp.paid_by) ?? 0) + exp.amount);
    exp.splits.forEach((uid) => {
      balanceMap.set(uid, (balanceMap.get(uid) ?? 0) - share);
    });
  });

  // Simplify debts
  const creditors = memberIds
    .filter((id) => (balanceMap.get(id) ?? 0) > 0.01)
    .map((id) => ({ uid: id, amount: balanceMap.get(id)! }))
    .sort((a, b) => b.amount - a.amount);

  const debtors = memberIds
    .filter((id) => (balanceMap.get(id) ?? 0) < -0.01)
    .map((id) => ({ uid: id, amount: Math.abs(balanceMap.get(id)!) }))
    .sort((a, b) => b.amount - a.amount);

  const result: Debt[] = [];
  let ci = 0, di = 0;
  while (ci < creditors.length && di < debtors.length) {
    const transfer = Math.min(creditors[ci].amount, debtors[di].amount);
    if (transfer > 0.01) {
      result.push({ from: debtors[di].uid, to: creditors[ci].uid, amount: transfer });
    }
    creditors[ci].amount -= transfer;
    debtors[di].amount -= transfer;
    if (creditors[ci].amount < 0.01) ci++;
    if (debtors[di].amount < 0.01) di++;
  }

  return result;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Find trips that ended >= 24h ago
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const cutoffDate = twentyFourHoursAgo.toISOString().split("T")[0]; // YYYY-MM-DD

    const { data: trips, error: tripsErr } = await supabase
      .from("trips")
      .select("id, title, end_date")
      .lte("end_date", cutoffDate);

    if (tripsErr) throw tripsErr;
    if (!trips || trips.length === 0) {
      return new Response(JSON.stringify({ message: "No finished trips with pending debts", processed: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let totalReminders = 0;

    for (const trip of trips) {
      // Get approved members
      const { data: members } = await supabase
        .from("trip_members")
        .select("user_id")
        .eq("trip_id", trip.id)
        .eq("status", "approved");

      if (!members || members.length < 2) continue;

      const memberIds = members.map((m) => m.user_id);

      // Get expenses with splits
      const { data: expenses } = await supabase
        .from("trip_expenses")
        .select("id, amount, paid_by")
        .eq("trip_id", trip.id);

      if (!expenses || expenses.length === 0) continue;

      // Get splits for each expense
      const expenseIds = expenses.map((e) => e.id);
      const { data: splits } = await supabase
        .from("trip_expense_splits")
        .select("expense_id, user_id")
        .in("expense_id", expenseIds);

      const expensesWithSplits: Expense[] = expenses.map((e) => ({
        ...e,
        splits: (splits || []).filter((s) => s.expense_id === e.id).map((s) => s.user_id),
      }));

      // Calculate debts
      const debts = calculateDebts(expensesWithSplits, memberIds);
      if (debts.length === 0) continue;

      // Get profiles for names
      const allUserIds = [...new Set(debts.flatMap((d) => [d.from, d.to]))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, name, email")
        .in("id", allUserIds);

      const profileMap = new Map(profiles?.map((p) => [p.id, p]) || []);

      for (const debt of debts) {
        // Check if we already sent a reminder in the last 24h for this specific debt
        const { data: recentReminders } = await supabase
          .from("debt_reminders")
          .select("id")
          .eq("trip_id", trip.id)
          .eq("debtor_id", debt.from)
          .eq("creditor_id", debt.to)
          .gte("sent_at", twentyFourHoursAgo.toISOString())
          .limit(1);

        if (recentReminders && recentReminders.length > 0) continue;

        const debtorProfile = profileMap.get(debt.from);
        const creditorProfile = profileMap.get(debt.to);
        const debtorName = debtorProfile?.name || "Alguien";
        const creditorName = creditorProfile?.name || "alguien";
        const amountStr = debt.amount.toFixed(2);

        // Post chat message
        const chatMsg = pickRandom(CHAT_MESSAGES)(debtorName, creditorName, amountStr);

        // Insert as a message from the debtor's perspective but with bot-style content
        // We use the trip creator as sender to avoid issues, with bot-style message
        const { data: tripCreator } = await supabase
          .from("trip_members")
          .select("user_id")
          .eq("trip_id", trip.id)
          .eq("role", "creator")
          .limit(1)
          .single();

        if (tripCreator) {
          await supabase.from("trip_messages").insert({
            trip_id: trip.id,
            user_id: tripCreator.user_id,
            content: chatMsg,
            type: "text",
          });
        }

        // Record the reminder
        await supabase.from("debt_reminders").insert({
          trip_id: trip.id,
          debtor_id: debt.from,
          creditor_id: debt.to,
          amount: debt.amount,
          channel: "chat",
        });

        totalReminders++;
      }
    }

    return new Response(
      JSON.stringify({ message: "Debt check complete", reminders_sent: totalReminders }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in check-trip-debts:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
