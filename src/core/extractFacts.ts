import { slugify } from "./ids";
import { isCorePredicate } from "./predicates";
import type { FactDraft } from "./NarrativeFact";

/**
 * Salvages whatever complete `{...}` objects appear inside a `facts` array
 * that got cut off mid-stream (the model hit its token budget before
 * finishing) — walks the array by brace depth, parsing each balanced
 * object in turn, and stops at the first one that doesn't close cleanly
 * (the truncated tail) rather than losing every fact the model already
 * produced to one JSON.parse failure on the whole blob.
 */
function recoverTruncatedFacts(fromArrayStart: string): unknown[] {
  const arrayStart = fromArrayStart.indexOf("[");
  if (arrayStart < 0) return [];
  const facts: unknown[] = [];
  let depth = 0;
  let objectStart = -1;
  let inString = false;
  let escapeNext = false;
  for (let i = arrayStart + 1; i < fromArrayStart.length; i++) {
    const ch = fromArrayStart[i];
    if (inString) {
      if (escapeNext) escapeNext = false;
      else if (ch === "\\") escapeNext = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') {
      inString = true;
      continue;
    }
    if (ch === "{") {
      if (depth === 0) objectStart = i;
      depth++;
      continue;
    }
    if (ch === "}") {
      depth--;
      if (depth === 0 && objectStart >= 0) {
        try {
          facts.push(JSON.parse(fromArrayStart.slice(objectStart, i + 1)));
        } catch {
          break;
        }
        objectStart = -1;
      } else if (depth < 0) {
        break;
      }
      continue;
    }
    if (ch === "]" && depth === 0) break;
  }
  return facts;
}

/**
 * Pull a JSON object out of model output (fences, leading prose, trailing
 * notes). Falls back to `recoverTruncatedFacts` when the response looks
 * like it was cut off before the closing braces arrived — a real risk with
 * a long chapter and many facts to enumerate in one completion — so a
 * truncated response still yields whatever facts the model got out before
 * running out of room, instead of the whole extraction failing on one
 * unparseable blob.
 *
 * Also tolerates a model that skips the `{"facts": [...]}` wrapper the
 * prompt's shape example nests the array in, and returns the bare `[...]`
 * array of fact objects directly — observed live from a tester's local
 * model, valid JSON in its own right, just one layer flatter than asked
 * for. Detected by whichever opening bracket, `{` or `[`, appears first in
 * the response: if `[` comes first, that's the top-level container.
 */
export function recoverJsonObject(raw: string): unknown {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const body = (fenced?.[1] ?? trimmed).trim();
  const braceStart = body.indexOf("{");
  const bracketStart = body.indexOf("[");
  const isBareArray = bracketStart >= 0 && (braceStart < 0 || bracketStart < braceStart);

  if (isBareArray) {
    const bracketEnd = body.lastIndexOf("]");
    if (bracketEnd > bracketStart) {
      try {
        return { facts: JSON.parse(body.slice(bracketStart, bracketEnd + 1)) };
      } catch {
        // Falls through to salvage whatever complete fact objects it can.
      }
    }
  } else if (braceStart >= 0) {
    const braceEnd = body.lastIndexOf("}");
    if (braceEnd > braceStart) {
      try {
        return JSON.parse(body.slice(braceStart, braceEnd + 1));
      } catch {
        // Falls through to salvage whatever complete fact objects it can.
      }
    }
  } else {
    throw new Error("Extractor returned no JSON object.");
  }

  // recoverTruncatedFacts finds its own `[` (the facts array, whether or
  // not it's wrapped in an outer object), so the full body works as the
  // salvage input for either shape above.
  const facts = recoverTruncatedFacts(body);
  if (facts.length === 0) {
    throw new Error("Extractor returned no JSON object.");
  }
  return { facts };
}

export function parseExtractorPayload(raw: string): FactDraft[] {
  const payload = recoverJsonObject(raw);
  const facts = (payload as { facts?: unknown })?.facts;
  if (!Array.isArray(facts)) {
    throw new Error("Extractor JSON had no facts array.");
  }

  const drafts: FactDraft[] = [];
  for (const row of facts) {
    if (!row || typeof row !== "object") continue;
    const rec = row as Record<string, unknown>;
    const predicateRaw = typeof rec.predicate === "string" ? rec.predicate.trim() : "";
    if (!isCorePredicate(predicateRaw)) continue;
    const value = typeof rec.value === "string" ? rec.value.trim() : "";
    if (!value) continue;
    const label =
      (typeof rec.entity_label === "string" && rec.entity_label.trim()) ||
      (typeof rec.entity === "string" && rec.entity.trim()) ||
      (typeof rec.entity_ref === "string" && rec.entity_ref.trim()) ||
      "";
    if (!label) continue;
    // entity_ref is always derived from entity_label, never taken from the
    // model's own entity_ref field: the model invents that value fresh on
    // every call (it never sees which refs already exist), so two facts it
    // states about the exact same displayed name can get different
    // self-chosen refs — the observed bug was literally "Dr. James
    // Mortimer" landing as two separate Story Bible cards from one
    // extraction. Slugifying the label itself is deterministic — the same
    // displayed name always yields the same ref, in this batch or any
    // other. Name *variants* ("Dr. Mortimer" vs "Dr. James Mortimer") still
    // become separate cards; that needs either grounding the extractor in
    // the existing cast or a real merge feature, not attempted here.
    drafts.push({
      entity_ref: slugify(label),
      entity_label: label,
      predicate: predicateRaw,
      value
    });
  }
  return drafts;
}

/**
 * Shared between EXTRACTOR_SYSTEM and INTERVIEW_EXTRACTOR_SYSTEM so the two
 * never drift apart on what each predicate covers. Explicitly calls out age
 * and relationship status under core.trait — a tester's interview answers
 * plainly stated both ("I'm in my mid-thirties, let's say 35" / "I don't
 * have a girlfriend... it's been a while since my last relationship
 * ended") and the extractor found nothing, most likely because neither
 * reads as an obvious fit for any predicate's original one-line
 * description: "a stable characteristic" doesn't obviously cover an age or
 * a relationship status unless it says so.
 */
export const PREDICATE_GUIDE = `- predicate must be one of: core.identity, core.trait, core.place, core.object, core.group, core.relationship, core.event, core.concept
- core.identity: who this is (a single person, name, role). core.trait: a stable characteristic — an age, a relationship status, an occupation, a physical trait, a stated preference, or a habit. core.place: a named location, including a ship or building you can be inside. core.object: a named thing. core.group: a named order, crew, house, guild, or other collective — not one person. core.relationship: how two people are connected. core.event: something that has happened. core.concept: a named abstract idea, system, rule, or piece of lore that is not a person, place, object, or group — a magic system, a historical era, a custom, a law.
- entity_label is the person's, place's, object's, group's, or concept's displayed name. Spell it exactly the same way, every time, whenever the same fact-holder comes up again in this extraction — matching spellings are how the app recognizes it is the same card; a different spelling (a title added or dropped, a nickname) is treated as a different card.`;

export const EXTRACTOR_SYSTEM = `You extract established narrative facts from accepted prose.
Return JSON only, shaped as: {"facts":[{"entity_label":"...","predicate":"core.identity","value":"..."}]}

Rules:
- Only claims the text states as true. No metaphor, mood, subtext, or guesses.
${PREDICATE_GUIDE}
- Skip style, clothing-of-the-moment, and implied feelings.
- If nothing is extractable, return {"facts":[]}.`;

export function extractorUserPrompt(prose: string, chapterTitle: string): string {
  return `Chapter: ${chapterTitle.trim() || "Untitled"}\n\nProse:\n${prose.trim()}`;
}

/**
 * A separate system prompt for Interview transcripts (roadmap-ideas.md #18),
 * not a reuse of EXTRACTOR_SYSTEM. That one is written for third-person
 * narrative prose ("accepted prose") and gave the extractor nothing to go
 * on when the interviewee's turns are first-person ("my favorite food is
 * meatballs") — a tester's local model found zero facts in an answer that
 * plainly stated some, because nothing told it "I"/"my" in those turns
 * means the interviewee. This version names the interviewee explicitly.
 *
 * characterInterviewSystem only answers in the first person for an actual
 * character — a place, object, group, event, or concept is answered about
 * in the third person, by a narrator who names the subject directly (e.g.
 * "Henrik's apartment is generally tidy..."). An earlier version of this
 * prompt flatly asserted "the interviewee's turns are in the first
 * person," which was simply false for that second case — worded below to
 * cover both without assuming one.
 */
export const INTERVIEW_EXTRACTOR_SYSTEM = `You extract established narrative facts from a private interview transcript between "Author" (asking questions) and a character or entity from the author's manuscript (answering).
Return JSON only, shaped as: {"facts":[{"entity_label":"...","predicate":"core.identity","value":"..."}]}

Rules:
- The interviewee's turns may be answered in the first person ("I", "me", "my") if the interviewee is a character, or in the third person, naming the subject directly, if it is a place, object, group, event, or concept. Either way, every stated claim belongs to the interviewee named below unless it is plainly about someone or something else they name instead — use the interviewee's own name as entity_label for claims about them, never "I", "me", "the interviewee", or "the narrator".
- Only claims the interviewee actually states as true — about themselves or anyone/anything else they mention. No metaphor, mood, subtext, or invented details. This does NOT rule out a hedged or approximate answer ("let's say 35", "probably a few years old", "it's been a while") — that hedging is how the interviewee themselves chose to state it, still extract it, using their own wording for the value.
- The Author's own questions are never a source of facts, only what the interviewee answers.
${PREDICATE_GUIDE}
- If nothing is extractable, return {"facts":[]}.
- Respond with the JSON object and nothing else: no explanation, no markdown fences, no text before or after it — even when the answer is {"facts":[]}.`;

export function interviewExtractorUserPrompt(transcript: string, interviewee: string): string {
  return `Interviewee: ${interviewee.trim()} (whether their answers below use "I"/"me"/"my" or name them directly in the third person, facts about them belong to this name)\n\nTranscript:\n${transcript.trim()}`;
}

/**
 * A third system prompt, for the author's own planning material (Brainstorm
 * notes, and later Synopsis and chapter/scene briefs) — not a reuse of
 * EXTRACTOR_SYSTEM. That one is written for "accepted prose": settled,
 * already-true narrative. Planning text is the opposite on purpose — it's
 * where an author tries out possibilities that may never happen ("Nora may
 * discover that Marcus was involved…"). Extracting that the same way
 * EXTRACTOR_SYSTEM extracts finished prose would flatten a maybe into a
 * flat claim. This still only ever produces *candidates* for review, same
 * as every other extractor — the hedge-preserving rule below is about
 * making the candidate itself read honestly, not about gating whether it
 * reaches the review queue (nothing here ever auto-locks).
 */
export const PLANNING_EXTRACTOR_SYSTEM = `You extract candidate narrative facts from an author's own planning notes — brainstorming or synopsis material, not finished prose.
Return JSON only, shaped as: {"facts":[{"entity_label":"...","predicate":"core.identity","value":"..."}]}

Rules:
- This text is planning material: the author may be stating something as settled, or trying out a possibility that may change or never happen.
- A claim stated as definite ("Nora lives in Blackwater") extracts normally.
- A claim stated as possible, conditional, or speculative ("Nora may discover…", "perhaps Marcus knows…", "what if…") also extracts, but keep the same hedge in value, in the author's own words, rather than restating it as settled fact. Never drop the hedge to make the value read more certain than the text does.
${PREDICATE_GUIDE}
- Skip pure brainstorming chatter with no concrete claim at all — a bare question with no proposed answer, a mood note, a reminder to self.
- If nothing is extractable, return {"facts":[]}.
- Respond with the JSON object and nothing else: no explanation, no markdown fences, no text before or after it — even when the answer is {"facts":[]}.`;

export function planningExtractorUserPrompt(text: string, sourceLabel: string): string {
  return `Source: ${sourceLabel.trim() || "Untitled"}\n\nText:\n${text.trim()}`;
}
