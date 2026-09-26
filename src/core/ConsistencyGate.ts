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
  | { kind: "possible_enrichment"; supersedesId: string; suggestedValue: string }
  | { kind: "valid_change"; supersedesId: string };

const MERGE_STOP_WORDS = new Set([
  "a", "an", "the", "is", "was", "were", "are", "be", "been", "on", "in", "at", "of", "to", "and", "or",
  "with", "for", "as", "by", "from", "that", "this", "his", "her", "their", "its"
]);

function meaningfulTokens(value: string): Set<string> {
  const tokens = new Set<string>();
  for (const raw of value.split(/[^\p{L}\p{N}]+/u)) {
    const token = raw.toLowerCase();
    if (!token || token.length < 2 || MERGE_STOP_WORDS.has(token)) continue;
    tokens.add(token);
  }
  return tokens;
}

/**
 * True when two values under the same entity+predicate look like the same
 * underlying claim restated with more (or less) detail — "captain" vs
 * "captain on a space ship" — rather than a genuine disagreement. Purely
 * deterministic (no AI call): either value contains the other, or most of
 * the shorter value's meaningful words also appear in the longer one.
 * Diverging specifics ("a space ship" vs "the Odyssey") correctly fall
 * through to a real flagged conflict — a human call, not a merge.
 */
export function isPossibleEnrichment(oldValue: string, newValue: string): boolean {
  const a = normalizeValue(oldValue);
  const b = normalizeValue(newValue);
  if (!a || !b || a === b) return false;
  if (a.includes(b) || b.includes(a)) return true;

  const tokensA = meaningfulTokens(oldValue);
  const tokensB = meaningfulTokens(newValue);
  if (tokensA.size === 0 || tokensB.size === 0) return false;
  let shared = 0;
  for (const token of tokensA) {
    if (tokensB.has(token)) shared += 1;
  }
  return shared / Math.min(tokensA.size, tokensB.size) >= 0.6;
}

/** The longer value already contains the shorter one; otherwise default to the newest telling. */
function suggestedMergedValue(oldValue: string, newValue: string): string {
  const a = normalizeValue(oldValue);
  const b = normalizeValue(newValue);
  if (a.includes(b)) return oldValue.trim();
  if (b.includes(a)) return newValue.trim();
  return newValue.trim();
}

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
  if (normalizeValue(other.value).includes(normalizeValue(draft.value))) {
    // The new claim adds nothing beyond what is already locked truth.
    return { kind: "auto_approve", existingId: other.id };
  }
  if (isPossibleEnrichment(other.value, draft.value)) {
    return {
      kind: "possible_enrichment",
      supersedesId: other.id,
      suggestedValue: suggestedMergedValue(other.value, draft.value)
    };
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
    is_merge_suggestion?: boolean;
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
  if (args.is_merge_suggestion) fact.is_merge_suggestion = true;
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
  chapter_id?: string,
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
          ...(chapter_id ? { chapter_id } : {}),
          ...(scene_id ? { scene_id } : {}),
          conflict_with: decision.againstId
        })
      );
      continue;
    }

    if (decision.kind === "possible_enrichment") {
      next = next.concat(
        factFromDraft(
          { ...draft, value: decision.suggestedValue },
          {
            status: "flagged",
            source: "extractor",
            sequence_index,
            ...(chapter_id ? { chapter_id } : {}),
            ...(scene_id ? { scene_id } : {}),
            conflict_with: decision.supersedesId,
            is_merge_suggestion: true
          }
        )
      );
      continue;
    }

    next = next.concat(
      factFromDraft(draft, {
        status: "ai_proposed",
        source: "extractor",
        sequence_index,
        ...(chapter_id ? { chapter_id } : {}),
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
