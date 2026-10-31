import { describe, expect, it } from "vitest";
import { parseMascot } from "../../src/ui/mascot";

/**
 * readMascot/setMascot/readMascotIntroSeen/dismissMascotIntro all read and
 * write the real `localStorage` directly (no injectable store, unlike
 * writingPrimer.ts) - this suite's "node" environment (vitest.config.ts)
 * has no DOM, so only the pure parsing logic is unit-tested here. The
 * localStorage-backed default-Kaamilla and intro-bubble behavior is
 * verified with Playwright instead, the pattern already used for this
 * app's other localStorage/DOM-driven UI in project_spec.md's changelog.
 */
describe("parseMascot", () => {
  it("only treats the three known characters as themselves", () => {
    expect(parseMascot("kaamilla")).toBe("kaamilla");
    expect(parseMascot("kaamy")).toBe("kaamy");
    expect(parseMascot("kaambot")).toBe("kaambot");
    expect(parseMascot("none")).toBe("none");
    expect(parseMascot("something-else")).toBe("none");
    expect(parseMascot(null)).toBe("none");
    expect(parseMascot(undefined)).toBe("none");
  });
});
