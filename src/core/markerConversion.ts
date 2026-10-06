import { z } from "zod";
import {
  FORMATTING_STYLES,
  mergeAdjacentRanges,
  shiftFormattingRanges,
  type ProseFormattingRange
} from "./proseFormatting";
import { shiftPlaceholders, type Placeholder } from "./placeholders";
import { shiftDarlings, type Darling } from "./darlings";

/**
 * One "text wrapped in `open`…`close` becomes `style`" rule, e.g. `*`…`*` →
 * italic, `**`…`**` → bold. `open` and `close` are almost always the same
 * string (a symmetric marker), but don't have to be — smart/curly quotes
 * ("“" opening, "”" closing) are two different characters, and
 * only an asymmetric pair can match them at all.
 */
export const MarkerConversionRuleSchema = z.object({
  open: z.string(),
  close: z.string(),
  style: z.enum(FORMATTING_STYLES)
});
export type MarkerConversionRule = z.infer<typeof MarkerConversionRuleSchema>;

/** Shown the first time an author opens the tool, before they've saved any rules of their own. */
export const DEFAULT_MARKER_CONVERSION_RULES: MarkerConversionRule[] = [
  { open: "*", close: "*", style: "italic" },
  { open: "**", close: "**", style: "bold" }
];

export type MarkerConversionResult = {
  prose: string;
  formatting: ProseFormattingRange[];
  placeholders: Placeholder[];
  darlings: Darling[];
  count: number;
};

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Converts marker-delimited spans (imported from another writing tool's
 * plain-text convention, e.g. `*italic*`, `**bold**`, or “curly quoted
 * dialogue”) into real formatting ranges, stripping the marker characters
 * out of the plain text itself.
 *
 * Longer/combined markers run first — `**` before `*` — so `**bold**` is
 * never mistaken for an unmatched `*` by a shorter rule. Each match is applied
 * through `shiftFormattingRanges`, the same "replace this span with N
 * unformatted characters" primitive every AI edit already goes through, so
 * any formatting already present elsewhere in the chapter stays aligned.
 * Matches are applied right-to-left so earlier offsets in the same pass
 * stay valid as later ones are edited.
 *
 * Known limitation: a marker match nested entirely inside an
 * already-converted span from an earlier rule (e.g. `**he said *softly*
 * back**`) loses the outer style over just the nested word — the same
 * "edited span drops formatting inside it" trade-off `shiftFormattingRanges`
 * makes for every other kind of edit. Flat, non-nested markers (the common
 * case for a single inner-voice convention) are unaffected.
 */
export function applyMarkerConversion(
  prose: string,
  formatting: ProseFormattingRange[],
  rules: MarkerConversionRule[],
  placeholders: Placeholder[] = [],
  darlings: Darling[] = []
): MarkerConversionResult {
  const ordered = rules
    .filter((rule) => rule.open.trim().length > 0 && rule.close.trim().length > 0)
    .sort((a, b) => b.open.length + b.close.length - (a.open.length + a.close.length));
  let text = prose;
  let ranges = [...formatting];
  let points = [...placeholders];
  let kept = [...darlings];
  let count = 0;

  for (const rule of ordered) {
    const escapedOpen = escapeRegExp(rule.open);
    const escapedClose = escapeRegExp(rule.close);
    const pattern = new RegExp(`${escapedOpen}([^\\n]+?)${escapedClose}`, "g");
    const matches: { start: number; end: number; inner: string }[] = [];
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(text)) !== null) {
      const inner = match[1] ?? "";
      const start = match.index;
      const end = start + match[0].length;
      matches.push({ start, end, inner });
      pattern.lastIndex = end;
    }
    for (let i = matches.length - 1; i >= 0; i--) {
      const { start, end, inner } = matches[i]!;
      text = text.slice(0, start) + inner + text.slice(end);
      ranges = shiftFormattingRanges(ranges, start, end, inner.length);
      ranges.push({ start, end: start + inner.length, style: rule.style });
      points = shiftPlaceholders(points, start, end, inner.length);
      kept = shiftDarlings(kept, start, end, inner.length);
      count++;
    }
  }

  return { prose: text, formatting: mergeAdjacentRanges(ranges), placeholders: points, darlings: kept, count };
}
