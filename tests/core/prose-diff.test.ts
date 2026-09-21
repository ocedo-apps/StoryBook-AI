import { describe, expect, it } from "vitest";
import {
  LIVE_HISTORY_ID,
  defaultCompareId,
  diffProse,
  joinHunks,
  tokenizeProse
} from "@core/proseDiff";

describe("tokenizeProse", () => {
  it("keeps words and the spaces between them", () => {
    expect(tokenizeProse("Emma locked the door.")).toEqual(["Emma", " ", "locked", " ", "the", " ", "door."]);
  });

  it("keeps newlines so paragraphs survive a join", () => {
    expect(tokenizeProse("One.\n\nTwo.").join("")).toBe("One.\n\nTwo.");
  });
});

describe("defaultCompareId", () => {
  it("pairs a revision with the live chapter", () => {
    expect(defaultCompareId("rev-1", ["rev-1", "rev-2"])).toBe(LIVE_HISTORY_ID);
  });

  it("pairs the live chapter with the newest revision", () => {
    expect(defaultCompareId(LIVE_HISTORY_ID, ["rev-1", "rev-2"])).toBe("rev-1");
  });

  it("has nothing to pair when the list is empty", () => {
    expect(defaultCompareId(LIVE_HISTORY_ID, [])).toBeNull();
  });
});

describe("diffProse", () => {
  it("marks a replaced word", () => {
    const hunks = diffProse("Emma locked the door.", "Emma locked the gate.");
    expect(joinHunks(hunks, "ins")).toBe("Emma locked the door.");
    expect(joinHunks(hunks, "del")).toBe("Emma locked the gate.");
    expect(hunks.filter((hunk) => hunk.type !== "eq").map((hunk) => ({ type: hunk.type, text: hunk.text }))).toEqual([
      { type: "del", text: "door." },
      { type: "ins", text: "gate." }
    ]);
  });

  it("marks an inserted word", () => {
    const hunks = diffProse("Emma locked the door.", "Emma locked the quay door.");
    expect(joinHunks(hunks, "del")).toBe("Emma locked the quay door.");
    expect(hunks.some((hunk) => hunk.type === "ins" && hunk.text.includes("quay"))).toBe(true);
  });

  it("marks a deleted word", () => {
    const hunks = diffProse("Emma locked the quay door.", "Emma locked the door.");
    expect(joinHunks(hunks, "ins")).toBe("Emma locked the quay door.");
    expect(hunks.some((hunk) => hunk.type === "del" && hunk.text.includes("quay"))).toBe(true);
  });

  it("returns one equal hunk when the texts match", () => {
    expect(diffProse("Same.", "Same.")).toEqual([{ type: "eq", text: "Same." }]);
    expect(diffProse("", "")).toEqual([]);
  });

  it("treats empty as a whole-side insert or delete", () => {
    expect(diffProse("", "Dawn.")).toEqual([{ type: "ins", text: "Dawn." }]);
    expect(diffProse("Dawn.", "")).toEqual([{ type: "del", text: "Dawn." }]);
  });

  it("reconstructs both sides from the hunks", () => {
    const from = "Dawn on the quay.\n\nThe stowaway waited.";
    const to = "Emma locked the door.\n\nThe stranger paid in salt.";
    const hunks = diffProse(from, to);
    expect(joinHunks(hunks, "ins")).toBe(from);
    expect(joinHunks(hunks, "del")).toBe(to);
  });
});
