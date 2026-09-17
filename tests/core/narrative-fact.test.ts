import { describe, expect, it } from "vitest";
import { slugify, normalizeValue } from "@core/ids";
import { NarrativeFactSchema } from "@core/NarrativeFact";

describe("slugify", () => {
  it("turns a display name into a stable ref", () => {
    expect(slugify("Emma Vale")).toBe("emma-vale");
    expect(slugify("  The Aurora Room ")).toBe("the-aurora-room");
  });
});

describe("NarrativeFactSchema", () => {
  it("accepts a locked core fact", () => {
    const fact = NarrativeFactSchema.parse({
      id: "f1",
      entity_ref: "emma-vale",
      entity_label: "Emma Vale",
      predicate: "core.identity",
      value: "Bartender at the Aurora Room",
      sequence_index: 0,
      status: "locked",
      source: "author",
      created_at: "2026-09-14T00:00:00.000Z"
    });
    expect(fact.predicate).toBe("core.identity");
  });

  it("rejects rpg predicates — they do not belong in this app's bible", () => {
    expect(() =>
      NarrativeFactSchema.parse({
        id: "f1",
        entity_ref: "emma",
        entity_label: "Emma",
        predicate: "rpg.stats",
        value: "12",
        sequence_index: 0,
        status: "locked",
        source: "author",
        created_at: "2026-09-14T00:00:00.000Z"
      })
    ).toThrow();
  });
});

describe("normalizeValue", () => {
  it("treats spacing and case as the same claim", () => {
    expect(normalizeValue("  Sister of Kael ")).toBe(normalizeValue("sister of kael"));
  });
});
