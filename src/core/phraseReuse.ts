import { isEchoContentWord } from "./echoDetect";
import { splitParagraphs } from "./paragraphFocus";
import { entityNameTokens, normalizeWord, wordsIn } from "./proseStats";

/** Six words is the middle of a 5–7 word run. A run of n words is n − 2 consecutive 3-shingles. */
export const MIN_PHRASE_RUN = 6;
const MIN_CONTENT_WORDS = 2;
const MAX_HITS = 8;

export type PhraseReuseHit = {
  phrase: string;
  run: number;
  paragraphs: number[];
};

type Para = {
  index: number;
  text: string;
  norms: string[];
  raws: string[];
};

/** Same stretch of words in two or more paragraphs. Distance does not matter. */
export function flagPhraseReuse(text: string, names: Iterable<string> = []): PhraseReuseHit[] {
  const trimmed = text.trim();
  if (!trimmed) return [];
  const nameSet = names instanceof Set ? names : entityNameTokens([...names]);
  const paras = splitParagraphs(trimmed)
    .map((block, index) => tokenizePara(block, index))
    .filter((para) => para.norms.length >= MIN_PHRASE_RUN);
  if (paras.length < 2) return [];

  const groups = new Map<string, { run: number; paragraphs: Set<number>; surface: string }>();
  for (let i = 0; i < paras.length; i++) {
    const left = paras[i];
    if (!left) continue;
    for (let j = i + 1; j < paras.length; j++) {
      const right = paras[j];
      if (!right) continue;
      const match = longestSharedRun(left, right);
      if (match.run < MIN_PHRASE_RUN) continue;
      if (contentCount(match.norms, nameSet) < MIN_CONTENT_WORDS) continue;
      const key = match.norms.join(" ");
      const current = groups.get(key);
      if (!current) {
        groups.set(key, { run: match.run, paragraphs: new Set([left.index, right.index]), surface: match.phrase });
        continue;
      }
      current.paragraphs.add(left.index);
      current.paragraphs.add(right.index);
      if (match.run > current.run) {
        current.run = match.run;
        current.surface = match.phrase;
      }
    }
  }

  return [...groups.values()]
    .map((group) => ({
      phrase: group.surface,
      run: group.run,
      paragraphs: [...group.paragraphs].sort((a, b) => a - b)
    }))
    .sort((a, b) => b.run - a.run || a.paragraphs[0]! - b.paragraphs[0]! || a.phrase.localeCompare(b.phrase))
    .slice(0, MAX_HITS);
}

function tokenizePara(text: string, index: number): Para {
  const raws = wordsIn(text);
  return { index, text, raws, norms: raws.map(normalizeWord) };
}

function longestSharedRun(left: Para, right: Para): { run: number; phrase: string; norms: string[] } {
  let best = 0;
  let at = 0;
  const prev = new Array<number>(right.norms.length + 1).fill(0);
  const curr = new Array<number>(right.norms.length + 1).fill(0);
  for (let i = 1; i <= left.norms.length; i++) {
    for (let j = 1; j <= right.norms.length; j++) {
      if (left.norms[i - 1] === right.norms[j - 1]) {
        const n = (prev[j - 1] ?? 0) + 1;
        curr[j] = n;
        if (n > best) {
          best = n;
          at = i - n;
        }
      } else {
        curr[j] = 0;
      }
    }
    for (let j = 0; j <= right.norms.length; j++) {
      prev[j] = curr[j] ?? 0;
      curr[j] = 0;
    }
  }
  const norms = left.norms.slice(at, at + best);
  return { run: best, phrase: left.raws.slice(at, at + best).join(" "), norms };
}

function contentCount(norms: string[], names: Set<string>): number {
  return norms.filter((word) => isEchoContentWord(word, names)).length;
}
