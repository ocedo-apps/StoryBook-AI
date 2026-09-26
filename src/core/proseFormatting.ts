import { z } from "zod";

/**
 * Bold/Italic/Underline live *beside* the prose, never inside it: a list of
 * character ranges into the same plain `chapter.prose` string that
 * `TextSpan` already addresses — not markup characters spliced into the
 * text itself. The model never sees a `<b>` or a `**`; it only ever reads
 * `chapter.prose`, untouched. Only the editor's display layer (proseFlow.ts,
 * ProseCanvas) is aware these ranges exist.
 */
export const FORMATTING_STYLES = ["bold", "italic", "underline"] as const;
export type ProseFormattingStyle = (typeof FORMATTING_STYLES)[number];

export const ProseFormattingRangeSchema = z.object({
  start: z.number().int().nonnegative(),
  end: z.number().int().positive(),
  style: z.enum(FORMATTING_STYLES)
});
export type ProseFormattingRange = z.infer<typeof ProseFormattingRangeSchema>;

function isValid(range: ProseFormattingRange): boolean {
  return range.end > range.start;
}

function compareRanges(a: ProseFormattingRange, b: ProseFormattingRange): number {
  return a.start - b.start || a.end - b.end || a.style.localeCompare(b.style);
}

/** Sorts and coalesces touching/overlapping same-style ranges into one. */
export function mergeAdjacentRanges(ranges: ProseFormattingRange[]): ProseFormattingRange[] {
  const byStyle = new Map<ProseFormattingStyle, ProseFormattingRange[]>();
  for (const range of ranges) {
    if (!isValid(range)) continue;
    const list = byStyle.get(range.style) ?? [];
    list.push(range);
    byStyle.set(range.style, list);
  }
  const merged: ProseFormattingRange[] = [];
  for (const [, list] of byStyle) {
    const sorted = [...list].sort((a, b) => a.start - b.start);
    let current: ProseFormattingRange | undefined;
    for (const range of sorted) {
      if (current && range.start <= current.end) {
        current = { ...current, end: Math.max(current.end, range.end) };
      } else {
        if (current) merged.push(current);
        current = { ...range };
      }
    }
    if (current) merged.push(current);
  }
  return merged.sort(compareRanges);
}

/**
 * Adjusts formatting ranges after `[editStart, editEnd)` in the underlying
 * prose is replaced by `insertedLength` characters of new, unformatted
 * text — the same edit `applyReplace`/`applyExtend` (textSpan.ts) already
 * apply to the prose string itself, so every AI or manual edit keeps
 * formatting elsewhere in the chapter aligned. A range entirely inside the
 * edited span is dropped (the new text was never formatted); a range that
 * only partially overlaps is clipped to the edit boundary rather than
 * dropped outright, so formatting just outside a rewritten passage
 * survives untouched.
 */
export function shiftFormattingRanges(
  ranges: ProseFormattingRange[],
  editStart: number,
  editEnd: number,
  insertedLength: number
): ProseFormattingRange[] {
  const delta = insertedLength - (editEnd - editStart);
  const result: ProseFormattingRange[] = [];
  for (const range of ranges) {
    if (range.end <= editStart) {
      result.push(range);
      continue;
    }
    if (range.start >= editEnd) {
      result.push({ ...range, start: range.start + delta, end: range.end + delta });
      continue;
    }
    if (range.start < editStart) {
      result.push({ ...range, end: editStart });
    }
    if (range.end > editEnd) {
      result.push({ ...range, start: editEnd + delta, end: range.end + delta });
    }
  }
  return mergeAdjacentRanges(result.filter(isValid));
}

/** True when every character in `[start, end)` already carries `style`. */
export function isFullyStyled(
  ranges: ProseFormattingRange[],
  start: number,
  end: number,
  style: ProseFormattingStyle
): boolean {
  if (end <= start) return false;
  let cursor = start;
  const matching = ranges.filter((range) => range.style === style).sort((a, b) => a.start - b.start);
  for (const range of matching) {
    if (range.start > cursor) return false;
    if (range.end > cursor) cursor = range.end;
    if (cursor >= end) return true;
  }
  return cursor >= end;
}

/**
 * Toggles `style` over `span`, the way any rich-text editor's Bold button
 * does: if the selection is already fully styled, the style is removed
 * from exactly that stretch; otherwise it is applied to the whole
 * selection, merging with any same-style range it touches.
 */
export function toggleFormatting(
  ranges: ProseFormattingRange[],
  span: { start: number; end: number },
  style: ProseFormattingStyle
): ProseFormattingRange[] {
  const start = Math.min(span.start, span.end);
  const end = Math.max(span.start, span.end);
  if (end <= start) return ranges;

  const others = ranges.filter((range) => range.style !== style);
  const same = ranges.filter((range) => range.style === style);

  if (!isFullyStyled(ranges, start, end, style)) {
    return mergeAdjacentRanges([...others, ...same, { start, end, style }]);
  }

  const remaining: ProseFormattingRange[] = [];
  for (const range of same) {
    if (range.end <= start || range.start >= end) {
      remaining.push(range);
      continue;
    }
    if (range.start < start) remaining.push({ ...range, end: start });
    if (range.end > end) remaining.push({ ...range, start: end });
  }
  return mergeAdjacentRanges([...others, ...remaining]);
}

export type FormattingSegment = { start: number; end: number; styles: ProseFormattingStyle[] };

/**
 * Splits `[from, to)` into contiguous runs that each carry a fixed set of
 * active styles — what proseFlow.ts's HTML renderer walks to decide where
 * to open and close `<b>`/`<i>`/`<u>` tags.
 */
export function formattingSegments(ranges: ProseFormattingRange[], from: number, to: number): FormattingSegment[] {
  if (to <= from || ranges.length === 0) return to > from ? [{ start: from, end: to, styles: [] }] : [];
  const breakpoints = new Set<number>([from, to]);
  for (const range of ranges) {
    if (range.start > from && range.start < to) breakpoints.add(range.start);
    if (range.end > from && range.end < to) breakpoints.add(range.end);
  }
  const points = [...breakpoints].sort((a, b) => a - b);
  const segments: FormattingSegment[] = [];
  for (let i = 0; i < points.length - 1; i++) {
    const segStart = points[i]!;
    const segEnd = points[i + 1]!;
    const styles = FORMATTING_STYLES.filter((style) =>
      ranges.some((range) => range.style === style && range.start <= segStart && range.end >= segEnd)
    );
    segments.push({ start: segStart, end: segEnd, styles });
  }
  return segments;
}

export function formattingRangesEqual(a: ProseFormattingRange[], b: ProseFormattingRange[]): boolean {
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort(compareRanges);
  const sortedB = [...b].sort(compareRanges);
  return sortedA.every((range, index) => {
    const other = sortedB[index]!;
    return range.start === other.start && range.end === other.end && range.style === other.style;
  });
}
