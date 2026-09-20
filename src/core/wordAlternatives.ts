export function sentenceAround(text: string, start: number, end: number): string {
  const { from, to } = sentenceRange(text, start, end);
  return text.slice(from, to).trim();
}

export function swapContext(
  text: string,
  start: number,
  end: number
): { sentence: string; before: string; after: string } {
  const { from, to } = sentenceRange(text, start, end);
  const sentence = text.slice(from, to).trim();
  let before = "";
  if (from > 0) {
    let probe = from - 1;
    while (probe > 0 && /[\s.!?…"'”]/.test(text[probe] ?? "")) probe -= 1;
    const prev = sentenceRange(text, probe, probe + 1);
    before = text.slice(prev.from, prev.to).trim();
    if (before === sentence) before = "";
  }
  let after = "";
  if (to < text.length) {
    let probe = to;
    while (probe < text.length && /\s/.test(text[probe] ?? "")) probe += 1;
    if (probe < text.length) {
      const next = sentenceRange(text, probe, probe + 1);
      after = text.slice(next.from, next.to).trim();
      if (after === sentence) after = "";
    }
  }
  return { sentence, before, after };
}

function sentenceRange(text: string, start: number, end: number): { from: number; to: number } {
  let from = Math.max(0, start);
  while (from > 0) {
    const prev = text[from - 1];
    if (prev === "\n") break;
    if ((prev === "." || prev === "!" || prev === "?") && /\s/.test(text[from] ?? " ")) break;
    from -= 1;
  }
  while (from < start && /\s/.test(text[from] ?? "")) from += 1;

  let to = Math.min(text.length, Math.max(start, end));
  while (to < text.length) {
    const ch = text[to];
    to += 1;
    if (ch === "\n" || ch === "." || ch === "!" || ch === "?") break;
  }
  return { from, to };
}

export function matchWordCase(original: string, replacement: string): string {
  const next = replacement.trim();
  if (!next) return original;
  if (original.length > 1 && original === original.toUpperCase()) return next.toUpperCase();
  if (/^\p{Lu}/u.test(original)) return next.charAt(0).toUpperCase() + next.slice(1);
  return next;
}

export const ALTERNATIVES_SYSTEM = `You suggest replacement words for one marked word in fiction.
Return JSON only, shaped as: {"words":["..."]}

Keep the sense this sentence already uses. Same part of speech and tense.
Do not offer a neighboring meaning from a thesaurus.
Example: in "eyes crinkling with a smile", crinkling means creasing — not furrowing (brows) and not twinkling or gleaming (light).
Give 3 to 5 alternatives. Fewer is better than a wrong sense.
Prefer a single word. Two words only if English needs it.
Do not repeat the original word. Do not explain.
Prefer plainer or more precise diction, not fancier synonyms for their own sake.`;

const MAX_ALTERNATIVES = 5;

type SenseBan = {
  stem: string;
  cue: RegExp;
  reject: string[];
};

const SENSE_BANS: SenseBan[] = [
  {
    stem: "crinkl",
    cue: /\b(smile|smiled|smiling|smiles|eye|eyes|grin|grinned|grinning)\b/i,
    reject: [
      "furrowing",
      "furrowed",
      "furrow",
      "twinkling",
      "twinkle",
      "twinkled",
      "gleaming",
      "gleam",
      "gleamed",
      "glinting",
      "glint",
      "glinted",
      "sparkling",
      "sparkle",
      "sparkled"
    ]
  }
];

export function alternativesUserPrompt(
  word: string,
  sentence: string,
  voice = "",
  neighbors?: { before?: string; after?: string },
  readerAge?: number
): string {
  const parts = [`Word: ${word}`, `Sentence: ${sentence}`];
  const before = neighbors?.before?.trim() ?? "";
  const after = neighbors?.after?.trim() ?? "";
  if (before) parts.push(`Previous sentence: ${before}`);
  if (after) parts.push(`Next sentence: ${after}`);
  if (voice.trim()) parts.push(`Voice: ${voice.trim()}`);
  if (readerAge !== undefined && readerAge < 18) {
    parts.push(`The intended reader is about ${readerAge}. Prefer a word that reader would know. Keep the same sense.`);
  }
  parts.push("Keep this sense of the word. Same part of speech.");
  return parts.join("\n");
}

export function parseAlternativeWords(raw: string, original: string): string[] {
  const skip = normalize(original);
  const seen = new Set<string>(skip ? [skip] : []);
  const out: string[] = [];
  for (const item of extractList(raw)) {
    const word = cleanItem(item);
    if (!word) continue;
    const key = normalize(word);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(word);
    if (out.length >= MAX_ALTERNATIVES) break;
  }
  return out;
}

/** Drop known thesaurus misses for a few disambiguation cases. The prompt still has to do the real work. */
export function dropWrongSense(word: string, sentence: string, candidates: string[]): string[] {
  const stem = normalize(word);
  const bans = SENSE_BANS.filter((rule) => stem.startsWith(rule.stem));
  if (bans.length === 0) return candidates;
  return candidates.filter((item) => {
    const key = normalize(item);
    return !bans.some((rule) => rule.cue.test(sentence) && rule.reject.some((bad) => normalize(bad) === key));
  });
}

function extractList(raw: string): string[] {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const body = (fenced?.[1] ?? trimmed).trim();
  try {
    if (body.startsWith("[")) {
      const end = body.lastIndexOf("]");
      const parsed: unknown = JSON.parse(body.slice(0, end + 1));
      if (Array.isArray(parsed)) return parsed.map((item) => String(item));
    }
    const start = body.indexOf("{");
    const end = body.lastIndexOf("}");
    if (start >= 0 && end > start) {
      const parsed: unknown = JSON.parse(body.slice(start, end + 1));
      const words = (parsed as { words?: unknown }).words;
      if (Array.isArray(words)) return words.map((item) => String(item));
    }
  } catch {
    /* fall through to a loose list */
  }
  return body.split(/[\n,]/);
}

function cleanItem(item: string): string {
  return item
    .replace(/^[\s\-*•`"'\d.)]+/, "")
    .replace(/[`"']+$/, "")
    .trim();
}

function normalize(word: string): string {
  return word.toLowerCase().replace(/['’]/g, "'").trim();
}
