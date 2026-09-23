import { parseIllustrationStyle, withExampleImage, type IllustrationStyle } from "@core/illustrationStyle";
import { BUILTIN_EXAMPLE_IMAGE_PATHS, BUILTIN_ILLUSTRATION_STYLES } from "@core/illustrationStyleSeeds";
import { asPromise, ILLUSTRATION_STYLE_STORE, openStorybookDb } from "./Repository";

/** Best-effort: a missing or failed fetch just means that style seeds without an example image. */
async function withBuiltinExampleImage(style: IllustrationStyle): Promise<IllustrationStyle> {
  const path = BUILTIN_EXAMPLE_IMAGE_PATHS[style.id];
  if (!path) return style;
  try {
    const response = await fetch(path);
    if (!response.ok) return style;
    return withExampleImage(style, await response.blob());
  } catch {
    return style;
  }
}

export class IllustrationStyleRepository {
  constructor(private readonly factory: IDBFactory = globalThis.indexedDB) {}

  private async db(): Promise<IDBDatabase> {
    return openStorybookDb(this.factory);
  }

  async list(): Promise<IllustrationStyle[]> {
    const db = await this.db();
    const rows = await asPromise(
      db.transaction(ILLUSTRATION_STYLE_STORE, "readonly").objectStore(ILLUSTRATION_STYLE_STORE).getAll()
    );
    db.close();
    const styles: IllustrationStyle[] = [];
    for (const row of rows) {
      try {
        styles.push(parseIllustrationStyle(row));
      } catch {
        continue;
      }
    }
    return styles.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
  }

  async save(style: IllustrationStyle): Promise<void> {
    const parsed = parseIllustrationStyle(style);
    const db = await this.db();
    await asPromise(
      db.transaction(ILLUSTRATION_STYLE_STORE, "readwrite").objectStore(ILLUSTRATION_STYLE_STORE).put(parsed)
    );
    db.close();
  }

  async delete(id: string): Promise<void> {
    const db = await this.db();
    await asPromise(
      db.transaction(ILLUSTRATION_STYLE_STORE, "readwrite").objectStore(ILLUSTRATION_STYLE_STORE).delete(id)
    );
    db.close();
  }

  /** Adds any builtin style not yet in the library, by id — never touches an existing row, so later batches of new builtins land without disturbing author edits or custom styles. */
  async ensureSeeded(): Promise<void> {
    const existing = await this.list();
    const existingIds = new Set(existing.map((style) => style.id));
    const missing = BUILTIN_ILLUSTRATION_STYLES.filter((style) => !existingIds.has(style.id));
    if (missing.length === 0) return;
    const withImages = await Promise.all(missing.map(withBuiltinExampleImage));
    const db = await this.db();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(ILLUSTRATION_STYLE_STORE, "readwrite");
      const store = tx.objectStore(ILLUSTRATION_STYLE_STORE);
      for (const style of withImages) store.put(style);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error ?? new Error("Seeding illustration styles failed"));
    });
    db.close();
  }
}
