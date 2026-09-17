import { describe, expect, it } from "vitest";
import { htmlFromProse, splitFlowParagraphs } from "@core/proseFlow";

describe("splitFlowParagraphs", () => {
  it("treats blank lines as the same break as a single newline", () => {
    expect(splitFlowParagraphs("Walked to the ship.\n\nHis life's work.\nThe cold stayed.")).toEqual([
      "Walked to the ship.",
      "His life's work.",
      "The cold stayed."
    ]);
  });
});

describe("htmlFromProse", () => {
  it("renders paragraphs without empty row nodes", () => {
    expect(htmlFromProse("Walked to the ship.\n\nHis life's work.")).toBe(
      "<p>Walked to the ship.</p><p>His life's work.</p>"
    );
  });
});
