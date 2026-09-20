import { describe, expect, it } from "vitest";
import { analyzeProse } from "@core/proseStats";
import { tallyRareWords } from "@core/rareWords";
import {
  longestLongSentenceRun,
  scoreDirectness,
  scorePacing,
  scoreVocabulary
} from "@core/proseScores";

describe("scoreDirectness", () => {
  it("stays high when the passage is lean", () => {
    const stats = analyzeProse("Emma locked the door. She waited on the quay. The tide pulled at the piles.");
    expect(scoreDirectness(stats)).toBeGreaterThanOrEqual(90);
  });

  it("drops when manner-adverbs pile up", () => {
    const lean = analyzeProse("Emma locked the door. She waited on the quay. The tide pulled at the piles.");
    const padded = analyzeProse(
      "Emma slowly locked the door. She quickly waited on the quay. The tide quietly pulled at the piles."
    );
    expect(scoreDirectness(padded)).toBeLessThan(scoreDirectness(lean) ?? 0);
  });

  it("penalizes the same adverbs more for a younger reader", () => {
    const padded = analyzeProse(
      "Emma slowly locked the door and waited on the quay. She quickly counted the night keys. The tide quietly pulled at the piles while the last boat left and fog sat on the water. Nobody else came down the stone steps that night."
    );
    const adult = scoreDirectness(padded, 1);
    const early = scoreDirectness(padded, 2);
    expect(adult).toBeGreaterThan(0);
    expect(early).toBeLessThan(adult ?? 0);
  });
});

describe("scorePacing", () => {
  it("needs at least three sentences", () => {
    expect(scorePacing(analyzeProse("Stop. The long descriptive sentence goes on and on."))).toBeNull();
  });

  it("rewards mixed lengths over a monotone", () => {
    const mixed = analyzeProse(
      "Stop. Now. The dim glow of the Odyssey's bridge cast long shadows across Jeff's angular face as his eyes narrowed, focusing on the readout while the crew held their breath."
    );
    const choppy = analyzeProse("He ran. She hid. Doors slammed. Lights died. Nobody spoke. The quay waited.");
    expect(scorePacing(mixed)).toBeGreaterThan(scorePacing(choppy) ?? 0);
  });

  it("drops when mid-length lines count as long for a younger reader", () => {
    const even = analyzeProse(
      "Emma waited by the quay and watched the tide pull at the old stone piles there. She counted the night keys and locked the door before the last boat left home. Fog sat on the water and nobody else came down the steps that night."
    );
    expect(scorePacing(even, 12, 3)).toBeLessThan(scorePacing(even) ?? 0);
  });
});

describe("longestLongSentenceRun", () => {
  it("counts consecutive 30+ word sentences", () => {
    expect(longestLongSentenceRun([8, 32, 31, 40, 35, 33, 6])).toBe(5);
    expect(longestLongSentenceRun([32, 8, 31])).toBe(1);
  });
});

describe("scoreVocabulary", () => {
  it("waits for a longer passage", () => {
    const stats = analyzeProse("Emma locked the door.");
    expect(scoreVocabulary(stats, 0)).toBeNull();
  });

  it("does not treat a few uncommon words as a failure", () => {
    const text =
      "Emma walked the quay at dusk and watched the tide. A stowaway paid in salt. She kept the night keys and waited for the last boat. Fog sat on the water. Nobody else came down the stone steps that night.";
    const stats = analyzeProse(text);
    const rare = tallyRareWords(text, ["Emma"]);
    const score = scoreVocabulary(stats, rare.count);
    expect(score).not.toBeNull();
    expect(score).toBeGreaterThanOrEqual(70);
  });

  it("scores plain diction higher when the reader is young", () => {
    const text =
      "Emma walked the quay at dusk and watched the tide. She kept the night keys and waited for the last boat. Fog sat on the water. Nobody else came down the stone steps that night. The door stayed shut until morning came.";
    const stats = analyzeProse(text);
    expect(scoreVocabulary(stats, 0, 0.01, 100)).toBeGreaterThan(scoreVocabulary(stats, 0) ?? 0);
  });
});
