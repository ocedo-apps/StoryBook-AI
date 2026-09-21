import { describe, expect, it } from "vitest";
import { en } from "../../src/ui/i18n/en";
import { insertRewriteChip, rewriteChipPrompt } from "../../src/ui/rewriteChips";

describe("insertRewriteChip", () => {
  it("fills an empty prompt", () => {
    expect(insertRewriteChip("", "Stay in Emma’s perception.")).toBe("Stay in Emma’s perception.");
  });

  it("appends a second chip as its own paragraph", () => {
    expect(insertRewriteChip("Stay in Emma’s perception.", "Recast passives as active.")).toBe(
      "Stay in Emma’s perception.\n\nRecast passives as active."
    );
  });

  it("does not paste the same chip twice", () => {
    const once = insertRewriteChip("", "Break the long sentence.");
    expect(insertRewriteChip(once, "Break the long sentence.")).toBe(once);
  });
});

describe("rewriteChipPrompt", () => {
  it("names the viewpoint when the camera needs one", () => {
    expect(rewriteChipPrompt(en, "povLeak", "Emma")).toContain("Emma");
    expect(rewriteChipPrompt(en, "povLeak", "Emma")).not.toContain("{who}");
  });

  it("falls back to the camera when no one is named", () => {
    expect(rewriteChipPrompt(en, "povLeak", "")).toBe(en.canvas.rewriteChips.povLeakCamera);
  });

  it("asks for stronger verbs, not a cut of adjectives", () => {
    expect(rewriteChipPrompt(en, "strongerVerbs", "")).toContain("manner-adverbs");
    expect(rewriteChipPrompt(en, "strongerVerbs", "")).not.toMatch(/adjective/i);
  });
});
