import { touch, type Book } from "./BookSchema";

/**
 * Fully erases a Story Bible entity — every fact under this entity_ref
 * (locked, pending, and superseded alike), its character profile, its
 * pictures, its hidden-from-draft flag, and any manual kind override.
 * Unlike revising a fact (which supersedes, keeping history intact for
 * something that still exists), this is a real delete: for an entity that
 * should never have been there at all — a duplicate, a test card, a
 * scrapped character — "Hide from draft" already covers the case of
 * keeping a card around but out of the model's sight.
 *
 * Also scrubs this entity_ref out of every OTHER event's profile: a
 * deleted Character drops out of any event's `participants`, a deleted
 * Location clears any event's `where` that pointed to it. Otherwise a
 * Location's derived "who was here" view would keep resolving a stale
 * ref to nothing (or, worse, to whatever new entity later reuses that
 * ref's slug).
 */
export function deleteEntity(book: Book, entity_ref: string): Book {
  const event_profiles = book.event_profiles
    .filter((profile) => profile.entity_ref !== entity_ref)
    .map((profile) => {
      const participants = profile.participants.filter((ref) => ref !== entity_ref);
      const next = { ...profile, participants };
      if (next.where === entity_ref) delete next.where;
      return next;
    });
  return touch(book, {
    facts: book.facts.filter((fact) => fact.entity_ref !== entity_ref),
    profiles: book.profiles.filter((profile) => profile.entity_ref !== entity_ref),
    event_profiles,
    media: book.media.filter((row) => row.entity_ref !== entity_ref),
    hidden_entities: book.hidden_entities.filter((ref) => ref !== entity_ref),
    entity_kinds: book.entity_kinds.filter((row) => row.entity_ref !== entity_ref)
  });
}
