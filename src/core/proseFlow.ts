export function splitFlowParagraphs(text: string): string[] {
  return text
    .replace(/\r\n/g, "\n")
    .split(/\n+/)
    .map((block) => block.replace(/[ \t]+/g, " ").trim())
    .filter(Boolean);
}

export function htmlFromProse(text: string): string {
  const paras = splitFlowParagraphs(text);
  if (paras.length === 0) return "<p><br></p>";
  return paras.map((block) => `<p>${escapeHtml(block)}</p>`).join("");
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
