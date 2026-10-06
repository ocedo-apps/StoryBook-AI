import { describe, expect, it } from "vitest";
import { SUMMARIZE_CHAPTER_SYSTEM, summarizeChapterUserPrompt } from "@core/chapterSummary";

describe("summarizeChapterUserPrompt", () => {
  it("includes the chapter title and prose", () => {
    const prompt = summarizeChapterUserPrompt({ title: "The quay", prose: "Henrik locked the door." });
    expect(prompt).toContain("Chapter: The quay");
    expect(prompt).toContain("Henrik locked the door.");
  });

  it("falls back to Untitled for a chapter with no title", () => {
    const prompt = summarizeChapterUserPrompt({ title: "   ", prose: "Henrik locked the door." });
    expect(prompt).toContain("Chapter: Untitled");
  });

  it("strips a model aside glued into the prose before summarizing", () => {
    const prompt = summarizeChapterUserPrompt({
      title: "The quay",
      prose: '(Note: tightened the opening.)Henrik locked the door.'
    });
    expect(prompt).not.toContain("Note:");
    expect(prompt).toContain("Henrik locked the door.");
  });
});

describe("SUMMARIZE_CHAPTER_SYSTEM", () => {
  it("asks for a short, plain digest — not a blurb, not JSON", () => {
    expect(SUMMARIZE_CHAPTER_SYSTEM).toContain("2-4 sentences");
    expect(SUMMARIZE_CHAPTER_SYSTEM).not.toContain("JSON");
  });
});
