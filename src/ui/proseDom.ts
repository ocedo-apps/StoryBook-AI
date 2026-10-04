import { joinFlowParagraphs, splitFlowParagraphs } from "@core/proseFlow";
import { normalizeSpan, type TextSpan } from "@core/textSpan";
import {
  FORMATTING_STYLES,
  mergeAdjacentRanges,
  type ProseFormattingRange,
  type ProseFormattingStyle
} from "@core/proseFormatting";

export function proseFromElement(root: HTMLElement): string {
  const blocks = flowBlocks(root)
    .map((block) => (block.textContent ?? "").replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim())
    .filter(Boolean);
  if (blocks.length === 0) {
    const loose = (root.innerText ?? "").replace(/\u00a0/g, " ").trim();
    return loose ? joinFlowParagraphs(splitFlowParagraphs(loose)) : "";
  }
  return joinFlowParagraphs(blocks);
}

export function spanFromSelection(root: HTMLElement): TextSpan | null {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return null;
  if (!sel.anchorNode || !root.contains(sel.anchorNode)) return null;
  if (!sel.focusNode || !root.contains(sel.focusNode)) return null;
  const start = caretToOffset(root, sel.anchorNode, sel.anchorOffset);
  const end = caretToOffset(root, sel.focusNode, sel.focusOffset);
  if (start === null || end === null || start === end) return null;
  return normalizeSpan(start, end);
}

export function offsetFromPoint(root: HTMLElement, clientX: number, clientY: number): number {
  let node: Node | null = null;
  let offset = 0;
  if (typeof document.caretRangeFromPoint === "function") {
    const range = document.caretRangeFromPoint(clientX, clientY);
    if (range) {
      node = range.startContainer;
      offset = range.startOffset;
    }
  } else {
    const doc = document as Document & {
      caretPositionFromPoint?: (x: number, y: number) => { offsetNode: Node; offset: number } | null;
    };
    const pos = doc.caretPositionFromPoint?.(clientX, clientY);
    if (pos) {
      node = pos.offsetNode;
      offset = pos.offset;
    }
  }
  return caretToOffset(root, node, offset) ?? 0;
}

export function isCaretAtEnd(root: HTMLElement): boolean {
  const sel = window.getSelection();
  if (!sel || !sel.isCollapsed || !sel.anchorNode || !root.contains(sel.anchorNode)) return false;
  const offset = caretToOffset(root, sel.anchorNode, sel.anchorOffset);
  return offset === proseFromElement(root).length;
}

export function placeCaretAtEnd(root: HTMLElement): void {
  const last = root.querySelector("p:last-child") ?? root;
  const range = document.createRange();
  range.selectNodeContents(last);
  range.collapse(false);
  const sel = window.getSelection();
  sel?.removeAllRanges();
  sel?.addRange(range);
}

function caretToOffset(root: HTMLElement, node: Node | null, offset: number): number | null {
  if (!node) return null;
  const blocks = flowBlocks(root);
  if (blocks.length === 0) {
    const text = (root.textContent ?? "").replace(/\s+/g, " ").trimStart();
    return Math.min(offset, text.length);
  }
  let pos = 0;
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i]!;
    const body = (block.textContent ?? "").replace(/\u00a0/g, " ");
    if (block === node || block.contains(node)) {
      return pos + textOffsetIn(block, node, offset);
    }
    pos += body.replace(/\s+/g, " ").trim().length;
    if (i < blocks.length - 1) pos += 2;
  }
  return pos;
}

function flowBlocks(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll(":scope > p, :scope > div")).filter(
    (el): el is HTMLElement => el instanceof HTMLElement
  );
}

function textOffsetIn(block: HTMLElement, target: Node, targetOffset: number): number {
  if (target === block) {
    return targetOffset <= 0 ? 0 : (block.textContent ?? "").length;
  }
  const walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT);
  let count = 0;
  let current: Node | null;
  while ((current = walker.nextNode())) {
    const len = current.textContent?.length ?? 0;
    if (current === target) return count + Math.min(targetOffset, len);
    count += len;
  }
  return count;
}

const STYLE_TAGS: Partial<Record<string, ProseFormattingStyle>> = {
  B: "bold",
  STRONG: "bold",
  I: "italic",
  EM: "italic",
  U: "underline"
};

function activeStylesFor(node: Node, block: HTMLElement): ProseFormattingStyle[] {
  const styles: ProseFormattingStyle[] = [];
  let current: Node | null = node.parentNode;
  while (current && current !== block) {
    if (current instanceof HTMLElement) {
      const style = STYLE_TAGS[current.tagName];
      if (style && !styles.includes(style)) styles.push(style);
    }
    current = current.parentNode;
  }
  return styles;
}

/**
 * Reads Bold/Italic/Underline back out of the live canvas after an edit —
 * the reverse of `htmlFromProse`'s formatting-aware rendering. Walks the
 * same blocks `proseFromElement` does, using the same "raw text-node
 * lengths within a block, collapsed lengths across block boundaries" offset
 * scheme as `caretToOffset` below, so a range's start/end line up with the
 * plain-text offsets `proseFromElement` produces for the same edit.
 */
export function formattingFromElement(root: HTMLElement): ProseFormattingRange[] {
  const blocks = flowBlocks(root);
  const ranges: ProseFormattingRange[] = [];
  const openStart = new Map<ProseFormattingStyle, number>();
  let pos = 0;

  function closeAllAt(at: number) {
    for (const [style, start] of openStart) {
      if (at > start) ranges.push({ start, end: at, style });
    }
    openStart.clear();
  }

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i]!;
    const walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT);
    let node: Node | null;
    while ((node = walker.nextNode())) {
      const len = node.textContent?.length ?? 0;
      if (len === 0) continue;
      const active = activeStylesFor(node, block);
      for (const style of FORMATTING_STYLES) {
        const isActive = active.includes(style);
        const wasOpen = openStart.has(style);
        if (isActive && !wasOpen) openStart.set(style, pos);
        else if (!isActive && wasOpen) {
          ranges.push({ start: openStart.get(style)!, end: pos, style });
          openStart.delete(style);
        }
      }
      pos += len;
    }
    closeAllAt(pos);
    if (i < blocks.length - 1) pos += 2;
  }
  return mergeAdjacentRanges(ranges);
}

function pointWithinBlock(block: HTMLElement, localOffset: number): { node: Node; offset: number } {
  const walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT);
  let node: Node | null;
  let count = 0;
  let last: Node = block;
  while ((node = walker.nextNode())) {
    const len = node.textContent?.length ?? 0;
    last = node;
    if (localOffset <= count + len) return { node, offset: localOffset - count };
    count += len;
  }
  return { node: last, offset: last.textContent?.length ?? 0 };
}

function pointAtOffset(root: HTMLElement, offset: number): { node: Node; offset: number } | null {
  const blocks = flowBlocks(root);
  // Same fallback as caretToOffset: live typing can leave the editable area
  // as flat text with no <p>/<div> children until the next full resync (the
  // DOM-sync effect skips rewriting the DOM while the live text already
  // matches `value`, to avoid disturbing the caret) — treat the whole root
  // as one block rather than finding nothing to measure against.
  if (blocks.length === 0) return root.textContent ? pointWithinBlock(root, offset) : null;
  let pos = 0;
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i]!;
    const body = (block.textContent ?? "").replace(/ /g, " ");
    const collapsedLength = body.replace(/\s+/g, " ").trim().length;
    const isLast = i === blocks.length - 1;
    if (offset <= pos + collapsedLength || isLast) {
      const local = Math.max(0, Math.min(offset - pos, collapsedLength));
      return pointWithinBlock(block, local);
    }
    pos += collapsedLength + 2;
  }
  return null;
}

/** Viewport-relative rect of the caret at `offset` — used to position a placeholder marker over the live text it sits in front of. Null once the canvas has no content to measure against. */
export function rectAtOffset(root: HTMLElement, offset: number): DOMRect | null {
  const point = pointAtOffset(root, offset);
  if (!point) return null;
  const range = document.createRange();
  range.setStart(point.node, point.offset);
  range.setEnd(point.node, point.offset);
  const rects = range.getClientRects();
  return rects[0] ?? range.getBoundingClientRect();
}

/** The reverse of `spanFromSelection` — restores a selection after a formatting toggle rebuilds the canvas's HTML, so clicking Bold doesn't drop the user's selection. */
export function placeSelectionAtSpan(root: HTMLElement, span: TextSpan): void {
  const { start, end } = normalizeSpan(span.start, span.end);
  const startPoint = pointAtOffset(root, start);
  const endPoint = pointAtOffset(root, end);
  if (!startPoint || !endPoint) return;
  const range = document.createRange();
  range.setStart(startPoint.node, startPoint.offset);
  range.setEnd(endPoint.node, endPoint.offset);
  const sel = window.getSelection();
  sel?.removeAllRanges();
  sel?.addRange(range);
}
