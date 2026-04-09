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
            En cumplimiento del deber de información establecido en la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y del Comercio Electrónico (LSSI-CE), se facilitan los siguientes datos del titular de este sitio web:
          </p>
          <ul className="text-sm text-muted-foreground leading-relaxed list-disc pl-5 space-y-1">
            <li><strong className="text-foreground">Titular:</strong> Raul Chilet Gimeno</li>
            <li><strong className="text-foreground">NIF:</strong> 52633612K</li>
            <li><strong className="text-foreground">Domicilio:</strong> Calle Santa Cecilia 11 bajo, 46470 Albal (Valencia), España</li>
            <li><strong className="text-foreground">Email:</strong>{" "}
              <a href="mailto:info@yormit.com" className="text-primary hover:underline">info@yormit.com</a>
            </li>
            <li><strong className="text-foreground">Teléfono:</strong> 616 448 475</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">2. Objeto</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            YORMIT es una aplicación web destinada a facilitar la organización de viajes en grupo. La plataforma permite a los usuarios crear y gestionar viajes, compartir información, comunicarse entre miembros del grupo, gestionar gastos compartidos, subir fotografías y coordinar la logística del viaje. Actualmente, el uso de YORMIT es gratuito para los usuarios.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">3. Condiciones generales de uso</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            El acceso y uso de YORMIT implica la aceptación de las presentes condiciones. El usuario se compromete a utilizar la plataforma de forma diligente, lícita y conforme a la legislación vigente, la buena fe y el orden público.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Queda prohibido el uso de la plataforma para fines ilícitos, lesivos de derechos de terceros o que puedan dañar, inutilizar o sobrecargar el servicio. El usuario es el único responsable del contenido que publique, comparta o suba a la plataforma, incluyendo mensajes, fotografías y cualquier otro tipo de información.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            El titular se reserva el derecho de retirar cualquier contenido que considere inadecuado, ilícito o contrario a estas condiciones, así como de suspender o cancelar el acceso de usuarios que incumplan las mismas.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">4. Propiedad intelectual e industrial</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Todos los contenidos del sitio web y de la aplicación YORMIT, incluyendo a título enunciativo pero no limitativo: textos, diseños, logotipos, iconos, imágenes, código fuente, marcas y estructura de navegación, son propiedad del titular o se utilizan con la debida autorización, y están protegidos por las leyes españolas e internacionales de propiedad intelectual e industrial.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Queda prohibida la reproducción, distribución, transformación o comunicación pública de cualquier contenido de YORMIT sin la autorización expresa y por escrito del titular.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">5. Limitación de responsabilidad</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            El titular no garantiza la disponibilidad continua e ininterrumpida de la plataforma, y no será responsable de los daños derivados de interrupciones, fallos técnicos o errores en el servicio.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            El titular no se hace responsable del contenido generado, compartido o publicado por los usuarios de la plataforma. Cada usuario es el único responsable del uso que haga de YORMIT y del contenido que aporte.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">6. Legislación aplicable y jurisdicción</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            El presente aviso legal se rige por la legislación española. Para cualquier controversia derivada del uso de YORMIT, las partes se someten a la jurisdicción de los juzgados y tribunales de Valencia (España), con renuncia a cualquier otro fuero que pudiera corresponderles.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">7. Contacto</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Para cualquier consulta relacionada con este aviso legal, puede contactar con nosotros en{" "}
            <a href="mailto:info@yormit.com" className="text-primary hover:underline">info@yormit.com</a>.
          </p>
        </section>
      </div>
    </div>
  </div>
);

export default LegalNotice;
