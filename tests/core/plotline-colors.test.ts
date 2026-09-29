import { describe, expect, it } from "vitest";
import { createBook, parseBook } from "@core/BookSchema";
import { DEFAULT_PLOTLINE_COLOR, parsePlotlineColor, PLOTLINE_COLORS } from "@core/plotlineColors";

describe("parsePlotlineColor", () => {
  it("passes through any value already in the current palette", () => {
    for (const color of PLOTLINE_COLORS) {
      expect(parsePlotlineColor(color)).toBe(color);
    }
  });

  it("maps a save from before this palette (Brainstorm's old note colors) to a matching new hue", () => {
    expect(parsePlotlineColor("paper")).toBe("grey");
    expect(parsePlotlineColor("rust")).toBe("coral");
    expect(parsePlotlineColor("sage")).toBe("green");
    expect(parsePlotlineColor("gold")).toBe("orange");
    expect(parsePlotlineColor("lilac")).toBe("violet");
  });

  it("falls back to the default for anything unrecognized, missing, or the wrong type", () => {
    expect(parsePlotlineColor("not-a-color")).toBe(DEFAULT_PLOTLINE_COLOR);
    expect(parsePlotlineColor(undefined)).toBe(DEFAULT_PLOTLINE_COLOR);
    expect(parsePlotlineColor(null)).toBe(DEFAULT_PLOTLINE_COLOR);
    expect(parsePlotlineColor(42)).toBe(DEFAULT_PLOTLINE_COLOR);
  });
});

describe("PlotlineSchema (via parseBook)", () => {
  it("loads a book saved before this palette existed without throwing, mapping its old note-color plotlines", () => {
    const book = createBook("Legacy");
    const withLegacyPlotlines = {
      ...book,
      plotlines: [
        { id: "p1", title: "Main plot", color: "rust" },
        { id: "p2", title: "Romance", color: "sage" }
      ]
    };
    const parsed = parseBook(withLegacyPlotlines);
    expect(parsed.plotlines[0]?.color).toBe("coral");
    expect(parsed.plotlines[1]?.color).toBe("green");
  });
});
