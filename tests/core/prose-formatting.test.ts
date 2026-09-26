import { describe, expect, it } from "vitest";
import {
  formattingRangesEqual,
  formattingSegments,
  isFullyStyled,
  mergeAdjacentRanges,
  shiftFormattingRanges,
  toggleFormatting,
  type ProseFormattingRange
} from "@core/proseFormatting";

function range(start: number, end: number, style: ProseFormattingRange["style"] = "bold"): ProseFormattingRange {
  return { start, end, style };
}

describe("mergeAdjacentRanges", () => {
  it("coalesces overlapping and touching same-style ranges", () => {
    const merged = mergeAdjacentRanges([range(0, 5), range(5, 10), range(3, 8)]);
    expect(merged).toEqual([range(0, 10)]);
  });

  it("keeps different styles separate even when they overlap", () => {
    const merged = mergeAdjacentRanges([range(0, 5, "bold"), range(2, 8, "italic")]);
    expect(merged.sort((a, b) => a.style.localeCompare(b.style))).toEqual([range(0, 5, "bold"), range(2, 8, "italic")]);
  });

  it("drops empty or inverted ranges", () => {
    expect(mergeAdjacentRanges([range(5, 5), { start: 5, end: 3, style: "bold" }])).toEqual([]);
  });
});

describe("shiftFormattingRanges", () => {
  it("leaves a range entirely before the edit untouched", () => {
    expect(shiftFormattingRanges([range(0, 5)], 10, 12, 3)).toEqual([range(0, 5)]);
  });

  it("shifts a range entirely after the edit by the length delta", () => {
    // replace 2 chars with 5 -> delta +3
    expect(shiftFormattingRanges([range(20, 25)], 10, 12, 5)).toEqual([range(23, 28)]);
  });

  it("drops a range fully swallowed by the edit", () => {
    expect(shiftFormattingRanges([range(11, 12)], 10, 15, 0)).toEqual([]);
  });

  it("clips a range that straddles the start of the edit", () => {
    expect(shiftFormattingRanges([range(8, 13)], 10, 15, 0)).toEqual([range(8, 10)]);
  });

  it("clips and shifts a range that straddles the end of the edit", () => {
    // replace [10,15) with 8 chars -> delta +3; surviving tail starts right after the edit
    expect(shiftFormattingRanges([range(12, 20)], 10, 15, 8)).toEqual([range(18, 23)]);
  });

  it("handles a pure insertion (editStart === editEnd) as a plain shift, no clipping", () => {
    expect(shiftFormattingRanges([range(0, 5), range(10, 15)], 5, 5, 4)).toEqual([range(0, 5), range(14, 19)]);
  });
});

describe("isFullyStyled", () => {
  it("is true only when the whole span is covered by that style", () => {
    const ranges = [range(0, 10, "bold")];
    expect(isFullyStyled(ranges, 2, 8, "bold")).toBe(true);
    expect(isFullyStyled(ranges, 2, 12, "bold")).toBe(false);
    expect(isFullyStyled(ranges, 2, 8, "italic")).toBe(false);
  });

  it("is true across two adjoining ranges of the same style", () => {
    const ranges = [range(0, 5, "bold"), range(5, 10, "bold")];
    expect(isFullyStyled(ranges, 0, 10, "bold")).toBe(true);
  });

  it("is false across a gap between two ranges", () => {
    const ranges = [range(0, 4, "bold"), range(6, 10, "bold")];
    expect(isFullyStyled(ranges, 0, 10, "bold")).toBe(false);
  });
});

describe("toggleFormatting", () => {
  it("applies a style to a plain selection", () => {
    expect(toggleFormatting([], { start: 3, end: 8 }, "bold")).toEqual([range(3, 8)]);
  });

  it("removes a style from an already fully-styled selection", () => {
    expect(toggleFormatting([range(0, 10)], { start: 3, end: 8 }, "bold")).toEqual([range(0, 3), range(8, 10)]);
  });

  it("extends to fully style a selection that was only partly bold", () => {
    const result = toggleFormatting([range(0, 4)], { start: 2, end: 8 }, "bold");
    expect(result).toEqual([range(0, 8)]);
  });

  it("leaves other styles on the same text untouched either way", () => {
    const ranges = [range(0, 10, "italic")];
    const on = toggleFormatting(ranges, { start: 2, end: 6 }, "bold");
    expect(on).toEqual(mergeAdjacentRanges([range(0, 10, "italic"), range(2, 6, "bold")]));
    const off = toggleFormatting(on, { start: 2, end: 6 }, "bold");
    expect(off).toEqual([range(0, 10, "italic")]);
  });

  it("no-ops on a collapsed span", () => {
    const ranges = [range(0, 5)];
    expect(toggleFormatting(ranges, { start: 4, end: 4 }, "bold")).toBe(ranges);
  });
});

describe("formattingSegments", () => {
  it("returns a single unstyled segment when there is no formatting", () => {
    expect(formattingSegments([], 0, 10)).toEqual([{ start: 0, end: 10, styles: [] }]);
  });

  it("splits at range boundaries and reports the active style set per run", () => {
    const segments = formattingSegments([range(2, 6, "bold"), range(4, 8, "italic")], 0, 10);
    expect(segments).toEqual([
      { start: 0, end: 2, styles: [] },
      { start: 2, end: 4, styles: ["bold"] },
      { start: 4, end: 6, styles: ["bold", "italic"] },
      { start: 6, end: 8, styles: ["italic"] },
      { start: 8, end: 10, styles: [] }
    ]);
  });

  it("ignores range boundaries outside the requested window", () => {
    expect(formattingSegments([range(0, 100, "bold")], 20, 30)).toEqual([{ start: 20, end: 30, styles: ["bold"] }]);
  });
});

describe("formattingRangesEqual", () => {
  it("is order-independent", () => {
    expect(formattingRangesEqual([range(5, 10, "italic"), range(0, 5, "bold")], [range(0, 5, "bold"), range(5, 10, "italic")])).toBe(
      true
    );
  });

  it("is false when a range differs", () => {
    expect(formattingRangesEqual([range(0, 5)], [range(0, 6)])).toBe(false);
  });
});
