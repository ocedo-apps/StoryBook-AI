import { describe, expect, it } from "vitest";
import {
  assertLocalOnlyBaseUrl,
  LocalProviderConfigError,
  OllamaModelProvider,
  OpenAICompatibleLocalProvider
} from "@llm/provider";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}

function streamResponse(lines: string[]): Response {
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const encoder = new TextEncoder();
      for (const line of lines) controller.enqueue(encoder.encode(line));
      controller.close();
    }
  });
  return new Response(stream, { status: 200 });
}

async function collect<T>(gen: AsyncGenerator<T>): Promise<T[]> {
  const out: T[] = [];
  for await (const item of gen) out.push(item);
  return out;
}

describe("assertLocalOnlyBaseUrl", () => {
  it("allows localhost and LAN-style hosts", () => {
    expect(() => assertLocalOnlyBaseUrl("http://localhost:11434", "Ollama")).not.toThrow();
    expect(() => assertLocalOnlyBaseUrl("http://192.168.1.20:1234", "LM Studio")).not.toThrow();
  });

  it("rejects known cloud API hosts", () => {
    expect(() => assertLocalOnlyBaseUrl("https://api.openai.com/v1", "x")).toThrow(LocalProviderConfigError);
    expect(() => assertLocalOnlyBaseUrl("https://api.anthropic.com", "x")).toThrow(LocalProviderConfigError);
    expect(() => assertLocalOnlyBaseUrl("https://generativelanguage.googleapis.com", "x")).toThrow(
      LocalProviderConfigError
    );
  });

  it("rejects an unparseable URL", () => {
    expect(() => assertLocalOnlyBaseUrl("not-a-url", "x")).toThrow(LocalProviderConfigError);
  });
});

describe("OllamaModelProvider", () => {
  it("refuses to construct against a cloud host", () => {
    expect(
      () => new OllamaModelProvider({ model: "m", baseUrl: "https://api.openai.com/v1" })
    ).toThrow(LocalProviderConfigError);
  });

  it("chat() delegates to Ollama's non-streaming endpoint", async () => {
    let capturedBody: Record<string, unknown> | undefined;
    const provider = new OllamaModelProvider({
      model: "stheno-custom:latest",
      fetchImpl: async (_url, init) => {
        capturedBody = JSON.parse(String(init?.body));
        return jsonResponse({ message: { content: "hello there" } });
      }
    });
    const reply = await provider.chat({ messages: [{ role: "user", content: "hi" }], temperature: 0.5 });
    expect(reply).toBe("hello there");
    expect(capturedBody?.model).toBe("stheno-custom:latest");
    expect(capturedBody?.stream).toBe(false);
  });

  it("streamChat() yields text deltas from Ollama's NDJSON stream", async () => {
    const provider = new OllamaModelProvider({
      model: "m",
      fetchImpl: async () =>
        streamResponse([
          `${JSON.stringify({ message: { role: "assistant", content: "a" } })}\n`,
          `${JSON.stringify({ message: { role: "assistant", content: "b" } })}\n`,
          `${JSON.stringify({ done: true, done_reason: "stop" })}\n`
        ])
    });
    const chunks = await collect(provider.streamChat({ messages: [{ role: "user", content: "hi" }] }));
    expect(chunks).toEqual([
      { type: "text_delta", text: "a" },
      { type: "text_delta", text: "b" },
      { type: "done", finishReason: "stop" }
    ]);
  });

  it("listModels() and healthCheck() reflect the Ollama /api/tags response", async () => {
    const provider = new OllamaModelProvider({
      model: "m",
      fetchImpl: async () => jsonResponse({ models: [{ name: "stheno-custom:latest" }, { name: "qwen2.5-coder:7b" }] })
    });
    expect(await provider.listModels()).toEqual(["qwen2.5-coder:7b", "stheno-custom:latest"]);
    expect(await provider.healthCheck()).toBe(true);
  });

  it("healthCheck() is false when the endpoint is unreachable", async () => {
    const provider = new OllamaModelProvider({
      model: "m",
      fetchImpl: async () => jsonResponse({}, 500)
    });
    expect(await provider.healthCheck()).toBe(false);
  });

  it("embed() posts to /api/embed and returns the embedding vectors", async () => {
    let capturedUrl = "";
    const provider = new OllamaModelProvider({
      model: "nomic-embed-text",
      fetchImpl: async (url) => {
        capturedUrl = String(url);
        return jsonResponse({ embeddings: [[0.1, 0.2], [0.3, 0.4]] });
      }
    });
    const vectors = await provider.embed({ texts: ["a", "b"] });
    expect(vectors).toEqual([[0.1, 0.2], [0.3, 0.4]]);
    expect(capturedUrl).toContain("/api/embed");
  });

  it("supportsEmbeddings() is true", () => {
    expect(new OllamaModelProvider({ model: "m" }).supportsEmbeddings()).toBe(true);
  });
});

describe("OpenAICompatibleLocalProvider", () => {
  it("refuses to construct against a cloud host", () => {
    expect(
      () => new OpenAICompatibleLocalProvider({ model: "m", baseUrl: "https://api.mistral.ai" })
    ).toThrow(LocalProviderConfigError);
  });

  it("chat() posts to /v1/chat/completions and reads choices[0].message.content", async () => {
    let capturedUrl = "";
    let capturedBody: Record<string, unknown> | undefined;
    const provider = new OpenAICompatibleLocalProvider({
      model: "local-model",
      baseUrl: "http://localhost:1234",
      fetchImpl: async (url, init) => {
        capturedUrl = String(url);
        capturedBody = JSON.parse(String(init?.body));
        return jsonResponse({ choices: [{ message: { content: "hi from LM Studio" } }] });
      }
    });
    const reply = await provider.chat({ messages: [{ role: "user", content: "hi" }], maxTokens: 100 });
    expect(reply).toBe("hi from LM Studio");
    expect(capturedUrl).toBe("http://localhost:1234/v1/chat/completions");
    expect(capturedBody?.stream).toBe(false);
    expect(capturedBody?.max_tokens).toBe(100);
  });

  it("streamChat() parses OpenAI-style SSE deltas and stops at [DONE]", async () => {
    const provider = new OpenAICompatibleLocalProvider({
      model: "m",
      baseUrl: "http://localhost:8080",
      fetchImpl: async () =>
        streamResponse([
          `data: ${JSON.stringify({ choices: [{ delta: { content: "foo" } }] })}\n\n`,
          `data: ${JSON.stringify({ choices: [{ delta: { content: "bar" } }] })}\n\n`,
          `data: [DONE]\n\n`
        ])
    });
    const chunks = await collect(provider.streamChat({ messages: [{ role: "user", content: "hi" }] }));
    expect(chunks).toEqual([
      { type: "text_delta", text: "foo" },
      { type: "text_delta", text: "bar" },
      { type: "done", finishReason: "stop" }
    ]);
  });

  it("listModels() reads data[].id from /v1/models", async () => {
    const provider = new OpenAICompatibleLocalProvider({
      model: "m",
      baseUrl: "http://localhost:8080",
      fetchImpl: async () => jsonResponse({ data: [{ id: "llama-3-8b" }, { id: "phi-4" }] })
    });
    expect(await provider.listModels()).toEqual(["llama-3-8b", "phi-4"]);
  });

  it("embed() posts to /v1/embeddings and returns data[].embedding", async () => {
    const provider = new OpenAICompatibleLocalProvider({
      model: "m",
      baseUrl: "http://localhost:8080",
      fetchImpl: async () => jsonResponse({ data: [{ embedding: [1, 2, 3] }] })
    });
    expect(await provider.embed({ texts: ["a"] })).toEqual([[1, 2, 3]]);
  });

  it("healthCheck() is false when the server refuses the connection", async () => {
    const provider = new OpenAICompatibleLocalProvider({
      model: "m",
      baseUrl: "http://localhost:8080",
      fetchImpl: async () => {
        throw new Error("ECONNREFUSED");
      }
    });
    expect(await provider.healthCheck()).toBe(false);
  });
});
