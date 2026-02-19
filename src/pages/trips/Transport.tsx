import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Plane, Plus, Trash2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import EmptyState from "@/components/EmptyState";
import { supabase } from "@/integrations/supabase/client";
import { useTripRole } from "@/hooks/use-trip-role";
import { useToast } from "@/hooks/use-toast";

interface TransportItem {
  id: string;
  type: string;
  departure_location: string;
  arrival_location: string;
  departure_datetime: string;
  arrival_datetime: string | null;
  booking_reference: string | null;
  notes: string | null;
}

const typeLabels: Record<string, string> = {
  flight: "Vuelo",
  train: "Tren",
  bus: "Autobús",
  car: "Coche",
  other: "Otro",
};

const emptyForm = {
  type: "flight",
  departure_location: "",
  arrival_location: "",
  departure_datetime: "",
  arrival_datetime: "",
  booking_reference: "",
  notes: "",
};

const Transport = () => {
  const { tripId } = useParams();
  const { isCreator } = useTripRole(tripId);
  const { toast } = useToast();
  const [items, setItems] = useState<TransportItem[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState(emptyForm);

  const fetchItems = async () => {
    if (!tripId) return;
    const { data } = await supabase
      .from("trip_transport")
      .select("*")
      .eq("trip_id", tripId)
      .order("departure_datetime", { ascending: true });
    setItems(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, [tripId]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (item: TransportItem) => {
    setEditingId(item.id);
    setForm({
      type: item.type,
      departure_location: item.departure_location,
      arrival_location: item.arrival_location,
      departure_datetime: item.departure_datetime.slice(0, 16),
      arrival_datetime: item.arrival_datetime?.slice(0, 16) ?? "",
      booking_reference: item.booking_reference ?? "",
      notes: item.notes ?? "",
    });
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tripId) return;

    const payload = {
      type: form.type,
      departure_location: form.departure_location,
      arrival_location: form.arrival_location,
      departure_datetime: form.departure_datetime,
      arrival_datetime: form.arrival_datetime || null,
      booking_reference: form.booking_reference || null,
      notes: form.notes || null,
    };

    const { error } = editingId
      ? await supabase.from("trip_transport").update(payload).eq("id", editingId)
      : await supabase.from("trip_transport").insert({ ...payload, trip_id: tripId });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    setForm(emptyForm);
    setEditingId(null);
    setOpen(false);
    fetchItems();
    toast({ title: editingId ? "Transporte actualizado" : "Transporte añadido" });
  };

  const handleDelete = async (id: string) => {
    await supabase.from("trip_transport").delete().eq("id", id);
    fetchItems();
  };

  const formatDt = (d: string) =>
    new Date(d).toLocaleString("es-ES", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

  if (loading) {
    return <div className="flex justify-center py-10"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-foreground">Cómo Viajamos</h2>
        {isCreator && (
          <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setEditingId(null); }}>
            <DialogTrigger asChild>
              <Button size="sm" className="gradient-hero text-primary-foreground border-0" onClick={openCreate}>
                <Plus className="h-4 w-4 mr-1" /> Añadir
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{editingId ? "Editar transporte" : "Añadir transporte"}</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Tipo</Label>
                  <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(typeLabels).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Origen</Label><Input required value={form.departure_location} onChange={(e) => setForm({ ...form, departure_location: e.target.value })} /></div>
                  <div><Label>Destino</Label><Input required value={form.arrival_location} onChange={(e) => setForm({ ...form, arrival_location: e.target.value })} /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Salida</Label><Input type="datetime-local" required value={form.departure_datetime} onChange={(e) => setForm({ ...form, departure_datetime: e.target.value })} /></div>
                  <div><Label>Llegada</Label><Input type="datetime-local" value={form.arrival_datetime} onChange={(e) => setForm({ ...form, arrival_datetime: e.target.value })} /></div>
                </div>
                <div><Label>Referencia reserva</Label><Input value={form.booking_reference} onChange={(e) => setForm({ ...form, booking_reference: e.target.value })} /></div>
                <div><Label>Notas</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
                <Button type="submit" className="w-full gradient-hero text-primary-foreground border-0">{editingId ? "Actualizar" : "Guardar"}</Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={Plane}
          title="Sin transporte registrado"
          description={isCreator ? "Añade los detalles de vuelos, trenes o cualquier medio de transporte." : "El administrador del viaje aún no ha añadido transporte."}
        />
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="rounded-xl bg-card p-4 shadow-card">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-medium text-muted-foreground uppercase">{typeLabels[item.type] ?? item.type}</span>
                  <p className="text-sm font-semibold text-card-foreground mt-1">{item.departure_location} → {item.arrival_location}</p>
                  <p className="text-xs text-muted-foreground mt-1">{formatDt(item.departure_datetime)}{item.arrival_datetime ? ` — ${formatDt(item.arrival_datetime)}` : ""}</p>
                  {item.booking_reference && <p className="text-xs text-muted-foreground mt-1">Ref: {item.booking_reference}</p>}
                  {item.notes && <p className="text-xs text-muted-foreground mt-1">{item.notes}</p>}
                </div>
                {isCreator && (
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => openEdit(item)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive h-8 w-8" onClick={() => handleDelete(item.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Transport;
