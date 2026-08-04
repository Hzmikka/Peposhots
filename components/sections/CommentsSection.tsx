"use client";

import { ChevronLeft, ChevronRight, MessageCircle } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type FormEvent, type TouchEvent } from "react";
import { CommentComposer, type CommentDraft } from "@/components/comments/CommentComposer";
import { CommentCard } from "@/components/comments/CommentCard";
import { DeleteCommentDialog } from "@/components/comments/DeleteCommentDialog";
import type { CommentEntry } from "@/data/comments";
import { demoComments } from "@/data/additionalComments";
import { getOwnerToken, readLocalComments, writeLocalComments } from "@/lib/commentStorage";
import styles from "@/components/comments/CommentsSection.module.css";
import { useBookingQuiz } from "@/context/BookingQuizContext";

const emptyDraft: CommentDraft = { author: "", eventType: "", body: "" };

export function CommentsSection() {
  const { openBookingQuiz } = useBookingQuiz();
  const [comments, setComments] = useState<CommentEntry[]>(demoComments);
  const [ownerToken, setOwnerToken] = useState("");
  const [draft, setDraft] = useState<CommentDraft>(emptyDraft);
  const [errors, setErrors] = useState<Partial<Record<keyof CommentDraft, string>>>({});
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [composerOpen, setComposerOpen] = useState(false);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const token = getOwnerToken();
    setOwnerToken(token);
    setComments([...demoComments, ...readLocalComments()]);
  }, []);

  const orderedComments = useMemo(() => [...comments].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)), [comments]);

  useEffect(() => {
    if (currentIndex >= orderedComments.length) setCurrentIndex(Math.max(0, orderedComments.length - 1));
  }, [currentIndex, orderedComments.length]);

  function submit(event: FormEvent) {
    event.preventDefault();
    const nextErrors: typeof errors = {};
    const author = draft.author.trim();
    const body = draft.body.trim();
    if (author.length < 2) nextErrors.author = "Escribe un nombre de al menos 2 caracteres.";
    if (author.length > 32) nextErrors.author = "El nombre no puede superar 32 caracteres.";
    if (!draft.eventType) nextErrors.eventType = "Selecciona un tipo de evento.";
    if (body.length < 12) nextErrors.body = "Escribe un comentario de al menos 12 caracteres.";
    if (body.length > 320) nextErrors.body = "El comentario no puede superar 320 caracteres.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length || !draft.eventType) { setStatus("Revisa los campos indicados."); return; }
    setLoading(true);
    const comment: CommentEntry = { id: crypto.randomUUID(), author, eventType: draft.eventType, body, createdAt: new Date().toISOString(), isSeed: false, ownerToken };
    const next = [comment, ...comments];
    setComments(next);
    writeLocalComments(next);
    setDraft(emptyDraft);
    setErrors({});
    setStatus("Gracias por compartir tu experiencia.");
    setCurrentIndex(0);
    setComposerOpen(false);
    setLoading(false);
  }

  function confirmDelete() {
    const target = comments.find((comment) => comment.id === pendingDelete);
    if (!target || target.isSeed || target.ownerToken !== ownerToken) { setPendingDelete(null); setStatus("No puedes borrar este comentario."); return; }
    const next = comments.filter((comment) => comment.id !== target.id);
    setComments(next);
    writeLocalComments(next);
    setPendingDelete(null);
    setStatus("Tu comentario fue eliminado.");
  }

  function showPreviousComment() {
    setCurrentIndex((index) => (index - 1 + orderedComments.length) % orderedComments.length);
  }

  function showNextComment() {
    setCurrentIndex((index) => (index + 1) % orderedComments.length);
  }

  function handleTouchStart(event: TouchEvent<HTMLDivElement>) {
    if (event.touches.length !== 1) {
      touchStart.current = null;
      return;
    }

    const touch = event.touches[0];
    touchStart.current = { x: touch.clientX, y: touch.clientY };
  }

  function handleTouchEnd(event: TouchEvent<HTMLDivElement>) {
    const start = touchStart.current;
    touchStart.current = null;

    if (!start || orderedComments.length < 2 || !event.changedTouches.length) return;

    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - start.x;
    const deltaY = touch.clientY - start.y;

    if (Math.abs(deltaX) < 48 || Math.abs(deltaX) <= Math.abs(deltaY) * 1.15) return;

    if (deltaX < 0) showNextComment();
    else showPreviousComment();
  }

  return (
    <section className={styles.section} aria-labelledby="comments-title">
      <header className={styles.header}>
        <p className={styles.eyebrow}>Experiencias PepoShots</p>
        <h2 id="comments-title">Después del brindis</h2>
        <p className={styles.description}>Experiencias compartidas por quienes celebraron con PepoShots.</p>
      </header>
      {orderedComments.length ? (
        <div className={styles.carousel} aria-roledescription="carrusel" aria-label="Comentarios de clientes">
          <div
            className={styles.carouselViewport}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={() => { touchStart.current = null; }}
          >
            <div className={styles.carouselTrack} style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
              {orderedComments.map((comment, index) => (
                <div className={styles.slide} key={comment.id} aria-hidden={index !== currentIndex}>
                  <CommentCard comment={comment} canDelete={!comment.isSeed && comment.ownerToken === ownerToken} onDelete={() => setPendingDelete(comment.id)} />
                </div>
              ))}
            </div>
          </div>
          <div className={styles.carouselControls}>
            <button className={styles.carouselButton} type="button" onClick={showPreviousComment} aria-label="Comentario anterior"><ChevronLeft size={18} /></button>
            <button className={styles.carouselButton} type="button" onClick={showNextComment} aria-label="Comentario siguiente"><ChevronRight size={18} /></button>
          </div>
        </div>
      ) : <div className={styles.empty}>Todavía no hay comentarios. Sé la primera persona en compartir su experiencia.</div>}
      <div className={styles.composerArea}>
        {!composerOpen ? (
          <button className={styles.composerTrigger} type="button" onClick={() => setComposerOpen(true)} aria-expanded="false">
            <MessageCircle size={17} aria-hidden="true" />
            <span>Deja tu experiencia</span>
          </button>
        ) : (
          <CommentComposer draft={draft} errors={errors} loading={loading} onChange={setDraft} onSubmit={submit} />
        )}
      </div>
      <p className={styles.status} role="status" aria-live="polite">{status}</p>
      <div className={styles.cta}><span>¿Preparando tu propia celebración?</span><button className={styles.bookingLink} type="button" onClick={openBookingQuiz}>Consultar disponibilidad</button></div>
      <DeleteCommentDialog open={pendingDelete !== null} onCancel={() => setPendingDelete(null)} onConfirm={confirmDelete} />
    </section>
  );
}
