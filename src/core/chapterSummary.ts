import { peelModelAsides } from "./proseFlow";
import type { Chapter } from "./BookSchema";

/**
 * Not a cover-copy blurb and not an extractor (no JSON, nothing locked) —
 * a short continuity note for the author's own `Chapter.summary` field,
 * which `formatStorySoFar` (generateProse.ts) later folds into a LATER
 * chapter's Draft/Extend/Elaborate/Beat prompt so the model can see what
 * happened here without needing this chapter's full prose in context.
 */
export const SUMMARIZE_CHAPTER_SYSTEM = `You summarize one chapter of a novel for the author's own continuity notes.
Write 2-4 sentences covering what actually happens: the key events, decisions, and turns, in the order they occur.
State only what the chapter itself establishes. No speculation, no foreshadowing of what might come later, no commentary on craft or theme, no praise.
Plain prose, third person. No heading, no "Summary:" label, no bullet points — just the sentences themselves.`;

export function summarizeChapterUserPrompt(chapter: Pick<Chapter, "title" | "prose">): string {
  const prose = peelModelAsides(chapter.prose).prose.trim();
  return `Chapter: ${chapter.title.trim() || "Untitled"}\n\nProse:\n${prose}`;
}
