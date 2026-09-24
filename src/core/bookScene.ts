import { z } from "zod";
import type { Chapter } from "./BookSchema";
import { newId } from "./ids";
import { splitFlowParagraphs } from "./proseFlow";

/**
 * Where a chapter's scenes split, plus author-facing metadata for each.
 * Deliberately never stores prose — a split is a paragraph index into
 * `splitFlowParagraphs(chapter.prose)`, so `chapter.prose` stays the single
 * source of truth for the actual text and there is nothing to drift out of
 * sync when the author edits it. This is the resolved shape of
 * "Det enda stora arkitekturbeslutet" in roadmap-ideas.md: a Scene owns
 * only a split point plus a title/brief (writing instruction, not canon —
 * same status as `chapter.brief`). `location_ref`, `entity_refs` and
 * `story_time` stay off the scene in v1; they wait for a real reason to
 * consume them (spatial continuity, a scene-level Timeline).
 */
export const SceneMetaSchema = z.object({
  id: z.string().min(1),
  /** Paragraph index (0-based) where this scene begins. If any are stored, the first is always 0. */
  startParagraph: z.number().int().nonnegative(),
  /** Short label. The only scene field meant to ever cross the Sandbox boundary (SceneProjection). */
  title: z.string().min(1).optional(),
  /** Writing instruction for this scene only — not in-world canon. */
  brief: z.string().min(1).optional()
});
export type SceneMeta = z.infer<typeof SceneMetaSchema>;

/** A chapter's scene, always computed fresh — never a stored snapshot that could drift from `chapter.prose`. */
export type BookScene = {
  id: string;
  sequence_index: number;
  startParagraph: number;
  prose: string;
  title?: string;
  brief?: string;
};

/** Drops splits past the current paragraph count, dedupes, sorts, and forces the first split to 0. */
function normalizeSceneMetas(stored: SceneMeta[] | undefined, paragraphCount: number): SceneMeta[] {
  if (!stored || stored.length === 0) return [];
  const seen = new Set<number>();
  const clean = stored
    .filter((meta) => meta.startParagraph < paragraphCount)
    .filter((meta) => {
      if (seen.has(meta.startParagraph)) return false;
      seen.add(meta.startParagraph);
      return true;
    })
    .sort((a, b) => a.startParagraph - b.startParagraph);
  if (clean.length === 0) return [];
  if (clean[0]!.startParagraph !== 0) clean[0] = { ...clean[0]!, startParagraph: 0 };
  return clean;
}

/**
 * A chapter's scenes, always fresh. Until the author splits a chapter, it
 * has exactly one scene wrapping its own prose, computed on every call.
 */
export function chapterScenes(chapter: Chapter): BookScene[] {
  const paragraphs = splitFlowParagraphs(chapter.prose);
  const metas = normalizeSceneMetas(chapter.scenes, paragraphs.length);
  if (metas.length === 0) {
    return [{ id: `${chapter.id}:scene-1`, sequence_index: 0, startParagraph: 0, prose: chapter.prose }];
  }
  return metas.map((meta, index) => {
    const end = index + 1 < metas.length ? metas[index + 1]!.startParagraph : paragraphs.length;
    const prose = paragraphs.slice(meta.startParagraph, end).join("\n\n");
    return {
      id: meta.id,
      sequence_index: index,
      startParagraph: meta.startParagraph,
      prose,
      ...(meta.title ? { title: meta.title } : {}),
      ...(meta.brief ? { brief: meta.brief } : {})
    };
  });
}

/**
 * Splits the scene that owns `paragraphIndex` so a new scene begins there.
 * No-ops at the chapter's first paragraph, past its last paragraph, or on
 * a paragraph that already starts a scene.
 */
export function splitSceneAtParagraph(chapter: Chapter, paragraphIndex: number): SceneMeta[] {
  const paragraphs = splitFlowParagraphs(chapter.prose);
  const current = normalizeSceneMetas(chapter.scenes, paragraphs.length);
  if (paragraphIndex <= 0 || paragraphIndex >= paragraphs.length) return current;
  if (current.some((meta) => meta.startParagraph === paragraphIndex)) return current;
  const base = current.length > 0 ? current : [{ id: `${chapter.id}:scene-1`, startParagraph: 0 }];
  return [...base, { id: newId(), startParagraph: paragraphIndex }].sort(
    (a, b) => a.startParagraph - b.startParagraph
  );
}

/** Folds the scene right after `sceneId` into it, removing that split point. No-op on the last scene. */
export function mergeSceneWithNext(chapter: Chapter, sceneId: string): SceneMeta[] {
  const paragraphs = splitFlowParagraphs(chapter.prose);
  const current = normalizeSceneMetas(chapter.scenes, paragraphs.length);
  const index = current.findIndex((meta) => meta.id === sceneId);
  if (index === -1 || index === current.length - 1) return current;
  return current.filter((_, i) => i !== index + 1);
}

/**
 * Replaces one scene's prose in place, shifting every later scene's split
 * point by the resulting paragraph-count delta. Everything before and
 * after the scene's span is untouched. On the common single-scene chapter
 * (no stored splits), this simply replaces the whole chapter's prose.
 */
export function replaceSceneProse(
  chapter: Chapter,
  sceneId: string,
  nextSceneProse: string
): { prose: string; scenes: SceneMeta[] } {
  const paragraphs = splitFlowParagraphs(chapter.prose);
  const metas = normalizeSceneMetas(chapter.scenes, paragraphs.length);
  const list = metas.length > 0 ? metas : [{ id: `${chapter.id}:scene-1`, startParagraph: 0 }];
  const index = list.findIndex((meta) => meta.id === sceneId);
  if (index === -1) return { prose: chapter.prose, scenes: chapter.scenes ?? [] };

  const start = list[index]!.startParagraph;
  const end = index + 1 < list.length ? list[index + 1]!.startParagraph : paragraphs.length;
  const nextSceneParagraphs = splitFlowParagraphs(nextSceneProse);
  const nextParagraphs = [...paragraphs.slice(0, start), ...nextSceneParagraphs, ...paragraphs.slice(end)];
  const delta = nextSceneParagraphs.length - (end - start);
  const nextMetas = list.map((meta, i) => (i > index ? { ...meta, startParagraph: meta.startParagraph + delta } : meta));

  return { prose: nextParagraphs.join("\n\n"), scenes: metas.length > 0 ? nextMetas : [] };
}

/** Renames a scene or edits its brief. An empty/whitespace-only value clears that field. */
export function updateSceneMeta(
  chapter: Chapter,
  sceneId: string,
  patch: { title?: string; brief?: string }
): SceneMeta[] {
  const paragraphs = splitFlowParagraphs(chapter.prose);
  const current = normalizeSceneMetas(chapter.scenes, paragraphs.length);
  return current.map((meta) => {
    if (meta.id !== sceneId) return meta;
    const next = { ...meta };
    if ("title" in patch) {
      const trimmed = patch.title?.trim();
      if (trimmed) next.title = trimmed;
      else delete next.title;
    }
    if ("brief" in patch) {
      const trimmed = patch.brief?.trim();
      if (trimmed) next.brief = trimmed;
      else delete next.brief;
    }
    return next;
  });
}
