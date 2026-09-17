import { describe, expect, it } from "vitest";
import { pickListedOllamaModel, pickListedReviewModel } from "@llm/ollama";

const names = [
  "mistral:latest",
  "qwen2.5-coder:7b",
  "huihui_ai/qwen2.5-abliterate:7b-instruct",
  "stheno-custom:latest"
];

describe("pickListedOllamaModel", () => {
  it("keeps a listed writing model", () => {
    expect(pickListedOllamaModel("stheno-custom:latest", names)).toBe("stheno-custom:latest");
  });
});

describe("pickListedReviewModel", () => {
  it("keeps a listed review model", () => {
    expect(pickListedReviewModel("qwen2.5-coder:7b", names)).toBe("qwen2.5-coder:7b");
  });

  it("prefers a Qwen instruct model when the stored name is missing", () => {
    expect(pickListedReviewModel("phi-4", names)).toBe("huihui_ai/qwen2.5-abliterate:7b-instruct");
  });

  it("falls back to any Qwen, then Mistral", () => {
    expect(pickListedReviewModel("missing", ["stheno-custom:latest", "qwen2.5-coder:7b"])).toBe("qwen2.5-coder:7b");
    expect(pickListedReviewModel("missing", ["stheno-custom:latest", "mistral:latest"])).toBe("mistral:latest");
  });
});
