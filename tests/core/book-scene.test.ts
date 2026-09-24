import { describe, expect, it } from "vitest";
import {
  chapterScenes,
  mergeSceneWithNext,
  splitSceneAtParagraph,
  updateSceneMeta
} from "@core/bookScene";
import { createChapter, type Chapter } from "@core/BookSchema";

function threeParagraphChapter(): Chapter {
  return {
    ...createChapter(0, "One"),
    prose: "The dock at dawn.\n\nA gull cried overhead.\n\nEmma untied the rope."
  };
}

describe("chapterScenes", () => {
  it("derives a single scene wrapping the chapter's prose when none is set", () => {
    const chapter = { ...createChapter(0, "One"), prose: "The dock at dawn." };
    expect(chapterScenes(chapter)).toEqual([
      { id: `${chapter.id}:scene-1`, sequence_index: 0, startParagraph: 0, prose: "The dock at dawn." }
    ]);
  });

  it("stays fresh: a later prose edit is reflected without re-deriving anything stored", () => {
    const chapter = { ...createChapter(0, "One"), prose: "Draft one." };
    const before = chapterScenes(chapter);
    const edited = { ...chapter, prose: "Draft two." };
    const after = chapterScenes(edited);
    expect(before[0]?.prose).toBe("Draft one.");
    expect(after[0]?.prose).toBe("Draft two.");
  });

  it("falls back to the derived scene when scenes is an empty array", () => {
    const chapter = { ...createChapter(0, "One"), prose: "Only prose.", scenes: [] };
    expect(chapterScenes(chapter)).toEqual([
      { id: `${chapter.id}:scene-1`, sequence_index: 0, startParagraph: 0, prose: "Only prose." }
    ]);
  });

  it("splits stored prose at the recorded paragraph boundaries", () => {
    const chapter: Chapter = {
      ...threeParagraphChapter(),
      scenes: [
        { id: "s1", startParagraph: 0, title: "The quay" },
        { id: "s2", startParagraph: 2 }
      ]
    };
    const scenes = chapterScenes(chapter);
    expect(scenes).toEqual([
      { id: "s1", sequence_index: 0, startParagraph: 0, prose: "The dock at dawn.\n\nA gull cried overhead.", title: "The quay" },
      { id: "s2", sequence_index: 1, startParagraph: 2, prose: "Emma untied the rope." }
    ]);
  });

  it("ignores a stored split past the current paragraph count instead of throwing", () => {
    const chapter: Chapter = {
      ...createChapter(0, "One"),
      prose: "Only one paragraph now.",
      scenes: [
        { id: "s1", startParagraph: 0 },
        { id: "s2", startParagraph: 5 }
      ]
    };
    expect(chapterScenes(chapter)).toEqual([
      { id: "s1", sequence_index: 0, startParagraph: 0, prose: "Only one paragraph now." }
    ]);
  });

  it("forces the first stored split back to paragraph 0 if it drifted", () => {
    const chapter: Chapter = { ...threeParagraphChapter(), scenes: [{ id: "s1", startParagraph: 1 }] };
    expect(chapterScenes(chapter)[0]).toMatchObject({ id: "s1", startParagraph: 0 });
  });
});

describe("splitSceneAtParagraph", () => {
  it("adds a new split at the given paragraph", () => {
    const chapter = threeParagraphChapter();
    const next = splitSceneAtParagraph(chapter, 1);
    expect(next).toHaveLength(2);
    expect(next[1]?.startParagraph).toBe(1);
    expect(next[0]?.startParagraph).toBe(0);
  });

  it("splits an already-split chapter into a third scene", () => {
    const chapter: Chapter = { ...threeParagraphChapter(), scenes: [{ id: "s1", startParagraph: 0 }, { id: "s2", startParagraph: 2 }] };
    const next = splitSceneAtParagraph(chapter, 1);
    expect(next.map((s) => s.startParagraph)).toEqual([0, 1, 2]);
  });

  it("no-ops at paragraph 0", () => {
    const chapter = threeParagraphChapter();
    expect(splitSceneAtParagraph(chapter, 0)).toEqual([]);
  });

  it("no-ops past the last paragraph", () => {
    const chapter = threeParagraphChapter();
    expect(splitSceneAtParagraph(chapter, 10)).toEqual([]);
  });

  it("no-ops on a paragraph that is already a scene start", () => {
    const chapter: Chapter = { ...threeParagraphChapter(), scenes: [{ id: "s1", startParagraph: 0 }, { id: "s2", startParagraph: 2 }] };
    const next = splitSceneAtParagraph(chapter, 2);
    expect(next).toEqual(chapter.scenes);
  });
});

describe("mergeSceneWithNext", () => {
  it("removes the split point after the given scene", () => {
    const chapter: Chapter = { ...threeParagraphChapter(), scenes: [{ id: "s1", startParagraph: 0 }, { id: "s2", startParagraph: 2 }] };
    expect(mergeSceneWithNext(chapter, "s1")).toEqual([{ id: "s1", startParagraph: 0 }]);
  });

  it("no-ops on the last scene — there is nothing after it to fold in", () => {
    const chapter: Chapter = { ...threeParagraphChapter(), scenes: [{ id: "s1", startParagraph: 0 }, { id: "s2", startParagraph: 2 }] };
    expect(mergeSceneWithNext(chapter, "s2")).toEqual(chapter.scenes);
  });

  it("no-ops on an unknown scene id", () => {
    const chapter: Chapter = { ...threeParagraphChapter(), scenes: [{ id: "s1", startParagraph: 0 }] };
    expect(mergeSceneWithNext(chapter, "ghost")).toEqual(chapter.scenes);
  });
});

describe("updateSceneMeta", () => {
  it("sets a title and a brief", () => {
    const chapter: Chapter = { ...threeParagraphChapter(), scenes: [{ id: "s1", startParagraph: 0 }] };
    const next = updateSceneMeta(chapter, "s1", { title: "The quay", brief: "Keep it tense." });
    expect(next[0]).toEqual({ id: "s1", startParagraph: 0, title: "The quay", brief: "Keep it tense." });
  });

  it("clears a field when given an empty string", () => {
    const chapter: Chapter = {
      ...threeParagraphChapter(),
      scenes: [{ id: "s1", startParagraph: 0, title: "The quay", brief: "Keep it tense." }]
    };
    const next = updateSceneMeta(chapter, "s1", { title: "" });
    expect(next[0]).toEqual({ id: "s1", startParagraph: 0, brief: "Keep it tense." });
  });

  it("leaves other scenes untouched", () => {
    const chapter: Chapter = { ...threeParagraphChapter(), scenes: [{ id: "s1", startParagraph: 0 }, { id: "s2", startParagraph: 2 }] };
    const next = updateSceneMeta(chapter, "s2", { title: "The rope" });
    expect(next[0]).toEqual({ id: "s1", startParagraph: 0 });
    expect(next[1]).toEqual({ id: "s2", startParagraph: 2, title: "The rope" });
  });
});
