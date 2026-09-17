import { describe, expect, it } from "vitest";
import { createBook, updateChapter } from "@core/BookSchema";
import {
  manuscriptNameHits,
  renameEntityLabel,
  replaceNameInManuscript,
  replaceWholeName
} from "@core/renameEntity";
import type { NarrativeFact } from "@core/NarrativeFact";

function fact(label: string, ref: string, value: string): NarrativeFact {
  return {
    id: ref,
    entity_ref: ref,
    entity_label: label,
    predicate: "core.identity",
    value,
    sequence_index: 0,
    status: "locked",
    source: "author",
    created_at: "2026-09-16T00:00:00.000Z"
  };
}

describe("replaceWholeName", () => {
  it("swaps a whole name and keeps possessives", () => {
    expect(replaceWholeName("Emma's keys. Emma left.", "Emma", "Amelia")).toBe("Amelia's keys. Amelia left.");
  });

  it("does not nibble a longer word", () => {
    expect(replaceWholeName("Emmanuel paid Emma.", "Emma", "Amelia")).toBe("Emmanuel paid Amelia.");
  });

  it("matches a multi-word place", () => {
    expect(replaceWholeName("The Aurora Room at dusk.", "Aurora Room", "Salt Bar")).toBe("The Salt Bar at dusk.");
  });
});

describe("renameEntityLabel", () => {
  it("renames every row for that entity and leaves others", () => {
    const facts = [
      fact("Emma", "emma", "Bartender"),
      { ...fact("Emma", "emma", "Keeps the night keys"), id: "emma-trait", predicate: "core.trait" as const },
      fact("The Odyssey", "the-odyssey", "A watch-ship")
    ];
    const next = renameEntityLabel(facts, "emma", "Amelia");
    expect(next.filter((row) => row.entity_ref === "emma").every((row) => row.entity_label === "Amelia")).toBe(true);
    expect(next.find((row) => row.entity_ref === "the-odyssey")?.entity_label).toBe("The Odyssey");
  });
});

describe("replaceNameInManuscript", () => {
  it("replaces in prose, synopsis, viewpoint, and claims, not brainstorm", () => {
    let book = createBook("Night Keys");
    book = {
      ...book,
      viewpoint: "Emma",
      synopsis: "Emma keeps the night keys.",
      brainstorm: "Emma might be the stranger. Keep this off the map.",
      facts: [fact("Emma", "emma", "The crew call her Emma.")]
    };
    book = updateChapter(book, book.chapters[0]!.id, { prose: "Emma locked the door." });
    expect(manuscriptNameHits(book, "Emma")).toBe(4);

    const next = replaceNameInManuscript(book, "Emma", "Amelia");
    expect(next.synopsis).toContain("Amelia");
    expect(next.viewpoint).toBe("Amelia");
    expect(next.chapters[0]?.prose).toBe("Amelia locked the door.");
    expect(next.facts[0]?.value).toBe("The crew call her Amelia.");
    expect(next.brainstorm).toContain("Emma might be the stranger");
  });
});
