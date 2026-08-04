import { NextResponse } from "next/server";
import { Resend } from "resend";

type BookingPayload = {
  name?: string;
  phone?: string;
  email?: string;
  eventDate?: string;
  eventType?: string;
  location?: string;
  guestCount?: string;
  message?: string;
  company?: string;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as BookingPayload;

    if (body.company) return NextResponse.json({ success: true, message: "Solicitud recibida." });

    const name = body.name?.trim() ?? "";
    const phone = body.phone?.trim() ?? "";
    const email = body.email?.trim() ?? "";
    const eventDate = body.eventDate?.trim() ?? "";
    const eventType = body.eventType?.trim() ?? "";
    const location = body.location?.trim() ?? "";
    const guestCount = body.guestCount?.trim() ?? "";
    const message = body.message?.trim() ?? "";

    if (!name || !phone || !eventDate || !eventType) {
      return NextResponse.json({ success: false, message: "Completa nombre, teléfono, fecha y tipo de celebración." }, { status: 400 });
    }
    if ((phone.match(/\d/g) ?? []).length < 7) {
      return NextResponse.json({ success: false, message: "Escribe un número de teléfono válido." }, { status: 400 });
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ success: false, message: "Escribe un email válido." }, { status: 400 });
    }

    const bookingEmail = process.env.BOOKING_EMAIL;
    const apiKey = process.env.RESEND_API_KEY;
    if (!bookingEmail || !apiKey) {
      console.error("Booking email integration is not configured.");
      return NextResponse.json({ success: false, message: "El envío por email aún no está configurado. Llama o envía un mensaje de texto a PepoShots." }, { status: 503 });
    }

    const safe = {
      name: escapeHtml(name), phone: escapeHtml(phone), email: escapeHtml(email || "No proporcionado"),
      eventDate: escapeHtml(eventDate), eventType: escapeHtml(eventType), location: escapeHtml(location || "No proporcionada"),
      guestCount: escapeHtml(guestCount || "No proporcionado"), message: escapeHtml(message || "Sin mensaje adicional"),
    };
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: "PepoSHOTS Booking <onboarding@resend.dev>",
      to: [bookingEmail],
      replyTo: email || undefined,
      subject: `Nueva solicitud: ${eventType} — ${eventDate}`,
      html: `<div style="font-family:Arial,sans-serif;max-width:640px;margin:auto;color:#202020"><div style="background:#0F0F0F;padding:24px"><h1 style="color:#5DD62C;margin:0;font-size:26px">Nueva solicitud para PepoSHOTS</h1></div><div style="background:#F8F8F8;padding:28px"><p><strong>Nombre:</strong> ${safe.name}</p><p><strong>Teléfono:</strong> ${safe.phone}</p><p><strong>Email:</strong> ${safe.email}</p><p><strong>Fecha del evento:</strong> ${safe.eventDate}</p><p><strong>Tipo de celebración:</strong> ${safe.eventType}</p><p><strong>Ubicación:</strong> ${safe.location}</p><p><strong>Invitados aproximados:</strong> ${safe.guestCount}</p><div style="margin-top:24px;padding-top:20px;border-top:1px solid #ddd"><strong>Mensaje:</strong><p style="white-space:pre-wrap">${safe.message}</p></div></div></div>`,
    });
    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json({ success: false, message: "No pudimos enviar la solicitud. Intenta nuevamente o llama directamente." }, { status: 502 });
    }
    return NextResponse.json({ success: true, message: "Recibimos tu solicitud. PepoSHOTS confirmará la disponibilidad directamente." });
  } catch (error) {
    console.error("Booking endpoint error:", error);
    return NextResponse.json({ success: false, message: "Algo salió mal. Intenta nuevamente o contacta directamente a PepoSHOTS." }, { status: 500 });
  }
}
