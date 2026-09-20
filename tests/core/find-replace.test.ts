import { describe, expect, it } from "vitest";
import { createBook, updateChapter } from "@core/BookSchema";
import {
  defaultFindFlags,
  findHits,
  findMarksByParagraph,
  listCanvasOccurrences,
  occurrenceOnPage,
  replaceInBook,
  replaceInText,
  totalHits
} from "@core/findReplace";
import type { NarrativeFact } from "@core/NarrativeFact";

function fact(value: string): NarrativeFact {
  return {
    id: "emma",
    entity_ref: "emma",
    entity_label: "Emma",
    predicate: "core.identity",
    value,
    sequence_index: 0,
    status: "locked",
    source: "author",
    created_at: "2026-09-19T00:00:00.000Z"
  };
}

describe("replaceInText", () => {
  it("replaces a phrase and can keep to whole words", () => {
    expect(replaceInText("The night keys hung by the door.", "night keys", "harbour keys", defaultFindFlags())).toBe(
      "The harbour keys hung by the door."
    );
    expect(replaceInText("Emmanuel paid Emma.", "Emma", "Amelia", { matchCase: false, wholeWord: true })).toBe(
      "Emmanuel paid Amelia."
    );
  });

  it("can match case", () => {
    expect(replaceInText("Quay and quay.", "quay", "pier", { matchCase: true, wholeWord: false })).toBe("Quay and pier.");
  });
});

describe("replaceInBook", () => {
  it("replaces in prose and synopsis, not Story Bible or brainstorm", () => {
    let book = createBook("Night Keys");
    book = {
      ...book,
      synopsis: "Emma keeps the night keys.",
      brainstorm: "Emma might be the stranger.",
      voice: "Dry, maritime",
      facts: [fact("The crew call her Emma.")]
    };
    book = updateChapter(book, book.chapters[0]!.id, { prose: "Emma locked the door. Emmanuel waited." });

    const flags = { matchCase: false, wholeWord: true };
    const scope = { surface: "manuscript" as const, includeBrainstorm: false };
    expect(totalHits(findHits(book, "Emma", flags, scope))).toBe(2);

    const next = replaceInBook(book, "Emma", "Amelia", flags, scope);
    expect(next.synopsis).toBe("Amelia keeps the night keys.");
    expect(next.chapters[0]?.prose).toBe("Amelia locked the door. Emmanuel waited.");
    expect(next.voice).toBe("Dry, maritime");
    expect(next.brainstorm).toContain("Emma might be the stranger");
    expect(next.facts[0]?.value).toBe("The crew call her Emma.");
    expect(next.facts[0]?.entity_label).toBe("Emma");
  });

  it("can include brainstorm and stay on this page", () => {
    let book = createBook("Night Keys");
    book = { ...book, brainstorm: "Try a foghorn. Foghorn twice.", synopsis: "A foghorn over the quay." };
    book = updateChapter(book, book.chapters[0]!.id, { prose: "A foghorn sounded." });
    const flags = defaultFindFlags();

    const here = replaceInBook(book, "foghorn", "bell", flags, {
      surface: "brainstorm",
      includeBrainstorm: false
    });
    expect(here.brainstorm).toBe("Try a bell. bell twice.");
    expect(here.synopsis).toContain("foghorn");
    expect(here.chapters[0]?.prose).toContain("foghorn");

    const withScratch = replaceInBook(book, "foghorn", "bell", flags, {
      surface: "manuscript",
      includeBrainstorm: true
    });
    expect(withScratch.brainstorm).toContain("bell");
    expect(withScratch.synopsis).toContain("bell");
    expect(withScratch.chapters[0]?.prose).toContain("bell");
  });

  it("limits a chapter scope to that chapter", () => {
    let book = createBook("Night Keys");
    const first = book.chapters[0]!;
    book = updateChapter(book, first.id, { prose: "The quay door shut." });
    book = {
      ...book,
      chapters: [
        ...book.chapters,
        { id: "c2", title: "Two", brief: "", prose: "The quay waited.", sequence_index: 1 }
      ]
    };
    const next = replaceInBook(book, "quay", "pier", defaultFindFlags(), {
      surface: "chapter",
      chapterId: first.id,
      includeBrainstorm: false
    });
    expect(next.chapters[0]?.prose).toBe("The pier door shut.");
    expect(next.chapters[1]?.prose).toBe("The quay waited.");
  });
});

describe("findHits snippets", () => {
  it("shows the surrounding words for each match in a chapter", () => {
    let book = createBook("Sample");
    book = updateChapter(
      book,
      book.chapters[0]!.id,
      { prose: "A glow at dusk. Another glow under the door. The last glow faded." }
    );
    const hits = findHits(book, "glow", defaultFindFlags(), { surface: "manuscript", includeBrainstorm: false });
    const chapter = hits.find((hit) => hit.kind === "chapter");
    expect(chapter?.count).toBe(3);
    expect(chapter?.snippets).toHaveLength(3);
    expect(chapter?.snippets.every((item) => item.preview.includes("glow"))).toBe(true);
    expect(chapter?.snippets[0]?.preview.startsWith("…A glow") || chapter?.snippets[0]?.preview.startsWith("A glow")).toBe(
      true
    );
  });

  it("does not start a snippet in the middle of a word", () => {
    const pad = "waited ".repeat(20);
    let book = createBook("Sample");
    book = updateChapter(book, book.chapters[0]!.id, { prose: `${pad}Emma locked the quay door and counted the night keys.` });
    const hits = findHits(book, "keys", defaultFindFlags(), { surface: "manuscript", includeBrainstorm: false });
    const preview = hits.find((hit) => hit.kind === "chapter")?.snippets[0]?.preview ?? "";
    expect(preview).toContain("locked");
    expect(preview.startsWith("…locked") || preview.includes(" locked")).toBe(true);
  });
});

describe("listCanvasOccurrences", () => {
  it("walks the text field in reading order and skips titles and briefs", () => {
    let book = createBook("Sample");
    book = { ...book, synopsis: "Glow on the water.", brainstorm: "Glow notes." };
    book = updateChapter(book, book.chapters[0]!.id, {
      title: "Glow",
      brief: "Glow brief",
      prose: "A glow. Another glow."
    });
    const flags = defaultFindFlags();
    const manuscript = listCanvasOccurrences(book, "glow", flags, { surface: "manuscript", includeBrainstorm: false });
    expect(manuscript.map((item) => item.field)).toEqual(["synopsis", "prose", "prose"]);
    expect(occurrenceOnPage(manuscript[0]!, "synopsis", null)).toBe(true);
    expect(occurrenceOnPage(manuscript[1]!, "chapter", book.chapters[0]!.id)).toBe(true);
    expect(occurrenceOnPage(manuscript[0]!, "chapter", book.chapters[0]!.id)).toBe(false);

    const withScratch = listCanvasOccurrences(book, "glow", flags, {
      surface: "manuscript",
      includeBrainstorm: true
    });
    expect(withScratch[0]?.field).toBe("brainstorm");
  });

  it("marks the current match inside a paragraph", () => {
    const text = "A glow in the hall.\n\nA second glow.";
    const current = text.lastIndexOf("glow");
    const marks = findMarksByParagraph(text, "glow", defaultFindFlags(), current);
    expect(marks).toHaveLength(2);
    expect(marks[0]?.[0]?.current).toBe(false);
    expect(marks[1]?.[0]?.current).toBe(true);
    expect(marks[1]?.[0]?.start).toBe("A second ".length);
  });
});

