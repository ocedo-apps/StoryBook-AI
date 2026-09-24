import { isLiveChapter, type Book } from "./BookSchema";
import type { CorePredicate } from "./predicates";
import { visibleLockedFacts } from "./visibility";

/**
 * A locked fact the model can see, established later in the manuscript's
 * reading order than the chapter in question — Continuity 2.0's first,
 * fully deterministic slice (roadmap-ideas.md #10). Spatial continuity and
 * object-state tracking need either an authored location graph or an LLM
 * call; a "does this chapter already know something from later" check
 * needs neither — chapter_id + sequence_index already say enough.
 */
export type KnowledgeLeak = {
  factId: string;
  entityLabel: string;
  predicate: CorePredicate;
  value: string;
  establishedChapterId: string;
  establishedChapterTitle: string;
  establishedSequenceIndex: number;
};

/**
 * Locked facts visible to the model that were established in a live
 * chapter coming after `chapterId` in reading order. Facts with no
 * chapter_id (general worldbuilding, or older saves) are never flagged —
 * there is nothing to compare against. Facts from discarded chapters are
 * skipped the same way: no live reading position to judge "later" by.
 */
export function knowledgeLeaksForChapter(book: Book, chapterId: string): KnowledgeLeak[] {
  const chapter = book.chapters.find((item) => item.id === chapterId);
  if (!chapter) return [];

  const chaptersById = new Map(book.chapters.map((item) => [item.id, item]));
  const leaks: KnowledgeLeak[] = [];

  for (const fact of visibleLockedFacts(book.facts, book.hidden_entities)) {
    if (!fact.chapter_id) continue;
    const source = chaptersById.get(fact.chapter_id);
    if (!source || !isLiveChapter(source) || source.sequence_index <= chapter.sequence_index) continue;
    leaks.push({
      factId: fact.id,
      entityLabel: fact.entity_label,
      predicate: fact.predicate,
      value: fact.value,
      establishedChapterId: source.id,
      establishedChapterTitle: source.title,
      establishedSequenceIndex: source.sequence_index
    });
  }

  return leaks.sort(
    (a, b) => a.establishedSequenceIndex - b.establishedSequenceIndex || a.entityLabel.localeCompare(b.entityLabel)
  );
}
