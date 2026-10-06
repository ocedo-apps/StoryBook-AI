import { z } from "zod";
import { newId, nowIso } from "./ids";

/**
 * "Kill your darlings" — but keep the bodies. A passage the author cut from
 * `prose` on purpose, not lost: the removed text itself, plus the position
 * it came from, so it can be dropped back in later. Lives *beside* the
 * prose the same way `Placeholder`/`ProseFormattingRange` do, until it's
 * restored — at which point it's spliced back into `prose` like any other
 * edit.
 */
export const DarlingSchema = z.object({
  id: z.string().min(1),
  at: z.number().int().nonnegative(),
  text: z.string().min(1),
  created_at: z.string().min(1)
});
export type Darling = z.infer<typeof DarlingSchema>;

function createDarling(at: number, text: string): Darling {
  return { id: newId(), at: Math.max(0, at), text, created_at: nowIso() };
}

/**
 * Mirrors `shiftFormattingRanges`/`shiftPlaceholders`: keeps darling
 * positions aligned with an edit elsewhere in the same chapter. A darling
 * whose own spot is swallowed by the edit is dropped — same trade-off every
 * other position-tracked thing in the chapter makes.
 */
export function shiftDarlings(darlings: Darling[], editStart: number, editEnd: number, insertedLength: number): Darling[] {
  const delta = insertedLength - (editEnd - editStart);
  const result: Darling[] = [];
  for (const darling of darlings) {
    if (darling.at <= editStart) {
      result.push(darling);
      continue;
    }
    if (darling.at >= editEnd) {
      result.push({ ...darling, at: darling.at + delta });
      continue;
    }
    // Inside the edited span — dropped.
  }
  return result;
}

export type CutToDarlingResult = { prose: string; darlings: Darling[] };

/** Removes `[span.start, span.end)` from `prose` and keeps it as a new darling at that spot. Existing darlings shift around the cut like any other edit. */
export function cutToDarling(prose: string, span: { start: number; end: number }, darlings: Darling[]): CutToDarlingResult {
  const start = Math.max(0, Math.min(span.start, span.end));
  const end = Math.min(prose.length, Math.max(span.start, span.end));
  const text = prose.slice(start, end);
  const nextProse = prose.slice(0, start) + prose.slice(end);
  const shifted = shiftDarlings(darlings, start, end, 0);
  return { prose: nextProse, darlings: [...shifted, createDarling(start, text)] };
}

export type RestoreDarlingResult = { prose: string; darlings: Darling[] };

/**
 * Splices a darling's text back into `prose` at its tracked spot — clamped
 * to the current prose length, since edits elsewhere (especially a
 * wholesale rewrite like Recast, which doesn't attempt to keep darling
 * positions meaningful) can leave it stale. Never loses the darling's text
 * trying to find the "right" spot; restoring is always possible, just not
 * always exactly where it was cut from.
 */
export function restoreDarling(prose: string, darlings: Darling[], id: string): RestoreDarlingResult | null {
  const darling = darlings.find((item) => item.id === id);
  if (!darling) return null;
  const at = Math.max(0, Math.min(darling.at, prose.length));
  const nextProse = prose.slice(0, at) + darling.text + prose.slice(at);
  const rest = darlings.filter((item) => item.id !== id);
  const shifted = shiftDarlings(rest, at, at, darling.text.length);
  return { prose: nextProse, darlings: shifted };
}

export function discardDarling(darlings: Darling[], id: string): Darling[] {
  return darlings.filter((item) => item.id !== id);
}

export type DarlingLocation = { chapterId: string; chapterTitle: string; darling: Darling };

/** Collects every kept darling across chapters, in the given (already story-ordered) list, for a book-wide tray. */
export function collectDarlings(chapters: { id: string; title: string; darlings?: Darling[] | undefined }[]): DarlingLocation[] {
  const out: DarlingLocation[] = [];
  for (const chapter of chapters) {
    for (const darling of [...(chapter.darlings ?? [])].sort((a, b) => b.created_at.localeCompare(a.created_at))) {
      out.push({ chapterId: chapter.id, chapterTitle: chapter.title, darling });
    }
  }
  return out;
}
