/**
 * Phrases and patterns that read as AI-generated rather than
 * human-drafted prose — a highlight, not a rewrite, same mechanism as
 * rare-word highlighting (rareWords.ts). Extend this list as new tells
 * turn up; it is meant to be edited, not exhaustive.
 */
export const AI_TIC_PHRASES = [
  "a testament to",
  "tapestry of",
  "weaving together",
  "delve into",
  "delved into",
  "boundless",
  "unwavering",
  "ever-evolving",
  "in the realm of",
  "navigate the complexities",
  "a stark reminder",
  "sent shivers down",
  "eyes sparkled",
  "eyes twinkled",
  "little did",
  "it's important to note",
  "it is important to note",
  "in conclusion",
  "myriad of",
  "a symphony of",
  "the air was thick with",
  "heart pounded in her chest",
  "heart pounded in his chest"
] as const;

const PHRASE_PATTERNS = AI_TIC_PHRASES.map(
  (phrase) => new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi")
);

/** Occasional use is normal prose; only flag it once a chapter leans on it. */
const EM_DASH_DENSITY_THRESHOLD = 1 / 150;

export type TicHit = { start: number; end: number; text: string };

/** Every clichéd phrase, plus every em dash once they appear well beyond occasional use. */
export function findAiTicHits(text: string): TicHit[] {
  const hits: TicHit[] = [];
  for (const pattern of PHRASE_PATTERNS) {
    pattern.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(text))) {
      hits.push({ start: match.index, end: match.index + match[0].length, text: match[0] });
      if (match[0].length === 0) pattern.lastIndex += 1;
    }
  }

  const words = text.split(/\s+/).filter(Boolean).length;
  if (words > 0) {
    const dashIndices: number[] = [];
    for (let i = 0; i < text.length; i++) {
      if (text[i] === "—") dashIndices.push(i);
    }
    if (dashIndices.length / words > EM_DASH_DENSITY_THRESHOLD) {
      for (const index of dashIndices) hits.push({ start: index, end: index + 1, text: "—" });
    }
  }

  hits.sort((a, b) => a.start - b.start);
  const merged: TicHit[] = [];
  for (const hit of hits) {
    const last = merged[merged.length - 1];
    if (last && hit.start < last.end) continue;
    merged.push(hit);
  }
  return merged;
}
