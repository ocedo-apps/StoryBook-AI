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
});
