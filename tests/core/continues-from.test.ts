import { describe, expect, it } from "vitest";
import { addChapter, createBook, removeChapter, updateChapter } from "@core/BookSchema";
import {
  CONTINUES_NONE,
  chapterContinuesCue,
  defaultPredecessor,
  formatPredecessorForDraft,
  resolvePredecessor
} from "@core/continuesFrom";
import { draftUserPrompt } from "@core/generateProse";

function withFourChapters() {
  let book = createBook("Night Keys");
  book = addChapter(book);
  book = addChapter(book);
  book = addChapter(book);
  const [one, two, three, four] = book.chapters;
  book = updateChapter(book, one!.id, { title: "The quay", prose: "Emma locked the Aurora Room.\nSalt on the step." });
  book = updateChapter(book, two!.id, { title: "The stranger", prose: "He paid in salt and did not sit." });
  book = updateChapter(book, three!.id, { title: "The keys again", prose: "" });
  book = updateChapter(book, four!.id, { title: "The coat", prose: "" });
  return book;
}

describe("resolvePredecessor", () => {
  it("defaults to the previous chapter in the list", () => {
    const book = withFourChapters();
    const third = book.chapters[2]!;
    expect(defaultPredecessor(book.chapters, third)?.title).toBe("The stranger");
    expect(resolvePredecessor(book.chapters, third)?.title).toBe("The stranger");
  });

  it("can continue a skipped chapter on the same strand", () => {
    let book = withFourChapters();
    const first = book.chapters[0]!;
    const third = book.chapters[2]!;
    book = updateChapter(book, third.id, { continues_from: first.id });
    expect(resolvePredecessor(book.chapters, book.chapters[2]!)?.title).toBe("The quay");
    expect(chapterContinuesCue(book.chapters, book.chapters[2]!)).toBe("← 1");
  });

  it("can open a new strand", () => {
    let book = withFourChapters();
    const third = book.chapters[2]!;
    book = updateChapter(book, third.id, { continues_from: CONTINUES_NONE });
    expect(resolvePredecessor(book.chapters, book.chapters[2]!)).toBeUndefined();
    expect(chapterContinuesCue(book.chapters, book.chapters[2]!)).toBe("new strand");
  });

  it("falls back to the list previous if the named chapter is gone", () => {
    let book = withFourChapters();
    const first = book.chapters[0]!;
    const third = book.chapters[2]!;
    book = updateChapter(book, third.id, { continues_from: first.id });
    book = removeChapter(book, first.id);
    const still = book.chapters.find((chapter) => chapter.title === "The keys again")!;
    expect(still.continues_from).toBeUndefined();
    expect(resolvePredecessor(book.chapters, still)?.title).toBe("The stranger");
  });
});

describe("formatPredecessorForDraft", () => {
  it("feeds the list previous by default", () => {
    const book = withFourChapters();
    const text = formatPredecessorForDraft(book.chapters, book.chapters[2]!);
    expect(text).toContain("End of the previous chapter");
    expect(text).toContain("He paid in salt and did not sit.");
    expect(text).not.toContain("not the immediately previous");
  });

  it("feeds the named strand and says it is not the list previous", () => {
    let book = withFourChapters();
    book = updateChapter(book, book.chapters[2]!.id, { continues_from: book.chapters[0]!.id });
    const text = formatPredecessorForDraft(book.chapters, book.chapters[2]!);
    expect(text).toContain("This chapter continues Chapter 1: The quay, not the immediately previous chapter.");
    expect(text).toContain("Emma locked the Aurora Room.");
    expect(text).not.toContain("He paid in salt");
  });

  it("tells Draft not to follow the previous chapter on a new strand", () => {
    let book = withFourChapters();
    book = updateChapter(book, book.chapters[2]!.id, { continues_from: CONTINUES_NONE });
    const text = formatPredecessorForDraft(book.chapters, book.chapters[2]!);
    expect(text).toContain("opens a new strand");
    expect(text).not.toContain("He paid in salt");
    expect(text).not.toContain("Emma locked");
  });
});

describe("draftUserPrompt continues from", () => {
  it("includes the strand note when drafting chapter 3 from chapter 1", () => {
    let book = withFourChapters();
    book = updateChapter(book, book.chapters[2]!.id, { continues_from: book.chapters[0]!.id });
    const prompt = draftUserPrompt(book, book.chapters[2]!);
    expect(prompt).toContain("not the immediately previous chapter");
    expect(prompt).toContain("Emma locked the Aurora Room.");
  });
});
