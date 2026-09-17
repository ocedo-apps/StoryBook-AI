import { describe, expect, it } from "vitest";
import { flagEchoes } from "@core/echoDetect";

const filler = Array.from({ length: 40 }, (_, i) => `Keep moving along the quay number ${i}.`).join(" ");

describe("flagEchoes", () => {
  it("flags a content word used three times in a short span", () => {
    const hits = flagEchoes("Emma offered a smile. The smile faded at the lock. Another smile returned.");
    expect(hits.some((hit) => hit.phrase.includes("smile") && hit.count >= 3)).toBe(true);
  });

  it("does not flag the same word when the repeats are far apart", () => {
    const hits = flagEchoes(`A quiet smile. ${filler} Another smile. ${filler} A last smile.`);
    expect(hits.some((hit) => hit.phrase.includes("smile"))).toBe(false);
  });

  it("flags a nearby repeated phrase", () => {
    const hits = flagEchoes("She smiled at the quay. Rain hit the deck. She smiled at the lock.");
    expect(hits.some((hit) => hit.phrase === "she smiled" && hit.count >= 2)).toBe(true);
  });

  it("ignores Story Bible names", () => {
    expect(flagEchoes("Emma walked. Emma waited. Emma locked the door.", ["Emma"])).toEqual([]);
  });

  it("ignores dialogue tags", () => {
    expect(flagEchoes('"Stay," she said. "Wait," she said. "Go," she said.')).toEqual([]);
  });

  it("returns nothing for empty prose", () => {
    expect(flagEchoes("   ")).toEqual([]);
  });
});
