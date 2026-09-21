import { describe, expect, it } from "vitest";
import { flagPhraseReuse } from "@core/phraseReuse";

const CLAUSE = "i was starting to think i'd have to navigate this";

describe("flagPhraseReuse", () => {
  it("flags a long shared run even when the rest of the paragraphs differ", () => {
    const text = [
      `Rain hit the deck. ${CLAUSE} before the lock gave.`,
      `Emma counted the keys. The quay stayed quiet and the lamps had already gone out for the night. ${CLAUSE} and then she waited.`
    ].join("\n\n");
    const hits = flagPhraseReuse(text);
    expect(hits.some((hit) => hit.phrase.toLowerCase().includes("starting to think") && hit.run >= 6)).toBe(true);
    expect(hits[0]?.paragraphs).toEqual([0, 1]);
  });

  it("does not flag a short shared fragment", () => {
    const hits = flagPhraseReuse("She looked at the lock.\n\nShe looked at the quay.");
    expect(hits).toEqual([]);
  });

  it("does not flag the same idea said with different words", () => {
    const hits = flagPhraseReuse(
      "Her slender fingers dancing across the keys.\n\nHer thin fingers moved over the piano."
    );
    expect(hits).toEqual([]);
  });

  it("still flags when the paragraphs are far apart", () => {
    const filler = Array.from({ length: 8 }, (_, i) => `Keep moving along the quay number ${i} with the night keys in hand.`).join(
      "\n\n"
    );
    const hits = flagPhraseReuse(`Emma paused. ${CLAUSE}.\n\n${filler}\n\nThe stranger waited. ${CLAUSE}.`);
    expect(hits.some((hit) => hit.run >= 6 && hit.paragraphs.includes(0) && hit.paragraphs.at(-1) !== 1)).toBe(true);
  });

  it("merges the same clause across more than two paragraphs", () => {
    const hits = flagPhraseReuse(`${CLAUSE}.\n\nRain.\n\n${CLAUSE}.\n\nWind.\n\n${CLAUSE}.`);
    const hit = hits.find((item) => item.run >= 6);
    expect(hit?.paragraphs).toEqual([0, 2, 4]);
  });

  it("ignores a long glue run with no content words", () => {
    expect(flagPhraseReuse("And then he went to the door.\n\nAnd then he went to the lock.")).toEqual([]);
  });

  it("returns nothing for empty prose", () => {
    expect(flagPhraseReuse("   ")).toEqual([]);
  });
});
