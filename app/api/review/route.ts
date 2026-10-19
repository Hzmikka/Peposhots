import { NextResponse } from "next/server";
import { classifyMailFailure, deliverReviewEmail } from "@/lib/bookingDelivery";
import { contentLengthWithin, rateLimit } from "@/lib/requestGuard";
import { requestLanguage, translate } from "@/lib/i18n";
import { validateContribution } from "@/lib/reviewValidation";

export const runtime = "nodejs";
const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"]);

export async function POST(request: Request) {
  const language = requestLanguage(request);
  const t = (message: string) => translate(language, message);
  const limited = rateLimit(request, "review", 5, 30 * 60 * 1000);
  if (!limited.ok) return NextResponse.json({ message: t("Demasiados intentos. Espera unos minutos y vuelve a intentar.") }, { status: 429, headers: { "Retry-After": String(limited.retryAfterSeconds) } });
  if (!request.headers.get("content-type")?.toLowerCase().includes("multipart/form-data")) return NextResponse.json({ message: t("Formato de solicitud no válido.") }, { status: 415 });
  if (!contentLengthWithin(request, 3.6 * 1024 * 1024)) return NextResponse.json({ message: t("La foto o la solicitud es demasiado grande.") }, { status: 413 });
  let form: FormData;
  try { form = await request.formData(); }
  catch { return NextResponse.json({ message: t("Formato de solicitud no válido.") }, { status: 400 }); }
  if (String(form.get("company") || "").trim()) return NextResponse.json({ ok: true });
  const photo = form.get("photo");
  const hasPhoto = photo instanceof File && photo.size > 0;
  const result = validateContribution(Object.fromEntries(form), hasPhoto);
  if (!result.ok) return NextResponse.json({ message: t(result.message) }, { status: 422 });
  let attachment: { filename: string; content: Buffer; contentType?: string } | undefined;
  if (hasPhoto) {
    if (photo.size > 3 * 1024 * 1024) return NextResponse.json({ message: t("La foto debe pesar menos de 3 MB.") }, { status: 422 });
    if (!allowedImageTypes.has(photo.type.toLowerCase())) return NextResponse.json({ message: t("Usa una foto JPG, PNG, WebP o HEIC.") }, { status: 422 });
    attachment = { filename: photo.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120) || "event-photo", content: Buffer.from(await photo.arrayBuffer()), contentType: photo.type };
  }
  try {
    const delivery = await deliverReviewEmail({ ...result.data, attachment, language });
    return NextResponse.json({ ok: true, simulated: delivery.simulated });
  } catch (error) {
    const failure = classifyMailFailure(error);
    console.error("[PepoShots review email]", failure.log);
    return NextResponse.json({ message: t("No pudimos enviar el material. Inténtalo de nuevo o contáctanos.") }, { status: 503 });
  }
}
