import { describe, expect, it } from "vitest";
import { analyzeProse } from "@core/proseStats";
import { flagMixedParagraphs, splitParagraphs } from "@core/paragraphFocus";

const PACKED =
  "Jeff walked across the gravel toward the ship, each step a small surrender, for his life's work had taken him from Neptune to Venus for decades of voyages, and the horrors of space had left their mark on his soul — the cold, the silence, the metallic taste of recycled air still clinging to every breath.";

describe("splitParagraphs", () => {
  it("splits on any newline, blank or not", () => {
    expect(splitParagraphs("One line.\n\nTwo  line.\nStill two.")).toEqual(["One line.", "Two line.", "Still two."]);
  });
});

describe("flagMixedParagraphs", () => {
  it("flags a block that mixes present action, a long look back, and stacked impressions", () => {
    const flags = flagMixedParagraphs(PACKED);
    expect(flags).toHaveLength(1);
    expect(flags[0]?.layers).toEqual(["action", "backstory", "sense"]);
    expect(flags[0]?.index).toBe(0);
  });

  it("does not flag action alone", () => {
    expect(
      flagMixedParagraphs(
        "Jeff walked across the gravel toward the ship. He opened the hatch and climbed the ladder onto the deck. He sat, then stood, then reached for the switch above the lock."
      )
    ).toEqual([]);
  });

  it("does not flag action plus senses without a long look back", () => {
    expect(
      flagMixedParagraphs(
        "Jeff walked across the gravel toward the ship. The cold wind and the metallic taste of the air met him at the hatch, with silence pooling in the corridor beyond the inner door."
      )
    ).toEqual([]);
  });

  it("does not flag a long memory without present action", () => {
    expect(
      flagMixedParagraphs(
        "For decades his life's work had taken him from Neptune to Venus. Those years of voyages were the whole of his career, and the horrors of space had left their mark on his soul in the cold and the silence of recycled air."
      )
    ).toEqual([]);
  });

  it("does not flag a short incidental had-clause", () => {
    expect(
      flagMixedParagraphs(
        "Jeff walked toward the ship he had built last winter. He opened the hatch, climbed the ladder, and sat down by the lock while the crew waited in the corridor."
      )
    ).toEqual([]);
  });

  it("only flags the packed paragraph in a mixed chapter", () => {
    const flags = flagMixedParagraphs(
      `Emma locked the door and waited on the quay while the tide pulled at the piles.\n\n${PACKED}`
    );
    expect(flags).toHaveLength(1);
    expect(flags[0]?.index).toBe(1);
  });
});

describe("analyzeProse mixed paragraphs", () => {
  it("attaches packed paragraphs to the stats", () => {
    expect(analyzeProse(PACKED).mixedParagraphs).toHaveLength(1);
    expect(analyzeProse("   ").mixedParagraphs).toEqual([]);
  });
});
