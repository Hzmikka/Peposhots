import nodemailer from "nodemailer";
import type { BookingInquiryInput } from "@/lib/bookingValidation";

function safeText(value: string | undefined) {
  return (value || "").replace(/[<>\r\n]/g, " ").replace(/\s+/g, " ").trim();
}

function escapeHtml(value: string | undefined) {
  return (value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getMailConfig() {
  const user = (process.env.EMAIL_FROM || "").trim();
  const to = (process.env.EMAIL_TO || "").trim();
  const pass = (process.env.GMAIL_APP_PASSWORD || "").replace(/\s+/g, "");

  if (!user || !to || !pass) {
    const error = new Error("Email delivery is not configured.");
    (error as Error & { code?: string }).code = "EMAIL_CONFIG_MISSING";
    throw error;
  }

  return { user, to, pass };
}

function getTransporter(config: { user: string; pass: string }) {
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: config.user,
      pass: config.pass,
    },
    connectionTimeout: 12_000,
    greetingTimeout: 12_000,
    socketTimeout: 25_000,
  });
}

export type SafeMailFailure = {
  code: "EMAIL_CONFIG_MISSING" | "EMAIL_AUTH_FAILED" | "EMAIL_CONNECTION_FAILED" | "EMAIL_SEND_FAILED";
  log: Record<string, string | number | undefined>;
};

export function classifyMailFailure(error: unknown): SafeMailFailure {
  const value = (error && typeof error === "object" ? error : {}) as {
    code?: string;
    command?: string;
    responseCode?: number;
    message?: string;
  };

  const rawCode = typeof value.code === "string" ? value.code : "";
  const responseCode = typeof value.responseCode === "number" ? value.responseCode : undefined;

  if (rawCode === "EMAIL_CONFIG_MISSING") {
    return {
      code: "EMAIL_CONFIG_MISSING",
      log: { code: rawCode, command: value.command, responseCode },
    };
  }

  if (rawCode === "EAUTH" || responseCode === 535) {
    return {
      code: "EMAIL_AUTH_FAILED",
      log: { code: rawCode, command: value.command, responseCode },
    };
  }

  if (["ETIMEDOUT", "ECONNECTION", "ESOCKET", "ECONNREFUSED", "ENETUNREACH"].includes(rawCode)) {
    return {
      code: "EMAIL_CONNECTION_FAILED",
      log: { code: rawCode, command: value.command, responseCode },
    };
  }

  return {
    code: "EMAIL_SEND_FAILED",
    log: { code: rawCode || undefined, command: value.command, responseCode },
  };
}

function subjectLine(data: BookingInquiryInput) {
  return `Nueva solicitud PepoShots — ${safeText(data.eventType)} — ${safeText(data.eventDate)}`;
}

function textBody(data: BookingInquiryInput) {
  return [
    "NUEVA SOLICITUD DE EVENTO",
    "",
    `Nombre: ${data.name}`,
    `Teléfono: ${data.phone}`,
    `Email: ${data.email}`,
    "",
    `Tipo de evento: ${data.eventType}`,
    `Fecha: ${data.eventDate}`,
    `Invitados: ${data.guestRange}`,
    `Ciudad / ZIP: ${data.location}`,
    `Servicio: ${data.serviceNeeded}`,
    `¿Venue con barra?: ${data.venueHasBar}`,
    `Horario aproximado: ${data.schedule || "—"}`,
    `Interior / exterior: ${data.setting || "—"}`,
    `Tragos favoritos: ${data.favoriteDrinks?.join(", ") || "—"}`,
    "",
    "Contexto guardado por la web:",
    `Tipo de evento elegido: ${data.context?.eventPath || "—"}`,
    `Bar setup preferido: ${data.context?.preferredBarSetup || "—"}`,
    `Trago explorado: ${data.context?.exploredDrink || "—"}`,
    "",
    "Comentarios:",
    data.message || "—",
  ].join("\n");
}

function htmlBody(data: BookingInquiryInput) {
  const row = (label: string, value: string | undefined) => `
    <tr>
      <td style="padding:7px 10px;color:#526514;font-weight:700;vertical-align:top;white-space:nowrap">${escapeHtml(label)}</td>
      <td style="padding:7px 10px;color:#094735;font-weight:700">${escapeHtml(value || "—")}</td>
    </tr>`;

  return `
  <div style="margin:0;background:#f7fbea;padding:24px;font-family:Arial,sans-serif;color:#094735">
    <div style="max-width:640px;margin:auto;background:#fff;border:1px solid #dce9c9;border-radius:20px;overflow:hidden">
      <div style="background:#094735;padding:22px 24px;color:#cef17b">
        <div style="font-size:12px;font-weight:800;letter-spacing:.14em">PEPOSHOTS WEBSITE</div>
        <h1 style="margin:6px 0 0;font-size:26px;line-height:1.05">Nueva solicitud de evento</h1>
      </div>
      <div style="padding:18px 14px">
        <table role="presentation" style="width:100%;border-collapse:collapse;font-size:14px">
          ${row("Nombre", data.name)}
          ${row("Teléfono", data.phone)}
          ${row("Email", data.email)}
          ${row("Tipo de evento", data.eventType)}
          ${row("Fecha", data.eventDate)}
          ${row("Invitados", data.guestRange)}
          ${row("Ciudad / ZIP", data.location)}
          ${row("Servicio", data.serviceNeeded)}
          ${row("Venue con barra", data.venueHasBar)}
          ${row("Horario", data.schedule)}
          ${row("Interior / exterior", data.setting)}
          ${row("Tragos favoritos", data.favoriteDrinks?.join(", "))}
        </table>
        <div style="margin:18px 10px 6px;padding:14px 16px;background:#f2f9e5;border-radius:14px">
          <div style="font-size:12px;font-weight:800;letter-spacing:.08em;color:#526514">COMENTARIOS</div>
          <p style="margin:7px 0 0;white-space:pre-wrap;font-size:14px;line-height:1.5">${escapeHtml(data.message || "—")}</p>
        </div>
        <p style="margin:16px 10px 2px;font-size:12px;line-height:1.5;color:#526514">Responde a este correo y Gmail dirigirá la respuesta al email del cliente.</p>
      </div>
    </div>
  </div>`;
}

export async function deliverBookingEmail(data: BookingInquiryInput) {
  const config = getMailConfig();
  const transporter = getTransporter(config);

  await transporter.sendMail({
    from: `"PepoShots Website" <${config.user}>`,
    to: config.to,
    replyTo: data.email,
    subject: subjectLine(data),
    text: textBody(data),
    html: htmlBody(data),
  });

  return { delivered: true, simulated: false };
}

export async function deliverReviewEmail(data: {
  name: string;
  email: string;
  eventType?: string;
  text: string;
  rating?: string;
  attachment?: { filename: string; content: Buffer; contentType?: string };
}) {
  const config = getMailConfig();
  const transporter = getTransporter(config);

  await transporter.sendMail({
    from: `"PepoShots Website" <${config.user}>`,
    to: config.to,
    replyTo: data.email,
    subject: `Nueva reseña PepoShots — ${safeText(data.eventType) || "Evento"}`,
    text: [
      "RESEÑA RECIBIDA — PENDIENTE DE REVISIÓN",
      "",
      `Nombre: ${data.name}`,
      `Email: ${data.email}`,
      `Evento: ${data.eventType || "—"}`,
      `Calificación: ${data.rating || "—"}`,
      "",
      data.text,
    ].join("\n"),
    html: `
      <div style="font-family:Arial,sans-serif;color:#094735">
        <h2>Nueva reseña PepoShots</h2>
        <p><strong>Nombre:</strong> ${escapeHtml(data.name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(data.email)}</p>
        <p><strong>Evento:</strong> ${escapeHtml(data.eventType || "—")}</p>
        <p><strong>Calificación:</strong> ${escapeHtml(data.rating || "—")} / 5</p>
        <div style="margin-top:18px;padding:14px;background:#f2f9e5;border-radius:12px;white-space:pre-wrap">${escapeHtml(data.text)}</div>
      </div>`,
    attachments: data.attachment ? [data.attachment] : undefined,
  });

  return { delivered: true, simulated: false };
}
