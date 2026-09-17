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
