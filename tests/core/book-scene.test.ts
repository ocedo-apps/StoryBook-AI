import { describe, expect, it } from "vitest";
import { chapterScenes } from "@core/bookScene";
import { createChapter } from "@core/BookSchema";

describe("chapterScenes", () => {
  it("derives a single scene wrapping the chapter's prose when none is set", () => {
    const chapter = { ...createChapter(0, "One"), prose: "The dock at dawn." };
    expect(chapterScenes(chapter)).toEqual([{ id: `${chapter.id}:scene-1`, sequence_index: 0, prose: "The dock at dawn." }]);
  });

  it("stays fresh: a later prose edit is reflected without re-deriving anything stored", () => {
    const chapter = { ...createChapter(0, "One"), prose: "Draft one." };
    const before = chapterScenes(chapter);
    const edited = { ...chapter, prose: "Draft two." };
    const after = chapterScenes(edited);
    expect(before[0]?.prose).toBe("Draft one.");
    expect(after[0]?.prose).toBe("Draft two.");
  });

  it("returns the chapter's explicit scenes verbatim once they exist", () => {
    const chapter = {
      ...createChapter(0, "One"),
      prose: "ignored once scenes exist",
      scenes: [
        { id: "s1", sequence_index: 0, prose: "First beat." },
        { id: "s2", sequence_index: 1, prose: "Second beat." }
      ]
    };
    expect(chapterScenes(chapter)).toEqual(chapter.scenes);
  });

  it("falls back to the derived scene when scenes is an empty array", () => {
    const chapter = { ...createChapter(0, "One"), prose: "Only prose.", scenes: [] };
    expect(chapterScenes(chapter)).toEqual([{ id: `${chapter.id}:scene-1`, sequence_index: 0, prose: "Only prose." }]);
  });
});
