const PRIMER_KEY = "storybook-ai.writing-primer";

/** Default stance for every writing model until the author changes it. */
export const DEFAULT_WRITING_PRIMER = `You write literary fiction. Not chat, not a summary, not a writing-workshop note.
Stay in scene. Imply; do not explain the story to the reader.
Write the scene as it is lived, not as a film treatment. No cameras, shots, or cuts.
Match the language of the manuscript.`;

export function withWritingPrimer(jobSystem: string, primer: string): string {
  const head = primer.trim();
  if (!head) return jobSystem;
  return `${head}\n\n${jobSystem}`;
}

export function readWritingPrimer(model: string, store: Pick<Storage, "getItem"> = localStorage): string {
  const map = readMap(store);
  if (Object.prototype.hasOwnProperty.call(map, model)) return map[model] ?? "";
  return DEFAULT_WRITING_PRIMER;
}

export function writeWritingPrimer(
  model: string,
  primer: string,
  store: Pick<Storage, "getItem" | "setItem"> = localStorage
): void {
  const map = readMap(store);
  map[model] = primer;
  store.setItem(PRIMER_KEY, JSON.stringify(map));
}

export function clearWritingPrimer(model: string, store: Pick<Storage, "getItem" | "setItem"> = localStorage): void {
  const map = readMap(store);
  delete map[model];
  store.setItem(PRIMER_KEY, JSON.stringify(map));
}

function readMap(store: Pick<Storage, "getItem">): Record<string, string> {
  const raw = store.getItem(PRIMER_KEY);
  if (!raw) return {};
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    const map: Record<string, string> = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (typeof value === "string") map[key] = value;
    }
    return map;
  } catch {
    return {};
  }
}
