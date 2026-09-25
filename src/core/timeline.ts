import { isLiveChapter, touch, type Book, type Chapter } from "./BookSchema";

/**
 * One live chapter, positioned on both clocks: `sequenceIndex` is where it
 * sits in the manuscript (reading order), `storyTimeRank` is where it sits
 * once sorted by story time — the open question from project_spec.md §11
 * ("sequence_index is book order, not the RPG's story-clock") made visible.
 */
export type TimelineEntry = {
  chapterId: string;
  chapterTitle: string;
  sequenceIndex: number;
  storyTime: string;
  storyTimeOrder: number;
  storyTimeRank: number;
  /** True when this chapter's story-time position differs from its reading position — a flashback/flashforward. */
  outOfOrder: boolean;
};

function rawEntries(chapters: Chapter[]): Omit<TimelineEntry, "storyTimeRank" | "outOfOrder">[] {
  return chapters
    .filter(isLiveChapter)
    .sort((a, b) => a.sequence_index - b.sequence_index)
    .map((chapter) => ({
      chapterId: chapter.id,
      chapterTitle: chapter.title,
      sequenceIndex: chapter.sequence_index,
      storyTime: chapter.story_time ?? "",
      storyTimeOrder: chapter.story_time_order ?? chapter.sequence_index
    }));
}

/** The Timeline: live chapters sorted by story time, each flagged if that differs from reading order. */
export function timelineEntries(book: Book): TimelineEntry[] {
  const base = rawEntries(book.chapters); // already reading-order sorted
  const readingRank = new Map(base.map((entry, index) => [entry.chapterId, index]));
  const byStoryTime = [...base].sort(
    (a, b) => a.storyTimeOrder - b.storyTimeOrder || a.sequenceIndex - b.sequenceIndex
  );
  return byStoryTime.map((entry, index) => ({
    ...entry,
    storyTimeRank: index,
    outOfOrder: readingRank.get(entry.chapterId) !== index
  }));
}

/**
 * chapterId -> storyTimeRank, for callers that need to compare two
 * chapters' story-time positions (e.g. "was this fact established before
 * or after the chapter I'm now writing, in story time") without pulling in
 * the rest of `timelineEntries()`'s output.
 */
export function storyTimeRankByChapterId(book: Book): Map<string, number> {
  return new Map(timelineEntries(book).map((entry) => [entry.chapterId, entry.storyTimeRank]));
}

/**
 * Swaps a chapter with its story-time neighbor and reassigns every live
 * chapter's `story_time_order` to a fresh, consistent 0..N-1 ranking —
 * the only place that field is ever written.
 */
export function moveStoryTimeOrder(book: Book, chapterId: string, direction: "up" | "down"): Book {
  const ordered = rawEntries(book.chapters).sort(
    (a, b) => a.storyTimeOrder - b.storyTimeOrder || a.sequenceIndex - b.sequenceIndex
  );
  const index = ordered.findIndex((entry) => entry.chapterId === chapterId);
  if (index < 0) return book;
  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (swapWith < 0 || swapWith >= ordered.length) return book;

  const reordered = [...ordered];
  [reordered[index], reordered[swapWith]] = [reordered[swapWith]!, reordered[index]!];
  const orderById = new Map(reordered.map((entry, position) => [entry.chapterId, position]));

  return touch(book, {
    chapters: book.chapters.map((chapter) => {
      const order = orderById.get(chapter.id);
      return order === undefined ? chapter : { ...chapter, story_time_order: order };
    })
  });
}
