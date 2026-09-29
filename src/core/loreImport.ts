export type LoreArticleCandidate = {
  title: string;
  text: string;
};

const HEADER_PATTERN = /^#{1,6}[ \t]+(.+)$/gm;

/**
 * Splits a pasted or uploaded lore document into candidate articles.
 * Roadmap-ideas.md #28, step 1: a source-agnostic way to bring in more than
 * one entry at a time, well before any format-specific adapter (SillyTavern,
 * Campfire, ...) exists — those can feed the same pipeline later.
 *
 * Splits on Markdown-style headers (one or more leading `#`), the most
 * common convention for pasted wiki/notes exports. Text with no headers at
 * all comes back as a single untitled article — the exact shape a plain
 * paste already had before this existed, so the common single-article case
 * is unaffected. Text before the first header (a preamble) is kept as its
 * own untitled article rather than silently dropped.
 */
export function splitLoreArticles(raw: string): LoreArticleCandidate[] {
  const text = raw.replace(/\r\n/g, "\n");
  const matches = [...text.matchAll(HEADER_PATTERN)];
  if (matches.length === 0) {
    const trimmed = text.trim();
    return trimmed ? [{ title: "", text: trimmed }] : [];
  }

  const articles: LoreArticleCandidate[] = [];
  const preamble = text.slice(0, matches[0]!.index!).trim();
  if (preamble) articles.push({ title: "", text: preamble });

  for (let i = 0; i < matches.length; i++) {
    const match = matches[i]!;
    const title = match[1]!.trim();
    const start = match.index! + match[0].length;
    const end = i + 1 < matches.length ? matches[i + 1]!.index! : text.length;
    const body = text.slice(start, end).trim();
    if (body) articles.push({ title, text: body });
  }
  return articles;
}
