import { Link } from "react-router-dom";
import { ArrowLeft, Mail, Phone } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";

const Contact = () => (
  <div className="min-h-screen bg-background">
    <div className="max-w-3xl mx-auto px-5 py-10">
      <div className="flex items-center justify-between mb-8">
        <BrandLogo size="md" className="text-foreground" />
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" /> Volver
        </Link>
      </div>

      <div className="bg-card rounded-xl border border-border p-6 md:p-10 shadow-card space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Contacto</h1>

        <section className="space-y-3">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Si tienes cualquier duda, sugerencia o consulta sobre YORMIT, no dudes en ponerte en contacto con nosotros a través de los siguientes canales:
          </p>

          <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50 border border-border">
            <Mail className="h-5 w-5 text-primary shrink-0" />
            <div>
              <p className="text-sm font-medium text-foreground">Email</p>
              <a href="mailto:info@yormit.com" className="text-sm text-primary hover:underline">
                info@yormit.com
              </a>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50 border border-border">
            <Phone className="h-5 w-5 text-primary shrink-0" />
            <div>
              <p className="text-sm font-medium text-foreground">Teléfono</p>
              <a href="tel:+34616448475" className="text-sm text-primary hover:underline">
                616 448 475
              </a>
            </div>
          </div>
        </section>

        <section className="space-y-2">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Intentamos responder a todas las consultas en un plazo máximo de 48 horas laborables. Agradecemos tu paciencia y confianza.
          </p>
        </section>
      </div>
    </div>
  </div>
);

export default Contact;
