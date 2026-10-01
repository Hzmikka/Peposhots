import { business } from "@/data/business";

export type SubmittedEventSummary = {
  eventType: string;
  eventDate: string;
  guestRange: string;
  location: string;
  serviceNeeded: string;
};

function displayDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return value;
  return new Intl.DateTimeFormat("es-US", { month: "long", day: "numeric", year: "numeric" }).format(new Date(year, month - 1, day));
}

export function BookingConfirmation({ summary }: { summary: SubmittedEventSummary }) {
  const phone = business.contact.phone || "+17866067684";
  const email = business.contact.email || "peposchots5@gmail.com";
  return (
    <div className="booking-confirmation" role="status" aria-live="polite">
      <div>
        <p className="kicker">REQUEST SENT</p>
        <h3 className="confirmation-title" tabIndex={-1}>Recibimos tu evento.</h3>
        <p className="lead">Tu solicitud fue enviada a PepoShots. Revisaremos la fecha y los detalles para contactarte sobre disponibilidad y precio.</p>
      </div>

      <section className="request-summary" aria-labelledby="request-summary-title">
        <h4 id="request-summary-title">TU SOLICITUD</h4>
        <dl>
          <div><dt>Evento</dt><dd>{summary.eventType}</dd></div>
          <div><dt>Fecha</dt><dd>{displayDate(summary.eventDate)}</dd></div>
          <div><dt>Invitados</dt><dd>{summary.guestRange}</dd></div>
          <div><dt>Ubicación</dt><dd>{summary.location}</dd></div>
          <div><dt>Servicio</dt><dd>{summary.serviceNeeded}</dd></div>
        </dl>
      </section>

      <section className="next-steps" aria-labelledby="next-steps-title">
        <h4 id="next-steps-title">QUÉ PASA AHORA</h4>
        <ol>
          <li><span>01</span><div><strong>Revisamos tu evento</strong><p>Fecha, ubicación, número de invitados y servicio que necesitas.</p></div></li>
          <li><span>02</span><div><strong>PepoShots te contacta</strong><p>Confirmamos disponibilidad, resolvemos dudas y hablamos de precio.</p></div></li>
          <li><span>03</span><div><strong>Tú decides</strong><p>Nada queda confirmado hasta acordar los detalles directamente con PepoShots.</p></div></li>
        </ol>
      </section>

      <div className="confirmation-contact">
        <p>¿Necesitas hablar antes?</p>
        <a href={`tel:${phone}`}>Llama al 786 606-7684</a>
        <a href={`mailto:${email}`}>{email}</a>
      </div>
    </div>
  );
}
