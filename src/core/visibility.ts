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
 * Where a scene-by-scene Draft/Recast pass currently stands, for comparing
 * against a fact from the SAME chapter (roadmap-ideas.md #33 follow-up — a
 * chapter-level fact reads as true for the chapter's very first page, even
 * one that only becomes true partway through, e.g. an old friend turning
 * out to be the story's antagonist). Only meaningful within one chapter —
 * across chapters, `chapterStoryTimeRank` alone already decides it.
 * `sceneIndexById` is that one chapter's own scenes, in order.
 */
export type ScenePosition = { atSceneIndex: number; sceneIndexById: Map<string, number> };

/**
 * Whether a fact belongs at a given point in story time (roadmap-ideas.md
 * #24, scene-refined by #33). `position_override` always wins when set —
 * the safety valve for when the automatic guess below is wrong. Otherwise
 * a fact with no `chapter_id`, or one from a chapter missing from
 * `chapterStoryTimeRank` (deleted or discarded), has no story-time
 * position to judge — there's nothing to compare against, so it qualifies
 * rather than being silently dropped. A fact from an earlier chapter
 * always qualifies; one from a later chapter never does. A fact from the
 * SAME chapter being drafted only narrows further when `scenePosition` is
 * given (a scene-targeted Draft/Recast pass) AND the fact itself has a
 * `scene_id` that resolves in that chapter's scene list — a chapter-level
 * fact, or a whole-chapter Draft pass with no `scenePosition` at all,
 * keeps the original whole-chapter behavior unchanged.
 */
export function factQualifiesAtPosition(
  fact: NarrativeFact,
  chapterStoryTimeRank: Map<string, number>,
  atRank: number,
  scenePosition?: ScenePosition
): boolean {
  if (fact.position_override === "include") return true;
  if (fact.position_override === "exclude") return false;
  const rank = fact.chapter_id ? chapterStoryTimeRank.get(fact.chapter_id) : undefined;
  if (rank === undefined || rank < atRank) return true;
  if (rank > atRank) return false;
  if (!scenePosition || !fact.scene_id) return true;
  const factSceneIndex = scenePosition.sceneIndexById.get(fact.scene_id);
  return factSceneIndex === undefined || factSceneIndex <= scenePosition.atSceneIndex;
}

/** `visibleLockedFacts`, further narrowed to what's known by `atRank` (and, within the same chapter, `scenePosition`) in story time. */
export function visibleLockedFactsAtPosition(
  facts: NarrativeFact[],
  hiddenEntities: string[],
  chapterStoryTimeRank: Map<string, number>,
  atRank: number,
  scenePosition?: ScenePosition
): NarrativeFact[] {
  return visibleLockedFacts(facts, hiddenEntities).filter((fact) =>
    factQualifiesAtPosition(fact, chapterStoryTimeRank, atRank, scenePosition)
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
