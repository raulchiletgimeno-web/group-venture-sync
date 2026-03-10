import { useNavigate } from "react-router-dom";
import {
  Luggage, Hotel, Train, CalendarDays, Wallet, MessageCircle,
  Camera, CloudSun, Phone, Info, ArrowRight, CheckCircle2,
  Users, Zap, Shield, Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger
} from "@/components/ui/accordion";
import heroImage from "@/assets/hero-travel.jpg";

const features = [
  { icon: Hotel, title: "Alojamientos", desc: "Centraliza reservas, direcciones y archivos de booking en un solo lugar." },
  { icon: Train, title: "Transportes", desc: "Vuelos, trenes, buses… todo organizado con horarios y billetes adjuntos." },
  { icon: CalendarDays, title: "Actividades", desc: "Planifica el itinerario día a día con horarios, ubicaciones y entradas." },
  { icon: Wallet, title: "Gastos compartidos", desc: "Registra gastos, divide cuentas y lleva un balance claro entre todos." },
  { icon: MessageCircle, title: "Chat grupal", desc: "Comunícate con tu grupo en tiempo real sin salir de la plataforma." },
  { icon: Camera, title: "Fotos", desc: "Sube y comparte las mejores fotos del viaje con todos los miembros." },
  { icon: CloudSun, title: "Meteorología", desc: "Consulta la previsión del tiempo en destino para planificar mejor." },
  { icon: Phone, title: "Teléfonos útiles", desc: "Accede rápidamente a números de emergencia y contactos del destino." },
  { icon: Info, title: "Info del viaje", desc: "Toda la información relevante del viaje siempre accesible." },
];

const benefits = [
  { icon: Zap, title: "Todo centralizado", desc: "Olvídate de WhatsApps interminables, hojas de cálculo y notas dispersas. Todo en un solo sitio." },
  { icon: Users, title: "Colaboración real", desc: "Cada miembro del grupo puede aportar, consultar y organizar. Sin depender de una sola persona." },
  { icon: Shield, title: "Privado y seguro", desc: "Cada viaje es privado. Solo los miembros invitados tienen acceso a la información." },
  { icon: Globe, title: "Multiidioma", desc: "Disponible en 7 idiomas para que cada viajero se sienta como en casa." },
];

const faqs = [
  { q: "¿Es gratis usar YORMIT?", a: "Sí, YORMIT es completamente gratuito. Puedes crear y unirte a tantos viajes como quieras sin coste alguno." },
  { q: "¿Cómo invito a mis amigos?", a: "Al crear un viaje se genera un código de invitación único. Compártelo por WhatsApp o cualquier medio y tus amigos podrán unirse con un clic." },
  { q: "¿Puedo usar YORMIT en el móvil?", a: "Por supuesto. YORMIT está diseñado mobile-first y funciona como una webapp progresiva que puedes añadir a tu pantalla de inicio." },
  { q: "¿Qué pasa con mis datos?", a: "Tus datos son privados y solo accesibles por los miembros aprobados de cada viaje. No compartimos información con terceros." },
  { q: "¿Cuántas personas pueden unirse a un viaje?", a: "No hay límite. Puedes organizar viajes para parejas, familias, grupos de amigos o grandes comunidades." },
];

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 backdrop-blur-lg bg-background/80 border-b border-border">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-5 h-16">
          <span className="text-xl font-extrabold tracking-wider uppercase inline-flex items-center text-foreground">
            Y<Luggage className="h-5 w-5" strokeWidth={2.5} />RMIT
          </span>
          <Button onClick={() => navigate("/auth")} size="sm" className="font-semibold">
            Acceder
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImage} alt="Viaje en grupo" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/60" />
        </div>
        <div className="relative max-w-6xl mx-auto px-5 py-24 md:py-36 lg:py-44">
          <div className="max-w-2xl">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-primary/20 text-primary-foreground backdrop-blur-sm border border-primary/30 mb-6">
              Organiza viajes en grupo sin caos
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight">
              Tu viaje perfecto,{" "}
              <span className="text-primary">organizado entre todos</span>
            </h1>
            <p className="mt-5 text-lg md:text-xl text-white/80 leading-relaxed max-w-xl">
              YORMIT es la plataforma que centraliza toda la información de tu viaje en grupo: alojamientos, transportes, gastos, actividades y mucho más. Sin caos, sin estrés.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              <Button
                size="lg"
                onClick={() => navigate("/auth")}
                className="font-bold text-base px-8 shadow-card-hover"
              >
                Comenzar ahora
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
                className="font-semibold text-base border-white/40 text-white hover:bg-white/10 hover:text-white"
              >
                Descubre más
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 md:py-28 bg-muted/30">
        <div className="max-w-6xl mx-auto px-5">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-extrabold">Todo lo que necesitas en un solo lugar</h2>
            <p className="text-muted-foreground mt-3 max-w-lg mx-auto text-lg">
              Cada aspecto de tu viaje, organizado y accesible para todo el grupo.
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
            <h2 className="text-3xl md:text-4xl font-extrabold">Así se ve por dentro</h2>
            <p className="text-muted-foreground mt-3 max-w-lg mx-auto text-lg">
              Una interfaz limpia y pensada para que organizar sea un placer.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: "Dashboard del viaje", desc: "Vista general con fechas, miembros y accesos directos a cada sección.", icon: CalendarDays },
              { title: "Gastos compartidos", desc: "Registra quién paga, divide entre los miembros y visualiza balances.", icon: Wallet },
              { title: "Chat en tiempo real", desc: "Mensajes instantáneos con tu grupo sin salir de la plataforma.", icon: MessageCircle },
            ].map((card) => (
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
            <h2 className="text-3xl md:text-4xl font-extrabold">¿Por qué YORMIT?</h2>
            <p className="text-muted-foreground mt-3 max-w-lg mx-auto text-lg">
              Diseñado para hacerte la vida más fácil cuando viajas en grupo.
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
            <h2 className="text-3xl md:text-4xl font-extrabold">Preguntas frecuentes</h2>
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
            ¿Listo para tu próximo viaje?
          </h2>
          <p className="mt-4 text-white/80 text-lg max-w-md mx-auto">
            Crea tu primer viaje en menos de un minuto. Gratis, sin tarjeta.
          </p>
          <Button
            size="lg"
            onClick={() => navigate("/auth")}
            className="mt-8 bg-card text-foreground hover:bg-card/90 font-bold text-base px-10 shadow-card-hover"
          >
            Empezar gratis
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
              © {new Date().getFullYear()} YORMIT. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
