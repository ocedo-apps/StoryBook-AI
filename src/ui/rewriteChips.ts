import { format, type Messages } from "./i18n";

export const REWRITE_CHIP_IDS = [
  "povLeak",
  "strongerVerbs",
  "activeVoice",
  "showDontTell",
  "breakLong"
] as const;

export type RewriteChipId = (typeof REWRITE_CHIP_IDS)[number];

export function insertRewriteChip(current: string, piece: string): string {
  const addition = piece.trim();
  if (!addition) return current;
  const body = current.trimEnd();
  if (!body) return addition;
  if (body.includes(addition)) return body;
  return `${body}\n\n${addition}`;
}

export function rewriteChipLabel(messages: Messages, id: RewriteChipId): string {
  return messages.canvas.rewriteChips[id].label;
}

export function rewriteChipPrompt(messages: Messages, id: RewriteChipId, who: string): string {
  if (id === "povLeak") {
    const name = who.trim();
    if (name) return format(messages.canvas.rewriteChips.povLeak.prompt, { who: name });
    return messages.canvas.rewriteChips.povLeakCamera;
  }
  return messages.canvas.rewriteChips[id].prompt;
}
