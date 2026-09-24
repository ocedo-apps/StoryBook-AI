import type { ChatMessage, CompletionRequest, StreamChunk } from "./types";
import {
  completeOllamaChat,
  DEFAULT_OLLAMA_BASE_URL,
  listOllamaModels,
  normalizeBaseUrl,
  OllamaProvider,
  OllamaRequestError
} from "./ollama";

export interface EmbeddingRequest {
  texts: string[];
  signal?: AbortSignal;
}

/**
 * The provider-agnostic contract every local model backend implements.
 * "Local" is an explicit rule, not a convention (project_spec.md §9): an
 * adapter must never resolve to a cloud API host, see assertLocalOnlyBaseUrl.
 */
export interface LocalModelProvider {
  readonly name: string;
  chat(request: CompletionRequest): Promise<string>;
  streamChat(request: CompletionRequest): AsyncGenerator<StreamChunk>;
  embed(request: EmbeddingRequest): Promise<number[][]>;
  supportsEmbeddings(): boolean;
  listModels(): Promise<string[]>;
  healthCheck(): Promise<boolean>;
}

export class LocalProviderConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LocalProviderConfigError";
  }
}

export class LocalProviderRequestError extends Error {
  constructor(
    public readonly providerName: string,
    public readonly status: number,
    statusText: string
  ) {
    super(`${providerName} request failed: ${status} ${statusText}`);
    this.name = "LocalProviderRequestError";
  }
}

const CLOUD_HOSTNAME_PATTERNS = [
  /(^|\.)openai\.com$/i,
  /(^|\.)anthropic\.com$/i,
  /(^|\.)googleapis\.com$/i,
  /(^|\.)generativelanguage\.google\.com$/i,
  /(^|\.)azure\.com$/i,
  /(^|\.)cohere\.(ai|com)$/i,
  /(^|\.)together\.(ai|xyz)$/i,
  /(^|\.)groq\.com$/i,
  /(^|\.)openrouter\.ai$/i,
  /(^|\.)perplexity\.ai$/i,
  /(^|\.)mistral\.ai$/i,
  /(^|\.)fireworks\.ai$/i,
  /(^|\.)deepseek\.com$/i
];

export function assertLocalOnlyBaseUrl(baseUrl: string, providerName: string): void {
  let hostname: string;
  try {
    hostname = new URL(baseUrl).hostname;
  } catch {
    throw new LocalProviderConfigError(`${providerName}: "${baseUrl}" is not a valid URL.`);
  }
  if (CLOUD_HOSTNAME_PATTERNS.some((pattern) => pattern.test(hostname))) {
    throw new LocalProviderConfigError(
      `${providerName}: "${hostname}" is a cloud API host. StoryBook AI only talks to local model servers.`
    );
  }
}

/**
 * Wraps the existing Ollama transport (src/llm/ollama.ts) behind
 * LocalModelProvider, without changing its request/response shapes.
 */
export class OllamaModelProvider implements LocalModelProvider {
  readonly name: string;
  private readonly model: string;
  private readonly baseUrl: string | undefined;
  private readonly fetchImpl: typeof fetch | undefined;

  constructor(config: { model: string; baseUrl?: string; name?: string; fetchImpl?: typeof fetch }) {
    if (config.baseUrl) assertLocalOnlyBaseUrl(config.baseUrl, config.name ?? "Ollama");
    this.model = config.model;
    this.baseUrl = config.baseUrl;
    this.fetchImpl = config.fetchImpl;
    this.name = config.name ?? `ollama:${config.model}`;
  }

  chat(request: CompletionRequest): Promise<string> {
    return completeOllamaChat({
      model: this.model,
      messages: request.messages,
      ...(request.temperature !== undefined ? { temperature: request.temperature } : {}),
      ...(request.maxTokens !== undefined ? { maxTokens: request.maxTokens } : {}),
      ...(request.signal ? { signal: request.signal } : {}),
      ...(this.baseUrl ? { baseUrl: this.baseUrl } : {}),
      ...(this.fetchImpl ? { fetchImpl: this.fetchImpl } : {})
    });
  }

  streamChat(request: CompletionRequest): AsyncGenerator<StreamChunk> {
    const provider = new OllamaProvider({
      model: this.model,
      ...(this.baseUrl ? { baseUrl: this.baseUrl } : {}),
      ...(this.fetchImpl ? { fetchImpl: this.fetchImpl } : {})
    });
    return provider.streamCompletion(request);
  }

  listModels(): Promise<string[]> {
    return listOllamaModels({
      ...(this.baseUrl ? { baseUrl: this.baseUrl } : {}),
      ...(this.fetchImpl ? { fetchImpl: this.fetchImpl } : {})
    });
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.listModels();
      return true;
    } catch {
      return false;
    }
  }

  supportsEmbeddings(): boolean {
    return true;
  }

  async embed(request: EmbeddingRequest): Promise<number[][]> {
    const fetchImpl = this.fetchImpl ?? globalThis.fetch.bind(globalThis);
    const response = await fetchImpl(`${normalizeBaseUrl(this.baseUrl ?? DEFAULT_OLLAMA_BASE_URL)}/api/embed`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: request.signal ?? null,
      body: JSON.stringify({ model: this.model, input: request.texts })
    });
    if (!response.ok) {
      throw new OllamaRequestError(response.status, response.statusText);
    }
    const payload: unknown = await response.json();
    const embeddings = (payload as { embeddings?: unknown })?.embeddings;
    if (!Array.isArray(embeddings)) {
      throw new Error("Ollama returned no embeddings.");
    }
    return embeddings as number[][];
  }
}

interface OpenAiChatChunk {
  choices?: Array<{ delta?: { content?: unknown }; finish_reason?: unknown }>;
}

/**
 * Second adapter (LM Studio, llama.cpp-server, etc.): the OpenAI-compatible
 * REST contract they share, hit against a caller-supplied local baseUrl —
 * never a default, since these servers run on arbitrary local ports.
 */
export class OpenAICompatibleLocalProvider implements LocalModelProvider {
  readonly name: string;
  private readonly model: string;
  private readonly baseUrl: string;
  private readonly fetchImpl: typeof fetch;

  constructor(config: { model: string; baseUrl: string; name?: string; fetchImpl?: typeof fetch }) {
    assertLocalOnlyBaseUrl(config.baseUrl, config.name ?? "Local OpenAI-compatible server");
    this.model = config.model;
    this.baseUrl = config.baseUrl.replace(/\/$/, "");
    this.name = config.name ?? `local-openai:${config.model}`;
    this.fetchImpl = config.fetchImpl ?? globalThis.fetch.bind(globalThis);
  }

  private chatBody(messages: ChatMessage[], stream: boolean, temperature?: number, maxTokens?: number) {
    return JSON.stringify({
      model: this.model,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      stream,
      ...(temperature !== undefined ? { temperature } : {}),
      ...(maxTokens !== undefined ? { max_tokens: maxTokens } : {})
    });
  }

  async chat(request: CompletionRequest): Promise<string> {
    const response = await this.fetchImpl(`${this.baseUrl}/v1/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: request.signal ?? null,
      body: this.chatBody(request.messages, false, request.temperature, request.maxTokens)
    });
    if (!response.ok) {
      throw new LocalProviderRequestError(this.name, response.status, response.statusText);
    }
    const payload: unknown = await response.json();
    const content = (payload as { choices?: Array<{ message?: { content?: unknown } }> })?.choices?.[0]?.message
      ?.content;
    if (typeof content !== "string" || !content.trim()) {
      throw new Error(`${this.name} returned an empty reply.`);
    }
    return content;
  }

  async *streamChat(request: CompletionRequest): AsyncGenerator<StreamChunk> {
    const response = await this.fetchImpl(`${this.baseUrl}/v1/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: request.signal ?? null,
      body: this.chatBody(request.messages, true, request.temperature, request.maxTokens)
    });
    if (!response.ok) {
      throw new LocalProviderRequestError(this.name, response.status, response.statusText);
    }
    if (!response.body) {
      throw new Error(`${this.name} response had no readable body.`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          const result = this.parseSseLine(line);
          if (result) {
            yield result;
            if (result.type === "done" || result.type === "error") return;
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  private parseSseLine(line: string): StreamChunk | undefined {
    const trimmed = line.trim();
    if (!trimmed.startsWith("data:")) return undefined;
    const data = trimmed.slice("data:".length).trim();
    if (!data) return undefined;
    if (data === "[DONE]") return { type: "done", finishReason: "stop" };
    let parsed: OpenAiChatChunk;
    try {
      parsed = JSON.parse(data) as OpenAiChatChunk;
    } catch {
      return { type: "error", message: `Unparseable SSE line from ${this.name}: ${data}` };
    }
    const choice = parsed.choices?.[0];
    const text = choice?.delta?.content;
    if (typeof text === "string" && text.length > 0) return { type: "text_delta", text };
    if (choice?.finish_reason === "length") return { type: "done", finishReason: "length" };
    if (choice?.finish_reason === "stop") return { type: "done", finishReason: "stop" };
    return undefined;
  }

  async listModels(): Promise<string[]> {
    const response = await this.fetchImpl(`${this.baseUrl}/v1/models`, { method: "GET" });
    if (!response.ok) {
      throw new LocalProviderRequestError(this.name, response.status, response.statusText);
    }
    const payload: unknown = await response.json();
    const data = (payload as { data?: unknown })?.data;
    if (!Array.isArray(data)) return [];
    return data
      .map((entry) => (entry && typeof entry === "object" && "id" in entry ? (entry as { id: unknown }).id : undefined))
      .filter((id): id is string => typeof id === "string" && id.length > 0);
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.listModels();
      return true;
    } catch {
      return false;
    }
  }

  supportsEmbeddings(): boolean {
    return true;
  }

  async embed(request: EmbeddingRequest): Promise<number[][]> {
    const response = await this.fetchImpl(`${this.baseUrl}/v1/embeddings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: request.signal ?? null,
      body: JSON.stringify({ model: this.model, input: request.texts })
    });
    if (!response.ok) {
      throw new LocalProviderRequestError(this.name, response.status, response.statusText);
    }
    const payload: unknown = await response.json();
    const data = (payload as { data?: unknown })?.data;
    if (!Array.isArray(data)) {
      throw new Error(`${this.name} returned no embeddings.`);
    }
    return data.map((entry) => {
      const embedding = (entry && typeof entry === "object" ? (entry as { embedding?: unknown }).embedding : undefined);
      if (!Array.isArray(embedding)) {
        throw new Error(`${this.name} returned a malformed embedding.`);
      }
      return embedding as number[];
    });
  }
}
