import { updateChapter, type Book, type ProseHistoryOp, type ProseRevision } from "./BookSchema";
import { newId, nowIso } from "./ids";

export type { ProseHistoryOp, ProseRevision };

export const DEFAULT_PROSE_HISTORY_LIMIT = 12;
export const MIN_PROSE_HISTORY_LIMIT = 3;
export const MAX_PROSE_HISTORY_LIMIT = 50;
export const PROSE_HISTORY_LIMIT_KEY = "storybook-ai.prose-history-limit";

export function clampProseHistoryLimit(n: number): number {
  if (!Number.isFinite(n)) return DEFAULT_PROSE_HISTORY_LIMIT;
  return Math.min(MAX_PROSE_HISTORY_LIMIT, Math.max(MIN_PROSE_HISTORY_LIMIT, Math.round(n)));
}

export function parseProseHistoryLimit(raw: string | null | undefined): number {
  if (raw == null || raw.trim() === "") return DEFAULT_PROSE_HISTORY_LIMIT;
  const n = Number(raw);
  if (!Number.isFinite(n)) return DEFAULT_PROSE_HISTORY_LIMIT;
  return clampProseHistoryLimit(n);
}

export function readProseHistoryLimit(store: Pick<Storage, "getItem"> = localStorage): number {
  return parseProseHistoryLimit(store.getItem(PROSE_HISTORY_LIMIT_KEY));
}

export function writeProseHistoryLimit(
  limit: number,
  store: Pick<Storage, "getItem" | "setItem"> = localStorage
): void {
  store.setItem(PROSE_HISTORY_LIMIT_KEY, String(clampProseHistoryLimit(limit)));
}

export function rewriteHistoryOp(mode: "extend" | "elaborate" | "instruct" | "beat"): ProseHistoryOp {
  return mode === "instruct" ? "rewrite" : mode;
}

/** Snapshot `beforeProse` as a new row. Newest first, then FIFO to `limit`. Does not change live prose. */
export function recordProseRevision(
  book: Book,
  chapterId: string,
  op: ProseHistoryOp,
  beforeProse: string,
  limit: number
): Book {
  const chapter = book.chapters.find((item) => item.id === chapterId);
  if (!chapter) return book;
  const revision: ProseRevision = {
    id: newId(),
    at: nowIso(),
    op,
    prose: beforeProse
  };
  const revisions = [revision, ...chapter.revisions].slice(0, clampProseHistoryLimit(limit));
  return updateChapter(book, chapterId, { revisions });
}

/**
 * Jump live prose to that row. If live text differs, first push it as `restore`.
 * Later rows stay. The cap still drops the oldest.
 */
export function restoreProseRevision(
  book: Book,
  chapterId: string,
  revisionId: string,
  limit: number
): Book {
  const chapter = book.chapters.find((item) => item.id === chapterId);
  if (!chapter) return book;
  const target = chapter.revisions.find((item) => item.id === revisionId);
  if (!target) return book;
  if (chapter.prose === target.prose) return book;
  const next = recordProseRevision(book, chapterId, "restore", chapter.prose, limit);
  return updateChapter(next, chapterId, { prose: target.prose });
}
