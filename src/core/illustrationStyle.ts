import { z } from "zod";
import { newId, nowIso } from "./ids";

export const ILLUSTRATION_STYLE_ORIGINS = ["builtin", "custom"] as const;
export type IllustrationStyleOrigin = (typeof ILLUSTRATION_STYLE_ORIGINS)[number];

export const IllustrationStyleExampleImageSchema = z.object({
  blob: z.instanceof(Blob),
  addedAt: z.string().min(1)
});
export type IllustrationStyleExampleImage = z.infer<typeof IllustrationStyleExampleImageSchema>;

export const IllustrationStyleSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  promptText: z.string(),
  genreTags: z.array(z.string().min(1)).default([]),
  origin: z.enum(ILLUSTRATION_STYLE_ORIGINS),
  exampleImage: IllustrationStyleExampleImageSchema.optional()
});
export type IllustrationStyle = z.infer<typeof IllustrationStyleSchema>;

export function parseIllustrationStyle(input: unknown): IllustrationStyle {
  return IllustrationStyleSchema.parse(input);
}

export function newIllustrationStyle(name: string, promptText: string, genreTags: string[]): IllustrationStyle {
  return {
    id: newId(),
    name: name.trim() || "Untitled style",
    promptText,
    genreTags: normalizeGenreTags(genreTags),
    origin: "custom"
  };
}

export function normalizeGenreTags(tags: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of tags) {
    const tag = raw.trim();
    if (!tag) continue;
    const key = tag.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(tag);
  }
  return out;
}

export function withExampleImage(style: IllustrationStyle, blob: Blob): IllustrationStyle {
  return { ...style, exampleImage: { blob, addedAt: nowIso() } };
}

export function withoutExampleImage(style: IllustrationStyle): IllustrationStyle {
  const next = { ...style };
  delete next.exampleImage;
  return next;
}

/** Every distinct tag across the library, in first-seen order, case-insensitive de-duped. */
export function allGenreTags(styles: IllustrationStyle[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const style of styles) {
    for (const tag of style.genreTags) {
      const key = tag.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(tag);
    }
  }
  return out;
}

export function searchIllustrationStyles(styles: IllustrationStyle[], query: string): IllustrationStyle[] {
  const q = query.trim().toLowerCase();
  if (!q) return styles;
  return styles.filter(
    (style) =>
      style.name.toLowerCase().includes(q) ||
      style.genreTags.some((tag) => tag.toLowerCase().includes(q)) ||
      style.promptText.toLowerCase().includes(q)
  );
}

export function stylesByGenreTag(styles: IllustrationStyle[]): { tag: string; styles: IllustrationStyle[] }[] {
  const tags = allGenreTags(styles);
  return tags.map((tag) => ({
    tag,
    styles: styles.filter((style) => style.genreTags.some((t) => t.toLowerCase() === tag.toLowerCase()))
  }));
}

/** Styles with no genre tag at all — still has to show up somewhere in the picker. */
export function untaggedStyles(styles: IllustrationStyle[]): IllustrationStyle[] {
  return styles.filter((style) => style.genreTags.length === 0);
}
