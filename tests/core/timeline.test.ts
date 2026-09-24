import { describe, expect, it } from "vitest";
import { createBook, createChapter, type Book } from "@core/BookSchema";
import { moveStoryTimeOrder, timelineEntries } from "@core/timeline";

function bookWithChapters(titles: string[]): Book {
  const base = createBook("Test");
  const chapters = titles.map((title, index) => ({ ...createChapter(index, title), id: `ch${index + 1}` }));
  return { ...base, chapters };
}

describe("timelineEntries", () => {
  it("matches reading order when no story_time_order is set", () => {
    const book = bookWithChapters(["One", "Two", "Three"]);
    const entries = timelineEntries(book);
    expect(entries.map((e) => e.chapterTitle)).toEqual(["One", "Two", "Three"]);
    expect(entries.every((e) => !e.outOfOrder)).toBe(true);
  });

  it("re-sorts by story_time_order and flags chapters out of reading order", () => {
    const book = bookWithChapters(["One", "Two", "Three"]);
    book.chapters[2] = { ...book.chapters[2]!, story_time_order: 0, story_time: "Years earlier" };
    book.chapters[0] = { ...book.chapters[0]!, story_time_order: 1 };
    book.chapters[1] = { ...book.chapters[1]!, story_time_order: 2 };
    const entries = timelineEntries(book);
    expect(entries.map((e) => e.chapterTitle)).toEqual(["Three", "One", "Two"]);
    expect(entries.find((e) => e.chapterTitle === "Three")?.outOfOrder).toBe(true);
    expect(entries.find((e) => e.chapterTitle === "Three")?.storyTime).toBe("Years earlier");
  });

  it("excludes discarded chapters", () => {
    const book = bookWithChapters(["One", "Two"]);
    book.chapters[1] = { ...book.chapters[1]!, discarded_at: "2026-01-01T00:00:00.000Z" };
    expect(timelineEntries(book).map((e) => e.chapterTitle)).toEqual(["One"]);
  });
});

describe("moveStoryTimeOrder", () => {
  it("swaps a chapter with its story-time neighbor and reassigns a clean 0..N-1 ranking", () => {
    const book = bookWithChapters(["One", "Two", "Three"]);
    const moved = moveStoryTimeOrder(book, "ch2", "up");
    expect(timelineEntries(moved).map((e) => e.chapterTitle)).toEqual(["Two", "One", "Three"]);
    expect(moved.chapters.map((c) => c.story_time_order)).toEqual([1, 0, 2]);
  });

  it("does nothing when moving the first chapter up or the last chapter down", () => {
    const book = bookWithChapters(["One", "Two"]);
    expect(moveStoryTimeOrder(book, "ch1", "up")).toBe(book);
    expect(moveStoryTimeOrder(book, "ch2", "down")).toBe(book);
  });

  it("is a no-op for an unknown chapter id", () => {
    const book = bookWithChapters(["One", "Two"]);
    expect(moveStoryTimeOrder(book, "missing", "up")).toBe(book);
  });

  it("moving down then up returns to the original order", () => {
    const book = bookWithChapters(["One", "Two", "Three"]);
    const down = moveStoryTimeOrder(book, "ch1", "down");
    const backUp = moveStoryTimeOrder(down, "ch1", "up");
    expect(timelineEntries(backUp).map((e) => e.chapterTitle)).toEqual(["One", "Two", "Three"]);
  });
});
