import { describe, expect, it } from "vitest";
import { applyMarkerConversion } from "@core/markerConversion";

describe("applyMarkerConversion", () => {
  it("converts a single marked span and strips the markers", () => {
    const result = applyMarkerConversion("She said *quietly* to him.", [], [{ open: "*", close: "*", style: "italic" }]);
    expect(result.prose).toBe("She said quietly to him.");
    expect(result.count).toBe(1);
    expect(result.formatting).toEqual([{ start: 9, end: 16, style: "italic" }]);
  });

  it("runs longer markers first so ** is not mistaken for two *", () => {
    const result = applyMarkerConversion(
      "This is **bold** and this is *italic*.",
      [],
      [
        { open: "*", close: "*", style: "italic" },
        { open: "**", close: "**", style: "bold" }
      ]
    );
    expect(result.prose).toBe("This is bold and this is italic.");
    expect(result.count).toBe(2);
    const bold = result.formatting.find((range) => range.style === "bold");
    const italic = result.formatting.find((range) => range.style === "italic");
    expect(result.prose.slice(bold!.start, bold!.end)).toBe("bold");
    expect(result.prose.slice(italic!.start, italic!.end)).toBe("italic");
  });

  it("does nothing when no markers are present", () => {
    const result = applyMarkerConversion("Plain text, nothing to see here.", [], [{ open: "*", close: "*", style: "italic" }]);
    expect(result.prose).toBe("Plain text, nothing to see here.");
    expect(result.count).toBe(0);
    expect(result.formatting).toEqual([]);
  });

  it("does not match across a paragraph break", () => {
    const result = applyMarkerConversion("*a*\n\n*b*", [], [{ open: "*", close: "*", style: "italic" }]);
    expect(result.prose).toBe("a\n\nb");
    expect(result.count).toBe(2);
  });

  it("ignores rules with a blank open or close marker", () => {
    const result = applyMarkerConversion(
      "Some *text* here.",
      [],
      [
        { open: "", close: "", style: "bold" },
        { open: "*", close: "*", style: "italic" }
      ]
    );
    expect(result.count).toBe(1);
    expect(result.prose).toBe("Some text here.");
  });

  it("shifts pre-existing formatting that comes after a converted span", () => {
    const prose = "Intro. *thought* then a bold word.";
    const boldStart = prose.indexOf("bold");
    const existing = [{ start: boldStart, end: boldStart + 4, style: "bold" as const }];
    const result = applyMarkerConversion(prose, existing, [{ open: "*", close: "*", style: "italic" }]);
    const newBold = result.formatting.find((range) => range.style === "bold");
    expect(result.prose.slice(newBold!.start, newBold!.end)).toBe("bold");
    const italic = result.formatting.find((range) => range.style === "italic");
    expect(result.prose.slice(italic!.start, italic!.end)).toBe("thought");
  });

  it("converts multiple rules across a realistic passage", () => {
    const prose = "**Kael** stood still. *He should run,* he thought, but didn't.";
    const result = applyMarkerConversion(prose, [], [
      { open: "*", close: "*", style: "italic" },
      { open: "**", close: "**", style: "bold" }
    ]);
    expect(result.prose).toBe("Kael stood still. He should run, he thought, but didn't.");
    expect(result.count).toBe(2);
  });

  it("supports an asymmetric open/close pair, e.g. smart quotes", () => {
    // Regression: curly quotes use two different characters for open and
    // close ("“" vs "”") — a rule that assumed the same string on
    // both sides could never match them, however the user typed the marker.
    const prose = "He looked up. “Hello,” she said. “How are you?” Curly quotes here.";
    const result = applyMarkerConversion(prose, [], [{ open: "“", close: "”", style: "italic" }]);
    expect(result.prose).toBe("He looked up. Hello, she said. How are you? Curly quotes here.");
    expect(result.count).toBe(2);
    expect(result.formatting).toEqual([
      { start: 14, end: 20, style: "italic" },
      { start: 31, end: 43, style: "italic" }
    ]);
  });

  it("does not match a symmetric rule against curly quotes typed the wrong way", () => {
    const prose = "“Hello,” she said.";
    const result = applyMarkerConversion(prose, [], [{ open: '"', close: '"', style: "italic" }]);
    expect(result.count).toBe(0);
    expect(result.prose).toBe(prose);
  });
});
