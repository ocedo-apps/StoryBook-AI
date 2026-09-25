import { lockedFacts, type NarrativeFact } from "./NarrativeFact";

export function entityIsHidden(hiddenEntities: string[], entity_ref: string): boolean {
  return hiddenEntities.includes(entity_ref);
}

export function factIsHiddenFromModel(fact: NarrativeFact, hiddenEntities: string[]): boolean {
  if (entityIsHidden(hiddenEntities, fact.entity_ref)) return true;
  return fact.hidden_from_ai === true;
}

export function visibleLockedFacts(facts: NarrativeFact[], hiddenEntities: string[]): NarrativeFact[] {
  return lockedFacts(facts).filter((fact) => !factIsHiddenFromModel(fact, hiddenEntities));
}

/**
 * Whether a fact belongs at a given point in story time (roadmap-ideas.md
 * #24). `position_override` always wins when set — the safety valve for
 * when the automatic guess below is wrong. Otherwise a fact with no
 * `chapter_id`, or one from a chapter missing from `chapterStoryTimeRank`
 * (deleted or discarded), has no story-time position to judge — there's
 * nothing to compare against, so it qualifies rather than being silently
 * dropped.
 */
export function factQualifiesAtPosition(
  fact: NarrativeFact,
  chapterStoryTimeRank: Map<string, number>,
  atRank: number
): boolean {
  if (fact.position_override === "include") return true;
  if (fact.position_override === "exclude") return false;
  const rank = fact.chapter_id ? chapterStoryTimeRank.get(fact.chapter_id) : undefined;
  return rank === undefined || rank <= atRank;
}

/** `visibleLockedFacts`, further narrowed to what's known by `atRank` in story time. */
export function visibleLockedFactsAtPosition(
  facts: NarrativeFact[],
  hiddenEntities: string[],
  chapterStoryTimeRank: Map<string, number>,
  atRank: number
): NarrativeFact[] {
  return visibleLockedFacts(facts, hiddenEntities).filter((fact) =>
    factQualifiesAtPosition(fact, chapterStoryTimeRank, atRank)
  );
}

export function toggleHiddenEntity(hiddenEntities: string[], entity_ref: string): string[] {
  if (hiddenEntities.includes(entity_ref)) return hiddenEntities.filter((ref) => ref !== entity_ref);
  return [...hiddenEntities, entity_ref];
}

export function setFactHidden(facts: NarrativeFact[], factId: string, hidden: boolean): NarrativeFact[] {
  return facts.map((fact) => {
    if (fact.id !== factId) return fact;
    if (hidden) return { ...fact, hidden_from_ai: true };
    if (fact.hidden_from_ai !== true) return fact;
    const { hidden_from_ai: _dropped, ...rest } = fact;
    void _dropped;
    return rest;
  });
}

export function setFactPositionOverride(
  facts: NarrativeFact[],
  factId: string,
  override: "include" | "exclude" | null
): NarrativeFact[] {
  return facts.map((fact) => {
    if (fact.id !== factId) return fact;
    if (override) return { ...fact, position_override: override };
    if (fact.position_override === undefined) return fact;
    const { position_override: _dropped, ...rest } = fact;
    void _dropped;
    return rest;
  });
}

/** Automatic (no override) -> always include -> always exclude -> back to automatic. */
export function nextPositionOverride(current: "include" | "exclude" | undefined): "include" | "exclude" | null {
  if (current === undefined) return "include";
  if (current === "include") return "exclude";
  return null;
}
