import { describe, expect, it } from "vitest";
import { estimateTokens, totalEstimatedTokens, type PromptDebugEntry } from "@ui/promptDebug";

describe("estimateTokens", () => {
  it("estimates roughly one token per four characters", () => {
    expect(estimateTokens("abcd")).toBe(1);
    expect(estimateTokens("a".repeat(400))).toBe(100);
  });

  it("never returns zero for non-empty text", () => {
    expect(estimateTokens("a")).toBeGreaterThanOrEqual(1);
  });

  it("returns zero for empty text", () => {
    expect(estimateTokens("")).toBe(0);
  });
});

describe("totalEstimatedTokens", () => {
  it("sums the estimate across every message in the entry", () => {
    const entry: PromptDebugEntry = {
      operation: "draft",
      model: "stheno-custom:latest",
      messages: [
        { role: "system", content: "a".repeat(400) },
        { role: "user", content: "a".repeat(40) }
      ],
      at: "2026-09-24T00:00:00.000Z"
    };
    expect(totalEstimatedTokens(entry)).toBe(100 + 10);
  });

  it("is zero for an entry with no messages", () => {
    const entry: PromptDebugEntry = { operation: "ask", model: "m", messages: [], at: "2026-09-24T00:00:00.000Z" };
    expect(totalEstimatedTokens(entry)).toBe(0);
  });
});
