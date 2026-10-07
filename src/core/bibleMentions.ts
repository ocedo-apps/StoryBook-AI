import { sortedChapters, type Book } from "./BookSchema";
import { snippetAround } from "./findReplace";
import { entityNameTokens } from "./proseStats";
import { excludedSpans, overlapsAny, trackingFor } from "./entityTracking";

export type MentionHit = {
  chapterId: string;
  chapterTitle: string;
  sequenceIndex: number;
  count: number;
  snippets: string[];
};

const MENTION_SNIPPET_CAP = 2;

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * The full label (plus any aliases) and their meaningful individual name
 * tokens, so a bare "Henrik" still counts as a mention of "Henrik
 * Andersson", and an alias like "Mimi" counts as a mention of "Miriam
 * Hald". Longest first, so a full-name match wins over a first-name-only
 * match at the same spot rather than the regex stopping early on the
 * shorter alternative.
 */
export function nameVariantsForLabel(label: string, aliases: string[] = []): string[] {
  const names = [label, ...aliases].map((name) => name.trim()).filter(Boolean);
  if (names.length === 0) return [];
  const tokens = [...entityNameTokens(names)];
  const variants = new Set<string>([...names, ...tokens]);
  return [...variants].sort((a, b) => b.length - a.length);
}

function mentionPattern(label: string, aliases: string[] = []): RegExp | null {
  const variants = nameVariantsForLabel(label, aliases).map(escapeRegExp);
  if (variants.length === 0) return null;
  return new RegExp(`(?<![\\p{L}\\p{N}])(?:${variants.join("|")})(?![\\p{L}\\p{N}])`, "giu");
}

function matchesFor(text: string, pattern: RegExp): { start: number; end: number }[] {
  return [...text.matchAll(pattern)].flatMap((match) => {
    const start = match.index;
    if (start === undefined || !match[0]) return [];
    return [{ start, end: start + match[0].length }];
  });
}

export type NameHit = { start: number; end: number; entityRef: string; entityLabel: string };

/**
 * The reverse of mentionsForEntity (Story Bible → manuscript): given one
 * chapter's prose and the book's locked entities, find every name mention
 * and which entity it belongs to — roadmap-ideas.md #15, clicking a name
 * while writing to jump straight to its Story Bible card. Same matching
 * logic (mentionPattern/matchesFor), just run per entity against one text
 * instead of per entity against every chapter. Overlapping matches from
 * different entities keep the longest, earliest one.
 */
export function findNameHitsInText(
  text: string,
  entities: { entity_ref: string; entity_label: string }[]
): NameHit[] {
  const raw: NameHit[] = [];
  for (const entity of entities) {
    const pattern = mentionPattern(entity.entity_label);
    if (!pattern) continue;
    for (const { start, end } of matchesFor(text, pattern)) {
      raw.push({ start, end, entityRef: entity.entity_ref, entityLabel: entity.entity_label });
    }
  }
  raw.sort((a, b) => a.start - b.start || (b.end - b.start) - (a.end - a.start));
  const merged: NameHit[] = [];
  for (const hit of raw) {
    const last = merged[merged.length - 1];
    if (last && hit.start < last.end) continue;
    merged.push(hit);
  }
  return merged;
}

/**
 * Every live chapter whose prose mentions this entity by name — deterministic
 * substring matching against the label, its aliases, and their name tokens,
 * no embeddings. A mention that falls entirely inside one of the entity's
 * exclusion phrases (`entity_tracking`) doesn't count — for a name that
 * doubles as an ordinary word, that's how an author stops "rose garden"
 * from reading as a sighting of a character named Rose. A later, semantic
 * version of this ("her older brother", no name at all) is a separate,
 * later step.
 */
export function mentionsForEntity(book: Book, entityRef: string, entityLabel: string): MentionHit[] {
  const tracking = trackingFor(book.entity_tracking, entityRef);
  const pattern = mentionPattern(entityLabel, tracking.aliases);
  if (!pattern) return [];
  const hits: MentionHit[] = [];
  for (const chapter of sortedChapters(book)) {
    const allMatches = matchesFor(chapter.prose, pattern);
    if (allMatches.length === 0) continue;
    const excluded = tracking.exclusions.length > 0 ? excludedSpans(chapter.prose, tracking.exclusions) : [];
    const matches = excluded.length > 0 ? allMatches.filter((match) => !overlapsAny(match, excluded)) : allMatches;
    if (matches.length === 0) continue;
    hits.push({
      chapterId: chapter.id,
      chapterTitle: chapter.title.trim(),
      sequenceIndex: chapter.sequence_index,
      count: matches.length,
      snippets: matches.slice(0, MENTION_SNIPPET_CAP).map((match) => snippetAround(chapter.prose, match.start, match.end))
    });
  }
  return hits;
}
