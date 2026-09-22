import { describe, expect, it } from "vitest";
import { createBook } from "@core/BookSchema";
import { illustrationPromptMessages, relevantEntitiesForPassage } from "@core/illustrationPrompt";

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
