import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { Hotel, Plus, Trash2, Pencil, Globe, MapPin, Upload, Eye, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import EmptyState from "@/components/EmptyState";
import { supabase } from "@/integrations/supabase/client";
import { useTripRole } from "@/hooks/use-trip-role";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { getLocale } from "@/i18n/translations";

interface AccommodationItem {
  id: string;
  name: string;
  address: string | null;
  check_in: string;
  check_out: string;
  booking_reference: string | null;
  notes: string | null;
  website: string | null;
  booking_file_path: string | null;
}

const Accommodation = () => {
  const { tripId } = useParams();
  const { isCreator } = useTripRole(tripId);
  const { toast } = useToast();
  const { t, language } = useLanguage();
  const [items, setItems] = useState<AccommodationItem[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [viewUrl, setViewUrl] = useState("");
  const [uploading, setUploading] = useState<string | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const emptyForm = { name: "", address: "", check_in: "", check_out: "", booking_reference: "", notes: "", website: "" };
  const [form, setForm] = useState(emptyForm);

  const fetchItems = async () => {
    if (!tripId) return;
    const { data } = await supabase.from("trip_accommodation").select("*").eq("trip_id", tripId).order("check_in", { ascending: true });
    setItems((data as AccommodationItem[] | null) ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, [tripId]);

  const openCreate = () => { setEditingId(null); setForm(emptyForm); setOpen(true); };

  const openEdit = (item: AccommodationItem) => {
    setEditingId(item.id);
    setForm({ name: item.name, address: item.address ?? "", check_in: item.check_in, check_out: item.check_out, booking_reference: item.booking_reference ?? "", notes: item.notes ?? "", website: item.website ?? "" });
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tripId) return;
    const payload = { name: form.name, address: form.address || null, check_in: form.check_in, check_out: form.check_out, booking_reference: form.booking_reference || null, notes: form.notes || null, website: form.website || null };
    const { error } = editingId
      ? await supabase.from("trip_accommodation").update(payload).eq("id", editingId)
      : await supabase.from("trip_accommodation").insert({ ...payload, trip_id: tripId });
    if (error) { toast({ title: t.error, description: error.message, variant: "destructive" }); return; }
    setForm(emptyForm); setEditingId(null); setOpen(false); fetchItems();
    toast({ title: editingId ? t.accommodationUpdated : t.accommodationAdded });
  };

  const handleDelete = async (id: string) => { await supabase.from("trip_accommodation").delete().eq("id", id); fetchItems(); };

  const formatDate = (d: string) => new Date(d + "T00:00:00").toLocaleDateString(getLocale(language), { day: "numeric", month: "short" });

  const handleFileUpload = async (itemId: string, file: File) => {
    if (!tripId) return;
    setUploading(itemId);
    const ext = file.name.split(".").pop() || "pdf";
    const filePath = `${tripId}/accommodation/${itemId}.${ext}`;

    // Remove old file if exists
    const item = items.find(i => i.id === itemId);
    if (item?.booking_file_path) {
      await supabase.storage.from("trip-photos").remove([item.booking_file_path]);
    }

    const { error: uploadError } = await supabase.storage.from("trip-photos").upload(filePath, file, { upsert: true });
    if (uploadError) { toast({ title: t.error, description: uploadError.message, variant: "destructive" }); setUploading(null); return; }

    const { error: updateError } = await supabase.from("trip_accommodation").update({ booking_file_path: filePath } as any).eq("id", itemId);
    if (updateError) { toast({ title: t.error, description: updateError.message, variant: "destructive" }); setUploading(null); return; }

    toast({ title: t.bookingDocUploaded });
    setUploading(null);
    fetchItems();
  };

  const handleDeleteFile = async (item: AccommodationItem) => {
    if (!item.booking_file_path) return;
    await supabase.storage.from("trip-photos").remove([item.booking_file_path]);
    await supabase.from("trip_accommodation").update({ booking_file_path: null } as any).eq("id", item.id);
    toast({ title: t.bookingDocDeleted });
    fetchItems();
  };

  const openDocView = (item: AccommodationItem) => {
    if (!item.booking_file_path) return;
    const { data } = supabase.storage.from("trip-photos").getPublicUrl(item.booking_file_path);
    setViewUrl(data.publicUrl);
    setViewOpen(true);
  };

  const isImage = (path: string) => /\.(jpg|jpeg|png|gif|webp)$/i.test(path);

  if (loading) return <div className="flex justify-center py-10"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-foreground">{t.whereWeSleep}</h2>
        {isCreator && (
          <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setEditingId(null); }}>
            <DialogTrigger asChild>
              <Button size="sm" className="gradient-hero text-primary-foreground border-0" onClick={openCreate}>
                <Plus className="h-4 w-4 mr-1" /> {t.add}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{editingId ? t.editAccommodation : t.addAccommodation}</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div><Label>{t.accommodationName}</Label><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={t.accommodationNamePlaceholder} /></div>
                <div><Label>{t.address}</Label><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>{t.checkIn}</Label><Input type="date" required value={form.check_in} onChange={(e) => setForm({ ...form, check_in: e.target.value })} /></div>
                  <div><Label>{t.checkOut}</Label><Input type="date" required value={form.check_out} onChange={(e) => setForm({ ...form, check_out: e.target.value })} /></div>
                </div>
                <div><Label>{t.bookingReference}</Label><Input value={form.booking_reference} onChange={(e) => setForm({ ...form, booking_reference: e.target.value })} /></div>
                <div><Label>{t.website}</Label><Input type="url" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder={t.websitePlaceholder} /></div>
                <div><Label>{t.notes}</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
                <Button type="submit" className="w-full gradient-hero text-primary-foreground border-0">{editingId ? t.update : t.save}</Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {items.length === 0 ? (
        <EmptyState icon={Hotel} title={t.noAccommodationTitle} description={isCreator ? t.noAccommodationDescCreator : t.noAccommodationDescMember} />
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="rounded-xl bg-card p-4 shadow-card">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-card-foreground">{item.name}</p>
                  {item.address && <p className="text-xs text-muted-foreground mt-1">{item.address}</p>}
                  <p className="text-xs text-muted-foreground mt-1">{formatDate(item.check_in)} — {formatDate(item.check_out)}</p>
                  {item.booking_reference && <p className="text-xs text-muted-foreground mt-1">Ref: {item.booking_reference}</p>}
                  {item.notes && <p className="text-xs text-muted-foreground mt-1">{item.notes}</p>}
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className="flex gap-1">
                    {item.website && (
                      <Tooltip><TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={() => window.open(item.website!.startsWith("http") ? item.website! : `https://${item.website}`, '_blank')}>
                          <Globe className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger><TooltipContent>{t.web}</TooltipContent></Tooltip>
                    )}
                    {item.address && (
                      <Tooltip><TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(item.address!)}`, '_blank')}>
                          <MapPin className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger><TooltipContent>{t.howToGet}</TooltipContent></Tooltip>
                    )}
                  </div>

                  {/* Booking document buttons */}
                  <div className="flex gap-1">
                    {item.booking_file_path ? (
                      <>
                        <Tooltip><TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={() => openDocView(item)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger><TooltipContent>{t.viewBookingDoc}</TooltipContent></Tooltip>
                        {isCreator && (
                          <Tooltip><TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeleteFile(item)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger><TooltipContent>{t.deleteBookingDoc}</TooltipContent></Tooltip>
                        )}
                      </>
                    ) : isCreator ? (
                      <>
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          className="hidden"
                          ref={(el) => { fileInputRefs.current[item.id] = el; }}
                          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileUpload(item.id, f); e.target.value = ""; }}
                        />
                        <Tooltip><TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground"
                            disabled={uploading === item.id}
                            onClick={() => fileInputRefs.current[item.id]?.click()}
                          >
                            {uploading === item.id ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" /> : <Upload className="h-4 w-4" />}
                          </Button>
                        </TooltipTrigger><TooltipContent>{t.uploadBookingDoc}</TooltipContent></Tooltip>
                      </>
                    ) : null}
                  </div>

                  {isCreator && (
                    <div className="flex gap-1">
                      <Tooltip><TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => openEdit(item)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger><TooltipContent>{t.edit}</TooltipContent></Tooltip>
                      <Tooltip><TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive h-8 w-8" onClick={() => handleDelete(item.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger><TooltipContent>{t.delete}</TooltipContent></Tooltip>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Document preview dialog */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{t.bookingDocument}</DialogTitle></DialogHeader>
          {viewUrl && (
            isImage(viewUrl) ? (
              <img src={viewUrl} alt={t.bookingDocument} className="w-full rounded-lg" />
            ) : (
              <iframe src={viewUrl} className="w-full h-[70vh] rounded-lg border-0" title={t.bookingDocument} />
            )
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Accommodation;
