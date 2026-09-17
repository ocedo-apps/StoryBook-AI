import { splitFlowParagraphs } from "./proseFlow";

export type NarrativeLayer = "action" | "backstory" | "sense";

export type MixedParagraph = {
  index: number;
  text: string;
  words: number;
  layers: NarrativeLayer[];
};

const WORD_RE = /[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu;

const MIN_PARAGRAPH_WORDS = 28;

const ACTION_VERBS = new Set([
  "walked",
  "walks",
  "walking",
  "stepped",
  "steps",
  "strode",
  "striding",
  "crossed",
  "crosses",
  "ran",
  "runs",
  "running",
  "turned",
  "turns",
  "opened",
  "opens",
  "closed",
  "shut",
  "grabbed",
  "reached",
  "entered",
  "climbed",
  "pushed",
  "pulled",
  "sat",
  "stood",
  "knelt",
  "lifted",
  "dropped",
  "threw",
  "slammed",
  "kicked",
  "pressed",
  "headed",
  "advanced",
  "leaned",
  "approached",
  "gick",
  "klev",
  "sprang",
  "oppnade",
  "öppnade",
  "stangde",
  "stängde",
  "vandrade",
  "grep",
  "lyfte",
  "klattrade",
  "klättrade"
]);

const BACKSTORY_PHRASES = [
  "for years",
  "for decades",
  "for a decade",
  "ever since",
  "long ago",
  "used to",
  "life's work",
  "whole life",
  "entire life",
  "as a child",
  "as a boy",
  "as a girl",
  "in those days",
  "years of",
  "decades of",
  "had spent",
  "had lived",
  "had worked",
  "had traveled",
  "had travelled",
  "had sailed",
  "had served",
  "had taken him",
  "had taken her",
  "looking back",
  "remembered when",
  "since childhood",
  "all his life",
  "all her life",
  "for ar sedan",
  "for år sedan",
  "i aratal",
  "i åratal",
  "hela sitt liv",
  "livsverk"
];

const TIME_NOUNS = new Set([
  "decades",
  "lifetime",
  "childhood",
  "voyages",
  "career",
  "youth",
  "livsverk",
  "barndom"
]);

/** Concrete sense + embodied impression words. Skip generic felt/saw/heard. */
const SENSE_WORDS = new Set([
  "glow",
  "glare",
  "gleam",
  "shimmer",
  "shadow",
  "shadows",
  "darkness",
  "silence",
  "silent",
  "crunch",
  "crunched",
  "rumble",
  "hiss",
  "echo",
  "whisper",
  "roar",
  "clang",
  "cold",
  "heat",
  "warmth",
  "chill",
  "scent",
  "odor",
  "odour",
  "stench",
  "reek",
  "bitter",
  "metallic",
  "acrid",
  "pungent",
  "damp",
  "frost",
  "soul",
  "horror",
  "horrors",
  "dread",
  "unease",
  "taste",
  "tystnad",
  "kyla",
  "doft",
  "sjal",
  "själ"
]);

const SENSE_PHRASES = ["metallic taste", "recycled air", "left a mark", "left their mark", "left its mark"];

export function splitParagraphs(text: string): string[] {
  return splitFlowParagraphs(text);
}

export function flagMixedParagraphs(text: string): MixedParagraph[] {
  return splitParagraphs(text).flatMap((paragraph, index) => {
    const flag = inspectParagraph(paragraph, index);
    return flag ? [flag] : [];
  });
}

function inspectParagraph(text: string, index: number): MixedParagraph | null {
  const tokens = wordsIn(text);
  if (tokens.length < MIN_PARAGRAPH_WORDS) return null;

  const layers: NarrativeLayer[] = [];
  if (hasAction(tokens)) layers.push("action");
  if (hasLongBackstory(text, tokens)) layers.push("backstory");
  if (senseCount(text, tokens) >= 2) layers.push("sense");
  if (layers.length < 3) return null;

  return { index, text, words: tokens.length, layers };
}

function hasAction(tokens: string[]): boolean {
  return tokens.some((word) => ACTION_VERBS.has(normalizeWord(word)));
}

function hasLongBackstory(text: string, tokens: string[]): boolean {
  const hits = phraseHits(text, BACKSTORY_PHRASES);
  const time = tokens.filter((word) => TIME_NOUNS.has(normalizeWord(word))).length;
  return hits >= 1 || time >= 2;
}

function senseCount(text: string, tokens: string[]): number {
  const found = new Set<string>();
  for (const word of tokens) {
    const token = normalizeWord(word);
    if (SENSE_WORDS.has(token)) found.add(token);
  }
  for (const phrase of SENSE_PHRASES) {
    if (padded(text).includes(` ${phrase} `)) found.add(phrase);
  }
  return found.size;
}

function phraseHits(text: string, phrases: string[]): number {
  const haystack = padded(text);
  let hits = 0;
  for (const phrase of phrases) {
    if (haystack.includes(` ${phrase} `)) hits += 1;
  }
  return hits;
}

function padded(text: string): string {
  return ` ${fold(text).replace(/[^a-z0-9'\u00c0-\u024f]+/gi, " ").replace(/\s+/g, " ").trim()} `;
}

function fold(text: string): string {
  return text.toLowerCase().replace(/['’]/g, "'");
}

function wordsIn(text: string): string[] {
  return text.match(WORD_RE) ?? [];
}

function normalizeWord(word: string): string {
  return word.toLowerCase().replace(/['’]/g, "'").replace(/^'+|'+$/g, "");
}
