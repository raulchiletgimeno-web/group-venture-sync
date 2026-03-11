import { useEffect, useState, useMemo, useRef } from "react";
import { useParams } from "react-router-dom";
import { Receipt, Plus, Trash2, Users, Pencil, Camera, ImageIcon, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EmptyState from "@/components/EmptyState";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { getLocale } from "@/i18n/translations";
import { formatDisplayName } from "@/lib/formatDisplayName";

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

const Expenses = () => {
  const { tripId } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [existingReceiptPath, setExistingReceiptPath] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  useEffect(() => {
    fetchMembers().then(() => fetchExpenses());
  }, [tripId]);

  const openCreate = () => {
    setEditingId(null);
    setTitle("");
    setAmount("");
    setPaidBy(user?.id ?? "");
    setSelectedMembers(members.map((m) => m.user_id));
    setReceiptFile(null);
    setReceiptPreview(null);
    setExistingReceiptPath(null);
    setOpen(true);
  };

  const openEdit = (exp: Expense) => {
    setEditingId(exp.id);
    setTitle(exp.title);
    setAmount(exp.amount.toString());
    setPaidBy(exp.paid_by);
    setSelectedMembers(exp.splits);
    setReceiptFile(null);
    setReceiptPreview(null);
    setExistingReceiptPath(exp.receipt_path);
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

  const getReceiptUrl = (path: string) => {
    const { data } = supabase.storage.from("trip-photos").getPublicUrl(path);
    return data.publicUrl;
  };

  const toggleMember = (uid: string) => {
    setSelectedMembers((prev) =>
      prev.includes(uid) ? prev.filter((id) => id !== uid) : [...prev, uid]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tripId || !paidBy || selectedMembers.length === 0) return;

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast({ title: t.error, description: t.invalidAmount, variant: "destructive" });
      return;
    }

    if (editingId) {
      // Upload receipt if new file
      const receiptPath = await uploadReceipt(editingId);

      // Update existing expense
      const { error } = await supabase
        .from("trip_expenses")
        .update({ title: title.trim(), amount: parsedAmount, paid_by: paidBy, receipt_path: receiptPath })
        .eq("id", editingId);

      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
        return;
      }

      // Delete old splits and insert new ones
      await supabase.from("trip_expense_splits").delete().eq("expense_id", editingId);
      const splits = selectedMembers.map((uid) => ({ expense_id: editingId, user_id: uid }));
      await supabase.from("trip_expense_splits").insert(splits);

      setOpen(false);
      setEditingId(null);
      fetchExpenses();
      toast({ title: t.expenseUpdated });
    } else {
      // Create new expense
      const { data: inserted, error } = await supabase
        .from("trip_expenses")
        .insert({ trip_id: tripId, title: title.trim(), amount: parsedAmount, paid_by: paidBy })
        .select("id")
        .single();

      if (error || !inserted) {
        toast({ title: t.error, description: error?.message ?? t.error, variant: "destructive" });
        return;
      }

      // Upload receipt
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

      setOpen(false);
      fetchExpenses();
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
      // The payer gets credited
      balanceMap.set(exp.paid_by, (balanceMap.get(exp.paid_by) ?? 0) + exp.amount);
      // Each participant owes their share
      exp.splits.forEach((uid) => {
        balanceMap.set(uid, (balanceMap.get(uid) ?? 0) - share);
      });
    });

    return balanceMap;
  }, [expenses, members]);

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

    // Get sorted arrays of creditors and debtors
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
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setEditingId(null); }}>
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
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
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
                <div className="space-y-2 max-h-40 overflow-y-auto">
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
                {receiptPreview || existingReceiptPath ? (
                  <div className="relative inline-block">
                    <img
                      src={receiptPreview ?? (existingReceiptPath ? getReceiptUrl(existingReceiptPath) : "")}
                      alt="Ticket"
                      className="h-24 w-24 rounded-lg object-cover border border-border"
                    />
                    <button
                      type="button"
                      onClick={removeReceipt}
                      className="absolute -top-2 -right-2 rounded-full bg-destructive text-destructive-foreground p-0.5"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
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
                )}
              </div>
               <Button type="submit" className="w-full gradient-hero text-primary-foreground border-0">
                 {editingId ? t.update : t.save}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

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
                      <span className="text-destructive font-medium">{memberName(d.from)}</span>
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-green-600 font-medium">{memberName(d.to)}</span>
                      <span className="ml-auto font-semibold text-card-foreground">{d.amount.toFixed(2)} €</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="gastos">
            <div className="space-y-3">
              {expenses.map((exp) => (
                <div key={exp.id} className="rounded-xl bg-card p-4 shadow-card">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold text-card-foreground">{exp.title}</p>
                       <p className="text-xs text-muted-foreground mt-1">
                         {t.paidByLabel} {memberName(exp.paid_by)} — {exp.amount.toFixed(2)} €
                       </p>
                       <p className="text-xs text-muted-foreground mt-0.5">
                         {t.sharedBetween}: {exp.splits.map(memberName).join(", ")}
                       </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {(exp.amount / (exp.splits.length || 1)).toFixed(2)} € / {t.perPerson}
                      </p>
                      {exp.receipt_path && (
                        <button
                          type="button"
                          onClick={() => window.open(getReceiptUrl(exp.receipt_path!), '_blank')}
                          className="mt-2 inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
                        >
                          <ImageIcon className="h-4 w-4" />
                          {t.viewReceipt}
                        </button>
                      )}
                    </div>
                    {(exp.paid_by === user?.id) && (
                      <div className="flex gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-muted-foreground h-8 w-8"
                              onClick={() => openEdit(exp)}
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
                              onClick={() => handleDelete(exp.id)}
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
              ))}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default Expenses;
