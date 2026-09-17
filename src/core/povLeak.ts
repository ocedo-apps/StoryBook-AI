import type { CastMember, CharacterPronoun } from "./characterProfile";
import type { CraftFields } from "./craft";
import { needsViewpoint } from "./craft";
import { normalizeWord, splitSentences, wordsIn } from "./proseStats";

export type { CastMember } from "./characterProfile";

export type PovLeakHit = {
  sentenceIndex: number;
  sentence: string;
  who: string;
  cue: string;
};

const MENTAL_VERBS = [
  "wondering",
  "wondered",
  "wonders",
  "wonder",
  "realizing",
  "realising",
  "realized",
  "realised",
  "realizes",
  "realises",
  "thinking",
  "thought",
  "thinks",
  "think",
  "remembering",
  "remembered",
  "remembers",
  "remember",
  "deciding",
  "decided",
  "decides",
  "decide",
  "believing",
  "believed",
  "believes",
  "believe",
  "hoping",
  "hoped",
  "hopes",
  "hope",
  "fearing",
  "feared",
  "fears",
  "fear",
  "imagining",
  "imagined",
  "imagines",
  "imagine",
  "wishing",
  "wished",
  "wishes",
  "wish",
  "suspecting",
  "suspected",
  "suspects",
  "suspect",
  "pondering",
  "pondered",
  "ponders",
  "ponder",
  "musing",
  "mused",
  "muses",
  "muse",
  "undrade",
  "undrar",
  "insåg",
  "insag",
  "inser",
  "tänkte",
  "tankte",
  "tänker",
  "tanker",
  "trodde",
  "tror",
  "hoppades",
  "hoppas",
  "fruktade",
  "fruktar",
  "önskade",
  "onskade",
  "önskar",
  "onskar",
  "misstänkte",
  "misstankte",
  "misstänker",
  "misstanker",
  "grubblade",
  "grubblar"
];

const VERB_PATTERN = MENTAL_VERBS.map(escapeRegExp).join("|");
const PRONOUN_PATTERN = "he|she|hon|han";
const STARTER_STOP = new Set([
  "after",
  "and",
  "as",
  "before",
  "but",
  "later",
  "now",
  "once",
  "so",
  "still",
  "suddenly",
  "that",
  "the",
  "then",
  "there",
  "this",
  "today",
  "tomorrow",
  "when",
  "while"
]);

const MAX_HITS = 12;

const PRONOUN_TO_SLOT: Record<string, CharacterPronoun> = {
  he: "he",
  she: "she",
  han: "he",
  hon: "she"
};

export function flagPovLeaks(text: string, craft: CraftFields | null | undefined, cast: CastMember[] = []): PovLeakHit[] {
  if (!craft || craft.pov === "omniscient") return [];
  const viewpoint = craft.viewpoint.trim();
  if (needsViewpoint(craft.pov) && !viewpoint) return [];

  const trimmed = text.trim();
  if (!trimmed) return [];

  const sentences = splitSentences(trimmed).filter((sentence) => wordsIn(sentence).length > 0);
  const names = leakNames(cast, viewpoint);
  if (names.length === 0 && craft.pov !== "objective" && craft.pov !== "second") return [];

  const mentioned = mentionedCast(cast, trimmed);
  const uniquePronouns = uniquePronounSlots(mentioned);
  const viewpointSlot = pronounFor(cast, viewpoint);
  const allowOtherMinds = craft.pov !== "objective";

  const hits: PovLeakHit[] = [];
  sentences.forEach((sentence, sentenceIndex) => {
    if (hits.length >= MAX_HITS) return;
    const body = stripDialogue(sentence);
    if (!body.trim()) return;

    const named = findNamedCues(body, names);
    for (const cue of named) {
      if (allowOtherMinds && samePerson(cue.who, viewpoint)) continue;
      hits.push({ sentenceIndex, sentence, who: cue.who, cue: cue.verb });
      return;
    }

    const bare = findBareNameCue(body, viewpoint);
    if (bare && !(allowOtherMinds && samePerson(bare.who, viewpoint))) {
      hits.push({ sentenceIndex, sentence, who: bare.who, cue: bare.verb });
      return;
    }

    if (craft.pov === "objective") {
      const self = body.match(new RegExp(`\\b(i|jag|you|du)\\b(?:\\s+\\w{1,12}){0,2}\\s+(${VERB_PATTERN})\\b`, "i"));
      if (self?.[1] && self[2]) {
        hits.push({ sentenceIndex, sentence, who: self[1], cue: self[2].toLowerCase() });
        return;
      }
    }

    const pronoun = findPronounCue(body);
    if (!pronoun) return;
    const slot = PRONOUN_TO_SLOT[pronoun.who.toLowerCase()];
    if (!slot || !uniquePronouns.has(slot)) return;
    if (allowOtherMinds && viewpointSlot === slot) return;
    hits.push({ sentenceIndex, sentence, who: pronoun.who, cue: pronoun.verb });
  });

  return hits;
}

export function povLeakBlurb(craft: CraftFields): string {
  if (craft.pov === "objective") {
    return "These lines look like thought. Objective only shows what a camera would see. A candidate, not a verdict.";
  }
  const who = craft.viewpoint.trim();
  if (craft.pov === "first") {
    return who
      ? `These lines look like a mind other than ${who}. A candidate, not a verdict.`
      : "These lines look like another mind. A candidate, not a verdict.";
  }
  return who
    ? `Limited to ${who} — these lines look like another mind. A candidate, not a verdict.`
    : "These lines look like another mind. A candidate, not a verdict.";
}

function leakNames(cast: CastMember[], viewpoint: string): string[] {
  const labels = [...cast.map((member) => member.label.trim()), viewpoint.trim()].filter(Boolean);
  const seen = new Set<string>();
  const names: string[] = [];
  for (const label of labels) {
    const key = label.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    names.push(label);
  }
  return names.sort((a, b) => b.length - a.length);
}

function mentionedCast(cast: CastMember[], text: string): CastMember[] {
  const tokens = new Set(wordsIn(text).map((word) => normalizeWord(word).replace(/'s$/, "")));
  return cast.filter((member) => {
    const parts = member.label.split(/\s+/).map((part) => normalizeWord(part)).filter((part) => part.length >= 2);
    return parts.some((part) => tokens.has(part));
  });
}

function uniquePronounSlots(cast: CastMember[]): Set<CharacterPronoun> {
  const counts: Record<CharacterPronoun, number> = { she: 0, he: 0, it: 0 };
  for (const member of cast) {
    if (!member.pronoun) continue;
    counts[member.pronoun] += 1;
  }
  const unique = new Set<CharacterPronoun>();
  for (const slot of ["she", "he", "it"] as const) {
    if (counts[slot] === 1) unique.add(slot);
  }
  return unique;
}

function pronounFor(cast: CastMember[], viewpoint: string): CharacterPronoun | undefined {
  const match = cast.find((member) => samePerson(member.label, viewpoint));
  return match?.pronoun;
}

function samePerson(label: string, viewpoint: string): boolean {
  const a = normalizeWord(label);
  const b = normalizeWord(viewpoint);
  if (!a || !b) return false;
  if (a === b) return true;
  const aHead = a.split(/\s+/)[0] ?? "";
  const bHead = b.split(/\s+/)[0] ?? "";
  return aHead.length >= 2 && aHead === bHead;
}

function findNamedCues(sentence: string, names: string[]): { who: string; verb: string }[] {
  const found: { who: string; verb: string }[] = [];
  for (const name of names) {
    const pattern = new RegExp(
      `\\b${escapeRegExp(name)}\\b(?:\\s+\\w{1,12}){0,2}\\s+(${VERB_PATTERN})\\b`,
      "i"
    );
    const match = sentence.match(pattern);
    if (match?.[1]) found.push({ who: name, verb: match[1].toLowerCase() });
  }
  return found;
}

function findBareNameCue(sentence: string, viewpoint: string): { who: string; verb: string } | null {
  const pattern = new RegExp(`\\b([\\p{Lu}][\\p{L}'’]+)\\b(?:\\s+\\w{1,12}){0,2}\\s+(${VERB_PATTERN})\\b`, "u");
  const match = sentence.match(pattern);
  if (!match?.[1] || !match[2]) return null;
  const who = match[1];
  if (PRONOUN_TO_SLOT[who.toLowerCase()]) return null;
  if (STARTER_STOP.has(who.toLowerCase())) return null;
  if (samePerson(who, viewpoint)) return null;
  return { who, verb: match[2].toLowerCase() };
}

function findPronounCue(sentence: string): { who: string; verb: string } | null {
  const pattern = new RegExp(`\\b(${PRONOUN_PATTERN})\\b(?:\\s+\\w{1,12}){0,2}\\s+(${VERB_PATTERN})\\b`, "i");
  const match = sentence.match(pattern);
  if (!match?.[1] || !match[2]) return null;
  return { who: match[1], verb: match[2].toLowerCase() };
}

function stripDialogue(sentence: string): string {
  return sentence.replace(/"[^"]*"/g, " ").replace(/“[^”]*”/g, " ");
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
