import { touch, type Book } from "./BookSchema";
import type { NarrativeFact } from "./NarrativeFact";

function namePattern(from: string): RegExp | null {
  const source = from.trim();
  if (!source) return null;
  const escaped = source.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(?<![\\p{L}\\p{N}])${escaped}(?![\\p{L}\\p{N}])`, "giu");
}

/** Whole-name swap. Leaves longer words (Emmanuel) and brainstorm to the caller. */
export function replaceWholeName(text: string, from: string, to: string): string {
  const source = from.trim();
  const target = to.trim();
  if (!source || !target || source === target) return text;
  const pattern = namePattern(source);
  if (!pattern) return text;
  return text.replace(pattern, target);
}

export function nameHitCount(text: string, from: string): number {
  const pattern = namePattern(from);
  if (!pattern || !text) return 0;
  return text.match(pattern)?.length ?? 0;
}

export function renameEntityLabel(facts: NarrativeFact[], entity_ref: string, nextLabel: string): NarrativeFact[] {
  const label = nextLabel.trim();
  if (!label) return facts;
  return facts.map((fact) => (fact.entity_ref === entity_ref ? { ...fact, entity_label: label } : fact));
}

export function manuscriptNameHits(book: Book, from: string): number {
  let total = nameHitCount(book.synopsis, from) + nameHitCount(book.viewpoint, from);
  for (const chapter of book.chapters) {
    total += nameHitCount(chapter.title, from);
    total += nameHitCount(chapter.brief, from);
    total += nameHitCount(chapter.prose, from);
    total += nameHitCount(chapter.viewpoint ?? "", from);
  }
  for (const fact of book.facts) {
    total += nameHitCount(fact.value, from);
  }
  for (const profile of book.profiles) {
    total += nameHitCount(profile.looks, from);
    total += nameHitCount(profile.personality, from);
  }
  return total;
}

/**
 * Swap the display name in manuscript text and Story Bible claims.
 * Brainstorm is private scratch — left alone.
 */
export function replaceNameInManuscript(book: Book, from: string, to: string): Book {
  const source = from.trim();
  const target = to.trim();
  if (!source || !target || source === target) return book;
  return touch(book, {
    synopsis: replaceWholeName(book.synopsis, source, target),
    viewpoint: replaceWholeName(book.viewpoint, source, target),
    facts: book.facts.map((fact) => ({ ...fact, value: replaceWholeName(fact.value, source, target) })),
    profiles: book.profiles.map((profile) => ({
      ...profile,
      looks: replaceWholeName(profile.looks, source, target),
      personality: replaceWholeName(profile.personality, source, target)
    })),
    chapters: book.chapters.map((chapter) => ({
      ...chapter,
      title: replaceWholeName(chapter.title, source, target),
      brief: replaceWholeName(chapter.brief, source, target),
      prose: replaceWholeName(chapter.prose, source, target),
      ...(chapter.viewpoint !== undefined
        ? { viewpoint: replaceWholeName(chapter.viewpoint, source, target) }
        : {})
    }))
  });
}
