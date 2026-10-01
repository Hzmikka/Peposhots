import { NextResponse } from "next/server";
import { validateBookingInquiry } from "@/lib/bookingValidation";
import { classifyMailFailure, deliverBookingEmail } from "@/lib/bookingDelivery";
import { contentLengthWithin, rateLimit } from "@/lib/requestGuard";

export const runtime = "nodejs";

function mailFailureMessage(code: ReturnType<typeof classifyMailFailure>["code"]) {
  if (code === "EMAIL_CONFIG_MISSING") {
    return "El correo del sitio no está configurado correctamente en Vercel. Código: EMAIL_CONFIG_MISSING.";
  }
  if (code === "EMAIL_AUTH_FAILED") {
    return "Gmail rechazó las credenciales del sitio. Revisa EMAIL_FROM y la App Password de esa misma cuenta. Código: EMAIL_AUTH_FAILED.";
  }
  if (code === "EMAIL_CONNECTION_FAILED") {
    return "No pudimos conectar con Gmail desde el servidor. Código: EMAIL_CONNECTION_FAILED.";
  }
  return "Gmail no pudo enviar la solicitud. Código: EMAIL_SEND_FAILED.";
}

export async function POST(request: Request) {
  const limited = rateLimit(request, "booking", 6, 10 * 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json(
      { message: "Demasiados intentos. Espera unos minutos y vuelve a intentar." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSeconds) } },
    );
  }

  if (!request.headers.get("content-type")?.toLowerCase().includes("application/json")) {
    return NextResponse.json({ message: "Formato de solicitud no válido." }, { status: 415 });
  }
  if (!contentLengthWithin(request, 64 * 1024)) {
    return NextResponse.json({ message: "La solicitud es demasiado grande." }, { status: 413 });
  }

  try {
    const body = await request.json();
    const result = validateBookingInquiry(body);
    if (!result.ok) {
      return NextResponse.json({ message: "Revisa los campos marcados.", errors: result.errors }, { status: 422 });
    }
    const delivery = await deliverBookingEmail(result.data);
    return NextResponse.json({ ok: true, simulated: delivery.simulated });
  } catch (error) {
    const failure = classifyMailFailure(error);
    console.error("[PepoShots booking email]", failure.log);
    return NextResponse.json({ message: mailFailureMessage(failure.code), code: failure.code }, { status: 503 });
  }
}
