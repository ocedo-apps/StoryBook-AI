import { DEFAULT_NOTE_COLOR, type NoteColor } from "./brainstormNotes";
import { newId } from "./ids";
import { sortedChapters, touch, updateChapter, type Book, type Plotline } from "./BookSchema";

export function createPlotline(title: string, color: NoteColor = DEFAULT_NOTE_COLOR): Plotline {
  return { id: newId(), title: title.trim() || "Untitled thread", color };
}

/** Cycles through the note palette so newly added threads read distinctly at a glance. */
const PLOTLINE_PALETTE: NoteColor[] = ["rust", "sage", "gold", "lilac", "paper"];

export function addPlotline(book: Book, title: string): Book {
  const trimmed = title.trim();
  if (!trimmed) return book;
  const color = PLOTLINE_PALETTE[book.plotlines.length % PLOTLINE_PALETTE.length]!;
  return touch(book, { plotlines: [...book.plotlines, createPlotline(trimmed, color)] });
}

export function renamePlotline(book: Book, plotlineId: string, title: string): Book {
  const trimmed = title.trim();
  if (!trimmed) return book;
  return touch(book, {
    plotlines: book.plotlines.map((plotline) => (plotline.id === plotlineId ? { ...plotline, title: trimmed } : plotline))
  });
}

/** Drops the thread and un-marks it from every chapter that carried it. */
export function removePlotline(book: Book, plotlineId: string): Book {
  return touch(book, {
    plotlines: book.plotlines.filter((plotline) => plotline.id !== plotlineId),
    chapters: book.chapters.map((chapter) => {
      if (!chapter.plotline_ids?.includes(plotlineId)) return chapter;
      const next = chapter.plotline_ids.filter((id) => id !== plotlineId);
      return { ...chapter, plotline_ids: next.length > 0 ? next : undefined };
    })
  });
}

export function toggleChapterPlotline(book: Book, chapterId: string, plotlineId: string): Book {
  const chapter = book.chapters.find((item) => item.id === chapterId);
  if (!chapter) return book;
  const current = chapter.plotline_ids ?? [];
  const next = current.includes(plotlineId) ? current.filter((id) => id !== plotlineId) : [...current, plotlineId];
  return updateChapter(book, chapterId, { plotline_ids: next.length > 0 ? next : undefined });
}

export type PlotlineMatrixRow = {
  chapterId: string;
  chapterTitle: string;
  sequenceIndex: number;
  activePlotlineIds: string[];
};

/** One row per live chapter, in reading order — the matrix's left column. */
export function plotlineMatrixRows(book: Book): PlotlineMatrixRow[] {
  return sortedChapters(book).map((chapter) => ({
    chapterId: chapter.id,
    chapterTitle: chapter.title,
    sequenceIndex: chapter.sequence_index,
    activePlotlineIds: chapter.plotline_ids ?? []
  }));
}
