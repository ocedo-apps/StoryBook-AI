import { describe, expect, it } from "vitest";
import {
  analyzeProse,
  countSyllables,
  countWords,
  entityNameTokens,
  fleschReadingEase,
  splitSentences
} from "@core/proseStats";

describe("countWords", () => {
  it("counts tokens, including contractions", () => {
    expect(countWords("Emma didn't look back.")).toBe(4);
    expect(countWords("")).toBe(0);
  });
});

describe("splitSentences", () => {
  it("keeps a tag plus a name as one sentence", () => {
    expect(splitSentences("Mr. Smith left the quay.")).toEqual(["Mr. Smith left the quay."]);
  });

  it("does not split when the next word is lowercase after a quote", () => {
    const sentences = splitSentences('"Go!" she yelled. He ran.');
    expect(sentences).toHaveLength(2);
    expect(sentences[0]).toContain("she yelled");
  });

  it("splits on a real stop", () => {
    expect(splitSentences("She stopped. He ran.")).toHaveLength(2);
  });
});

describe("analyzeProse", () => {
  it("returns an empty profile for a blank page", () => {
    const stats = analyzeProse("   ");
    expect(stats.words).toBe(0);
    expect(stats.profile.id).toBe("empty");
  });

  it("measures dialogue share from quoted speech", () => {
    const stats = analyzeProse('"Stay." She locked the door.');
    expect(stats.dialogueShare).toBeGreaterThan(0.15);
    expect(stats.dialogueShare).toBeLessThan(0.5);
  });

  it("treats mixed sentence lengths as mixed pacing", () => {
    const stats = analyzeProse(
      "Stop. Now. The dim glow of the Odyssey's bridge cast long shadows across Jeff's angular face as his eyes narrowed, focusing on the readout while the crew held their breath."
    );
    expect(stats.mix).toBe("mixed");
    expect(stats.sentenceMin).toBeLessThanOrEqual(2);
    expect(stats.sentenceMax).toBeGreaterThanOrEqual(20);
  });

  it("flags uniformly short sentences as choppy", () => {
    const stats = analyzeProse("He ran. She hid. Doors slammed. Lights died. Nobody spoke. The quay waited.");
    expect(stats.mix).toBe("choppy");
  });

  it("counts manner adverbs and skips family", () => {
    const stats = analyzeProse("She slowly opened the family door. He quickly sat.");
    expect(stats.adverbCount).toBe(2);
  });

  it("counts a possible passive", () => {
    const stats = analyzeProse("The rope was dragged by the tide. Emma watched.");
    expect(stats.passiveCount).toBeGreaterThanOrEqual(1);
  });

  it("does not let repeated names tank variety or inflate long words", () => {
    const names = entityNameTokens(["Emma", "the Odyssey"]);
    const withNames = analyzeProse(
      "Emma walked the Odyssey. Emma watched the Odyssey. Emma left the Odyssey after the quiet watch.",
      names
    );
    const withoutFilter = analyzeProse(
      "Emma walked the Odyssey. Emma watched the Odyssey. Emma left the Odyssey after the quiet watch."
    );
    expect(withNames.typeTokenRatio).toBeGreaterThan(withoutFilter.typeTokenRatio);
    expect(withNames.longWordShare).toBeLessThanOrEqual(withoutFilter.longWordShare);
  });

  it("maps a high Flesch ease to Fast & breezy, not a school grade", () => {
    const ease = fleschReadingEase(80, 16, 90);
    expect(ease).toBeGreaterThan(80);
    const stats = analyzeProse(
      "The cat sat. The dog ran. The boy hid. The girl won. The sun set. The day ended. The night came. The town slept. The quay stilled. The boat rocked. The bell rang. The door shut."
    );
    expect(stats.profile.id).toBe("breezy");
    expect(stats.profile.genres).toContain("YA");
  });

  it("lists sentences of 30 words or more", () => {
    const long =
      "The dim glow of the Odyssey's bridge cast long shadows across Jeff's angular face as his eyes narrowed, focusing on the readout while the crew held their breath and nobody dared to speak at all.";
    const stats = analyzeProse(`${long} Short.`);
    expect(stats.longCount).toBe(1);
    expect(stats.longSentences[0]).toContain("Odyssey");
  });

  it("can lower the long-sentence line for a younger reader", () => {
    const words = Array.from({ length: 22 }, (_, i) => (i === 0 ? "Emma" : "waited")).join(" ");
    expect(countWords(words)).toBe(22);
    expect(analyzeProse(words).longCount).toBe(0);
    expect(analyzeProse(words, [], { longSentence: 20 }).longCount).toBe(1);
  });
});

describe("countSyllables", () => {
  it("groups vowel runs", () => {
    expect(countSyllables("cat")).toBe(1);
    expect(countSyllables("bridge")).toBe(1);
    expect(countSyllables("angular")).toBeGreaterThanOrEqual(3);
  });
});
