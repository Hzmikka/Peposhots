import { NextResponse } from "next/server";
import { validateBookingInquiry } from "@/lib/bookingValidation";
import { deliverBookingEmail } from "@/lib/bookingDelivery";
import { contentLengthWithin, rateLimit } from "@/lib/requestGuard";

export const runtime = "nodejs";

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
  } catch {
    return NextResponse.json({ message: "No pudimos enviar tu solicitud. Llama a PepoShots al 786 606-7684." }, { status: 503 });
  }
}
