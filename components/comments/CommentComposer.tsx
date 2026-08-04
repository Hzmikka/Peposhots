import { Send } from "lucide-react";
import type { FormEvent } from "react";
import { getEventsByValues, groupedEventTypes, type EventType } from "@/data/eventTypes";
import styles from "./CommentsSection.module.css";

export type CommentDraft = { author: string; eventType: EventType | ""; body: string };
type Props = { draft: CommentDraft; errors: Partial<Record<keyof CommentDraft, string>>; loading: boolean; onChange: (draft: CommentDraft) => void; onSubmit: (event: FormEvent) => void };

export function CommentComposer({ draft, errors, loading, onChange, onSubmit }: Props) {
  const initial = draft.author.trim().charAt(0).toUpperCase() || "P";
  return (
    <form className={styles.composer} onSubmit={onSubmit} noValidate>
      <div className={styles.avatar} aria-hidden="true">{initial}</div>
      <div className={styles.field}>
        <label className={styles.label} htmlFor="comment-author">Nombre</label>
        <input id="comment-author" className={styles.input} value={draft.author} maxLength={32} onChange={(e) => onChange({ ...draft, author: e.target.value })} aria-invalid={!!errors.author} aria-describedby={errors.author ? "author-error" : undefined} />
        {errors.author && <p id="author-error" className={styles.error}>{errors.author}</p>}
      </div>
      <div className={styles.field}>
        <label className={styles.label} htmlFor="comment-event">Tipo de evento</label>
        <select id="comment-event" className={styles.select} value={draft.eventType} onChange={(e) => onChange({ ...draft, eventType: e.target.value as EventType })} aria-invalid={!!errors.eventType}>
          <option value="">Seleccionar</option>
          {groupedEventTypes.map((group) => (
            <optgroup key={group.label} label={group.label}>
              {getEventsByValues(group.values).map((type) => <option key={type.value} value={type.label}>{type.label}</option>)}
            </optgroup>
          ))}
        </select>
        {errors.eventType && <p className={styles.error}>{errors.eventType}</p>}
      </div>
      <div className={`${styles.field} ${styles.fieldWide}`}>
        <label className={styles.label} htmlFor="comment-body">Comentario</label>
        <textarea id="comment-body" className={styles.textarea} value={draft.body} maxLength={320} onChange={(e) => onChange({ ...draft, body: e.target.value })} aria-invalid={!!errors.body} aria-describedby={errors.body ? "body-error" : undefined} />
        {errors.body && <p id="body-error" className={styles.error}>{errors.body}</p>}
      </div>
      <div className={styles.composerFooter}>
        <span className={styles.counter}>{draft.body.length}/320</span>
        <button className={styles.publish} type="submit" disabled={loading}>
          <Send size={16} aria-hidden="true" />{loading ? "Publicando…" : "Publicar comentario"}
        </button>
      </div>
    </form>
  );
}
