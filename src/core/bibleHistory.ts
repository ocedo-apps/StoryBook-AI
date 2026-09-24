import type { NarrativeFact } from "./NarrativeFact";
import type { CorePredicate } from "./predicates";

export type FactHistoryChain = {
  predicate: CorePredicate;
  /** Oldest first, last entry is the current (active) fact. */
  entries: NarrativeFact[];
};

/**
 * Was this fact ever part of the locked truth timeline? A superseded fact
 * keeps whatever status it had when it was locked, so checking either
 * condition covers both "currently locked" and "locked, since superseded".
 */
function wasEverLocked(fact: NarrativeFact): boolean {
  return fact.status === "locked" || fact.superseded_by !== undefined;
}

/**
 * Chains of superseded facts for one entity, one chain per independent
 * "slot" (an entity can carry several simultaneous facts under the same
 * predicate — e.g. several `core.trait` rows — that never supersede one
 * another and so are unrelated, single-entry chains). Only chains longer
 * than one entry represent a genuine change over time; the caller decides
 * whether to filter those out for display.
 */
export function factHistoryForEntity(facts: NarrativeFact[], entity_ref: string): FactHistoryChain[] {
  const rows = facts.filter((fact) => fact.entity_ref === entity_ref && wasEverLocked(fact));
  const heads = rows.filter((fact) => fact.superseded_by === undefined);

  return heads
    .map((head) => {
      const entries: NarrativeFact[] = [head];
      let current = head;
      for (;;) {
        const previous = rows.find((fact) => fact.superseded_by === current.id);
        if (!previous) break;
        entries.unshift(previous);
        current = previous;
      }
      return { predicate: head.predicate, entries };
    })
    .sort((a, b) => a.entries[0]!.sequence_index - b.entries[0]!.sequence_index);
}

/** Only the chains that actually changed — a single-entry chain has no history to show. */
export function chainsWithHistory(chains: FactHistoryChain[]): FactHistoryChain[] {
  return chains.filter((chain) => chain.entries.length > 1);
}
