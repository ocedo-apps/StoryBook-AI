import { z } from "zod";

/**
 * Alternate names and false-positive guards for one entity — the same
 * side-table pattern as `profiles`/`entity_kinds`. Aliases extend name
 * matching (mentions tracker, lore-relevance filter) beyond the entity's
 * primary label, so a nickname ("Mimi" for "Miriam Hald") still counts.
 * Exclusions are phrases that must NOT count as a mention even though the
 * name/alias appears inside them — for a name that doubles as an ordinary
 * word ("Rose"), excluding "rose garden" stops that phrase from flagging
 * every mention of the flower bed as a sighting of the character.
 */
export const EntityTrackingSchema = z.object({
  entity_ref: z.string().min(1),
  aliases: z.array(z.string().min(1)).default([]),
  exclusions: z.array(z.string().min(1)).default([])
});
export type EntityTracking = z.infer<typeof EntityTrackingSchema>;

export type EntityTrackingInput = {
  entity_ref: string;
  aliases?: string[];
  exclusions?: string[];
};

export function emptyTracking(entity_ref: string): EntityTracking {
  return { entity_ref, aliases: [], exclusions: [] };
}

export function trackingFor(rows: EntityTracking[], entity_ref: string): EntityTracking {
  return rows.find((row) => row.entity_ref === entity_ref) ?? emptyTracking(entity_ref);
}

function cleanList(values: string[] | undefined): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of values ?? []) {
    const value = raw.trim();
    if (!value) continue;
    const key = value.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(value);
  }
  return out;
}

export function trackingIsEmpty(tracking: Pick<EntityTracking, "aliases" | "exclusions">): boolean {
  return tracking.aliases.length === 0 && tracking.exclusions.length === 0;
}

export function upsertEntityTracking(rows: EntityTracking[], input: EntityTrackingInput): EntityTracking[] {
  const cleaned: EntityTracking = {
    entity_ref: input.entity_ref,
    aliases: cleanList(input.aliases),
    exclusions: cleanList(input.exclusions)
  };
  const others = rows.filter((row) => row.entity_ref !== input.entity_ref);
  if (trackingIsEmpty(cleaned)) return others;
  return [...others, cleaned];
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Every span in `text` covered by one of the exclusion phrases (case-insensitive). */
export function excludedSpans(text: string, exclusions: string[]): { start: number; end: number }[] {
  const spans: { start: number; end: number }[] = [];
  for (const phrase of exclusions) {
    const trimmed = phrase.trim();
    if (!trimmed) continue;
    const pattern = new RegExp(escapeRegExp(trimmed), "gi");
    for (const match of text.matchAll(pattern)) {
      if (match.index === undefined) continue;
      spans.push({ start: match.index, end: match.index + match[0].length });
    }
  }
  return spans;
}

export function overlapsAny(span: { start: number; end: number }, spans: { start: number; end: number }[]): boolean {
  return spans.some((other) => span.start < other.end && other.start < span.end);
}

/** `text` with every exclusion phrase blanked out — for token-set matching (lore relevance), where position doesn't matter. */
export function stripExclusions(text: string, exclusions: string[]): string {
  if (exclusions.length === 0) return text;
  let out = text;
  for (const phrase of exclusions) {
    const trimmed = phrase.trim();
    if (!trimmed) continue;
    out = out.replace(new RegExp(escapeRegExp(trimmed), "gi"), " ");
  }
  return out;
}
