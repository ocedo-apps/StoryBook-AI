import { describe, expect, it } from "vitest";
import { createBook, updateChapter } from "@core/BookSchema";
import { askAboutChapterUserPrompt, askAboutSelectionUserPrompt } from "@core/askAboutPassage";

describe("askAboutSelectionUserPrompt", () => {
  it("includes the manuscript title, chapter heading, marked passage, and question", () => {
    let book = createBook("Night Keys");
    book = updateChapter(book, book.chapters[0]!.id, { title: "The quay", prose: "Emma walked to the quay. She waited." });
    const chapter = book.chapters[0]!;
    const prompt = askAboutSelectionUserPrompt({
      book,
      chapter,
      before: "Emma walked to the quay. ",
      selected: "She waited.",
      after: "",
      question: "Does this build tension?"
    });
    expect(prompt).toContain("Night Keys");
    expect(prompt).toContain("The quay");
    expect(prompt).toContain("Marked passage:\nShe waited.");
    expect(prompt).toContain("Text before the marked passage:\nEmma walked to the quay.");
    expect(prompt).toContain("Does this build tension?");
  });

  it("omits the before/after sections when empty", () => {
    let book = createBook("Night Keys");
    const chapter = book.chapters[0]!;
    const prompt = askAboutSelectionUserPrompt({
      book,
      chapter,
      before: "",
      selected: "She waited.",
      after: "",
      question: "Is this clear?"
    });
    expect(prompt).not.toContain("Text before the marked passage");
    expect(prompt).not.toContain("Text after the marked passage");
  });
});

describe("askAboutChapterUserPrompt", () => {
  it("includes the manuscript title, chapter heading, full prose, and question", () => {
    let book = createBook("Night Keys");
    book = updateChapter(book, book.chapters[0]!.id, { title: "The quay", prose: "Emma walked to the quay." });
    const chapter = book.chapters[0]!;
    const prompt = askAboutChapterUserPrompt(book, chapter, "Does the chapter end on a strong hook?");
    expect(prompt).toContain("Night Keys");
    expect(prompt).toContain("The quay");
    expect(prompt).toContain("Prose:\nEmma walked to the quay.");
    expect(prompt).toContain("Does the chapter end on a strong hook?");
  });
});
