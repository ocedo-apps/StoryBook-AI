export interface ProviderCapabilities {
  streaming: boolean;
  cancellation: boolean;
}

export type ChatRole = "system" | "user" | "assistant";

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface CompletionRequest {
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
  signal?: AbortSignal;
}

export type StreamChunk =
  | { type: "text_delta"; text: string }
  | { type: "done"; finishReason: "stop" | "length" | "cancelled" }
  | { type: "error"; message: string };

export interface LLMProvider {
  readonly name: string;
  readonly capabilities: ProviderCapabilities;
  streamCompletion(request: CompletionRequest): AsyncGenerator<StreamChunk>;
}

export class ProviderError extends Error {
  constructor(
    public readonly providerName: string,
    message: string,
    public override readonly cause?: unknown
  ) {
    super(`[${providerName}] ${message}`);
    this.name = "ProviderError";
  }
}
