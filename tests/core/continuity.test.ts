import { describe, expect, it } from "vitest";
import { createBook, createChapter, type Book } from "@core/BookSchema";
import { knowledgeLeaksForChapter } from "@core/continuity";
import type { NarrativeFact } from "@core/NarrativeFact";

function bookWithChapters(titles: string[]): Book {
  const base = createBook("Test");
  const chapters = titles.map((title, index) => ({ ...createChapter(index, title), id: `ch${index + 1}` }));
  return { ...base, chapters };
}

function fact(overrides: Partial<NarrativeFact>): NarrativeFact {
  return {
    id: "f1",
    entity_ref: "henrik",
    entity_label: "Henrik",
    predicate: "core.identity",
    value: "Secretly the killer",
    sequence_index: 0,
    status: "locked",
    source: "author",
    created_at: "2026-09-14T00:00:00.000Z",
    ...overrides
  };
}

describe("knowledgeLeaksForChapter", () => {
  it("flags a locked fact established in a later chapter", () => {
    const book = bookWithChapters(["One", "Two", "Three"]);
    book.facts = [fact({ id: "f1", chapter_id: "ch3" })];
    const leaks = knowledgeLeaksForChapter(book, "ch1");
    expect(leaks).toHaveLength(1);
    expect(leaks[0]?.establishedChapterTitle).toBe("Three");
    expect(leaks[0]?.entityLabel).toBe("Henrik");
  });

  it("does not flag a fact established in the same or an earlier chapter", () => {
    const book = bookWithChapters(["One", "Two", "Three"]);
    book.facts = [fact({ id: "f1", chapter_id: "ch2" })];
    expect(knowledgeLeaksForChapter(book, "ch2")).toHaveLength(0);
    expect(knowledgeLeaksForChapter(book, "ch3")).toHaveLength(0);
  });

  it("does not flag a fact with no chapter_id — general worldbuilding, nothing to compare", () => {
    const book = bookWithChapters(["One", "Two"]);
    book.facts = [fact({ id: "f1" })];
    expect(knowledgeLeaksForChapter(book, "ch1")).toHaveLength(0);
  });

  it("ignores proposed/flagged facts — only locked truth can leak", () => {
    const book = bookWithChapters(["One", "Two"]);
    book.facts = [fact({ id: "f1", chapter_id: "ch2", status: "ai_proposed" })];
    expect(knowledgeLeaksForChapter(book, "ch1")).toHaveLength(0);
  });

  it("ignores a superseded fact even if its replacement is later", () => {
    const book = bookWithChapters(["One", "Two"]);
    book.facts = [fact({ id: "f1", chapter_id: "ch2", superseded_by: "f2" }), fact({ id: "f2", chapter_id: "ch2" })];
    expect(knowledgeLeaksForChapter(book, "ch1")).toHaveLength(1);
    expect(knowledgeLeaksForChapter(book, "ch1")[0]?.factId).toBe("f2");
  });

  it("ignores a fact hidden from the model", () => {
    const book = bookWithChapters(["One", "Two"]);
    book.facts = [fact({ id: "f1", chapter_id: "ch2", hidden_from_ai: true })];
    expect(knowledgeLeaksForChapter(book, "ch1")).toHaveLength(0);
  });

  it("ignores a fact hidden entity-wide", () => {
    const book = bookWithChapters(["One", "Two"]);
    book.facts = [fact({ id: "f1", chapter_id: "ch2" })];
    book.hidden_entities = ["henrik"];
    expect(knowledgeLeaksForChapter(book, "ch1")).toHaveLength(0);
  });

  it("ignores a fact established in a discarded chapter — no live reading position to compare", () => {
    const book = bookWithChapters(["One", "Two"]);
    book.chapters[1] = { ...book.chapters[1]!, discarded_at: "2026-09-20T00:00:00.000Z" };
    book.facts = [fact({ id: "f1", chapter_id: "ch2" })];
    expect(knowledgeLeaksForChapter(book, "ch1")).toHaveLength(0);
  });

  it("sorts by the establishing chapter's reading position", () => {
    const book = bookWithChapters(["One", "Two", "Three", "Four"]);
    book.facts = [
      fact({ id: "f1", entity_label: "Zed", chapter_id: "ch4" }),
      fact({ id: "f2", entity_label: "Amy", chapter_id: "ch3" })
    ];
    const leaks = knowledgeLeaksForChapter(book, "ch1");
    expect(leaks.map((leak) => leak.entityLabel)).toEqual(["Amy", "Zed"]);
  });

  it("returns nothing for an unknown chapter id", () => {
    const book = bookWithChapters(["One"]);
    expect(knowledgeLeaksForChapter(book, "missing")).toEqual([]);
  });
});
