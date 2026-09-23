import "fake-indexeddb/auto";
import { indexedDB } from "fake-indexeddb";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createBook, updateChapter } from "@core/BookSchema";
import { newIllustrationStyle, withExampleImage } from "@core/illustrationStyle";
import { BUILTIN_EXAMPLE_IMAGE_PATHS, BUILTIN_ILLUSTRATION_STYLES } from "@core/illustrationStyleSeeds";
import { BookRepository } from "@persistence/Repository";
import { IllustrationStyleRepository } from "@persistence/IllustrationStyleRepository";

describe("IllustrationStyleRepository", () => {
  afterEach(async () => {
    indexedDB.deleteDatabase("storybook-ai");
    vi.unstubAllGlobals();
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

  it("attaches a builtin's example image from its static asset path when fetch succeeds", async () => {
    const [seededId, path] = Object.entries(BUILTIN_EXAMPLE_IMAGE_PATHS)[0]!;
    const blob = new Blob(["fake-jpeg-bytes"], { type: "image/jpeg" });
    const fetchMock = vi.fn(async (url: string) => {
      expect(url).toBe(path);
      return { ok: true, blob: async () => blob } as Response;
    });
    vi.stubGlobal("fetch", fetchMock);

    const repo = new IllustrationStyleRepository(indexedDB);
    await repo.ensureSeeded();

    const seeded = (await repo.list()).find((style) => style.id === seededId);
    expect(seeded?.exampleImage?.blob).toBeInstanceOf(Blob);
    expect(seeded?.exampleImage?.blob.size).toBe(blob.size);
  });

  it("seeds without an example image when the asset fetch fails, rather than failing the whole seed", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("network down");
      })
    );

    const repo = new IllustrationStyleRepository(indexedDB);
    await repo.ensureSeeded();

    const listed = await repo.list();
    expect(listed).toHaveLength(BUILTIN_ILLUSTRATION_STYLES.length);
    const seededId = Object.keys(BUILTIN_EXAMPLE_IMAGE_PATHS)[0]!;
    expect(listed.find((style) => style.id === seededId)?.exampleImage).toBeUndefined();
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

  it("backfills a missing example image onto an already-seeded builtin style", async () => {
    const [seededId, path] = Object.entries(BUILTIN_EXAMPLE_IMAGE_PATHS)[0]!;
    const repo = new IllustrationStyleRepository(indexedDB);
    await repo.ensureSeeded();

    const beforeBackfill = (await repo.list()).find((style) => style.id === seededId);
    expect(beforeBackfill?.exampleImage).toBeUndefined();

    const blob = new Blob(["fake-jpeg-bytes"], { type: "image/jpeg" });
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        expect(url).toBe(path);
        return { ok: true, blob: async () => blob } as Response;
      })
    );
    await repo.ensureSeeded();

    const afterBackfill = (await repo.list()).find((style) => style.id === seededId);
    expect(afterBackfill?.exampleImage?.blob).toBeInstanceOf(Blob);
    expect(afterBackfill?.exampleImage?.blob.size).toBe(blob.size);
  });

  it("never overwrites a builtin style's existing example image when re-seeding", async () => {
    const seededId = Object.keys(BUILTIN_EXAMPLE_IMAGE_PATHS)[0]!;
    const repo = new IllustrationStyleRepository(indexedDB);
    await repo.ensureSeeded();

    const original = (await repo.list()).find((style) => style.id === seededId)!;
    const ownBlob = new Blob(["author-uploaded-bytes"]);
    await repo.save(withExampleImage(original, ownBlob));

    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("should not be called for a style that already has an image");
      })
    );
    await repo.ensureSeeded();

    const listed = (await repo.list()).find((style) => style.id === seededId);
    expect(listed?.exampleImage?.blob.size).toBe(ownBlob.size);
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
