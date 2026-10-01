"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { Container } from "@/components/ui/Container";

import { realEvents, realWorkLookups } from "@/data/realEvents";


export function RealWorkReviews() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const archiveRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Array<HTMLElement | null>>([]);
  const [tab, setTab] = useState<"photos" | "review">("photos");
  const [activeIndex, setActiveIndex] = useState(0);

  function open(nextTab: "photos" | "review" = "photos") {
    setTab(nextTab);
    dialogRef.current?.showModal();
  }

  function scrollCardIntoView(index: number) {
    window.requestAnimationFrame(() => {
      const archive = archiveRef.current;
      const card = cardRefs.current[index];
      if (!archive || !card) return;
      const target = card.offsetLeft - (archive.clientWidth - card.offsetWidth) / 2;
      archive.scrollTo({ left: Math.max(0, target), behavior: "smooth" });
    });
  }

  function selectRelative(step: number) {
    setActiveIndex((current) => {
      const next = (current + step + realEvents.length) % realEvents.length;
      scrollCardIntoView(next);
      return next;
    });
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      event.preventDefault();
      selectRelative(event.key === "ArrowRight" ? 1 : -1);
    }
  }

  function selectEvent(index: number) {
    setActiveIndex(index);
    scrollCardIntoView(index);
  }

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const onClick = (event: MouseEvent) => {
      if (event.target === dialog) dialog.close();
    };
    dialog.addEventListener("click", onClick);
    return () => dialog.removeEventListener("click", onClick);
  }, []);

  return (
    <section className="section section-real-work" id="real-work">
      <div className="real-events-lookups">
        {realWorkLookups.map((src, index) => (
          <span className={`real-events-lookup lookup-${index + 1}`} key={src}>
            <Image src={src} alt="" fill sizes="(max-width: 400px) 62vw, 248px" />
          </span>
        ))}
        <article className="lookup-copy copy-1">
          <span>TÚ TRAES</span>
          <strong>EL ALCOHOL</strong>
          <p>Te guiamos con la compra.</p>
        </article>
        <article className="lookup-copy copy-2">
          <span>NOSOTROS LLEVAMOS</span>
          <strong>HIELO + HERRAMIENTAS</strong>
          <p>Todo listo para servir.</p>
        </article>
        <article className="lookup-copy copy-3">
          <span>NOSOTROS HACEMOS</span>
          <strong>PREP + SERVICIO</strong>
          <p>Montaje, mezcla y atención.</p>
        </article>
      </div>
      <Container className="real-events-layout">
        <header className="real-events-header">
          <p className="kicker">REAL EVENTS</p>
          <h2><span>Tragos reales.</span><span>Servicio real.</span></h2>
          <p>Sin estudio ni campaña. Así se ve PepoShots cuando empieza la fiesta.</p>
        </header>

        <div ref={archiveRef} className="real-events-archive" aria-label="Archivo de eventos reales">
          {realEvents.map((event, index) => {
            const active = index === activeIndex;
            return (
              <article ref={(node) => { cardRefs.current[index] = node; }} className={`real-event-tab${active ? " is-active" : ""}`} key={event.src} onMouseEnter={() => setActiveIndex(index)}>
                <span className="real-event-media">
                  <Image src={event.src} alt={active ? event.alt : ""} fill sizes={active ? "(max-width: 400px) 62vw, 248px" : "64px"} priority={index === 0} />
                  {!active ? <span className="real-event-shade" aria-hidden="true" /> : null}
                </span>
                {active ? (
                  <span className="real-event-proof" id="real-event-proof" aria-live="polite">
                    <span className="real-event-heading">
                      <strong>{event.descriptor}</strong>
                      {typeof event.rating === "number" ? <b aria-label={`${event.rating} de 5 estrellas`}>{"★".repeat(event.rating)}{"☆".repeat(5 - event.rating)}</b> : null}
                    </span>
                    {event.author ? <span className="real-event-author">{event.author}</span> : null}
                    <ReviewExcerpt key={event.src} text={event.review} />
                    {event.reviewSource ? <span className={`real-event-source${event.sample ? " is-sample" : ""}`}>{event.reviewSource}</span> : null}
                    <button className="real-event-google" type="button" onClick={() => open("review")}>DEJA TU RESEÑA AQUÍ ↗</button>
                  </span>
                ) : (
                  <button className="real-event-select" type="button" onFocus={() => selectEvent(index)} onClick={() => selectEvent(index)} onKeyDown={handleKeyDown} aria-label={`Ver ${event.descriptor.toLowerCase()}`}><span className="real-event-collapsed" aria-hidden="true"><span>{`${"★".repeat(event.rating)}${"☆".repeat(5 - event.rating)}`}</span></span></button>
                )}
              </article>
            );
          })}
        </div>

        <div className="real-events-actions">
          <button className="btn btn-dark" type="button" onClick={() => open("photos")}>Ver trabajo real</button>
          <button className="btn real-events-review-link" type="button" onClick={() => open("review")}>Deja una reseña</button>
          <button className="text-button real-events-share" type="button" onClick={() => open("review")}>Compartir fotos de tu evento</button>
        </div>
      </Container>

      <dialog ref={dialogRef} className="proof-dialog" aria-labelledby="proof-dialog-title">
        <div className="proof-sheet">
          <div className="proof-sheet-top">
            <div><p className="kicker">PEPOSHOTS · REAL WORK</p><h3 id="proof-dialog-title">Así se ve en realidad.</h3></div>
            <button className="dialog-close" type="button" onClick={() => dialogRef.current?.close()} aria-label="Cerrar">×</button>
          </div>
          <div className="proof-tabs" role="tablist" aria-label="Trabajo real y reseñas">
            <button type="button" role="tab" aria-selected={tab === "photos"} onClick={() => setTab("photos")}>Fotos</button>
            <button type="button" role="tab" aria-selected={tab === "review"} onClick={() => setTab("review")}>Reseña + fotos</button>
          </div>
          {tab === "photos" ? (
            <div className="proof-panel" role="tabpanel">
              <div className="real-photo-grid">{realEvents.map((event) => <figure key={event.src}><Image src={event.src} alt={event.alt} width={960} height={1280} sizes="(max-width: 400px) 46vw, 184px" /></figure>)}</div>
              <p className="proof-note">Fotos móviles del trabajo real de PepoShots.</p>
            </div>
          ) : <div className="proof-panel" role="tabpanel"><ReviewForm /></div>}
        </div>
      </dialog>
    </section>
  );
}

function ReviewExcerpt({ text }: { text: string }) {
  const textRef = useRef<HTMLSpanElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);

  useEffect(() => {
    const element = textRef.current;
    if (!element) return;
    const measure = () => setIsTruncated(element.scrollHeight > element.clientHeight + 1);
    const frame = window.requestAnimationFrame(measure);
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [text]);

  return (
    <>
      <span ref={textRef} className={`real-event-review${expanded ? " is-expanded" : ""}`}>{text}</span>
      {isTruncated || expanded ? <button className="real-event-more" type="button" onClick={() => setExpanded((current) => !current)}>{expanded ? "Ver menos" : "Ver más"}</button> : null}
    </>
  );
}

function ReviewForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setMessage("");
    const form = event.currentTarget;
    const data = new FormData(form);
    const photo = data.get("photo");
    if (photo instanceof File && photo.size > 3 * 1024 * 1024) {
      setStatus("error");
      setMessage("La foto debe pesar menos de 3 MB.");
      return;
    }
    try {
      const response = await fetch("/api/review", { method: "POST", body: data });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "No se pudo enviar el material.");
      setStatus("success");
      form.reset();
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "No se pudo enviar el material.");
    }
  }

  if (status === "success") return <div className="review-success" role="status"><p className="kicker">MATERIAL RECIBIDO</p><h4>Gracias por compartir tu experiencia.</h4><p>El material llegará a PepoShots para revisión antes de publicarse.</p></div>;

  return (
    <form className="review-form" onSubmit={submit}>
      <div><p className="kicker">¿PEPOSHOTS ESTUVO EN TU EVENTO?</p><h4>Comparte tu experiencia.</h4></div>
      <label>Nombre<input name="name" required maxLength={100} /></label>
      <label>Email <span>(privado)</span><input type="email" name="email" required maxLength={160} /></label>
      <label>Tipo de evento<input name="eventType" maxLength={100} /></label>
      <label>Tu reseña<textarea name="text" required maxLength={2000} rows={5} placeholder="¿Cómo fue la experiencia con PepoShots?" /></label>
      <label>Calificación<select name="rating" defaultValue="5"><option value="5">5 / 5</option><option value="4">4 / 5</option><option value="3">3 / 5</option><option value="2">2 / 5</option><option value="1">1 / 5</option></select></label>
      <label>Foto del evento <span>(opcional, máx. 3 MB)</span><input type="file" name="photo" accept=".jpg,.jpeg,.png,.webp,.heic,.heif,image/jpeg,image/png,image/webp,image/heic,image/heif" /></label>
      <label className="consent-row"><input type="checkbox" name="consent" value="yes" required /> Autorizo a PepoShots a mostrar mi reseña y, si adjunto una foto, ese material en su web.</label>
      <input className="hp-field" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      {status === "error" ? <p className="form-error" role="alert">{message}</p> : null}
      <button className="btn btn-primary" type="submit" disabled={status === "sending"}>{status === "sending" ? "Enviando…" : "Enviar reseña"}</button>
      <small>El material se revisa antes de publicarse.</small>
    </form>
  );
}
