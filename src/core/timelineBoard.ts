import type { Book } from "./BookSchema";
import { timelineEntries, type TimelineEntry } from "./timeline";

/** One column of the combined Timeline/Plotlines board: a `TimelineEntry` plus which threads this chapter is marked against. */
export type TimelineBoardColumn = TimelineEntry & {
  activePlotlineIds: string[];
};

/**
 * The shared spine for the merged Timeline/Plotlines view (roadmap-ideas.md
 * #33): chapters in story-time order (same ordering `timelineEntries`
 * already produces), each carrying its `plotline_ids` so a single table can
 * show "when" (columns, story-time order) and "what develops" (rows, one
 * per thread) at once — Plotlines' matrix laid out along Timeline's axis
 * instead of reading order.
 */
export function timelineBoardColumns(book: Book): TimelineBoardColumn[] {
  const plotlineIdsByChapter = new Map(book.chapters.map((chapter) => [chapter.id, chapter.plotline_ids ?? []]));
  return timelineEntries(book).map((entry) => ({
    ...entry,
    activePlotlineIds: plotlineIdsByChapter.get(entry.chapterId) ?? []
  }));
}
