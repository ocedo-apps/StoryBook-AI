import { newId } from "./ids";

export const NOTE_COLORS = ["paper", "rust", "sage", "gold", "lilac"] as const;
export type NoteColor = (typeof NOTE_COLORS)[number];
export const DEFAULT_NOTE_COLOR: NoteColor = "paper";

export type BrainstormNote = {
  id: string;
  text: string;
  x: number;
  y: number;
  color: NoteColor;
  /** Set when the note sits in the send column. Missing = free board. */
  send_index?: number | undefined;
};

export function parseNoteColor(value: unknown): NoteColor {
  return NOTE_COLORS.some((color) => color === value) ? (value as NoteColor) : DEFAULT_NOTE_COLOR;
}

type ScratchBook = {
  id: string;
  brainstorm: string;
  brainstorm_notes: BrainstormNote[];
};

export function joinBrainstormNotes(notes: BrainstormNote[]): string {
  return notes
    .map((note) => note.text.trim())
    .filter(Boolean)
    .join("\n\n");
}

export function createBrainstormNote(
  text = "",
  x = 24,
  y = 24,
  id?: string,
  color?: NoteColor
): BrainstormNote {
  return {
    id: id?.trim() ? id : newId(),
    text,
    x: Math.max(8, x),
    y: Math.max(8, y),
    color: parseNoteColor(color)
  };
}

export function isSendNote(note: BrainstormNote): boolean {
  return note.send_index !== undefined;
}

export function boardNotes(notes: BrainstormNote[]): BrainstormNote[] {
  return notes.filter((note) => !isSendNote(note));
}

export function sendNotes(notes: BrainstormNote[]): BrainstormNote[] {
  return notes.filter(isSendNote).sort((a, b) => (a.send_index ?? 0) - (b.send_index ?? 0));
}

function reindexSend(notes: BrainstormNote[]): BrainstormNote[] {
  const send = sendNotes(notes).map((note, index) => ({ ...note, send_index: index }));
  return [...boardNotes(notes), ...send];
}

export function nextNotePosition(notes: BrainstormNote[]): { x: number; y: number } {
  const board = boardNotes(notes);
  if (board.length === 0) return { x: 24, y: 24 };
  const last = board[board.length - 1];
  if (!last) return { x: 24, y: 24 };
  return { x: last.x + 36, y: last.y + 44 };
}

/** Tops within this band count as the same row, left to right. */
const READ_ROW = 80;

/** Reading order on the free board: top to bottom, then left to right. */
export function notesInReadingOrder(notes: BrainstormNote[]): BrainstormNote[] {
  return [...notes].sort((a, b) => {
    const rowA = Math.floor(a.y / READ_ROW);
    const rowB = Math.floor(b.y / READ_ROW);
    if (rowA !== rowB) return rowA - rowB;
    if (a.x !== b.x) return a.x - b.x;
    return a.id.localeCompare(b.id);
  });
}

/** Join notes as synopsis paragraphs, in the given id order. Empty notes stay out. */
export function compileNotesToText(notes: BrainstormNote[], ids: Iterable<string>): string {
  const byId = new Map(notes.map((note) => [note.id, note]));
  const parts: string[] = [];
  for (const id of ids) {
    const text = byId.get(id)?.text.trim();
    if (text) parts.push(text);
  }
  return parts.join("\n\n");
}

export function stageBrainstormNote<T extends ScratchBook>(book: T, noteId: string, atIndex?: number): T {
  const current = ensureBrainstormNotes(book);
  const note = current.brainstorm_notes.find((item) => item.id === noteId);
  if (!note) return current;
  const queued = sendNotes(current.brainstorm_notes).filter((item) => item.id !== noteId);
  const insert = Math.max(0, Math.min(atIndex ?? queued.length, queued.length));
  queued.splice(insert, 0, { ...note, send_index: 0 });
  const board = boardNotes(current.brainstorm_notes).filter((item) => item.id !== noteId);
  return withBrainstormNotes(
    current,
    [...board, ...queued.map((item, index) => ({ ...item, send_index: index }))]
  );
}

export function unstageBrainstormNote<T extends ScratchBook>(
  book: T,
  noteId: string,
  x: number,
  y: number
): T {
  const current = ensureBrainstormNotes(book);
  const notes = current.brainstorm_notes.map((item) => {
    if (item.id !== noteId) return item;
    const next = { ...item, x: Math.max(8, x), y: Math.max(8, y) };
    delete next.send_index;
    return next;
  });
  return withBrainstormNotes(current, reindexSend(notes));
}

export function removeBrainstormNotes<T extends ScratchBook>(book: T, ids: Iterable<string>): T {
  const drop = new Set(ids);
  const current = ensureBrainstormNotes(book);
  return withBrainstormNotes(
    current,
    reindexSend(current.brainstorm_notes.filter((item) => !drop.has(item.id)))
  );
}

/** Older manuscripts only have the running text. Turn that into the first note. */
export function ensureBrainstormNotes<T extends ScratchBook>(book: T): T {
  const existing = (book.brainstorm_notes ?? []).map((note) => ({
    ...note,
    color: parseNoteColor(note.color)
  }));
  if (existing.length > 0) {
    return { ...book, brainstorm_notes: existing, brainstorm: joinBrainstormNotes(existing) };
  }
  if (!book.brainstorm.trim()) {
    return { ...book, brainstorm_notes: [], brainstorm: "" };
  }
  const notes = [createBrainstormNote(book.brainstorm, 24, 24, `${book.id}-scratch`)];
  return { ...book, brainstorm_notes: notes, brainstorm: joinBrainstormNotes(notes) };
}

export function withBrainstormNotes<T extends ScratchBook>(book: T, notes: BrainstormNote[]): T {
  return { ...book, brainstorm_notes: notes, brainstorm: joinBrainstormNotes(notes) };
}

export function addBrainstormNote<T extends ScratchBook>(book: T, note?: Partial<BrainstormNote>): T {
  const current = ensureBrainstormNotes(book);
  const pos = nextNotePosition(current.brainstorm_notes);
  const next = createBrainstormNote(
    note?.text ?? "",
    note?.x ?? pos.x,
    note?.y ?? pos.y,
    note?.id ?? newId(),
    note?.color
  );
  return withBrainstormNotes(current, [...current.brainstorm_notes, next]);
}

export function updateBrainstormNote<T extends ScratchBook>(
  book: T,
  noteId: string,
  patch: Partial<Pick<BrainstormNote, "text" | "x" | "y" | "color">>
): T {
  const current = ensureBrainstormNotes(book);
  return withBrainstormNotes(
    current,
    current.brainstorm_notes.map((item) => (item.id === noteId ? { ...item, ...patch } : item))
  );
}

export function bringBrainstormNoteForward<T extends ScratchBook>(book: T, noteId: string): T {
  const current = ensureBrainstormNotes(book);
  const index = current.brainstorm_notes.findIndex((item) => item.id === noteId);
  if (index < 0 || index === current.brainstorm_notes.length - 1) return current;
  const next = [...current.brainstorm_notes];
  const [moved] = next.splice(index, 1);
  if (!moved) return current;
  next.push(moved);
  return withBrainstormNotes(current, next);
}

export function removeBrainstormNote<T extends ScratchBook>(book: T, noteId: string): T {
  return removeBrainstormNotes(book, [noteId]);
}

export function replaceInBrainstormNotes<T extends ScratchBook>(book: T, swap: (text: string) => string): T {
  const current = ensureBrainstormNotes(book);
  return withBrainstormNotes(
    current,
    current.brainstorm_notes.map((item) => ({ ...item, text: swap(item.text) }))
  );
}

/** Used when a rewrite still produces one running string (Ask streaming on a single note). */
export function applyAssembledBrainstorm<T extends ScratchBook>(book: T, text: string): T {
  const current = ensureBrainstormNotes(book);
  const only = current.brainstorm_notes[0];
  if (!only) {
    return text.trim() ? addBrainstormNote(current, { text }) : current;
  }
  if (current.brainstorm_notes.length === 1) return updateBrainstormNote(current, only.id, { text });
  return { ...current, brainstorm: text };
}
