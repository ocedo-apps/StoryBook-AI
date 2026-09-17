import { describe, expect, it } from "vitest";
import { parseParagraphBreak } from "@core/paragraphBreak";
import { replaceCollapsedSentence } from "@core/sentenceSplit";

const PACKED =
  "Jeff walked across the gravel toward the ship, each step a small surrender, for his life's work had taken him from Neptune to Venus for decades of voyages, and the horrors of space had left their mark on his soul — the cold, the silence, the metallic taste of recycled air still clinging to every breath.";

describe("parseParagraphBreak", () => {
  it("keeps a same-words break that only adds blank lines", () => {
    const broken = `Jeff walked across the gravel toward the ship, each step a small surrender.

For his life's work had taken him from Neptune to Venus for decades of voyages.

And the horrors of space had left their mark on his soul — the cold, the silence, the metallic taste of recycled air still clinging to every breath.`;
    expect(parseParagraphBreak(JSON.stringify({ split: broken }), PACKED)).toBe(broken);
  });

  it("joins a paragraphs array with blank lines", () => {
    expect(
      parseParagraphBreak(
        '{"paragraphs":["He walked to the ship.","His life\'s work had taken decades.","The cold and the silence stayed."]}',
        PACKED
      )
    ).toBe("He walked to the ship.\n\nHis life's work had taken decades.\n\nThe cold and the silence stayed.");
  });

  it("treats single newlines as paragraph breaks", () => {
    expect(parseParagraphBreak('{"split":"He walked to the ship.\\nHis life had taken decades."}', PACKED)).toBe(
      "He walked to the ship.\n\nHis life had taken decades."
    );
  });

  it("returns empty when the model echoes one paragraph", () => {
    expect(parseParagraphBreak(JSON.stringify({ split: PACKED }), PACKED)).toBe("");
  });

  it("unescapes leftover backslash-n sequences", () => {
    expect(
      parseParagraphBreak(String.raw`{"split":"He walked to the ship.\\n\\nHis life had taken decades."}`, PACKED)
    ).toBe("He walked to the ship.\n\nHis life had taken decades.");
  });

  it("reads a prose dump with a preamble", () => {
    const raw = `Sure.\n\nJeff walked across the gravel toward the ship.\n\nHis life's work had taken decades.`;
    const next = parseParagraphBreak(raw, PACKED);
    expect(next).toContain("Jeff walked across the gravel");
    expect(next).not.toMatch(/^Sure/i);
    expect(next.split("\n\n").length).toBeGreaterThanOrEqual(2);
  });
});

describe("replaceCollapsedSentence on a packed paragraph", () => {
  it("puts the new breaks into the chapter", () => {
    const source = `Emma locked the door.\n\n${PACKED}\n\nDawn.`;
    const broken = `Jeff walked across the gravel toward the ship.

His life's work had taken him from Neptune to Venus for decades.

The cold and the silence stayed.`;
    const next = replaceCollapsedSentence(source, PACKED, broken);
    expect(next).toContain("Emma locked the door.");
    expect(next).toContain("Dawn.");
    expect(next?.split(/\n\s*\n/).length).toBeGreaterThanOrEqual(4);
  });
});
