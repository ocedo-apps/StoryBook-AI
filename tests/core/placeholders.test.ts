import { describe, expect, it } from "vitest";
import {
  addPlaceholder,
  collectPlaceholders,
  createPlaceholder,
  diffEditRange,
  removePlaceholder,
  shiftPlaceholders,
  updatePlaceholderNote,
  type Placeholder
} from "@core/placeholders";

function point(at: number, note = "", id = `p-${at}`): Placeholder {
  return { id, at, note, created_at: "2026-01-01T00:00:00.000Z" };
}

describe("createPlaceholder", () => {
  it("clamps a negative offset to zero", () => {
    expect(createPlaceholder(-5, "note").at).toBe(0);
  });

  it("gives every placeholder its own id", () => {
    const a = createPlaceholder(1, "a");
    const b = createPlaceholder(1, "b");
    expect(a.id).not.toBe(b.id);
  });
});

describe("addPlaceholder / removePlaceholder / updatePlaceholderNote", () => {
  it("adds a placeholder and keeps the list sorted by position", () => {
    const list = addPlaceholder(addPlaceholder([], 20, "later"), 5, "earlier");
    expect(list.map((item) => item.at)).toEqual([5, 20]);
    expect(list.map((item) => item.note)).toEqual(["earlier", "later"]);
  });

  it("removes exactly the matching id", () => {
    const a = point(1, "a", "a");
    const b = point(2, "b", "b");
    expect(removePlaceholder([a, b], "a")).toEqual([b]);
  });

  it("updates only the matching note, leaving position and id untouched", () => {
    const a = point(1, "old", "a");
    const next = updatePlaceholderNote([a], "a", "new");
    expect(next).toEqual([{ ...a, note: "new" }]);
  });
});

describe("shiftPlaceholders", () => {
  it("leaves a placeholder entirely before the edit untouched", () => {
    expect(shiftPlaceholders([point(5)], 10, 12, 3)).toEqual([point(5)]);
  });

  it("shifts a placeholder after the edit by the length delta", () => {
    // replace 2 chars with 5 -> delta +3
    expect(shiftPlaceholders([point(20)], 10, 12, 5)).toEqual([{ ...point(20), at: 23 }]);
  });

  it("drops a placeholder swallowed by the edit", () => {
    expect(shiftPlaceholders([point(12)], 10, 15, 0)).toEqual([]);
  });

  it("keeps a placeholder sitting exactly at the edit's start", () => {
    expect(shiftPlaceholders([point(10)], 10, 15, 0)).toEqual([point(10)]);
  });

  it("shifts a placeholder sitting exactly at the edit's end", () => {
    // delete 5 chars (10..15), insert nothing -> delta -5
    expect(shiftPlaceholders([point(15)], 10, 15, 0)).toEqual([{ ...point(15), at: 10 }]);
  });

  it("handles a pure insertion (editStart === editEnd) after the point", () => {
    expect(shiftPlaceholders([point(20)], 10, 10, 4)).toEqual([{ ...point(20), at: 24 }]);
  });
});

describe("diffEditRange", () => {
  it("finds a single inserted character mid-string", () => {
    expect(diffEditRange("abd", "abcd")).toEqual({ editStart: 2, editEnd: 2, insertedLength: 1 });
  });

  it("finds a single deleted character mid-string", () => {
    expect(diffEditRange("abcd", "abd")).toEqual({ editStart: 2, editEnd: 3, insertedLength: 0 });
  });

  it("reports no edit for identical strings", () => {
    expect(diffEditRange("same", "same")).toEqual({ editStart: 4, editEnd: 4, insertedLength: 0 });
  });

  it("finds a replacement in the middle, not swallowing unrelated matching text", () => {
    expect(diffEditRange("the cat sat", "the dog sat")).toEqual({ editStart: 4, editEnd: 7, insertedLength: 3 });
  });
});

describe("collectPlaceholders", () => {
  it("collects placeholders across chapters in the given order, chapter by chapter", () => {
    const chapters = [
      { id: "c1", title: "One", placeholders: [point(1, "a", "a")] },
      { id: "c2", title: "Two", placeholders: [] },
      { id: "c3", title: "Three", placeholders: [point(2, "b", "b"), point(5, "c", "c")] }
    ];
    expect(collectPlaceholders(chapters)).toEqual([
      { chapterId: "c1", chapterTitle: "One", placeholder: point(1, "a", "a") },
      { chapterId: "c3", chapterTitle: "Three", placeholder: point(2, "b", "b") },
      { chapterId: "c3", chapterTitle: "Three", placeholder: point(5, "c", "c") }
    ]);
  });

  it("treats a missing placeholders field as none", () => {
    expect(collectPlaceholders([{ id: "c1", title: "One" }])).toEqual([]);
  });
});
