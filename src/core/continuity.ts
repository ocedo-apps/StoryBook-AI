import { isLiveChapter, type Book } from "./BookSchema";
import type { CorePredicate } from "./predicates";
import { storyTimeRankByChapterId } from "./timeline";
import { visibleLockedFacts } from "./visibility";

/**
 * A locked fact the model can see, established later in the manuscript's
 * story time than the chapter in question — Continuity 2.0's first, fully
 * deterministic slice (roadmap-ideas.md #10). Spatial continuity and
 * object-state tracking need either an authored location graph or an LLM
 * call; a "does this chapter already know something from later" check
 * needs neither — chapter_id + story time already say enough. Uses story
 * time (roadmap-ideas.md #24), not reading order: a flashback chapter
 * knowing something from "later in the book" is correct if that something
 * happens earlier on the story's own clock.
 */
export type KnowledgeLeak = {
  factId: string;
  entityLabel: string;
  predicate: CorePredicate;
  value: string;
  establishedChapterId: string;
  establishedChapterTitle: string;
  establishedStoryTimeRank: number;
};

/**
 * Locked facts visible to the model that were established in a live
 * chapter coming after `chapterId` in story time. Facts with no chapter_id
 * (general worldbuilding, or older saves) are never flagged — there is
 * nothing to compare against. Facts from discarded chapters are skipped
 * the same way: no live story-time position to judge "later" by.
 */
export function knowledgeLeaksForChapter(book: Book, chapterId: string): KnowledgeLeak[] {
  const chaptersById = new Map(book.chapters.map((item) => [item.id, item]));
  const ranks = storyTimeRankByChapterId(book);
  const chapterRank = ranks.get(chapterId);
  if (chapterRank === undefined) return [];

  const leaks: KnowledgeLeak[] = [];

  for (const fact of visibleLockedFacts(book.facts, book.hidden_entities)) {
    if (!fact.chapter_id) continue;
    const source = chaptersById.get(fact.chapter_id);
    if (!source || !isLiveChapter(source)) continue;
    const sourceRank = ranks.get(source.id);
    if (sourceRank === undefined || sourceRank <= chapterRank) continue;
    leaks.push({
      factId: fact.id,
      entityLabel: fact.entity_label,
      predicate: fact.predicate,
      value: fact.value,
      establishedChapterId: source.id,
      establishedChapterTitle: source.title,
      establishedStoryTimeRank: sourceRank
    });
  }

  return leaks.sort(
    (a, b) => a.establishedStoryTimeRank - b.establishedStoryTimeRank || a.entityLabel.localeCompare(b.entityLabel)
  );
}
