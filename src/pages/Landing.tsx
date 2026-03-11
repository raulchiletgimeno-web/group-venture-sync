import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Luggage, Hotel, Train, CalendarDays, Wallet, MessageCircle,
  Camera, CloudSun, Phone, ArrowRight, Play,
  Users, Zap, Shield, Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger
} from "@/components/ui/accordion";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import heroImage from "@/assets/hero-travel.jpg";
import { useLanguage } from "@/contexts/LanguageContext";
import { languageFlags, Language } from "@/i18n/translations";

const featureIcons = [Hotel, Train, CalendarDays, Wallet, MessageCircle, Camera, CloudSun, Phone];
const benefitIcons = [Zap, Users, Shield, Globe];
const previewIcons = [CalendarDays, Wallet, MessageCircle];

const Landing = () => {
  const navigate = useNavigate();
  const [showVideo, setShowVideo] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { language, setLanguage, t } = useLanguage();

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

  const benefits = [
    { icon: benefitIcons[0], title: t.landingBenefitCentralized, desc: t.landingBenefitCentralizedDesc },
    { icon: benefitIcons[1], title: t.landingBenefitCollaboration, desc: t.landingBenefitCollaborationDesc },
    { icon: benefitIcons[2], title: t.landingBenefitPrivate, desc: t.landingBenefitPrivateDesc },
    { icon: benefitIcons[3], title: t.landingBenefitMultilang, desc: t.landingBenefitMultilangDesc },
  ];

  const faqs = [
    { q: t.landingFaq1Q, a: t.landingFaq1A },
    { q: t.landingFaq2Q, a: t.landingFaq2A },
    { q: t.landingFaq3Q, a: t.landingFaq3A },
    { q: t.landingFaq4Q, a: t.landingFaq4A },
    { q: t.landingFaq5Q, a: t.landingFaq5A },
  ];

  const previews = [
    { title: t.landingPreviewDashboard, desc: t.landingPreviewDashboardDesc, icon: previewIcons[0] },
    { title: t.landingPreviewExpenses, desc: t.landingPreviewExpensesDesc, icon: previewIcons[1] },
    { title: t.landingPreviewChat, desc: t.landingPreviewChatDesc, icon: previewIcons[2] },
  ];

  const langs: Language[] = ["es", "en", "fr", "pt", "it", "zh", "de"];

  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* Language flags */}
      <div className="absolute top-3 right-4 z-50 flex gap-1.5">
        {langs.map((lang) => (
          <button
            key={lang}
            onClick={() => setLanguage(lang)}
            className={`rounded overflow-hidden transition-all ${language === lang ? "ring-2 ring-primary scale-110" : "opacity-70 hover:opacity-100"}`}
          >
            <img src={languageFlags[lang]} alt={lang} className="w-6 h-4 object-cover" />
          </button>
        ))}
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImage} alt="Viaje en grupo" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/60" />
        </div>
        <div className="relative max-w-6xl mx-auto px-5 py-12 md:py-28 lg:py-36">
          <div className="max-w-2xl mx-auto text-center">
            <div className="text-5xl md:text-8xl font-extrabold tracking-wider uppercase flex items-center justify-center mb-4 text-white">
              Y<Luggage className="mx-[-2px]" style={{ height: '0.95em', width: '0.95em' }} strokeWidth={2.5} />RMIT
            </div>
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-primary/20 text-primary-foreground backdrop-blur-sm border border-primary/30 mb-6">
              {t.landingBadge}
            </span>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight">
              {t.landingHeroTitle}
              <br />
              <span className="text-primary">{t.landingHeroHighlight}</span>
            </h1>
            <p className="mt-5 text-base md:text-xl text-white/80 leading-relaxed max-w-xl mx-auto">
              {t.landingHeroDesc}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mt-8 items-center">
              <Button
                size="lg"
                onClick={() => navigate("/auth")}
                className="w-full sm:w-auto font-bold text-base px-8 shadow-card-hover"
              >
                {t.landingCta}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <div
                onClick={() => setShowVideo(true)}
                className="relative cursor-pointer group rounded-xl overflow-hidden shadow-xl w-56 h-32 sm:w-64 sm:h-36 shrink-0 sm:ml-20"
              >
                <video
                  src="/videos/Video_Publicidad_Yormit.mp4#t=0.5"
                  preload="metadata"
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/50 transition-colors">
                  <Play className="w-12 h-12 sm:w-16 sm:h-16 text-white fill-white drop-shadow-lg" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 md:py-28 bg-muted/30">
        <div className="max-w-6xl mx-auto px-5">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-extrabold">{t.landingFeaturesTitle}</h2>
            <p className="text-muted-foreground mt-3 max-w-lg mx-auto text-lg">
              {t.landingFeaturesDesc}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f) => (
              <Card key={f.title} className="group hover:shadow-card-hover transition-all duration-300 border-border/50 bg-card">
                <CardContent className="p-6 flex gap-4">
                  <div className="shrink-0 h-12 w-12 rounded-xl gradient-hero flex items-center justify-center shadow-card">
                    <f.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base">{f.title}</h3>
                    <p className="text-muted-foreground text-sm mt-1 leading-relaxed">{f.desc}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* App Preview */}
      <section className="py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-5">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-extrabold">{t.landingPreviewTitle}</h2>
            <p className="text-muted-foreground mt-3 max-w-lg mx-auto text-lg">
              {t.landingPreviewDesc}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {previews.map((card) => (
              <Card key={card.title} className="overflow-hidden border-border/50">
                <div className="h-40 gradient-hero flex items-center justify-center">
                  <card.icon className="h-16 w-16 text-white/80" />
                </div>
                <CardContent className="p-5">
                  <h3 className="font-bold text-lg">{card.title}</h3>
                  <p className="text-muted-foreground text-sm mt-1.5 leading-relaxed">{card.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 md:py-28 bg-muted/30">
        <div className="max-w-6xl mx-auto px-5">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-extrabold">{t.landingBenefitsTitle}</h2>
            <p className="text-muted-foreground mt-3 max-w-lg mx-auto text-lg">
              {t.landingBenefitsDesc}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {benefits.map((b) => (
              <div key={b.title} className="flex gap-4 items-start p-6 rounded-xl bg-card border border-border/50 shadow-card">
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

      {/* FAQ */}
      <section className="py-20 md:py-28">
        <div className="max-w-3xl mx-auto px-5">
          <div className="text-center mb-14">
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

      {/* CTA Final */}
      <section className="py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-90" />
        <div className="relative max-w-3xl mx-auto px-5 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white">
            {t.landingCtaTitle}
          </h2>
          <p className="mt-4 text-white/80 text-lg max-w-md mx-auto">
            {t.landingCtaDesc}
          </p>
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

      {/* Footer */}
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
        if (!open && videoRef.current) {
          videoRef.current.pause();
        }
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
