import { applyExtractorDrafts } from "./ConsistencyGate";
import { normalizeValue } from "./ids";
import { groupBibleEntities, type EntityKind } from "./bibleGroups";
import { findNameHitsInText } from "./bibleMentions";
import { activeFacts, type FactDraft, type NarrativeFact } from "./NarrativeFact";
import type { CorePredicate } from "./predicates";

/**
 * A locked `core.relationship` fact is one character's side of a story
 * ("met Erik at the docks") — it says nothing about whether Erik's own
 * facts agree. If the value names another known character by name (and
 * only one, unambiguously — never guess between two), draft the same
 * claim for that character too, with the names swapped so it reads from
 * their side.
 */
export function relationshipMirrorDraft(
  fact: NarrativeFact,
  facts: NarrativeFact[],
  kinds: EntityKind[]
): FactDraft | undefined {
  if (fact.predicate !== "core.relationship") return undefined;

  const otherCharacters = (groupBibleEntities(facts, kinds).find((section) => section.kind === "characters")?.entities ?? [])
    .filter((entity) => entity.entity_ref !== fact.entity_ref)
    .map((entity) => ({ entity_ref: entity.entity_ref, entity_label: entity.entity_label }));
  if (otherCharacters.length === 0) return undefined;

  const hits = findNameHitsInText(fact.value, otherCharacters);
  const distinctRefs = new Set(hits.map((hit) => hit.entityRef));
  if (distinctRefs.size !== 1) return undefined;

  const [otherRef] = distinctRefs;
  const otherLabel = hits.find((hit) => hit.entityRef === otherRef)?.entityLabel;
  if (!otherRef || !otherLabel) return undefined;

  let mirroredValue = fact.value;
  const ownHits = hits.filter((hit) => hit.entityRef === otherRef).sort((a, b) => b.start - a.start);
  for (const hit of ownHits) {
    mirroredValue = mirroredValue.slice(0, hit.start) + fact.entity_label + mirroredValue.slice(hit.end);
  }

  return { entity_ref: otherRef, entity_label: otherLabel, predicate: "core.relationship", value: mirroredValue };
}

/**
 * Never locks the mirrored claim directly — it is the author's/AI's
 * telling from one side, not something the other character has
 * confirmed. It goes through the same extractor pipeline a fact pulled
 * from prose would: queued for review if it's new, or — the point of
 * this — flagged as a real conflict if that character's own locked
 * facts already say something else, instead of the two sides silently
 * drifting apart.
 */
export function withRelationshipMirror(facts: NarrativeFact[], lockedFact: NarrativeFact, kinds: EntityKind[]): NarrativeFact[] {
  const draft = relationshipMirrorDraft(lockedFact, facts, kinds);
  if (!draft) return facts;
  return applyExtractorDrafts(facts, [draft], lockedFact.sequence_index, lockedFact.chapter_id, lockedFact.scene_id);
}

/**
 * Call sites don't always have the freshly-locked fact object in hand —
 * addFact, approve, and revise each learn the outcome differently — so
 * this finds it by the claim it should now match and runs the mirror
 * check, or no-ops if that claim never actually landed as locked truth.
 */
export function withRelationshipMirrorFor(
  facts: NarrativeFact[],
  match: { entity_ref: string; predicate: CorePredicate; value: string },
  kinds: EntityKind[]
): NarrativeFact[] {
  const locked = activeFacts(facts).find(
    (fact) =>
      fact.entity_ref === match.entity_ref &&
      fact.predicate === match.predicate &&
      fact.status === "locked" &&
      normalizeValue(fact.value) === normalizeValue(match.value)
  );
  return locked ? withRelationshipMirror(facts, locked, kinds) : facts;
}
