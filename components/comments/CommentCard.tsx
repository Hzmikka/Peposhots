import { Trash2 } from "lucide-react";
import { useState } from "react";
import type { CommentEntry } from "@/data/comments";
import styles from "./CommentsSection.module.css";

export function CommentCard({ comment, canDelete, onDelete }: { comment: CommentEntry; canDelete: boolean; onDelete: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const mayOverflow = comment.body.length > 190;
  const date = new Intl.DateTimeFormat("es-US", { day: "numeric", month: "short", year: "numeric" }).format(new Date(comment.createdAt));
  return (
    <article className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.cardAvatar} aria-hidden="true">{comment.author.charAt(0).toUpperCase()}</div>
        <div>
          <p className={styles.author}>{comment.author}</p>
          <div className={styles.meta}><span className={styles.eventType}>{comment.eventType}</span><time dateTime={comment.createdAt}>{date}</time></div>
        </div>
        {canDelete && <button className={styles.delete} type="button" onClick={onDelete} aria-label={`Borrar comentario de ${comment.author}`}><Trash2 size={16} /></button>}
      </div>
      <p className={`${styles.body} ${expanded ? styles.bodyExpanded : ""}`}>{comment.body}</p>
      {mayOverflow && <button className={styles.readMore} type="button" onClick={() => setExpanded((value) => !value)}>{expanded ? "Leer menos" : "Leer más"}</button>}
    </article>
  );
}
