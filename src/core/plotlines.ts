import { DEFAULT_PLOTLINE_COLOR, PLOTLINE_COLORS, type PlotlineColor } from "./plotlineColors";
import { newId } from "./ids";
import { touch, updateChapter, type Book, type Plotline } from "./BookSchema";

export function createPlotline(title: string, color: PlotlineColor = DEFAULT_PLOTLINE_COLOR): Plotline {
  return { id: newId(), title: title.trim() || "Untitled thread", color };
}

/** Cycles through the full palette so newly added threads read distinctly at a glance; the author can still repaint any of them afterward with setPlotlineColor. */
export function addPlotline(book: Book, title: string): Book {
  const trimmed = title.trim();
  if (!trimmed) return book;
  const color = PLOTLINE_COLORS[book.plotlines.length % PLOTLINE_COLORS.length]!;
  return touch(book, { plotlines: [...book.plotlines, createPlotline(trimmed, color)] });
}

export function renamePlotline(book: Book, plotlineId: string, title: string): Book {
  const trimmed = title.trim();
  if (!trimmed) return book;
  return touch(book, {
    plotlines: book.plotlines.map((plotline) => (plotline.id === plotlineId ? { ...plotline, title: trimmed } : plotline))
  });
}

export function setPlotlineColor(book: Book, plotlineId: string, color: PlotlineColor): Book {
  return touch(book, {
    plotlines: book.plotlines.map((plotline) => (plotline.id === plotlineId ? { ...plotline, color } : plotline))
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
