import { z } from "zod";
import { newId, nowIso } from "./ids";

/**
 * A point the author drops mid-draft without breaking flow — "what was
 * this character's last name again?" — a sticky note at a text offset,
 * never spliced into `prose` itself. Lives *beside* the prose the same way
 * `ProseFormattingRange` does, for the same reason: the model, extraction,
 * proofreading, and word count all keep reading `prose` exactly as before.
 */
export const PlaceholderSchema = z.object({
  id: z.string().min(1),
  at: z.number().int().nonnegative(),
  note: z.string(),
  created_at: z.string().min(1)
});
export type Placeholder = z.infer<typeof PlaceholderSchema>;

export function createPlaceholder(at: number, note: string): Placeholder {
  return { id: newId(), at: Math.max(0, at), note, created_at: nowIso() };
}

export function addPlaceholder(placeholders: Placeholder[], at: number, note: string): Placeholder[] {
  return [...placeholders, createPlaceholder(at, note)].sort((a, b) => a.at - b.at);
}

export function removePlaceholder(placeholders: Placeholder[], id: string): Placeholder[] {
  return placeholders.filter((item) => item.id !== id);
}

export function updatePlaceholderNote(placeholders: Placeholder[], id: string, note: string): Placeholder[] {
  return placeholders.map((item) => (item.id === id ? { ...item, note } : item));
}

/**
 * Adjusts placeholder positions after `[editStart, editEnd)` in the
 * underlying prose is replaced by `insertedLength` characters of new text —
 * the same edit `shiftFormattingRanges` (proseFormatting.ts) already applies
 * to formatting ranges, mirrored here for a point instead of a span. A
 * placeholder sitting inside the edited span is dropped: the sentence it
 * marked is gone, so the note no longer points at anything real. One before
 * the edit is untouched; one after it shifts by the length delta.
 */
export function shiftPlaceholders(
  placeholders: Placeholder[],
  editStart: number,
  editEnd: number,
  insertedLength: number
): Placeholder[] {
  const delta = insertedLength - (editEnd - editStart);
  const result: Placeholder[] = [];
  for (const placeholder of placeholders) {
    if (placeholder.at <= editStart) {
      result.push(placeholder);
      continue;
    }
    if (placeholder.at >= editEnd) {
      result.push({ ...placeholder, at: placeholder.at + delta });
      continue;
    }
    // Inside the edited span — dropped.
  }
  return result;
}

/**
 * The smallest `[start, end)` difference between two strings that share the
 * same origin but were edited by typing — common prefix and suffix trimmed
 * off both ends. Draft/Extend/Recast/Instruct all know their own edit span
 * already (they generated the new text), but plain typing in the editor
 * doesn't carry one — this recovers an equivalent span from before/after
 * snapshots so `shiftPlaceholders` has something to work with there too.
 */
export function diffEditRange(before: string, after: string): { editStart: number; editEnd: number; insertedLength: number } {
  const minLen = Math.min(before.length, after.length);
  let start = 0;
  while (start < minLen && before[start] === after[start]) start++;
  let endBefore = before.length;
  let endAfter = after.length;
  while (endBefore > start && endAfter > start && before[endBefore - 1] === after[endAfter - 1]) {
    endBefore--;
    endAfter--;
  }
  return { editStart: start, editEnd: endBefore, insertedLength: endAfter - start };
}

export type PlaceholderLocation = { chapterId: string; chapterTitle: string; placeholder: Placeholder };

/** Collects every open placeholder across chapters, in the given (already story-ordered) list, for a book-wide list with jump-to-chapter. */
export function collectPlaceholders(chapters: { id: string; title: string; placeholders?: Placeholder[] | undefined }[]): PlaceholderLocation[] {
  const out: PlaceholderLocation[] = [];
  for (const chapter of chapters) {
    for (const placeholder of chapter.placeholders ?? []) {
      out.push({ chapterId: chapter.id, chapterTitle: chapter.title, placeholder });
    }
  }
  return out;
}
