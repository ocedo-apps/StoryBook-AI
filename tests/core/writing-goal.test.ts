import { describe, expect, it } from "vitest";
import { createBook, updateChapter } from "@core/BookSchema";
import { computeGoalPace, manuscriptWordCount } from "@core/writingGoal";

describe("manuscriptWordCount", () => {
  it("sums word counts across live chapters, ignoring discarded ones", () => {
    let book = createBook("Night Keys");
    book = updateChapter(book, book.chapters[0]!.id, { prose: "Emma locked the door." });
    expect(manuscriptWordCount(book)).toBe(4);
  });
});

describe("computeGoalPace", () => {
  it("computes remaining words and percent toward the target", () => {
    let book = createBook("Night Keys");
    book = updateChapter(book, book.chapters[0]!.id, { prose: "one two three four five" });
    const pace = computeGoalPace(
      book,
      { targetWords: 100, deadline: "2026-12-31", daysPerWeek: 7 },
      new Date("2026-01-01T00:00:00.000Z")
    );
    expect(pace.currentWords).toBe(5);
    expect(pace.remainingWords).toBe(95);
    expect(pace.percent).toBe(5);
    expect(pace.isOverdue).toBe(false);
  });

  it("raises the daily pace when behind schedule, rather than just showing a lower percent", () => {
    const book = createBook("Night Keys");
    const now = new Date("2026-01-01T00:00:00.000Z");
    const closeDeadline = new Date("2026-01-11T00:00:00.000Z"); // 10 days out
    const farDeadline = new Date("2026-02-10T00:00:00.000Z"); // 40 days out

    const behind = computeGoalPace(
      book,
      { targetWords: 1000, deadline: closeDeadline.toISOString(), daysPerWeek: 7 },
      now
    );
    const onTrack = computeGoalPace(
      book,
      { targetWords: 1000, deadline: farDeadline.toISOString(), daysPerWeek: 7 },
      now
    );
    expect(behind.dailyPaceNeeded).toBeGreaterThan(onTrack.dailyPaceNeeded);
  });

  it("scales remaining writing days by daysPerWeek", () => {
    const book = createBook("Night Keys");
    const now = new Date("2026-01-01T00:00:00.000Z");
    const deadline = new Date("2026-01-08T00:00:00.000Z"); // 7 calendar days out

    const everyDay = computeGoalPace(book, { targetWords: 700, deadline: deadline.toISOString(), daysPerWeek: 7 }, now);
    const threeADay = computeGoalPace(book, { targetWords: 700, deadline: deadline.toISOString(), daysPerWeek: 3 }, now);
    expect(everyDay.remainingWritingDays).toBeCloseTo(7, 5);
    expect(threeADay.remainingWritingDays).toBeCloseTo(3, 5);
    expect(threeADay.dailyPaceNeeded).toBeGreaterThan(everyDay.dailyPaceNeeded);
  });

  it("marks a goal overdue once the deadline passes without reaching the target, pace never resets silently", () => {
    const book = createBook("Night Keys");
    const now = new Date("2026-06-01T00:00:00.000Z");
    const pastDeadline = new Date("2026-05-01T00:00:00.000Z");
    const pace = computeGoalPace(book, { targetWords: 500, deadline: pastDeadline.toISOString(), daysPerWeek: 7 }, now);
    expect(pace.isOverdue).toBe(true);
    expect(pace.remainingWritingDays).toBe(0);
    expect(pace.dailyPaceNeeded).toBe(pace.remainingWords);
    expect(pace.dailyPaceNeeded).toBeGreaterThan(0);
  });

  it("never divides by zero and never goes negative once the target is reached", () => {
    let book = createBook("Night Keys");
    book = updateChapter(book, book.chapters[0]!.id, { prose: Array.from({ length: 200 }, (_, i) => `word${i}`).join(" ") });
    const pace = computeGoalPace(
      book,
      { targetWords: 100, deadline: "2026-01-01T00:00:00.000Z", daysPerWeek: 7 },
      new Date("2026-06-01T00:00:00.000Z")
    );
    expect(pace.remainingWords).toBe(0);
    expect(pace.percent).toBe(100);
    expect(pace.dailyPaceNeeded).toBe(0);
    expect(pace.isOverdue).toBe(false);
  });
});
