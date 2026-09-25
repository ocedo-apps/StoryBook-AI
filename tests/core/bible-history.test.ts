import { describe, expect, it } from "vitest";
import { bookFactChains, chainsWithHistory, factHistoryForEntity, factsAsOfSequence } from "@core/bibleHistory";
import type { NarrativeFact } from "@core/NarrativeFact";

function fact(overrides: Partial<NarrativeFact> & Pick<NarrativeFact, "id" | "value">): NarrativeFact {
  return {
    entity_ref: "henrik",
    entity_label: "Henrik",
    predicate: "core.trait",
    sequence_index: 0,
    status: "locked",
    source: "author",
    created_at: "2026-09-14T00:00:00.000Z",
    ...overrides
  };
}

describe("factHistoryForEntity", () => {
  it("chains a fact that was superseded once, oldest first, ending at the active fact", () => {
    const facts: NarrativeFact[] = [
      fact({ id: "a", value: "brown hair", predicate: "core.trait", sequence_index: 0, superseded_by: "b", chapter_id: "ch1" }),
      fact({ id: "b", value: "dyed black hair", predicate: "core.trait", sequence_index: 1, chapter_id: "ch14" })
    ];
    const chains = factHistoryForEntity(facts, "henrik");
    expect(chains).toHaveLength(1);
    expect(chains[0]?.entries.map((f) => f.id)).toEqual(["a", "b"]);
    expect(chains[0]?.entries[1]?.superseded_by).toBeUndefined();
  });

  it("chains three supersessions in order", () => {
    const facts: NarrativeFact[] = [
      fact({ id: "a", value: "journalist", predicate: "core.identity", sequence_index: 0, superseded_by: "b" }),
      fact({ id: "b", value: "unemployed", predicate: "core.identity", sequence_index: 1, superseded_by: "c" }),
      fact({ id: "c", value: "editor", predicate: "core.identity", sequence_index: 2 })
    ];
    const chains = factHistoryForEntity(facts, "henrik");
    expect(chains).toHaveLength(1);
    expect(chains[0]?.entries.map((f) => f.id)).toEqual(["a", "b", "c"]);
  });

  it("keeps concurrent facts under the same predicate as separate single-entry chains", () => {
    const facts: NarrativeFact[] = [
      fact({ id: "a", value: "brave", predicate: "core.trait", sequence_index: 0 }),
      fact({ id: "b", value: "loyal", predicate: "core.trait", sequence_index: 1 })
    ];
    const chains = factHistoryForEntity(facts, "henrik");
    expect(chains).toHaveLength(2);
    expect(chains.map((c) => c.entries.map((f) => f.id))).toEqual([["a"], ["b"]]);
  });

  it("only includes facts for the requested entity", () => {
    const facts: NarrativeFact[] = [
      fact({ id: "a", value: "brave", entity_ref: "henrik", sequence_index: 0 }),
      fact({ id: "b", value: "cunning", entity_ref: "lena", sequence_index: 0 })
    ];
    const chains = factHistoryForEntity(facts, "henrik");
    expect(chains).toHaveLength(1);
    expect(chains[0]?.entries[0]?.id).toBe("a");
  });

  it("excludes proposed or flagged facts that never became locked truth", () => {
    const facts: NarrativeFact[] = [
      fact({ id: "a", value: "maybe a spy", status: "ai_proposed", sequence_index: 0 }),
      fact({ id: "b", value: "conflicting claim", status: "flagged", sequence_index: 1, conflict_with: "c" }),
      fact({ id: "c", value: "brave", status: "locked", sequence_index: 2 })
    ];
    const chains = factHistoryForEntity(facts, "henrik");
    expect(chains).toHaveLength(1);
    expect(chains[0]?.entries[0]?.id).toBe("c");
  });

  it("orders independent chains by their earliest entry's sequence_index", () => {
    const facts: NarrativeFact[] = [
      fact({ id: "later", value: "tall", predicate: "core.trait", sequence_index: 5 }),
      fact({ id: "earlier", value: "brave", predicate: "core.trait", sequence_index: 1 })
    ];
    const chains = factHistoryForEntity(facts, "henrik");
    expect(chains.map((c) => c.entries[0]?.id)).toEqual(["earlier", "later"]);
  });
});

describe("chainsWithHistory", () => {
  it("keeps only chains with more than one entry", () => {
    const facts: NarrativeFact[] = [
      fact({ id: "a", value: "brown hair", sequence_index: 0, superseded_by: "b" }),
      fact({ id: "b", value: "dyed black hair", sequence_index: 1 }),
      fact({ id: "c", value: "brave", predicate: "core.identity", sequence_index: 2 })
    ];
    const chains = chainsWithHistory(factHistoryForEntity(facts, "henrik"));
    expect(chains).toHaveLength(1);
    expect(chains[0]?.entries.map((f) => f.id)).toEqual(["a", "b"]);
  });
});

describe("bookFactChains", () => {
  it("builds chains across every entity in one pass, not just one", () => {
    const facts: NarrativeFact[] = [
      fact({ id: "a", value: "brown hair", entity_ref: "henrik", sequence_index: 0, superseded_by: "b" }),
      fact({ id: "b", value: "dyed black hair", entity_ref: "henrik", sequence_index: 1 }),
      fact({ id: "c", value: "cunning", entity_ref: "lena", predicate: "core.trait", sequence_index: 0 })
    ];
    const chains = bookFactChains(facts);
    expect(chains).toHaveLength(2);
    expect(chains.map((c) => c.entries.at(-1)?.entity_ref).sort()).toEqual(["henrik", "lena"]);
  });
});

describe("factsAsOfSequence", () => {
  it("picks the value that was true at a given manuscript position, not the final one", () => {
    const facts: NarrativeFact[] = [
      fact({ id: "a", value: "journalist", predicate: "core.identity", sequence_index: 0, superseded_by: "b" }),
      fact({ id: "b", value: "unemployed", predicate: "core.identity", sequence_index: 3, superseded_by: "c" }),
      fact({ id: "c", value: "editor", predicate: "core.identity", sequence_index: 8 })
    ];
    expect(factsAsOfSequence(facts, 1).map((f) => f.value)).toEqual(["journalist"]);
    expect(factsAsOfSequence(facts, 3).map((f) => f.value)).toEqual(["unemployed"]);
    expect(factsAsOfSequence(facts, 8).map((f) => f.value)).toEqual(["editor"]);
  });

  it("omits a fact that had not been established yet at that point", () => {
    const facts: NarrativeFact[] = [fact({ id: "a", value: "a locked room", predicate: "core.place", sequence_index: 5 })];
    expect(factsAsOfSequence(facts, 4)).toEqual([]);
    expect(factsAsOfSequence(facts, 5)).toHaveLength(1);
  });

  it("keeps independent chains for different entities and predicates separate", () => {
    const facts: NarrativeFact[] = [
      fact({ id: "a", value: "brave", entity_ref: "henrik", predicate: "core.trait", sequence_index: 0 }),
      fact({ id: "b", value: "loyal", entity_ref: "henrik", predicate: "core.relationship", sequence_index: 2 }),
      fact({ id: "c", value: "cunning", entity_ref: "lena", predicate: "core.trait", sequence_index: 1 })
    ];
    const asOf = factsAsOfSequence(facts, 1);
    expect(asOf.map((f) => f.id).sort()).toEqual(["a", "c"]);
  });
});
