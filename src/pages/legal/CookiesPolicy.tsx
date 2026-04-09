import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";

const CookiesPolicy = () => (
  <div className="min-h-screen bg-background">
    <div className="max-w-3xl mx-auto px-5 py-10">
      <div className="flex items-center justify-between mb-8">
        <BrandLogo size="md" className="text-foreground" />
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" /> Volver
        </Link>
      </div>

      <div className="bg-card rounded-xl border border-border p-6 md:p-10 shadow-card space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Política de Cookies</h1>
        <p className="text-sm text-muted-foreground">Última actualización: abril 2026</p>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">1. ¿Qué son las cookies?</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo cuando visitas un sitio web.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">2. Cookies que utilizamos</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            YORMIT utiliza cookies técnicas necesarias para el funcionamiento de la plataforma y la gestión de sesiones de usuario.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">3. Gestión de cookies</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Puedes configurar tu navegador para rechazar o eliminar cookies, aunque esto podría afectar al funcionamiento de la aplicación.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">4. Contacto</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Para más información sobre nuestra política de cookies, contacta con{" "}
            <a href="mailto:info@yormit.com" className="text-primary hover:underline">info@yormit.com</a>.
          </p>
        </section>
      </div>
    </div>
  </div>
);

export default CookiesPolicy;
