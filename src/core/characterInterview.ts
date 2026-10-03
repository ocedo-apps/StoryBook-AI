import type { Book } from "./BookSchema";
import { BIBLE_KIND_SINGULAR, entityRefsAndLabels, type BibleKind } from "./bibleGroups";
import { findNameHitsInText } from "./bibleMentions";
import { profileFor } from "./characterProfile";
import { formatLanguageForPrompt } from "./generateProse";
import type { NarrativeFact } from "./NarrativeFact";
import { PREDICATE_LABELS } from "./predicates";
import { visibleLockedFacts } from "./visibility";

/**
 * A third chat form (roadmap-ideas.md #18) alongside Ask Manuscript
 * (punkt 8, asks about the manuscript) and Brainstorm's generic Ask
 * (asks the model as a thinking partner): this one talks about a
 * specific Story Bible entity, grounded only in its own locked facts —
 * a way to discover voice/lore and gaps in what is established, not to
 * create new canon. Ephemeral: not saved to the book, same as Ask
 * Manuscript's answer.
 */
export type InterviewMessage = { role: "user" | "assistant"; content: string };

function formatFactLines(facts: NarrativeFact[]): string {
  return facts.map((fact) => `(${PREDICATE_LABELS[fact.predicate]}) ${fact.value}`).join(" ");
}

/**
 * Other entities worth telling the interviewee about — a tester's report
 * (2026-10-02): asked about anyone other than the entity on its own card,
 * the model had nothing to ground an answer in and could only invent,
 * risking a contradiction with what that other entity already has locked
 * elsewhere. Scoped two ways, both cheap: (1) the interviewee's own facts
 * — a `core.relationship` value naming someone already pulls that person
 * in from turn one — and (2) the conversation itself, so asking about
 * someone for the first time pulls them in on that very turn. Deliberately
 * one level only — a mentioned entity's own mentions aren't chased further,
 * which would risk rebuilding the same "too much" problem `filter_lore_by_
 * relevance` exists to avoid, just on the Interview side instead of Draft.
 */
export function relatedEntityContext(
  book: Pick<Book, "facts" | "hidden_entities" | "entity_kinds">,
  entityRef: string,
  conversationText: string
): { entity_ref: string; entity_label: string; facts: NarrativeFact[] }[] {
  const visible = visibleLockedFacts(book.facts, book.hidden_entities);
  const others = entityRefsAndLabels(visible, book.entity_kinds).filter((entity) => entity.entity_ref !== entityRef);
  if (others.length === 0) return [];

  const ownFactsText = visible
    .filter((fact) => fact.entity_ref === entityRef)
    .map((fact) => fact.value)
    .join("\n");
  const haystack = `${ownFactsText}\n${conversationText}`;

  const mentionedRefs = new Set(findNameHitsInText(haystack, others).map((hit) => hit.entityRef));
  if (mentionedRefs.size === 0) return [];

  return others
    .filter((entity) => mentionedRefs.has(entity.entity_ref))
    .map((entity) => ({
      entity_ref: entity.entity_ref,
      entity_label: entity.entity_label,
      facts: visible.filter((fact) => fact.entity_ref === entity.entity_ref)
    }));
}

/**
 * `personalityDraft`, if given, wins over the character's saved profile
 * personality — the author trying out a different tone mid-interview
 * before deciding whether to save it. Undefined (not just empty) falls
 * back to the saved value, so clearing the draft field on purpose (empty
 * string) still overrides rather than silently reverting. Only read for
 * `kind === "characters"` — a place or an object has no voice to tune.
 *
 * `conversationText` is the interview so far (prior turns plus the new
 * question) — see `relatedEntityContext`. Rebuilt fresh every turn, same
 * as the rest of this prompt, so a newly-mentioned name takes effect on
 * the very turn it's first asked about.
 */
export function characterInterviewSystem(
  book: Book,
  entityRef: string,
  entityLabel: string,
  kind: BibleKind,
  personalityDraft?: string,
  conversationText = ""
): string {
  const facts = visibleLockedFacts(book.facts, book.hidden_entities).filter((fact) => fact.entity_ref === entityRef);
  const related = relatedEntityContext(book, entityRef, conversationText);
  const relatedBlock =
    related.length > 0
      ? `Also established, about others mentioned in this conversation — stay consistent with these facts, and don't invent new ones about them either:\n${related
          .map((entity) => `${entity.entity_label} — ${formatFactLines(entity.facts) || "nothing else established yet"}`)
          .join("\n")}`
      : "";

  if (kind === "characters") {
    const factLines =
      facts.length > 0
        ? facts.map((fact) => `- (${PREDICATE_LABELS[fact.predicate]}) ${fact.value}`).join("\n")
        : "Nothing is established about you in the manuscript yet.";
    const personality = (personalityDraft ?? profileFor(book.profiles, entityRef).personality).trim();
    return [
      `You are ${entityLabel}, a character in the author's manuscript "${book.title}". Answer every question in the first person, as yourself. Never break character, never describe yourself in the third person, and never mention that you are an AI or a language model.`,
      `Speak only from what is established below. The author is interviewing you to discover your voice and find gaps in what is known — if something is not established, say so honestly, the way you would ("I don't know" / "no one's ever asked me that"), rather than inventing new backstory as if it were settled fact.`,
      `What is established about you:\n${factLines}`,
      relatedBlock,
      personality ? `How you tend to be, and how you should answer: ${personality}` : "",
      book.voice.trim() ? `The manuscript's overall voice, for tone: ${book.voice.trim()}` : "",
      formatLanguageForPrompt(book.prose_language),
      "This conversation is the author's private scratch space — not the book itself, and nothing said here becomes canon on its own. Keep replies conversational, a few sentences, not an essay."
    ]
      .filter(Boolean)
      .join("\n\n");
  }

  const kindLabel = BIBLE_KIND_SINGULAR[kind].toLowerCase();
  const factLines =
    facts.length > 0
      ? facts.map((fact) => `- (${PREDICATE_LABELS[fact.predicate]}) ${fact.value}`).join("\n")
      : `Nothing is established about ${entityLabel} in the manuscript yet.`;
  return [
    `You are the author's worldbuilding collaborator, discussing "${entityLabel}", a ${kindLabel} in their manuscript "${book.title}". Answer in the third person, like a knowledgeable narrator who knows it well — never speak as if you were it.`,
    `Ground every answer in what is established below and stay consistent with it. Where nothing is established yet, say so honestly and offer a plausible, concrete suggestion the author could adopt — clearly offered as an idea, never asserted as settled fact.`,
    `What is established about ${entityLabel}:\n${factLines}`,
    relatedBlock,
    book.voice.trim() ? `The manuscript's overall voice, for tone: ${book.voice.trim()}` : "",
    formatLanguageForPrompt(book.prose_language),
    "This conversation is the author's private scratch space for building lore — not the book itself, and nothing said here becomes canon on its own. Keep replies conversational, a few sentences, not an essay."
  ]
    .filter(Boolean)
    .join("\n\n");
}
