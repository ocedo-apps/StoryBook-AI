import { z } from "zod";
import type { Chapter } from "./BookSchema";

/**
 * A chapter's internal scene beats. v1 is deliberately minimal — no big
 * bang (roadmap-ideas.md #5): title, pov, entity_refs etc. grow onto this
 * shape gradually, once real scene-splitting UI exists.
 */
export const SceneSchema = z.object({
  id: z.string().min(1),
  sequence_index: z.number().int().nonnegative(),
  prose: z.string()
});
export type BookScene = z.infer<typeof SceneSchema>;

/**
 * A chapter's scenes, always fresh. Until scene-splitting ships, a chapter
 * has exactly one scene wrapping its own prose, computed on every call —
 * never a stored snapshot that could drift from an edit to chapter.prose.
 */
export function chapterScenes(chapter: Chapter): BookScene[] {
  if (chapter.scenes && chapter.scenes.length > 0) return chapter.scenes;
  return [{ id: `${chapter.id}:scene-1`, sequence_index: 0, prose: chapter.prose }];
}
