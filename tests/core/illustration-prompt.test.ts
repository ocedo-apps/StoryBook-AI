import { describe, expect, it } from "vitest";
import { createBook } from "@core/BookSchema";
import {
  applyOrientationHint,
  enforceNoTextConstraint,
  illustrationPromptMessages,
  relevantEntitiesForPassage
} from "@core/illustrationPrompt";

function bookWithCast() {
  let book = createBook("Night Keys");
  book = {
    ...book,
    facts: [
      {
        id: "f1",
        entity_ref: "emma-vale",
        entity_label: "Emma Vale",
        predicate: "core.identity",
        value: "Keeper of the harbor archive",
        sequence_index: 0,
        status: "locked",
        source: "author",
        created_at: "2026-09-14T00:00:00.000Z"
      },
      {
        id: "f2",
        entity_ref: "jonas-reyes",
        entity_label: "Jonas Reyes",
        predicate: "core.identity",
        value: "A dockworker who never speaks",
        sequence_index: 0,
        status: "locked",
        source: "author",
        created_at: "2026-09-14T00:00:00.000Z"
      },
      {
        id: "f3",
        entity_ref: "emma-vale",
        entity_label: "Emma Vale",
        predicate: "core.trait",
        value: "Draft: not locked, must not leak in",
        sequence_index: 1,
        status: "ai_proposed",
        source: "extractor",
        created_at: "2026-09-14T00:00:00.000Z"
      }
    ],
    profiles: [{ entity_ref: "emma-vale", looks: "Red hair, sea-worn coat", personality: "Guarded", tags: [] }]
  };
  return book;
}

describe("relevantEntitiesForPassage", () => {
  it("includes only entities actually named in the passage", () => {
    const book = bookWithCast();
    const summary = relevantEntitiesForPassage("Emma locked the door behind her.", book);
    expect(summary.map((entity) => entity.name)).toEqual(["Emma Vale"]);
  });

  it("carries the character's Looks field so appearance stays grounded", () => {
    const book = bookWithCast();
    const summary = relevantEntitiesForPassage("Emma locked the door.", book);
    expect(summary[0]?.lines).toContain("Looks: Red hair, sea-worn coat");
  });

  it("never includes facts that are not locked", () => {
    const book = bookWithCast();
    const summary = relevantEntitiesForPassage("Emma locked the door.", book);
    expect(summary[0]?.lines.join(" ")).not.toContain("must not leak in");
  });

  it("returns nothing when no locked entity is mentioned", () => {
    const book = bookWithCast();
    expect(relevantEntitiesForPassage("The tide went out over empty stones.", book)).toEqual([]);
  });

  it("can surface more than one mentioned entity", () => {
    const book = bookWithCast();
    const summary = relevantEntitiesForPassage("Emma and Jonas stood on the pier.", book);
    expect(summary.map((entity) => entity.name).sort()).toEqual(["Emma Vale", "Jonas Reyes"]);
  });
});

describe("illustrationPromptMessages", () => {
  it("includes the passage, entity details, and style text in the user message", () => {
    const messages = illustrationPromptMessages(
      "Emma locked the door.",
      [{ name: "Emma Vale", lines: ["Looks: Red hair, sea-worn coat"] }],
      "Bold flat-color storybook"
    );
    expect(messages[0]?.role).toBe("system");
    const user = messages[1]?.content ?? "";
    expect(user).toContain("Emma locked the door.");
    expect(user).toContain("Looks: Red hair, sea-worn coat");
    expect(user).toContain("Bold flat-color storybook");
  });

  it("still produces a usable prompt with no entities and no style set", () => {
    const messages = illustrationPromptMessages("The tide went out.", [], "");
    const user = messages[1]?.content ?? "";
    expect(user).toContain("no locked Story Bible facts");
    expect(user).toContain("no style set");
  });
});

describe("enforceNoTextConstraint", () => {
  const style =
    "Vintage 1930s travel poster illustration, flat color blocks, textless, no text, no captions, no titles, no printed words, clean illustration without typography.";

  it("appends the constraint back when the style declared it but the model dropped it", () => {
    const generated = "A crew member rushes through the cargo bay in a flat color block style.";
    const result = enforceNoTextConstraint(generated, style);
    expect(result).toContain(generated);
    expect(result.toLowerCase()).toContain("no text");
  });

  it("leaves the output untouched when it already honors the constraint", () => {
    const generated = "A quiet dock scene, flat color blocks, textless, no captions.";
    expect(enforceNoTextConstraint(generated, style)).toBe(generated);
  });

  it("leaves the output untouched when the style never declared the constraint", () => {
    const generated = "A quiet dock scene with a hand-painted sign reading WELCOME.";
    expect(enforceNoTextConstraint(generated, "Warm painterly realism")).toBe(generated);
  });
});

describe("applyOrientationHint", () => {
  it("appends a plain-language landscape hint", () => {
    const result = applyOrientationHint("A quiet dock scene at dusk.", "landscape");
    expect(result).toBe("A quiet dock scene at dusk. Landscape orientation (4:3 aspect ratio).");
  });

  it("appends a plain-language portrait hint", () => {
    const result = applyOrientationHint("A quiet dock scene at dusk.", "portrait");
    expect(result).toBe("A quiet dock scene at dusk. Portrait orientation (3:4 aspect ratio).");
  });

  it("does not duplicate the hint if it's already present", () => {
    const generated = "A quiet dock scene. Landscape orientation (4:3 aspect ratio).";
    expect(applyOrientationHint(generated, "landscape")).toBe(generated);
  });
});
