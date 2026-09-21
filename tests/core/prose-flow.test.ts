import { describe, expect, it } from "vitest";
import { htmlFromProse, peelModelAsides, splitFlowParagraphs } from "@core/proseFlow";

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

  it("marks a model Note as an aside and leaves the story sentence alone", () => {
    const html = htmlFromProse(
      '(Note: Changed "moves with practiced ease" to "surges through".)Jeff\'s eyes adjust.'
    );
    expect(html).toContain('<span class="prose-aside">(Note:');
    expect(html).toContain("&quot;surges through&quot;.)</span>Jeff's eyes adjust.");
    expect(html).not.toContain('prose-aside">Jeff');
  });

  it("does not mark ordinary story parentheses", () => {
    expect(htmlFromProse("He locked the door (the old one) and waited.")).toBe(
      "<p>He locked the door (the old one) and waited.</p>"
    );
  });
});

describe("peelModelAsides", () => {
  it("lifts a glued Note and leaves the story sentence", () => {
    const peeled = peelModelAsides(
      '(Note: Changed "moves with practiced ease" to "surges through".)Jeff\'s eyes adjust.'
    );
    expect(peeled.prose).toBe("Jeff's eyes adjust.");
    expect(peeled.asides).toEqual(['Note: Changed "moves with practiced ease" to "surges through".']);
  });

  it("lifts a Note that contains nested parentheses", () => {
    const peeled = peelModelAsides("(Note: recast passives (the door was opened).)She opened the door.");
    expect(peeled.prose).toBe("She opened the door.");
    expect(peeled.asides[0]).toContain("the door was opened");
  });

  it("leaves ordinary story parentheses in the prose", () => {
    const peeled = peelModelAsides("He locked the door (the old one) and waited.");
    expect(peeled.prose).toBe("He locked the door (the old one) and waited.");
    expect(peeled.asides).toEqual([]);
  });

  it("lifts an unclosed Note so it cannot land in the manuscript", () => {
    const peeled = peelModelAsides('(Note: Changed "soft murmur" to "crescendo"');
    expect(peeled.prose).toBe("");
    expect(peeled.asides[0]).toContain("soft murmur");
  });

  it("lifts a trailing NOTE line after the rewritten passage", () => {
    const peeled = peelModelAsides(
      'Jeff\'s eyes adjust.\n\nNOTE: "moves with practiced ease" → "surges through"'
    );
    expect(peeled.prose).toBe("Jeff's eyes adjust.");
    expect(peeled.asides[0]).toContain("surges through");
  });

  it("keeps a story sentence that uses the word note", () => {
    const peeled = peelModelAsides("She left a note: the key is under the mat.");
    expect(peeled.prose).toBe("She left a note: the key is under the mat.");
    expect(peeled.asides).toEqual([]);
  });
});
