import { z } from "zod";
import { POV_MODES, TENSES } from "./craft";
import { CharacterProfileSchema } from "./characterProfile";
import { EventProfileSchema } from "./eventProfile";
import { EntityKindSchema } from "./bibleGroups";
import { EntityMediaSchema, EntityPictureSchema } from "./entityMedia";
import { ILLUSTRATION_ORIENTATIONS } from "./illustrationStyle";
import { newId, nowIso, slugify } from "./ids";
import { NarrativeFactSchema, type NarrativeFact } from "./NarrativeFact";
import { ensureBrainstormNotes, NOTE_COLORS } from "./brainstormNotes";
import { parsePlotlineColor, PLOTLINE_COLORS } from "./plotlineColors";
import { ProofreadJobSchema } from "./proofreadSchema";
import { SceneMetaSchema } from "./bookScene";
import { ProseFormattingRangeSchema } from "./proseFormatting";
import { PlaceholderSchema } from "./placeholders";
import { DarlingSchema } from "./darlings";
import { MarkerConversionRuleSchema } from "./markerConversion";

export const PROSE_HISTORY_OPS = ["draft", "recast", "extend", "elaborate", "rewrite", "beat", "restore", "format", "darling"] as const;
export type ProseHistoryOp = (typeof PROSE_HISTORY_OPS)[number];

export const ProseRevisionSchema = z.object({
  id: z.string().min(1),
  at: z.string().min(1),
  op: z.enum(PROSE_HISTORY_OPS),
  prose: z.string()
});
export type ProseRevision = z.infer<typeof ProseRevisionSchema>;

export const ChapterSchema = z.object({
  id: z.string().min(1),
  title: z.string(),
  /** Writing instruction for this chapter — not in-world canon. */
  brief: z.string(),
  prose: z.string(),
  /**
   * Earlier chapter prose from model writes. Newest first.
   * Missing on older saves — default keeps IndexedDB loadable.
   */
  revisions: z.array(ProseRevisionSchema).default([]),
  sequence_index: z.number().int().nonnegative(),
  /** Optional camera for this chapter. Missing fields inherit the manuscript. */
  pov: z.enum(POV_MODES).optional(),
  tense: z.enum(TENSES).optional(),
  viewpoint: z.string().optional(),
  /** Optional register for this chapter. Missing inherits the manuscript Voice. */
  voice: z.string().optional(),
  /** Optional intended reader age for this chapter. Missing inherits the manuscript Reader. */
  reader_age: z.number().int().min(1).max(99).optional(),
  /**
   * Which chapter this one continues. Missing = previous in the list.
   * `"none"` opens a new strand. A chapter id jumps to that strand.
   * Missing on older saves — default keeps IndexedDB loadable.
   */
  continues_from: z.string().min(1).optional(),
  /**
   * When set, the chapter sits in Discarded chapters until restored or thrown away.
   * Missing on older saves — live chapters stay loadable.
   */
  discarded_at: z.string().min(1).optional(),
  /**
   * Illustration shown as a banner at the top of the chapter editor and
   * carried into Publish's HTML/ePub/PDF exports. Missing until the author
   * uploads one.
   */
  startImage: EntityPictureSchema.optional(),
  /**
   * Where this chapter's scenes split, plus per-scene title/brief. Missing/
   * empty until the author splits the chapter — chapterScenes() (bookScene.ts)
   * derives a single scene from `prose` in that case. Never stores prose
   * itself; a split is a paragraph index, so `prose` stays the one source
   * of truth for the text (see bookScene.ts for the full design decision).
   */
  scenes: z.array(SceneMetaSchema).optional(),
  /**
   * Free-text "when this happens in-world" label — a writing note, not a
   * date. Chapter-level in v1 since a chapter is still exactly one scene
   * (bookScene.ts); moves onto the scene itself once real scene-splitting
   * exists. Missing on older saves.
   */
  story_time: z.string().min(1).optional(),
  /**
   * Sort key for the Timeline's story-clock ordering, independent of
   * `sequence_index` (manuscript/reading order). Missing = falls back to
   * `sequence_index`, so an untouched book's timeline matches its
   * manuscript order exactly. Only ever written by timeline.ts's
   * moveStoryTimeOrder() so it always stays a consistent 0..N-1 ranking
   * across live chapters — never patched ad hoc via updateChapter().
   */
  story_time_order: z.number().int().nonnegative().optional(),
  /**
   * Which of the book's plotlines run through this chapter. Chapter-level
   * in v1, same reasoning as story_time — a chapter is still one scene.
   * Missing/empty on older saves and untouched chapters.
   */
  plotline_ids: z.array(z.string().min(1)).optional(),
  /**
   * Bold/Italic/Underline ranges over `prose`'s own character offsets —
   * display-only formatting, never spliced into the text itself, so the
   * model, extraction, proofreading, and word count all keep reading
   * `prose` exactly as before. Missing/empty on older saves and chapters
   * with no formatting applied. Cleared (not migrated) whenever `prose` is
   * regenerated wholesale (Draft, Recast, restoring an older revision) —
   * old positions would no longer line up with the new text.
   */
  formatting: z.array(ProseFormattingRangeSchema).optional(),
  /**
   * Point markers the author drops mid-draft without breaking flow — "what
   * was this character's last name again?" — a sticky note at a text
   * offset, display-only like `formatting` and for the same reason: the
   * model, extraction, proofreading, and word count all keep reading
   * `prose` exactly as before. Missing/empty on older saves and chapters
   * with none. Cleared (not migrated) whenever `prose` is regenerated
   * wholesale (Draft, Recast, restoring an older revision) — same policy as
   * `formatting`, for the same reason: old positions no longer line up
   * with the new text.
   */
  placeholders: z.array(PlaceholderSchema).optional(),
  /**
   * Cut passages kept on purpose — "kill your darlings" but keep the
   * bodies. Point-anchored the same way `placeholders` is, so a darling
   * restores to the spot it was cut from through ordinary edits elsewhere.
   * Unlike `formatting`/`placeholders`, NOT cleared when `prose` is
   * regenerated wholesale (Recast, restoring an older revision): the
   * author's actual cut text would be lost, not just a stale position, so
   * a darling instead keeps its (now best-effort) spot, clamped to the new
   * prose's length when restored. Missing/empty on older saves and
   * chapters with none.
   */
  darlings: z.array(DarlingSchema).optional()
});
export type Chapter = z.infer<typeof ChapterSchema>;

export const PlotlineSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  color: z.preprocess((value) => parsePlotlineColor(value), z.enum(PLOTLINE_COLORS)),
  /** Optional, shown as a tooltip over the thread's name and its bars in the Timeline/Plotlines board — never required, missing on every save before this field existed. */
  description: z.string().optional(),
  /** When true, this thread is left out of the Draft/Extend/Elaborate/Beat prompts (generateProse.ts's formatPlotlinesForPrompt) even for a chapter tagged against it. Missing/false = included, the default for every thread until the author opts one out. */
  hide_from_ai: z.boolean().optional()
});
export type Plotline = z.infer<typeof PlotlineSchema>;

export const WritingGoalSchema = z.object({
  targetWords: z.number().int().positive(),
  /** ISO date, e.g. "2026-12-31". */
  deadline: z.string().min(1),
  daysPerWeek: z.number().int().min(1).max(7)
});
export type WritingGoal = z.infer<typeof WritingGoalSchema>;

export const BrainstormNoteSchema = z.object({
  id: z.string().min(1),
  text: z.string(),
  x: z.number(),
  y: z.number(),
  color: z.enum(NOTE_COLORS).default("paper"),
  send_index: z.number().int().nonnegative().optional()
});

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
   * Active illustration-style prompt text. Filled by picking a library entry, freely
   * editable afterward, independent of the library once set. Missing on older saves.
   */
  illustration_style: z.string().default(""),
  /**
   * Aspect ratio to hint into generated illustration prompts. Missing on older
   * saves — landscape matches the library's own example images.
   */
  illustration_orientation: z.enum(ILLUSTRATION_ORIENTATIONS).default("landscape"),
  /**
   * Language the sentences are written in. Writing instruction, not a world fact.
   * Missing or empty on older saves — Draft infers from the manuscript.
   */
  prose_language: z.string().default(""),
  /**
   * Intended reader age. Writing instruction, not a world fact.
   * Missing on older saves — empty keeps the adult Dale–Chall baseline.
   */
  reader_age: z.number().int().min(1).max(99).optional(),
  /**
   * Private scratch before (and beside) the map. Draft never reads this.
   * Missing on older saves — default keeps IndexedDB loadable.
   */
  brainstorm: z.string().default(""),
  /**
   * Free notes on the Brainstorm surface. Missing on older saves.
   * The running `brainstorm` string stays in sync for prompts and find.
   */
  brainstorm_notes: z.array(BrainstormNoteSchema).default([]),
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
   * Event card fields (where it happened, who was there) — same
   * side-table pattern as `profiles`. Missing on older saves.
   */
  event_profiles: z.array(EventProfileSchema).default([]),
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
  /**
   * Filters locked Story Bible facts whose origin is lore import by
   * relevance to the chapter being drafted (roadmap-ideas.md #38),
   * instead of including every one of them unconditionally the way
   * chapter/interview-origin facts always are. Off by default — existing
   * books keep today's "everything always included" behavior; an author
   * with a large, lore-heavy Story Bible can turn it on. Missing on
   * older saves.
   */
  filter_lore_by_relevance: z.boolean().default(false),
  /**
   * Named threads (plotlines) an author can mark chapters against, shown
   * as a chapter × plotline matrix. Missing on older saves.
   */
  plotlines: z.array(PlotlineSchema).default([]),
  /**
   * Chosen outline method id (roadmap-ideas.md #13), e.g. "snowflake".
   * Purely a UI choice — a method only ever writes into Synopsis or
   * Plotlines, never its own data. Missing means no method chosen.
   */
  development_method: z.string().optional(),
  /**
   * Last-pass Review job over the manuscript. Missing on older saves.
   */
  proofread: ProofreadJobSchema.optional(),
  /**
   * Optional author-set word target and deadline. Missing means no goal —
   * no pace UI shown. Missing on older saves.
   */
  goal: WritingGoalSchema.optional(),
  /**
   * Author-defined rules for "Convert markers to formatting" (Settings).
   * Missing on older saves and on a book that's never opened the tool —
   * the Settings panel shows the two starter examples (`*`/`**`) in that
   * case without writing them here, so a book stays untouched until the
   * author actually edits, adds, or removes a rule.
   */
  marker_conversion_rules: z.array(MarkerConversionRuleSchema).optional(),
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
    chapterCount: sortedChapters(book).length,
    factCount: book.facts.filter((fact) => fact.superseded_by === undefined && fact.status === "locked")
      .length,
    updated_at: book.updated_at
  };
}

export function parseBook(input: unknown): Book {
  return ensureBrainstormNotes(BookSchema.parse(input));
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
    illustration_style: "",
    illustration_orientation: "landscape",
    prose_language: "",
    brainstorm: "",
    brainstorm_notes: [],
    synopsis: "",
    chapters: [chapter],
    facts: [],
    media: [],
    profiles: [],
    event_profiles: [],
    hidden_entities: [],
    entity_kinds: [],
    filter_lore_by_relevance: false,
    plotlines: [],
    created_at: timestamp,
    updated_at: timestamp
  };
}

export type EditorSurface =
  | "settings"
  | "brainstorm"
  | "synopsis"
  | "chapter"
  | "ask"
  | "timeline"
  | "plotlines"
  | "method"
  | "guide"
  | "handbook"
  | "darlings";

/**
 * A blank manuscript opens on the Handbook — a new author has nothing to
 * configure yet, but everything to learn. Brainstorm once notes exist.
 * A book with a synopsis but no prose opens on the map. Once a chapter
 * has prose, reopen on the chapter. The Handbook (not the old anchor-driven
 * Guide) is the deliberate, sequential read for a newcomer — the Guide is
 * kept as the reference material behind the in-context "?" buttons.
 */
export function openingSurface(book: Book): EditorSurface {
  if (sortedChapters(book).some((chapter) => chapter.prose.trim().length > 0)) return "chapter";
  if (book.synopsis.trim().length > 0) return "synopsis";
  const notes = book.brainstorm_notes ?? [];
  if (book.brainstorm.trim() || notes.some((note) => note.text.trim())) return "brainstorm";
  return "handbook";
}

export function createChapter(sequence_index: number, title = ""): Chapter {
  return {
    id: newId(),
    title: title.trim() || `Chapter ${sequence_index + 1}`,
    brief: "",
    prose: "",
    revisions: [],
    sequence_index
  };
}

export function touch(book: Book, patch: Partial<Book>): Book {
  return { ...book, ...patch, updated_at: nowIso() };
}

export function isLiveChapter(chapter: Chapter): boolean {
  return chapter.discarded_at === undefined;
}

export function sortedChapters(book: Book): Chapter[] {
  return book.chapters.filter(isLiveChapter).sort((a, b) => a.sequence_index - b.sequence_index);
}

export function discardedChapters(book: Book): Chapter[] {
  return book.chapters
    .filter((chapter) => chapter.discarded_at !== undefined)
    .sort((a, b) => (b.discarded_at ?? "").localeCompare(a.discarded_at ?? ""));
}

function reindexLive(chapters: Chapter[]): Chapter[] {
  let index = 0;
  const nextIndex = new Map<string, number>();
  for (const chapter of [...chapters].filter(isLiveChapter).sort((a, b) => a.sequence_index - b.sequence_index)) {
    nextIndex.set(chapter.id, index);
    index += 1;
  }
  return chapters.map((chapter) => {
    const sequence_index = nextIndex.get(chapter.id);
    if (sequence_index === undefined || chapter.sequence_index === sequence_index) return chapter;
    return { ...chapter, sequence_index };
  });
}

function clearPointersTo(chapters: Chapter[], chapterId: string): Chapter[] {
  return chapters.map((chapter) => {
    if (chapter.continues_from !== chapterId) return chapter;
    const next: Chapter = { ...chapter };
    delete next.continues_from;
    return next;
  });
}

export function addChapter(book: Book): Book {
  const nextIndex = sortedChapters(book).length;
  return touch(book, { chapters: [...book.chapters, createChapter(nextIndex)] });
}

export function updateChapter(
  book: Book,
  chapterId: string,
  patch: Partial<Omit<Chapter, "id" | "sequence_index" | "discarded_at" | "story_time_order">>
): Book {
  return touch(book, {
    chapters: book.chapters.map((chapter) => {
      if (chapter.id !== chapterId) return chapter;
      const next: Chapter = { ...chapter, ...patch };
      for (const key of ["pov", "tense", "viewpoint", "continues_from", "voice", "reader_age"] as const) {
        if (Object.prototype.hasOwnProperty.call(patch, key) && patch[key] === undefined) {
          delete next[key];
        }
      }
      return next;
    })
  });
}

export function discardChapter(book: Book, chapterId: string): Book {
  const live = sortedChapters(book);
  if (live.length <= 1 || !live.some((chapter) => chapter.id === chapterId)) return book;
  const stamped = nowIso();
  const chapters = clearPointersTo(
    book.chapters.map((chapter) => {
      if (chapter.id !== chapterId) return chapter;
      const next: Chapter = { ...chapter, discarded_at: stamped };
      delete next.continues_from;
      return next;
    }),
    chapterId
  );
  return touch(book, { chapters: reindexLive(chapters) });
}

export function restoreChapter(book: Book, chapterId: string): Book {
  const target = book.chapters.find((chapter) => chapter.id === chapterId);
  if (!target || target.discarded_at === undefined) return book;
  const nextIndex = sortedChapters(book).length;
  const chapters = book.chapters.map((chapter) => {
    if (chapter.id !== chapterId) return chapter;
    const next: Chapter = { ...chapter, sequence_index: nextIndex };
    delete next.discarded_at;
    return next;
  });
  return touch(book, { chapters });
}

export function removeChapter(book: Book, chapterId: string): Book {
  const target = book.chapters.find((chapter) => chapter.id === chapterId);
  if (!target) return book;
  if (isLiveChapter(target) && sortedChapters(book).length <= 1) return book;
  const remaining = clearPointersTo(
    book.chapters.filter((chapter) => chapter.id !== chapterId),
    chapterId
  );
  return touch(book, { chapters: reindexLive(remaining) });
}

export function entityRefFromLabel(label: string): string {
  return slugify(label);
}

export function setWritingGoal(book: Book, goal: WritingGoal): Book {
  return touch(book, { goal });
}

export function clearWritingGoal(book: Book): Book {
  const next = { ...book };
  delete next.goal;
  return touch(next, {});
}
