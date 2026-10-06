import { describe, expect, it } from "vitest";
import { collectDarlings, cutToDarling, discardDarling, restoreDarling, shiftDarlings, type Darling } from "@core/darlings";

function darling(at: number, text: string, id = `d-${at}`): Darling {
  return { id, at, text, created_at: "2026-01-01T00:00:00.000Z" };
}

describe("shiftDarlings", () => {
  it("leaves a darling entirely before the edit untouched", () => {
    expect(shiftDarlings([darling(5, "x")], 10, 12, 3)).toEqual([darling(5, "x")]);
  });

  it("shifts a darling after the edit by the length delta", () => {
    expect(shiftDarlings([darling(20, "x")], 10, 12, 5)).toEqual([{ ...darling(20, "x"), at: 23 }]);
  });

  it("drops a darling swallowed by the edit", () => {
    expect(shiftDarlings([darling(12, "x")], 10, 15, 0)).toEqual([]);
  });

  it("keeps a darling sitting exactly at the edit's start", () => {
    expect(shiftDarlings([darling(10, "x")], 10, 15, 0)).toEqual([darling(10, "x")]);
  });

  it("shifts a darling sitting exactly at the edit's end", () => {
    expect(shiftDarlings([darling(15, "x")], 10, 15, 0)).toEqual([{ ...darling(15, "x"), at: 10 }]);
  });
});

describe("cutToDarling", () => {
  it("removes the span from prose and keeps it as a new darling at that spot", () => {
    const result = cutToDarling("The quick brown fox jumps.", { start: 4, end: 16 }, []);
    expect(result.prose).toBe("The fox jumps.");
    expect(result.darlings).toHaveLength(1);
    expect(result.darlings[0]).toMatchObject({ at: 4, text: "quick brown " });
  });

  it("shifts existing darlings around the cut like any other edit", () => {
    const before = [darling(20, "later")];
    const result = cutToDarling("The quick brown fox jumps.", { start: 4, end: 16 }, before);
    expect(result.darlings.find((item) => item.id === "d-20")).toMatchObject({ at: 8 });
  });

  it("normalizes a reversed span", () => {
    const result = cutToDarling("abcdef", { start: 4, end: 1 }, []);
    expect(result.prose).toBe("aef");
    expect(result.darlings[0]?.text).toBe("bcd");
  });
});

describe("restoreDarling", () => {
  it("splices the darling's text back in at its tracked spot", () => {
    const result = restoreDarling("The  fox jumps.", [darling(4, "quick brown ")], "d-4");
    expect(result?.prose).toBe("The quick brown  fox jumps.");
    expect(result?.darlings).toEqual([]);
  });

  it("returns null for an unknown id", () => {
    expect(restoreDarling("abc", [darling(0, "x")], "missing")).toBeNull();
  });

  it("clamps a stale position to the current prose length", () => {
    const result = restoreDarling("short", [darling(999, "TAIL")], "d-999");
    expect(result?.prose).toBe("shortTAIL");
  });

  it("shifts remaining darlings around the restored insertion", () => {
    const result = restoreDarling("ab", [darling(0, "XY"), darling(2, "later")], "d-0");
    expect(result?.prose).toBe("XYab");
    expect(result?.darlings).toEqual([{ ...darling(2, "later"), at: 4 }]);
  });
});

describe("discardDarling", () => {
  it("removes exactly the matching id", () => {
    const a = darling(1, "a", "a");
    const b = darling(2, "b", "b");
    expect(discardDarling([a, b], "a")).toEqual([b]);
  });
});

describe("collectDarlings", () => {
  it("collects darlings across chapters, newest first within a chapter", () => {
    const older: Darling = { ...darling(1, "a", "a"), created_at: "2026-01-01T00:00:00.000Z" };
    const newer: Darling = { ...darling(2, "b", "b"), created_at: "2026-01-02T00:00:00.000Z" };
    const chapters = [
      { id: "c1", title: "One", darlings: [older, newer] },
      { id: "c2", title: "Two", darlings: [] }
    ];
    expect(collectDarlings(chapters)).toEqual([
      { chapterId: "c1", chapterTitle: "One", darling: newer },
      { chapterId: "c1", chapterTitle: "One", darling: older }
    ]);
  });

  it("treats a missing darlings field as none", () => {
    expect(collectDarlings([{ id: "c1", title: "One" }])).toEqual([]);
  });
});
