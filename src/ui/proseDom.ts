import { HR_BLOCK, joinFlowParagraphs, QUOTE_PREFIX, splitFlowParagraphs } from "@core/proseFlow";
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

/** The caret's plain-text offset, or null with no collapsed caret inside `root` — used to restore the cursor when a keystroke forces a markup resync (see `blockMarkupNeedsSync`), since that rebuild isn't always at the end of the text the way a fresh AI edit is. */
export function currentCaretOffset(root: HTMLElement): number | null {
  const sel = window.getSelection();
  if (!sel || !sel.isCollapsed || !sel.anchorNode || !root.contains(sel.anchorNode)) return null;
  return caretToOffset(root, sel.anchorNode, sel.anchorOffset);
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

export function flowBlocks(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll(":scope > p, :scope > div")).filter(
    (el): el is HTMLElement => el instanceof HTMLElement
  );
}

/**
 * True when some paragraph's plain text now calls for `.prose-hr`/
 * `.prose-quote` markup (or has outgrown it) but the live DOM hasn't been
 * rebuilt to match yet. The canvas's own reconcile effect normally skips
 * rebuilding the DOM whenever the extracted text still equals `value` — the
 * common case while typing, so a keystroke never fights the browser's own
 * cursor handling. But `proseFromElement` reads the SAME plain text back
 * from a plain `<p>---</p>` and from a rendered `<p class="prose-hr">---
 * </p>` (the class just hides the dashes visually), so that check alone
 * can never notice "this paragraph still needs upgrading" — typing `---`
 * by hand stayed three bare dashes forever, only ever turning into a rule
 * on the NEXT full rebuild (switching chapters, an AI edit), not when the
 * author actually typed it. This is the extra check the effect runs to
 * catch that case and force a rebuild.
 */
export function blockMarkupNeedsSync(root: HTMLElement): boolean {
  for (const block of flowBlocks(root)) {
    // Collapsed but NOT trimmed — a trailing space the author just typed
    // (the optional space in "> ") is real, current DOM content, not
    // meaningless trailing whitespace yet; trimming it away here would
    // make the marker-content check below think that space needs
    // stripping on every single keystroke until body text follows it.
    const rawText = (block.textContent ?? "").replace(/\u00a0/g, " ").replace(/\s+/g, " ");
    const text = rawText.trim();
    // A block the author just split off with Enter is briefly empty, but
    // native `insertParagraph` copies the split paragraph's class onto it
    // (a fresh <p class="prose-hr"><br></p> right after an hr line) — that
    // is not a real mismatch to fix, just a side effect of the split, and
    // `proseFromElement` ignores empty blocks entirely. Treating it as one
    // forced a rebuild from `value` (which has never heard of this new,
    // still-empty paragraph) that erased the split the browser had just
    // made, so Enter right after an hr/quote line silently did nothing.
    if (!text) continue;
    const isHrBlock = block.classList.contains("prose-hr");
    if (HR_BLOCK.test(text) !== isHrBlock) return true;
    const isQuoteBlock = block.classList.contains("prose-quote");
    if (QUOTE_PREFIX.test(text) !== isQuoteBlock) return true;
    if (isQuoteBlock) {
      // The marker span is the only hidden (font-size: 0) content in a
      // quote paragraph, and typing right after it — the common case,
      // nothing written yet when the `>` first converts — has nowhere
      // else to land: a zero-size inline box gives the browser no visual
      // "just past this" position to distinguish from "still inside it",
      // so new characters keep extending the marker's own (invisible)
      // text instead of becoming visible body text. Rather than fight
      // that placement, catch it here: if the marker holds more than the
      // matched prefix, force the rebuild that moves the extra characters
      // into the visible body, same as any other markup mismatch above.
      const marker = block.querySelector(":scope > .prose-quote-marker");
      // A trailing space the browser just inserted at the very end of an
      // inline run commonly becomes a non-breaking space (so it doesn't
      // collapse away per normal HTML whitespace rules) — normalize it
      // the same way `rawText` already is, or a real "> " marker reads as
      // a false mismatch against "> " with a plain space and gets
      // stripped back down on every keystroke.
      const markerText = (marker?.textContent ?? "").replace(/ /g, " ");
      const expectedMarker = rawText.match(QUOTE_PREFIX)?.[0] ?? "";
      if (markerText !== expectedMarker) return true;
    }
  }
  return false;
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
