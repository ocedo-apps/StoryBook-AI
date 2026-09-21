import "fake-indexeddb/auto";
import { indexedDB } from "fake-indexeddb";
import { afterEach, describe, expect, it } from "vitest";
import { createBook, updateChapter } from "@core/BookSchema";
import { BookNotFoundError, BookRepository } from "@persistence/Repository";

describe("BookRepository", () => {
  afterEach(async () => {
    indexedDB.deleteDatabase("storybook-ai");
  });

  it("round-trips a manuscript", async () => {
    const repo = new BookRepository(indexedDB);
    let book = createBook("The Salt Road");
    book = updateChapter(book, book.chapters[0]!.id, { prose: "Dawn on the quay." });
    await repo.save(book);

    const listed = await repo.list();
    expect(listed).toHaveLength(1);
    expect(listed[0]?.title).toBe("The Salt Road");

    const loaded = await repo.get(book.id);
    expect(loaded.chapters[0]?.prose).toBe("Dawn on the quay.");
  });

  it("round-trips chapter revisions", async () => {
    const repo = new BookRepository(indexedDB);
    let book = createBook("The Salt Road");
    book = updateChapter(book, book.chapters[0]!.id, {
      prose: "Dawn on the quay.",
      revisions: [
        {
          id: "rev-1",
          at: "2026-09-21T00:00:00.000Z",
          op: "draft",
          prose: "Empty start."
        }
      ]
    });
    await repo.save(book);
    const loaded = await repo.get(book.id);
    expect(loaded.chapters[0]?.revisions).toHaveLength(1);
    expect(loaded.chapters[0]?.revisions[0]?.prose).toBe("Empty start.");
  });

  it("deletes and then misses the row", async () => {
    const repo = new BookRepository(indexedDB);
    const book = createBook("Gone");
    await repo.save(book);
    await repo.delete(book.id);
    await expect(repo.get(book.id)).rejects.toBeInstanceOf(BookNotFoundError);
    expect(await repo.list()).toEqual([]);
  });
});
