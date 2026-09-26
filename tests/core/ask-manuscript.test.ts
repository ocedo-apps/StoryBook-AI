import { describe, expect, it } from "vitest";
import {
  askManuscriptUserPrompt,
  chapterExcerpt,
  cosineSimilarity,
  excerptWindow,
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

describe("excerptWindow", () => {
  it("returns short prose unchanged regardless of keywords", () => {
    expect(excerptWindow("Short line.", new Set(["short"]), 40)).toBe("Short line.");
  });

  it("falls back to the start of the text when no keyword appears in it at all", () => {
    const long = "filler ".repeat(80).trim();
    expect(excerptWindow(long, new Set(["missing"]), 40)).toBe(chapterExcerpt(long, 40));
  });

  it("centers the excerpt on where the keywords actually cluster, not the start of a long source", () => {
    const filler = "the ship sailed on through quiet open water for what felt like days ".repeat(20);
    const detail = "the hidden lever behind the mural opens the vault";
    const long = `${filler}${detail}${filler}`;
    const excerpt = excerptWindow(long, new Set(["lever", "mural", "vault"]), 80);
    expect(excerpt).toContain("hidden lever");
    expect(excerpt).toContain("vault");
  });
});

describe("rankBySimilarity centers excerpts on the question when given one", () => {
  it("finds a buried detail instead of always the source's opening lines", () => {
    const filler = "a quiet corridor stretched on for what felt like miles of empty hallway ".repeat(20);
    const detail = "Henrik confessed that Elin was his sister all along";
    const longSources: ManuscriptSource[] = [
      { sceneId: "ch1:scene-1", chapterId: "ch1", chapterTitle: "Long chapter", prose: `${filler}${detail}${filler}` }
    ];
    const withoutQuestion = rankBySimilarity([1], longSources, [[1]]);
    expect(withoutQuestion[0]?.excerpt).not.toContain("confessed");

    const withQuestion = rankBySimilarity([1], longSources, [[1]], 4, "Is Elin related to Henrik?");
    expect(withQuestion[0]?.excerpt).toContain("confessed");
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
