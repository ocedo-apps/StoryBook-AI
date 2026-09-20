import { describe, expect, it } from "vitest";
import {
  ADULT_LONG_SENTENCE,
  applyReaderAge,
  formatReaderForPrompt,
  formatReaderForReview,
  parseReaderAge,
  readerCategory,
  readerTuning,
  resolveReader
} from "@core/reader";

describe("parseReaderAge", () => {
  it("keeps a whole age in range and drops the rest", () => {
    expect(parseReaderAge("12")).toBe(12);
    expect(parseReaderAge("")).toBeUndefined();
    expect(parseReaderAge("0")).toBeUndefined();
    expect(parseReaderAge("12.5")).toBeUndefined();
  });
});

describe("resolveReader", () => {
  it("inherits the manuscript until the chapter sets an age", () => {
    expect(resolveReader({ reader_age: 12 }, {})).toBe(12);
    expect(resolveReader({ reader_age: 12 }, { reader_age: 16 })).toBe(16);
    expect(resolveReader({}, {})).toBeUndefined();
  });

  it("lets a chapter clear toward adult by setting 18", () => {
    expect(resolveReader({ reader_age: 12 }, { reader_age: 18 })).toBe(18);
  });
});

describe("applyReaderAge", () => {
  it("drops the key when the field is emptied", () => {
    expect(applyReaderAge({ reader_age: 12 }, undefined)).toEqual({});
    expect(applyReaderAge({}, 12)).toEqual({ reader_age: 12 });
  });
});

describe("readerCategory", () => {
  it("maps age onto kidlit bands used for prose, not picture-book spreads", () => {
    expect(readerCategory(undefined)).toBe("adult");
    expect(readerCategory(3)).toBe("board");
    expect(readerCategory(6)).toBe("early");
    expect(readerCategory(8)).toBe("chapter");
    expect(readerCategory(12)).toBe("middle");
    expect(readerCategory(16)).toBe("ya");
    expect(readerCategory(18)).toBe("adult");
  });
});

describe("readerTuning", () => {
  it("keeps the adult long-sentence line when Reader is empty", () => {
    expect(readerTuning(undefined).longSentence).toBe(ADULT_LONG_SENTENCE);
    expect(readerTuning(40).longSentence).toBe(ADULT_LONG_SENTENCE);
    expect(readerTuning(12).longSentence).toBe(20);
    expect(readerTuning(8).longSentence).toBe(16);
  });

  it("tightens rare words for early readers and chapter books", () => {
    expect(readerTuning(12).extraSyllables).toBeUndefined();
    expect(readerTuning(8).extraSyllables).toBe(3);
    expect(readerTuning(6).extraSyllables).toBe(3);
  });

  it("retunes the three stats gauges, not only the rare-word mark", () => {
    const adult = readerTuning(undefined);
    const early = readerTuning(6);
    expect(early.directnessWeight).toBeGreaterThan(adult.directnessWeight);
    expect(early.longRun).toBeLessThan(adult.longRun);
    expect(early.plainScore).toBeGreaterThan(adult.plainScore);
    expect(readerTuning(12).plainScore).toBeGreaterThan(adult.plainScore);
  });
});

describe("formatReaderForPrompt", () => {
  it("stays silent on the adult baseline", () => {
    expect(formatReaderForPrompt(undefined)).toBe("");
    expect(formatReaderForPrompt(18)).toBe("");
  });

  it("asks for accessible diction without rewriting the story", () => {
    const body = formatReaderForPrompt(12);
    expect(body).toContain("about 12 years old");
    expect(body).toContain("middle grade");
    expect(body).toContain("child protagonist");
    expect(body).toContain("Do not simplify the story");
    expect(body).toContain("not canon");
    expect(body).not.toContain("children's book");
  });

  it("notes a chapter that leaves a younger manuscript reader", () => {
    expect(formatReaderForPrompt(18, 12)).toContain("adult reader");
    expect(formatReaderForPrompt(16, 12)).toContain("different reader");
  });
});

describe("formatReaderForReview", () => {
  it("asks Analyze not to bowdlerize", () => {
    expect(formatReaderForReview(undefined)).toBe("");
    expect(formatReaderForReview(12)).toContain("about 12");
    expect(formatReaderForReview(12)).toContain("bowdlerize");
  });
});
