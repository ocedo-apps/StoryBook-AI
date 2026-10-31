import type { Book } from "./BookSchema";
import { prepareCoreBookRestore, type CoreBookRevision } from "./coreRevisionRestore";
import { newId } from "./ids";

/** The caller confirms replacement and flushes local edits before invoking this workflow. */
export async function persistCoreRestore(
  source: CoreBookRevision,
  mode: "same-book" | "new-book",
  options: {
    currentBook: Book;
    availableSeriesIds: ReadonlySet<string>;
    idExists: (id: string) => Promise<boolean>;
    save: (book: Book) => Promise<void>;
    checkpointCurrent: (book: Book) => Promise<void>;
    createId?: () => string;
  }
): Promise<Book> {
  if (source.workspace.project_id !== options.currentBook.id) throw new Error("The Core version belongs to another manuscript");
  let newBookId: string | undefined;
  if (mode === "new-book") {
    for (let attempt = 0; attempt < 10; attempt++) {
      const candidate = (options.createId ?? newId)();
      if (candidate !== options.currentBook.id && !(await options.idExists(candidate))) {
        newBookId = candidate;
        break;
      }
    }
    if (!newBookId) throw new Error("Could not allocate a new manuscript ID");
  }
  const prepared = prepareCoreBookRestore(source, mode, {
    availableSeriesIds: options.availableSeriesIds,
    ...(mode === "same-book" ? { currentBook: options.currentBook } : {}),
    ...(newBookId ? { newBookId } : {})
  });
  if (mode === "same-book") await options.checkpointCurrent(options.currentBook);
  await options.save(prepared.backup.book);
  return prepared.backup.book;
}

/**
 * "Import Codex book" (Mats, 2026-10-31) - the counterpart to
 * persistCoreRestore above for a manuscript with no local copy at all, so
 * there's no `currentBook` to restore into or compare against. Reuses
 * `prepareCoreBookRestore`'s own "same-book" branch for its real effect
 * here: with no `currentBook` option, that mode leaves the book's
 * original id/translation group/series untouched - a straight import of
 * what Codex has, not a detached fork the way "new-book" mode would be.
 */
export async function persistCoreImport(
  source: CoreBookRevision,
  options: { idExists: (id: string) => Promise<boolean>; save: (book: Book) => Promise<void> }
): Promise<Book> {
  if (!source.workspace.project_id) throw new Error("The Core manuscript is missing its own ID");
  if (await options.idExists(source.workspace.project_id)) throw new Error("This manuscript is already in your library");
  const prepared = prepareCoreBookRestore(source, "same-book");
  await options.save(prepared.backup.book);
  return prepared.backup.book;
}
