export type PromptOperation =
  | "draft"
  | "recast"
  | "extend"
  | "elaborate"
  | "instruct"
  | "ask"
  | "ask-manuscript"
  | "word-swap"
  | "sentence-split"
  | "paragraph-break"
  | "extract"
  | "analyze"
  | "illustrate"
  | "proofread";

export type PromptDebugTarget = "prose" | "synopsis" | "brainstorm";

export type PromptDebugMessage = { role: "system" | "user"; content: string };

export type PromptDebugEntry = {
  operation: PromptOperation;
  target?: PromptDebugTarget;
  model: string;
  messages: PromptDebugMessage[];
  at: string;
};

/**
 * Rough token estimate (~4 characters per token, a common approximation for
 * English prose) since there's no real local tokenizer wired up. Good enough
 * to give a sense of scale, not meant to be exact.
 */
export function estimateTokens(text: string): number {
  if (!text) return 0;
  return Math.max(1, Math.round(text.length / 4));
}

export function totalEstimatedTokens(entry: PromptDebugEntry): number {
  return entry.messages.reduce((sum, message) => sum + estimateTokens(message.content), 0);
}
