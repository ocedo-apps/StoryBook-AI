import type { Book } from "./BookSchema";
import {
  compileNotesToText,
  ensureBrainstormNotes,
  removeBrainstormNotes,
  sendNotes
} from "./brainstormNotes";
import { formatCraftForBrainstorm } from "./craft";
import { formatBibleForPrompt, type PassageMode } from "./generateProse";

export const BRAINSTORM_PASSAGE_SYSTEM = `You are a thinking partner working on private story notes.
These notes are not the book, not the synopsis, and not canon.
Do not write chapter prose. Do not treat guesses as decided.
You may offer alternatives and press on holes.
Match the language of the notes.
Output only the requested text — no title or commentary.`;

export const BRAINSTORM_ASK_SYSTEM = `You are a thinking partner for a novelist.
The notes are private scratch — not the book, not the synopsis, and not canon.
Do not write chapter prose. Do not lock facts. Do not invent a finished plot unless asked for options.
Offer alternatives, press on holes, and keep secrets in the notes.
Match the language of the notes and the author's question.
Output only your reply — no title or preamble.`;

export function liftFragmentToSynopsis(synopsis: string, fragment: string): string {
  const piece = fragment.trim();
  if (!piece) return synopsis;
  const current = synopsis.trimEnd();
  if (!current) return piece;
  if (current === piece || current.endsWith(`\n\n${piece}`)) return current;
  const last = current.split(/\n\s*\n/).at(-1)?.trim() ?? "";
  if (last === piece) return synopsis;
  return `${current}\n\n${piece}`;
}

/** Tray notes with text become synopsis paragraphs, then leave Brainstorm. Empty tray notes stay. */
export function sendStagedNotesToSynopsis(book: Book): Book {
  const current = ensureBrainstormNotes(book);
  const ids = sendNotes(current.brainstorm_notes)
    .filter((note) => note.text.trim())
    .map((note) => note.id);
  if (ids.length === 0) return current;
  const compiled = compileNotesToText(current.brainstorm_notes, ids);
  return removeBrainstormNotes(
    { ...current, synopsis: liftFragmentToSynopsis(current.synopsis, compiled) },
    ids
  );
}

export function appendBrainstormReply(notes: string, reply: string): string {
  const addition = reply.trim();
  if (!addition) return notes;
  const body = notes.trimEnd();
  if (!body) return addition;
  return `${body}\n\n${addition}`;
}

function bibleForBrainstorm(book: Book): string {
  return formatBibleForPrompt(book, "Nothing is locked yet. Secrets and alternatives belong in these notes.");
}

function storyContext(book: Book): string[] {
  return [
    `Manuscript: ${book.title}`,
    formatCraftForBrainstorm(book),
    book.voice.trim() ? `Voice:\n${book.voice.trim()}` : "",
    book.synopsis.trim()
      ? `Current map (synopsis — a chosen shape, not locked fact; notes may diverge):\n${book.synopsis.trim()}`
      : "No synopsis yet. These notes are how the story is being found.",
    `Story Bible (currently locked in the manuscript; you may propose changing these — label them as alternatives):\n${bibleForBrainstorm(book)}`
  ];
}

export function brainstormPassageUserPrompt(args: {
  book: Book;
  mode: PassageMode;
  before: string;
  selected: string;
  after: string;
  instruction?: string;
}): string {
  const instruction =
    args.mode === "extend"
      ? "Continue the marked thought in the notes. Do not repeat it. Stay in scratch — not chapter prose."
      : args.mode === "elaborate"
        ? "Expand the marked note with sharper questions, options, or detail. It remains scratch, not canon. Output only the expanded note."
        : `Follow this author instruction on the marked note. Change only what it asks. Output only the rewritten note.\n\nAuthor instruction:\n${(args.instruction ?? "").trim()}`;

  const parts = [
    ...storyContext(args.book),
    args.before.trim() ? `Notes immediately before the mark:\n${args.before}` : "",
    `Marked note:\n${args.selected}`,
    args.after.trim() ? `Notes immediately after the mark:\n${args.after}` : "",
    instruction
  ];
  return parts.filter(Boolean).join("\n\n");
}

export function brainstormAskUserPrompt(book: Book, instruction: string): string {
  const parts = [
    ...storyContext(book),
    book.brainstorm.trim() ? `Scratch notes:\n${book.brainstorm.trim()}` : "The scratch page is still empty.",
    `Author asks:\n${instruction.trim()}`
  ];
  return parts.filter(Boolean).join("\n\n");
}
