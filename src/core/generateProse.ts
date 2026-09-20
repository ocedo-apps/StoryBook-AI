import { withCharacterProfiles } from "./characterProfile";
import { formatPredecessorForDraft } from "./continuesFrom";
import { PREDICATE_LABELS } from "./predicates";
import type { Book, Chapter } from "./BookSchema";
import { sortedChapters } from "./BookSchema";
import { formatCraftForDraft, resolveCraft, summarizeCraft } from "./craft";
import { formatReaderForPrompt, resolveReader } from "./reader";
import { visibleLockedFacts } from "./visibility";

/** Chapter Voice, if set, wins. Empty after trim still counts as unset. */
export function resolveVoice(book: { voice: string }, chapter?: { voice?: string | undefined } | null): string {
  const raw = chapter?.voice !== undefined ? chapter.voice : book.voice;
  return raw.trim();
}

export function formatVoiceForPrompt(voice: string, manuscriptVoice?: string): string {
  if (!voice) return "";
  if (manuscriptVoice !== undefined && manuscriptVoice.trim() && voice !== manuscriptVoice.trim()) {
    return `Voice:\n${voice}\nThis chapter uses a different voice from the rest of the manuscript. Stay with this chapter’s register.`;
  }
  return `Voice:\n${voice}`;
}

export function formatBibleForPrompt(
  book: Book,
  empty = "No established facts yet. You may introduce named people and places if the brief asks for them. Do not invent a secret history."
): string {
  const rows = visibleLockedFacts(book.facts, book.hidden_entities);
  const body =
    rows.length === 0
      ? empty
      : rows.map((fact) => `- ${fact.entity_label} · ${PREDICATE_LABELS[fact.predicate]}: ${fact.value}`).join("\n");
  return withCharacterProfiles(body, book.facts, book.profiles, book.hidden_entities);
}

export const DRAFT_SYSTEM = `You are a novelist drafting one chapter of literary prose.
The Story Bible is established truth. You may depict freely. You must not contradict it.
The synopsis is the intended shape of the whole story — honor its turns. It is not locked fact.
A chapter brief, if present, is the tighter instruction for this pass.
New details are allowed; they are proposals, not canon, until the author accepts them.
Honor this chapter’s point of view and tense. Voice describes tone, not camera. A chapter Voice overrides the manuscript Voice for this pass.
Reader, if set, is who the prose is for. It retunes diction and sentence length. It does not rewrite the story into a children's book. A chapter Reader overrides the manuscript Reader for this pass.
Write in the same language as the synopsis, the chapter brief, and any existing prose.
A paragraph may be long if one motive holds it. Start a new paragraph when focus shifts between present action, background, and interior thought. Do not pack a physical beat, a life history, and a philosophy into the same breath.
No title, no chapter heading, no analysis — only the prose.`;

export function draftUserPrompt(book: Book, chapter: Chapter): string {
  const chapters = sortedChapters(book);
  const predecessorBlock = formatPredecessorForDraft(chapters, chapter);

  const parts = [
    `Manuscript: ${book.title}`,
    formatCraftForDraft(resolveCraft(book, chapter), book),
    formatVoiceForPrompt(resolveVoice(book, chapter), book.voice),
    formatReaderForPrompt(resolveReader(book, chapter), book.reader_age),
    book.synopsis.trim()
      ? `Synopsis (where the story is going — follow this shape; do not treat unstated details as locked facts):\n${book.synopsis.trim()}`
      : "",
    `Story Bible:\n${formatBibleForPrompt(book)}`,
    `Chapter ${chapter.sequence_index + 1}: ${chapter.title.trim() || "Untitled"}`,
    chapter.brief.trim() ? `Chapter brief (writing instruction):\n${chapter.brief.trim()}` : "No brief. Continue the story naturally.",
    predecessorBlock,
    chapter.prose.trim()
      ? `Existing prose for this chapter (continue from the end, do not repeat):\n${chapter.prose.trim()}`
      : "This chapter is empty. Write the opening."
  ];
  return parts.filter(Boolean).join("\n\n");
}

export const PASSAGE_SYSTEM = `You are a novelist working on one marked passage.
The Story Bible is established truth. Do not contradict it.
The synopsis is the intended shape of the story, not locked fact.
Honor the point of view and tense of this chapter unless the author instruction explicitly asks to change them.
Write in the same language and voice as the passage.
Reader, if set, retunes diction and sentence length. It does not rewrite the story into a children's book.
A paragraph may be long if one motive holds it. Start a new paragraph when focus shifts between present action, background, and interior thought. Do not pack a physical beat, a life history, and a philosophy into the same breath.
Output only the requested prose — no title, quotes, or commentary.`;

export const RECAST_SYSTEM = `You recast existing chapter prose to a new camera.
Keep the same events, order, names, and meaning. Do not add scenes or facts. Do not cut plot.
Honor the requested point of view and tense. Voice describes tone, not camera.
Reader, if set, retunes diction and sentence length. It does not rewrite the story into a children's book.
Write in the same language as the existing prose.
A paragraph may be long if one motive holds it. Start a new paragraph when focus shifts between present action, background, and interior thought. Do not pack a physical beat, a life history, and a philosophy into the same breath.
No title, no chapter heading, no analysis — only the recast prose.`;

export function recastUserPrompt(book: Book, chapter: Chapter): string {
  const craft = resolveCraft(book, chapter);
  const parts = [
    `Manuscript: ${book.title}`,
    formatCraftForDraft(craft, book),
    formatVoiceForPrompt(resolveVoice(book, chapter), book.voice),
    formatReaderForPrompt(resolveReader(book, chapter), book.reader_age),
    `Story Bible:\n${formatBibleForPrompt(book)}`,
    `Chapter ${chapter.sequence_index + 1}: ${chapter.title.trim() || "Untitled"}`,
    chapter.brief.trim() ? `Chapter brief (writing instruction):\n${chapter.brief.trim()}` : "",
    `Current prose:\n${chapter.prose.trim()}`,
    `Recast the whole chapter to this camera: ${summarizeCraft(craft)}. Keep the same story. Output only the recast prose.`
  ];
  return parts.filter(Boolean).join("\n\n");
}

export type PassageMode = "extend" | "elaborate" | "instruct";

export function passageUserPrompt(args: {
  book: Book;
  chapter: Chapter | null;
  mode: PassageMode;
  before: string;
  selected: string;
  after: string;
  instruction?: string;
}): string {
  const instruction =
    args.mode === "extend"
      ? "Write only the next sentences that follow the marked passage. Do not repeat it. Stay in scene."
      : args.mode === "elaborate"
        ? "Rewrite the marked passage with more sensory and dramatic detail. Keep the same events and meaning. Output only the rewritten passage."
        : `Follow this author instruction when rewriting the marked passage. Change only what it asks. Output only the rewritten passage.\n\nAuthor instruction:\n${(args.instruction ?? "").trim()}`;

  const parts = [
    `Manuscript: ${args.book.title}`,
    formatCraftForDraft(resolveCraft(args.book, args.chapter), args.chapter ? args.book : undefined),
    formatVoiceForPrompt(resolveVoice(args.book, args.chapter), args.chapter ? args.book.voice : undefined),
    formatReaderForPrompt(
      resolveReader(args.book, args.chapter),
      args.chapter ? args.book.reader_age : undefined
    ),
    args.book.synopsis.trim() ? `Synopsis:\n${args.book.synopsis.trim()}` : "",
    `Story Bible:\n${formatBibleForPrompt(args.book)}`,
    args.chapter
      ? `Chapter ${args.chapter.sequence_index + 1}: ${args.chapter.title.trim() || "Untitled"}`
      : "This is the synopsis, not a chapter.",
    args.chapter?.brief.trim() ? `Chapter brief:\n${args.chapter.brief.trim()}` : "",
    args.before.trim() ? `Text immediately before the mark:\n${args.before}` : "",
    `Marked passage:\n${args.selected}`,
    args.after.trim() ? `Text immediately after the mark:\n${args.after}` : "",
    instruction
  ];
  return parts.filter(Boolean).join("\n\n");
}
