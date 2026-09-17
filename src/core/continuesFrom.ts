import type { Chapter } from "./BookSchema";

/** Stored on a chapter when it opens a new strand instead of following the previous one. */
export const CONTINUES_NONE = "none";

export function defaultPredecessor(chapters: Chapter[], chapter: Chapter): Chapter | undefined {
  const sorted = [...chapters].sort((a, b) => a.sequence_index - b.sequence_index);
  const index = sorted.findIndex((item) => item.id === chapter.id);
  return index > 0 ? sorted[index - 1] : undefined;
}

export function earlierChapters(chapters: Chapter[], chapter: Chapter): Chapter[] {
  return [...chapters]
    .filter((item) => item.id !== chapter.id && item.sequence_index < chapter.sequence_index)
    .sort((a, b) => a.sequence_index - b.sequence_index);
}

export function resolvePredecessor(chapters: Chapter[], chapter: Chapter): Chapter | undefined {
  if (chapter.continues_from === CONTINUES_NONE) return undefined;
  if (chapter.continues_from) {
    const named = chapters.find((item) => item.id === chapter.continues_from);
    if (named && named.id !== chapter.id) return named;
  }
  return defaultPredecessor(chapters, chapter);
}

export function chapterChoiceLabel(chapter: Chapter): string {
  const title = chapter.title.trim() || "Untitled";
  return `${chapter.sequence_index + 1} · ${title}`;
}

function lastParagraphs(prose: string): string {
  return prose.trim().split(/\n+/).slice(-3).join("\n");
}

/**
 * Prompt block for Draft. Default is the previous chapter in the list.
 * An override names the strand; None tells the model not to follow the list previous.
 */
export function formatPredecessorForDraft(chapters: Chapter[], chapter: Chapter): string {
  const resolved = resolvePredecessor(chapters, chapter);
  const linear = defaultPredecessor(chapters, chapter);
  if (!resolved) {
    return chapter.continues_from === CONTINUES_NONE && linear
      ? "This chapter opens a new strand. Do not continue the immediately previous chapter."
      : "";
  }
  const tail = lastParagraphs(resolved.prose);
  const skippedLinear = Boolean(chapter.continues_from) && linear !== undefined && resolved.id !== linear.id;
  if (skippedLinear) {
    const name = `Chapter ${resolved.sequence_index + 1}${resolved.title.trim() ? `: ${resolved.title.trim()}` : ""}`;
    return tail
      ? `This chapter continues ${name}, not the immediately previous chapter.\nEnd of that chapter:\n${tail}`
      : `This chapter continues ${name}, not the immediately previous chapter.`;
  }
  return tail ? `End of the previous chapter:\n${tail}` : "";
}

export function chapterContinuesCue(chapters: Chapter[], chapter: Chapter): string {
  if (!chapter.continues_from) return "";
  if (chapter.continues_from === CONTINUES_NONE) return "new strand";
  const from = chapters.find((item) => item.id === chapter.continues_from);
  if (!from) return "";
  return `← ${from.sequence_index + 1}`;
}

export function parseContinuesFrom(value: string): string | undefined {
  return value.trim() === "" ? undefined : value;
}
