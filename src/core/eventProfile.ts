import { z } from "zod";

/**
 * Structured fields for an Event-kind Story Bible entity — where it
 * happened (a Location entity_ref) and who was there (Character
 * entity_refs). Same side-table pattern as CharacterProfile: keyed on
 * entity_ref, missing entirely for an Event nobody has filled these in
 * for yet. Deliberately does NOT include "when" — that's already better
 * answered by the fact's own chapter_id/scene_id/story-time rank, so a
 * second, free-text "when" field here would just compete with it.
 *
 * `where`/`participants` are the only structured cross-entity links in
 * Story Bible. Location reads them back (see `eventsAtLocation` /
 * `participantsAtLocation`) rather than storing its own "inhabitants" or
 * "relevant events" list — one place to edit a link, no risk of the two
 * sides drifting out of sync.
 */
export const EventProfileSchema = z.object({
  entity_ref: z.string().min(1),
  /** A Location entity_ref, or unset if not placed yet. */
  where: z.string().min(1).optional(),
  /** Character entity_refs present at this event. */
  participants: z.array(z.string().min(1)).default([])
});
export type EventProfile = z.infer<typeof EventProfileSchema>;

export type EventProfileInput = {
  entity_ref: string;
  where?: string | undefined;
  participants?: string[];
};

export function emptyEventProfile(entity_ref: string): EventProfile {
  return { entity_ref, participants: [] };
}

export function eventProfileFor(profiles: EventProfile[], entity_ref: string): EventProfile {
  return profiles.find((row) => row.entity_ref === entity_ref) ?? emptyEventProfile(entity_ref);
}

function cleanEventProfile(input: EventProfileInput): EventProfile {
  const next: EventProfile = { entity_ref: input.entity_ref, participants: input.participants ?? [] };
  if (input.where?.trim()) next.where = input.where.trim();
  return next;
}

export function eventProfileIsEmpty(profile: EventProfile): boolean {
  return profile.where === undefined && profile.participants.length === 0;
}

export function upsertEventProfile(profiles: EventProfile[], input: EventProfileInput): EventProfile[] {
  const cleaned = cleanEventProfile(input);
  const others = profiles.filter((row) => row.entity_ref !== input.entity_ref);
  if (eventProfileIsEmpty(cleaned)) return others;
  return [...others, cleaned];
}

/** Entity refs of every Event placed at this Location, in profile order. */
export function eventsAtLocation(profiles: EventProfile[], locationRef: string): string[] {
  return profiles.filter((profile) => profile.where === locationRef).map((profile) => profile.entity_ref);
}

/** Entity refs of every Character who took part in an event at this Location, de-duplicated, first-seen order. */
export function participantsAtLocation(profiles: EventProfile[], locationRef: string): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const profile of profiles) {
    if (profile.where !== locationRef) continue;
    for (const ref of profile.participants) {
      if (seen.has(ref)) continue;
      seen.add(ref);
      result.push(ref);
    }
  }
  return result;
}
