"use client";
import { useI18n } from "@/components/i18n/LanguageProvider";
import Image from "next/image";
import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { Container } from "@/components/ui/Container";
import { realEvents, realWorkLookups } from "@/data/realEvents";
export function RealWorkReviews() {
    const { t } = useI18n();
    const dialogRef = useRef<HTMLDialogElement>(null);
    const archiveRef = useRef<HTMLDivElement>(null);
    const cardRefs = useRef<Array<HTMLElement | null>>([]);
    const [tab, setTab] = useState<"photos" | "review">("photos");
    const [contributionMode, setContributionMode] = useState<"review" | "photo">("review");
    const [activeIndex, setActiveIndex] = useState(0);
    function open(nextTab: "photos" | "review" = "photos", mode: "review" | "photo" = "review") {
        setContributionMode(mode);
        setTab(nextTab);
        dialogRef.current?.showModal();
    }
    function scrollCardIntoView(index: number) {
        window.requestAnimationFrame(() => {
            const archive = archiveRef.current;
            const card = cardRefs.current[index];
            if (!archive || !card)
                return;
            const target = card.offsetLeft - (archive.clientWidth - card.offsetWidth) / 2;
            archive.scrollTo({ left: Math.max(0, target), behavior: "smooth" });
        });
    }
    function handleTabKey(event: KeyboardEvent<HTMLButtonElement>) {
        if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
        event.preventDefault();
        const next = event.key === "Home" ? "photos" : event.key === "End" ? "review" : tab === "photos" ? "review" : "photos";
        setTab(next);
        event.currentTarget.parentElement?.querySelector<HTMLButtonElement>(`#proof-tab-${next}`)?.focus();
    }
    function selectRelative(step: number, focus = false) {
        const next = (activeIndex + step + realEvents.length) % realEvents.length;
        setActiveIndex(next);
        scrollCardIntoView(next);
        if (focus) window.requestAnimationFrame(() => cardRefs.current[next]?.querySelector<HTMLButtonElement>(".real-event-select")?.focus({ preventScroll: true }));
    }
    function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
        if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
            event.preventDefault();
            selectRelative(event.key === "ArrowRight" ? 1 : -1, true);
        }
    }
    function selectEvent(index: number) {
        setActiveIndex(index);
        scrollCardIntoView(index);
    }
    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog)
            return;
        const onClick = (event: MouseEvent) => {
            if (event.target === dialog)
                dialog.close();
        };
        dialog.addEventListener("click", onClick);
        return () => dialog.removeEventListener("click", onClick);
    }, []);
    return (<section className="section section-real-work" id="real-work">
      <div className="real-events-lookups">
        {realWorkLookups.map((src, index) => (<span className={`real-events-lookup lookup-${index + 1}`} key={src}>
            <Image src={src} alt="" fill sizes="(max-width: 599px) 78vw, (max-width: 1023px) 30vw, 380px"/>
          </span>))}
        <article className="lookup-copy copy-1">
          <span>{t("T\u00DA TRAES")}</span>
          <strong>{t("EL ALCOHOL")}</strong>
          <p>{t("Te guiamos con la compra.")}</p>
        </article>
        <article className="lookup-copy copy-2">
          <span>{t("NOSOTROS LLEVAMOS")}</span>
          <strong>{t("HIELO + HERRAMIENTAS")}</strong>
          <p>{t("Todo listo para servir.")}</p>
        </article>
        <article className="lookup-copy copy-3">
          <span>{t("NOSOTROS HACEMOS")}</span>
          <strong>{t("PREP + SERVICIO")}</strong>
          <p>{t("Montaje, mezcla y atenci\u00F3n.")}</p>
        </article>
      </div>
      <Container className="real-events-layout">
        <header className="real-events-header">
          <p className="kicker">{t("EVENTOS REALES")}</p>
          <h2><span>{t("Tragos reales.")}</span><span>{t("Servicio real.")}</span></h2>
          <p>{t("Sin estudio ni campa\u00F1a. As\u00ED se ve PepoShots cuando empieza la fiesta.")}</p>
        </header>

        <div ref={archiveRef} className="real-events-archive" aria-label={t("Fotos de cócteles en eventos reales")}>
          {realEvents.map((event, index) => {
            const active = index === activeIndex;
            const review = event.review;
            return (<article ref={(node) => { cardRefs.current[index] = node; }} className={`real-event-tab${active ? " is-active" : ""}`} key={event.src} onMouseEnter={() => setActiveIndex(index)}>
                <span className="real-event-media">
                  <Image src={event.src} alt={active ? t(event.alt) : ""} fill sizes={active ? "(max-width: 599px) 62vw, 360px" : "64px"} loading="lazy"/>
                  {!active ? <span className="real-event-shade" aria-hidden="true"/> : null}
                </span>
                {active ? (<span className="real-event-proof" id="real-event-proof" aria-live="polite">
                    {event.sample ? <span className="real-event-example">{t("DEMO \u00B7 RESE\u00D1A DE MUESTRA")}</span> : null}
                    <span className="real-event-heading">
                      <strong>{t(event.descriptor)}</strong>
                      {review && event.rating > 0 ? <b aria-label={t("{count} de 5 estrellas", { count: event.rating })}>{"★".repeat(event.rating)}{"☆".repeat(5 - event.rating)}</b> : null}
                    </span>
                    {review && event.author ? <span className="real-event-author">{event.author}</span> : null}
                    {review ? <ReviewExcerpt key={event.src} text={review}/> : <span className="real-event-caption">{t(event.alt)}</span>}
                    <button className="real-event-google" type="button" onClick={() => open("review")}>{t("DEJA TU RESE\u00D1A AQU\u00CD \u2197")}</button>
                  </span>) : null}
                <button className="real-event-select" type="button" aria-pressed={active} onClick={() => selectEvent(index)} onKeyDown={handleKeyDown} aria-label={t("Ver foto: {name}", { name: t(event.alt) })}><span className="real-event-collapsed" aria-hidden="true" hidden={active}><span>{review && event.rating > 0 ? `${"★".repeat(event.rating)}${"☆".repeat(5 - event.rating)}` : t("VER FOTO")}</span></span></button>
              </article>);
        })}
        </div>

        <nav className="archive-navigation" aria-label={t("Recorrer eventos reales")}>
          <button type="button" onClick={() => selectRelative(-1)} aria-label={t("Evento anterior")}>{t("\u2190")}</button>
          <span aria-live="polite">{String(activeIndex + 1).padStart(2, "0")}{t(" / ")}{String(realEvents.length).padStart(2, "0")}</span>
          <button type="button" onClick={() => selectRelative(1)} aria-label={t("Siguiente evento")}>{t("\u2192")}</button>
        </nav>
        <div className="real-events-actions">
          <button className="btn btn-dark" type="button" onClick={() => open("photos")}>{t("Ver trabajo real")}</button>
          <button className="btn real-events-review-link" type="button" onClick={() => open("review")}>{t("Deja una rese\u00F1a")}</button>
          <button className="text-button real-events-share" type="button" onClick={() => open("review", "photo")}>{t("Compartir fotos de tu evento")}</button>
        </div>
      </Container>

      <dialog ref={dialogRef} className="proof-dialog" aria-labelledby="proof-dialog-title">
        <div className="proof-sheet">
          <div className="proof-sheet-top">
            <div><p className="kicker">{t("PEPOSHOTS \u00B7 REAL WORK")}</p><h3 id="proof-dialog-title">{t("As\u00ED se ve en realidad.")}</h3></div>
            <button className="dialog-close" type="button" onClick={() => dialogRef.current?.close()} aria-label={t("Cerrar")}>{t("\u00D7")}</button>
          </div>
          <div className="proof-tabs" role="tablist" aria-label={t("Trabajo real y rese\u00F1as")}>
            <button id="proof-tab-photos" type="button" role="tab" aria-controls="proof-panel" tabIndex={tab === "photos" ? 0 : -1} onKeyDown={handleTabKey} aria-selected={tab === "photos"} onClick={() => setTab("photos")}>{t("Fotos")}</button>
            <button id="proof-tab-review" type="button" role="tab" aria-controls="proof-panel" tabIndex={tab === "review" ? 0 : -1} onKeyDown={handleTabKey} aria-selected={tab === "review"} onClick={() => { setContributionMode("review"); setTab("review"); }}>{t("Rese\u00F1a + fotos")}</button>
          </div>
          {tab === "photos" ? (<div className="proof-panel" id="proof-panel" role="tabpanel" aria-labelledby={`proof-tab-${tab}`}>
              <div className="real-photo-grid">{realEvents.map((event) => <figure key={event.src}><Image src={event.src} alt={t(event.alt)} width={960} height={1280} sizes="(max-width: 599px) 46vw, 280px"/></figure>)}</div>
              <p className="proof-note">{t("Fotos m\u00F3viles del trabajo real de PepoShots.")}</p>
            </div>) : <div className="proof-panel" id="proof-panel" role="tabpanel" aria-labelledby={`proof-tab-${tab}`}><ReviewForm photoOnly={contributionMode === "photo"} /></div>}
        </div>
      </dialog>
    </section>);
}
function ReviewExcerpt({ text }: {
    text: string;
}) {
    const { t } = useI18n();
    const textRef = useRef<HTMLSpanElement>(null);
    const [expanded, setExpanded] = useState(false);
    const [isTruncated, setIsTruncated] = useState(false);
    useEffect(() => {
        const element = textRef.current;
        if (!element)
            return;
        const measure = () => setIsTruncated(element.scrollHeight > element.clientHeight + 1);
        const frame = window.requestAnimationFrame(measure);
        const observer = new ResizeObserver(measure);
        observer.observe(element);
        return () => {
            window.cancelAnimationFrame(frame);
            observer.disconnect();
        };
    }, [text]);
    return (<>
      <span ref={textRef} className={`real-event-review${expanded ? " is-expanded" : ""}`}>{text}</span>
      {isTruncated || expanded ? <button className="real-event-more" type="button" onClick={() => setExpanded((current) => !current)}>{t(expanded ? "Ver menos" : "Ver más")}</button> : null}
    </>);
}
function ReviewForm({ photoOnly = false }: { photoOnly?: boolean }) {
    const { t, language } = useI18n();
    const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
    const [message, setMessage] = useState("");
    const [photoError, setPhotoError] = useState("");
    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setStatus("sending"); setMessage("");
        const form = event.currentTarget;
        const data = new FormData(form);
        const photo = data.get("photo");
        if (photo instanceof File && photo.size > 3 * 1024 * 1024) {
            setStatus("error"); setMessage("La foto debe pesar menos de 3 MB."); return;
        }
        try {
            const response = await fetch("/api/review", { method: "POST", headers: { "Accept-Language": language }, body: data });
            const result = await response.json().catch(() => ({ message: t("No pudimos enviar el material. Inténtalo de nuevo o contáctanos.") }));
            if (!response.ok) throw new Error(result.message || t("No pudimos enviar el material. Inténtalo de nuevo o contáctanos."));
            setStatus("success"); form.reset();
        } catch (error) {
            setStatus("error");
            setMessage(error instanceof TypeError ? "No pudimos conectar. Tus datos siguen aquí; vuelve a intentarlo." : error instanceof Error ? error.message : "No pudimos enviar el material. Inténtalo de nuevo o contáctanos.");
        }
    }
    if (status === "success") return <div className="review-success" role="status"><p className="kicker">{t("MATERIAL RECIBIDO")}</p><h4>{t("Gracias por compartir tu experiencia.")}</h4><p>{t("El material llegará a PepoShots para revisión antes de publicarse.")}</p></div>;
    return <form className="review-form" onSubmit={submit}>
        <input type="hidden" name="mode" value={photoOnly ? "photo" : "review"}/>
        <div><p className="kicker">{t("¿PEPOSHOTS ESTUVO EN TU EVENTO?")}</p><h4>{t(photoOnly ? "Comparte una foto de tu evento." : "Comparte tu experiencia.")}</h4></div>
        <label>{t("Nombre")}<input name="name" required minLength={2} maxLength={100} autoComplete="name"/></label>
        <label>{t("Email")} <span>{t("(privado)")}</span><input type="email" name="email" required maxLength={160} autoComplete="email"/></label>
        <label>{t("Tipo de evento")}<input name="eventType" maxLength={100}/></label>
        <label>{t(photoOnly ? "Comentario (opcional)" : "Tu reseña")}<textarea name="text" required={!photoOnly} minLength={photoOnly ? undefined : 5} maxLength={2000} rows={photoOnly ? 2 : 5} placeholder={t("¿Cómo fue la experiencia con PepoShots?")}/></label>
        {photoOnly ? <input type="hidden" name="rating" value=""/> : <label>{t("Calificación")}<select name="rating" defaultValue="5"><option value="5">5 / 5</option><option value="4">4 / 5</option><option value="3">3 / 5</option><option value="2">2 / 5</option><option value="1">1 / 5</option></select></label>}
        <label>{t("Foto del evento")} <span>{t(photoOnly ? "(obligatoria, máx. 3 MB)" : "(opcional, máx. 3 MB)")}</span><input type="file" name="photo" required={photoOnly} aria-invalid={Boolean(photoError)} aria-describedby={photoError ? "review-photo-error" : undefined} accept=".jpg,.jpeg,.png,.webp,.heic,.heif,image/jpeg,image/png,image/webp,image/heic,image/heif" onChange={(event) => {
            const file = event.currentTarget.files?.[0];
            const invalid = file && file.size > 3 * 1024 * 1024;
            setPhotoError(invalid ? "La foto debe pesar menos de 3 MB." : "");
            if (invalid) event.currentTarget.value = "";
        }}/></label>
        {photoError ? <p id="review-photo-error" className="form-error" role="alert">{t(photoError)}</p> : null}
        <label className="consent-row"><input type="checkbox" name="consent" value="yes" required/>{t(photoOnly ? "Autorizo a PepoShots a mostrar esta foto y mi comentario en su web." : "Autorizo a PepoShots a mostrar mi reseña y, si adjunto una foto, ese material en su web.")}</label>
        <input className="hp-field" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true"/>
        {status === "error" ? <p className="form-error" role="alert">{t(message)}</p> : null}
        <button className="btn btn-primary" type="submit" disabled={status === "sending"}>{t(status === "sending" ? "Enviando…" : photoOnly ? "Enviar foto" : "Enviar reseña")}</button>
        <small>{t("El material se revisa antes de publicarse.")}</small>
    </form>;
}
