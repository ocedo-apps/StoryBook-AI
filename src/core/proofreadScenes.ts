import type { Book } from "./BookSchema";
import { isEchoContentWord } from "./echoDetect";
import { entityLabels } from "./bibleGroups";
import { entityNameTokens, normalizeWord, wordsIn } from "./proseStats";
import { splitFlowParagraphs } from "./proseFlow";
import { proseChapters, type SceneQueueItem } from "./proofread";

const MIN_PARA_WORDS = 20;
const MIN_STEM_OVERLAP = 5;
const MIN_NAME_OVERLAP = 1;
const MAX_CANDIDATES = 24;
const SAME_CHAPTER_GAP = 2;

export type ScenePara = {
  chapterId: string;
  chapterIndex: number;
  paragraphIndex: number;
  text: string;
  names: Set<string>;
  stems: Set<string>;
};

export type SceneScan = {
  total: number;
  candidates: SceneQueueItem[];
};

export function listSceneParagraphs(book: Book, names: Iterable<string> = []): ScenePara[] {
  const nameSet = names instanceof Set ? names : entityNameTokens([...names]);
  const out: ScenePara[] = [];
  for (const chapter of proseChapters(book)) {
    const blocks = splitFlowParagraphs(chapter.prose);
    blocks.forEach((text, paragraphIndex) => {
      const words = wordsIn(text);
      if (words.length < MIN_PARA_WORDS) return;
      const found = new Set<string>();
      const stems = new Set<string>();
      for (const raw of words) {
        const norm = normalizeWord(raw);
        if (!norm) continue;
        if (nameSet.has(norm)) {
          found.add(norm);
          continue;
        }
        if (!isEchoContentWord(raw, nameSet)) continue;
        stems.add(lightStem(norm));
      }
      out.push({
        chapterId: chapter.id,
        chapterIndex: chapter.sequence_index,
        paragraphIndex,
        text,
        names: found,
        stems
      });
    });
  }
  return out;
}

export function collectSceneScan(book: Book, names: Iterable<string> = entityLabels(book.facts, book.entity_kinds)): SceneScan {
  const paras = listSceneParagraphs(book, names);
  let total = 0;
  const scored: { item: SceneQueueItem; score: number }[] = [];
  for (let i = 0; i < paras.length; i++) {
    const left = paras[i];
    if (!left) continue;
    for (let j = i + 1; j < paras.length; j++) {
      const right = paras[j];
      if (!right) continue;
      if (skipPair(left, right)) continue;
      total += 1;
      const score = pairScore(left, right);
      if (score <= 0) continue;
      scored.push({
        score,
        item: {
          chapterId: left.chapterId,
          paragraphIndex: left.paragraphIndex,
          chapterIdB: right.chapterId,
          paragraphIndexB: right.paragraphIndex
        }
      });
    }
  }
  scored.sort((a, b) => b.score - a.score || a.item.chapterId.localeCompare(b.item.chapterId));
  return { total, candidates: scored.slice(0, MAX_CANDIDATES).map((row) => row.item) };
}

function skipPair(left: ScenePara, right: ScenePara): boolean {
  if (left.chapterId !== right.chapterId) return false;
  return Math.abs(left.paragraphIndex - right.paragraphIndex) <= SAME_CHAPTER_GAP;
}

function pairScore(left: ScenePara, right: ScenePara): number {
  let names = 0;
  for (const name of left.names) {
    if (right.names.has(name)) names += 1;
  }
  let stems = 0;
  for (const stem of left.stems) {
    if (right.stems.has(stem)) stems += 1;
  }
  const named = left.names.size > 0 || right.names.size > 0;
  if (named && names < MIN_NAME_OVERLAP && stems < MIN_STEM_OVERLAP + 2) return 0;
  if (!named && stems < MIN_STEM_OVERLAP) return 0;
  if (names < MIN_NAME_OVERLAP && stems < MIN_STEM_OVERLAP) return 0;
  return names * 10 + stems;
}

function lightStem(word: string): string {
  if (word.length < 5) return word;
  if (word.endsWith("ies") && word.length > 6) return `${word.slice(0, -3)}y`;
  if (word.endsWith("ing") && word.length > 6) return word.slice(0, -3);
  if (word.endsWith("ied")) return `${word.slice(0, -3)}y`;
  if (word.endsWith("ed") && word.length > 5) return word.slice(0, -2);
  if (word.endsWith("es") && word.length > 5) return word.slice(0, -2);
  if (word.endsWith("s") && !word.endsWith("ss")) return word.slice(0, -1);
  return word;
}
