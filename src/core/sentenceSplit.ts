export const SPLIT_SYSTEM = `You split one fiction sentence into two or three shorter ones.
Keep the same meaning, tense, viewpoint, and names.
Do not add facts, commentary, or quotation marks around the result.
Return JSON only, shaped as: {"split":"..."}
The split field is the replacement prose, with the new sentence breaks already in it.`;

export function splitUserPrompt(sentence: string, voice = "", readerAge?: number): string {
  const parts = [`Sentence:\n${sentence}`];
  if (voice.trim()) parts.push(`Voice: ${voice.trim()}`);
  if (readerAge !== undefined && readerAge < 18) {
    parts.push(`The intended reader is about ${readerAge}. Prefer a split that reader can follow. Do not simplify meaning.`);
  }
  return parts.join("\n");
}

export function parseSplitSuggestion(raw: string, original: string): string {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const body = (fenced?.[1] ?? trimmed).trim();
  let split = "";
  try {
    const start = body.indexOf("{");
    const end = body.lastIndexOf("}");
    if (start >= 0 && end > start) {
      const parsed: unknown = JSON.parse(body.slice(start, end + 1));
      split = readSplitField(parsed);
    }
  } catch {
    /* use the raw body */
  }
  if (!split) split = body.replace(/^["']|["']$/g, "").trim();
  if (!split || collapseSpace(split) === collapseSpace(original)) return "";
  return split;
}

function readSplitField(parsed: unknown): string {
  if (!parsed || typeof parsed !== "object") return "";
  const rec = parsed as Record<string, unknown>;
  const value = rec.split ?? rec.sentences ?? rec.text;
  if (typeof value === "string") return value.trim();
  if (Array.isArray(value)) {
    return value
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.trim())
      .filter(Boolean)
      .join(" ");
  }
  return "";
}

export function replaceCollapsedSentence(source: string, collapsed: string, replacement: string): string | null {
  const needle = collapsed.trim();
  const next = replacement.trim();
  if (!needle || !next) return null;
  const exact = source.indexOf(needle);
  if (exact >= 0) return source.slice(0, exact) + next + source.slice(exact + needle.length);

  const escaped = needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/ /g, "\\s+");
  const match = source.match(new RegExp(escaped));
  if (!match || match.index === undefined) return null;
  return source.slice(0, match.index) + next + source.slice(match.index + match[0].length);
}

function collapseSpace(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}
