import { describe, expect, it } from "vitest";
import { applyMarkerConversion } from "@core/markerConversion";

describe("applyMarkerConversion", () => {
  it("converts a single marked span and strips the markers", () => {
    const result = applyMarkerConversion("She said *quietly* to him.", [], [{ marker: "*", style: "italic" }]);
    expect(result.prose).toBe("She said quietly to him.");
    expect(result.count).toBe(1);
    expect(result.formatting).toEqual([{ start: 9, end: 16, style: "italic" }]);
  });

  it("runs longer markers first so ** is not mistaken for two *", () => {
    const result = applyMarkerConversion(
      "This is **bold** and this is *italic*.",
      [],
      [
        { marker: "*", style: "italic" },
        { marker: "**", style: "bold" }
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
    const result = applyMarkerConversion("Plain text, nothing to see here.", [], [{ marker: "*", style: "italic" }]);
    expect(result.prose).toBe("Plain text, nothing to see here.");
    expect(result.count).toBe(0);
    expect(result.formatting).toEqual([]);
  });

  it("does not match across a paragraph break", () => {
    const result = applyMarkerConversion("*a*\n\n*b*", [], [{ marker: "*", style: "italic" }]);
    expect(result.prose).toBe("a\n\nb");
    expect(result.count).toBe(2);
  });

  it("ignores rules with a blank marker", () => {
    const result = applyMarkerConversion("Some *text* here.", [], [{ marker: "", style: "bold" }, { marker: "*", style: "italic" }]);
    expect(result.count).toBe(1);
    expect(result.prose).toBe("Some text here.");
  });

  it("shifts pre-existing formatting that comes after a converted span", () => {
    const prose = "Intro. *thought* then a bold word.";
    const boldStart = prose.indexOf("bold");
    const existing = [{ start: boldStart, end: boldStart + 4, style: "bold" as const }];
    const result = applyMarkerConversion(prose, existing, [{ marker: "*", style: "italic" }]);
    const newBold = result.formatting.find((range) => range.style === "bold");
    expect(result.prose.slice(newBold!.start, newBold!.end)).toBe("bold");
    const italic = result.formatting.find((range) => range.style === "italic");
    expect(result.prose.slice(italic!.start, italic!.end)).toBe("thought");
  });

  it("converts multiple rules across a realistic passage", () => {
    const prose = "**Kael** stood still. *He should run,* he thought, but didn't.";
    const result = applyMarkerConversion(prose, [], [
      { marker: "*", style: "italic" },
      { marker: "**", style: "bold" }
    ]);
    expect(result.prose).toBe("Kael stood still. He should run, he thought, but didn't.");
    expect(result.count).toBe(2);
  });
});
