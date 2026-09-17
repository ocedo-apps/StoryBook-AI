import { entityNameTokens, normalizeWord, splitSentences, wordsIn } from "./proseStats";

const WINDOW_WORDS = 100;
const UNIGRAM_MIN = 3;
const BIGRAM_MIN = 2;
const MAX_HITS = 8;

const STOP = new Set([
  "a",
  "about",
  "after",
  "also",
  "am",
  "an",
  "and",
  "are",
  "as",
  "at",
  "att",
  "av",
  "be",
  "been",
  "before",
  "but",
  "by",
  "can",
  "could",
  "de",
  "den",
  "det",
  "did",
  "do",
  "does",
  "down",
  "du",
  "en",
  "ett",
  "even",
  "for",
  "from",
  "från",
  "för",
  "had",
  "han",
  "has",
  "have",
  "he",
  "her",
  "here",
  "him",
  "his",
  "hon",
  "i",
  "if",
  "in",
  "into",
  "is",
  "it",
  "its",
  "jag",
  "just",
  "med",
  "me",
  "might",
  "must",
  "my",
  "no",
  "not",
  "och",
  "of",
  "om",
  "on",
  "only",
  "or",
  "our",
  "out",
  "over",
  "på",
  "shall",
  "she",
  "should",
  "so",
  "som",
  "than",
  "that",
  "the",
  "their",
  "them",
  "then",
  "there",
  "these",
  "they",
  "this",
  "those",
  "till",
  "to",
  "too",
  "under",
  "up",
  "us",
  "very",
  "vi",
  "was",
  "we",
  "were",
  "when",
  "where",
  "while",
  "will",
  "with",
  "would",
  "you",
  "your"
]);

const DIALOGUE_TAGS = new Set([
  "answered",
  "ask",
  "asked",
  "asking",
  "asks",
  "muttered",
  "replied",
  "replies",
  "reply",
  "said",
  "say",
  "saying",
  "says",
  "svarade",
  "sa",
  "sade",
  "tells",
  "told",
  "whispered"
]);

export type EchoHit = {
  phrase: string;
  count: number;
  sentenceIndexes: number[];
};

type Token = {
  raw: string;
  norm: string;
  stem: string;
  wordIndex: number;
  sentenceIndex: number;
};

type Occurrence = {
  wordIndex: number;
  sentenceIndex: number;
  surface: string;
};

export function flagEchoes(text: string, names: Iterable<string> = []): EchoHit[] {
  const trimmed = text.trim();
  if (!trimmed) return [];
  const nameSet = names instanceof Set ? names : entityNameTokens([...names]);
  const tokens = tokenize(trimmed);
  if (tokens.length === 0) return [];

  const unigrams = new Map<string, Occurrence[]>();
  const bigrams = new Map<string, Occurrence[]>();

  for (const token of tokens) {
    if (!isUnigram(token, nameSet)) continue;
    const list = unigrams.get(token.stem) ?? [];
    list.push({ wordIndex: token.wordIndex, sentenceIndex: token.sentenceIndex, surface: token.norm });
    unigrams.set(token.stem, list);
  }

  for (let i = 0; i < tokens.length - 1; i++) {
    const a = tokens[i];
    const b = tokens[i + 1];
    if (!a || !b) continue;
    if (!isBigram(a, b, nameSet)) continue;
    const key = `${a.norm} ${b.norm}`;
    const list = bigrams.get(key) ?? [];
    list.push({
      wordIndex: a.wordIndex,
      sentenceIndex: a.sentenceIndex,
      surface: key
    });
    bigrams.set(key, list);
  }

  const hits: EchoHit[] = [];
  for (const [phrase, positions] of bigrams) {
    const hit = clusterHit(phrase, positions, BIGRAM_MIN);
    if (hit) hits.push(hit);
  }
  const coveredStems = new Set(
    hits.flatMap((hit) => hit.phrase.split(" ").map((part) => lightStem(part)).filter(Boolean))
  );
  for (const [stem, positions] of unigrams) {
    if (coveredStems.has(stem)) continue;
    const hit = clusterHit("", positions, UNIGRAM_MIN);
    if (!hit) continue;
    hits.push({ ...hit, phrase: commonSurface(positions) });
  }

  return hits
    .sort((a, b) => b.count - a.count || a.sentenceIndexes[0]! - b.sentenceIndexes[0]! || a.phrase.localeCompare(b.phrase))
    .slice(0, MAX_HITS);
}

function tokenize(text: string): Token[] {
  const sentences = splitSentences(text).filter((sentence) => wordsIn(sentence).length > 0);
  const tokens: Token[] = [];
  let wordIndex = 0;
  sentences.forEach((sentence, sentenceIndex) => {
    for (const raw of wordsIn(sentence)) {
      const norm = normalizeWord(raw);
      tokens.push({
        raw,
        norm,
        stem: lightStem(stemPossessive(norm)),
        wordIndex,
        sentenceIndex
      });
      wordIndex += 1;
    }
  });
  return tokens;
}

function isUnigram(token: Token, names: Set<string>): boolean {
  if (!token.norm || token.stem.length < 4) return false;
  if (isName(token, names) || STOP.has(token.norm) || DIALOGUE_TAGS.has(token.norm) || DIALOGUE_TAGS.has(token.stem)) {
    return false;
  }
  return true;
}

function isBigram(a: Token, b: Token, names: Set<string>): boolean {
  if (!a.norm || !b.norm) return false;
  if (isName(a, names) || isName(b, names)) return false;
  if (DIALOGUE_TAGS.has(a.norm) || DIALOGUE_TAGS.has(b.norm)) return false;
  if (STOP.has(a.norm) && STOP.has(b.norm)) return false;
  return true;
}

function isName(token: Token, names: Set<string>): boolean {
  const stem = stemPossessive(token.norm);
  return names.has(token.norm) || names.has(stem);
}

function clusterHit(phrase: string, positions: Occurrence[], minCount: number): EchoHit | null {
  const cluster = firstCluster(positions, minCount);
  if (!cluster) return null;
  const start = cluster[0]?.wordIndex;
  if (start === undefined) return null;
  const inWindow = positions.filter((item) => item.wordIndex >= start && item.wordIndex < start + WINDOW_WORDS);
  if (inWindow.length < minCount) return null;
  const sentenceIndexes = [...new Set(inWindow.map((item) => item.sentenceIndex))];
  return {
    phrase: phrase || commonSurface(inWindow),
    count: inWindow.length,
    sentenceIndexes
  };
}

function firstCluster(positions: Occurrence[], minCount: number): Occurrence[] | null {
  for (let i = 0; i + minCount - 1 < positions.length; i++) {
    const start = positions[i]?.wordIndex;
    const end = positions[i + minCount - 1]?.wordIndex;
    if (start === undefined || end === undefined) continue;
    if (end - start < WINDOW_WORDS) return positions.slice(i, i + minCount);
  }
  return null;
}

function commonSurface(positions: Occurrence[]): string {
  const counts = new Map<string, number>();
  for (const item of positions) {
    counts.set(item.surface, (counts.get(item.surface) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0]?.[0] ?? "";
}

function stemPossessive(token: string): string {
  if (token.endsWith("'s") && token.length > 3) return token.slice(0, -2);
  return token;
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
