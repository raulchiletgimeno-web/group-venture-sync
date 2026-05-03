import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "@/hooks/use-toast";
import { Star, Loader2, Sparkles, CheckCircle2 } from "lucide-react";

const SECTIONS = [
  "Chat",
  "Fotos",
  "Gastos",
  "Itinerario",
  "Transporte",
  "Alojamiento",
  "Lugares útiles",
  "Tiempo",
];

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

type TripCtx = {
  id: string;
  title: string;
  destination: string;
  start_date: string;
  end_date: string;
};

type LoadState =
  | { phase: "loading" }
  | { phase: "ready"; trip: TripCtx | null; userName: string }
  | { phase: "already_used" }
  | { phase: "invalid" }
  | { phase: "submitted" };

export default function Feedback() {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const [state, setState] = useState<LoadState>({ phase: "loading" });
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [sectionsUsed, setSectionsUsed] = useState<string[]>([]);
  const [mostUseful, setMostUseful] = useState<string>("");
  const [toImprove, setToImprove] = useState<string>("");
  const [missingFeature, setMissingFeature] = useState("");
  const [whatToChange, setWhatToChange] = useState("");
  const [wouldUseAgain, setWouldUseAgain] = useState<string>("");
  const [freeComment, setFreeComment] = useState("");
  const [profileFirstName, setProfileFirstName] = useState("");
  const [profileLastName, setProfileLastName] = useState("");
  const [profileAge, setProfileAge] = useState("");
  const [profileResidence, setProfileResidence] = useState("");
  const [profileTravelsWith, setProfileTravelsWith] = useState("");

  useEffect(() => {
    let cancel = false;
    const load = async () => {
      if (!token) {
        setState({ phase: "invalid" });
        return;
      }
      try {
        const res = await fetch(
          `${SUPABASE_URL}/functions/v1/submit-trip-feedback?token=${encodeURIComponent(token)}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
              apikey: SUPABASE_ANON_KEY,
            },
          }
        );
        const data = await res.json().catch(() => ({}));
        if (cancel) return;
        if (res.status === 410) {
          setState({ phase: "already_used" });
        } else if (!res.ok || !data?.ok) {
          setState({ phase: "invalid" });
        } else {
          setState({
            phase: "ready",
            trip: data.trip ?? null,
            userName: data.userName ?? "",
          });
        }
      } catch {
        if (!cancel) setState({ phase: "invalid" });
      }
    };
    load();
    return () => {
      cancel = true;
    };
  }, [token]);

  const greetingName = useMemo(() => {
    if (state.phase !== "ready") return "";
    return state.userName?.trim()?.split(" ")[0] ?? "";
  }, [state]);

  const toggleSection = (s: string) => {
    setSectionsUsed((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating < 1 || rating > 5) {
      toast({
        title: "Falta tu valoración",
        description: "Por favor, valora tu experiencia de 1 a 5 estrellas.",
        variant: "destructive",
      });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/submit-trip-feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          apikey: SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({
          token,
          rating,
          sections_used: sectionsUsed,
          most_useful_section: mostUseful || undefined,
          section_to_improve: toImprove || undefined,
          missing_feature: missingFeature || undefined,
          what_to_change: whatToChange || undefined,
          would_use_again: wouldUseAgain || undefined,
          free_comment: freeComment || undefined,
          profile_first_name: profileFirstName || undefined,
          profile_last_name: profileLastName || undefined,
          profile_age: profileAge ? parseInt(profileAge, 10) : undefined,
          profile_residence: profileResidence || undefined,
          profile_travels_with: profileTravelsWith || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 410) {
        setState({ phase: "already_used" });
        return;
      }
      if (!res.ok || !data?.ok) {
        toast({
          title: "No hemos podido enviar tu feedback",
          description: "Inténtalo de nuevo en unos segundos.",
          variant: "destructive",
        });
        return;
      }
      setState({ phase: "submitted" });
    } catch {
      toast({
        title: "Error de conexión",
        description: "Inténtalo de nuevo en unos segundos.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (state.phase === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (state.phase === "invalid") {
    return (
      <CenteredCard
        title="Enlace no válido"
        body="Parece que este enlace no es correcto o ha caducado. Si crees que es un error, escríbenos a info@yormit.com."
      />
    );
  }

  if (state.phase === "already_used") {
    return (
      <CenteredCard
        icon={<CheckCircle2 className="h-10 w-10 text-primary" />}
        title="¡Ya nos has enviado tu opinión! 🙌"
        body="Mil gracias por tu feedback. Lo estamos revisando para seguir mejorando YORMIT."
      />
    );
  }

  if (state.phase === "submitted") {
    return (
      <CenteredCard
        icon={<Sparkles className="h-10 w-10 text-primary" />}
        title="¡Gracias por tu opinión! ✨"
        body="Hemos recibido tu feedback. Lo leeremos con calma y nos ayudará muchísimo a mejorar YORMIT."
      />
    );
  }

  const trip = state.trip;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-8 px-6 text-center">
        <h1 className="text-2xl font-bold tracking-widest">YORMIT</h1>
      </header>

      <main className="max-w-2xl mx-auto px-5 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-3">
            ¡Hola{greetingName ? `, ${greetingName}` : ""}! 👋
          </h2>
          {trip ? (
            <p className="text-base text-muted-foreground leading-relaxed">
              Esperamos que hayas disfrutado mucho de{" "}
              <strong className="text-foreground">{trip.title}</strong> 😊
              <br />
              Cuéntanos tu experiencia para seguir mejorando YORMIT.
            </p>
          ) : (
            <p className="text-base text-muted-foreground">
              Cuéntanos tu experiencia para seguir mejorando YORMIT.
            </p>
          )}
        </div>

        <form onSubmit={submit} className="space-y-7 bg-card rounded-2xl shadow-sm border border-border p-6 sm:p-8">
          {/* Rating */}
          <section>
            <Label className="text-base font-semibold block mb-3">
              ⭐ Tu valoración general <span className="text-destructive">*</span>
            </Label>
            <div className="flex items-center gap-2 justify-center">
              {[1, 2, 3, 4, 5].map((n) => {
                const active = (hoverRating || rating) >= n;
                return (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setRating(n)}
                    onMouseEnter={() => setHoverRating(n)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 transition-transform hover:scale-110"
                    aria-label={`${n} estrellas`}
                  >
                    <Star
                      className={`h-9 w-9 ${active ? "fill-primary text-primary" : "text-muted-foreground/40"}`}
                    />
                  </button>
                );
              })}
            </div>
            {rating > 0 && (
              <p className="text-center text-sm text-muted-foreground mt-2">
                {rating}/5
              </p>
            )}
          </section>

          {/* Sections used */}
          <section>
            <Label className="text-base font-semibold block mb-3">
              ¿Qué secciones has utilizado más?
            </Label>
            <div className="grid grid-cols-2 gap-2.5">
              {SECTIONS.map((s) => (
                <label
                  key={s}
                  className="flex items-center gap-2 rounded-lg border border-border p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                >
                  <Checkbox
                    checked={sectionsUsed.includes(s)}
                    onCheckedChange={() => toggleSection(s)}
                  />
                  <span className="text-sm">{s}</span>
                </label>
              ))}
            </div>
          </section>

          {/* Most useful */}
          <section>
            <Label htmlFor="mostUseful" className="text-base font-semibold block mb-2">
              ¿Qué sección te ha resultado más útil?
            </Label>
            <select
              id="mostUseful"
              value={mostUseful}
              onChange={(e) => setMostUseful(e.target.value)}
              className="w-full h-11 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">Selecciona…</option>
              {SECTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </section>

          {/* To improve */}
          <section>
            <Label htmlFor="toImprove" className="text-base font-semibold block mb-2">
              ¿Qué sección mejorarías?
            </Label>
            <select
              id="toImprove"
              value={toImprove}
              onChange={(e) => setToImprove(e.target.value)}
              className="w-full h-11 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">Selecciona…</option>
              {SECTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </section>

          {/* Missing feature */}
          <section>
            <Label htmlFor="missing" className="text-base font-semibold block mb-2">
              ¿Qué funcionalidad echas de menos?
            </Label>
            <Textarea
              id="missing"
              value={missingFeature}
              onChange={(e) => setMissingFeature(e.target.value)}
              placeholder="Cuéntanos qué te haría la vida más fácil…"
              maxLength={1000}
              rows={3}
            />
          </section>

          {/* What to change */}
          <section>
            <Label htmlFor="change" className="text-base font-semibold block mb-2">
              ¿Qué cambiarías para que la experiencia fuera mejor?
            </Label>
            <Textarea
              id="change"
              value={whatToChange}
              onChange={(e) => setWhatToChange(e.target.value)}
              placeholder="Cualquier idea o mejora concreta nos vale oro."
              maxLength={1000}
              rows={3}
            />
          </section>

          {/* Would use again */}
          <section>
            <Label className="text-base font-semibold block mb-3">
              ¿Volverías a usar YORMIT en otro viaje?
            </Label>
            <RadioGroup
              value={wouldUseAgain}
              onValueChange={setWouldUseAgain}
              className="flex flex-wrap gap-3"
            >
              {["Sí", "Tal vez", "No"].map((opt) => (
                <label
                  key={opt}
                  className="flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 cursor-pointer hover:bg-muted/50 transition-colors"
                >
                  <RadioGroupItem value={opt} />
                  <span className="text-sm">{opt}</span>
                </label>
              ))}
            </RadioGroup>
          </section>

          {/* Free comment */}
          <section>
            <Label htmlFor="comment" className="text-base font-semibold block mb-2">
              Comentario libre
            </Label>
            <Textarea
              id="comment"
              value={freeComment}
              onChange={(e) => setFreeComment(e.target.value)}
              placeholder="Lo que quieras contarnos 💙"
              maxLength={2000}
              rows={4}
            />
          </section>

          {/* Profile (optional, collapsed visually) */}
          <details className="rounded-xl border border-border bg-muted/30 p-4">
            <summary className="cursor-pointer text-base font-semibold select-none">
              👤 Cuéntanos un poco sobre ti (opcional)
            </summary>
            <div className="mt-4 space-y-4">
              <p className="text-xs text-muted-foreground">
                Solo lo usamos para entender mejor el perfil de quien usa YORMIT.
                Nada se publica.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="firstName">Nombre</Label>
                  <Input
                    id="firstName"
                    value={profileFirstName}
                    onChange={(e) => setProfileFirstName(e.target.value)}
                    maxLength={80}
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Primer apellido</Label>
                  <Input
                    id="lastName"
                    value={profileLastName}
                    onChange={(e) => setProfileLastName(e.target.value)}
                    maxLength={80}
                  />
                </div>
                <div>
                  <Label htmlFor="age">Edad</Label>
                  <Input
                    id="age"
                    type="number"
                    inputMode="numeric"
                    min={0}
                    max={130}
                    value={profileAge}
                    onChange={(e) => setProfileAge(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="residence">Lugar de residencia</Label>
                  <Input
                    id="residence"
                    value={profileResidence}
                    onChange={(e) => setProfileResidence(e.target.value)}
                    maxLength={120}
                    placeholder="Madrid, Barcelona…"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="travelsWith">¿Con quién sueles viajar?</Label>
                  <select
                    id="travelsWith"
                    value={profileTravelsWith}
                    onChange={(e) => setProfileTravelsWith(e.target.value)}
                    className="w-full h-11 rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="">Selecciona…</option>
                    <option value="familia">Familia</option>
                    <option value="pareja">Pareja</option>
                    <option value="amigos">Amigos</option>
                    <option value="compañeros">Compañeros</option>
                    <option value="mixto">Mixto</option>
                  </select>
                </div>
              </div>
            </div>
          </details>

          <Button type="submit" disabled={submitting} className="w-full h-12 text-base">
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Enviando…
              </>
            ) : (
              <>Enviar mi feedback ✨</>
            )}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            Gracias por ayudarnos a seguir mejorando YORMIT 🙌
          </p>
        </form>
      </main>
    </div>
  );
}

function CenteredCard({
  title,
  body,
  icon,
}: {
  title: string;
  body: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-5">
      <div className="max-w-md w-full text-center bg-card border border-border rounded-2xl p-8 shadow-sm">
        {icon && <div className="flex justify-center mb-4">{icon}</div>}
        <h1 className="text-2xl font-bold mb-3">{title}</h1>
        <p className="text-muted-foreground leading-relaxed">{body}</p>
      </div>
    </div>
  );
}
