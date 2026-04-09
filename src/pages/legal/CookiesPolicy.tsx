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
            Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo (ordenador, teléfono móvil o tableta) cuando visitas un sitio web o utilizas una aplicación web. Permiten que la plataforma recuerde información sobre tu visita, como tus preferencias de sesión, facilitando así tu experiencia de uso.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">2. Cookies que utilizamos</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            YORMIT utiliza únicamente <strong className="text-foreground">cookies técnicas o necesarias</strong> para el correcto funcionamiento de la plataforma y la gestión de la sesión del usuario. Estas cookies son imprescindibles para que la aplicación funcione correctamente y no pueden desactivarse sin afectar a la experiencia de uso.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Actualmente, <strong className="text-foreground">YORMIT no utiliza cookies analíticas, publicitarias ni de marketing</strong>. No empleamos herramientas de analítica web, seguimiento de usuarios, publicidad personalizada ni plataformas de marketing de terceros.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">3. Cambios futuros</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            En caso de que en el futuro se incorporen cookies analíticas, de personalización o de terceros, esta política se actualizará debidamente y, si fuera necesario, se implementará un mecanismo de consentimiento previo conforme a la normativa vigente.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">4. Gestión de cookies</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Puedes configurar tu navegador para rechazar, bloquear o eliminar las cookies en cualquier momento. Ten en cuenta que, al tratarse de cookies técnicas necesarias, su desactivación podría afectar al funcionamiento normal de la aplicación, impidiendo el acceso a determinadas funcionalidades o provocando un comportamiento inesperado.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Para obtener información sobre cómo gestionar las cookies en tu navegador, consulta la sección de ayuda o configuración de privacidad de tu navegador habitual.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">5. Contacto</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Para más información sobre nuestra política de cookies, puedes contactar con nosotros en{" "}
            <a href="mailto:info@yormit.com" className="text-primary hover:underline">info@yormit.com</a>.
          </p>
        </section>
      </div>
    </div>
  </div>
);

export default CookiesPolicy;
