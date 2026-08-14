import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Friendly chat messages (random rotation)
const CHAT_MESSAGES = [
  (debtor: string, creditor: string, amount: string) =>
    `🤖 Venga, ${debtor}, a ver si le pagas esos ${amount} € a ${creditor} y así mañana no tengo que volver a mandarte otro mensajito. Hazlo por Bizum, transferencia o invítale una cerveza, pero luego entra en Gastos y ajústalo para que deje de salir como pendiente. 😄`,
  (debtor: string, creditor: string, amount: string) =>
    `💸 ${debtor}, que me han dicho que todavía le debes ${amount} € a ${creditor}. No pasa nada, estas cosas se olvidan… pero yo no las olvido 😏. Págale como prefieras y luego entra en Gastos para ajustarlo. ¡Así dejo de darte la tabarra!`,
  (debtor: string, creditor: string, amount: string) =>
    `🫣 Oye ${debtor}, soy YORMIT y vengo en son de paz. Quedan ${amount} € pendientes con ${creditor}. Un Bizum rápido, una transferencia o un café y estáis en paz. Eso sí, luego entra en Gastos y ajústalo, que si no yo sigo contando. 📊`,
  (debtor: string, creditor: string, amount: string) =>
    `☕ ${debtor}, te lo digo con cariño: ${amount} € con ${creditor} siguen ahí. Págale cuando puedas y luego pásate por Gastos para ajustarlo. Así me ahorro el mensajito de mañana y tú te ahorras leerme. Win-win. 😉`,
  (debtor: string, creditor: string, amount: string) =>
    `🔔 ¡Buenos días, ${debtor}! Soy tu recordatorio favorito. Todavía quedan ${amount} € pendientes con ${creditor}. Hazle un Bizum, una transferencia o lo que os mole, y luego entra en Gastos para dejarlo ajustado. ¡Prometido que dejo de escribirte! 🤞`,
  (debtor: string, creditor: string, amount: string) =>
    `🎯 ${debtor}, mira, no quiero ser pesado, pero es mi trabajo: ${amount} € con ${creditor}. Págale como más os convenga y después entra en Gastos y ajústalo. Cuando lo hagas, me callo. Palabra de bot. 🤖`,
  (debtor: string, creditor: string, amount: string) =>
    `😅 ${debtor}, que ${creditor} no te lo va a decir porque es muy majo/a, pero le debes ${amount} €. Un Bizum, una transferencia, un sobre con billetes… lo que sea. Y luego entra en Gastos y ajústalo para que yo pueda descansar. 💤`,
  (debtor: string, creditor: string, amount: string) =>
    `🚀 ${debtor}, recordatorio exprés: ${amount} € → ${creditor}. Bizum, transferencia o paloma mensajera con monedas. Tú decides. Pero luego entra en Gastos y ajústalo, que si no mañana vuelvo. Y vuelvo. 😄`,
  (debtor: string, creditor: string, amount: string) =>
    `🎵 ${debtor}, ♫ tienes ${amount} euritos pendientes con ${creditor} ♫. No es broma, pero lo digo cantando para que suene mejor. Págale y entra en Gastos para ajustarlo. ¡Así la música para! 🎶`,
  (debtor: string, creditor: string, amount: string) =>
    `🧮 ${debtor}, las matemáticas no mienten: ${amount} € con ${creditor}. Hazle un Bizum o lo que queráis y luego entra en Gastos para ajustarlo. Cuando lo hagas, este bot se va de vacaciones. 🏖️`,
  (debtor: string, creditor: string, amount: string) =>
    `💛 ${debtor}, te escribo con todo el cariño del mundo: ${amount} € con ${creditor} siguen pendientes. Págale cuando puedas y luego entra en Gastos para dejarlo todo cuadrado. ¡Que luego las cuentas claras conservan las amistades! 🤝`,
  (debtor: string, creditor: string, amount: string) =>
    `🤖 Soy YORMIT y no tengo sentimientos, pero si los tuviera me daría penita seguir recordándote esto, ${debtor}. ${amount} € con ${creditor}. Págale, entra en Gastos, ajústalo y seré libre. ¡Hazlo por mí! 🥹`,
  (debtor: string, creditor: string, amount: string) =>
    `🐌 ${debtor}, que voy lento pero seguro: ${amount} € con ${creditor}. Págale y entra en Gastos para ajustarlo. Si no, mañana me vuelves a ver por aquí. 🐢`,
  (debtor: string, creditor: string, amount: string) =>
    `🎬 ${debtor}, episodio 47 de "Las deudas de ${debtor}": ${amount} € con ${creditor}. Spoiler: el final feliz es un Bizum y un ajuste en Gastos. 🍿`,
  (debtor: string, creditor: string, amount: string) =>
    `🌮 ${debtor}, por ${amount} € te invito a saldar tu deuda con ${creditor}. Bueno, no te invito yo, pero hazlo tú. Bizum, transferencia, lo que sea. Y luego Gastos → ajustar. 🙏`,
  (debtor: string, creditor: string, amount: string) =>
    `📱 ${debtor}, notificación importante: ${amount} € con ${creditor}. No es spam, es YORMIT recordándote con amor. Págale y ajústalo en Gastos. ❤️`,
  (debtor: string, creditor: string, amount: string) =>
    `🧳 ${debtor}, el viaje terminó pero los ${amount} € con ${creditor} siguen de vacaciones en tu cuenta. Mándalos a la suya con un Bizum y ajústalo en Gastos. ✈️`,
  (debtor: string, creditor: string, amount: string) =>
    `🎁 ${debtor}, tengo un regalo para ti: dejar de escribirte. Solo tienes que pagar ${amount} € a ${creditor} y ajustarlo en Gastos. ¡Trato hecho! 🤝`,
  (debtor: string, creditor: string, amount: string) =>
    `🦜 ${debtor}, soy el loro de YORMIT: ¡${amount} euros! ¡${creditor}! ¡Bizum! ¡Gastos! ¡Ajustar! Ya, en serio, págale y entra en Gastos para dejarlo cuadrado. 😄`,
  (debtor: string, creditor: string, amount: string) =>
    `⏰ ${debtor}, tic tac: ${amount} € con ${creditor}. No es urgente, pero tampoco es opcional. Un Bizum rápido, luego Gastos y ajústalo. ¡Y a otra cosa, mariposa! 🦋`,
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

interface Payment {
  from_user: string;
  to_user: string;
  amount: number;
}

interface Debt {
  from: string;
  to: string;
  amount: number;
}

function calculateDebts(expenses: Expense[], memberIds: string[], payments: Payment[]): Debt[] {
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

  // Adjust balances with recorded payments
  payments.forEach((p) => {
    balanceMap.set(p.from_user, (balanceMap.get(p.from_user) ?? 0) + p.amount);
    balanceMap.set(p.to_user, (balanceMap.get(p.to_user) ?? 0) - p.amount);
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

    // Only trips whose settlement has been explicitly released by the
    // creator/co-creator ("Finalizar viaje") at least 24h ago.
    // end_date is NOT a trigger for economic communications.
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const { data: trips, error: tripsErr } = await supabase
      .from("trips")
      .select("id, title, end_date, settlement_released_at")
      .not("settlement_released_at", "is", null)
      .lte("settlement_released_at", twentyFourHoursAgo.toISOString());

    if (tripsErr) throw tripsErr;
    if (!trips || trips.length === 0) {
      return new Response(JSON.stringify({ message: "No released settlements with pending debts", processed: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let totalReminders = 0;

    for (const trip of trips) {
      // Backend safety check: never communicate anything economic while the
      // settlement is not released (trip reopened between query and processing).
      if (!trip.settlement_released_at) continue;
      const releasedAt = trip.settlement_released_at as string;

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

      // Get recorded payments
      const { data: payments } = await supabase
        .from("debt_payments")
        .select("from_user, to_user, amount")
        .eq("trip_id", trip.id);

      // Calculate debts (subtracting payments)
      const debts = calculateDebts(expensesWithSplits, memberIds, payments || []);
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

        // Pick a message avoiding the last one sent for this debt pair
        // Get the last reminder's message to avoid repeating it
        const { data: lastReminder } = await supabase
          .from("trip_messages")
          .select("content")
          .eq("trip_id", trip.id)
          .ilike("content", `%${debtorName}%`)
          .ilike("content", `%${creditorName}%`)
          .ilike("content", `%${amountStr}%`)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        const lastContent = lastReminder?.content || "";
        // Generate all candidates and exclude the last one
        const candidates = CHAT_MESSAGES.map((fn) => fn(debtorName, creditorName, amountStr));
        const filtered = candidates.filter((msg) => msg !== lastContent);
        const chatMsg = pickRandom(filtered.length > 0 ? filtered : candidates);

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

        // Send email reminder to the debtor
        const debtorEmail = debtorProfile?.email;
        if (debtorEmail) {
          try {
            await supabase.functions.invoke("send-transactional-email", {
              body: {
                templateName: "debt-reminder",
                recipientEmail: debtorEmail,
                idempotencyKey: `debt-reminder-${trip.id}-${debt.from}-${debt.to}-${new Date().toISOString().split("T")[0]}`,
                templateData: {
                  debtorName,
                  creditorName,
                  amount: amountStr,
                  tripName: trip.title,
                  message: chatMsg,
                },
              },
            });
          } catch (emailErr) {
            console.error("Failed to send debt reminder email:", emailErr);
          }
        }

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
