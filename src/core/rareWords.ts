import { daleChall } from "dale-chall";
import { countSyllables, entityNameTokens, normalizeWord } from "./proseStats";

const WORD_RE = /[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu;
const FAMILIAR = new Set(daleChall.map((word) => word.toLowerCase()));

export type RareHit = {
  start: number;
  end: number;
  word: string;
};

export type RareEntry = {
  word: string;
  count: number;
};

export type RareOptions = {
  /** Also treat familiar words with this many syllables as rare. */
  extraSyllables?: number;
};

export function isFamiliarWord(token: string): boolean {
  const word = normalizeWord(token);
  if (!word || word.length <= 1 || /[0-9]/.test(word)) return true;
  if (FAMILIAR.has(word)) return true;
  return inflections(word).some((form) => FAMILIAR.has(form));
}

export function findRareHits(text: string, names: Iterable<string> = [], options?: RareOptions): RareHit[] {
  const nameSet = names instanceof Set ? names : entityNameTokens([...names]);
  const extra = options?.extraSyllables;
  const hits: RareHit[] = [];
  for (const match of text.matchAll(WORD_RE)) {
    const word = match[0];
    const start = match.index ?? 0;
    const token = normalizeWord(word);
    const stem = possessiveStem(token);
    if (!token) continue;
    if (nameSet.has(token) || nameSet.has(stem)) continue;
    if (isProperName(word, start, text)) continue;
    if (!isRareForReader(word, extra)) continue;
    hits.push({ start, end: start + word.length, word });
  }
  return hits;
}

function isRareForReader(word: string, extraSyllables: number | undefined): boolean {
  if (!isFamiliarWord(word)) return true;
  if (extraSyllables === undefined) return false;
  return countSyllables(word) >= extraSyllables;
}

/** Jeff's, Odyssey's, and other mid-sentence capitals are names, not rare diction. */
function isProperName(original: string, start: number, text: string): boolean {
  if (!/^\p{Lu}/u.test(original)) return false;
  if (/['’]s$/u.test(original)) return true;
  return !isSentenceStart(text, start);
}

function isSentenceStart(text: string, index: number): boolean {
  let i = index - 1;
  while (i >= 0 && /[\s"'“”‘’]/.test(text[i] ?? "")) i -= 1;
  if (i < 0) return true;
  return /[.!?…]/.test(text[i] ?? "");
}

function possessiveStem(token: string): string {
  if (token.endsWith("'s") && token.length > 3) return token.slice(0, -2);
  return token;
}

export function rareHitAt(text: string, offset: number, names: Iterable<string> = [], options?: RareOptions): RareHit | null {
  const clamped = Math.max(0, Math.min(offset, text.length));
  return findRareHits(text, names, options).find((hit) => clamped >= hit.start && clamped <= hit.end) ?? null;
}

export function tallyRareWords(text: string, names: Iterable<string> = [], options?: RareOptions): {
  count: number;
  unique: RareEntry[];
} {
  const hits = findRareHits(text, names, options);
  const counts = new Map<string, number>();
  for (const hit of hits) {
    const key = normalizeWord(hit.word);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  const unique = [...counts.entries()]
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count || a.word.localeCompare(b.word));
  return { count: hits.length, unique };
}

function inflections(word: string): string[] {
  const forms: string[] = [];
  if (word.endsWith("'s") && word.length > 3) forms.push(word.slice(0, -2));
  if (word.endsWith("ies") && word.length > 4) forms.push(`${word.slice(0, -3)}y`);
  if (word.endsWith("es") && word.length > 3) {
    forms.push(word.slice(0, -2), word.slice(0, -1));
  } else if (word.endsWith("s") && !word.endsWith("ss") && word.length > 3) {
    forms.push(word.slice(0, -1));
  }
  if (word.endsWith("ing") && word.length > 5) {
    const stem = word.slice(0, -3);
    forms.push(stem, `${stem}e`);
  }
  if (word.endsWith("ed") && word.length > 4) {
    forms.push(word.slice(0, -1), word.slice(0, -2));
  }
  if (word.endsWith("ly") && word.length > 4) forms.push(word.slice(0, -2));
  return forms;
}
