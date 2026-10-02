import type { Book, Chapter } from "./BookSchema";

/**
 * Free-form critical craft feedback (roadmap-ideas.md #32) — the gap between
 * Analyze's fixed categories (`chapterFeedback.ts`) and Ask Manuscript's
 * cautious, fact-only retrieval (`askManuscript.ts`). Neither can answer "is
 * this a strong cliffhanger?" or any other question the author actually has.
 * Opposite tone from Ask Manuscript on purpose: encourage honest, critical
 * judgment instead of "say so plainly instead of guessing."
 */
export const ASK_ABOUT_PASSAGE_SYSTEM =
  "You are a skilled, honest developmental editor giving direct craft feedback on fiction prose, answering the author's own question. " +
  "Be specific and critical where the writing warrants it — do not soften or hedge for politeness. If something doesn't work, say exactly what and why. If it does work, say so plainly and explain why, briefly. " +
  "Answer only the author's actual question — do not give a general review of unrelated aspects. " +
  "Judge the craft and effect of the prose itself (pacing, tension, voice, clarity, structure). This is not a fact-check against the Story Bible or the rest of the manuscript. " +
  "Keep the answer focused, in the author's own language. A few sentences is usually enough — go longer only if the question genuinely needs it.";

function buildPrompt(parts: string[]): string {
  return parts.filter((part) => part.trim().length > 0).join("\n\n");
}

/**
 * Scoped to one marked passage within a chapter, with surrounding context —
 * same `before`/`selected`/`after` shape `passageUserPrompt` (Instruct) uses,
 * so the same `ProseCanvas` selection mechanism can feed either one.
 */
export function askAboutSelectionUserPrompt(args: {
  book: Book;
  chapter: Chapter;
  before: string;
  selected: string;
  after: string;
  question: string;
}): string {
  return buildPrompt([
    `Manuscript: ${args.book.title}`,
    `Chapter ${args.chapter.sequence_index + 1}: ${args.chapter.title.trim() || "Untitled"}`,
    args.before.trim() ? `Text before the marked passage:\n${args.before.trim()}` : "",
    `Marked passage:\n${args.selected.trim()}`,
    args.after.trim() ? `Text after the marked passage:\n${args.after.trim()}` : "",
    `Author's question about the marked passage: ${args.question.trim()}`
  ]);
}

/** Scoped to the whole chapter — no passage marked, e.g. a question about its overall shape or ending. */
export function askAboutChapterUserPrompt(book: Book, chapter: Chapter, question: string): string {
  return buildPrompt([
    `Manuscript: ${book.title}`,
    `Chapter ${chapter.sequence_index + 1}: ${chapter.title.trim() || "Untitled"}`,
    `Prose:\n${chapter.prose.trim()}`,
    `Author's question about this chapter: ${question.trim()}`
  ]);
}
