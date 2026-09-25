import { z } from "zod";
import { CORE_PREDICATES, type CorePredicate } from "./predicates";

export const FactStatusSchema = z.enum(["locked", "ai_proposed", "flagged"]);
export type FactStatus = z.infer<typeof FactStatusSchema>;

export const FactSourceSchema = z.enum(["author", "extractor"]);
export type FactSource = z.infer<typeof FactSourceSchema>;

/**
 * One established (or proposed) narrative claim.
 * In this app the Story Bible *is* these rows — not an export shadow.
 * Facts are never deleted once locked; they are superseded.
 * Proposed/flagged rows may be dropped if the author rejects them
 * before they become truth.
 */
export const NarrativeFactSchema = z.object({
  id: z.string().min(1),
  entity_ref: z.string().min(1),
  entity_label: z.string().min(1),
  predicate: z.enum(CORE_PREDICATES),
  value: z.string().min(1),
  sequence_index: z.number().int().nonnegative(),
  chapter_id: z.string().min(1).optional(),
  /**
   * Which scene within chapter_id established this fact. Optional,
   * additive, non-breaking — same pattern as chapter_id. Missing on
   * older saves and on facts predating scene-awareness.
   */
  scene_id: z.string().min(1).optional(),
  status: FactStatusSchema,
  source: FactSourceSchema,
  conflict_with: z.string().min(1).optional(),
  superseded_by: z.string().min(1).optional(),
  /**
   * When true, Draft / brainstorm / extract prompts omit this row.
   * Missing on older saves — the claim stays visible to the model.
   */
  hidden_from_ai: z.boolean().optional(),
  /**
   * Manual override for Draft's automatic story-time position filter
   * (roadmap-ideas.md #24): "include" always shows this fact to Draft
   * regardless of chapter position, "exclude" always hides it. Missing
   * (the common case) leaves the automatic story-time guess in charge —
   * this is the safety valve for when that guess is wrong, not a
   * replacement for it.
   */
  position_override: z.enum(["include", "exclude"]).optional(),
  /**
   * True when this flagged row is a near-duplicate of `conflict_with`
   * (e.g. "captain" vs "captain on a space ship") rather than a genuine
   * contradiction — the review UI offers "Merge" instead of "pick a side".
   * Missing on older saves and on genuine conflicts.
   */
  is_merge_suggestion: z.boolean().optional(),
  created_at: z.string().min(1)
});
export type NarrativeFact = z.infer<typeof NarrativeFactSchema>;

export type FactDraft = {
  entity_ref: string;
  entity_label: string;
  predicate: CorePredicate;
  value: string;
};

export function isActiveFact(fact: NarrativeFact): boolean {
  return fact.superseded_by === undefined;
}

export function activeFacts(facts: NarrativeFact[]): NarrativeFact[] {
  return facts.filter(isActiveFact);
}

export function lockedFacts(facts: NarrativeFact[]): NarrativeFact[] {
  return facts.filter((fact) => isActiveFact(fact) && fact.status === "locked");
}
