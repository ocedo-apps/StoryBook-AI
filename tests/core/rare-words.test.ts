import { describe, expect, it } from "vitest";
import { findRareHits, isFamiliarWord, tallyRareWords } from "@core/rareWords";

describe("isFamiliarWord", () => {
  it("treats Dale–Chall words and simple inflections as familiar", () => {
    expect(isFamiliarWord("night")).toBe(true);
    expect(isFamiliarWord("keys")).toBe(true);
    expect(isFamiliarWord("keeps")).toBe(true);
  });

  it("treats words off the familiar list as rare", () => {
    expect(isFamiliarWord("angular")).toBe(false);
    expect(isFamiliarWord("quay")).toBe(false);
  });
});

describe("findRareHits", () => {
  it("skips bible names so a ship or person is not flagged", () => {
    const hits = findRareHits("Emma watched the Odyssey from the quay.", ["Emma", "the Odyssey"]);
    expect(hits.map((hit) => hit.word.toLowerCase())).toEqual(["quay"]);
  });

  it("skips possessives of names, even when they are not in the bible yet", () => {
    const hits = findRareHits("across Jeff's angular face as the Odyssey's bridge glowed");
    expect(hits.map((hit) => hit.word.toLowerCase())).toEqual(["angular"]);
  });

  it("skips curly apostrophe possessives", () => {
    const hits = findRareHits("Jeff’s hands. The Odyssey’s hull.");
    expect(hits.some((hit) => /^jeff/i.test(hit.word))).toBe(false);
    expect(hits.some((hit) => /^odyssey/i.test(hit.word))).toBe(false);
  });

  it("finds nothing in plain familiar prose", () => {
    expect(findRareHits("The cat sat on the mat.").length).toBe(0);
  });

  it("can treat long familiar words as rare for younger readers", () => {
    const text = "The family sat on the mat.";
    expect(findRareHits(text).some((hit) => hit.word.toLowerCase() === "family")).toBe(false);
    expect(findRareHits(text, [], { extraSyllables: 3 }).some((hit) => hit.word.toLowerCase() === "family")).toBe(
      true
    );
  });
});

describe("tallyRareWords", () => {
  it("counts repeats of the same rare word", () => {
    const tally = tallyRareWords("The angular face. The angular light.");
    expect(tally.count).toBe(2);
    expect(tally.unique[0]).toEqual({ word: "angular", count: 2 });
  });
});
