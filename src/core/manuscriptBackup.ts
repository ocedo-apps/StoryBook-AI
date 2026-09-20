import { parseBook, type Book } from "./BookSchema";
import { SANDBOX_LIBRARY_KIND } from "./sandboxExport";
import { slugify } from "./ids";
import { buildManuscriptExport, formatExportMarkdown } from "./manuscriptExport";

export const MANUSCRIPT_BACKUP_KIND = "storybook-ai.manuscript";
export const MANUSCRIPT_BACKUP_FORMAT = 1;

export type ManuscriptBackup = {
  kind: typeof MANUSCRIPT_BACKUP_KIND;
  format: number;
  exportedAt: string;
  note: string;
  book: Book;
};

export type ManuscriptBackupErrorCode =
  | "not-backup"
  | "sandbox-export"
  | "not-manuscript"
  | "newer-format"
  | "unreadable";

export class ManuscriptBackupError extends Error {
  readonly code: ManuscriptBackupErrorCode;

  constructor(code: ManuscriptBackupErrorCode, message: string) {
    super(message);
    this.name = "ManuscriptBackupError";
    this.code = code;
  }
}

export function packManuscriptBackup(book: Book, note = "", exportedAt = new Date().toISOString()): ManuscriptBackup {
  return {
    kind: MANUSCRIPT_BACKUP_KIND,
    format: MANUSCRIPT_BACKUP_FORMAT,
    exportedAt,
    note: note.trim(),
    book
  };
}

export function parseManuscriptBackup(input: unknown): ManuscriptBackup {
  if (!input || typeof input !== "object") {
    throw new ManuscriptBackupError("not-backup", "That file is not a manuscript backup.");
  }
  const row = input as Record<string, unknown>;
  if (row.kind === SANDBOX_LIBRARY_KIND) {
    throw new ManuscriptBackupError("sandbox-export", "That file is a Sandbox card export. Import it in Sandbox, not here.");
  }
  if (row.kind !== MANUSCRIPT_BACKUP_KIND) {
    throw new ManuscriptBackupError("not-manuscript", "That file is not a StoryBook manuscript backup.");
  }
  const format = typeof row.format === "number" ? row.format : MANUSCRIPT_BACKUP_FORMAT;
  if (format > MANUSCRIPT_BACKUP_FORMAT) {
    throw new ManuscriptBackupError("newer-format", "This backup is from a newer StoryBook. Update the app, then try again.");
  }
  let book: Book;
  try {
    book = parseBook(row.book);
  } catch {
    throw new ManuscriptBackupError("unreadable", "The manuscript inside this file could not be read.");
  }
  return {
    kind: MANUSCRIPT_BACKUP_KIND,
    format,
    exportedAt: typeof row.exportedAt === "string" ? row.exportedAt : new Date().toISOString(),
    note: typeof row.note === "string" ? row.note.trim() : "",
    book
  };
}

export function manuscriptBackupBasename(book: Book, exportedAt = new Date().toISOString()): string {
  return `${fileSlug(book)}-backup-${dayStamp(exportedAt)}`;
}

export function manuscriptBackupFilename(book: Book, exportedAt = new Date().toISOString()): string {
  return `${manuscriptBackupBasename(book, exportedAt)}.json`;
}

export function manuscriptReplaceWarning(title: string): string {
  return `Replace “${title}” with this backup? Anything written since that backup will be lost.`;
}

/** True when no JSON backup is recorded, or the manuscript has changed since that backup. */
export function manuscriptNeedsJsonBackup(updatedAt: string, lastJsonBackupAt: string | null): boolean {
  if (!lastJsonBackupAt) return true;
  return updatedAt > lastJsonBackupAt;
}

export function manuscriptExportBasename(book: Book, exportedAt = new Date().toISOString()): string {
  return `${fileSlug(book)}-${dayStamp(exportedAt)}`;
}

export function manuscriptReadableFilename(book: Book, exportedAt = new Date().toISOString()): string {
  return `${manuscriptExportBasename(book, exportedAt)}.md`;
}

/** Keep a user-typed name, force the extension, strip characters a filesystem will reject. */
export function ensureDownloadFilename(name: string, ext: string, fallback = "manuscript"): string {
  const suffix = ext.replace(/^\./, "").toLowerCase();
  const cleaned = name
    .trim()
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, "")
    .replace(/[.\s]+$/g, "");
  const stem = (cleaned.replace(/\.[^.]+$/, "") || fallback).replace(/[.\s]+$/g, "") || fallback;
  return `${stem}.${suffix}`;
}

function fileSlug(book: Book): string {
  return slugify(book.title) || "manuscript";
}

function dayStamp(exportedAt: string): string {
  return exportedAt.slice(0, 10) || new Date().toISOString().slice(0, 10);
}

/** Readable copy. Omits brainstorm — that stays in the JSON restore file. */
export function formatManuscriptMarkdown(backup: ManuscriptBackup): string {
  return formatExportMarkdown(buildManuscriptExport(backup.book, backup.note, backup.exportedAt));
}
