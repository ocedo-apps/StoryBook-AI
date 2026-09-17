/** Map a click in a textarea to a character offset, matching wrapped prose. */
export function textareaOffsetFromPoint(area: HTMLTextAreaElement, clientX: number, clientY: number): number {
  const text = area.value;
  if (!text) return 0;

  const mirror = document.createElement("div");
  const style = getComputedStyle(area);
  mirror.style.cssText = [
    "position:absolute",
    "left:-9999px",
    "top:0",
    "visibility:hidden",
    "white-space:pre-wrap",
    "overflow-wrap:break-word",
    "word-wrap:break-word",
    `width:${area.clientWidth}px`,
    `font:${style.font}`,
    `letter-spacing:${style.letterSpacing}`,
    `word-spacing:${style.wordSpacing}`,
    `line-height:${style.lineHeight}`,
    `padding:${style.paddingTop} ${style.paddingRight} ${style.paddingBottom} ${style.paddingLeft}`,
    "border:0",
    "box-sizing:border-box"
  ].join(";");
  mirror.textContent = text;
  document.body.appendChild(mirror);

  const node = mirror.firstChild;
  if (!node) {
    mirror.remove();
    return 0;
  }

  const origin = mirror.getBoundingClientRect();
  const x = clientX - area.getBoundingClientRect().left - area.clientLeft + area.scrollLeft;
  const y = clientY - area.getBoundingClientRect().top - area.clientTop + area.scrollTop;
  const line = Number.parseFloat(style.lineHeight) || Number.parseFloat(style.fontSize) || 16;

  let lo = 0;
  let hi = text.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    const caret = caretPoint(node, mid, origin);
    if (caret.y + Math.max(caret.h, line) * 0.8 < y) lo = mid + 1;
    else if (caret.y > y + 2) hi = mid;
    else if (caret.x < x) lo = mid + 1;
    else hi = mid;
  }

  mirror.remove();
  return lo;
}

function caretPoint(node: ChildNode, index: number, origin: DOMRect): { x: number; y: number; h: number } {
  const range = document.createRange();
  const at = Math.max(0, Math.min(index, node.textContent?.length ?? 0));
  range.setStart(node, at);
  range.setEnd(node, at);
  const box = range.getBoundingClientRect();
  return {
    x: box.left - origin.left,
    y: box.top - origin.top,
    h: box.height
  };
}
