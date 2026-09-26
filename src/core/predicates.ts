export const CORE_PREDICATES = [
  "core.identity",
  "core.trait",
  "core.place",
  "core.object",
  "core.group",
  "core.relationship",
  "core.event",
  "core.concept"
] as const;

export type CorePredicate = (typeof CORE_PREDICATES)[number];

export const PREDICATE_LABELS: Record<CorePredicate, string> = {
  "core.identity": "Identity",
  "core.trait": "Trait",
  "core.place": "Place",
  "core.object": "Object",
  "core.group": "Group",
  "core.relationship": "Relationship",
  "core.event": "Event",
  "core.concept": "Concept"
};

export function isCorePredicate(value: string): value is CorePredicate {
  return (CORE_PREDICATES as readonly string[]).includes(value);
}
