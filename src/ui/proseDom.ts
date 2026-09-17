import { joinFlowParagraphs, splitFlowParagraphs } from "@core/proseFlow";
import { normalizeSpan, type TextSpan } from "@core/textSpan";

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
