import { useEffect, useRef } from "react";
import styles from "./CommentsSection.module.css";

export function DeleteCommentDialog({ open, onCancel, onConfirm }: { open: boolean; onCancel: () => void; onConfirm: () => void }) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  useEffect(() => { if (open) cancelRef.current?.focus(); }, [open]);
  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => { if (event.key === "Escape") onCancel(); };
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [open, onCancel]);
  if (!open) return null;
  return (
    <div className={styles.backdrop} role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) onCancel(); }}>
      <div className={styles.dialog} role="alertdialog" aria-modal="true" aria-labelledby="delete-title">
        <h3 id="delete-title">¿Quieres borrar este comentario?</h3>
        <div className={styles.dialogActions}>
          <button ref={cancelRef} className={`${styles.dialogButton} ${styles.cancel}`} type="button" onClick={onCancel}>Cancelar</button>
          <button className={`${styles.dialogButton} ${styles.confirm}`} type="button" onClick={onConfirm}>Borrar</button>
        </div>
      </div>
    </div>
  );
}
