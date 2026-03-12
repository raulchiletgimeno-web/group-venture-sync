import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Luggage, Hotel, Train, CalendarDays, Wallet, MessageCircle,
  Camera, CloudSun, Phone, ArrowRight, Play,
  MessageSquare, MapPinOff, ReceiptText, SearchX, FolderOpen,
  PlusCircle, LayoutDashboard, Share2,
  Zap, HeartHandshake, ListChecks, Users, Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger
} from "@/components/ui/accordion";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useLanguage } from "@/contexts/LanguageContext";
import { languageFlags, Language } from "@/i18n/translations";

const featureIcons = [Hotel, Train, CalendarDays, Wallet, MessageCircle, Camera, CloudSun, Phone];

const Landing = () => {
  const navigate = useNavigate();
  const [showVideo, setShowVideo] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoSectionRef = useRef<HTMLDivElement>(null);
  const faqRef = useRef<HTMLDivElement>(null);
  const { language, setLanguage, t } = useLanguage();

  useEffect(() => {
    if (showVideo && videoRef.current) {
      videoRef.current.muted = false;
      videoRef.current.play().catch(() => {});
    }
  }, [showVideo]);

  const features = [
    { icon: featureIcons[0], title: t.landingFeatureAccommodation, desc: t.landingFeatureAccommodationDesc },
    { icon: featureIcons[1], title: t.landingFeatureTransport, desc: t.landingFeatureTransportDesc },
    { icon: featureIcons[2], title: t.landingFeatureActivities, desc: t.landingFeatureActivitiesDesc },
    { icon: featureIcons[3], title: t.landingFeatureExpenses, desc: t.landingFeatureExpensesDesc },
    { icon: featureIcons[4], title: t.landingFeatureChat, desc: t.landingFeatureChatDesc },
    { icon: featureIcons[5], title: t.landingFeaturePhotos, desc: t.landingFeaturePhotosDesc },
    { icon: featureIcons[6], title: t.landingFeatureWeather, desc: t.landingFeatureWeatherDesc },
    { icon: featureIcons[7], title: t.landingFeaturePhones, desc: t.landingFeaturePhonesDesc },
  ];

  const problems = [
    { icon: MessageSquare, text: t.landingProblem1 },
    { icon: MapPinOff, text: t.landingProblem2 },
    { icon: ReceiptText, text: t.landingProblem3 },
    { icon: SearchX, text: t.landingProblem4 },
    { icon: FolderOpen, text: t.landingProblem5 },
  ];

  const steps = [
    { icon: PlusCircle, num: "1", title: t.landingHow1Title, desc: t.landingHow1Desc },
    { icon: LayoutDashboard, num: "2", title: t.landingHow2Title, desc: t.landingHow2Desc },
    { icon: Share2, num: "3", title: t.landingHow3Title, desc: t.landingHow3Desc },
  ];

  const benefits = [
    { icon: Zap, title: t.landingBenefit1, desc: t.landingBenefit1Desc },
    { icon: HeartHandshake, title: t.landingBenefit2, desc: t.landingBenefit2Desc },
    { icon: ListChecks, title: t.landingBenefit3, desc: t.landingBenefit3Desc },
    { icon: Users, title: t.landingBenefit4, desc: t.landingBenefit4Desc },
    { icon: Clock, title: t.landingBenefit5, desc: t.landingBenefit5Desc },
  ];

  const faqs = [
    { q: t.landingFaq1Q, a: t.landingFaq1A },
    { q: t.landingFaq2Q, a: t.landingFaq2A },
    { q: t.landingFaq3Q, a: t.landingFaq3A },
    { q: t.landingFaq4Q, a: t.landingFaq4A },
    { q: t.landingFaq5Q, a: t.landingFaq5A },
  ];

  const langs: Language[] = ["es", "en", "fr", "pt", "it", "zh", "de"];

  const scrollToVideo = () => {
    videoSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* Language selector — top right, discrete */}
      <div className="absolute top-3 right-4 z-50 flex gap-1">
        {langs.map((lang) => (
          <button
            key={lang}
            onClick={() => setLanguage(lang)}
            className={`rounded overflow-hidden transition-all ${language === lang ? "ring-2 ring-primary scale-110 opacity-100" : "opacity-40 hover:opacity-80"}`}
          >
            <img src={languageFlags[lang]} alt={lang} className="w-5 h-3.5 object-cover" />
          </button>
        ))}
      </div>

      {/* ═══════════ HERO ═══════════ */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <video autoPlay muted loop playsInline preload="auto" className="w-full h-full object-cover">
            <source src="/videos/hero-background.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/55" />
        </div>
        <div className="relative max-w-5xl mx-auto px-5 py-16 md:py-24 lg:py-32">
          <div className="max-w-2xl mx-auto text-center">
            {/* Logo */}
            <div className="text-4xl md:text-6xl font-extrabold tracking-wider uppercase flex items-center justify-center mb-6 text-white [text-shadow:_0_2px_8px_rgba(0,0,0,0.5)]">
              Y<Luggage className="mx-[-2px]" style={{ height: '0.9em', width: '0.9em' }} strokeWidth={2.5} />RMIT
            </div>
            {/* Headline */}
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight [text-shadow:_0_2px_8px_rgba(0,0,0,0.5)]">
              {t.landingHeroTitle}
              <br />
              <span className="text-primary [text-shadow:_0_2px_8px_rgba(0,0,0,0.5)]">{t.landingHeroHighlight}</span>
            </h1>
            <p className="mt-5 text-base md:text-lg text-white/80 leading-relaxed max-w-xl mx-auto [text-shadow:_0_1px_6px_rgba(0,0,0,0.4)]">
              {t.landingHeroDesc}
            </p>
            {/* Dual CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 mt-8 justify-center">
              <Button
                size="lg"
                onClick={() => navigate("/auth")}
                className="w-full sm:w-auto font-bold text-base px-8 shadow-card-hover"
              >
                {t.landingCta}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                onClick={() => setShowVideo(true)}
                className="w-full sm:w-auto font-bold text-base px-8 shadow-card-hover"
              >
                <Play className="mr-2 h-4 w-4" />
                {t.landingCtaSecondary}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ VIDEO SECTION ═══════════ */}
      <section ref={videoSectionRef} className="py-16 md:py-24 bg-muted/30">
        <div className="max-w-4xl mx-auto px-5 text-center">
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            {t.landingVideoText}
          </p>
          <div
            onClick={() => setShowVideo(true)}
            className="relative cursor-pointer group rounded-2xl overflow-hidden shadow-card-hover mx-auto max-w-3xl aspect-video"
          >
            <video
              src="/videos/Video_Publicidad_Yormit.mp4#t=0.5"
              preload="metadata"
              muted
              playsInline
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/45 transition-colors">
              <div className="h-16 w-16 md:h-20 md:w-20 rounded-full bg-primary/90 flex items-center justify-center shadow-card-hover group-hover:scale-110 transition-transform">
                <Play className="w-7 h-7 md:w-9 md:h-9 text-primary-foreground fill-primary-foreground ml-1" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ PROBLEM ═══════════ */}
      <section className="py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-5">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold">{t.landingProblemTitle}</h2>
            <p className="text-muted-foreground mt-3 max-w-lg mx-auto text-lg">{t.landingProblemDesc}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {problems.map((p, i) => (
              <div
                key={i}
                className={`flex items-start gap-4 p-5 rounded-xl bg-destructive/5 border border-destructive/10 ${i === 4 ? "sm:col-span-2 lg:col-span-1" : ""}`}
              >
                <div className="shrink-0 h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                  <p.icon className="h-5 w-5 text-destructive" />
                </div>
                <p className="text-sm text-foreground/80 leading-relaxed">{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ SOLUTION / FEATURES ═══════════ */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="max-w-6xl mx-auto px-5">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold">{t.landingSolutionTitle}</h2>
            <p className="text-muted-foreground mt-3 max-w-lg mx-auto text-lg">{t.landingSolutionDesc}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((f) => (
              <Card key={f.title} className="group hover:shadow-card-hover transition-all duration-300 border-border/50 bg-card">
                <CardContent className="p-5 flex flex-col items-center text-center gap-3">
                  <div className="h-12 w-12 rounded-xl gradient-hero flex items-center justify-center shadow-card">
                    <f.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-bold text-sm">{f.title}</h3>
                  <p className="text-muted-foreground text-xs leading-relaxed">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ HOW IT WORKS ═══════════ */}
      <section className="py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-5">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold">{t.landingHowTitle}</h2>
            <p className="text-muted-foreground mt-3 text-lg">{t.landingHowDesc}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((s) => (
              <div key={s.num} className="text-center">
                <div className="mx-auto h-16 w-16 rounded-full gradient-hero flex items-center justify-center shadow-card mb-5">
                  <span className="text-2xl font-extrabold text-white">{s.num}</span>
                </div>
                <h3 className="font-bold text-lg mb-2">{s.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ BENEFITS ═══════════ */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="max-w-5xl mx-auto px-5">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold">{t.landingBenefitsTitle}</h2>
            <p className="text-muted-foreground mt-3 max-w-lg mx-auto text-lg">{t.landingBenefitsDesc}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {benefits.map((b, i) => (
              <div
                key={i}
                className={`flex gap-4 items-start p-6 rounded-xl bg-card border border-border/50 shadow-card ${i === 4 ? "sm:col-span-2 lg:col-span-1" : ""}`}
              >
                <div className="shrink-0 h-11 w-11 rounded-full bg-primary/10 flex items-center justify-center">
                  <b.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-base">{b.title}</h3>
                  <p className="text-muted-foreground text-sm mt-1 leading-relaxed">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ FAQ ═══════════ */}
      <section ref={faqRef} className="py-16 md:py-24">
        <div className="max-w-3xl mx-auto px-5">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold">{t.landingFaqTitle}</h2>
          </div>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`}>
                <AccordionTrigger className="text-left text-base font-semibold">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* ═══════════ CTA FINAL ═══════════ */}
      <section className="py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-90" />
        <div className="relative max-w-3xl mx-auto px-5 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white">{t.landingCtaTitle}</h2>
          <p className="mt-4 text-white/80 text-lg max-w-md mx-auto">{t.landingCtaDesc}</p>
          <Button
            size="lg"
            onClick={() => navigate("/auth")}
            className="mt-8 bg-card text-foreground hover:bg-card/90 font-bold text-base px-10 shadow-card-hover"
          >
            {t.landingCta}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* ═══════════ FOOTER ═══════════ */}
      <footer className="border-t border-border bg-card">
        <div className="max-w-6xl mx-auto px-5 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <span className="text-lg font-extrabold tracking-wider uppercase inline-flex items-center text-foreground">
              Y<Luggage className="h-4 w-4" strokeWidth={2.5} />RMIT
            </span>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} YORMIT. {t.landingFooter}
            </p>
          </div>
        </div>
      </footer>

      {/* Video Modal */}
      <Dialog open={showVideo} onOpenChange={(open) => {
        setShowVideo(open);
        if (!open && videoRef.current) videoRef.current.pause();
      }}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-black border-none">
          <video
            ref={videoRef}
            src="/videos/Video_Publicidad_Yormit.mp4"
            controls
            autoPlay
            onEnded={() => {
              setShowVideo(false);
              if (videoRef.current) videoRef.current.pause();
            }}
            className="w-full h-auto max-h-[80vh]"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Landing;
