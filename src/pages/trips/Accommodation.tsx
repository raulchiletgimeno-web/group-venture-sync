import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Hotel, Plus, Trash2, Pencil, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import EmptyState from "@/components/EmptyState";
import { supabase } from "@/integrations/supabase/client";
import { useTripRole } from "@/hooks/use-trip-role";
import { useToast } from "@/hooks/use-toast";

interface AccommodationItem {
  id: string;
  name: string;
  address: string | null;
  check_in: string;
  check_out: string;
  booking_reference: string | null;
  notes: string | null;
  website: string | null;
}

const Accommodation = () => {
  const { tripId } = useParams();
  const { isCreator } = useTripRole(tripId);
  const { toast } = useToast();
  const [items, setItems] = useState<AccommodationItem[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);

  const emptyForm = {
    name: "",
    address: "",
    check_in: "",
    check_out: "",
    booking_reference: "",
    notes: "",
    website: "",
  };

  const [form, setForm] = useState(emptyForm);

  const fetchItems = async () => {
    if (!tripId) return;
    const { data } = await supabase
      .from("trip_accommodation")
      .select("*")
      .eq("trip_id", tripId)
      .order("check_in", { ascending: true });
    setItems(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, [tripId]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (item: AccommodationItem) => {
    setEditingId(item.id);
    setForm({
      name: item.name,
      address: item.address ?? "",
      check_in: item.check_in,
      check_out: item.check_out,
      booking_reference: item.booking_reference ?? "",
      notes: item.notes ?? "",
      website: item.website ?? "",
    });
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tripId) return;

    const payload = {
      name: form.name,
      address: form.address || null,
      check_in: form.check_in,
      check_out: form.check_out,
      booking_reference: form.booking_reference || null,
      notes: form.notes || null,
      website: form.website || null,
    };

    const { error } = editingId
      ? await supabase.from("trip_accommodation").update(payload).eq("id", editingId)
      : await supabase.from("trip_accommodation").insert({ ...payload, trip_id: tripId });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    setForm(emptyForm);
    setEditingId(null);
    setOpen(false);
    fetchItems();
    toast({ title: editingId ? "Alojamiento actualizado" : "Alojamiento añadido" });
  };

  const handleDelete = async (id: string) => {
    await supabase.from("trip_accommodation").delete().eq("id", id);
    fetchItems();
  };

  const formatDate = (d: string) =>
    new Date(d + "T00:00:00").toLocaleDateString("es-ES", { day: "numeric", month: "short" });

  if (loading) {
    return <div className="flex justify-center py-10"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-foreground">Dónde Dormimos</h2>
        {isCreator && (
          <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setEditingId(null); }}>
            <DialogTrigger asChild>
              <Button size="sm" className="gradient-hero text-primary-foreground border-0" onClick={openCreate}>
                <Plus className="h-4 w-4 mr-1" /> Añadir
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{editingId ? "Editar alojamiento" : "Añadir alojamiento"}</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div><Label>Nombre</Label><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Hotel, apartamento..." /></div>
                <div><Label>Dirección</Label><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Check-in</Label><Input type="date" required value={form.check_in} onChange={(e) => setForm({ ...form, check_in: e.target.value })} /></div>
                  <div><Label>Check-out</Label><Input type="date" required value={form.check_out} onChange={(e) => setForm({ ...form, check_out: e.target.value })} /></div>
                </div>
                <div><Label>Referencia reserva</Label><Input value={form.booking_reference} onChange={(e) => setForm({ ...form, booking_reference: e.target.value })} /></div>
                <div><Label>Página web</Label><Input type="url" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="https://www.hotel.com" /></div>
                <div><Label>Notas</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
                <Button type="submit" className="w-full gradient-hero text-primary-foreground border-0">{editingId ? "Actualizar" : "Guardar"}</Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={Hotel}
          title="Sin alojamiento registrado"
          description={isCreator ? "Añade hoteles, apartamentos o cualquier alojamiento del viaje." : "El administrador del viaje aún no ha añadido alojamiento."}
        />
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="rounded-xl bg-card p-4 shadow-card">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-card-foreground">{item.name}</p>
                  {item.address && <p className="text-xs text-muted-foreground mt-1">{item.address}</p>}
                  <p className="text-xs text-muted-foreground mt-1">{formatDate(item.check_in)} — {formatDate(item.check_out)}</p>
                  {item.booking_reference && <p className="text-xs text-muted-foreground mt-1">Ref: {item.booking_reference}</p>}
                  {item.notes && <p className="text-xs text-muted-foreground mt-1">{item.notes}</p>}
                </div>
                <div className="flex flex-col items-end gap-1">
                  {item.website && (
                    <a href={item.website.startsWith("http") ? item.website : `https://${item.website}`} target="_blank" rel="noopener noreferrer">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-primary">
                        <Globe className="h-4 w-4" />
                      </Button>
                    </a>
                  )}
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Accommodation;
