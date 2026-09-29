import { describe, expect, it } from "vitest";
import { splitLoreArticles } from "@core/loreImport";

describe("splitLoreArticles", () => {
  it("returns a single untitled article when no headers are present", () => {
    expect(splitLoreArticles("Just some plain notes about the world.")).toEqual([
      { title: "", text: "Just some plain notes about the world." }
    ]);
  });

  it("returns nothing for empty or whitespace-only input", () => {
    expect(splitLoreArticles("")).toEqual([]);
    expect(splitLoreArticles("   \n\n  ")).toEqual([]);
  });

  it("splits on Markdown headers, using the header text as the title", () => {
    const raw = "# The Lighthouse\nStands on the cliff above the harbor.\n\n# Dr. James Mortimer\nA country doctor.";
    expect(splitLoreArticles(raw)).toEqual([
      { title: "The Lighthouse", text: "Stands on the cliff above the harbor." },
      { title: "Dr. James Mortimer", text: "A country doctor." }
    ]);
  });

  it("supports any header level 1-6 and mixed levels in the same document", () => {
    const raw = "## The Order\nA sworn society.\n\n### Elias\nTheir leader.";
    expect(splitLoreArticles(raw)).toEqual([
      { title: "The Order", text: "A sworn society." },
      { title: "Elias", text: "Their leader." }
    ]);
  });

  it("keeps text before the first header as its own untitled article, not dropped", () => {
    const raw = "General notes before anything is titled.\n\n# Nora\nA journalist.";
    expect(splitLoreArticles(raw)).toEqual([
      { title: "", text: "General notes before anything is titled." },
      { title: "Nora", text: "A journalist." }
    ]);
  });

  it("skips a header with no body text under it", () => {
    const raw = "# Empty Section\n\n# Nora\nA journalist.";
    expect(splitLoreArticles(raw)).toEqual([{ title: "Nora", text: "A journalist." }]);
  });

  it("normalizes Windows line endings before splitting", () => {
    const raw = "# Nora\r\nA journalist.\r\n\r\n# Elias\r\nHer brother.";
    expect(splitLoreArticles(raw)).toEqual([
      { title: "Nora", text: "A journalist." },
      { title: "Elias", text: "Her brother." }
    ]);
  });
});
