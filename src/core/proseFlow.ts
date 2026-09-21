export function splitFlowParagraphs(text: string): string[] {
  return text
    .replace(/\r\n/g, "\n")
    .split(/\n+/)
    .map((block) => block.replace(/[ \t]+/g, " ").trim())
    .filter(Boolean);
}

/** Model commentary glued onto a rewrite, e.g. `(Note: swapped the verbs…)`. */
const ASIDE_HEAD = /^(Notes|Note|Nota|Notering|Anteckning|Anmärkning|Anm|Notat|Merknad|Merk|Obs|Not)\s*:/i;

export function peelModelAsides(text: string): { prose: string; asides: string[] } {
  const asides: string[] = [];
  let prose = peelParenAsides(text, asides);
  prose = peelEdgeNoteParagraphs(prose, asides);
  return { prose: tidyPeeledProse(prose), asides };
}

function peelParenAsides(text: string, asides: string[]): string {
  let out = "";
  let i = 0;
  while (i < text.length) {
    const span = parenAsideAt(text, i);
    if (span) {
      const aside = unwrapAside(text.slice(span.start, span.end));
      if (aside) asides.push(aside);
      i = span.end;
      continue;
    }
    out += text[i];
    i++;
  }
  return out;
}

function parenAsideAt(text: string, index: number): { start: number; end: number } | null {
  if (text[index] !== "(") return null;
  if (!ASIDE_HEAD.test(text.slice(index + 1))) return null;
  let depth = 1;
  for (let j = index + 1; j < text.length; j++) {
    const ch = text[j];
    if (ch === "(") depth++;
    else if (ch === ")") {
      depth--;
      if (depth === 0) return { start: index, end: j + 1 };
    }
  }
  return { start: index, end: text.length };
}

function looksLikeModelNote(block: string): boolean {
  const stripped = unwrapAside(block.replace(/^\*+|\*+$/g, ""));
  if (!ASIDE_HEAD.test(stripped)) return false;
  return /→|->|Changed\b|Swapped\b|Recast\b|rewritten as asked|as per the author|to ["/']/i.test(stripped);
}

function peelEdgeNoteParagraphs(text: string, asides: string[]): string {
  const blocks = splitFlowParagraphs(text);
  if (blocks.length === 0) return text;
  const keep: string[] = [];
  for (const block of blocks) {
    if (looksLikeModelNote(block)) {
      const aside = unwrapAside(block.replace(/^\*+|\*+$/g, "").trim());
      if (aside) asides.push(aside);
      continue;
    }
    keep.push(block);
  }
  return joinFlowParagraphs(keep);
}

function unwrapAside(raw: string): string {
  return raw
    .trim()
    .replace(/^\*+|\*+$/g, "")
    .trim()
    .replace(/^\(/, "")
    .replace(/\)$/, "")
    .trim();
}

function tidyPeeledProse(text: string): string {
  return text
    .replace(/[ \t]{2,}/g, " ")
    .replace(/[ \t]*\n[ \t]*/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function htmlFromProse(text: string): string {
  const paras = splitFlowParagraphs(text);
  if (paras.length === 0) return "<p><br></p>";
  return paras.map((block) => `<p>${markupProseBlock(block)}</p>`).join("");
}

function markupProseBlock(block: string): string {
  let out = "";
  let i = 0;
  while (i < block.length) {
    const span = parenAsideAt(block, i);
    if (span) {
      out += `<span class="prose-aside">${escapeHtml(block.slice(span.start, span.end))}</span>`;
      i = span.end;
      continue;
    }
    if (i === 0 && ASIDE_HEAD.test(block.replace(/^\*+|\*+$/g, "").trim())) {
      return `<span class="prose-aside">${escapeHtml(block)}</span>`;
    }
    const next = block.indexOf("(", i + 1);
    const slice = next === -1 ? block.slice(i) : block.slice(i, next);
    out += escapeHtml(slice);
    i = next === -1 ? block.length : next;
  }
  return out;
}

export function joinFlowParagraphs(blocks: string[]): string {
  return blocks
    .map((block) => block.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .join("\n\n");
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
