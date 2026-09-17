import { describe, expect, it } from "vitest";
import { applyExtend, applyReplace, extendGlue, normalizeSpan, selectedText } from "@core/textSpan";

describe("normalizeSpan", () => {
  it("orders a backwards drag", () => {
    expect(normalizeSpan(8, 2)).toEqual({ start: 2, end: 8 });
  });
});

describe("applyReplace", () => {
  it("swaps only the marked slice", () => {
    expect(applyReplace("The tide pulled at the ropes.", { start: 4, end: 8 }, "canal")).toBe(
      "The canal pulled at the ropes."
    );
  });
});

describe("applyExtend", () => {
  it("inserts after the mark with a joining space", () => {
    expect(extendGlue("ropes.")).toBe(" ");
    expect(applyExtend("The tide pulled at the ropes.", { start: 0, end: 29 }, "Emma did not look back.")).toBe(
      "The tide pulled at the ropes. Emma did not look back."
    );
  });

  it("does not add a second space after whitespace", () => {
    expect(applyExtend("Dawn on the quay. ", { start: 0, end: 18 }, "Gulls argued.")).toBe(
      "Dawn on the quay. Gulls argued."
    );
  });
});

describe("selectedText", () => {
  it("reads the slice", () => {
    expect(selectedText("Emma turned the key.", { start: 0, end: 4 })).toBe("Emma");
  });
});
