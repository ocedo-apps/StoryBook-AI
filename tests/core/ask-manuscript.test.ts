import { describe, expect, it } from "vitest";
import {
  askManuscriptUserPrompt,
  chapterExcerpt,
  cosineSimilarity,
  rankByKeywordOverlap,
  rankBySimilarity,
  type ManuscriptSource
} from "@core/askManuscript";

const sources: ManuscriptSource[] = [
  { sceneId: "ch1:scene-1", chapterId: "ch1", chapterTitle: "The quay", prose: "Henrik met Elin at the quay at dawn." },
  { sceneId: "ch2:scene-1", chapterId: "ch2", chapterTitle: "The storm", prose: "The ship sank in the storm off the cape." },
  { sceneId: "ch3:scene-1", chapterId: "ch3", chapterTitle: "The return", prose: "Henrik came home alone, without Elin." }
];

describe("cosineSimilarity", () => {
  it("is 1 for identical vectors and 0 for orthogonal ones", () => {
    expect(cosineSimilarity([1, 0], [1, 0])).toBeCloseTo(1);
    expect(cosineSimilarity([1, 0], [0, 1])).toBeCloseTo(0);
  });

  it("is 0 when either vector is empty or all-zero", () => {
    expect(cosineSimilarity([], [1, 2])).toBe(0);
    expect(cosineSimilarity([0, 0], [1, 2])).toBe(0);
  });
});

describe("chapterExcerpt", () => {
  it("returns short prose unchanged", () => {
    expect(chapterExcerpt("Short line.")).toBe("Short line.");
  });

  it("truncates long prose at a word boundary with an ellipsis", () => {
    const long = "word ".repeat(80).trim();
    const excerpt = chapterExcerpt(long, 40);
    expect(excerpt.length).toBeLessThanOrEqual(41);
    expect(excerpt.endsWith("…")).toBe(true);
    expect(excerpt).not.toContain("  ");
  });
});

describe("rankBySimilarity", () => {
  it("ranks the closest embedding first and drops zero-similarity sources", () => {
    const queryEmbedding = [1, 0, 0];
    const sourceEmbeddings = [
      [1, 0, 0],
      [0, 1, 0],
      [0.9, 0.1, 0]
    ];
    const ranked = rankBySimilarity(queryEmbedding, sources, sourceEmbeddings);
    expect(ranked[0]?.chapterId).toBe("ch1");
    expect(ranked.map((e) => e.chapterId)).not.toContain("ch2");
  });

  it("respects topK", () => {
    const queryEmbedding = [1, 1, 1];
    const sourceEmbeddings = [
      [1, 1, 1],
      [1, 1, 1],
      [1, 1, 1]
    ];
    expect(rankBySimilarity(queryEmbedding, sources, sourceEmbeddings, 2)).toHaveLength(2);
  });
});

describe("rankByKeywordOverlap", () => {
  it("finds chapters sharing meaningful words with the question", () => {
    const ranked = rankByKeywordOverlap("Where did Henrik meet Elin?", sources);
    expect(ranked[0]?.chapterId).toBe("ch1");
    expect(ranked.some((e) => e.chapterId === "ch2")).toBe(false);
  });

  it("returns nothing for a question with only stop words", () => {
    expect(rankByKeywordOverlap("What is it?", sources)).toEqual([]);
  });

  it("returns nothing when no chapter shares a meaningful word", () => {
    expect(rankByKeywordOverlap("penguins volcano spreadsheet", sources)).toEqual([]);
  });
});

describe("askManuscriptUserPrompt", () => {
  it("includes the question and every evidence excerpt labelled by chapter", () => {
    const evidence = rankByKeywordOverlap("Where did Henrik meet Elin?", sources);
    const prompt = askManuscriptUserPrompt("Where did Henrik meet Elin?", evidence);
    expect(prompt).toContain("Where did Henrik meet Elin?");
    expect(prompt).toContain('Chapter "The quay"');
    expect(prompt).toContain("Henrik met Elin at the quay at dawn.");
  });
});
