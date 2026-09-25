import { describe, expect, it } from "vitest";
import { findAiTicHits } from "@core/aiTics";

describe("findAiTicHits", () => {
  it("flags a known clichéd phrase, case-insensitively", () => {
    const hits = findAiTicHits("Her courage was A TESTAMENT TO everything she had survived.");
    expect(hits).toHaveLength(1);
    expect(hits[0]?.text.toLowerCase()).toBe("a testament to");
  });

  it("flags more than one phrase in the same passage", () => {
    const hits = findAiTicHits("The city was a tapestry of light, and she began to delve into its secrets.");
    expect(hits.map((hit) => hit.text.toLowerCase())).toEqual(["tapestry of", "delve into"]);
  });

  it("stays silent on ordinary prose with no tics", () => {
    expect(findAiTicHits("Emma locked the quay door and counted the keys by the lamp.")).toEqual([]);
  });

  it("ignores an occasional em dash in a long enough passage", () => {
    const filler = Array.from({ length: 200 }, (_, i) => `word${i}`).join(" ");
    const text = `${filler} — one aside — ${filler}`;
    expect(findAiTicHits(text)).toEqual([]);
  });

  it("flags every em dash once a passage leans on them heavily", () => {
    const text = Array.from({ length: 10 }, (_, i) => `Word${i} — word${i}b`).join(" ");
    const hits = findAiTicHits(text);
    expect(hits.length).toBe(10);
    expect(hits.every((hit) => hit.text === "—")).toBe(true);
  });

  it("does not produce overlapping hits", () => {
    const hits = findAiTicHits("It is important to note that this is a testament to her strength.");
    for (let i = 1; i < hits.length; i++) {
      expect(hits[i]!.start).toBeGreaterThanOrEqual(hits[i - 1]!.end);
    }
  });
});
