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
    const system = characterInterviewSystem(book, "henrik", "Henrik", "characters");
    expect(system).toContain("You are Henrik");
    expect(system).toContain("stubborn");
    expect(system).not.toContain("brave");
    expect(system).toContain("first person");
  });

  it("tells the model to admit a gap instead of inventing backstory when nothing is established", () => {
    const book = createBook("Night Keys");
    const system = characterInterviewSystem(book, "henrik", "Henrik", "characters");
    expect(system).toContain("Nothing is established about you");
    expect(system).toContain("rather than inventing new backstory");
  });

  it("excludes a fact hidden from the model", () => {
    const book: Book = {
      ...createBook("Night Keys"),
      facts: [fact({ id: "a", entity_ref: "henrik", value: "secretly a spy", hidden_from_ai: true })],
      hidden_entities: []
    };
    const system = characterInterviewSystem(book, "henrik", "Henrik", "characters");
    expect(system).not.toContain("secretly a spy");
  });

  it("uses the saved profile personality when no draft override is given", () => {
    const book: Book = {
      ...createBook("Night Keys"),
      profiles: [{ entity_ref: "henrik", looks: "", personality: "clipped, always sees the downside first", tags: [] }]
    };
    const system = characterInterviewSystem(book, "henrik", "Henrik", "characters");
    expect(system).toContain("clipped, always sees the downside first");
  });

  it("a personality draft overrides the saved profile personality", () => {
    const book: Book = {
      ...createBook("Night Keys"),
      profiles: [{ entity_ref: "henrik", looks: "", personality: "warm and talkative", tags: [] }]
    };
    const system = characterInterviewSystem(book, "henrik", "Henrik", "characters", "terse, one-word answers");
    expect(system).toContain("terse, one-word answers");
    expect(system).not.toContain("warm and talkative");
  });

  it("an empty-string draft overrides on purpose — clearing the field really means no personality line", () => {
    const book: Book = {
      ...createBook("Night Keys"),
      profiles: [{ entity_ref: "henrik", looks: "", personality: "warm and talkative", tags: [] }]
    };
    const system = characterInterviewSystem(book, "henrik", "Henrik", "characters", "");
    expect(system).not.toContain("warm and talkative");
    expect(system).not.toContain("How you tend to be");
  });

  it("frames a non-character entity in the third person as a worldbuilding collaborator, not a first-person voice", () => {
    const book: Book = {
      ...createBook("Night Keys"),
      facts: [fact({ id: "a", entity_ref: "ravendal", entity_label: "Ravendal", predicate: "core.place", value: "Built on a cliffside" })]
    };
    const system = characterInterviewSystem(book, "ravendal", "Ravendal", "locations");
    expect(system).toContain("worldbuilding collaborator");
    expect(system).toContain("a location in their manuscript");
    expect(system).toContain("Built on a cliffside");
    expect(system).toContain("third person");
    expect(system).not.toContain("You are Ravendal");
    expect(system).not.toContain("first person");
  });

  it("invites a plausible suggestion instead of inventing settled fact when nothing is established about a place", () => {
    const book = createBook("Night Keys");
    const system = characterInterviewSystem(book, "ravendal", "Ravendal", "locations");
    expect(system).toContain("Nothing is established about Ravendal");
    expect(system).toContain("offer a plausible, concrete suggestion");
  });

  it("never renders a personality line for a non-character kind, even with a saved profile and a draft", () => {
    const book: Book = {
      ...createBook("Night Keys"),
      profiles: [{ entity_ref: "ravendal", looks: "", personality: "brooding and ancient", tags: [] }]
    };
    const system = characterInterviewSystem(book, "ravendal", "Ravendal", "locations", "brooding and ancient");
    expect(system).not.toContain("brooding and ancient");
    expect(system).not.toContain("How you tend to be");
  });
});
