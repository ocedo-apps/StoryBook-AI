import type { ChatMessage, CompletionRequest, LLMProvider, ProviderCapabilities, StreamChunk } from "./types";

export const DEFAULT_OLLAMA_BASE_URL = "http://localhost:11434";
export const DEFAULT_OLLAMA_MODEL = "stheno-custom:latest";
export const DEFAULT_REVIEW_MODEL = "qwen2.5-coder:7b";

export class OllamaRequestError extends Error {
  constructor(
    public readonly status: number,
    statusText: string
  ) {
    super(`Ollama request failed: ${status} ${statusText}`);
    this.name = "OllamaRequestError";
  }
}

function boundFetch(fetchImpl?: typeof fetch): typeof fetch {
  return fetchImpl ?? globalThis.fetch.bind(globalThis);
}

export function normalizeBaseUrl(baseUrl?: string): string {
  return (baseUrl ?? DEFAULT_OLLAMA_BASE_URL).replace(/\/$/, "");
}

export async function listOllamaModels(options: {
  baseUrl?: string;
  fetchImpl?: typeof fetch;
  signal?: AbortSignal;
} = {}): Promise<string[]> {
  const fetchImpl = boundFetch(options.fetchImpl);
  const response = await fetchImpl(`${normalizeBaseUrl(options.baseUrl)}/api/tags`, {
    method: "GET",
    signal: options.signal ?? null
  });
  if (!response.ok) {
    throw new OllamaRequestError(response.status, response.statusText);
  }
  const payload: unknown = await response.json();
  const models = (payload as { models?: unknown })?.models;
  if (!Array.isArray(models)) return [];
  const names = models
    .map((entry) =>
      entry && typeof entry === "object" && "name" in entry ? (entry as { name: unknown }).name : undefined
    )
    .filter((name): name is string => typeof name === "string" && name.length > 0);
  return [...new Set(names)].sort((a, b) => a.localeCompare(b, "en", { sensitivity: "base" }));
}

export function pickListedOllamaModel(preferred: string, names: string[]): string | undefined {
  if (names.length === 0) return undefined;
  if (names.includes(preferred)) return preferred;
  const tagged = names.find((name) => name === `${preferred}:latest` || name.startsWith(`${preferred}:`));
  return tagged ?? names[0];
}

export function pickListedReviewModel(preferred: string, names: string[]): string | undefined {
  if (names.length === 0) return undefined;
  if (names.includes(preferred)) return preferred;
  const tagged = names.find((name) => name === `${preferred}:latest` || name.startsWith(`${preferred}:`));
  if (tagged) return tagged;
  const qwenInstruct = names.find((name) => /qwen/i.test(name) && /instruct/i.test(name));
  if (qwenInstruct) return qwenInstruct;
  const qwen = names.find((name) => /qwen/i.test(name));
  if (qwen) return qwen;
  const phi = names.find((name) => /phi/i.test(name));
  if (phi) return phi;
  const mistral = names.find((name) => /mistral/i.test(name));
  if (mistral) return mistral;
  return names[0];
}

interface OllamaChatLine {
  message?: { role: string; content: string };
  done?: boolean;
  done_reason?: string;
  eval_count?: number;
  error?: string;
}

export class OllamaProvider implements LLMProvider {
  readonly name: string;
  readonly capabilities: ProviderCapabilities;
  private readonly model: string;
  private readonly baseUrl: string;
  private readonly fetchImpl: typeof fetch;

  constructor(config: { model: string; baseUrl?: string; name?: string; fetchImpl?: typeof fetch }) {
    this.model = config.model;
    this.baseUrl = normalizeBaseUrl(config.baseUrl);
    this.name = config.name ?? `ollama:${config.model}`;
    this.fetchImpl = boundFetch(config.fetchImpl);
    this.capabilities = { streaming: true, cancellation: true };
  }

  async *streamCompletion(request: CompletionRequest): AsyncGenerator<StreamChunk> {
    const response = await this.fetchImpl(`${this.baseUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: request.signal ?? null,
      body: JSON.stringify({
        model: this.model,
        messages: request.messages.map((m) => ({ role: m.role, content: m.content })),
        stream: true,
        options: {
          ...(request.temperature !== undefined ? { temperature: request.temperature } : {}),
          ...(request.maxTokens !== undefined ? { num_predict: request.maxTokens } : {})
        }
      })
    });

    if (!response.ok) {
      throw new OllamaRequestError(response.status, response.statusText);
    }
    if (!response.body) {
      throw new Error("Ollama response had no readable body.");
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
          const result = this.parseLine(line, request.maxTokens);
          if (result) {
            yield result;
            if (result.type === "done" || result.type === "error") return;
          }
        }
      }
      if (buffer.trim()) {
        const result = this.parseLine(buffer, request.maxTokens);
        if (result) yield result;
      }
    } finally {
      reader.releaseLock();
    }
  }

  private parseLine(line: string, maxTokens?: number): StreamChunk | undefined {
    const trimmed = line.trim();
    if (!trimmed) return undefined;
    let parsed: OllamaChatLine;
    try {
      parsed = JSON.parse(trimmed) as OllamaChatLine;
    } catch {
      return { type: "error", message: `Unparseable line from Ollama stream: ${trimmed}` };
    }
    if (parsed.error) return { type: "error", message: parsed.error };
    if (parsed.done) {
      const hitWall =
        parsed.done_reason === "length" ||
        (maxTokens !== undefined && typeof parsed.eval_count === "number" && parsed.eval_count >= maxTokens);
      return { type: "done", finishReason: hitWall ? "length" : "stop" };
    }
    if (parsed.message?.content) return { type: "text_delta", text: parsed.message.content };
    return undefined;
  }
}

export async function completeOllamaChat(options: {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
  signal?: AbortSignal;
  baseUrl?: string;
  fetchImpl?: typeof fetch;
}): Promise<string> {
  const fetchImpl = boundFetch(options.fetchImpl);
  const response = await fetchImpl(`${normalizeBaseUrl(options.baseUrl)}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal: options.signal ?? null,
    body: JSON.stringify({
      model: options.model,
      messages: options.messages,
      stream: false,
      options: {
        ...(options.temperature !== undefined ? { temperature: options.temperature } : {}),
        ...(options.maxTokens !== undefined ? { num_predict: options.maxTokens } : {})
      }
    })
  });
  if (!response.ok) {
    throw new OllamaRequestError(response.status, response.statusText);
  }
  const payload: unknown = await response.json();
  const content = (payload as { message?: { content?: unknown } })?.message?.content;
  if (typeof content !== "string" || !content.trim()) {
    throw new Error("Ollama returned an empty reply.");
  }
  return content;
}
