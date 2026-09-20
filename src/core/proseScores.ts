import type { PacingProfile, ProseStats, SentenceMix } from "./proseStats";
import { DEFAULT_LONG_SENTENCE } from "./proseStats";

export type GaugeId = "directness" | "pacing" | "vocabulary";

export type GaugeDetail = {
  id: GaugeId;
  label: string;
  measures: string;
  raise: string[];
  remember: string;
};

export const GAUGE_DETAILS: Record<GaugeId, GaugeDetail> = {
  directness: {
    id: "directness",
    label: "Directness",
    measures: "How directly you write, from the share of manner-adverbs and possible passives.",
    raise: [
      "Swap a weak verb plus adverb for a stronger verb (ran quickly → rushed).",
      "Recast a possible passive as an active (the door was opened by her → she opened the door)."
    ],
    remember:
      "100 is not always the aim. In dreamlike or atmospheric passages, passives and manner-adverbs can be the right choice. Let the scene lead."
  },
  pacing: {
    id: "pacing",
    label: "Pacing",
    measures:
      "How much sentence length varies, and whether long lines stack. A mix of short and long usually keeps momentum.",
    raise: [
      "Break a run of {n}+ word sentences. Click a tall bar to inspect one.",
      "Follow a long line with a short hit, or the other way around.",
      "If every sentence is the same length, vary one."
    ],
    remember:
      "Even, punchy prose can be the point — a fight, a chase, dialogue. A sweeping passage can be too. This flags a monotone or a stack of long lines, not a genre."
  },
  vocabulary: {
    id: "vocabulary",
    label: "Vocabulary",
    measures:
      "The balance of familiar words and uncommon ones. Names in the Story Bible are left out.",
    raise: [
      "If the prose is all common words, one precise noun or verb often does more than a string of adjectives.",
      "If uncommon words pile up, swap a few for plainer ones — unless that diction is the voice.",
      "Highlight in text marks words off the Dale–Chall familiar list."
    ],
    remember:
      "Unusual can be the point. A harbour story needs quay and stowaway. 100 is a mix, not a simpler vocabulary."
  }
};

export function scoreDirectness(stats: ProseStats, weight = 1): number | null {
  if (stats.words < 12) return null;
  const passivesPerThousand = (stats.passiveCount / stats.words) * 1000;
  return clampScore(100 - weight * (stats.adverbPerThousand + passivesPerThousand));
}

export function scorePacing(
  stats: ProseStats,
  longSentence = DEFAULT_LONG_SENTENCE,
  longRun = 5
): number | null {
  if (stats.sentences < 3) return null;
  const mean = stats.meanSentence;
  const cv = mean > 0 ? stats.sentenceStdev / mean : 0;
  const variation = 40 + 60 * clamp01(cv / 0.42);
  const run = longestLongSentenceRun(stats.sentenceLengths, longSentence);
  const runPenalty = run >= longRun ? Math.min(40, (run - (longRun - 1)) * 10) : 0;
  const span = stats.sentenceMax - stats.sentenceMin;
  const equalPenalty = span <= 2 ? 20 : 0;
  const longShare = stats.sentenceLengths.filter((n) => n >= longSentence).length / stats.sentences;
  const sharePenalty = longSentence < DEFAULT_LONG_SENTENCE ? Math.round(longShare * 40) : 0;
  const meanPenalty =
    longSentence < DEFAULT_LONG_SENTENCE && mean > longSentence
      ? Math.min(25, Math.round((mean - longSentence) * 2))
      : 0;
  return clampScore(variation - runPenalty - equalPenalty - sharePenalty - meanPenalty);
}

export function scoreVocabulary(
  stats: ProseStats,
  rareCount: number,
  rarePeak = 0.03,
  plainScore = 55
): number | null {
  if (stats.words < 40) return null;
  const rareShare = rareCount / stats.words;
  const rareScore = tent(
    rareShare,
    0,
    rarePeak,
    rarePeak * 3.3,
    Math.max(rarePeak * 9, 0.12),
    plainScore,
    100,
    50
  );
  const ttr = stats.typeTokenRatio;
  const ttrScore = tent(ttr, 0.28, 0.42, 0.72, 0.92, 50, 100, 70);
  return clampScore(0.55 * rareScore + 0.45 * ttrScore);
}

export function longestLongSentenceRun(lengths: number[], long = DEFAULT_LONG_SENTENCE): number {
  let best = 0;
  let run = 0;
  for (const length of lengths) {
    if (length >= long) {
      run += 1;
      if (run > best) best = run;
    } else {
      run = 0;
    }
  }
  return best;
}

export function mixLabel(mix: SentenceMix): string {
  if (mix === "mixed") return "Mixed";
  if (mix === "choppy") return "Short & even";
  if (mix === "sweeping") return "Long & even";
  return "Steady";
}

export function profileLine(profile: PacingProfile): string {
  if (!profile.genres) return profile.label;
  return `${profile.label} · ${profile.genres}`;
}

function tent(
  value: number,
  left: number,
  peakStart: number,
  peakEnd: number,
  right: number,
  leftScore: number,
  peakScore: number,
  rightScore: number
): number {
  if (value <= left) return leftScore;
  if (value < peakStart) return lerp(leftScore, peakScore, (value - left) / (peakStart - left));
  if (value <= peakEnd) return peakScore;
  if (value < right) return lerp(peakScore, rightScore, (value - peakEnd) / (right - peakEnd));
  return rightScore;
}

function lerp(from: number, to: number, t: number): number {
  return from + (to - from) * clamp01(t);
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function clampScore(value: number): number {
  return Math.min(100, Math.max(0, Math.round(value)));
}
