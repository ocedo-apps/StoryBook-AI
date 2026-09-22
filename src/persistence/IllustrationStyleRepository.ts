import { parseIllustrationStyle, type IllustrationStyle } from "@core/illustrationStyle";
import { BUILTIN_ILLUSTRATION_STYLES } from "@core/illustrationStyleSeeds";
import { asPromise, ILLUSTRATION_STYLE_STORE, openStorybookDb } from "./Repository";

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

  /** Seeds the six builtin styles once, only when the library is empty — never overwrites author edits. */
  async ensureSeeded(): Promise<void> {
    const existing = await this.list();
    if (existing.length > 0) return;
    const db = await this.db();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(ILLUSTRATION_STYLE_STORE, "readwrite");
      const store = tx.objectStore(ILLUSTRATION_STYLE_STORE);
      for (const style of BUILTIN_ILLUSTRATION_STYLES) store.put(style);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error ?? new Error("Seeding illustration styles failed"));
    });
    db.close();
  }
}
