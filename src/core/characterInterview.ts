import type { Book } from "./BookSchema";
import { profileFor } from "./characterProfile";
import { formatLanguageForPrompt } from "./generateProse";
import { PREDICATE_LABELS } from "./predicates";
import { visibleLockedFacts } from "./visibility";

/**
 * A third chat form (roadmap-ideas.md #18) alongside Ask Manuscript
 * (punkt 8, asks about the manuscript) and Brainstorm's generic Ask
 * (asks the model as a thinking partner): this one talks TO a specific
 * character, in their own voice, grounded only in their own locked
 * facts — a way to discover voice, backstory, and gaps in what is
 * established, not to create new canon. Ephemeral: not saved to the
 * book, same as Ask Manuscript's answer.
 */
export type InterviewMessage = { role: "user" | "assistant"; content: string };

/**
 * `personalityDraft`, if given, wins over the character's saved profile
 * personality — the author trying out a different tone mid-interview
 * before deciding whether to save it. Undefined (not just empty) falls
 * back to the saved value, so clearing the draft field on purpose (empty
 * string) still overrides rather than silently reverting.
 */
export function characterInterviewSystem(
  book: Book,
  entityRef: string,
  entityLabel: string,
  personalityDraft?: string
): string {
  const facts = visibleLockedFacts(book.facts, book.hidden_entities).filter((fact) => fact.entity_ref === entityRef);
  const factLines =
    facts.length > 0
      ? facts.map((fact) => `- (${PREDICATE_LABELS[fact.predicate]}) ${fact.value}`).join("\n")
      : "Nothing is established about you in the manuscript yet.";
  const personality = (personalityDraft ?? profileFor(book.profiles, entityRef).personality).trim();
  return [
    `You are ${entityLabel}, a character in the author's manuscript "${book.title}". Answer every question in the first person, as yourself. Never break character, never describe yourself in the third person, and never mention that you are an AI or a language model.`,
    `Speak only from what is established below. The author is interviewing you to discover your voice and find gaps in what is known — if something is not established, say so honestly, the way you would ("I don't know" / "no one's ever asked me that"), rather than inventing new backstory as if it were settled fact.`,
    `What is established about you:\n${factLines}`,
    personality ? `How you tend to be, and how you should answer: ${personality}` : "",
    book.voice.trim() ? `The manuscript's overall voice, for tone: ${book.voice.trim()}` : "",
    formatLanguageForPrompt(book.prose_language),
    "This conversation is the author's private scratch space — not the book itself, and nothing said here becomes canon on its own. Keep replies conversational, a few sentences, not an essay."
  ]
    .filter(Boolean)
    .join("\n\n");
}
