import { sortedChapters, touch, type Book, type Chapter } from "./BookSchema";

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
    if (named && named.id !== chapter.id && named.sequence_index < chapter.sequence_index) return named;
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
  if (!from || from.sequence_index >= chapter.sequence_index) return "";
  return `← ${from.sequence_index + 1}`;
}

export type NamedStrandLink = {
  sourceId: string;
  continuerId: string;
};

export function namedStrandLinks(chapters: Chapter[]): NamedStrandLink[] {
  const byId = new Map(chapters.map((chapter) => [chapter.id, chapter]));
  const links: NamedStrandLink[] = [];
  for (const chapter of chapters) {
    const pin = chapter.continues_from;
    if (!pin || pin === CONTINUES_NONE) continue;
    const source = byId.get(pin);
    if (!source || source.id === chapter.id || source.sequence_index >= chapter.sequence_index) continue;
    links.push({ sourceId: source.id, continuerId: chapter.id });
  }
  return links;
}

export function strandLinksForChapter(chapters: Chapter[], chapterId: string): NamedStrandLink[] {
  return namedStrandLinks(chapters).filter(
    (link) => link.sourceId === chapterId || link.continuerId === chapterId
  );
}

export type ClearedContinue = {
  chapterId: string;
  title: string;
  fromTitle: string;
};

export function dropForwardContinues(chapters: Chapter[]): { chapters: Chapter[]; cleared: ClearedContinue[] } {
  const byId = new Map(chapters.map((chapter) => [chapter.id, chapter]));
  const cleared: ClearedContinue[] = [];
  const next = chapters.map((chapter) => {
    const pin = chapter.continues_from;
    if (!pin || pin === CONTINUES_NONE) return chapter;
    const target = byId.get(pin);
    if (target && target.sequence_index < chapter.sequence_index) return chapter;
    cleared.push({
      chapterId: chapter.id,
      title: chapter.title,
      fromTitle: target?.title ?? ""
    });
    const copy: Chapter = { ...chapter };
    delete copy.continues_from;
    return copy;
  });
  return { chapters: next, cleared };
}

/** Move a chapter to `toIndex` in list order. Named Continues-from pins that would point forward are cleared. */
export function moveChapter(
  book: Book,
  chapterId: string,
  toIndex: number
): { book: Book; cleared: ClearedContinue[] } {
  const sorted = sortedChapters(book);
  const fromIndex = sorted.findIndex((chapter) => chapter.id === chapterId);
  if (fromIndex < 0) return { book, cleared: [] };
  const clamped = Math.max(0, Math.min(Math.trunc(toIndex), sorted.length - 1));
  if (fromIndex === clamped) return { book, cleared: [] };

  const next = [...sorted];
  const [moved] = next.splice(fromIndex, 1);
  if (!moved) return { book, cleared: [] };
  next.splice(clamped, 0, moved);

  const reindexed = next.map((chapter, index) =>
    chapter.sequence_index === index ? chapter : { ...chapter, sequence_index: index }
  );
  const { chapters, cleared } = dropForwardContinues(reindexed);
  return { book: touch(book, { chapters }), cleared };
}

/** Final list index after dropping onto `overIndex`, before or after that row. */
export function reorderDropIndex(fromIndex: number, overIndex: number, placeAfter: boolean): number {
  if (fromIndex < 0 || overIndex < 0) return fromIndex;
  let insertAt = placeAfter ? overIndex + 1 : overIndex;
  if (fromIndex < insertAt) insertAt -= 1;
  return insertAt;
}

export function parseContinuesFrom(value: string): string | undefined {
  return value.trim() === "" ? undefined : value;
}
