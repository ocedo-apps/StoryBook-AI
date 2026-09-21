export const POV_MODES = ["limited", "first", "omniscient", "objective", "second"] as const;
export type PovMode = (typeof POV_MODES)[number];

export const PRIMARY_POV_MODES = ["limited", "first", "omniscient"] as const;
export const ADVANCED_POV_MODES = ["objective", "second"] as const;

export const TENSES = ["past", "present"] as const;
export type Tense = (typeof TENSES)[number];

export const POV_LABELS: Record<PovMode, string> = {
  limited: "3rd limited",
  first: "1st person",
  omniscient: "3rd omniscient",
  objective: "3rd objective",
  second: "2nd person"
};

export const TENSE_LABELS: Record<Tense, string> = {
  past: "Past",
  present: "Present"
};

export function isPovMode(value: string): value is PovMode {
  return (POV_MODES as readonly string[]).includes(value);
}

export function isTense(value: string): value is Tense {
  return (TENSES as readonly string[]).includes(value);
}

export function parsePov(value: string): PovMode {
  return isPovMode(value) ? value : "limited";
}

export function parseTense(value: string): Tense {
  return isTense(value) ? value : "past";
}

export function needsViewpoint(pov: PovMode): boolean {
  return pov === "limited" || pov === "first";
}

export type CraftFields = {
  pov: PovMode;
  tense: Tense;
  viewpoint: string;
};

/** Optional per-chapter camera. Missing fields inherit the manuscript. */
export type ChapterCraft = {
  pov?: PovMode | undefined;
  tense?: Tense | undefined;
  viewpoint?: string | undefined;
};

export function hasCraftOverride(chapter?: ChapterCraft | null): boolean {
  return chapter?.pov !== undefined || chapter?.tense !== undefined || chapter?.viewpoint !== undefined;
}

export function resolveCraft(book: CraftFields, chapter?: ChapterCraft | null): CraftFields {
  return {
    pov: chapter?.pov ?? book.pov,
    tense: chapter?.tense ?? book.tense,
    viewpoint: chapter?.viewpoint ?? book.viewpoint
  };
}

export function summarizeCraft(craft: CraftFields): string {
  const camera = POV_LABELS[craft.pov];
  const tense = TENSE_LABELS[craft.tense].toLowerCase();
  const who = craft.viewpoint.trim();
  if (needsViewpoint(craft.pov) && who) return `${camera} to ${who}, ${tense}`;
  return `${camera}, ${tense}`;
}

/** Short label for the chapter list when this chapter diverges. */
export function chapterCraftCue(book: CraftFields, chapter: ChapterCraft): string {
  if (!hasCraftOverride(chapter)) return "";
  const resolved = resolveCraft(book, chapter);
  if (chapter.viewpoint !== undefined) {
    return chapter.viewpoint.trim() || POV_LABELS[resolved.pov];
  }
  if (chapter.pov !== undefined && needsViewpoint(resolved.pov) && resolved.viewpoint.trim()) {
    return `${POV_LABELS[resolved.pov]} · ${resolved.viewpoint.trim()}`;
  }
  if (chapter.pov !== undefined) return POV_LABELS[resolved.pov];
  if (chapter.tense !== undefined) return TENSE_LABELS[resolved.tense];
  return "";
}

export function parseOptionalPov(value: string): PovMode | undefined {
  return value.trim() === "" ? undefined : parsePov(value);
}

export function parseOptionalTense(value: string): Tense | undefined {
  return value.trim() === "" ? undefined : parseTense(value);
}

export function povInstruction(pov: PovMode, viewpoint: string): string {
  const who = viewpoint.trim();
  switch (pov) {
    case "limited":
      return who
        ? `Third person limited to ${who}. Stay close to only ${who}’s perceptions and thoughts. Never enter another mind.`
        : "Third person limited. Stay close to only one character’s perceptions and thoughts. Never enter another mind. If a viewpoint character is not named, stay with the most present character in the scene.";
    case "first":
      return who
        ? `First person as ${who}. The narrator is ${who}; write “I”. Do not leave ${who}’s head.`
        : "First person. Tell the story through the narrator’s eyes as “I”. Stay in one mind.";
    case "omniscient":
      return "Third person omniscient. You may reveal any character’s thoughts when the scene needs it. Do not linger in every mind at once.";
    case "objective":
      return "Third person objective. Write only what an observer on the scene would see and hear — action, gesture, dialogue. No thoughts, no interiority.";
    case "second":
      return "Second person. Address the reader as “you”; “you” is the main character.";
  }
}

export function tenseInstruction(tense: Tense): string {
  return tense === "present" ? "Present tense throughout." : "Past tense throughout.";
}

function sameCraft(a: CraftFields, b: CraftFields): boolean {
  return a.pov === b.pov && a.tense === b.tense && a.viewpoint.trim() === b.viewpoint.trim();
}

/** Always injected into draft/passage prompts — defaults are still explicit. */
export function formatCraftForDraft(craft: CraftFields, manuscript?: CraftFields): string {
  const body = `Point of view: ${povInstruction(craft.pov, craft.viewpoint)}\nTense: ${tenseInstruction(craft.tense)}`;
  if (manuscript && !sameCraft(craft, manuscript)) {
    return `${body}\nThis chapter uses a different point of view from the rest of the manuscript (manuscript default: ${summarizeCraft(manuscript)}). Stay with this chapter’s point of view even if earlier prose was written in another.`;
  }
  return body;
}

/**
 * Brainstorm may mention the intended camera, but notes stay scratch —
 * not chapter prose in that POV.
 */
export function formatCraftForBrainstorm(craft: CraftFields): string {
  return `Intended manuscript craft (for the eventual prose, not these notes):\n${formatCraftForDraft(craft)}\nThese notes may stay in any form. Do not write chapter prose unless asked.`;
}
