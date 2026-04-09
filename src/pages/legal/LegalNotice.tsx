import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";

const LegalNotice = () => (
  <div className="min-h-screen bg-background">
    <div className="max-w-3xl mx-auto px-5 py-10">
      <div className="flex items-center justify-between mb-8">
        <BrandLogo size="md" className="text-foreground" />
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" /> Volver
        </Link>
      </div>

      <div className="bg-card rounded-xl border border-border p-6 md:p-10 shadow-card space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Aviso Legal</h1>
        <p className="text-sm text-muted-foreground">Última actualización: abril 2026</p>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">1. Titular del sitio web</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            YORMIT es una plataforma digital de organización de viajes en grupo. 
            Los datos del titular se actualizarán en este aviso legal próximamente.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">2. Objeto</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            El presente aviso legal regula el uso del sitio web y la aplicación YORMIT.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">3. Propiedad intelectual</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Todos los contenidos, diseños, logotipos y código fuente de YORMIT están protegidos por las leyes de propiedad intelectual.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">4. Condiciones de uso</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            El usuario se compromete a utilizar la plataforma de forma responsable y conforme a la legislación vigente.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">5. Contacto</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Para cualquier consulta legal, puede contactar con nosotros en{" "}
            <a href="mailto:info@yormit.com" className="text-primary hover:underline">info@yormit.com</a>.
          </p>
        </section>
      </div>
    </div>
  </div>
);

export default LegalNotice;
