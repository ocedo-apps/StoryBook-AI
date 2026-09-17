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
  status: FactStatusSchema,
  source: FactSourceSchema,
  conflict_with: z.string().min(1).optional(),
  superseded_by: z.string().min(1).optional(),
  /**
   * When true, Draft / brainstorm / extract prompts omit this row.
   * Missing on older saves — the claim stays visible to the model.
   */
  hidden_from_ai: z.boolean().optional(),
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
