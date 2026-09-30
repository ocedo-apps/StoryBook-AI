import { describe, expect, it } from "vitest";
import { createBook, type Book } from "@core/BookSchema";
import { deleteEntity } from "@core/deleteEntity";
import type { NarrativeFact } from "@core/NarrativeFact";

function fact(ref: string, overrides: Partial<NarrativeFact> = {}): NarrativeFact {
  return {
    id: `${ref}-${overrides.predicate ?? "core.identity"}-${overrides.id ?? "1"}`,
    entity_ref: ref,
    entity_label: ref === "emma" ? "Emma" : "Jeff",
    predicate: "core.identity",
    value: "Something",
    sequence_index: 0,
    status: "locked",
    source: "author",
    created_at: "2026-09-26T00:00:00.000Z",
    ...overrides
  };
}

function bookWithEmma(): Book {
  let book = createBook("Night Keys");
  book = {
    ...book,
    facts: [
      fact("emma"),
      { ...fact("emma", { id: "emma-2" }), status: "ai_proposed" },
      {
        ...fact("emma", { id: "emma-old" }),
        superseded_by: "emma-super"
      },
      { ...fact("emma", { id: "emma-super" }) },
      fact("jeff")
    ],
    profiles: [
      { entity_ref: "emma", looks: "Salt-cut hands", personality: "Guarded", goals: "", fears: "", tags: [] },
      { entity_ref: "jeff", looks: "", personality: "", goals: "", fears: "", tags: [] }
    ],
    event_profiles: [
      { entity_ref: "the-storm", where: "emma", participants: ["emma", "jeff"] },
      { entity_ref: "jeff", participants: ["emma"] }
    ],
    media: [
      { entity_ref: "emma", pictures: [{ thumbDataUrl: "data:thumb", imageDataUrl: "data:full" }] },
      { entity_ref: "jeff", pictures: [] }
    ],
    hidden_entities: ["emma", "jeff"],
    entity_kinds: [
      { entity_ref: "emma", kind: "locations" },
      { entity_ref: "jeff", kind: "groups" }
    ]
  };
  return book;
}

describe("deleteEntity", () => {
  it("removes every fact for that entity, locked, pending, and superseded alike", () => {
    const next = deleteEntity(bookWithEmma(), "emma");
    expect(next.facts.some((row) => row.entity_ref === "emma")).toBe(false);
    expect(next.facts.filter((row) => row.entity_ref === "jeff")).toHaveLength(1);
  });

  it("removes the profile, pictures, hidden flag, and kind override for that entity only", () => {
    const next = deleteEntity(bookWithEmma(), "emma");
    expect(next.profiles.some((row) => row.entity_ref === "emma")).toBe(false);
    expect(next.profiles.find((row) => row.entity_ref === "jeff")).toBeTruthy();
    expect(next.media.some((row) => row.entity_ref === "emma")).toBe(false);
    expect(next.media.find((row) => row.entity_ref === "jeff")).toBeTruthy();
    expect(next.hidden_entities).toEqual(["jeff"]);
    expect(next.entity_kinds).toEqual([{ entity_ref: "jeff", kind: "groups" }]);
  });

  it("scrubs the deleted entity out of every other event's profile, and drops its own", () => {
    const next = deleteEntity(bookWithEmma(), "emma");
    // "the-storm" is an event placed at emma (as a Location) with emma
    // among its participants — deleting emma must clear "where" and drop
    // emma from participants, but the row itself survives (jeff is still
    // a participant).
    const storm = next.event_profiles.find((row) => row.entity_ref === "the-storm");
    expect(storm?.where).toBeUndefined();
    expect(storm?.participants).toEqual(["jeff"]);
    // "jeff" is also an Event here (its own event_profiles row) with emma
    // as a participant — that row survives too, minus emma.
    const jeffAsEvent = next.event_profiles.find((row) => row.entity_ref === "jeff");
    expect(jeffAsEvent?.participants).toEqual([]);
  });

  it("drops an event's own profile entirely when that event is the one deleted", () => {
    const next = deleteEntity(bookWithEmma(), "the-storm");
    expect(next.event_profiles.some((row) => row.entity_ref === "the-storm")).toBe(false);
    // Unrelated rows are untouched.
    expect(next.event_profiles.find((row) => row.entity_ref === "jeff")?.participants).toEqual(["emma"]);
  });

  it("leaves the rest of the book untouched when the entity has nothing beyond facts", () => {
    let book = createBook("Night Keys");
    book = { ...book, facts: [fact("jeff")] };
    const next = deleteEntity(book, "someone-else");
    expect(next.facts).toEqual(book.facts);
    expect(next.profiles).toEqual([]);
  });
});
