import { describe, expect, it } from "vitest";
import { getOllamaModelContextLength, pickListedOllamaModel, pickListedReviewModel } from "@llm/ollama";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}

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

describe("getOllamaModelContextLength", () => {
  it("finds the architecture-prefixed context_length key in model_info", async () => {
    const found = await getOllamaModelContextLength({
      model: "cydonia-24b",
      fetchImpl: async () => jsonResponse({ model_info: { "general.architecture": "mistral", "mistral.context_length": 32768 } })
    });
    expect(found).toBe(32768);
  });

  it("returns undefined when Ollama reports no context_length at all", async () => {
    const found = await getOllamaModelContextLength({
      model: "m",
      fetchImpl: async () => jsonResponse({ model_info: { "general.architecture": "mistral" } })
    });
    expect(found).toBeUndefined();
  });

  it("returns undefined when model_info itself is missing", async () => {
    const found = await getOllamaModelContextLength({
      model: "m",
      fetchImpl: async () => jsonResponse({})
    });
    expect(found).toBeUndefined();
  });

  it("throws on a non-ok response", async () => {
    await expect(
      getOllamaModelContextLength({ model: "missing", fetchImpl: async () => jsonResponse({}, 404) })
    ).rejects.toThrow();
  });
});
