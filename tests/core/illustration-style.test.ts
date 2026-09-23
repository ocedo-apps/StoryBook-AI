import { describe, expect, it } from "vitest";
import {
  allGenreTags,
  findStyleByPromptText,
  newIllustrationStyle,
  normalizeGenreTags,
  parseIllustrationStyle,
  searchIllustrationStyles,
  stylesByGenreTag,
  untaggedStyles,
  withExampleImage,
  withoutExampleImage,
  type IllustrationStyle
} from "@core/illustrationStyle";
import { BUILTIN_ILLUSTRATION_STYLES } from "@core/illustrationStyleSeeds";

describe("newIllustrationStyle", () => {
  it("creates a custom style with de-duped, trimmed genre tags", () => {
    const style = newIllustrationStyle(" Noir look ", "gritty, high contrast", ["Noir", " noir ", "Crime"]);
    expect(style.origin).toBe("custom");
    expect(style.name).toBe("Noir look");
    expect(style.genreTags).toEqual(["Noir", "Crime"]);
    expect(style.exampleImage).toBeUndefined();
  });

  it("falls back to a name when given only whitespace", () => {
    expect(newIllustrationStyle("   ", "text", []).name).toBe("Untitled style");
  });
});

describe("example image", () => {
  const base: IllustrationStyle = newIllustrationStyle("Test", "text", []);

  it("attaches and detaches without touching other fields", () => {
    const blob = new Blob(["fake"], { type: "image/png" });
    const withImage = withExampleImage(base, blob);
    expect(withImage.exampleImage?.blob).toBe(blob);
    expect(withImage.exampleImage?.addedAt).toBeTruthy();
    expect(withImage.name).toBe(base.name);

    const withoutImage = withoutExampleImage(withImage);
    expect(withoutImage.exampleImage).toBeUndefined();
    expect("exampleImage" in withoutImage).toBe(false);
  });

  it("replaces rather than accumulating on re-upload", () => {
    const first = withExampleImage(base, new Blob(["one"]));
    const second = withExampleImage(first, new Blob(["two"]));
    expect(second.exampleImage?.blob).not.toBe(first.exampleImage?.blob);
  });
});

describe("parseIllustrationStyle", () => {
  it("accepts a style with no exampleImage, unchanged behavior for existing styles", () => {
    const parsed = parseIllustrationStyle({
      id: "a",
      name: "Plain",
      promptText: "text",
      genreTags: [],
      origin: "custom"
    });
    expect(parsed.exampleImage).toBeUndefined();
  });

  it("accepts a style with an exampleImage blob", () => {
    const parsed = parseIllustrationStyle({
      id: "a",
      name: "Plain",
      promptText: "text",
      genreTags: [],
      origin: "custom",
      exampleImage: { blob: new Blob(["x"]), addedAt: "2026-01-01T00:00:00.000Z" }
    });
    expect(parsed.exampleImage?.addedAt).toBe("2026-01-01T00:00:00.000Z");
  });
});

describe("search and grouping", () => {
  const styles = BUILTIN_ILLUSTRATION_STYLES;

  it("searches by name, tag, or prompt text, case-insensitively", () => {
    expect(searchIllustrationStyles(styles, "gothic").map((s) => s.id)).toContain("builtin-horror-1");
    expect(searchIllustrationStyles(styles, "CYBERPUNK").map((s) => s.id)).toEqual(["builtin-scifi-1"]);
    expect(searchIllustrationStyles(styles, "")).toHaveLength(styles.length);
  });

  it("groups styles by genre tag, one bucket per distinct tag", () => {
    const groups = stylesByGenreTag(styles);
    expect(groups.map((g) => g.tag)).toEqual([
      "Children's book",
      "Fantasy",
      "Sci-fi",
      "Horror/Gothic",
      "Literary/Realistic",
      "Historical/Vintage",
      "Detective/Noir",
      "Adventure",
      "Romance"
    ]);
    for (const group of groups) expect(group.styles.length).toBeGreaterThan(0);
  });

  it("lists all distinct tags across the library", () => {
    expect(allGenreTags(styles)).toHaveLength(9);
  });

  it("finds untagged styles so they still surface somewhere in the picker", () => {
    const untagged = newIllustrationStyle("No tag", "text", []);
    expect(untaggedStyles([...styles, untagged])).toEqual([untagged]);
    expect(untaggedStyles(styles)).toEqual([]);
  });
});

describe("findStyleByPromptText", () => {
  const styles = BUILTIN_ILLUSTRATION_STYLES;

  it("finds the style whose promptText exactly matches, ignoring surrounding whitespace", () => {
    const target = styles[0]!;
    expect(findStyleByPromptText(styles, target.promptText)?.id).toBe(target.id);
    expect(findStyleByPromptText(styles, `  ${target.promptText}  `)?.id).toBe(target.id);
  });

  it("returns undefined for empty text or text matching no style", () => {
    expect(findStyleByPromptText(styles, "")).toBeUndefined();
    expect(findStyleByPromptText(styles, "   ")).toBeUndefined();
    expect(findStyleByPromptText(styles, "a freehand prompt nobody saved")).toBeUndefined();
  });
});
