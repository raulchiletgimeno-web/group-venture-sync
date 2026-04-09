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
          <ul className="text-sm text-muted-foreground leading-relaxed list-disc pl-5 space-y-1">
            <li><strong className="text-foreground">Responsable:</strong> Raul Chilet Gimeno</li>
            <li><strong className="text-foreground">NIF:</strong> 52633612K</li>
            <li><strong className="text-foreground">Domicilio:</strong> Calle Santa Cecilia 11 bajo, 46470 Albal (Valencia), España</li>
            <li><strong className="text-foreground">Email:</strong>{" "}
              <a href="mailto:info@yormit.com" className="text-primary hover:underline">info@yormit.com</a>
            </li>
            <li><strong className="text-foreground">Teléfono:</strong> 616 448 475</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">2. Datos que recogemos</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            En función del uso que hagas de YORMIT, podemos recoger los siguientes datos personales:
          </p>
          <ul className="text-sm text-muted-foreground leading-relaxed list-disc pl-5 space-y-1">
            <li><strong className="text-foreground">Datos de registro:</strong> nombre, dirección de correo electrónico y contraseña.</li>
            <li><strong className="text-foreground">Datos de perfil:</strong> nombre visible, avatar e idioma preferido.</li>
            <li><strong className="text-foreground">Contenido generado:</strong> mensajes de chat, fotografías subidas, información de viajes (destino, fechas, itinerarios), datos de gastos compartidos y billetes o reservas.</li>
            <li><strong className="text-foreground">Datos técnicos:</strong> tokens de notificaciones push, datos de sesión y registros de uso de la plataforma.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">3. Finalidades del tratamiento</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Los datos personales recogidos se tratan con las siguientes finalidades:
          </p>
          <ul className="text-sm text-muted-foreground leading-relaxed list-disc pl-5 space-y-1">
            <li>Gestionar tu cuenta de usuario y permitir el acceso a la plataforma.</li>
            <li>Facilitar la creación, organización y gestión de viajes en grupo.</li>
            <li>Permitir la comunicación entre miembros de un viaje mediante el chat.</li>
            <li>Gestionar la subida y visualización de fotografías compartidas.</li>
            <li>Facilitar el registro y reparto de gastos compartidos.</li>
            <li>Enviar notificaciones push relacionadas con la actividad de tus viajes.</li>
            <li>Mejorar el funcionamiento y la experiencia de uso de la plataforma.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">4. Base jurídica</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            El tratamiento de tus datos se fundamenta en las siguientes bases legales:
          </p>
          <ul className="text-sm text-muted-foreground leading-relaxed list-disc pl-5 space-y-1">
            <li><strong className="text-foreground">Consentimiento:</strong> al registrarte y utilizar la plataforma, consientes el tratamiento de tus datos para las finalidades descritas.</li>
            <li><strong className="text-foreground">Ejecución de un contrato:</strong> el tratamiento es necesario para prestarte el servicio de organización de viajes.</li>
            <li><strong className="text-foreground">Interés legítimo:</strong> para mejorar la plataforma y garantizar su seguridad.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">5. Destinatarios</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Tus datos personales no se venden ni se ceden a terceros con fines comerciales. No obstante, para el funcionamiento de la plataforma, tus datos pueden ser tratados por proveedores de servicios de infraestructura y alojamiento que actúan como encargados del tratamiento, con los que se han suscrito los acuerdos de confidencialidad y protección de datos correspondientes.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            En caso de que algún proveedor se encuentre fuera del Espacio Económico Europeo, se garantiza que existen las salvaguardas adecuadas conforme a la normativa aplicable.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">6. Plazo de conservación</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Tus datos personales se conservarán mientras tu cuenta permanezca activa. Una vez solicites la eliminación de tu cuenta, tus datos serán suprimidos en un plazo razonable, salvo que deban mantenerse durante el período legalmente establecido para atender posibles responsabilidades derivadas del tratamiento.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">7. Derechos del usuario</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Como usuario, tienes derecho a:
          </p>
          <ul className="text-sm text-muted-foreground leading-relaxed list-disc pl-5 space-y-1">
            <li><strong className="text-foreground">Acceso:</strong> conocer qué datos personales tratamos sobre ti.</li>
            <li><strong className="text-foreground">Rectificación:</strong> solicitar la corrección de datos inexactos o incompletos.</li>
            <li><strong className="text-foreground">Supresión:</strong> solicitar la eliminación de tus datos cuando ya no sean necesarios.</li>
            <li><strong className="text-foreground">Oposición:</strong> oponerte al tratamiento de tus datos en determinadas circunstancias.</li>
            <li><strong className="text-foreground">Limitación:</strong> solicitar la limitación del tratamiento en los casos previstos por la normativa.</li>
            <li><strong className="text-foreground">Portabilidad:</strong> recibir tus datos en un formato estructurado y de uso común.</li>
          </ul>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Asimismo, tienes derecho a presentar una reclamación ante la Agencia Española de Protección de Datos (AEPD) en{" "}
            <a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">www.aepd.es</a>{" "}
            si consideras que tus derechos no han sido debidamente atendidos.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">8. Ejercicio de derechos</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Para ejercer cualquiera de los derechos mencionados, puedes enviar un correo electrónico a{" "}
            <a href="mailto:info@yormit.com" className="text-primary hover:underline">info@yormit.com</a>,
            indicando el derecho que deseas ejercer y acompañando una copia de tu documento de identidad para verificar tu titularidad.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">9. Contenido subido por usuarios</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Los usuarios son los únicos responsables del contenido que suban o compartan a través de YORMIT. Queda prohibido subir contenido ilícito, difamatorio, ofensivo o que vulnere derechos de terceros.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            En particular, quien suba fotografías o datos personales de terceras personas debe contar con la autorización o legitimación suficiente para ello. El titular de la plataforma no asume responsabilidad por el contenido generado por los usuarios, y se reserva el derecho de retirar cualquier contenido que infrinja estas condiciones o la normativa vigente.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">10. Seguridad</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Implementamos medidas técnicas y organizativas adecuadas para proteger tus datos personales frente a accesos no autorizados, pérdida, alteración o destrucción. No obstante, ningún sistema es completamente seguro, por lo que no podemos garantizar la seguridad absoluta de la información.
          </p>
        </section>
      </div>
    </div>
  </div>
);

export default PrivacyPolicy;
