import "fake-indexeddb/auto";
import { indexedDB } from "fake-indexeddb";
import { afterEach, describe, expect, it } from "vitest";
import { createBook, updateChapter } from "@core/BookSchema";
import { newIllustrationStyle, withExampleImage } from "@core/illustrationStyle";
import { BUILTIN_ILLUSTRATION_STYLES } from "@core/illustrationStyleSeeds";
import { BookRepository } from "@persistence/Repository";
import { IllustrationStyleRepository } from "@persistence/IllustrationStyleRepository";

describe("IllustrationStyleRepository", () => {
  afterEach(async () => {
    indexedDB.deleteDatabase("storybook-ai");
  });

  it("round-trips a style, including an attached example image blob", async () => {
    const repo = new IllustrationStyleRepository(indexedDB);
    const blob = new Blob(["fake-png-bytes"], { type: "image/png" });
    const style = withExampleImage(newIllustrationStyle("Noir look", "gritty prompt text", ["Noir/Crime"]), blob);
    await repo.save(style);

    const listed = await repo.list();
    expect(listed).toHaveLength(1);
    expect(listed[0]?.name).toBe("Noir look");
    expect(listed[0]?.exampleImage?.blob).toBeInstanceOf(Blob);
    expect(listed[0]?.exampleImage?.blob.size).toBe(blob.size);
  });

  it("seeds every builtin style on an empty library", async () => {
    const repo = new IllustrationStyleRepository(indexedDB);
    await repo.ensureSeeded();
    const afterFirstSeed = await repo.list();
    expect(afterFirstSeed).toHaveLength(BUILTIN_ILLUSTRATION_STYLES.length);

    // An author-added custom style should not be wiped by seeding again.
    await repo.save(newIllustrationStyle("My own style", "custom text", []));
    await repo.ensureSeeded();
    const afterSecondSeed = await repo.list();
    expect(afterSecondSeed).toHaveLength(BUILTIN_ILLUSTRATION_STYLES.length + 1);
  });

  it("adds newly introduced builtins to an already-seeded library without touching existing rows", async () => {
    const repo = new IllustrationStyleRepository(indexedDB);
    await repo.save({ ...BUILTIN_ILLUSTRATION_STYLES[0]!, promptText: "author-edited wording" });
    await repo.save(newIllustrationStyle("My own style", "custom text", []));

    await repo.ensureSeeded();

    const listed = await repo.list();
    expect(listed).toHaveLength(BUILTIN_ILLUSTRATION_STYLES.length + 1);
    const edited = listed.find((style) => style.id === BUILTIN_ILLUSTRATION_STYLES[0]!.id);
    expect(edited?.promptText).toBe("author-edited wording");
  });

  it("replaces an existing style's image on re-save rather than keeping both", async () => {
    const repo = new IllustrationStyleRepository(indexedDB);
    const style = newIllustrationStyle("Style", "text", []);
    await repo.save(withExampleImage(style, new Blob(["one"])));
    await repo.save(withExampleImage(style, new Blob(["two-longer-blob"])));

    const listed = await repo.list();
    expect(listed).toHaveLength(1);
    expect(listed[0]?.exampleImage?.blob.size).toBe(new Blob(["two-longer-blob"]).size);
  });

  it("deletes a style", async () => {
    const repo = new IllustrationStyleRepository(indexedDB);
    const style = newIllustrationStyle("Gone", "text", []);
    await repo.save(style);
    await repo.delete(style.id);
    expect(await repo.list()).toEqual([]);
  });

  it("shares the same database as BookRepository without breaking manuscript storage", async () => {
    const books = new BookRepository(indexedDB);
    const styles = new IllustrationStyleRepository(indexedDB);

    let book = createBook("Night Keys");
    book = updateChapter(book, book.chapters[0]!.id, { prose: "Emma locked the door." });
    await books.save(book);
    await styles.save(newIllustrationStyle("Style", "text", []));

    const loadedBook = await books.get(book.id);
    expect(loadedBook.chapters[0]?.prose).toBe("Emma locked the door.");
    expect(await styles.list()).toHaveLength(1);
  });
});
