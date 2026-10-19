import { NextResponse } from "next/server";
import { validateBookingInquiry } from "@/lib/bookingValidation";
import { classifyMailFailure, deliverBookingEmail } from "@/lib/bookingDelivery";
import { contentLengthWithin, rateLimit } from "@/lib/requestGuard";
import { requestLanguage, translate } from "@/lib/i18n";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const language = requestLanguage(request);
  const t = (message: string) => translate(language, message);
  const limited = rateLimit(request, "booking", 6, 10 * 60 * 1000);
  if (!limited.ok) return NextResponse.json({ message: t("Demasiados intentos. Espera unos minutos y vuelve a intentar.") }, { status: 429, headers: { "Retry-After": String(limited.retryAfterSeconds) } });
  if (!request.headers.get("content-type")?.toLowerCase().includes("application/json")) return NextResponse.json({ message: t("Formato de solicitud no válido.") }, { status: 415 });
  if (!contentLengthWithin(request, 64 * 1024)) return NextResponse.json({ message: t("La solicitud es demasiado grande.") }, { status: 413 });
  let body: unknown;
  try { body = await request.json(); }
  catch { return NextResponse.json({ message: t("Formato de solicitud no válido.") }, { status: 400 }); }
  const result = validateBookingInquiry(body);
  if (!result.ok) return NextResponse.json({ message: t("Revisa los campos marcados para continuar."), errors: Object.fromEntries(Object.entries(result.errors).map(([field, message]) => [field, t(message)])) }, { status: 422 });
  try {
    const delivery = await deliverBookingEmail({ ...result.data, context: { ...result.data.context, language } });
    return NextResponse.json({ ok: true, simulated: delivery.simulated });
  } catch (error) {
    const failure = classifyMailFailure(error);
    console.error("[PepoShots booking email]", failure.log);
    return NextResponse.json({ message: t("No pudimos enviar tu solicitud. Inténtalo de nuevo o contáctanos.") }, { status: 503 });
  }
}
