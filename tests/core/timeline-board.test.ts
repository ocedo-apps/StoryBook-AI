import { describe, expect, it } from "vitest";
import { createBook, createChapter, type Book } from "@core/BookSchema";
import { addPlotline, toggleChapterPlotline } from "@core/plotlines";
import { timelineBoardColumns } from "@core/timelineBoard";

function bookWithChapters(titles: string[]): Book {
  const base = createBook("Test");
  const chapters = titles.map((title, index) => ({ ...createChapter(index, title), id: `ch${index + 1}` }));
  return { ...base, chapters };
}

describe("timelineBoardColumns", () => {
  it("attaches each column's active plotline ids, in story-time order", () => {
    let book = bookWithChapters(["One", "Two", "Three"]);
    book = addPlotline(book, "Main plot");
    const id = book.plotlines[0]!.id;
    book = toggleChapterPlotline(book, "ch2", id);
    book.chapters[2] = { ...book.chapters[2]!, story_time_order: 0 };
    book.chapters[0] = { ...book.chapters[0]!, story_time_order: 1 };
    book.chapters[1] = { ...book.chapters[1]!, story_time_order: 2 };

    const columns = timelineBoardColumns(book);
    expect(columns.map((c) => c.chapterTitle)).toEqual(["Three", "One", "Two"]);
    expect(columns.find((c) => c.chapterTitle === "Two")?.activePlotlineIds).toEqual([id]);
    expect(columns.find((c) => c.chapterTitle === "One")?.activePlotlineIds).toEqual([]);
  });

  it("returns an empty list for a book with no live chapters", () => {
    expect(timelineBoardColumns(bookWithChapters([]))).toEqual([]);
  });

  it("excludes discarded chapters, matching timelineEntries", () => {
    const book = bookWithChapters(["One", "Two"]);
    book.chapters[1] = { ...book.chapters[1]!, discarded_at: "2026-01-01T00:00:00.000Z" };
    expect(timelineBoardColumns(book).map((c) => c.chapterTitle)).toEqual(["One"]);
  });
});
