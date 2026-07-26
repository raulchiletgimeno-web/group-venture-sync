import { useEffect, useState, useMemo, useRef } from "react";
import { useParams } from "react-router-dom";
import { Receipt, Plus, Trash2, Users, Pencil, Camera, ImageIcon, X, ArrowRight, CheckCircle2, History, Eye, Undo2, Lock, Flag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useTripRole } from "@/hooks/use-trip-role";
import EmptyState from "@/components/EmptyState";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { getLocale } from "@/i18n/translations";
import { formatDisplayName } from "@/lib/formatDisplayName";
import { useMarkSectionSeen } from "@/hooks/use-mark-section-seen";
import { notifyTripEvent } from "@/lib/notifyTripEvent";
import { SignedImg } from "@/components/SignedImg";
import { getSignedUrl } from "@/lib/signedUrl";

interface Member {
  user_id: string;
  name: string;
}

interface Expense {
  id: string;
  title: string;
  amount: number;
  paid_by: string;
  created_at: string;
  splits: string[];
  receipt_path: string | null;
}

interface DebtPayment {
  id: string;
  from_user: string;
  to_user: string;
  amount: number;
  payment_method: string;
  paid_at: string;
}

const Expenses = () => {
  const { tripId } = useParams();
  useMarkSectionSeen(tripId, "expenses");
  const { user } = useAuth();
  const { toast } = useToast();
  const { t, language } = useLanguage();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [payments, setPayments] = useState<DebtPayment[]>([]);
  const [settlementReleasedAt, setSettlementReleasedAt] = useState<string | null>(null);
  const [finishOpen, setFinishOpen] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const { isCreator } = useTripRole(tripId);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Payment modal state
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentDebt, setPaymentDebt] = useState<{ from: string; to: string; amount: number } | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("bizum");
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const paymentSubmitLockRef = useRef(false);
  const [detailPayment, setDetailPayment] = useState<DebtPayment | null>(null);
  const [editPayment, setEditPayment] = useState<DebtPayment | null>(null);
  const [editMethod, setEditMethod] = useState("bizum");
  const [editAmount, setEditAmount] = useState("");
  const [submittingEdit, setSubmittingEdit] = useState(false);
  const editPaymentLockRef = useRef(false);

  const [title, setTitle] = useState("");
  const [amount2, setAmount2] = useState("");
  const [paidBy, setPaidBy] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [splitsError, setSplitsError] = useState(false);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [existingReceiptPath, setExistingReceiptPath] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const fetchMembers = async () => {
    if (!tripId) return;
    const { data } = await supabase
      .from("trip_members")
      .select("user_id")
      .eq("trip_id", tripId);
    if (!data) return;

    const userIds = data.map((m) => m.user_id);
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, name")
      .in("id", userIds);

    setMembers(
      (profiles ?? []).map((p) => ({ user_id: p.id, name: formatDisplayName(p.name, p.id.slice(0, 8)) }))
    );
  };

  const fetchExpenses = async () => {
    if (!tripId) return;
    const { data: expData } = await supabase
      .from("trip_expenses")
      .select("*")
      .eq("trip_id", tripId)
      .order("created_at", { ascending: false });

    if (!expData) {
      setExpenses([]);
      setLoading(false);
      return;
    }

    const expenseIds = expData.map((e) => e.id);
    const { data: splitData } = await supabase
      .from("trip_expense_splits")
      .select("expense_id, user_id")
      .in("expense_id", expenseIds);

    const splitMap = new Map<string, string[]>();
    (splitData ?? []).forEach((s) => {
      const arr = splitMap.get(s.expense_id) ?? [];
      arr.push(s.user_id);
      splitMap.set(s.expense_id, arr);
    });

    setExpenses(
      expData.map((e) => ({
        id: e.id,
        title: e.title,
        amount: Number(e.amount),
        paid_by: e.paid_by,
        created_at: e.created_at,
        splits: splitMap.get(e.id) ?? [],
        receipt_path: (e as any).receipt_path ?? null,
      }))
    );
    setLoading(false);
  };

  const fetchPayments = async () => {
    if (!tripId) return;
    const { data } = await supabase
      .from("debt_payments")
      .select("*")
      .eq("trip_id", tripId)
      .order("paid_at", { ascending: false });

    setPayments(
      (data ?? []).map((p) => ({
        id: p.id,
        from_user: p.from_user,
        to_user: p.to_user,
        amount: Number(p.amount),
        payment_method: p.payment_method,
        paid_at: p.paid_at,
      }))
    );
  };

  useEffect(() => {
    fetchMembers().then(() => {
      fetchExpenses();
      fetchPayments();
    });
  }, [tripId]);

  const openCreate = () => {
    setEditingId(null);
    setTitle("");
    setAmount2("");
    setPaidBy(user?.id ?? "");
    setSelectedMembers(members.map((m) => m.user_id));
    setReceiptFile(null);
    setReceiptPreview(null);
    setExistingReceiptPath(null);
    setSplitsError(false);
    setOpen(true);
  };

  const openEdit = (exp: Expense) => {
    setEditingId(exp.id);
    setTitle(exp.title);
    setAmount2(exp.amount.toString());
    setPaidBy(exp.paid_by);
    setSelectedMembers(exp.splits);
    setReceiptFile(null);
    setReceiptPreview(null);
    setExistingReceiptPath(exp.receipt_path);
    setSplitsError(false);
    setOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setReceiptFile(file);
    setReceiptPreview(URL.createObjectURL(file));
    setExistingReceiptPath(null);
  };

  const removeReceipt = () => {
    setReceiptFile(null);
    setReceiptPreview(null);
    setExistingReceiptPath(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (galleryInputRef.current) galleryInputRef.current.value = "";
  };

  const uploadReceipt = async (expenseId: string): Promise<string | null> => {
    if (!receiptFile || !tripId) return existingReceiptPath;
    const ext = receiptFile.name.split(".").pop() ?? "jpg";
    const path = `${tripId}/receipts/${expenseId}.${ext}`;
    const { error } = await supabase.storage.from("trip-photos").upload(path, receiptFile, { upsert: true });
    if (error) {
      toast({ title: t.errorUploading, description: error.message, variant: "destructive" });
      return existingReceiptPath;
    }
    return path;
  };

  const openReceipt = async (path: string) => {
    const url = await getSignedUrl(path);
    if (url) window.open(url, "_blank");
  };


  const toggleMember = (uid: string) => {
    setSelectedMembers((prev) => {
      const next = prev.includes(uid) ? prev.filter((id) => id !== uid) : [...prev, uid];
      if (next.length > 0) setSplitsError(false);
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tripId || !paidBy) return;

    if (selectedMembers.length === 0) {
      setSplitsError(true);
      toast({
        title: t.error,
        description: t.expenseNeedsAtLeastOneMember,
        variant: "destructive",
      });
      return;
    }

    const parsedAmount = parseFloat(amount2);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast({ title: t.error, description: t.invalidAmount, variant: "destructive" });
      return;
    }

    if (editingId) {
      const receiptPath = await uploadReceipt(editingId);
      const { error } = await supabase
        .from("trip_expenses")
        .update({ title: title.trim(), amount: parsedAmount, paid_by: paidBy, receipt_path: receiptPath })
        .eq("id", editingId);

      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
        return;
      }

      // Insert new splits first, then remove old ones not in the new set,
      // so the expense never has zero splits (DB trigger guard).
      const newSplitRows = selectedMembers.map((uid) => ({ expense_id: editingId, user_id: uid }));
      const { error: insertSplitErr } = await supabase
        .from("trip_expense_splits")
        .upsert(newSplitRows, { onConflict: "expense_id,user_id", ignoreDuplicates: true });
      if (insertSplitErr) {
        toast({ title: t.error, description: insertSplitErr.message, variant: "destructive" });
        return;
      }
      const { error: delSplitErr } = await supabase
        .from("trip_expense_splits")
        .delete()
        .eq("expense_id", editingId)
        .not("user_id", "in", `(${selectedMembers.join(",")})`);
      if (delSplitErr) {
        const msg = delSplitErr.message ?? "";
        if (delSplitErr.code === "23514" || msg.includes("expense_requires_at_least_one_member")) {
          toast({ title: t.error, description: t.expenseNeedsAtLeastOneMember, variant: "destructive" });
          return;
        }
        toast({ title: t.error, description: msg, variant: "destructive" });
        return;
      }

      setOpen(false);
      setEditingId(null);
      fetchExpenses();
      toast({ title: t.expenseUpdated });
    } else {
      setOpen(false);

      const { data: inserted, error } = await supabase
        .from("trip_expenses")
        .insert({ trip_id: tripId, title: title.trim(), amount: parsedAmount, paid_by: paidBy })
        .select("id")
        .single();

      if (error || !inserted) {
        toast({ title: t.error, description: error?.message ?? t.error, variant: "destructive" });
        return;
      }

      const receiptPath = await uploadReceipt(inserted.id);
      if (receiptPath) {
        await supabase.from("trip_expenses").update({ receipt_path: receiptPath }).eq("id", inserted.id);
      }

      const splits = selectedMembers.map((uid) => ({ expense_id: inserted.id, user_id: uid }));
      const { error: splitError } = await supabase.from("trip_expense_splits").insert(splits);
      if (splitError) {
        toast({ title: t.error, description: splitError.message, variant: "destructive" });
        return;
      }

      fetchExpenses();
      notifyTripEvent(tripId, "expenses", user?.id);
      toast({ title: t.expenseAdded });
    }
  };

  const handleDelete = async (id: string) => {
    await supabase.from("trip_expenses").delete().eq("id", id);
    fetchExpenses();
  };

  const memberName = (uid: string) =>
    members.find((m) => m.user_id === uid)?.name ?? uid.slice(0, 8);

  // Calculate balances like Tricount
  const balances = useMemo(() => {
    const balanceMap = new Map<string, number>();
    members.forEach((m) => balanceMap.set(m.user_id, 0));

    expenses.forEach((exp) => {
      const share = exp.amount / (exp.splits.length || 1);
      balanceMap.set(exp.paid_by, (balanceMap.get(exp.paid_by) ?? 0) + exp.amount);
      exp.splits.forEach((uid) => {
        balanceMap.set(uid, (balanceMap.get(uid) ?? 0) - share);
      });
    });

    // Adjust balances with debt payments
    payments.forEach((p) => {
      balanceMap.set(p.from_user, (balanceMap.get(p.from_user) ?? 0) + p.amount);
      balanceMap.set(p.to_user, (balanceMap.get(p.to_user) ?? 0) - p.amount);
    });

    return balanceMap;
  }, [expenses, members, payments]);

  const totalExpenses = useMemo(
    () => expenses.reduce((sum, e) => sum + e.amount, 0),
    [expenses]
  );

  const myExpenses = useMemo(() => {
    if (!user) return 0;
    return expenses.reduce((sum, e) => {
      if (e.splits.includes(user.id)) {
        return sum + e.amount / (e.splits.length || 1);
      }
      return sum;
    }, 0);
  }, [expenses, user]);

  // Calculate simplified debts (who owes whom)
  const debts = useMemo(() => {
    const debtors: { from: string; to: string; amount: number }[] = [];
    const bals = new Map(balances);

    const creditors = members
      .filter((m) => (bals.get(m.user_id) ?? 0) > 0.01)
      .map((m) => ({ uid: m.user_id, amount: bals.get(m.user_id)! }))
      .sort((a, b) => b.amount - a.amount);

    const debtorsList = members
      .filter((m) => (bals.get(m.user_id) ?? 0) < -0.01)
      .map((m) => ({ uid: m.user_id, amount: Math.abs(bals.get(m.user_id)!) }))
      .sort((a, b) => b.amount - a.amount);

    let ci = 0, di = 0;
    while (ci < creditors.length && di < debtorsList.length) {
      const transfer = Math.min(creditors[ci].amount, debtorsList[di].amount);
      if (transfer > 0.01) {
        debtors.push({ from: debtorsList[di].uid, to: creditors[ci].uid, amount: transfer });
      }
      creditors[ci].amount -= transfer;
      debtorsList[di].amount -= transfer;
      if (creditors[ci].amount < 0.01) ci++;
      if (debtorsList[di].amount < 0.01) di++;
    }

    return debtors;
  }, [balances, members]);

  // Payment handlers
  const openPaymentModal = (debt: { from: string; to: string; amount: number }) => {
    setPaymentDebt(debt);
    setPaymentMethod("bizum");
    setPaymentOpen(true);
  };

  const handleConfirmPayment = async () => {
    if (!paymentDebt || !tripId) return;
    // Hard lock against double-clicks (ref is synchronous; useState is not).
    if (paymentSubmitLockRef.current) return;
    paymentSubmitLockRef.current = true;
    setSubmittingPayment(true);

    // Snapshot values before we close the modal.
    const debt = paymentDebt;
    const method = paymentMethod;

    try {
      const { error } = await supabase.from("debt_payments").insert({
        trip_id: tripId,
        from_user: debt.from,
        to_user: debt.to,
        amount: debt.amount,
        payment_method: method,
      });

      // Close modal immediately on success OR on duplicate (the first click already saved it).
      const isDuplicate =
        !!error && (error.code === "23505" || /duplicate_debt_payment/i.test(error.message ?? ""));

      if (error && !isDuplicate) {
        toast({ title: t.error, description: error.message, variant: "destructive" });
        return;
      }

      // Close UI right away — side-effects below run as fire-and-forget.
      setPaymentOpen(false);
      setPaymentDebt(null);
      fetchPayments();

      if (isDuplicate) {
        // Silently treat as success: the original click already registered the payment.
        return;
      }

      toast({ title: t.debtSettled });

      // Fire-and-forget notifications (must not block or re-open the modal).
      const creditorProfile = members.find((m) => m.user_id === debt.to);
      const debtorProfile = members.find((m) => m.user_id === debt.from);

      (async () => {
        try {
          const { data: tripData } = await supabase.from("trips").select("title").eq("id", tripId).single();

          await supabase.functions.invoke("send-transactional-email", {
            body: {
              templateName: "payment-notification",
              recipientUserId: debt.to,
              idempotencyKey: `payment-notif-${debt.from}-${debt.to}-${debt.amount}-${Math.floor(Date.now() / 60000)}`,
              templateData: {
                debtorName: debtorProfile?.name || "Tu compañero/a",
                creditorName: creditorProfile?.name || "amigo/a",
                amount: debt.amount.toFixed(2),
                tripName: tripData?.title || "el viaje",
                paymentMethod: method,
                paidAt: new Date().toISOString(),
              },
            },
          });
        } catch (emailErr) {
          console.error("Failed to send payment notification email:", emailErr);
        }
      })();

      (async () => {
        try {
          const debtorName = debtorProfile?.name || "Alguien";
          const credName = creditorProfile?.name || "su compañero/a";
          const formattedAmount = debt.amount.toFixed(2);

          const chatMessages = [
            `💸 ¡Cuentas claras! ${debtorName} ya ha pagado a ${credName} los ${formattedAmount} € pendientes.`,
            `✅ Movimiento registrado: ${debtorName} ha saldado ${formattedAmount} € con ${credName}. ¡Así da gusto viajar!`,
            `🎉 ${debtorName} ya está en paz con ${credName}: ${formattedAmount} € liquidados.`,
            `🤝 Deuda saldada: ${debtorName} → ${credName} · ${formattedAmount} €. ¡Viaje sin dramas!`,
            `💰 ${debtorName} ha pagado ${formattedAmount} € a ${credName}. Las cuentas del viaje van tomando forma.`,
          ];
          const msg = chatMessages[Math.floor(Math.random() * chatMessages.length)];

          await supabase.from("trip_messages").insert({
            trip_id: tripId,
            user_id: user.id,
            content: msg,
            type: "text",
          });
        } catch (chatErr) {
          console.error("Failed to post payment chat message:", chatErr);
        }
      })();
    } finally {
      setSubmittingPayment(false);
      paymentSubmitLockRef.current = false;
    }
  };

  const paymentMethodLabel = (method: string) => {
    switch (method) {
      case "bizum": return t.bizum;
      case "transfer": return t.transfer;
      case "cash": return t.cash;
      default: return t.otherMethod;
    }
  };

  const openEditPayment = (p: DebtPayment) => {
    setEditPayment(p);
    setEditMethod(p.payment_method);
    setEditAmount(p.amount.toFixed(2));
  };

  const handleUpdatePayment = async () => {
    if (!editPayment) return;
    if (editPaymentLockRef.current) return;
    editPaymentLockRef.current = true;
    setSubmittingEdit(true);
    try {
      const { error } = await supabase
        .from("debt_payments")
        .update({ payment_method: editMethod, amount: parseFloat(editAmount) })
        .eq("id", editPayment.id);
      if (error) {
        toast({ title: t.error, description: error.message, variant: "destructive" });
        return;
      }
      setEditPayment(null);
      fetchPayments();
      toast({ title: t.paymentRegistered });
    } finally {
      setSubmittingEdit(false);
      editPaymentLockRef.current = false;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-foreground">{t.sharedExpenses}</h2>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setEditingId(null); setSplitsError(false); } }}>
          <DialogTrigger asChild>
            <Button size="sm" className="gradient-hero text-primary-foreground border-0" onClick={openCreate}>
              <Plus className="h-4 w-4 mr-1" /> {t.addExpense}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? t.editExpense : t.addExpense}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>{t.expenseTitle}</Label>
                <Input
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t.expensePlaceholder}
                  maxLength={100}
                />
              </div>
              <div>
                <Label>{t.amount}</Label>
                <Input
                  required
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={amount2}
                  onChange={(e) => setAmount2(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label>{t.paidBy}</Label>
                <p className="text-sm text-foreground mt-1 p-2 rounded-md bg-muted">
                  {memberName(user?.id ?? "")}
                </p>
              </div>
              <div>
                <Label className="mb-2 block">{t.sharedAmong}</Label>
                <div
                  className={`space-y-2 max-h-40 overflow-y-auto rounded-md p-2 border transition-colors ${
                    splitsError ? "border-destructive bg-destructive/5" : "border-transparent"
                  }`}
                >
                  {members.map((m) => (
                    <label key={m.user_id} className="flex items-center gap-2 cursor-pointer">
                      <Checkbox
                        checked={selectedMembers.includes(m.user_id)}
                        onCheckedChange={() => toggleMember(m.user_id)}
                      />
                      <span className="text-sm text-foreground">{m.name}</span>
                    </label>
                  ))}
                </div>
                {splitsError && (
                  <p className="text-sm font-medium text-destructive mt-1.5">
                    {t.expenseNeedsAtLeastOneMember}
                  </p>
                )}
              </div>
              <div>
                <Label className="mb-2 block">{t.ticketPhoto}</Label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <input
                  ref={galleryInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
                {receiptPreview || existingReceiptPath ? (
                  <div className="relative inline-block">
                    {receiptPreview ? (
                      <img
                        src={receiptPreview}
                        alt="Ticket"
                        className="h-24 w-24 rounded-lg object-cover border border-border"
                      />
                    ) : existingReceiptPath ? (
                      <SignedImg
                        path={existingReceiptPath}
                        alt="Ticket"
                        className="h-24 w-24 rounded-lg object-cover border border-border"
                      />
                    ) : null}
                    <button
                      type="button"
                      onClick={removeReceipt}
                      className="absolute -top-2 -right-2 rounded-full bg-destructive text-destructive-foreground p-0.5"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      className="gap-2"
                    >
                      <Camera className="h-4 w-4" />
                      {t.takePhoto}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => galleryInputRef.current?.click()}
                      className="gap-2"
                    >
                      <ImageIcon className="h-4 w-4" />
                      {t.uploadFromGallery}
                    </Button>
                  </div>
                )}
              </div>
               <Button type="submit" className="w-full gradient-hero text-primary-foreground border-0">
                 {editingId ? t.update : t.save}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Payment confirmation modal */}
      <Dialog open={paymentOpen} onOpenChange={(v) => { if (submittingPayment) return; setPaymentOpen(v); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{t.confirmPayment}</DialogTitle>
          </DialogHeader>
          {paymentDebt && (
            <div className="space-y-4">
              <div className="rounded-lg bg-muted p-3 text-center">
                <div className="flex items-center justify-center gap-2 text-sm font-medium">
                  <span className="text-foreground">{memberName(paymentDebt.from)}</span>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-foreground">{memberName(paymentDebt.to)}</span>
                </div>
                <p className="text-lg font-bold text-foreground mt-1">{paymentDebt.amount.toFixed(2)} €</p>
              </div>

              <div>
                <Label className="mb-3 block">{t.paymentMethod}</Label>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="grid grid-cols-2 gap-2">
                  {[
                    { value: "bizum", label: t.bizum },
                    { value: "transfer", label: t.transfer },
                    { value: "cash", label: t.cash },
                    { value: "other", label: t.otherMethod },
                  ].map((opt) => (
                    <label
                      key={opt.value}
                      className={`flex items-center gap-2 rounded-lg border p-3 cursor-pointer transition-colors ${
                        paymentMethod === opt.value
                          ? "border-primary bg-primary/5"
                          : "border-border hover:bg-muted"
                      }`}
                    >
                      <RadioGroupItem value={opt.value} />
                      <span className="text-sm font-medium">{opt.label}</span>
                    </label>
                  ))}
                </RadioGroup>
              </div>

              <Button
                onClick={handleConfirmPayment}
                disabled={submittingPayment}
                aria-busy={submittingPayment}
                className="w-full gradient-hero text-primary-foreground border-0"
              >
                {submittingPayment ? (
                  <>
                    <span className="h-4 w-4 mr-2 inline-block animate-spin rounded-full border-2 border-primary-foreground/40 border-t-primary-foreground" />
                    {t.saving}
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    {t.confirmPayment}
                  </>
                )}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {expenses.length === 0 ? (
         <EmptyState
           icon={Receipt}
           title={t.noExpensesTitle}
           description={t.noExpensesDesc}
          />
      ) : (
        <Tabs defaultValue="saldos" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
             <TabsTrigger value="saldos">{t.balances}</TabsTrigger>
             <TabsTrigger value="gastos">{t.expensesList}</TabsTrigger>
          </TabsList>

          <TabsContent value="saldos" className="space-y-4">
            {/* Total */}
            <div className="rounded-xl bg-card p-4 shadow-card">
               <div className="flex items-center justify-between mb-3">
                 <div>
                   <p className="text-xs text-muted-foreground">{t.totalSpent}</p>
                   <p className="text-sm font-semibold text-card-foreground">{totalExpenses.toFixed(2)} €</p>
                 </div>
                 <div className="text-right">
                   <p className="text-xs text-muted-foreground">{t.myExpenses}</p>
                   <p className="text-sm font-semibold text-card-foreground">{myExpenses.toFixed(2)} €</p>
                 </div>
               </div>
              <div className="space-y-2">
                {members.map((m) => {
                  const bal = balances.get(m.user_id) ?? 0;
                  return (
                    <div key={m.user_id} className="flex items-center justify-between text-sm">
                      <span className="text-card-foreground">{m.name}</span>
                      <span
                        className={
                          bal > 0.01
                            ? "font-semibold text-green-600"
                            : bal < -0.01
                            ? "font-semibold text-destructive"
                            : "text-muted-foreground"
                        }
                      >
                        {bal > 0.01 ? "+" : ""}
                        {bal.toFixed(2)} €
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Who owes whom */}
            {debts.length > 0 && (
              <div className="rounded-xl bg-card p-4 shadow-card">
                <p className="text-sm font-semibold text-card-foreground mb-3">{t.whoOwesWhom}</p>
                <div className="space-y-2">
                  {debts.map((d, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <span className="text-destructive font-medium truncate">{memberName(d.from)}</span>
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                      <span className="font-medium truncate" style={{ color: "hsl(var(--chart-2))" }}>{memberName(d.to)}</span>
                      <span className="ml-auto font-semibold text-card-foreground whitespace-nowrap">{d.amount.toFixed(2)} €</span>
                      {user && user.id === d.from && (
                        <Button
                          variant="destructive"
                          size="sm"
                          className="h-7 px-2.5 text-xs rounded-full flex-shrink-0 gap-1"
                          onClick={() => openPaymentModal(d)}
                        >
                          <CheckCircle2 className="h-3 w-3" />
                          Pagar
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Payment history */}
            {payments.length > 0 && (
              <div className="rounded-xl bg-card p-4 shadow-card">
                <div className="flex items-center gap-2 mb-3">
                  <History className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm font-semibold text-card-foreground">{t.paymentHistory}</p>
                </div>
                <div className="space-y-3">
                  {payments.map((p) => (
                    <div key={p.id} className="flex items-start justify-between text-sm border-b border-border pb-2 last:border-0 last:pb-0">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-medium text-card-foreground">{memberName(p.from_user)}</span>
                          <ArrowRight className="h-3 w-3 text-muted-foreground" />
                          <span className="font-medium text-card-foreground">{memberName(p.to_user)}</span>
                          <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0 text-[10px] px-1.5 py-0">
                            {t.settled}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {paymentMethodLabel(p.payment_method)} · {t.paidOn} {new Date(p.paid_at).toLocaleDateString(getLocale(language), { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <span className="font-semibold whitespace-nowrap" style={{ color: "hsl(var(--chart-2))" }}>{p.amount.toFixed(2)} €</span>
                        {p.from_user === user?.id && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-primary"
                            onClick={() => openEditPayment(p)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-primary"
                          onClick={() => setDetailPayment(p)}
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Payment detail dialog */}
            <Dialog open={!!detailPayment} onOpenChange={(o) => !o && setDetailPayment(null)}>
              <DialogContent className="max-w-sm">
                <DialogHeader>
                  <DialogTitle>{t.paymentDetail}</DialogTitle>
                </DialogHeader>
                {detailPayment && (
                  <div className="space-y-4 text-sm">
                    <div className="flex items-center justify-center gap-2 py-2">
                      <span className="font-semibold text-card-foreground">{memberName(detailPayment.from_user)}</span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      <span className="font-semibold text-card-foreground">{memberName(detailPayment.to_user)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t.amount}</span>
                      <span className="font-semibold text-card-foreground">{detailPayment.amount.toFixed(2)} €</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t.paymentMethod}</span>
                      <span className="font-medium text-card-foreground">{paymentMethodLabel(detailPayment.payment_method)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t.paidOn}</span>
                      <span className="font-medium text-card-foreground">
                        {new Date(detailPayment.paid_at).toLocaleDateString(getLocale(language), { day: "numeric", month: "long", year: "numeric" })}
                      </span>
                    </div>
                    <div className="flex justify-center pt-2">
                      <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        {t.settled}
                      </Badge>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>

            {/* Edit payment dialog */}
            <Dialog open={!!editPayment} onOpenChange={(o) => !o && setEditPayment(null)}>
              <DialogContent className="max-w-sm">
                <DialogHeader>
                  <DialogTitle>{t.editPayment}</DialogTitle>
                </DialogHeader>
                {editPayment && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center gap-2 py-2 text-sm">
                      <span className="font-semibold text-card-foreground">{memberName(editPayment.from_user)}</span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      <span className="font-semibold text-card-foreground">{memberName(editPayment.to_user)}</span>
                    </div>
                    <div>
                      <Label className="text-sm">{t.paymentMethod}</Label>
                      <RadioGroup value={editMethod} onValueChange={setEditMethod} className="mt-2 space-y-2">
                        {[
                          { value: "bizum", label: t.bizum },
                          { value: "transfer", label: t.transfer },
                          { value: "cash", label: t.cash },
                          { value: "other", label: t.otherMethod },
                        ].map((m) => (
                          <div key={m.value} className="flex items-center gap-2">
                            <RadioGroupItem value={m.value} id={`edit-${m.value}`} />
                            <Label htmlFor={`edit-${m.value}`} className="text-sm font-normal">{m.label}</Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                    <div>
                      <Label className="text-sm">{t.editPaymentAmount}</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={editAmount}
                        onChange={(e) => setEditAmount(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" size="sm" onClick={() => setEditPayment(null)}>
                        {t.cancel}
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleUpdatePayment}
                        disabled={submittingEdit || !editAmount || parseFloat(editAmount) <= 0}
                      >
                        {submittingEdit ? t.loading : t.savePayment}
                      </Button>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </TabsContent>

          <TabsContent value="gastos">
            <div className="space-y-3">
              {[
                ...expenses.map((e) => ({ kind: "expense" as const, ts: e.created_at, data: e })),
                ...payments.map((p) => ({ kind: "refund" as const, ts: p.paid_at, data: p })),
              ]
                .sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime())
                .map((item) => item.kind === "expense" ? (
                <div key={`e-${item.data.id}`} className="rounded-xl bg-card p-4 shadow-card">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold text-card-foreground">{item.data.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {new Date(item.data.created_at).toLocaleDateString(getLocale(language), { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                       <p className="text-xs text-muted-foreground mt-1">
                         {t.paidByLabel} {memberName(item.data.paid_by)} — {item.data.amount.toFixed(2)} €
                       </p>
                       <p className="text-xs text-muted-foreground mt-0.5">
                         {t.sharedBetween}: {item.data.splits.map(memberName).join(", ")}
                       </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {(item.data.amount / (item.data.splits.length || 1)).toFixed(2)} € / {t.perPerson}
                      </p>
                      {item.data.receipt_path && (
                        <button
                          type="button"
                          onClick={() => openReceipt(item.data.receipt_path!)}
                          className="mt-2 inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
                        >
                          <ImageIcon className="h-4 w-4" />
                          {t.viewReceipt}
                        </button>
                      )}
                    </div>
                    {(item.data.paid_by === user?.id) && (
                      <div className="flex gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-muted-foreground h-8 w-8"
                              onClick={() => openEdit(item.data)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>{t.edit}</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive h-8 w-8"
                              onClick={() => handleDelete(item.data.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>{t.delete}</TooltipContent>
                        </Tooltip>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div
                  key={`r-${item.data.id}`}
                  className="rounded-xl bg-card p-4 shadow-card border-l-4"
                  style={{ borderLeftColor: "hsl(var(--chart-2))" }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30"
                      style={{ color: "hsl(var(--chart-2))" }}
                    >
                      <Undo2 className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-card-foreground">{t.refund}</p>
                        <Badge
                          variant="secondary"
                          className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0 text-[10px] px-1.5 py-0"
                        >
                          {t.settled}
                        </Badge>
                      </div>
                      <div className="mt-1 flex items-center gap-1.5 text-sm text-card-foreground flex-wrap">
                        <span className="font-medium">{memberName(item.data.from_user)}</span>
                        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="font-medium">{memberName(item.data.to_user)}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        <span className="font-semibold" style={{ color: "hsl(var(--chart-2))" }}>{item.data.amount.toFixed(2)} €</span>
                        {" · "}{paymentMethodLabel(item.data.payment_method)}
                        {" · "}{new Date(item.data.paid_at).toLocaleDateString(getLocale(language), { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default Expenses;
