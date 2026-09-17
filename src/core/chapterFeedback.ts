import type { Book, Chapter } from "./BookSchema";
import { recoverJsonObject } from "./extractFacts";
import { formatBibleForPrompt, resolveVoice } from "./generateProse";
import { splitFlowParagraphs } from "./proseFlow";

export const FEEDBACK_CATEGORIES = [
  "show_vs_tell",
  "dialogue_purpose",
  "voice_drift",
  "character_fidelity"
] as const;
export type FeedbackCategory = (typeof FEEDBACK_CATEGORIES)[number];

export const FEEDBACK_LABELS: Record<FeedbackCategory, string> = {
  show_vs_tell: "Show vs tell",
  dialogue_purpose: "Dialogue",
  voice_drift: "Voice",
  character_fidelity: "Character"
};

export const FEEDBACK_BLURBS: Record<FeedbackCategory, string> = {
  show_vs_tell: "A named feeling where the body or the scene could carry it.",
  dialogue_purpose: "A spoken line that neither reveals character nor moves the scene.",
  voice_drift: "The register slipped from the Voice field.",
  character_fidelity: "A beat that sits against a locked Story Bible trait."
};

export const ANALYZE_INTRO =
  "The review tries to find lines that neither reveal the character’s personality nor drive the scene forward.";

export type FeedbackItem = {
  category: FeedbackCategory;
  quote: string;
  observation: string;
  paragraphIndex: number | null;
  relatedFact?: string;
};

export type ChapterFeedback = {
  chapterId: string;
  items: FeedbackItem[];
};

const MAX_ITEMS = 10;
const MIN_QUOTE = 8;

export const ANALYZE_SYSTEM = `You review one chapter of fiction. You do not write prose.
Return JSON only, shaped as: {"items":[{"category":"show_vs_tell","quote":"...","observation":"..."}]}

Categories (only these four):
- show_vs_tell: flag a sentence that NAMES an inner state with a telling verb (felt, was afraid, seemed determined). "Emma felt sad" is a flag. Sensory image, metaphor, and action that already embody a state are a pass — omit them. "The Odyssey hums to life around them, a symphony of machinery" is showing. Do not flag it.
- dialogue_purpose: filler speech that does neither — it does not reveal character AND it does not move the scene. A tease, a challenge, banter with subtext, an order, or a relationship beat is doing work: omit it. Quote only the spoken words, not the shrug or the eyes. If your observation would say the line reveals something, delete the item. "Tide's late" as empty weather talk can be a flag. "Someone's gotta keep you on your toes, Captain" is not.
- voice_drift: the register slipped from the Voice field partway through. Quote the drift. Skip this category entirely if Voice is unset.
- character_fidelity: a beat sits in tension with a locked Story Bible trait or personality. Quote the beat. Name the trait in relatedFact. This is not a fact contradiction and not a proposed bible change.

Rules:
- quote must be verbatim from the chapter prose, short enough to find.
- observation names the problem in one short sentence. It is not a rewrite and not a paraphrase of the quote.
- Never invent facts. Never use material that is not in the chapter, the Voice field, or the Story Bible.
- Never mention brainstorm, secrets, or notes you were not given.
- If a category has nothing solid, omit it. Empty is allowed: {"items":[]}.
- At most 10 items. Prefer the strongest flags, not one of each.
- If you catch yourself writing that the quote already shows something, delete that item.`;

export function analyzeUserPrompt(book: Book, chapter: Chapter): string {
  const voice = resolveVoice(book, chapter);
  const parts = [
    `Manuscript: ${book.title}`,
    `Story Bible:\n${formatBibleForPrompt(book, "No locked facts yet. Skip character_fidelity.")}`,
    voice ? `Voice (intended register):\n${voice}` : "Voice is unset. Skip voice_drift.",
    `Chapter ${chapter.sequence_index + 1}: ${chapter.title.trim() || "Untitled"}`,
    `Prose:\n${chapter.prose.trim()}`,
    "Review only this chapter. JSON only."
  ];
  return parts.join("\n\n");
}

export function parseChapterFeedback(
  raw: string,
  prose: string,
  options: { voice?: string } = {}
): FeedbackItem[] {
  let payload: unknown;
  try {
    payload = recoverJsonObject(raw);
  } catch {
    return [];
  }
  const rows = (payload as { items?: unknown })?.items;
  if (!Array.isArray(rows)) return [];
  const voiceOn = Boolean(options.voice?.trim());

  const items: FeedbackItem[] = [];
  for (const row of rows) {
    if (items.length >= MAX_ITEMS) break;
    if (!row || typeof row !== "object") continue;
    const rec = row as Record<string, unknown>;
    const category = parseCategory(rec.category);
    if (!category) continue;
    if (category === "voice_drift" && !voiceOn) continue;
    const quote = typeof rec.quote === "string" ? rec.quote.trim() : "";
    const observation = typeof rec.observation === "string" ? rec.observation.trim() : "";
    if (quote.length < MIN_QUOTE || !observation) continue;
    if (category === "dialogue_purpose" && !looksLikeDialogue(quote)) continue;
    if (category === "dialogue_purpose" && invertedDialogue(observation)) continue;
    if (category === "show_vs_tell" && !looksLikeTell(quote)) continue;
    if (category === "show_vs_tell" && invertedShowTell(observation)) continue;
    const relatedRaw = typeof rec.relatedFact === "string" ? rec.relatedFact.trim() : "";
    const item: FeedbackItem = {
      category,
      quote,
      observation,
      paragraphIndex: locateQuote(prose, quote)
    };
    if (category === "character_fidelity" && relatedRaw) {
      items.push({ ...item, relatedFact: relatedRaw });
    } else {
      items.push(item);
    }
  }
  return items;
}

export function locateQuote(prose: string, quote: string): number | null {
  const needle = collapseSpace(quote);
  if (!needle) return null;
  const paras = splitFlowParagraphs(prose);
  const exact = paras.findIndex((block) => collapseSpace(block).includes(needle));
  if (exact >= 0) return exact;
  const head = needle.slice(0, Math.min(48, needle.length));
  if (head.length < 12) return null;
  const loose = paras.findIndex((block) => collapseSpace(block).includes(head));
  return loose >= 0 ? loose : null;
}

function looksLikeDialogue(quote: string): boolean {
  if (/["“”«»]/.test(quote)) return true;
  return /'(?:[^']{2,})'/.test(quote);
}

function looksLikeTell(quote: string): boolean {
  return (
    /\b(felt|feels|feeling|seemed|seems|realized|knew that|thought that)\b/i.test(quote) ||
    /\b(was|were|is|are)\s+(so\s+)?(sad|angry|afraid|tired|lonely|happy|sure|determined|proud|anxious|nervous|guilty|ashamed|hopeful|desperate)\b/i.test(
      quote
    )
  );
}

function invertedShowTell(observation: string): boolean {
  return /\b(show|shows|showing|demonstrate|demonstrates|implies|imply)\b[\s\S]{0,120}\brather than explicitly\b/i.test(
    observation
  );
}

function invertedDialogue(observation: string): boolean {
  return /\breveals?\b/i.test(observation);
}

function parseCategory(value: unknown): FeedbackCategory | null {
  if (typeof value !== "string") return null;
  const key = value.trim();
  return (FEEDBACK_CATEGORIES as readonly string[]).includes(key) ? (key as FeedbackCategory) : null;
}

function collapseSpace(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}
