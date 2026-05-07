import { Link } from "react-router-dom";
import { ArrowLeft, Mail } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";

const DeleteAccount = () => (
  <div className="min-h-screen bg-background">
    <div className="max-w-3xl mx-auto px-5 py-10">
      <div className="flex items-center justify-between mb-8">
        <BrandLogo size="md" className="text-foreground" />
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" /> Volver
        </Link>
      </div>

      <div className="bg-card rounded-xl border border-border p-6 md:p-10 shadow-card space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Eliminación de cuenta y datos personales</h1>

        <section className="space-y-2">
          <p className="text-sm text-muted-foreground leading-relaxed">
            En YORMIT puedes solicitar la eliminación de tu cuenta y de los datos personales asociados a ella.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Cómo solicitarlo</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Para solicitarlo, envía un correo electrónico a:
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
          <p className="text-sm text-muted-foreground leading-relaxed">
            La solicitud debe realizarse desde el mismo correo electrónico con el que te registraste en YORMIT, o incluir la información necesaria para poder verificar que eres el titular de la cuenta.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">Plazo y tratamiento</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Una vez recibida la solicitud, revisaremos la información y procederemos a eliminar la cuenta y los datos asociados en un plazo razonable, salvo aquellos datos que deban conservarse durante el tiempo legalmente necesario para atender obligaciones legales o posibles responsabilidades.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">Consecuencias de la eliminación</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            La eliminación de la cuenta puede implicar la pérdida de acceso a los viajes, mensajes, fotos, gastos, documentos, billetes o reservas asociados a la cuenta.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">Dudas sobre tus datos</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Si tienes dudas sobre el tratamiento de tus datos personales, también puedes contactar con nosotros en{" "}
            <a href="mailto:info@yormit.com" className="text-primary hover:underline">info@yormit.com</a>.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">Responsable</h2>
          <ul className="text-sm text-muted-foreground leading-relaxed list-disc pl-5 space-y-1">
            <li><strong className="text-foreground">Responsable:</strong> Raul Chilet Gimeno</li>
            <li><strong className="text-foreground">Email de contacto:</strong>{" "}
              <a href="mailto:info@yormit.com" className="text-primary hover:underline">info@yormit.com</a>
            </li>
          </ul>
        </section>
      </div>
    </div>
  </div>
);

export default DeleteAccount;
