import { describe, expect, it } from "vitest";
import { createBook, type Book } from "@core/BookSchema";
import { characterInterviewSystem } from "@core/characterInterview";
import type { NarrativeFact } from "@core/NarrativeFact";

function fact(overrides: Partial<NarrativeFact> & Pick<NarrativeFact, "id" | "value" | "entity_ref">): NarrativeFact {
  return {
    entity_label: "Henrik",
    predicate: "core.trait",
    sequence_index: 0,
    status: "locked",
    source: "author",
    created_at: "2026-09-14T00:00:00.000Z",
    ...overrides
  };
}

describe("characterInterviewSystem", () => {
  it("lists only the interviewed entity's own locked facts, in first person", () => {
    const book: Book = {
      ...createBook("Night Keys"),
      facts: [
        fact({ id: "a", entity_ref: "henrik", value: "stubborn" }),
        fact({ id: "b", entity_ref: "lena", value: "brave" })
      ]
    };
    const system = characterInterviewSystem(book, "henrik", "Henrik");
    expect(system).toContain("You are Henrik");
    expect(system).toContain("stubborn");
    expect(system).not.toContain("brave");
    expect(system).toContain("first person");
  });

  it("tells the model to admit a gap instead of inventing backstory when nothing is established", () => {
    const book = createBook("Night Keys");
    const system = characterInterviewSystem(book, "henrik", "Henrik");
    expect(system).toContain("Nothing is established about you");
    expect(system).toContain("rather than inventing new backstory");
  });

  it("excludes a fact hidden from the model", () => {
    const book: Book = {
      ...createBook("Night Keys"),
      facts: [fact({ id: "a", entity_ref: "henrik", value: "secretly a spy", hidden_from_ai: true })],
      hidden_entities: []
    };
    const system = characterInterviewSystem(book, "henrik", "Henrik");
    expect(system).not.toContain("secretly a spy");
  });

  it("uses the saved profile personality when no draft override is given", () => {
    const book: Book = {
      ...createBook("Night Keys"),
      profiles: [{ entity_ref: "henrik", looks: "", personality: "clipped, always sees the downside first", tags: [] }]
    };
    const system = characterInterviewSystem(book, "henrik", "Henrik");
    expect(system).toContain("clipped, always sees the downside first");
  });

  it("a personality draft overrides the saved profile personality", () => {
    const book: Book = {
      ...createBook("Night Keys"),
      profiles: [{ entity_ref: "henrik", looks: "", personality: "warm and talkative", tags: [] }]
    };
    const system = characterInterviewSystem(book, "henrik", "Henrik", "terse, one-word answers");
    expect(system).toContain("terse, one-word answers");
    expect(system).not.toContain("warm and talkative");
  });

  it("an empty-string draft overrides on purpose — clearing the field really means no personality line", () => {
    const book: Book = {
      ...createBook("Night Keys"),
      profiles: [{ entity_ref: "henrik", looks: "", personality: "warm and talkative", tags: [] }]
    };
    const system = characterInterviewSystem(book, "henrik", "Henrik", "");
    expect(system).not.toContain("warm and talkative");
    expect(system).not.toContain("How you tend to be");
  });
});
