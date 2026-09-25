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
/** One chain per head (a fact with nothing superseding it), walking backward through `superseded_by`. */
function buildChains(rows: NarrativeFact[]): FactHistoryChain[] {
  const heads = rows.filter((fact) => fact.superseded_by === undefined);
  return heads.map((head) => {
    const entries: NarrativeFact[] = [head];
    let current = head;
    for (;;) {
      const previous = rows.find((fact) => fact.superseded_by === current.id);
      if (!previous) break;
      entries.unshift(previous);
      current = previous;
    }
    return { predicate: head.predicate, entries };
  });
}

export function factHistoryForEntity(facts: NarrativeFact[], entity_ref: string): FactHistoryChain[] {
  const rows = facts.filter((fact) => fact.entity_ref === entity_ref && wasEverLocked(fact));
  return buildChains(rows).sort((a, b) => a.entries[0]!.sequence_index - b.entries[0]!.sequence_index);
}

/** Only the chains that actually changed — a single-entry chain has no history to show. */
export function chainsWithHistory(chains: FactHistoryChain[]): FactHistoryChain[] {
  return chains.filter((chain) => chain.entries.length > 1);
}

/**
 * Every fact-history chain in the book, across every entity — the building
 * block for "state as of a point in the manuscript" (roadmap-ideas.md #16).
 * A chain never crosses entities (supersession only ever replaces a fact
 * with another of the same entity + predicate), so this is safe to compute
 * book-wide in one pass rather than once per entity.
 */
export function bookFactChains(facts: NarrativeFact[]): FactHistoryChain[] {
  return buildChains(facts.filter(wasEverLocked));
}

/**
 * Each entity's locked facts as they stood by a given point in STORY time
 * (roadmap-ideas.md #24, not reading order — a flashback chapter shouldn't
 * "know" something that's only established later on the story's own
 * clock) — the latest entry in each chain established at or before
 * `asOfRank`. A chain with nothing yet established by that point is left
 * out entirely, matching what a reader (or the author, mid-draft) would
 * actually know by then rather than the book's final, current truth.
 *
 * `chapterStoryTimeRank` is chapter id -> story-time rank, from
 * `storyTimeRankByChapterId()` in `timeline.ts`. A fact with no
 * `chapter_id`, or one from a chapter missing from that map (deleted or
 * discarded), has no story-time position to judge — there's nothing to
 * compare against, so it's always included rather than silently dropped.
 */
export function factsAsOfSequence(
  facts: NarrativeFact[],
  chapterStoryTimeRank: Map<string, number>,
  asOfRank: number
): NarrativeFact[] {
  const result: NarrativeFact[] = [];
  for (const chain of bookFactChains(facts)) {
    let picked: NarrativeFact | undefined;
    for (const entry of chain.entries) {
      const rank = entry.chapter_id ? chapterStoryTimeRank.get(entry.chapter_id) : undefined;
      if (rank === undefined || rank <= asOfRank) picked = entry;
    }
    if (picked) result.push(picked);
  }
  return result;
}
