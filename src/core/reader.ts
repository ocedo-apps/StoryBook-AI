/** Who the prose is for. Writing instruction, not Story Bible. */

export const READER_AGE_MIN = 1;
export const READER_AGE_MAX = 99;
/** Empty, or this age and up, keeps today’s adult Dale–Chall baseline. */
export const ADULT_READER_AGE = 18;
export const ADULT_LONG_SENTENCE = 30;

export const READER_CATEGORIES = ["board", "early", "chapter", "middle", "ya", "adult"] as const;
export type ReaderCategory = (typeof READER_CATEGORIES)[number];

/**
 * A representative age for each fixed tier, used by tier-select UI instead
 * of a free-form age number. Each value must land back on its own category
 * through readerCategory() — covered by a test so the two can't drift apart.
 */
export const READER_TIER_AGE: Record<ReaderCategory, number> = {
  board: 3,
  early: 6,
  chapter: 8,
  middle: 12,
  ya: 16,
  adult: ADULT_READER_AGE
};

export type ReaderTuning = {
  age: number | undefined;
  category: ReaderCategory;
  /** Sentences at or above this word count count as long. */
  longSentence: number;
  /** Peak uncommon-word share for the vocabulary gauge. */
  rarePeak: number;
  /** Consecutive long sentences before pacing drops. Adult is 5. */
  longRun: number;
  /** Multiplier on the adverb/passive deduction. */
  directnessWeight: number;
  /**
   * Vocabulary score when the passage has no uncommon words.
   * Adult wants a mix (55). Younger readers score plain diction higher.
   */
  plainScore: number;
  /**
   * Also mark familiar words with this many syllables.
   * Empty keeps Dale–Chall only.
   */
  extraSyllables?: number;
};

/**
 * Bands for a prose tool. Picture-book illustration rules are not applied:
 * ages 4–7 use early-reader diction because StoryBook drafts chapters, not spreads.
 */
export function readerCategory(age: number | undefined): ReaderCategory {
  if (age === undefined || age >= ADULT_READER_AGE) return "adult";
  if (age <= 3) return "board";
  if (age <= 7) return "early";
  if (age <= 9) return "chapter";
  if (age <= 12) return "middle";
  return "ya";
}

export function kidlitReader(age: number | undefined): boolean {
  return readerCategory(age) !== "adult";
}

export function parseReaderAge(value: string): number | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const n = Number(trimmed);
  if (!Number.isInteger(n) || n < READER_AGE_MIN || n > READER_AGE_MAX) return undefined;
  return n;
}

/** Chapter value wins when the key is set, including an adult override. */
export function resolveReader(
  book: { reader_age?: number | undefined },
  chapter?: { reader_age?: number | undefined } | null
): number | undefined {
  if (chapter && Object.prototype.hasOwnProperty.call(chapter, "reader_age")) {
    return chapter.reader_age;
  }
  return book.reader_age;
}

export function applyReaderAge<T extends { reader_age?: number | undefined }>(item: T, age: number | undefined): T {
  const next = { ...item };
  if (age === undefined) delete next.reader_age;
  else next.reader_age = age;
  return next;
}

export function readerTuning(age: number | undefined): ReaderTuning {
  const category = readerCategory(age);
  if (category === "adult") {
    return {
      age,
      category,
      longSentence: ADULT_LONG_SENTENCE,
      rarePeak: 0.03,
      longRun: 5,
      directnessWeight: 1,
      plainScore: 55
    };
  }
  if (category === "ya") {
    return { age, category, longSentence: 24, rarePeak: 0.02, longRun: 4, directnessWeight: 1.2, plainScore: 70 };
  }
  if (category === "middle") {
    return { age, category, longSentence: 20, rarePeak: 0.015, longRun: 3, directnessWeight: 1.4, plainScore: 85 };
  }
  if (category === "chapter") {
    return {
      age,
      category,
      longSentence: 16,
      rarePeak: 0.012,
      longRun: 3,
      directnessWeight: 1.7,
      plainScore: 100,
      extraSyllables: 3
    };
  }
  if (category === "early") {
    return {
      age,
      category,
      longSentence: 12,
      rarePeak: 0.01,
      longRun: 3,
      directnessWeight: 2,
      plainScore: 100,
      extraSyllables: 3
    };
  }
  return {
    age,
    category,
    longSentence: 8,
    rarePeak: 0.008,
    longRun: 3,
    directnessWeight: 2.5,
    plainScore: 100,
    extraSyllables: 2
  };
}

export function formatReaderForPrompt(age: number | undefined, manuscriptAge?: number): string {
  if (age === undefined) return "";
  if (age >= ADULT_READER_AGE) {
    if (manuscriptAge !== undefined && manuscriptAge < ADULT_READER_AGE) {
      return "Reader:\nWrite for an adult reader. This chapter is not aimed at the younger manuscript reader. Prefer the adult baseline. Do not write down. This is a writing instruction, not canon.";
    }
    return "";
  }
  const category = readerCategory(age);
  const override =
    manuscriptAge !== undefined && manuscriptAge !== age
      ? "\nThis chapter is aimed at a different reader than the rest of the manuscript."
      : "";
  return [
    `Reader:\nThe intended reader is about ${age} years old (${categoryLabel(category)}).${override}`,
    craftForCategory(category),
    "The child protagonist—not a parent, teacher, or other authority—solves the central conflict. Adults may give tools or context. Themes emerge from the protagonist’s choices; do not add a moral speech.",
    "The protagonist is typically one to three years older than the reader.",
    "Prefer familiar words and shorter sentences so that reader can follow. Do not simplify the story, drop plot, soften Voice, or write down to them. Names and in-world terms stay. This is a writing instruction, not canon."
  ].join(" ");
}

export function formatReaderForReview(age: number | undefined): string {
  if (!kidlitReader(age)) return "";
  const category = readerCategory(age);
  return [
    `Reader (intended audience, about ${age}, ${categoryLabel(category)}): Flag diction or sentence complexity that would lose that reader.`,
    "Flag when an adult makes the decisive move, or when a moral is stated instead of earned.",
    "Do not flag age-appropriate darkness, and do not ask to bowdlerize the story.",
    "Use child_agency and lecture when they apply. Skip them if Reader is unset."
  ].join(" ");
}

function categoryLabel(category: ReaderCategory): string {
  if (category === "board") return "board book";
  if (category === "early") return "early reader";
  if (category === "chapter") return "chapter book";
  if (category === "middle") return "middle grade";
  if (category === "ya") return "YA";
  return "adult";
}

function craftForCategory(category: ReaderCategory): string {
  if (category === "board") {
    return "Very short. Rhythm and repetition are welcome. A handful of sentences can be the whole chapter.";
  }
  if (category === "early") {
    return "Short clauses. Prefer subject–verb–object. A new or hard word only when the sentence around it can carry the sense.";
  }
  if (category === "chapter") {
    return "Keep the chapter moving. Short chapters (about 500–1,000 words) are typical. A hard word only when context can carry it.";
  }
  if (category === "middle") {
    return "A layered plot and an interior arc are welcome.";
  }
  return "Accessible diction. Do not write down.";
}
