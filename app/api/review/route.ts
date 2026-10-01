import { NextResponse } from "next/server";
import { deliverReviewEmail } from "@/lib/bookingDelivery";
import { contentLengthWithin, rateLimit } from "@/lib/requestGuard";

export const runtime = "nodejs";

const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"]);

function text(form: FormData, key: string, max: number) {
  const value = form.get(key);
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function POST(request: Request) {
  const limited = rateLimit(request, "review", 5, 30 * 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json(
      { message: "Demasiados intentos. Espera unos minutos y vuelve a intentar." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSeconds) } },
    );
  }

  if (!request.headers.get("content-type")?.toLowerCase().includes("multipart/form-data")) {
    return NextResponse.json({ message: "Formato de solicitud no válido." }, { status: 415 });
  }
  if (!contentLengthWithin(request, 3.6 * 1024 * 1024)) {
    return NextResponse.json({ message: "La foto o la solicitud es demasiado grande." }, { status: 413 });
  }

  try {
    const form = await request.formData();
    if (text(form, "company", 100)) return NextResponse.json({ ok: true });

    const name = text(form, "name", 100);
    const email = text(form, "email", 160);
    const eventType = text(form, "eventType", 100);
    const reviewText = text(form, "text", 2000);
    const rating = text(form, "rating", 5);
    const consent = text(form, "consent", 10);

    if (name.length < 2 || !/^\S+@\S+\.\S+$/.test(email) || reviewText.length < 5 || consent !== "yes" || !/^[1-5]$/.test(rating)) {
      return NextResponse.json({ message: "Completa los campos requeridos y acepta el permiso de publicación." }, { status: 422 });
    }

    let attachment: { filename: string; content: Buffer; contentType?: string } | undefined;
    const photo = form.get("photo");
    if (photo instanceof File && photo.size > 0) {
      if (photo.size > 3 * 1024 * 1024) return NextResponse.json({ message: "La foto debe pesar menos de 3 MB." }, { status: 422 });
      if (!allowedImageTypes.has(photo.type.toLowerCase())) return NextResponse.json({ message: "Usa una foto JPG, PNG, WebP o HEIC." }, { status: 422 });
      attachment = {
        filename: photo.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120) || "event-photo",
        content: Buffer.from(await photo.arrayBuffer()),
        contentType: photo.type,
      };
    }

    const delivery = await deliverReviewEmail({ name, email, eventType, text: reviewText, rating, attachment });
    return NextResponse.json({ ok: true, simulated: delivery.simulated });
  } catch {
    return NextResponse.json({ message: "No pudimos enviar la reseña. Intenta de nuevo." }, { status: 503 });
  }
}
