import { describe, expect, it } from "vitest";
import { createBook, createChapter, type Book } from "@core/BookSchema";
import { addPlotline, plotlineMatrixRows, removePlotline, renamePlotline, toggleChapterPlotline } from "@core/plotlines";

function bookWithChapters(titles: string[]): Book {
  const base = createBook("Test");
  const chapters = titles.map((title, index) => ({ ...createChapter(index, title), id: `ch${index + 1}` }));
  return { ...base, chapters };
}

describe("addPlotline", () => {
  it("adds a thread with a title and a cycled color", () => {
    const book = addPlotline(bookWithChapters(["One"]), "Main plot");
    expect(book.plotlines).toHaveLength(1);
    expect(book.plotlines[0]?.title).toBe("Main plot");
    expect(book.plotlines[0]?.color).toBe("rust");

    const withSecond = addPlotline(book, "Romance");
    expect(withSecond.plotlines[1]?.color).toBe("sage");
  });

  it("ignores a blank title", () => {
    const book = bookWithChapters(["One"]);
    expect(addPlotline(book, "   ")).toBe(book);
  });
});

describe("renamePlotline", () => {
  it("renames a thread by id", () => {
    const book = addPlotline(bookWithChapters(["One"]), "Main plot");
    const id = book.plotlines[0]!.id;
    const renamed = renamePlotline(book, id, "The A plot");
    expect(renamed.plotlines[0]?.title).toBe("The A plot");
  });

  it("ignores a blank rename", () => {
    const book = addPlotline(bookWithChapters(["One"]), "Main plot");
    expect(renamePlotline(book, book.plotlines[0]!.id, "  ")).toBe(book);
  });
});

describe("removePlotline", () => {
  it("drops the thread and un-marks it from every chapter that carried it", () => {
    let book = addPlotline(bookWithChapters(["One", "Two"]), "Main plot");
    const id = book.plotlines[0]!.id;
    book = toggleChapterPlotline(book, "ch1", id);
    book = toggleChapterPlotline(book, "ch2", id);
    expect(book.chapters.every((chapter) => chapter.plotline_ids?.includes(id))).toBe(true);

    const removed = removePlotline(book, id);
    expect(removed.plotlines).toHaveLength(0);
    expect(removed.chapters.every((chapter) => chapter.plotline_ids === undefined)).toBe(true);
  });

  it("leaves other threads on a chapter untouched", () => {
    let book = addPlotline(bookWithChapters(["One"]), "Main plot");
    book = addPlotline(book, "Romance");
    const [main, romance] = book.plotlines;
    book = toggleChapterPlotline(book, "ch1", main!.id);
    book = toggleChapterPlotline(book, "ch1", romance!.id);

    const removed = removePlotline(book, main!.id);
    expect(removed.chapters[0]?.plotline_ids).toEqual([romance!.id]);
  });
});

describe("toggleChapterPlotline", () => {
  it("marks and unmarks a chapter against a thread", () => {
    const book = addPlotline(bookWithChapters(["One"]), "Main plot");
    const id = book.plotlines[0]!.id;
    const marked = toggleChapterPlotline(book, "ch1", id);
    expect(marked.chapters[0]?.plotline_ids).toEqual([id]);

    const unmarked = toggleChapterPlotline(marked, "ch1", id);
    expect(unmarked.chapters[0]?.plotline_ids).toBeUndefined();
  });

  it("is a no-op for an unknown chapter", () => {
    const book = addPlotline(bookWithChapters(["One"]), "Main plot");
    expect(toggleChapterPlotline(book, "missing", book.plotlines[0]!.id)).toBe(book);
  });
});

describe("plotlineMatrixRows", () => {
  it("returns one row per live chapter, in reading order, with its active threads", () => {
    let book = addPlotline(bookWithChapters(["One", "Two", "Three"]), "Main plot");
    const id = book.plotlines[0]!.id;
    book = toggleChapterPlotline(book, "ch2", id);
    book.chapters[2] = { ...book.chapters[2]!, discarded_at: "2026-09-20T00:00:00.000Z" };

    const rows = plotlineMatrixRows(book);
    expect(rows.map((row) => row.chapterTitle)).toEqual(["One", "Two"]);
    expect(rows[0]?.activePlotlineIds).toEqual([]);
    expect(rows[1]?.activePlotlineIds).toEqual([id]);
  });
});
