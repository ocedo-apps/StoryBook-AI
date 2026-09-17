export type TextSpan = {
  start: number;
  end: number;
};

export function normalizeSpan(start: number, end: number): TextSpan {
  return start <= end ? { start, end } : { start: end, end: start };
}

export function selectedText(source: string, span: TextSpan): string {
  const { start, end } = normalizeSpan(span.start, span.end);
  return source.slice(start, end);
}

export function isNonEmptySpan(source: string, span: TextSpan): boolean {
  return selectedText(source, span).length > 0;
}

/** Space before an extension unless the cut already ends on whitespace. */
export function extendGlue(head: string): string {
  if (head.length === 0) return "";
  const last = head[head.length - 1];
  if (last === " " || last === "\n" || last === "\t") return "";
  return " ";
}

export function applyExtend(source: string, span: TextSpan, addition: string): string {
  const { end } = normalizeSpan(span.start, span.end);
  const head = source.slice(0, end);
  return head + extendGlue(head) + addition + source.slice(end);
}

export function applyReplace(source: string, span: TextSpan, replacement: string): string {
  const { start, end } = normalizeSpan(span.start, span.end);
  return source.slice(0, start) + replacement + source.slice(end);
}

export function surroundingPassage(source: string, span: TextSpan, radius = 400): {
  before: string;
  selected: string;
  after: string;
} {
  const { start, end } = normalizeSpan(span.start, span.end);
  return {
    before: source.slice(Math.max(0, start - radius), start),
    selected: source.slice(start, end),
    after: source.slice(end, end + radius)
  };
}
