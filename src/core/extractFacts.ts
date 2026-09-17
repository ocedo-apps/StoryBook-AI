import { slugify } from "./ids";
import { isCorePredicate } from "./predicates";
import type { FactDraft } from "./NarrativeFact";

/**
 * Pull a JSON object out of model output (fences, leading prose, trailing notes).
 */
export function recoverJsonObject(raw: string): unknown {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const body = (fenced?.[1] ?? trimmed).trim();
  const start = body.indexOf("{");
  const end = body.lastIndexOf("}");
  if (start < 0 || end <= start) {
    throw new Error("Extractor returned no JSON object.");
  }
  return JSON.parse(body.slice(start, end + 1));
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
- predicate must be one of: core.identity, core.trait, core.place, core.object, core.group, core.relationship, core.event
- entity_label is the person's, place's, object's, or group's displayed name. entity_ref is a lowercase slug.
- core.identity: who this is (a single person, name, role). core.trait: a stable characteristic. core.place: a named location, including a ship or building you can be inside. core.object: a named thing. core.group: a named order, crew, house, guild, or other collective — not one person. core.relationship: how two people are connected. core.event: something that has happened.
- Skip style, clothing-of-the-moment, and implied feelings.
- If nothing is extractable, return {"facts":[]}.`;

export function extractorUserPrompt(prose: string, chapterTitle: string): string {
  return `Chapter: ${chapterTitle.trim() || "Untitled"}\n\nProse:\n${prose.trim()}`;
}
