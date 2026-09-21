import { describe, expect, it } from "vitest";
import {
  chapterCraftCue,
  formatCraftForBrainstorm,
  formatCraftForDraft,
  needsViewpoint,
  parsePov,
  parseTense,
  povInstruction,
  resolveCraft
} from "@core/craft";

const limited = { pov: "limited" as const, tense: "past" as const, viewpoint: "" };

describe("needsViewpoint", () => {
  it("asks for a named head only in limited and first person", () => {
    expect(needsViewpoint("limited")).toBe(true);
    expect(needsViewpoint("first")).toBe(true);
    expect(needsViewpoint("omniscient")).toBe(false);
    expect(needsViewpoint("objective")).toBe(false);
    expect(needsViewpoint("second")).toBe(false);
  });
});

describe("parse helpers", () => {
  it("falls back to limited past on unknown values", () => {
    expect(parsePov("free-indirect")).toBe("limited");
    expect(parseTense("future")).toBe("past");
  });
});

describe("formatCraftForDraft", () => {
  it("always states camera and tense, even on defaults", () => {
    const text = formatCraftForDraft(limited);
    expect(text).toContain("Third person limited");
    expect(text).toContain("Never enter another mind");
    expect(text).toContain("Past tense throughout");
  });

  it("names the viewpoint when limited has one", () => {
    expect(povInstruction("limited", "Emma")).toContain("limited to Emma");
    expect(povInstruction("first", "Emma")).toContain("First person as Emma");
  });

  it("describes omniscient, objective, and second without requiring a name", () => {
    expect(povInstruction("omniscient", "")).toContain("omniscient");
    expect(povInstruction("objective", "")).toContain("observer");
    expect(povInstruction("second", "")).toContain("“you”");
  });

  it("uses present tense when asked", () => {
    expect(formatCraftForDraft({ ...limited, tense: "present" })).toContain("Present tense throughout");
  });
});

describe("formatCraftForBrainstorm", () => {
  it("mentions the intended camera without demanding chapter prose", () => {
    const text = formatCraftForBrainstorm({ pov: "first", tense: "present", viewpoint: "Emma" });
    expect(text).toContain("Intended manuscript craft");
    expect(text).toContain("First person as Emma");
    expect(text).toContain("These notes may stay in any form");
    expect(text).toContain("Do not write chapter prose unless asked");
  });
});

describe("resolveCraft", () => {
  it("inherits manuscript fields the chapter does not set", () => {
    const book = { pov: "limited" as const, tense: "past" as const, viewpoint: "Emma" };
    expect(resolveCraft(book, {})).toEqual(book);
    expect(resolveCraft(book, { viewpoint: "the stranger" })).toEqual({
      pov: "limited",
      tense: "past",
      viewpoint: "the stranger"
    });
  });

  it("labels a chapter list cue from the override", () => {
    const book = { pov: "limited" as const, tense: "past" as const, viewpoint: "Emma" };
    expect(chapterCraftCue(book, {})).toBe("");
    expect(chapterCraftCue(book, { viewpoint: "the stranger" })).toBe("the stranger");
    expect(chapterCraftCue(book, { pov: "omniscient" })).toBe("3rd omniscient");
    expect(chapterCraftCue(book, { tense: "present" })).toBe("Present");
  });
});
