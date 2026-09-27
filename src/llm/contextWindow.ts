/**
 * How much text a local model is told it may actually look at (Ollama's
 * `num_ctx`). Nothing running in a browser can see the author's GPU/VRAM —
 * there is no web API for that — so this is never auto-detected. Ollama's
 * own default (historically as low as 2048) is often far smaller than what
 * the connected model and hardware could actually handle, and StoryBook's
 * own Draft prompt (full chapter so far + Story Bible + synopsis) can
 * exceed it easily on anything but a short chapter — silently degrading the
 * model's grip on recently-written detail. `DEFAULT_CONTEXT_WINDOW` is a
 * safer floor than Ollama's default; Settings lets the author raise or
 * lower it, and can pre-fill it from the model's own reported maximum
 * (`getOllamaModelContextLength`) as a starting suggestion, never a forced
 * value — same "author decides" pattern as every other Settings number.
 */
export const DEFAULT_CONTEXT_WINDOW = 8192;
export const MIN_CONTEXT_WINDOW = 1024;
export const MAX_CONTEXT_WINDOW = 131072;
export const CONTEXT_WINDOW_KEY = "storybook-ai.context-window";

export function clampContextWindow(n: number): number {
  if (!Number.isFinite(n)) return DEFAULT_CONTEXT_WINDOW;
  return Math.min(MAX_CONTEXT_WINDOW, Math.max(MIN_CONTEXT_WINDOW, Math.round(n)));
}

export function parseContextWindow(raw: string | null | undefined): number {
  if (raw == null || raw.trim() === "") return DEFAULT_CONTEXT_WINDOW;
  const n = Number(raw);
  if (!Number.isFinite(n)) return DEFAULT_CONTEXT_WINDOW;
  return clampContextWindow(n);
}

export function readContextWindow(store: Pick<Storage, "getItem"> = localStorage): number {
  return parseContextWindow(store.getItem(CONTEXT_WINDOW_KEY));
}

export function writeContextWindow(value: number, store: Pick<Storage, "getItem" | "setItem"> = localStorage): void {
  store.setItem(CONTEXT_WINDOW_KEY, String(clampContextWindow(value)));
}
