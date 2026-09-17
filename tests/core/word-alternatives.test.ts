import { describe, expect, it } from "vitest";
import {
  ALTERNATIVES_SYSTEM,
  alternativesUserPrompt,
  dropWrongSense,
  matchWordCase,
  parseAlternativeWords,
  sentenceAround,
  swapContext
} from "@core/wordAlternatives";
import { rareHitAt } from "@core/rareWords";

describe("parseAlternativeWords", () => {
  it("reads a JSON words array and drops the original", () => {
    expect(parseAlternativeWords('{"words":["dock","wharf","quay","pier"]}', "quay")).toEqual([
      "dock",
      "wharf",
      "pier"
    ]);
  });

  it("recovers a fenced list", () => {
    expect(parseAlternativeWords("```json\n[\"hideaway\",\"refugee\"]\n```", "stowaway")).toEqual([
      "hideaway",
      "refugee"
    ]);
  });

  it("keeps at most five alternatives", () => {
    expect(
      parseAlternativeWords('{"words":["a","b","c","d","e","f","g"]}', "quay")
    ).toEqual(["a", "b", "c", "d", "e"]);
  });
});

describe("dropWrongSense", () => {
  it("drops brow and light senses of crinkling near a smile", () => {
    expect(
      dropWrongSense("crinkling", "His eyes were crinkling with a smile.", [
        "creasing",
        "furrowing",
        "twinkling",
        "wrinkling",
        "gleaming"
      ])
    ).toEqual(["creasing", "wrinkling"]);
  });

  it("does not strip crinkling when the sentence is about paper", () => {
    expect(dropWrongSense("crinkling", "The paper was crinkling in his fist.", ["rustling", "furrowing"])).toEqual([
      "rustling",
      "furrowing"
    ]);
  });
});

describe("alternatives prompt", () => {
  it("asks the model to keep sense and names the crinkling trap", () => {
    expect(ALTERNATIVES_SYSTEM).toMatch(/3 to 5/);
    expect(ALTERNATIVES_SYSTEM).toMatch(/crinkling means creasing/i);
    expect(ALTERNATIVES_SYSTEM).toMatch(/furrowing/);
    expect(ALTERNATIVES_SYSTEM).toMatch(/twinkling or gleaming/);
  });

  it("includes neighbor sentences when present", () => {
    const prompt = alternativesUserPrompt("crinkling", "His eyes were crinkling with a smile.", "Dry.", {
      before: "She paid in salt.",
      after: "He did not look away."
    });
    expect(prompt).toContain("Previous sentence: She paid in salt.");
    expect(prompt).toContain("Next sentence: He did not look away.");
    expect(prompt).toContain("Keep this sense");
  });
});

describe("matchWordCase", () => {
  it("keeps sentence case", () => {
    expect(matchWordCase("Angular", "sharp")).toBe("Sharp");
    expect(matchWordCase("angular", "sharp")).toBe("sharp");
  });
});

describe("sentenceAround", () => {
  it("returns the host sentence", () => {
    expect(sentenceAround("She stopped. The angular face. He ran.", 13, 20)).toBe("The angular face.");
  });
});

describe("swapContext", () => {
  it("returns the host sentence and its neighbors", () => {
    const text = "She paid in salt. His eyes were crinkling with a smile. He did not look away.";
    const start = text.indexOf("crinkling");
    const ctx = swapContext(text, start, start + "crinkling".length);
    expect(ctx.sentence).toBe("His eyes were crinkling with a smile.");
    expect(ctx.before).toBe("She paid in salt.");
    expect(ctx.after).toBe("He did not look away.");
  });
});

describe("rareHitAt", () => {
  it("finds the marked word under an offset", () => {
    const text = "The angular face.";
    const hit = rareHitAt(text, 6);
    expect(hit?.word).toBe("angular");
  });
});
