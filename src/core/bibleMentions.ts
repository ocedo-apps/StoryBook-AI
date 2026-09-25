import { sortedChapters, type Book } from "./BookSchema";
import { snippetAround } from "./findReplace";
import { entityNameTokens } from "./proseStats";

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
 * The full label plus its meaningful individual name tokens, so a bare
 * "Henrik" still counts as a mention of "Henrik Andersson". Longest first,
 * so a full-name match wins over a first-name-only match at the same spot
 * rather than the regex stopping early on the shorter alternative.
 */
export function nameVariantsForLabel(label: string): string[] {
  const trimmed = label.trim();
  if (!trimmed) return [];
  const tokens = [...entityNameTokens([trimmed])];
  const variants = new Set<string>([trimmed, ...tokens]);
  return [...variants].sort((a, b) => b.length - a.length);
}

function mentionPattern(label: string): RegExp | null {
  const variants = nameVariantsForLabel(label).map(escapeRegExp);
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
 * substring matching against the label and its name tokens, no embeddings.
 * A later, semantic version of this ("her older brother", no name at all)
 * is a separate, later step.
 */
export function mentionsForEntity(book: Book, entityLabel: string): MentionHit[] {
  const pattern = mentionPattern(entityLabel);
  if (!pattern) return [];
  const hits: MentionHit[] = [];
  for (const chapter of sortedChapters(book)) {
    const matches = matchesFor(chapter.prose, pattern);
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
