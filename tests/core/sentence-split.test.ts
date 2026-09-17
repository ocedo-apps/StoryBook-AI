import { describe, expect, it } from "vitest";
import { parseSplitSuggestion, replaceCollapsedSentence } from "@core/sentenceSplit";
import { analyzeProse } from "@core/proseStats";

describe("parseSplitSuggestion", () => {
  it("reads the split field and ignores the original wording", () => {
    const original = "The dim glow of the bridge cast long shadows across his face.";
    expect(
      parseSplitSuggestion(
        '{"split":"The dim glow of the bridge cast long shadows. His face caught them."}',
        original
      )
    ).toBe("The dim glow of the bridge cast long shadows. His face caught them.");
  });

  it("joins a split array", () => {
    const original = "The dim glow of the bridge cast long shadows across his face.";
    expect(
      parseSplitSuggestion(
        '{"split":["The dim glow of the bridge cast long shadows.","His face caught them."]}',
        original
      )
    ).toBe("The dim glow of the bridge cast long shadows. His face caught them.");
  });

  it("returns empty when the model echoes the sentence", () => {
    const original = "She stopped.";
    expect(parseSplitSuggestion('{"split":"She stopped."}', original)).toBe("");
  });
});

describe("replaceCollapsedSentence", () => {
  it("replaces a sentence even when the source has extra line breaks", () => {
    const source = "She waited.\n\nThe dim glow of the bridge cast long shadows.\nHe left.";
    const next = replaceCollapsedSentence(
      source,
      "The dim glow of the bridge cast long shadows.",
      "The dim glow of the bridge cast long shadows. Night held."
    );
    expect(next).toContain("Night held.");
    expect(next).toContain("She waited.");
  });
});

describe("analyzeProse sentences", () => {
  it("keeps sentence text aligned with the bars", () => {
    const stats = analyzeProse("Stop. The long descriptive sentence goes on and on.");
    expect(stats.sentenceTexts).toHaveLength(2);
    expect(stats.sentenceLengths).toHaveLength(2);
    expect(stats.sentenceTexts[0]).toBe("Stop.");
  });
});
