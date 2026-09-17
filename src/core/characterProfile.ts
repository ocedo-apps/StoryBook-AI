import { z } from "zod";
import { groupBibleEntities, type EntityKind } from "./bibleGroups";
import { lockedFacts, type NarrativeFact } from "./NarrativeFact";
import { entityIsHidden } from "./visibility";

/** Same builtins as Sandbox Character Studio. Custom they/xe stay out of StoryBook. */
export const CHARACTER_PRONOUNS = ["she", "he", "it"] as const;
export type CharacterPronoun = (typeof CHARACTER_PRONOUNS)[number];

export const PRONOUN_LABELS: Record<CharacterPronoun, string> = {
  she: "She",
  he: "He",
  it: "It"
};

export const CharacterProfileSchema = z.object({
  entity_ref: z.string().min(1),
  pronoun: z.enum(CHARACTER_PRONOUNS).optional(),
  /** Years. Unspecified if omitted. */
  approximateAge: z.number().int().min(1).max(130).optional(),
  /** Body and face. Not clothes. Draft reads this. */
  looks: z.string().default(""),
  /** How they tend to be. Draft reads this. */
  personality: z.string().default(""),
  /** Shelf / later export. Draft never reads these. */
  tags: z.array(z.string().min(1)).default([])
});
export type CharacterProfile = z.infer<typeof CharacterProfileSchema>;

export type CharacterProfileInput = {
  entity_ref: string;
  pronoun?: CharacterPronoun | undefined;
  approximateAge?: number | undefined;
  looks?: string;
  personality?: string;
  tags?: string[];
};

export type CastMember = {
  label: string;
  pronoun?: CharacterPronoun;
};

export function emptyProfile(entity_ref: string): CharacterProfile {
  return { entity_ref, looks: "", personality: "", tags: [] };
}

export function profileFor(profiles: CharacterProfile[], entity_ref: string): CharacterProfile {
  return profiles.find((row) => row.entity_ref === entity_ref) ?? emptyProfile(entity_ref);
}

export function characterCast(
  facts: NarrativeFact[],
  kinds: EntityKind[] = [],
  profiles: CharacterProfile[] = []
): CastMember[] {
  const characters = groupBibleEntities(facts, kinds).find((section) => section.kind === "characters")?.entities ?? [];
  return characters.map((entity) => {
    const pronoun = profileFor(profiles, entity.entity_ref).pronoun;
    return pronoun ? { label: entity.entity_label, pronoun } : { label: entity.entity_label };
  });
}

export function parseTagList(raw: string): string[] {
  const seen = new Set<string>();
  const tags: string[] = [];
  for (const part of raw.split(/[,;]/)) {
    const tag = part.trim();
    if (!tag) continue;
    const key = tag.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    tags.push(tag);
  }
  return tags;
}

export function formatTagList(tags: string[]): string {
  return tags.join(", ");
}

export function isCharacterPronoun(value: string): value is CharacterPronoun {
  return (CHARACTER_PRONOUNS as readonly string[]).includes(value);
}

function cleanProfile(input: CharacterProfileInput): CharacterProfile {
  const next: CharacterProfile = {
    entity_ref: input.entity_ref,
    looks: input.looks ?? "",
    personality: input.personality ?? "",
    tags: input.tags ?? []
  };
  if (input.pronoun !== undefined && isCharacterPronoun(input.pronoun)) {
    next.pronoun = input.pronoun;
  }
  if (
    typeof input.approximateAge === "number" &&
    Number.isInteger(input.approximateAge) &&
    input.approximateAge >= 1 &&
    input.approximateAge <= 130
  ) {
    next.approximateAge = input.approximateAge;
  }
  return next;
}

export function profileIsEmpty(profile: CharacterProfile): boolean {
  return (
    profile.pronoun === undefined &&
    profile.approximateAge === undefined &&
    profile.looks.trim() === "" &&
    profile.personality.trim() === "" &&
    profile.tags.length === 0
  );
}

export function upsertCharacterProfile(profiles: CharacterProfile[], input: CharacterProfileInput): CharacterProfile[] {
  const cleaned = cleanProfile(input);
  const others = profiles.filter((row) => row.entity_ref !== input.entity_ref);
  if (profileIsEmpty(cleaned)) return others;
  return [...others, cleaned];
}

/**
 * Pronoun, age, looks, and personality as Story Bible lines.
 * Tags are omitted — they are shelf/export only.
 */
export function formatCharacterProfilesForPrompt(
  facts: NarrativeFact[],
  profiles: CharacterProfile[],
  hiddenEntities: string[] = []
): string {
  const labels = new Map<string, string>();
  for (const fact of lockedFacts(facts)) {
    if (!labels.has(fact.entity_ref)) labels.set(fact.entity_ref, fact.entity_label);
  }
  const lines: string[] = [];
  for (const profile of profiles) {
    if (entityIsHidden(hiddenEntities, profile.entity_ref)) continue;
    const label = labels.get(profile.entity_ref);
    if (!label) continue;
    if (profile.pronoun) lines.push(`- ${label} · Pronoun: ${profile.pronoun}`);
    if (profile.approximateAge !== undefined) lines.push(`- ${label} · Approximate age: ${profile.approximateAge}`);
    if (profile.looks.trim()) lines.push(`- ${label} · Looks: ${profile.looks.trim()}`);
    if (profile.personality.trim()) lines.push(`- ${label} · Personality: ${profile.personality.trim()}`);
  }
  return lines.join("\n");
}

export function withCharacterProfiles(
  bible: string,
  facts: NarrativeFact[],
  profiles: CharacterProfile[],
  hiddenEntities: string[] = []
): string {
  const extra = formatCharacterProfilesForPrompt(facts, profiles, hiddenEntities);
  if (!extra) return bible;
  return `${bible}\n${extra}`;
}
