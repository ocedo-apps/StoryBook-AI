import { z } from "zod";
import { POV_MODES, TENSES } from "./craft";
import { CharacterProfileSchema } from "./characterProfile";
import { EntityKindSchema } from "./bibleGroups";
import { EntityMediaSchema } from "./entityMedia";
import { newId, nowIso, slugify } from "./ids";
import { NarrativeFactSchema, type NarrativeFact } from "./NarrativeFact";

export const ChapterSchema = z.object({
  id: z.string().min(1),
  title: z.string(),
  /** Writing instruction for this chapter — not in-world canon. */
  brief: z.string(),
  prose: z.string(),
  sequence_index: z.number().int().nonnegative(),
  /** Optional camera for this chapter. Missing fields inherit the manuscript. */
  pov: z.enum(POV_MODES).optional(),
  tense: z.enum(TENSES).optional(),
  viewpoint: z.string().optional(),
  /**
   * Which chapter this one continues. Missing = previous in the list.
   * `"none"` opens a new strand. A chapter id jumps to that strand.
   * Missing on older saves — default keeps IndexedDB loadable.
   */
  continues_from: z.string().min(1).optional()
});
export type Chapter = z.infer<typeof ChapterSchema>;

export const BookSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  /** Camera for drafted prose. Writing instruction, not a world fact. */
  pov: z.enum(POV_MODES).default("limited"),
  /** Verb tense for drafted prose. Writing instruction, not a world fact. */
  tense: z.enum(TENSES).default("past"),
  /** Named viewpoint for limited / first person. Empty until the author chooses. */
  viewpoint: z.string().default(""),
  /** How the prose should sound. Writing instruction, not a world fact. */
  voice: z.string(),
  /**
   * Private scratch before (and beside) the map. Draft never reads this.
   * Missing on older saves — default keeps IndexedDB loadable.
   */
  brainstorm: z.string().default(""),
  /**
   * Short-form story. A writing map for Draft, not locked canon.
   * Missing on older saves — default keeps IndexedDB loadable.
   */
  synopsis: z.string().default(""),
  chapters: z.array(ChapterSchema),
  facts: z.array(NarrativeFactSchema),
  /**
   * Portraits and place pictures for later Sandbox export.
   * Missing on older saves — default keeps IndexedDB loadable.
   * Writing prompts never read this.
   */
  media: z.array(EntityMediaSchema).default([]),
  /**
   * Character card fields (pronoun, age, looks, personality, tags).
   * Missing on older saves — default keeps IndexedDB loadable.
   * Tags are shelf/export only. The other fields go into Draft.
   */
  profiles: z.array(CharacterProfileSchema).default([]),
  /**
   * Entity refs the model must not see. The author still sees the cards.
   * Missing on older saves — default keeps IndexedDB loadable.
   */
  hidden_entities: z.array(z.string().min(1)).default([]),
  /**
   * Shelf overrides when Identity was the first lock (a ship, an order).
   * Missing on older saves — default keeps IndexedDB loadable.
   */
  entity_kinds: z.array(EntityKindSchema).default([]),
  created_at: z.string().min(1),
  updated_at: z.string().min(1)
});
export type Book = z.infer<typeof BookSchema>;

export const BookSummarySchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  chapterCount: z.number().int().nonnegative(),
  factCount: z.number().int().nonnegative(),
  updated_at: z.string().min(1)
});
export type BookSummary = z.infer<typeof BookSummarySchema>;

export function summarizeBook(book: Book): BookSummary {
  return {
    id: book.id,
    title: book.title,
    chapterCount: book.chapters.length,
    factCount: book.facts.filter((fact) => fact.superseded_by === undefined && fact.status === "locked")
      .length,
    updated_at: book.updated_at
  };
}

export function parseBook(input: unknown): Book {
  return BookSchema.parse(input);
}

export function createBook(title: string): Book {
  const trimmed = title.trim() || "Untitled manuscript";
  const timestamp = nowIso();
  const chapter = createChapter(0, "Chapter 1");
  return {
    id: newId(),
    title: trimmed,
    pov: "limited",
    tense: "past",
    viewpoint: "",
    voice: "",
    brainstorm: "",
    synopsis: "",
    chapters: [chapter],
    facts: [],
    media: [],
    profiles: [],
    hidden_entities: [],
    entity_kinds: [],
    created_at: timestamp,
    updated_at: timestamp
  };
}

export type EditorSurface = "brainstorm" | "synopsis" | "chapter";

/**
 * New manuscripts open on brainstorm. A book with a synopsis but no prose
 * opens on the map. Once a chapter has prose, reopen on the chapter.
 */
export function openingSurface(book: Book): EditorSurface {
  if (book.chapters.some((chapter) => chapter.prose.trim().length > 0)) return "chapter";
  if (book.synopsis.trim().length > 0) return "synopsis";
  return "brainstorm";
}

export function createChapter(sequence_index: number, title = ""): Chapter {
  return {
    id: newId(),
    title: title.trim() || `Chapter ${sequence_index + 1}`,
    brief: "",
    prose: "",
    sequence_index
  };
}

export function touch(book: Book, patch: Partial<Book>): Book {
  return { ...book, ...patch, updated_at: nowIso() };
}

export function addChapter(book: Book): Book {
  const nextIndex = book.chapters.reduce((max, chapter) => Math.max(max, chapter.sequence_index), -1) + 1;
  return touch(book, { chapters: [...book.chapters, createChapter(nextIndex)] });
}

export function updateChapter(book: Book, chapterId: string, patch: Partial<Omit<Chapter, "id" | "sequence_index">>): Book {
  return touch(book, {
    chapters: book.chapters.map((chapter) => {
      if (chapter.id !== chapterId) return chapter;
      const next: Chapter = { ...chapter, ...patch };
      for (const key of ["pov", "tense", "viewpoint", "continues_from"] as const) {
        if (Object.prototype.hasOwnProperty.call(patch, key) && patch[key] === undefined) {
          delete next[key];
        }
      }
      return next;
    })
  });
}

export function removeChapter(book: Book, chapterId: string): Book {
  if (book.chapters.length <= 1) return book;
  const remaining = book.chapters
    .filter((chapter) => chapter.id !== chapterId)
    .map((chapter, index) => {
      const next: Chapter = { ...chapter, sequence_index: index };
      if (next.continues_from === chapterId) delete next.continues_from;
      return next;
    });
  return touch(book, { chapters: remaining });
}

export function sortedChapters(book: Book): Chapter[] {
  return [...book.chapters].sort((a, b) => a.sequence_index - b.sequence_index);
}

export function entityRefFromLabel(label: string): string {
  return slugify(label);
}
