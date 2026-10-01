import { describe, expect, it } from "vitest";
import { addChapter, createBook, updateChapter } from "@core/BookSchema";
import { filterLoreFactsByRelevance, isLoreFactRelevant, relevantContextText } from "@core/loreRelevance";
import type { NarrativeFact } from "@core/NarrativeFact";

const baseFact: NarrativeFact = {
  id: "1",
  entity_ref: "emma",
  entity_label: "Emma",
  predicate: "core.identity",
  value: "Bartender",
  sequence_index: 0,
  status: "locked",
  source: "author",
  created_at: "2026-09-16T00:00:00.000Z"
};

describe("filterLoreFactsByRelevance", () => {
  it("keeps a chapter-origin fact unconditionally, even with no matching context", () => {
    const fact: NarrativeFact = { ...baseFact, origin: "chapter" };
    expect(filterLoreFactsByRelevance([fact], { facts: [fact], event_profiles: [] }, "nothing relevant here")).toEqual([
      fact
    ]);
  });

  it("keeps a fact with no origin at all unconditionally (older saves predating the field)", () => {
    const fact: NarrativeFact = { ...baseFact };
    expect(filterLoreFactsByRelevance([fact], { facts: [fact], event_profiles: [] }, "")).toEqual([fact]);
  });

  it("drops a lore fact whose entity is never named in the context text", () => {
    const fact: NarrativeFact = { ...baseFact, origin: "lore" };
    expect(filterLoreFactsByRelevance([fact], { facts: [fact], event_profiles: [] }, "Jeff walked to the harbor")).toEqual(
      []
    );
  });

  it("keeps a lore fact whose entity name appears in the context text", () => {
    const fact: NarrativeFact = { ...baseFact, origin: "lore" };
    expect(filterLoreFactsByRelevance([fact], { facts: [fact], event_profiles: [] }, "Emma walked to the harbor")).toEqual(
      [fact]
    );
  });

  it("keeps a pinned lore fact (position_override: include) regardless of context", () => {
    const fact: NarrativeFact = { ...baseFact, origin: "lore", position_override: "include" };
    expect(filterLoreFactsByRelevance([fact], { facts: [fact], event_profiles: [] }, "nothing relevant here")).toEqual([
      fact
    ]);
  });
});

describe("isLoreFactRelevant — Event entities", () => {
  const patron: NarrativeFact = {
    ...baseFact,
    id: "2",
    entity_ref: "patron-offer",
    entity_label: "The Patron's Offer",
    origin: "lore"
  };
  const protagonist: NarrativeFact = { ...baseFact, id: "3", entity_ref: "jeff", entity_label: "Jeff" };
  const harbor: NarrativeFact = { ...baseFact, id: "4", entity_ref: "harbor", entity_label: "Harbor" };
  const facts = [patron, protagonist, harbor];

  it("keeps an Event fact whose own name is never mentioned, when a participant is named instead", () => {
    const book = {
      facts,
      event_profiles: [{ entity_ref: "patron-offer", participants: ["jeff"] }]
    };
    const contextTokens = new Set(["jeff", "walked", "home"]);
    expect(isLoreFactRelevant(patron, contextTokens, book)).toBe(true);
  });

  it("keeps an Event fact when only its location is named", () => {
    const book = {
      facts,
      event_profiles: [{ entity_ref: "patron-offer", where: "harbor", participants: [] }]
    };
    const contextTokens = new Set(["harbor", "fog"]);
    expect(isLoreFactRelevant(patron, contextTokens, book)).toBe(true);
  });

  it("drops an Event fact when neither its name, nor any participant, nor its location is named", () => {
    const book = {
      facts,
      event_profiles: [{ entity_ref: "patron-offer", where: "harbor", participants: ["jeff"] }]
    };
    const contextTokens = new Set(["unrelated", "words"]);
    expect(isLoreFactRelevant(patron, contextTokens, book)).toBe(false);
  });

  it("drops an Event fact with no profile row at all, unless named directly", () => {
    const book = { facts, event_profiles: [] };
    expect(isLoreFactRelevant(patron, new Set(["jeff"]), book)).toBe(false);
    expect(isLoreFactRelevant(patron, new Set(["patron's", "offer"]), book)).toBe(true);
  });
});

describe("relevantContextText", () => {
  it("combines the chapter's brief, prose, and tagged plotlines", () => {
    let book = createBook("Night Keys");
    book = { ...book, plotlines: [{ id: "pl1", title: "The Smuggling Ring", color: "blue", description: "Contraband at the docks" }] };
    const chapter = { ...book.chapters[0]!, brief: "Emma meets Jeff", prose: "They talked.", plotline_ids: ["pl1"] };
    book = { ...book, chapters: [chapter] };
    const text = relevantContextText(book, chapter);
    expect(text).toContain("Emma meets Jeff");
    expect(text).toContain("They talked.");
    expect(text).toContain("The Smuggling Ring");
    expect(text).toContain("Contraband at the docks");
  });

  it("includes a targeted scene's own brief and prose when sceneId is given", () => {
    let book = createBook("Night Keys");
    book = updateChapter(book, book.chapters[0]!.id, {
      prose: "First scene.\n\nSecond scene.",
      scenes: [
        { id: "s1", startParagraph: 0, brief: "Opening" },
        { id: "s2", startParagraph: 1, brief: "Reveal" }
      ]
    });
    const chapter = book.chapters[0]!;
    const text = relevantContextText(book, chapter, "s2");
    expect(text).toContain("Reveal");
    expect(text).toContain("Second scene.");
  });

  it("returns an empty string for a chapter with nothing written yet", () => {
    const book = createBook("Night Keys");
    expect(relevantContextText(book, book.chapters[0]!)).toBe("");
  });
});
