import { useEffect, useState, useMemo, useRef } from "react";
import { useParams } from "react-router-dom";
import { CalendarDays, Plus, Trash2, Pencil, Globe, MapPin, ArrowLeft, Route, Paperclip, X } from "lucide-react";
import { format, parseISO, isSameDay, eachDayOfInterval } from "date-fns";
import { es, enUS, fr, pt, it } from "date-fns/locale";
import ActivityTicketManager from "@/components/ActivityTicketManager";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Calendar } from "@/components/ui/calendar";
import EmptyState from "@/components/EmptyState";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useTripRole } from "@/hooks/use-trip-role";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { getLocale } from "@/i18n/translations";
import { useMarkSectionSeen } from "@/hooks/use-mark-section-seen";
import { notifyTripEvent } from "@/lib/notifyTripEvent";
import { getSignedUrl } from "@/lib/signedUrl";

const dateFnsLocales: Record<string, typeof es> = { es, en: enUS, fr, pt, it };

interface ScheduleItem {
  id: string;
  date: string;
  time: string | null;
  title: string;
  description: string | null;
  location: string | null;
  website: string | null;
  gpx_path: string | null;
  gpx_name: string | null;
}

const Schedule = () => {
  const { tripId } = useParams();
  useMarkSectionSeen(tripId, "schedule");
  const { user } = useAuth();
  const { isCreator } = useTripRole(tripId);
  const { toast } = useToast();
  const { t, language } = useLanguage();
  const [items, setItems] = useState<ScheduleItem[]>([]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [tripDates, setTripDates] = useState<{ start: Date; end: Date } | null>(null);

  const [form, setForm] = useState({ date: "", time: "", title: "", description: "", location: "", address: "", website: "" });
  const [gpxFile, setGpxFile] = useState<File | null>(null);
  const [existingGpx, setExistingGpx] = useState<{ path: string; name: string } | null>(null);
  const [removeGpx, setRemoveGpx] = useState(false);
  const [uploadingGpx, setUploadingGpx] = useState(false);
  const gpxInputRef = useRef<HTMLInputElement>(null);

  const fetchItems = async () => {
    if (!tripId) return;
    const { data } = await supabase.from("trip_schedule").select("*").eq("trip_id", tripId).order("date", { ascending: true }).order("time", { ascending: true });
    setItems(data ?? []);
    setLoading(false);
  };

  const fetchTripDates = async () => {
    if (!tripId) return;
    const { data } = await supabase.from("trips").select("start_date, end_date").eq("id", tripId).single();
    if (data) {
      setTripDates({
        start: parseISO(data.start_date),
        end: parseISO(data.end_date),
      });
    }
  };

  useEffect(() => {
    fetchItems();
    fetchTripDates();
  }, [tripId]);

  // Set of date strings that have activities
  const datesWithActivities = useMemo(() => {
    const set = new Set<string>();
    items.forEach((item) => set.add(item.date));
    return set;
  }, [items]);

  // Activities for the selected date
  const selectedDayItems = useMemo(() => {
    if (!selectedDate) return [];
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    return items.filter((item) => item.date === dateStr);
  }, [items, selectedDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tripId) return;
    setUploadingGpx(true);
    try {
      let gpx_path: string | null = existingGpx?.path ?? null;
      let gpx_name: string | null = existingGpx?.name ?? null;

      if (removeGpx && existingGpx) {
        await supabase.storage.from("trip-photos").remove([existingGpx.path]);
        gpx_path = null;
        gpx_name = null;
      }

      const payload: any = { trip_id: tripId, date: form.date, time: form.time || null, title: form.title, description: form.description || null, location: form.location || null, address: form.address || null, website: form.website || null, gpx_path, gpx_name };

      let recordId = editingId;
      if (editingId) {
        const { error } = await supabase.from("trip_schedule").update(payload).eq("id", editingId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from("trip_schedule").insert(payload).select("id").single();
        if (error) throw error;
        recordId = data.id;
      }

      if (gpxFile && recordId) {
        const path = `${tripId}/activity-gpx/${recordId}.gpx`;
        if (existingGpx && existingGpx.path !== path) {
          await supabase.storage.from("trip-photos").remove([existingGpx.path]);
        }
        const { error: upErr } = await supabase.storage.from("trip-photos").upload(path, gpxFile, { upsert: true, contentType: "application/gpx+xml" });
        if (upErr) throw upErr;
        const { error: updErr } = await supabase.from("trip_schedule").update({ gpx_path: path, gpx_name: gpxFile.name }).eq("id", recordId);
        if (updErr) throw updErr;
      }

      resetForm(); setOpen(false); fetchItems();
      notifyTripEvent(tripId, "schedule", user?.id);
      toast({ title: editingId ? t.activityUpdated : t.activityAdded });
    } catch (error: any) {
      toast({ title: t.error, description: error.message, variant: "destructive" });
    } finally {
      setUploadingGpx(false);
    }
  };

  const resetForm = () => {
    setForm({ date: "", time: "", title: "", description: "", location: "", address: "", website: "" });
    setEditingId(null);
    setGpxFile(null);
    setExistingGpx(null);
    setRemoveGpx(false);
    if (gpxInputRef.current) gpxInputRef.current.value = "";
  };

  const startEdit = (item: ScheduleItem) => {
    setForm({ date: item.date, time: item.time || "", title: item.title, description: item.description || "", location: item.location || "", address: (item as any).address || "", website: item.website || "" });
    setEditingId(item.id);
    setGpxFile(null);
    setRemoveGpx(false);
    setExistingGpx(item.gpx_path && item.gpx_name ? { path: item.gpx_path, name: item.gpx_name } : null);
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    const item = items.find((i) => i.id === id);
    if (item?.gpx_path) {
      await supabase.storage.from("trip-photos").remove([item.gpx_path]);
    }
    await supabase.from("trip_schedule").delete().eq("id", id);
    fetchItems();
  };

  const handleAddClick = () => {
    if (selectedDate) {
      setForm({ ...form, date: format(selectedDate, "yyyy-MM-dd") });
    }
    setOpen(true);
  };

  const locale = dateFnsLocales[language] || es;

  // Modifiers for calendar dots
  const activityDayMatcher = (date: Date) => {
    return datesWithActivities.has(format(date, "yyyy-MM-dd"));
  };

  // Disabled days: outside trip range
  const disabledMatcher = (date: Date) => {
    if (!tripDates) return false;
    return date < tripDates.start || date > tripDates.end;
  };

  if (loading) return <div className="flex justify-center py-10"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;

  const addButton = isCreator && (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
      <DialogTrigger asChild>
        <Button size="sm" className="gradient-hero text-primary-foreground border-0" onClick={selectedDate ? handleAddClick : undefined}>
          <Plus className="h-4 w-4 mr-1" /> {t.add}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>{editingId ? t.editActivity : t.addActivity}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><Label>{t.activityTitle}</Label><Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder={t.activityPlaceholder} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>{t.date}</Label><Input type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
            <div><Label>{t.time}</Label><Input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} /></div>
          </div>
          <div><Label>{t.place}</Label><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder={t.placePlaceholder} /></div>
          <div><Label>{t.addressLabel}</Label><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder={t.addressPlaceholder} /></div>
          <div><Label>{t.description}</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div><Label>{t.webPage}</Label><Input type="url" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="https://..." /></div>
          <div className="space-y-2">
            <Label>{t.gpxAttach}</Label>
            <input
              ref={gpxInputRef}
              type="file"
              accept=".gpx,application/gpx+xml"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                if (!f.name.toLowerCase().endsWith(".gpx")) {
                  toast({ title: t.error, description: ".gpx", variant: "destructive" });
                  return;
                }
                setGpxFile(f);
                setRemoveGpx(false);
              }}
            />
            {gpxFile ? (
              <div className="flex items-center justify-between rounded-lg bg-muted p-2 text-sm">
                <span className="flex items-center gap-2 truncate"><Route className="h-4 w-4 text-primary shrink-0" /><span className="truncate">{gpxFile.name}</span></span>
                <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setGpxFile(null); if (gpxInputRef.current) gpxInputRef.current.value = ""; }}><X className="h-4 w-4" /></Button>
              </div>
            ) : existingGpx && !removeGpx ? (
              <div className="flex items-center justify-between rounded-lg bg-muted p-2 text-sm">
                <span className="flex items-center gap-2 truncate"><Route className="h-4 w-4 text-primary shrink-0" /><span className="truncate">{existingGpx.name}</span></span>
                <div className="flex gap-1">
                  <Button type="button" variant="ghost" size="sm" onClick={() => gpxInputRef.current?.click()}>{t.gpxReplace}</Button>
                  <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setRemoveGpx(true)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            ) : (
              <Button type="button" variant="outline" size="sm" className="w-full" onClick={() => gpxInputRef.current?.click()}>
                <Paperclip className="h-4 w-4 mr-1" /> {t.gpxAttach}
              </Button>
            )}
          </div>
          <Button type="submit" disabled={uploadingGpx} className="w-full gradient-hero text-primary-foreground border-0">{editingId ? t.update : t.save}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );

  // Calendar view
  if (!selectedDate) {
    return (
      <div className="animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">{t.activitiesTitle}</h2>
          {addButton}
        </div>

        {items.length === 0 && !tripDates ? (
          <EmptyState icon={CalendarDays} title={t.noActivitiesTitle} description={isCreator ? t.noActivitiesDescCreator : t.noActivitiesDescMember} />
        ) : (
          <div className="flex justify-center">
            <Calendar
              mode="single"
              selected={undefined}
              onSelect={(day) => { if (day) setSelectedDate(day); }}
              locale={locale}
              defaultMonth={tripDates?.start}
              disabled={disabledMatcher}
              modifiers={{ hasActivity: activityDayMatcher }}
              modifiersClassNames={{ hasActivity: "has-activity-dot" }}
              className="p-3 pointer-events-auto rounded-xl bg-card shadow-card"
            />
          </div>
        )}
      </div>
    );
  }

  // Day detail view
  const formattedDate = format(selectedDate, "EEEE, d MMM", { locale });

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="sm" onClick={() => setSelectedDate(null)} className="text-muted-foreground -ml-2">
          <ArrowLeft className="h-4 w-4 mr-1" /> {t.backToCalendar}
        </Button>
        {addButton}
      </div>

      <h3 className="text-lg font-semibold text-foreground capitalize mb-4">{formattedDate}</h3>

      {selectedDayItems.length === 0 ? (
        <EmptyState icon={CalendarDays} title={t.noActivitiesDay} description={isCreator ? t.noActivitiesDescCreator : ""} />
      ) : (
        <div className="space-y-2">
          {selectedDayItems.map((item) => (
            <div key={item.id} className="rounded-xl bg-card p-4 shadow-card">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    {item.time && <span className="text-xs font-medium text-primary">{item.time.slice(0, 5)}</span>}
                    <p className="text-sm font-semibold text-card-foreground">{item.title}</p>
                  </div>
                  {item.location && <p className="text-xs text-muted-foreground mt-1">📍 {item.location}</p>}
                  {item.description && <p className="text-xs text-muted-foreground mt-1">{item.description}</p>}
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <div className="flex gap-1">
                    {item.website && (
                      <Tooltip><TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={() => window.open(item.website!.startsWith("http") ? item.website! : `https://${item.website}`, '_blank')}>
                          <Globe className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger><TooltipContent>{t.web}</TooltipContent></Tooltip>
                    )}
                    <ActivityTicketManager scheduleId={item.id} tripId={tripId!} isCreator={isCreator} />
                    {item.location && (
                      <Tooltip><TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent((item as any).address || item.location!)}`, '_blank')}>
                          <MapPin className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger><TooltipContent>{t.howToGet}</TooltipContent></Tooltip>
                    )}
                  </div>
                  {isCreator && (
                    <div className="flex gap-1">
                      <Tooltip><TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => startEdit(item)}>
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
    </div>
  );
};

export default Schedule;
