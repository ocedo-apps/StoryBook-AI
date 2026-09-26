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
    const ref =
      (typeof rec.entity_ref === "string" && rec.entity_ref.trim()) || slugify(label);
    drafts.push({
      entity_ref: slugify(ref),
      entity_label: label,
      predicate: predicateRaw,
      value
    });
  }
  return drafts;
}

export const EXTRACTOR_SYSTEM = `You extract established narrative facts from accepted prose.
Return JSON only, shaped as: {"facts":[{"entity_label":"...","entity_ref":"slug","predicate":"core.identity","value":"..."}]}

Rules:
- Only claims the text states as true. No metaphor, mood, subtext, or guesses.
- predicate must be one of: core.identity, core.trait, core.place, core.object, core.group, core.relationship, core.event, core.concept
- entity_label is the person's, place's, object's, group's, or concept's displayed name. entity_ref is a lowercase slug.
- core.identity: who this is (a single person, name, role). core.trait: a stable characteristic. core.place: a named location, including a ship or building you can be inside. core.object: a named thing. core.group: a named order, crew, house, guild, or other collective — not one person. core.relationship: how two people are connected. core.event: something that has happened. core.concept: a named abstract idea, system, rule, or piece of lore that is not a person, place, object, or group — a magic system, a historical era, a custom, a law.
- Skip style, clothing-of-the-moment, and implied feelings.
- If nothing is extractable, return {"facts":[]}.`;

export function extractorUserPrompt(prose: string, chapterTitle: string): string {
  return `Chapter: ${chapterTitle.trim() || "Untitled"}\n\nProse:\n${prose.trim()}`;
}
