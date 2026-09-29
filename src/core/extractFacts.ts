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
 */
export function recoverJsonObject(raw: string): unknown {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const body = (fenced?.[1] ?? trimmed).trim();
  const start = body.indexOf("{");
  if (start < 0) {
    throw new Error("Extractor returned no JSON object.");
  }
  const end = body.lastIndexOf("}");
  if (end > start) {
    try {
      return JSON.parse(body.slice(start, end + 1));
    } catch {
      // Falls through to salvage whatever complete fact objects it can.
    }
  }
  const facts = recoverTruncatedFacts(body.slice(start));
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

export const EXTRACTOR_SYSTEM = `You extract established narrative facts from accepted prose.
Return JSON only, shaped as: {"facts":[{"entity_label":"...","predicate":"core.identity","value":"..."}]}

Rules:
- Only claims the text states as true. No metaphor, mood, subtext, or guesses.
- predicate must be one of: core.identity, core.trait, core.place, core.object, core.group, core.relationship, core.event, core.concept
- entity_label is the person's, place's, object's, group's, or concept's displayed name. Spell it exactly the same way, every time, whenever the same fact-holder comes up again in this extraction — matching spellings are how the app recognizes it is the same card; a different spelling (a title added or dropped, a nickname) is treated as a different card.
- core.identity: who this is (a single person, name, role). core.trait: a stable characteristic. core.place: a named location, including a ship or building you can be inside. core.object: a named thing. core.group: a named order, crew, house, guild, or other collective — not one person. core.relationship: how two people are connected. core.event: something that has happened. core.concept: a named abstract idea, system, rule, or piece of lore that is not a person, place, object, or group — a magic system, a historical era, a custom, a law.
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
 * means the interviewee (characterInterviewSystem always has them answer
 * in the first person). This version names the interviewee explicitly and
 * says outright what their pronouns resolve to, so a small local model
 * doesn't have to infer it from the "Henrik: ..." turn labels alone.
 */
export const INTERVIEW_EXTRACTOR_SYSTEM = `You extract established narrative facts from a private interview transcript between "Author" (asking questions) and a character or entity from the author's manuscript (answering).
Return JSON only, shaped as: {"facts":[{"entity_label":"...","predicate":"core.identity","value":"..."}]}

Rules:
- The interviewee's turns are in the first person ("I", "me", "my"). Every first-person statement they make about themselves is a fact about the interviewee — use the interviewee's own name (given below) as entity_label, never "I" or "the interviewee".
- Only claims the interviewee actually states as true — about themselves or anyone/anything else they mention. No metaphor, mood, subtext, or guesses.
- The Author's own questions are never a source of facts, only what the interviewee answers.
- predicate must be one of: core.identity, core.trait, core.place, core.object, core.group, core.relationship, core.event, core.concept
- entity_label is the person's, place's, object's, group's, or concept's displayed name. Spell it exactly the same way, every time, whenever the same fact-holder comes up again in this extraction — matching spellings are how the app recognizes it is the same card; a different spelling (a title added or dropped, a nickname) is treated as a different card.
- core.identity: who this is (a single person, name, role). core.trait: a stable characteristic, a stated preference, or a habit. core.place: a named location, including a ship or building you can be inside. core.object: a named thing. core.group: a named order, crew, house, guild, or other collective — not one person. core.relationship: how two people are connected. core.event: something that has happened. core.concept: a named abstract idea, system, rule, or piece of lore that is not a person, place, object, or group — a magic system, a historical era, a custom, a law.
- If nothing is extractable, return {"facts":[]}.
- Respond with the JSON object and nothing else: no explanation, no markdown fences, no text before or after it — even when the answer is {"facts":[]}.`;

export function interviewExtractorUserPrompt(transcript: string, interviewee: string): string {
  return `Interviewee: ${interviewee.trim()} (this is who "I"/"me"/"my" refers to in their answers below)\n\nTranscript:\n${transcript.trim()}`;
}
