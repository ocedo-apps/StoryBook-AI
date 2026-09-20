import { splitFlowParagraphs } from "./proseFlow";

export const BREAK_SYSTEM = `You re-paragraph one fiction block.
Keep the wording, tense, viewpoint, and names. Do not add facts or commentary.
Start a new paragraph when focus shifts between present action, background, and interior thought or sense.
You may break a long sentence at that shift. A paragraph may stay long if one motive holds it.
You must return at least two paragraphs, separated by a blank line.
Return JSON only. Example:
{"split":"He walked to the ship.\\n\\nHis life's work had taken decades.\\n\\nThe cold and the silence stayed."}`;

export function breakUserPrompt(paragraph: string, voice = "", readerAge?: number): string {
  const parts = [`Paragraph:\n${paragraph}`];
  if (voice.trim()) parts.push(`Voice: ${voice.trim()}`);
  if (readerAge !== undefined && readerAge < 18) {
    parts.push(`The intended reader is about ${readerAge}. Prefer breaks that reader can follow. Do not simplify meaning.`);
  }
  parts.push("Re-paragraph this block. JSON only.");
  return parts.join("\n");
}

export function parseParagraphBreak(raw: string, original: string): string {
  for (const candidate of extractCandidates(raw)) {
    const next = dropAlienLead(normalizeBreaks(unescapeNewlines(candidate)), original);
    if (isUsableBreak(next, original)) return next;
  }
  return "";
}

function extractCandidates(raw: string): string[] {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const body = (fenced?.[1] ?? trimmed).trim();
  const found: string[] = [];

  const fromJson = readJson(body);
  if (fromJson) found.push(fromJson);

  const quoted = body.match(/"(?:split|paragraphs|text)"\s*:\s*"([\s\S]*?)"\s*[,}]/);
  if (quoted?.[1]) found.push(quoted[1]);

  found.push(body.replace(/^["']|["']$/g, "").trim());
  if (body !== trimmed) found.push(trimmed);
  return found;
}

function readJson(body: string): string {
  const start = body.indexOf("{");
  const end = body.lastIndexOf("}");
  if (start < 0 || end <= start) return "";
  const slice = body.slice(start, end + 1);
  try {
    return readBreakField(JSON.parse(slice));
  } catch {
    try {
      return readBreakField(JSON.parse(slice.replace(/\n/g, "\\n")));
    } catch {
      return "";
    }
  }
}

function readBreakField(parsed: unknown): string {
  if (!parsed || typeof parsed !== "object") return "";
  const rec = parsed as Record<string, unknown>;
  const value = rec.split ?? rec.paragraphs ?? rec.text;
  if (typeof value === "string") return value.trim();
  if (Array.isArray(value)) {
    return value
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.trim())
      .filter(Boolean)
      .join("\n\n");
  }
  return "";
}

function isUsableBreak(next: string, original: string): boolean {
  if (!next) return false;
  if (normalizeBreaks(original) === next) return false;
  if (paragraphCount(next) < 2) return false;
  return tokenOverlap(original, next) >= 0.4;
}

function dropAlienLead(text: string, original: string): string {
  const parts = text.split(/\n\s*\n/).filter((block) => block.trim());
  while (parts.length >= 3) {
    const lead = parts[0] ?? "";
    if (tokens(lead).length <= 8 && tokenOverlap(original, lead) < 0.3) {
      parts.shift();
      continue;
    }
    break;
  }
  return parts.join("\n\n");
}

function tokenOverlap(original: string, next: string): number {
  const source = new Set(tokens(original));
  const words = tokens(next);
  if (words.length === 0) return 0;
  let hit = 0;
  for (const word of words) {
    if (source.has(word)) hit += 1;
  }
  return hit / words.length;
}

const TOKEN_RE = /[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu;

function tokens(text: string): string[] {
  return (text.match(TOKEN_RE) ?? []).map((word) => word.toLowerCase());
}

function unescapeNewlines(text: string): string {
  return text.replace(/\r\n/g, "\n").replace(/\\n/g, "\n");
}

function normalizeBreaks(text: string): string {
  return splitFlowParagraphs(unescapeNewlines(text)).join("\n\n");
}

function paragraphCount(text: string): number {
  return splitFlowParagraphs(text).length;
}
