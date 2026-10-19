"use client";

import { useI18n } from "@/components/i18n/LanguageProvider";
import { LanguageSwitch } from "@/components/i18n/LanguageSwitch";
import { business } from "@/data/business";

export function PrivacyContent() {
  const { t } = useI18n();
  return <article style={{ maxWidth: 760, margin: "0 auto" }}>
    <div className="privacy-toolbar"><a href="/" className="privacy-back">{t("← Volver a PepoShots")}</a><LanguageSwitch /></div>
    <p className="kicker">{t("PRIVACIDAD")}</p>
    <h1 style={{ fontSize: "clamp(2.5rem, 8vw, 5rem)", lineHeight: .95, margin: 0 }}>{t("Información que envías a PepoShots")}</h1>
    <div className="lead" style={{ display: "grid", gap: 16, marginTop: 28 }}>
      <p>{t("Cuando usas el formulario de disponibilidad, PepoShots recibe los datos que envías voluntariamente, como nombre, teléfono, email, fecha, ubicación y detalles del evento.")}</p>
      <p>{t("La información se utiliza para revisar disponibilidad, preparar una cotización y responder a tu solicitud. Las solicitudes se envían de forma privada al correo del negocio mediante el proveedor de correo configurado por PepoShots.")}</p>
      <p>{t("Si envías una reseña o foto, PepoShots recibe el nombre, email y material que decidas compartir. Todo se revisa antes de publicarse y el email no se muestra públicamente.")}</p>
      <p>{t("Tu navegador recuerda el idioma y algunas preferencias del recorrido, como zona, barra y cócteles, para facilitar futuras consultas. Puedes eliminarlas borrando los datos del sitio en tu navegador.")}</p>
      <p>{t("El borrador del formulario se conserva temporalmente en esta pestaña para recuperarlo si recargas. Se elimina al enviar la solicitud y caduca después de 12 horas sin cambios.")}</p>
      <p>{t("Esta versión no instala herramientas de publicidad ni analytics de terceros. El proveedor de hosting puede conservar registros técnicos necesarios para seguridad y funcionamiento del servicio.")}</p>
      <p>{t("Para pedir acceso, corrección o eliminación de información que hayas enviado, escribe a")} <a href={`mailto:${business.contact.email}`} style={{ textDecoration: "underline", fontWeight: 800 }}>{business.contact.email}</a>.</p>
    </div>
  </article>;
}
