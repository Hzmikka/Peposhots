import type { CommentEntry } from "@/data/comments";

const COMMENTS_KEY = "peposhots-comments";
const OWNER_KEY = "peposhots-comment-owner-token";

// Replace localStorage with a shared database before production launch.
export function getOwnerToken() {
  let token = localStorage.getItem(OWNER_KEY);
  if (!token) {
    token = crypto.randomUUID();
    localStorage.setItem(OWNER_KEY, token);
  }
  return token;
}

export function readLocalComments(): CommentEntry[] {
  try {
    const value = JSON.parse(localStorage.getItem(COMMENTS_KEY) ?? "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

export function writeLocalComments(comments: CommentEntry[]) {
  localStorage.setItem(COMMENTS_KEY, JSON.stringify(comments.filter((comment) => !comment.isSeed)));
}
