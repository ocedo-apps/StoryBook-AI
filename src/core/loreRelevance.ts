import { entityNameTokens, normalizeWord } from "./proseStats";
import { eventProfileFor } from "./eventProfile";
import { plotlinesForChapter } from "./plotlines";
import { chapterScenes } from "./bookScene";
import type { Book, Chapter } from "./BookSchema";
import type { NarrativeFact } from "./NarrativeFact";

/**
 * Lore-import facts can grow large (roadmap-ideas.md #38 — a tester
 * importing a heavy existing setting) while chapter/interview-origin facts
 * stay modest, growing only as fast as the manuscript itself. Unlike those,
 * a lore fact isn't "what the story has established" — it's background the
 * model shouldn't invent against, which only matters when the chapter
 * being drafted actually touches it. `Book.filter_lore_by_relevance` (off
 * by default) turns this filter on; see `formatBibleForPromptAtPosition`.
 */

function textTokens(text: string): Set<string> {
  const tokens = new Set<string>();
  for (const raw of text.split(/[^\p{L}\p{N}']+/u)) {
    const token = normalizeWord(raw);
    if (token) tokens.add(token);
  }
  return tokens;
}

/**
 * Everything already decided or written for this chapter (or scene) at
 * Draft time: brief, tagged Plotlines, prose so far, and — for a
 * scene-targeted pass — that scene's own brief and prose. Deliberately not
 * the Story Bible itself; matching lore against other lore would make
 * everything relevant to everything else, defeating the filter.
 */
export function relevantContextText(book: Book, chapter: Chapter, sceneId?: string): string {
  const parts = [chapter.brief, chapter.prose];
  for (const thread of plotlinesForChapter(book, chapter)) {
    parts.push(thread.title, thread.description ?? "");
  }
  if (sceneId) {
    const scene = chapterScenes(chapter).find((item) => item.id === sceneId);
    if (scene) parts.push(scene.brief ?? "", scene.prose);
  }
  return parts.filter(Boolean).join("\n");
}

function labelForRef(facts: NarrativeFact[], entityRef: string): string {
  return facts.find((fact) => fact.entity_ref === entityRef)?.entity_label ?? entityRef.replace(/-/g, " ");
}

function isNamed(label: string, contextTokens: Set<string>): boolean {
  const tokens = entityNameTokens([label]);
  return [...tokens].some((token) => contextTokens.has(token));
}

/**
 * Whether one lore fact should be included. `position_override: "include"`
 * (the same per-fact override already used for story-time position, see
 * `visibility.ts`) always wins — an author pinning a fact means "stop
 * guessing". Otherwise: is the fact's own entity named in the chapter's
 * context, or — for an Event entity (`EventProfile`, v1.0.27) — is a
 * participant or its location named there instead? That second check is
 * what actually covers a case like "a Patron's sponsorship Event, which
 * never gets named directly, but whose participant — the protagonist —
 * does": without it, an Event fact could only ever surface by being quoted
 * verbatim, which defeats much of the point of an Event entity existing
 * separately from the people and places that make it up.
 */
export function isLoreFactRelevant(
  fact: NarrativeFact,
  contextTokens: Set<string>,
  book: Pick<Book, "facts" | "event_profiles">
): boolean {
  if (fact.position_override === "include") return true;
  if (isNamed(fact.entity_label, contextTokens)) return true;

  const profile = eventProfileFor(book.event_profiles, fact.entity_ref);
  const linkedRefs = [profile.where, ...profile.participants].filter((ref): ref is string => Boolean(ref));
  return linkedRefs.some((ref) => isNamed(labelForRef(book.facts, ref), contextTokens));
}

/** Leaves every non-lore fact untouched; filters `origin: "lore"` facts by `isLoreFactRelevant`. */
export function filterLoreFactsByRelevance(
  facts: NarrativeFact[],
  book: Pick<Book, "facts" | "event_profiles">,
  contextText: string
): NarrativeFact[] {
  const contextTokens = textTokens(contextText);
  return facts.filter((fact) => fact.origin !== "lore" || isLoreFactRelevant(fact, contextTokens, book));
}
