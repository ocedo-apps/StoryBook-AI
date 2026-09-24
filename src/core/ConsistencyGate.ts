import { newId, nowIso, normalizeValue } from "./ids";
import {
  activeFacts,
  type FactDraft,
  type FactSource,
  type NarrativeFact
} from "./NarrativeFact";

export type GateDecision =
  | { kind: "auto_approve"; existingId: string }
  | { kind: "propose_new" }
  | { kind: "flagged_conflict"; againstId: string }
  | { kind: "valid_change"; supersedesId: string };

/**
 * Deterministic ConsistencyGate steps 1–2.
 * LLM reasoning (step 3) is not wired yet — contradictions are
 * same entity + same predicate + different normalized value.
 */
export function evaluateCandidate(
  draft: FactDraft,
  facts: NarrativeFact[],
  source: FactSource
): GateDecision {
  const live = activeFacts(facts).filter(
    (fact) =>
      fact.entity_ref === draft.entity_ref && fact.predicate === draft.predicate && fact.status !== "ai_proposed"
  );
  const lockedOrFlagged = live.filter((fact) => fact.status === "locked" || fact.status === "flagged");
  const match = lockedOrFlagged.find((fact) => normalizeValue(fact.value) === normalizeValue(draft.value));

  if (match) {
    return { kind: "auto_approve", existingId: match.id };
  }

  const other = lockedOrFlagged.find((fact) => fact.status === "locked");
  if (!other) {
    return { kind: "propose_new" };
  }

  if (source === "author") {
    return { kind: "valid_change", supersedesId: other.id };
  }
  return { kind: "flagged_conflict", againstId: other.id };
}

export function factFromDraft(
  draft: FactDraft,
  args: {
    status: NarrativeFact["status"];
    source: FactSource;
    sequence_index: number;
    chapter_id?: string;
    scene_id?: string;
    conflict_with?: string;
  }
): NarrativeFact {
  const fact: NarrativeFact = {
    id: newId(),
    entity_ref: draft.entity_ref,
    entity_label: draft.entity_label.trim() || draft.entity_ref,
    predicate: draft.predicate,
    value: draft.value.trim(),
    sequence_index: args.sequence_index,
    status: args.status,
    source: args.source,
    created_at: nowIso()
  };
  if (args.chapter_id) fact.chapter_id = args.chapter_id;
  if (args.scene_id) fact.scene_id = args.scene_id;
  if (args.conflict_with) fact.conflict_with = args.conflict_with;
  return fact;
}

export function applyAuthorDraft(
  facts: NarrativeFact[],
  draft: FactDraft,
  sequence_index: number,
  chapter_id?: string,
  scene_id?: string
): NarrativeFact[] {
  const decision = evaluateCandidate(draft, facts, "author");
  if (decision.kind === "auto_approve") return facts;

  const args: {
    status: "locked";
    source: "author";
    sequence_index: number;
    chapter_id?: string;
    scene_id?: string;
  } = { status: "locked", source: "author", sequence_index };
  if (chapter_id) args.chapter_id = chapter_id;
  if (scene_id) args.scene_id = scene_id;

  if (decision.kind === "valid_change") {
    const next = factFromDraft(draft, args);
    const previous = facts.find((fact) => fact.id === decision.supersedesId);
    if (previous?.hidden_from_ai === true) next.hidden_from_ai = true;
    return facts.map((fact) => (fact.id === decision.supersedesId ? { ...fact, superseded_by: next.id } : fact)).concat(next);
  }

  return facts.concat(factFromDraft(draft, args));
}

export function applyExtractorDrafts(
  facts: NarrativeFact[],
  drafts: FactDraft[],
  sequence_index: number,
  chapter_id: string,
  scene_id?: string
): NarrativeFact[] {
  let next = facts;
  for (const draft of drafts) {
    const value = draft.value.trim();
    const entity_ref = draft.entity_ref.trim();
    if (!value || !entity_ref) continue;

    const alreadyPending = activeFacts(next).some(
      (fact) =>
        fact.entity_ref === entity_ref &&
        fact.predicate === draft.predicate &&
        normalizeValue(fact.value) === normalizeValue(value) &&
        (fact.status === "ai_proposed" || fact.status === "flagged")
    );
    if (alreadyPending) continue;

    const decision = evaluateCandidate(draft, next, "extractor");
    if (decision.kind === "auto_approve") continue;

    if (decision.kind === "flagged_conflict") {
      next = next.concat(
        factFromDraft(draft, {
          status: "flagged",
          source: "extractor",
          sequence_index,
          chapter_id,
          ...(scene_id ? { scene_id } : {}),
          conflict_with: decision.againstId
        })
      );
      continue;
    }

    next = next.concat(
      factFromDraft(draft, {
        status: "ai_proposed",
        source: "extractor",
        sequence_index,
        chapter_id,
        ...(scene_id ? { scene_id } : {})
      })
    );
  }
  return next;
}

/** Author accepts a proposal: it becomes locked truth. */
export function approveFact(facts: NarrativeFact[], factId: string): NarrativeFact[] {
  const target = facts.find((fact) => fact.id === factId);
  if (!target || target.superseded_by || (target.status !== "ai_proposed" && target.status !== "flagged")) {
    return facts;
  }

  if (target.status === "flagged" && target.conflict_with) {
    const conflictId = target.conflict_with;
    const replacement: NarrativeFact = {
      id: target.id,
      entity_ref: target.entity_ref,
      entity_label: target.entity_label,
      predicate: target.predicate,
      value: target.value,
      sequence_index: target.sequence_index,
      status: "locked",
      source: target.source,
      created_at: target.created_at
    };
    if (target.chapter_id) replacement.chapter_id = target.chapter_id;
    if (target.scene_id) replacement.scene_id = target.scene_id;
    return facts.map((fact) => {
      if (fact.id === conflictId) return { ...fact, superseded_by: target.id };
      if (fact.id === factId) return replacement;
      return fact;
    });
  }

  return facts.map((fact) => (fact.id === factId ? { ...fact, status: "locked" } : fact));
}

/**
 * Author thickens or corrects a claim.
 * Pending rows are edited in place. Locked rows are superseded.
 */
export function reviseFact(facts: NarrativeFact[], factId: string, value: string): NarrativeFact[] {
  const trimmed = value.trim();
  const target = facts.find((fact) => fact.id === factId);
  if (!target || target.superseded_by || !trimmed) return facts;
  if (normalizeValue(target.value) === normalizeValue(trimmed)) return facts;

  if (target.status === "locked") {
    const draft = {
      entity_ref: target.entity_ref,
      entity_label: target.entity_label,
      predicate: target.predicate,
      value: trimmed
    };
    if (target.chapter_id) {
      return applyAuthorDraft(facts, draft, target.sequence_index, target.chapter_id, target.scene_id);
    }
    return applyAuthorDraft(facts, draft, target.sequence_index);
  }

  return facts.map((fact) =>
    fact.id === factId ? { ...fact, value: trimmed, source: "author" as const } : fact
  );
}

/**
 * Reject a proposal that never became truth. Locked rows stay;
 * they can only be superseded.
 */
export function rejectFact(facts: NarrativeFact[], factId: string): NarrativeFact[] {
  const target = facts.find((fact) => fact.id === factId);
  if (!target || target.status === "locked" || target.superseded_by) return facts;
  return facts.filter((fact) => fact.id !== factId);
}
