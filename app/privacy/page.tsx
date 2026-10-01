import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { business } from "@/data/business";

export const metadata: Metadata = { title: "Privacidad" };

export default function PrivacyPage() {
  return (
    <Container className="privacy-page">
      <article style={{ maxWidth: 760, margin: "0 auto" }}>
        <p className="kicker">PRIVACIDAD</p>
        <h1 style={{ fontSize: "clamp(2.5rem, 8vw, 5rem)", lineHeight: .95, margin: 0 }}>Información que envías a PepoShots</h1>
        <div className="lead" style={{ display: "grid", gap: 16, marginTop: 28 }}>
          <p>Cuando usas el formulario de disponibilidad, PepoShots recibe los datos que envías voluntariamente, como nombre, teléfono, email, fecha, ubicación y detalles del evento.</p>
          <p>La información se utiliza para revisar disponibilidad, preparar una cotización y responder a tu solicitud. Las solicitudes se envían de forma privada al correo del negocio mediante el proveedor de correo configurado por PepoShots.</p>
          <p>Si envías una reseña, PepoShots recibe el nombre, email, texto, calificación y, si decides adjuntarla, una foto. Las reseñas y fotos se revisan antes de cualquier publicación. El email no se muestra públicamente.</p>
          <p>La web guarda en tu propio navegador algunas preferencias del recorrido —por ejemplo, zona, tipo de evento o tragos favoritos— para completar el formulario con mayor facilidad. Esa información permanece en el almacenamiento local del navegador y puedes borrarla eliminando los datos del sitio.</p>
          <p>Esta versión no instala herramientas de publicidad ni analytics de terceros. El proveedor de hosting puede conservar registros técnicos necesarios para seguridad y funcionamiento del servicio.</p>
          <p>Para pedir acceso, corrección o eliminación de información que hayas enviado, escribe a <a href={`mailto:${business.contact.email}`} style={{ textDecoration: "underline", fontWeight: 800 }}>{business.contact.email}</a>.</p>
        </div>
      </article>
    </Container>
  );
}
