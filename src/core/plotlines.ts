import { DEFAULT_PLOTLINE_COLOR, PLOTLINE_COLORS, type PlotlineColor } from "./plotlineColors";
import { newId } from "./ids";
import { touch, updateChapter, type Book, type Plotline } from "./BookSchema";

export function createPlotline(title: string, color: PlotlineColor = DEFAULT_PLOTLINE_COLOR): Plotline {
  return { id: newId(), title: title.trim() || "Untitled thread", color };
}

/** Cycles through the full palette so newly added threads read distinctly at a glance; the author can still repaint any of them afterward via updatePlotline. */
export function addPlotline(book: Book, title: string): Book {
  const trimmed = title.trim();
  if (!trimmed) return book;
  const color = PLOTLINE_COLORS[book.plotlines.length % PLOTLINE_COLORS.length]!;
  return touch(book, { plotlines: [...book.plotlines, createPlotline(trimmed, color)] });
}

/**
 * The single save path for the "Edit thread" card (name, color, and the
 * optional description shown as a tooltip over the thread's name and bars).
 * A blank title is ignored (keeps the existing one); an empty description
 * clears it back to undefined rather than storing an empty string.
 */
export function updatePlotline(
  book: Book,
  plotlineId: string,
  patch: { title: string; color: PlotlineColor; description: string }
): Book {
  const trimmedTitle = patch.title.trim();
  const trimmedDescription = patch.description.trim();
  return touch(book, {
    plotlines: book.plotlines.map((plotline) =>
      plotline.id === plotlineId
        ? {
            ...plotline,
            title: trimmedTitle || plotline.title,
            color: patch.color,
            description: trimmedDescription || undefined
          }
        : plotline
    )
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
