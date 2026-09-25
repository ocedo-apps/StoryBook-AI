import { describe, expect, it } from "vitest";
import { addChapter, createBook, discardChapter, updateChapter } from "@core/BookSchema";
import { findNameHitsInText, mentionsForEntity, nameVariantsForLabel } from "@core/bibleMentions";

describe("nameVariantsForLabel", () => {
  it("includes the full label and its meaningful name tokens, longest first", () => {
    expect(nameVariantsForLabel("Henrik Andersson")).toEqual(["Henrik Andersson", "andersson", "henrik"]);
  });

  it("drops stop words and very short tokens", () => {
    expect(nameVariantsForLabel("The Old Mill")).toEqual(["The Old Mill", "mill", "old"]);
  });

  it("returns nothing for an empty label", () => {
    expect(nameVariantsForLabel("   ")).toEqual([]);
  });
});

describe("mentionsForEntity", () => {
  it("counts a name mentioned once in a chapter", () => {
    let book = createBook("Night Keys");
    book = updateChapter(book, book.chapters[0]!.id, { title: "The quay", prose: "Emma locked the door behind her." });
    const hits = mentionsForEntity(book, "Emma");
    expect(hits).toHaveLength(1);
    expect(hits[0]?.count).toBe(1);
    expect(hits[0]?.chapterTitle).toBe("The quay");
  });

  it("counts multiple mentions in the same chapter", () => {
    let book = createBook("Night Keys");
    book = updateChapter(book, book.chapters[0]!.id, { prose: "Emma walked in. Emma sat down. Emma sighed." });
    const hits = mentionsForEntity(book, "Emma");
    expect(hits[0]?.count).toBe(3);
  });

  it("counts a bare first name as a mention of the full name, without double-counting the full-name occurrence", () => {
    let book = createBook("Night Keys");
    book = updateChapter(book, book.chapters[0]!.id, {
      prose: "Henrik Andersson walked in. Later, Henrik left. Andersson never called."
    });
    const hits = mentionsForEntity(book, "Henrik Andersson");
    // "Henrik Andersson" (1) + "Henrik" (1) + "Andersson" (1) = 3, not 4 (the phrase isn't double-counted as its own parts).
    expect(hits[0]?.count).toBe(3);
  });

  it("is case-insensitive", () => {
    let book = createBook("Night Keys");
    book = updateChapter(book, book.chapters[0]!.id, { prose: "EMMA was here. emma left." });
    const hits = mentionsForEntity(book, "Emma");
    expect(hits[0]?.count).toBe(2);
  });

  it("only matches whole words, not a name as a substring of another word", () => {
    let book = createBook("Night Keys");
    book = updateChapter(book, book.chapters[0]!.id, { prose: "The team was emmaculate in the emmasculine hallway." });
    const hits = mentionsForEntity(book, "Emma");
    expect(hits).toEqual([]);
  });

  it("lists chapters in manuscript order and skips chapters with no mention", () => {
    let book = createBook("Night Keys");
    book = updateChapter(book, book.chapters[0]!.id, { title: "One", prose: "No mention here." });
    book = addChapter(book);
    const second = book.chapters[1]!;
    book = updateChapter(book, second.id, { title: "Two", prose: "Emma returned." });
    const hits = mentionsForEntity(book, "Emma");
    expect(hits).toHaveLength(1);
    expect(hits[0]?.chapterTitle).toBe("Two");
  });

  it("excludes discarded chapters", () => {
    let book = createBook("Night Keys");
    book = updateChapter(book, book.chapters[0]!.id, { prose: "Emma was here." });
    book = addChapter(book);
    book = discardChapter(book, book.chapters[0]!.id);
    const hits = mentionsForEntity(book, "Emma");
    expect(hits).toEqual([]);
  });

  it("returns snippets around each mention, capped", () => {
    let book = createBook("Night Keys");
    book = updateChapter(book, book.chapters[0]!.id, {
      prose: "Emma one. Emma two. Emma three. Emma four."
    });
    const hits = mentionsForEntity(book, "Emma");
    expect(hits[0]?.snippets.length).toBeLessThanOrEqual(2);
    expect(hits[0]?.snippets[0]).toContain("Emma");
  });

  it("returns nothing for an empty entity label", () => {
    const book = createBook("Night Keys");
    expect(mentionsForEntity(book, "")).toEqual([]);
  });
});

describe("findNameHitsInText", () => {
  const entities = [
    { entity_ref: "emma", entity_label: "Emma" },
    { entity_ref: "henrik", entity_label: "Henrik Andersson" }
  ];

  it("tags each hit with the entity it belongs to", () => {
    const hits = findNameHitsInText("Emma met Henrik Andersson by the quay.", entities);
    expect(hits.map((hit) => hit.entityRef)).toEqual(["emma", "henrik"]);
  });

  it("prefers the longer match when two entities' names overlap at the same spot", () => {
    const ambiguous = [
      { entity_ref: "henrik", entity_label: "Henrik" },
      { entity_ref: "henrik-andersson", entity_label: "Henrik Andersson" }
    ];
    const hits = findNameHitsInText("Henrik Andersson walked in.", ambiguous);
    expect(hits).toHaveLength(1);
    expect(hits[0]?.entityRef).toBe("henrik-andersson");
  });

  it("returns nothing when no known name appears", () => {
    expect(findNameHitsInText("The tide pulled away from the shore.", entities)).toEqual([]);
  });

  it("returns nothing for an empty entity list", () => {
    expect(findNameHitsInText("Emma was here.", [])).toEqual([]);
  });
});
