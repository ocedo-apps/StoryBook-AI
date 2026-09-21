import { describe, expect, it } from "vitest";
import { createBook, updateChapter } from "@core/BookSchema";
import {
  formatManuscriptMarkdown,
  MANUSCRIPT_BACKUP_FORMAT,
  MANUSCRIPT_BACKUP_KIND,
  ManuscriptBackupError,
  manuscriptBackupBasename,
  manuscriptBackupFilename,
  manuscriptExportBasename,
  manuscriptNeedsJsonBackup,
  manuscriptReplaceWarning,
  packManuscriptBackup,
  parseManuscriptBackup,
  ensureDownloadFilename
} from "@core/manuscriptBackup";
import { SANDBOX_LIBRARY_KIND } from "@core/sandboxExport";
import type { NarrativeFact } from "@core/NarrativeFact";

function fact(
  partial: Pick<NarrativeFact, "id" | "entity_ref" | "entity_label" | "predicate" | "value">
): NarrativeFact {
  return {
    sequence_index: 0,
    status: "locked",
    source: "author",
    created_at: "2026-09-16T00:00:00.000Z",
    ...partial
  };
}

describe("manuscript backup", () => {
  it("round-trips a book and keeps an empty note", () => {
    const book = createBook("Night Keys");
    const packed = packManuscriptBackup(book, "   ", "2026-09-18T21:00:00.000Z");
    expect(packed.kind).toBe(MANUSCRIPT_BACKUP_KIND);
    expect(packed.format).toBe(MANUSCRIPT_BACKUP_FORMAT);
    expect(packed.note).toBe("");
    const parsed = parseManuscriptBackup(JSON.parse(JSON.stringify(packed)));
    expect(parsed.book.title).toBe("Night Keys");
    expect(parsed.book.id).toBe(book.id);
    expect(parsed.note).toBe("");
  });

  it("keeps a what-happened line when one is given", () => {
    const book = createBook("Night Keys");
    const packed = packManuscriptBackup(book, " Recast chapter 2 ");
    expect(parseManuscriptBackup(packed).note).toBe("Recast chapter 2");
  });

  it("restores brainstorm in JSON but omits it from the readable copy", () => {
    let book = { ...createBook("Night Keys"), brainstorm: "The stowaway is the captain's sister.", synopsis: "Emma leaves before winter." };
    book = updateChapter(book, book.chapters[0]!.id, { title: "The quay", prose: "Emma locked the door." });
    const packed = packManuscriptBackup(book, "First pass");
    expect(packed.book.brainstorm).toContain("captain's sister");
    const md = formatManuscriptMarkdown(packed);
    expect(md).toContain("# Night Keys");
    expect(md).toContain("First pass");
    expect(md).toContain("Emma locked the door.");
    expect(md).not.toContain("captain's sister");
    expect(md).not.toContain("Emma leaves before winter.");
    expect(md).not.toMatch(/brainstorm/i);
  });

  it("keeps chapter revisions in JSON and leaves them out of the readable copy", () => {
    let book = createBook("Night Keys");
    book = updateChapter(book, book.chapters[0]!.id, {
      prose: "Emma locked the door.",
      revisions: [
        {
          id: "rev-1",
          at: "2026-09-21T00:00:00.000Z",
          op: "draft",
          prose: "SECRET OLD VERSION the stowaway smiled."
        }
      ]
    });
    const packed = packManuscriptBackup(book);
    expect(packed.book.chapters[0]?.revisions[0]?.prose).toBe("SECRET OLD VERSION the stowaway smiled.");
    const parsed = parseManuscriptBackup(JSON.parse(JSON.stringify(packed)));
    expect(parsed.book.chapters[0]?.revisions).toHaveLength(1);
    expect(formatManuscriptMarkdown(packed)).not.toContain("SECRET OLD VERSION");
  });

  it("lists locked Story Bible rows in the readable copy", () => {
    const book = {
      ...createBook("Night Keys"),
      facts: [fact({ id: "1", entity_ref: "emma", entity_label: "Emma", predicate: "core.identity", value: "Bartender at the Aurora Room" })]
    };
    const md = formatManuscriptMarkdown(packManuscriptBackup(book));
    expect(md).toContain("## Story Bible");
    expect(md).toContain("**Emma**");
    expect(md).toContain("Identity: Bartender at the Aurora Room");
  });

  it("rejects a Sandbox card export", () => {
    expect(() => parseManuscriptBackup({ kind: SANDBOX_LIBRARY_KIND, format: 1, characters: [] })).toThrow(
      ManuscriptBackupError
    );
  });

  it("rejects a newer format", () => {
    const book = createBook("Night Keys");
    expect(() => parseManuscriptBackup({ kind: MANUSCRIPT_BACKUP_KIND, format: 99, book })).toThrow(/newer StoryBook/);
  });

  it("names the restore file from the title and day", () => {
    const book = createBook("Night Keys");
    expect(manuscriptBackupFilename(book, "2026-09-18T21:00:00.000Z")).toBe("night-keys-backup-2026-09-18.json");
    expect(manuscriptBackupBasename(book, "2026-09-18T21:00:00.000Z")).toBe("night-keys-backup-2026-09-18");
    expect(manuscriptExportBasename(book, "2026-09-18T21:00:00.000Z")).toBe("night-keys-2026-09-18");
  });

  it("warns that a restore overwrites work since the backup", () => {
    expect(manuscriptReplaceWarning("Night Keys")).toMatch(/Anything written since that backup will be lost/);
    expect(manuscriptReplaceWarning("Night Keys")).toContain("Night Keys");
  });

  it("asks for a JSON backup when none is recorded or the book is newer", () => {
    expect(manuscriptNeedsJsonBackup("2026-09-18T21:00:00.000Z", null)).toBe(true);
    expect(manuscriptNeedsJsonBackup("2026-09-18T21:00:00.000Z", "2026-09-17T21:00:00.000Z")).toBe(true);
    expect(manuscriptNeedsJsonBackup("2026-09-18T21:00:00.000Z", "2026-09-18T21:00:00.000Z")).toBe(false);
    expect(manuscriptNeedsJsonBackup("2026-09-18T20:00:00.000Z", "2026-09-18T21:00:00.000Z")).toBe(false);
  });

  it("keeps a typed file name and forces the extension", () => {
    expect(ensureDownloadFilename("Night Keys", "json")).toBe("Night Keys.json");
    expect(ensureDownloadFilename("Night Keys.json", "json")).toBe("Night Keys.json");
    expect(ensureDownloadFilename("draft.md", "json")).toBe("draft.json");
    expect(ensureDownloadFilename("bad/name?.txt", "md")).toBe("badname.md");
    expect(ensureDownloadFilename("   ", "md")).toBe("manuscript.md");
  });
});
