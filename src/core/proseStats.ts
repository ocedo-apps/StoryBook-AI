/** Fiction-facing stats. Not a school grade — a pacing profile for the passage. */

import { flagMixedParagraphs, type MixedParagraph } from "./paragraphFocus";

const WORD_RE = /[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu;

const ABBREVIATIONS = new Set(["mr", "mrs", "ms", "dr", "prof", "sr", "jr", "vs", "etc", "st", "no", "vol"]);

const NAME_STOP = new Set(["the", "of", "a", "an", "and", "or", "'s", "’s"]);

/** Common -ly words that are not manner adverbs. */
const LY_FALSE = new Set([
  "ally",
  "anomaly",
  "apply",
  "assembly",
  "belly",
  "bully",
  "comply",
  "early",
  "family",
  "fly",
  "gully",
  "holly",
  "holy",
  "imply",
  "italy",
  "jelly",
  "july",
  "lily",
  "lonely",
  "lovely",
  "melancholy",
  "monopoly",
  "multiply",
  "only",
  "rally",
  "reply",
  "silly",
  "supply",
  "tally",
  "ugly"
]);

const PARTICIPLES = new Set([
  "been",
  "born",
  "beaten",
  "begun",
  "bitten",
  "blown",
  "broken",
  "brought",
  "built",
  "caught",
  "chosen",
  "come",
  "done",
  "drawn",
  "driven",
  "drunk",
  "eaten",
  "fallen",
  "felt",
  "flown",
  "forgotten",
  "found",
  "given",
  "gone",
  "grown",
  "held",
  "hidden",
  "kept",
  "known",
  "left",
  "lost",
  "made",
  "ridden",
  "rung",
  "run",
  "seen",
  "shown",
  "sung",
  "sunk",
  "spoken",
  "stolen",
  "swum",
  "taken",
  "taught",
  "thought",
  "thrown",
  "told",
  "torn",
  "worn",
  "written",
  "woken"
]);

const BE = new Set(["am", "is", "are", "was", "were", "be", "been", "being"]);

const SHORT_SENTENCE = 8;
const LONG_SENTENCE = 30;

export type PacingProfileId = "empty" | "short" | "breezy" | "brisk" | "balanced" | "atmospheric" | "heavy";

export type PacingProfile = {
  id: PacingProfileId;
  label: string;
  genres: string;
};

export type SentenceMix = "mixed" | "choppy" | "sweeping" | "even";

export type ProseStats = {
  words: number;
  sentences: number;
  meanSentence: number;
  sentenceStdev: number;
  sentenceMin: number;
  sentenceMax: number;
  shortShare: number;
  longCount: number;
  sentenceLengths: number[];
  sentenceTexts: string[];
  longSentences: string[];
  dialogueShare: number;
  adverbCount: number;
  adverbPerThousand: number;
  passiveCount: number;
  longWordShare: number;
  typeTokenRatio: number;
  fleschEase: number | null;
  profile: PacingProfile;
  mix: SentenceMix;
  mixedParagraphs: MixedParagraph[];
};

export function countWords(text: string): number {
  return wordsIn(text).length;
}

export function entityNameTokens(labels: string[]): Set<string> {
  const tokens = new Set<string>();
  for (const label of labels) {
    for (const raw of label.split(/[\s/\-,]+/)) {
      const token = normalizeWord(raw);
      if (!token || NAME_STOP.has(token) || token.length < 2) continue;
      tokens.add(token);
    }
  }
  return tokens;
}

export function analyzeProse(text: string, names: Iterable<string> = []): ProseStats {
  const nameSet = names instanceof Set ? names : entityNameTokens([...names]);
  const trimmed = text.trim();
  if (!trimmed) return emptyStats();

  const sentences = splitSentences(trimmed).filter((sentence) => wordsIn(sentence).length > 0);
  const sentenceLengths = sentences.map((sentence) => wordsIn(sentence).length);
  const words = wordsIn(trimmed);
  const wordCount = words.length;
  const sentenceCount = sentenceLengths.length;
  const meanSentence = sentenceCount ? average(sentenceLengths) : 0;
  const sentenceStdev = sentenceCount ? stdev(sentenceLengths, meanSentence) : 0;
  const dialogueWords = countDialogueWords(trimmed);
  const adverbCount = words.filter((word) => isMannerAdverb(word)).length;
  const passiveCount = countPassives(words);
  const content = words.filter((word) => !nameSet.has(normalizeWord(word)));
  const longContent = content.filter((word) => countSyllables(word) >= 3).length;
  const unique = new Set(content.map((word) => normalizeWord(word)).filter(Boolean));
  const syllables = words.reduce((sum, word) => sum + countSyllables(word), 0);
  const fleschEase =
    wordCount >= 12 && sentenceCount >= 2 ? fleschReadingEase(wordCount, sentenceCount, syllables) : null;

  return {
    words: wordCount,
    sentences: sentenceCount,
    meanSentence,
    sentenceStdev,
    sentenceMin: sentenceCount ? Math.min(...sentenceLengths) : 0,
    sentenceMax: sentenceCount ? Math.max(...sentenceLengths) : 0,
    shortShare: sentenceCount ? sentenceLengths.filter((n) => n <= SHORT_SENTENCE).length / sentenceCount : 0,
    longCount: sentenceLengths.filter((n) => n >= LONG_SENTENCE).length,
    sentenceLengths,
    sentenceTexts: sentences,
    longSentences: sentences.filter((_, i) => (sentenceLengths[i] ?? 0) >= LONG_SENTENCE).slice(0, 6),
    dialogueShare: wordCount ? dialogueWords / wordCount : 0,
    adverbCount,
    adverbPerThousand: wordCount ? (adverbCount / wordCount) * 1000 : 0,
    passiveCount,
    longWordShare: content.length ? longContent / content.length : 0,
    typeTokenRatio: content.length ? unique.size / content.length : 0,
    fleschEase,
    profile: pacingProfile(fleschEase, wordCount),
    mix: sentenceMix(meanSentence, sentenceStdev, sentenceCount),
    mixedParagraphs: flagMixedParagraphs(trimmed)
  };
}

export function fleschReadingEase(words: number, sentences: number, syllables: number): number {
  if (words <= 0 || sentences <= 0) return 0;
  return 206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words);
}

function emptyStats(): ProseStats {
  return {
    words: 0,
    sentences: 0,
    meanSentence: 0,
    sentenceStdev: 0,
    sentenceMin: 0,
    sentenceMax: 0,
    shortShare: 0,
    longCount: 0,
    sentenceLengths: [],
    sentenceTexts: [],
    longSentences: [],
    dialogueShare: 0,
    adverbCount: 0,
    adverbPerThousand: 0,
    passiveCount: 0,
    longWordShare: 0,
    typeTokenRatio: 0,
    fleschEase: null,
    profile: { id: "empty", label: "No prose yet", genres: "" },
    mix: "even",
    mixedParagraphs: []
  };
}

function pacingProfile(ease: number | null, words: number): PacingProfile {
  if (words === 0) return { id: "empty", label: "No prose yet", genres: "" };
  if (ease === null) return { id: "short", label: "Too short to score", genres: "Write a little more" };
  if (ease >= 80) return { id: "breezy", label: "Fast & breezy", genres: "Thriller / YA" };
  if (ease >= 65) return { id: "brisk", label: "Brisk", genres: "Adventure / romance" };
  if (ease >= 50) return { id: "balanced", label: "Balanced", genres: "General fiction" };
  if (ease >= 30) return { id: "atmospheric", label: "Dense & atmospheric", genres: "Literary / epic fantasy" };
  return { id: "heavy", label: "Heavy", genres: "Literary / experimental" };
}

function sentenceMix(mean: number, stdev: number, count: number): SentenceMix {
  if (count < 3) return "even";
  const spread = mean > 0 ? stdev / mean : 0;
  if (mean <= 10 && stdev < 4.5) return "choppy";
  if (mean >= 22 && stdev < 6) return "sweeping";
  if (spread >= 0.45 || stdev >= 8) return "mixed";
  return "even";
}

export function splitSentences(text: string): string[] {
  const source = text.replace(/\s+/g, " ").trim();
  if (!source) return [];
  const out: string[] = [];
  let start = 0;
  let inQuote = false;

  for (let i = 0; i < source.length; i++) {
    const ch = source[i];
    if (ch === "“") {
      inQuote = true;
      continue;
    }
    if (ch === "”") {
      inQuote = false;
      continue;
    }
    if (ch === '"') {
      inQuote = !inQuote;
      continue;
    }
    if (ch !== "." && ch !== "!" && ch !== "?") continue;
    if (ch === "." && (source[i + 1] === "." || source[i + 1] === "…")) continue;
    if (ch === "." && isAbbreviation(source, i)) continue;

    let j = i + 1;
    while (j < source.length && /["”'’]/.test(source[j] ?? "")) j += 1;
    while (j < source.length && source[j] === " ") j += 1;
    const next = source[j];
    if (next && /[a-z]/.test(next)) continue;
    if (inQuote && next) continue;

    const piece = source.slice(start, j).trim();
    if (piece) out.push(piece);
    start = j;
    i = j - 1;
  }

  const tail = source.slice(start).trim();
  if (tail) out.push(tail);
  return out;
}

function isAbbreviation(source: string, dot: number): boolean {
  let i = dot - 1;
  while (i >= 0 && /[A-Za-z]/.test(source[i] ?? "")) i -= 1;
  const word = source.slice(i + 1, dot).toLowerCase();
  return word.length === 1 || ABBREVIATIONS.has(word);
}

export function wordsIn(text: string): string[] {
  return text.match(WORD_RE) ?? [];
}

function countDialogueWords(text: string): number {
  let total = 0;
  const patterns = [/"([^"]*)"/g, /“([^”]*)”/g];
  for (const pattern of patterns) {
    for (const match of text.matchAll(pattern)) {
      total += wordsIn(match[1] ?? "").length;
    }
  }
  return total;
}

function isMannerAdverb(word: string): boolean {
  const token = normalizeWord(word);
  if (token.length < 5 || !token.endsWith("ly") || LY_FALSE.has(token)) return false;
  return true;
}

function countPassives(words: string[]): number {
  let count = 0;
  for (let i = 0; i < words.length - 1; i++) {
    const be = normalizeWord(words[i] ?? "");
    if (!BE.has(be)) continue;
    const next = normalizeWord(words[i + 1] ?? "");
    if (PARTICIPLES.has(next) || /ed$/.test(next)) count += 1;
  }
  return count;
}

export function countSyllables(word: string): number {
  const w = normalizeWord(word).replace(/[^a-z]/g, "");
  if (!w) return 0;
  if (w.length <= 3) return 1;
  const groups = w
    .replace(/e$/, "")
    .replace(/[^aeiouy]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  return Math.max(1, groups.length);
}

export function normalizeWord(word: string): string {
  return word.toLowerCase().replace(/['’]/g, "'").replace(/^'+|'+$/g, "");
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, n) => sum + n, 0) / values.length;
}

function stdev(values: number[], mean: number): number {
  if (values.length < 2) return 0;
  const variance = values.reduce((sum, n) => sum + (n - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}
