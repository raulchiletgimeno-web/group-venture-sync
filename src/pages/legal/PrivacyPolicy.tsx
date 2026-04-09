import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";

const PrivacyPolicy = () => (
  <div className="min-h-screen bg-background">
    <div className="max-w-3xl mx-auto px-5 py-10">
      <div className="flex items-center justify-between mb-8">
        <BrandLogo size="md" className="text-foreground" />
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" /> Volver
        </Link>
      </div>

      <div className="bg-card rounded-xl border border-border p-6 md:p-10 shadow-card space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Política de Privacidad</h1>
        <p className="text-sm text-muted-foreground">Última actualización: abril 2026</p>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">1. Responsable del tratamiento</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            El responsable del tratamiento de los datos personales recogidos a través de YORMIT se comunicará próximamente.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">2. Datos que recogemos</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Recogemos los datos necesarios para el funcionamiento de la plataforma: nombre, correo electrónico, y datos de uso de la aplicación.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">3. Finalidad del tratamiento</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Los datos se utilizan para gestionar tu cuenta, permitir la organización de viajes en grupo y mejorar nuestros servicios.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">4. Derechos del usuario</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Puedes ejercer tus derechos de acceso, rectificación, supresión y portabilidad contactando con{" "}
            <a href="mailto:info@yormit.com" className="text-primary hover:underline">info@yormit.com</a>.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">5. Seguridad</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Implementamos medidas técnicas y organizativas para proteger tus datos personales.
          </p>
        </section>
      </div>
    </div>
  </div>
);

export default PrivacyPolicy;
