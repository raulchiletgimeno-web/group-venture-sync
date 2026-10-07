import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { getLocale } from "@/i18n/translations";
import { cn } from "@/lib/utils";
import { es, enGB, fr, pt, it, de, zhCN, type Locale } from "date-fns/locale";

const CALENDAR_LOCALES: Record<string, Locale> = { es, en: enGB, fr, pt, it, de, zh: zhCN };
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const generateInviteCode = () =>
  Array.from(crypto.getRandomValues(new Uint8Array(6)))
    .map((b) => b.toString(36).padStart(2, "0"))
    .join("")
    .slice(0, 8)
    .toUpperCase();

const toYmd = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const fromYmd = (v: string) => {
  const [y, m, d] = v.split("-").map(Number);
  return new Date(y, m - 1, d);
};

interface DateFieldProps {
  id: string;
  value: string;
  onChange: (v: string) => void;
  locale: string;
  lang: string;
  minDate?: string;
}

const DateField = ({ id, value, onChange, locale, lang, minDate }: DateFieldProps) => {
  const [open, setOpen] = useState(false);
  const selected = value ? fromYmd(value) : undefined;
  const min = minDate ? fromYmd(minDate) : undefined;
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          id={id}
          type="button"
          data-value={value}
          className={cn(
            "flex h-10 min-h-10 w-full min-w-0 items-center justify-between gap-2 rounded-md border border-input bg-background px-3 py-2 text-base text-left ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:text-sm",
            !value && "text-muted-foreground",
          )}
        >
          <span className="truncate">
            {selected ? selected.toLocaleDateString(locale, { day: "2-digit", month: "2-digit", year: "numeric" }) : "--/--/----"}
          </span>
          <CalendarIcon className="h-4 w-4 shrink-0 opacity-60" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 pointer-events-auto" align="start">
        <Calendar
          mode="single"
          locale={CALENDAR_LOCALES[lang] ?? enGB}
          weekStartsOn={1}
          selected={selected}
          defaultMonth={selected ?? min}
          disabled={min ? { before: min } : undefined}
          onSelect={(d) => {
            if (d) {
              onChange(toYmd(d));
              setOpen(false);
            }
          }}
          initialFocus
          className="p-3 pointer-events-auto"
        />
      </PopoverContent>
    </Popover>
  );
};

interface CreateTripDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateTripDialog = ({ open, onOpenChange }: CreateTripDialogProps) => {
  const [title, setTitle] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [country, setCountry] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!startDate || !endDate) {
      toast({ title: `${t.start} / ${t.end}`, variant: "destructive" });
      return;
    }
    if (endDate < startDate) {
      toast({ title: t.endBeforeStart, variant: "destructive" });
      return;
    }
    setSubmitting(true);

    const inviteCode = generateInviteCode();
    const destination = [city, province, country].filter(Boolean).join(", ");

    const { data: trip, error } = await supabase
      .from("trips")
      .insert({
        title,
        destination,
        start_date: startDate,
        end_date: endDate,
        created_by: user.id,
        invite_code: inviteCode,
      })
      .select()
      .single();

    if (error || !trip) {
      toast({ title: t.errorCreatingTrip, description: error?.message, variant: "destructive" });
      setSubmitting(false);
      return;
    }

    await supabase.from("trip_members").insert({
      trip_id: trip.id,
      user_id: user.id,
      role: "creator",
      status: "approved",
    });

    toast({ title: t.tripCreated, description: `${t.inviteCode}: ${inviteCode}` });
    onOpenChange(false);
    setTitle("");
    setCity("");
    setProvince("");
    setCountry("");
    setStartDate("");
    setEndDate("");
    setSubmitting(false);
    navigate(`/trip/${trip.id}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm mx-auto">
        <DialogHeader>
          <DialogTitle>{t.createTripTitle}</DialogTitle>
          <DialogDescription>{t.createTripDesc}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="trip-title">{t.title}</Label>
            <Input id="trip-title" placeholder={t.titlePlaceholder} value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="trip-city">{t.destinationCity}</Label>
            <Input id="trip-city" placeholder={t.destinationCityPlaceholder} value={city} onChange={(e) => setCity(e.target.value)} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="trip-province">{t.destinationProvince}</Label>
              <Input id="trip-province" placeholder={t.destinationProvincePlaceholder} value={province} onChange={(e) => setProvince(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="trip-country">{t.destinationCountry}</Label>
              <Input id="trip-country" placeholder={t.destinationCountryPlaceholder} value={country} onChange={(e) => setCountry(e.target.value)} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5 min-w-0">
              <Label htmlFor="trip-start">{t.start}</Label>
              <DateField
                id="trip-start"
                value={startDate}
                locale={getLocale(language)}
                lang={language}
                onChange={(v) => {
                  setStartDate(v);
                  if (endDate && endDate < v) setEndDate(v);
                }}
              />
            </div>
            <div className="space-y-1.5 min-w-0">
              <Label htmlFor="trip-end">{t.end}</Label>
              <DateField
                id="trip-end"
                value={endDate}
                locale={getLocale(language)}
                lang={language}
                minDate={startDate || undefined}
                onChange={setEndDate}
              />
            </div>
          </div>
          <Button type="submit" className="w-full font-semibold" disabled={submitting}>
            {submitting ? t.creating : t.createTrip}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTripDialog;
