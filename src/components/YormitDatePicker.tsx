import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { es, enGB, fr, pt, it, de, zhCN, type Locale } from "date-fns/locale";
import { useLanguage } from "@/contexts/LanguageContext";
import { getLocale } from "@/i18n/translations";

const CALENDAR_LOCALES: Record<string, Locale> = { es, en: enGB, fr, pt, it, de, zh: zhCN };

export const toYmd = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
export const fromYmd = (v: string) => {
  const [y, m, d] = v.split("-").map(Number);
  return new Date(y, m - 1, d);
};

interface YormitDatePickerProps {
  id?: string;
  value: string; // YYYY-MM-DD
  onChange: (v: string) => void;
  minDate?: string;
  className?: string;
}

const YormitDatePicker = ({ id, value, onChange, minDate, className }: YormitDatePickerProps) => {
  const { language } = useLanguage();
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
            className,
          )}
        >
          <span className="truncate">
            {selected ? selected.toLocaleDateString(getLocale(language), { day: "2-digit", month: "2-digit", year: "numeric" }) : "--/--/----"}
          </span>
          <CalendarIcon className="h-4 w-4 shrink-0 opacity-60" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 pointer-events-auto" align="start">
        <Calendar
          mode="single"
          locale={CALENDAR_LOCALES[language] ?? enGB}
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

export default YormitDatePicker;
