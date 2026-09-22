import { parseBook, summarizeBook, type Book, type BookSummary } from "@core/BookSchema";

const DB_NAME = "storybook-ai";
const STORE = "books";
export const ILLUSTRATION_STYLE_STORE = "illustration_styles";
const DB_VERSION = 2;

export class BookNotFoundError extends Error {
  constructor(id: string) {
    super(`Book not found: ${id}`);
    this.name = "BookNotFoundError";
  }
}

export class SchemaValidationError extends Error {
  constructor(id: string, issues: string) {
    super(`Book ${id} failed schema validation on load: ${issues}`);
    this.name = "SchemaValidationError";
  }
}

function openDb(factory: IDBFactory): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = factory.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(ILLUSTRATION_STYLE_STORE)) {
        db.createObjectStore(ILLUSTRATION_STYLE_STORE, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("IndexedDB open failed"));
  });
}

export function asPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("IndexedDB request failed"));
  });
}

export function openStorybookDb(factory: IDBFactory = globalThis.indexedDB): Promise<IDBDatabase> {
  return openDb(factory);
}

export class BookRepository {
  constructor(private readonly factory: IDBFactory = globalThis.indexedDB) {}

  private async db(): Promise<IDBDatabase> {
    return openDb(this.factory);
  }

  async list(): Promise<BookSummary[]> {
    const db = await this.db();
    const rows = await asPromise(db.transaction(STORE, "readonly").objectStore(STORE).getAll());
    db.close();
    const books: BookSummary[] = [];
    for (const row of rows) {
      const parsed = parseBookSafe(row);
      if (parsed) books.push(summarizeBook(parsed));
    }
    return books.sort((a, b) => b.updated_at.localeCompare(a.updated_at));
  }

  async get(id: string): Promise<Book> {
    const db = await this.db();
    const row = await asPromise(db.transaction(STORE, "readonly").objectStore(STORE).get(id));
    db.close();
    if (!row) throw new BookNotFoundError(id);
    try {
      return parseBook(row);
    } catch (error) {
      throw new SchemaValidationError(id, error instanceof Error ? error.message : String(error));
    }
  }

  async save(book: Book): Promise<void> {
    const parsed = parseBook(book);
    const db = await this.db();
    await asPromise(db.transaction(STORE, "readwrite").objectStore(STORE).put(parsed));
    db.close();
  }

  async delete(id: string): Promise<void> {
    const db = await this.db();
    await asPromise(db.transaction(STORE, "readwrite").objectStore(STORE).delete(id));
    db.close();
  }
}

function parseBookSafe(row: unknown): Book | undefined {
  try {
    return parseBook(row);
  } catch {
    return undefined;
  }
}
