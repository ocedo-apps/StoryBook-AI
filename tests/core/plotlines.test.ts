import { describe, expect, it } from "vitest";
import { createBook, createChapter, type Book } from "@core/BookSchema";
import { addPlotline, plotlinesForChapter, removePlotline, toggleChapterPlotline, updatePlotline } from "@core/plotlines";

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
    expect(book.plotlines[0]?.color).toBe("lime");

    const withSecond = addPlotline(book, "Romance");
    expect(withSecond.plotlines[1]?.color).toBe("green");
  });

  it("ignores a blank title", () => {
    const book = bookWithChapters(["One"]);
    expect(addPlotline(book, "   ")).toBe(book);
  });
});

describe("updatePlotline", () => {
  it("saves title, color, description, and hideFromAi together, leaving other threads untouched", () => {
    let book = addPlotline(bookWithChapters(["One"]), "Main plot");
    book = addPlotline(book, "Romance");
    const [main, romance] = book.plotlines;

    const saved = updatePlotline(book, main!.id, {
      title: "The A plot",
      color: "charcoal",
      description: "The core conflict.",
      hideFromAi: true
    });
    expect(saved.plotlines[0]).toMatchObject({
      title: "The A plot",
      color: "charcoal",
      description: "The core conflict.",
      hide_from_ai: true
    });
    expect(saved.plotlines[1]?.color).toBe(romance!.color);
  });

  it("keeps the existing title when the given one is blank", () => {
    const book = addPlotline(bookWithChapters(["One"]), "Main plot");
    const id = book.plotlines[0]!.id;
    const saved = updatePlotline(book, id, { title: "   ", color: "grey", description: "", hideFromAi: false });
    expect(saved.plotlines[0]?.title).toBe("Main plot");
  });

  it("clears the description back to undefined when saved blank", () => {
    let book = addPlotline(bookWithChapters(["One"]), "Main plot");
    const id = book.plotlines[0]!.id;
    book = updatePlotline(book, id, { title: "Main plot", color: "grey", description: "A note.", hideFromAi: false });
    expect(book.plotlines[0]?.description).toBe("A note.");

    const cleared = updatePlotline(book, id, { title: "Main plot", color: "grey", description: "   ", hideFromAi: false });
    expect(cleared.plotlines[0]?.description).toBeUndefined();
  });

  it("stores hide_from_ai as undefined rather than false, and can turn it back off", () => {
    let book = addPlotline(bookWithChapters(["One"]), "Main plot");
    const id = book.plotlines[0]!.id;
    book = updatePlotline(book, id, { title: "Main plot", color: "grey", description: "", hideFromAi: true });
    expect(book.plotlines[0]?.hide_from_ai).toBe(true);

    const reenabled = updatePlotline(book, id, { title: "Main plot", color: "grey", description: "", hideFromAi: false });
    expect(reenabled.plotlines[0]?.hide_from_ai).toBeUndefined();
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

describe("plotlinesForChapter", () => {
  it("returns only the threads this chapter is tagged against, regardless of hide_from_ai", () => {
    let book = addPlotline(bookWithChapters(["One"]), "Main plot");
    book = addPlotline(book, "Romance");
    const [main, romance] = book.plotlines;
    book = updatePlotline(book, romance!.id, { title: romance!.title, color: romance!.color, description: "", hideFromAi: true });
    book = toggleChapterPlotline(book, "ch1", main!.id);
    book = toggleChapterPlotline(book, "ch1", romance!.id);

    const active = plotlinesForChapter(book, book.chapters[0]!);
    expect(active.map((plotline) => plotline.title)).toEqual(["Main plot", "Romance"]);
  });

  it("returns an empty list for an untagged chapter", () => {
    const book = addPlotline(bookWithChapters(["One"]), "Main plot");
    expect(plotlinesForChapter(book, book.chapters[0]!)).toEqual([]);
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
