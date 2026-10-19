"use client";
import { useI18n } from "@/components/i18n/LanguageProvider";

import { formatEventDate } from "@/lib/bookingSupport";
import { business } from "@/data/business";
export type SubmittedEventSummary = {
    eventType: string;
    eventDate: string;
    guestRange: string;
    location: string;
    serviceNeeded: string;
};
export function BookingConfirmation({ summary }: {
    summary: SubmittedEventSummary;
}) {
    const { t, language } = useI18n();
    const phone = business.contact.phone || "+17866067684";
    const email = business.contact.email || "peposchots5@gmail.com";
    function saveSummary() {
        const lines = ["PepoShots", t("TU SOLICITUD"),
            t("Evento") + ": " + t(summary.eventType),
            t("Fecha") + ": " + formatEventDate(summary.eventDate, language),
            t("Invitados") + ": " + t(summary.guestRange),
            t("Ubicación") + ": " + summary.location,
            t("Servicio") + ": " + t(summary.serviceNeeded),
            "", t("Nada queda confirmado hasta acordar los detalles directamente con PepoShots.")];
        const url = URL.createObjectURL(new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" }));
        const link = document.createElement("a");
        link.href = url; link.download = `PepoShots-${summary.eventDate}.txt`; link.click();
        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
    return (<div className="booking-confirmation" role="status" aria-live="polite">
      <div>
        <p className="kicker">{t("SOLICITUD ENVIADA")}</p>
        <h3 className="confirmation-title" tabIndex={-1}>{t("Recibimos tu evento.")}</h3>
        <p className="lead">{t("Tu solicitud fue enviada a PepoShots. Revisaremos la fecha y los detalles para contactarte sobre disponibilidad y precio.")}</p>
      </div>

      <section className="request-summary" aria-labelledby="request-summary-title">
        <h4 id="request-summary-title">{t("TU SOLICITUD")}</h4>
        <dl>
          <div><dt>{t("Evento")}</dt><dd>{t(summary.eventType)}</dd></div>
          <div><dt>{t("Fecha")}</dt><dd>{formatEventDate(summary.eventDate, language)}</dd></div>
          <div><dt>{t("Invitados")}</dt><dd>{t(summary.guestRange)}</dd></div>
          <div><dt>{t("Ubicaci\u00F3n")}</dt><dd>{summary.location}</dd></div>
          <div><dt>{t("Servicio")}</dt><dd>{t(summary.serviceNeeded)}</dd></div>
        </dl>
      </section>

      <button type="button" className="confirmation-copy" onClick={saveSummary}>{t("Guardar resumen")}</button>
      <section className="next-steps" aria-labelledby="next-steps-title">
        <h4 id="next-steps-title">{t("QU\u00C9 PASA AHORA")}</h4>
        <ol>
          <li><span>{t("01")}</span><div><strong>{t("Revisamos tu evento")}</strong><p>{t("Fecha, ubicaci\u00F3n, n\u00FAmero de invitados y servicio que necesitas.")}</p></div></li>
          <li><span>{t("02")}</span><div><strong>{t("PepoShots te contacta")}</strong><p>{t("Confirmamos disponibilidad, resolvemos dudas y hablamos de precio.")}</p></div></li>
          <li><span>{t("03")}</span><div><strong>{t("T\u00FA decides")}</strong><p>{t("Nada queda confirmado hasta acordar los detalles directamente con PepoShots.")}</p></div></li>
        </ol>
      </section>

      <div className="confirmation-contact">
        <p>{t("\u00BFNecesitas hablar antes?")}</p>
        <a href={`tel:${phone}`}>{t("Llama al 786 606-7684")}</a>
        <a href={`mailto:${email}`}>{email}</a>
      </div>
    </div>);
}
