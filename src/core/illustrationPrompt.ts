import { groupBibleEntities } from "./bibleGroups";
import { profileFor } from "./characterProfile";
import { PREDICATE_LABELS } from "./predicates";
import { entityNameTokens, normalizeWord } from "./proseStats";
import type { Book } from "./BookSchema";

export type IllustrationEntitySummary = {
  name: string;
  lines: string[];
};

function passageTokens(passage: string): Set<string> {
  const tokens = new Set<string>();
  for (const raw of passage.split(/[^\p{L}\p{N}']+/u)) {
    const token = normalizeWord(raw);
    if (token) tokens.add(token);
  }
  return tokens;
}

/** Locked Story Bible entities whose name is actually mentioned in the passage — not the whole cast. */
export function relevantEntitiesForPassage(passage: string, book: Book): IllustrationEntitySummary[] {
  const mentioned = passageTokens(passage);
  const summaries: IllustrationEntitySummary[] = [];
  for (const section of groupBibleEntities(book.facts, book.entity_kinds)) {
    for (const entity of section.entities) {
      const nameTokens = entityNameTokens([entity.entity_label]);
      const isMentioned = [...nameTokens].some((token) => mentioned.has(token));
      if (!isMentioned) continue;
      const profile = profileFor(book.profiles, entity.entity_ref);
      const lines: string[] = [];
      if (profile.looks.trim()) lines.push(`Looks: ${profile.looks.trim()}`);
      if (profile.personality.trim()) lines.push(`Personality: ${profile.personality.trim()}`);
      for (const fact of entity.facts) {
        lines.push(`${PREDICATE_LABELS[fact.predicate]}: ${fact.value.trim()}`);
      }
      summaries.push({ name: entity.entity_label, lines });
    }
  }
  return summaries;
}

const ILLUSTRATION_PROMPT_SYSTEM =
  "You write a single natural-language image-generation prompt for an external AI image tool, from a story passage, its established character and place details, and the author's chosen illustration style. Output only the prompt text itself — no preamble, no explanation, no markdown, no surrounding quotes. The illustration style describes how the image should be rendered — medium, technique, color palette, lighting quality, mood — never what it depicts. Take the passage's own scene, setting, characters, and action only from the passage and the established details, never from the style; if the style text itself names a scene, setting, time of day, or action, treat that as incidental wording to ignore, not something to carry into the final prompt. The illustration style may include technical constraints such as \"no text\", \"no captions\", \"no titles\", or \"textless\" — these are generation parameters, not visual description, and you must copy them into your output exactly as written, word for word, never paraphrased, summarized, or dropped, even though you freely rewrite every other part of the style to fit the passage.";

export type IllustrationPromptMessage = { role: "system" | "user"; content: string };

export function illustrationPromptMessages(
  passage: string,
  entities: IllustrationEntitySummary[],
  styleText: string
): IllustrationPromptMessage[] {
  const entityBlock =
    entities.length > 0
      ? entities.map((entity) => `${entity.name}:\n${entity.lines.map((line) => `- ${line}`).join("\n")}`).join("\n\n")
      : "(no locked Story Bible facts apply to this passage)";
  const style = styleText.trim() || "(no style set — infer a fitting one from the passage itself)";
  const user = `Passage:\n${passage.trim()}\n\nEstablished details:\n${entityBlock}\n\nIllustration style (rendering only — ignore any scene, setting, or time of day it happens to mention; the scene comes only from the passage above):\n${style}\n\nWrite one image-generation prompt combining the passage's key visual moment, the established details above (especially appearance), and the illustration style's rendering approach. Any "no text"-type constraint in the style above must appear in your output unchanged.`;
  return [
    { role: "system", content: ILLUSTRATION_PROMPT_SYSTEM },
    { role: "user", content: user }
  ];
}

const NO_TEXT_MARKERS = ["no text", "textless", "no captions", "no titles", "no printed words", "without typography"];
const NO_TEXT_SUFFIX = "Textless, no text, no captions, no titles, no printed words, clean illustration without typography.";

function mentionsNoTextConstraint(text: string): boolean {
  const lower = text.toLowerCase();
  return NO_TEXT_MARKERS.some((marker) => lower.includes(marker));
}

/**
 * Local models often paraphrase the style's technical "no text" constraint away as it
 * composes a new scene description. If the style declared one and the model's output
 * dropped it, append it back verbatim rather than trust the model caught it.
 */
export function enforceNoTextConstraint(generatedPrompt: string, styleText: string): string {
  if (!mentionsNoTextConstraint(styleText)) return generatedPrompt;
  const trimmed = generatedPrompt.trim();
  if (mentionsNoTextConstraint(trimmed)) return trimmed;
  const sep = /[.!?]$/.test(trimmed) ? " " : ". ";
  return `${trimmed}${sep}${NO_TEXT_SUFFIX}`;
}
