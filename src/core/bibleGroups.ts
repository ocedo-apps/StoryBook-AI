import { z } from "zod";
import { lockedFacts, type NarrativeFact } from "./NarrativeFact";
import { CORE_PREDICATES, type CorePredicate } from "./predicates";

export const BIBLE_KINDS = ["characters", "locations", "objects", "groups", "events"] as const;
export type BibleKind = (typeof BIBLE_KINDS)[number];

export const BIBLE_KIND_LABELS: Record<BibleKind, string> = {
  characters: "Characters",
  locations: "Locations",
  objects: "Objects",
  groups: "Groups",
  events: "Events"
};

export const BIBLE_KIND_SINGULAR: Record<BibleKind, string> = {
  characters: "Character",
  locations: "Location",
  objects: "Object",
  groups: "Group",
  events: "Event"
};

export const BIBLE_KIND_NEW_LABEL: Record<BibleKind, string> = {
  characters: "New character",
  locations: "New location",
  objects: "New object",
  groups: "New group",
  events: "New event"
};

export const BIBLE_KIND_DEFAULT_PREDICATE: Record<BibleKind, CorePredicate> = {
  characters: "core.identity",
  locations: "core.place",
  objects: "core.object",
  groups: "core.group",
  events: "core.event"
};

export const EntityKindSchema = z.object({
  entity_ref: z.string().min(1),
  kind: z.enum(BIBLE_KINDS)
});
export type EntityKind = z.infer<typeof EntityKindSchema>;

export type BibleEntityGroup = {
  entity_ref: string;
  entity_label: string;
  facts: NarrativeFact[];
};

export type BibleKindSection = {
  kind: BibleKind;
  label: string;
  entities: BibleEntityGroup[];
};

/**
 * Characters if the entity has identity, trait, or relationship.
 * Groups if it has a collective claim and is not a character.
 * Locations if it has a place claim and is not a character or group.
 * Objects if it has an object claim and is not one of the above.
 * Events otherwise (event-only rows).
 * An explicit kind override wins — ships and orders are often locked as Identity first.
 */
export function classifyEntity(facts: NarrativeFact[], override?: BibleKind | undefined): BibleKind {
  if (override !== undefined) return override;
  const predicates = new Set(facts.map((fact) => fact.predicate));
  if (
    predicates.has("core.identity") ||
    predicates.has("core.trait") ||
    predicates.has("core.relationship")
  ) {
    return "characters";
  }
  if (predicates.has("core.group")) return "groups";
  if (predicates.has("core.place")) return "locations";
  if (predicates.has("core.object")) return "objects";
  return "events";
}

export function kindOverrideFor(kinds: EntityKind[], entity_ref: string): BibleKind | undefined {
  return kinds.find((row) => row.entity_ref === entity_ref)?.kind;
}

export function setEntityKind(kinds: EntityKind[], entity_ref: string, kind: BibleKind, inferred: BibleKind): EntityKind[] {
  const others = kinds.filter((row) => row.entity_ref !== entity_ref);
  if (kind === inferred) return others;
  return [...others, { entity_ref, kind }];
}

function predicateOrder(predicate: NarrativeFact["predicate"]): number {
  return CORE_PREDICATES.indexOf(predicate);
}

function emptyBuckets(): Record<BibleKind, BibleEntityGroup[]> {
  return {
    characters: [],
    locations: [],
    objects: [],
    groups: [],
    events: []
  };
}

export function groupBibleEntities(facts: NarrativeFact[], kinds: EntityKind[] = []): BibleKindSection[] {
  return groupFacts(lockedFacts(facts), kinds);
}

/**
 * Same classify/bucket/sort as `groupBibleEntities`, but the caller has
 * already decided which fact per entity+predicate counts — current truth
 * (the usual case, via `groupBibleEntities`) or a past state (via
 * `factsAsOfSequence`, roadmap-ideas.md #16). Never filters by status or
 * supersession itself; a superseded fact the caller deliberately picked
 * for an "as of" view still renders.
 */
export function groupFacts(rows: NarrativeFact[], kinds: EntityKind[] = []): BibleKindSection[] {
  const byEntity = new Map<string, NarrativeFact[]>();
  for (const fact of rows) {
    const list = byEntity.get(fact.entity_ref) ?? [];
    list.push(fact);
    byEntity.set(fact.entity_ref, list);
  }

  const buckets = emptyBuckets();

  for (const [entity_ref, entityFacts] of byEntity) {
    const head = entityFacts[0];
    if (!head) continue;
    const sorted = [...entityFacts].sort((a, b) => predicateOrder(a.predicate) - predicateOrder(b.predicate));
    buckets[classifyEntity(sorted, kindOverrideFor(kinds, entity_ref))].push({
      entity_ref,
      entity_label: head.entity_label,
      facts: sorted
    });
  }

  for (const kind of BIBLE_KINDS) {
    buckets[kind].sort((a, b) => a.entity_label.localeCompare(b.entity_label, undefined, { sensitivity: "base" }));
  }

  return BIBLE_KINDS.filter((kind) => buckets[kind].length > 0).map((kind) => ({
    kind,
    label: BIBLE_KIND_LABELS[kind],
    entities: buckets[kind]
  }));
}

export function peopleLabels(facts: NarrativeFact[], kinds: EntityKind[] = []): string[] {
  return (
    groupBibleEntities(facts, kinds).find((section) => section.kind === "characters")?.entities.map((entity) => entity.entity_label) ??
    []
  );
}

export function entityLabels(facts: NarrativeFact[], kinds: EntityKind[] = []): string[] {
  return groupBibleEntities(facts, kinds).flatMap((section) => section.entities.map((entity) => entity.entity_label));
}

export function entityMatchesQuery(
  entity: BibleEntityGroup,
  query: string,
  profile?: { looks: string; personality: string; tags: string[]; pronoun?: string | undefined }
): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  if (entity.entity_label.toLowerCase().includes(needle)) return true;
  if (entity.facts.some((fact) => fact.value.toLowerCase().includes(needle))) return true;
  if (!profile) return false;
  if (profile.looks.toLowerCase().includes(needle)) return true;
  if (profile.personality.toLowerCase().includes(needle)) return true;
  if (profile.pronoun?.toLowerCase().includes(needle)) return true;
  return profile.tags.some((tag) => tag.toLowerCase().includes(needle));
}
