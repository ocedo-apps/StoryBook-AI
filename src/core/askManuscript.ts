import { normalizeWord, wordsIn } from "./proseStats";

/**
 * One scene's prose (roadmap-ideas.md #5), offered up as retrieval
 * material — one row per scene, not per chapter, so an unsplit chapter's
 * whole text is a single (large) source and a split chapter contributes a
 * smaller, more focused one per scene.
 */
export type ManuscriptSource = {
  sceneId: string;
  chapterId: string;
  chapterTitle: string;
  prose: string;
};

export type ManuscriptEvidence = {
  sceneId: string;
  chapterId: string;
  chapterTitle: string;
  excerpt: string;
  score: number;
};

export type AskManuscriptAnswer = {
  question: string;
  answer: string;
  evidence: ManuscriptEvidence[];
};

const DEFAULT_TOP_K = 4;
const EXCERPT_MAX_LENGTH = 1000;
const WORD_RE = /[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu;

export function cosineSimilarity(a: number[], b: number[]): number {
  const len = Math.min(a.length, b.length);
  if (len === 0) return 0;
  let dot = 0;
  let magA = 0;
  let magB = 0;
  for (let i = 0; i < len; i++) {
    const x = a[i] ?? 0;
    const y = b[i] ?? 0;
    dot += x * y;
    magA += x * x;
    magB += y * y;
  }
  if (magA === 0 || magB === 0) return 0;
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

export function chapterExcerpt(prose: string, maxLength = EXCERPT_MAX_LENGTH): string {
  const flat = prose.trim().replace(/\s+/g, " ");
  if (flat.length <= maxLength) return flat;
  const cut = flat.slice(0, maxLength);
  const lastSpace = cut.lastIndexOf(" ");
  return `${cut.slice(0, lastSpace > 0 ? lastSpace : maxLength)}…`;
}

function keywordHitPositions(flatText: string, keywords: Set<string>): number[] {
  if (keywords.size === 0) return [];
  const positions: number[] = [];
  for (const match of flatText.matchAll(WORD_RE)) {
    if (match.index !== undefined && keywords.has(normalizeWord(match[0]))) positions.push(match.index);
  }
  return positions;
}

/**
 * An excerpt built around where the question's own words actually cluster
 * in this source, instead of always the source's opening lines — a source
 * chosen as relevant is useless as evidence if the part the model actually
 * sees is a few hundred characters from the start of a long scene, nowhere
 * near the detail being asked about. Falls back to `chapterExcerpt`'s
 * start-of-text behavior when no keyword appears here at all (an
 * embedding-ranked source with no keywords supplied, or a genuine miss).
 */
export function excerptWindow(prose: string, keywords: Set<string>, maxLength = EXCERPT_MAX_LENGTH): string {
  const flat = prose.trim().replace(/\s+/g, " ");
  if (flat.length <= maxLength) return flat;

  const hits = keywordHitPositions(flat, keywords);
  if (hits.length === 0) return chapterExcerpt(flat, maxLength);

  let bestLeft = 0;
  let bestCount = 0;
  let left = 0;
  for (let right = 0; right < hits.length; right++) {
    while (hits[right]! - hits[left]! > maxLength) left++;
    const count = right - left + 1;
    if (count > bestCount) {
      bestCount = count;
      bestLeft = left;
    }
  }

  const clusterStart = hits[bestLeft]!;
  let start = Math.max(0, clusterStart - Math.floor(maxLength / 4));
  let end = Math.min(flat.length, start + maxLength);
  start = Math.max(0, end - maxLength);
  if (start > 0) {
    const nextSpace = flat.indexOf(" ", start);
    if (nextSpace !== -1 && nextSpace < end) start = nextSpace + 1;
  }
  if (end < flat.length) {
    const lastSpace = flat.lastIndexOf(" ", end);
    if (lastSpace > start) end = lastSpace;
  }
  const prefix = start > 0 ? "…" : "";
  const suffix = end < flat.length ? "…" : "";
  return `${prefix}${flat.slice(start, end)}${suffix}`;
}

function toEvidence(entries: { source: ManuscriptSource; score: number }[], topK: number, keywords: Set<string>): ManuscriptEvidence[] {
  return entries
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map((entry) => ({
      sceneId: entry.source.sceneId,
      chapterId: entry.source.chapterId,
      chapterTitle: entry.source.chapterTitle,
      excerpt: excerptWindow(entry.source.prose, keywords),
      score: entry.score
    }));
}

/**
 * Primary path: rank sources by embedding similarity to the question.
 * `question` is optional and only used to center each excerpt on its own
 * matching words — omitting it just falls back to an excerpt from the
 * start of each chosen source.
 */
export function rankBySimilarity(
  queryEmbedding: number[],
  sources: ManuscriptSource[],
  sourceEmbeddings: number[][],
  topK = DEFAULT_TOP_K,
  question = ""
): ManuscriptEvidence[] {
  return toEvidence(
    sources.map((source, index) => ({ source, score: cosineSimilarity(queryEmbedding, sourceEmbeddings[index] ?? []) })),
    topK,
    keywordTokens(question)
  );
}

const QUESTION_STOP = new Set([
  "the", "a", "an", "and", "or", "of", "to", "in", "on", "at", "is", "was", "were", "are", "be", "been", "being",
  "for", "with", "that", "this", "it", "as", "by", "from", "but", "not", "do", "does", "did", "how", "what", "who",
  "whom", "when", "where", "why", "which", "will", "would", "could", "should", "has", "have", "had", "i", "you",
  "he", "she", "they", "we", "his", "her", "their", "my", "your", "them", "him", "about", "into", "than", "then"
]);

function keywordTokens(text: string): Set<string> {
  const tokens = new Set<string>();
  for (const raw of wordsIn(text)) {
    const token = normalizeWord(raw);
    if (!token || token.length < 3 || QUESTION_STOP.has(token)) continue;
    tokens.add(token);
  }
  return tokens;
}

/**
 * Fallback path when embeddings are unavailable (the loaded model does not
 * support them, or the request fails): deterministic shared-word overlap.
 * Never blocks the feature on a separate embedding-model setup.
 */
export function rankByKeywordOverlap(
  question: string,
  sources: ManuscriptSource[],
  topK = DEFAULT_TOP_K
): ManuscriptEvidence[] {
  const questionTokens = keywordTokens(question);
  if (questionTokens.size === 0) return [];
  return toEvidence(
    sources.map((source) => {
      const sourceTokens = keywordTokens(source.prose);
      let overlap = 0;
      for (const token of questionTokens) {
        if (sourceTokens.has(token)) overlap += 1;
      }
      return { source, score: overlap };
    }),
    topK,
    questionTokens
  );
}

export const ASK_MANUSCRIPT_SYSTEM =
  "You answer questions about the author's own manuscript, using only the excerpts given below — nothing else. " +
  "Never invent plot details, names, or events that are not in the excerpts. " +
  "If the excerpts do not contain the answer, say so plainly instead of guessing. " +
  "Name which chapter(s) you drew from in your answer. Keep the answer short and direct, in the author's own language.";

export function askManuscriptUserPrompt(question: string, evidence: ManuscriptEvidence[]): string {
  const excerpts = evidence
    .map((item, index) => `[${index + 1}] Chapter "${item.chapterTitle}":\n${item.excerpt}`)
    .join("\n\n");
  return `Question: ${question}\n\nExcerpts from the manuscript:\n\n${excerpts}`;
}
