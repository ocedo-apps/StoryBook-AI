import { z } from "zod";

export const PROOFREAD_STAGES = ["grammar", "scenes", "style", "age", "continuity", "setups", "facts"] as const;
export type ProofreadStage = (typeof PROOFREAD_STAGES)[number];

export const PROOFREAD_STATUSES = ["running", "paused", "done", "error"] as const;
export type ProofreadStatus = (typeof PROOFREAD_STATUSES)[number];

export const SceneQueueItemSchema = z.object({
  chapterId: z.string().min(1),
  paragraphIndex: z.number().int().nonnegative(),
  chapterIdB: z.string().min(1),
  paragraphIndexB: z.number().int().nonnegative()
});
export type SceneQueueItem = z.infer<typeof SceneQueueItemSchema>;

export const ProofreadFlagSchema = z.object({
  id: z.string().min(1),
  stage: z.enum(PROOFREAD_STAGES),
  chapterId: z.string().min(1),
  chapterIdB: z.string().min(1).optional(),
  quote: z.string(),
  quoteB: z.string().optional(),
  observation: z.string(),
  suggestion: z.string().optional(),
  stale: z.boolean().optional(),
  /** Set only for an "age"-stage flag about profanity, violence, or explicit content — not a craft note. */
  category: z.literal("content").optional()
});
export type ProofreadFlag = z.infer<typeof ProofreadFlagSchema>;

export const ProofreadJobSchema = z.object({
  id: z.string().min(1),
  started_at: z.string().min(1),
  updated_at: z.string().min(1),
  status: z.enum(PROOFREAD_STATUSES),
  stage: z.enum(["grammar", "scenes", "style", "age", "continuity", "setups", "facts", "done"]),
  grammarDone: z.array(z.string()).default([]),
  scenePairsTotal: z.number().int().nonnegative().default(0),
  scenePairsDone: z.number().int().nonnegative().default(0),
  sceneQueue: z.array(SceneQueueItemSchema).default([]),
  sceneQueueIndex: z.number().int().nonnegative().default(0),
  styleDone: z.boolean().default(false),
  ageDone: z.boolean().default(false),
  /** Missing on older saves — treated as not-yet-run, same as the other *Done flags. */
  continuityDone: z.boolean().default(false),
  /** Missing on older saves — treated as not-yet-run, same as the other *Done flags. */
  setupsDone: z.boolean().default(false),
  /** Chapter ids the facts stage has already extracted from. Missing on older saves. */
  factsDone: z.array(z.string()).default([]),
  detail: z.string().default(""),
  flags: z.array(ProofreadFlagSchema).default([]),
  ageReport: z.string().optional(),
  craftNotes: z.array(z.string()).default([]),
  chapterHashes: z.record(z.string()).default({}),
  /**
   * Which stages this run actually does work in — missing (older saves) or
   * unset means all of them, today's behavior. A disabled stage is still
   * walked through in order (so `stage` and the progress bar stay
   * meaningful) but does no work and flags nothing.
   */
  enabledStages: z.array(z.enum(PROOFREAD_STAGES)).default([...PROOFREAD_STAGES]),
  /**
   * Limits the two stages whose cost scales with chapter count — grammar
   * and facts — to just this chapter. The other stages are inherently
   * cross-chapter (they compare chapters to each other) and always look at
   * the whole live manuscript regardless of this. Missing/unset means the
   * whole manuscript, today's behavior.
   */
  scopeChapterId: z.string().min(1).optional()
});
export type ProofreadJob = z.infer<typeof ProofreadJobSchema>;
