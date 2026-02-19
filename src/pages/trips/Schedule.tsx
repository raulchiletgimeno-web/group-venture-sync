import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { CalendarDays, Plus, Trash2, ExternalLink, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import EmptyState from "@/components/EmptyState";
import { supabase } from "@/integrations/supabase/client";
import { useTripRole } from "@/hooks/use-trip-role";
import { useToast } from "@/hooks/use-toast";

interface ScheduleItem {
  id: string;
  date: string;
  time: string | null;
  title: string;
  description: string | null;
  location: string | null;
  website: string | null;
}

const Schedule = () => {
  const { tripId } = useParams();
  const { isCreator } = useTripRole(tripId);
  const { toast } = useToast();
  const [items, setItems] = useState<ScheduleItem[]>([]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    date: "",
    time: "",
    title: "",
    description: "",
    location: "",
    website: "",
  });

  const fetchItems = async () => {
    if (!tripId) return;
    const { data } = await supabase
      .from("trip_schedule")
      .select("*")
      .eq("trip_id", tripId)
      .order("date", { ascending: true })
      .order("time", { ascending: true });
    setItems(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, [tripId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tripId) return;

    const payload = {
      trip_id: tripId,
      date: form.date,
      time: form.time || null,
      title: form.title,
      description: form.description || null,
      location: form.location || null,
      website: form.website || null,
    };

    const { error } = editingId
      ? await supabase.from("trip_schedule").update(payload).eq("id", editingId)
      : await supabase.from("trip_schedule").insert(payload);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    resetForm();
    setOpen(false);
    fetchItems();
    toast({ title: editingId ? "Actividad actualizada" : "Actividad añadida" });
  };

  const resetForm = () => {
    setForm({ date: "", time: "", title: "", description: "", location: "", website: "" });
    setEditingId(null);
  };

  const startEdit = (item: ScheduleItem) => {
    setForm({
      date: item.date,
      time: item.time || "",
      title: item.title,
      description: item.description || "",
      location: item.location || "",
      website: item.website || "",
    });
    setEditingId(item.id);
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    await supabase.from("trip_schedule").delete().eq("id", id);
    fetchItems();
  };

  const formatDate = (d: string) =>
    new Date(d + "T00:00:00").toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short" });

  // Group by date
  const grouped = items.reduce<Record<string, ScheduleItem[]>>((acc, item) => {
    (acc[item.date] ??= []).push(item);
    return acc;
  }, {});

  if (loading) {
    return <div className="flex justify-center py-10"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-foreground">Actividades</h2>
        {isCreator && (
          <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
            <DialogTrigger asChild>
              <Button size="sm" className="gradient-hero text-primary-foreground border-0">
                <Plus className="h-4 w-4 mr-1" /> Añadir
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{editingId ? "Editar actividad" : "Añadir actividad"}</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div><Label>Título</Label><Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Visita al museo, cena..." /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Fecha</Label><Input type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
                  <div><Label>Hora</Label><Input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} /></div>
                </div>
                <div><Label>Lugar</Label><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
                <div><Label>Descripción</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
                <div><Label>Página web</Label><Input type="url" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="https://..." /></div>
                <Button type="submit" className="w-full gradient-hero text-primary-foreground border-0">{editingId ? "Actualizar" : "Guardar"}</Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="Sin actividades planificadas"
          description={isCreator ? "Organiza el itinerario día a día con actividades y horarios." : "El administrador del viaje aún no ha planificado actividades."}
        />
      ) : (
        <div className="space-y-5">
          {Object.entries(grouped).map(([date, dayItems]) => (
            <div key={date}>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">{formatDate(date)}</h3>
              <div className="space-y-2">
                {dayItems.map((item) => (
                  <div key={item.id} className="rounded-xl bg-card p-4 shadow-card">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          {item.time && <span className="text-xs font-medium text-primary">{item.time.slice(0, 5)}</span>}
                          <p className="text-sm font-semibold text-card-foreground">{item.title}</p>
                        </div>
                        {item.location && <p className="text-xs text-muted-foreground mt-1">📍 {item.location}</p>}
                        {item.description && <p className="text-xs text-muted-foreground mt-1">{item.description}</p>}
                        {item.website && (
                          <button
                            onClick={() => window.open(item.website!, "_blank")}
                            className="flex items-center gap-1 text-xs text-primary mt-1.5 hover:underline"
                          >
                            <ExternalLink className="h-3 w-3" /> Ver página web
                          </button>
                        )}
                      </div>
                      {isCreator && (
                        <div className="flex items-center gap-1 shrink-0">
                          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground h-8 w-8" onClick={() => startEdit(item)}>
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Schedule;
