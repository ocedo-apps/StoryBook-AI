# Models

**Engine**, under Settings, picks the local backend: **Ollama**, or **LM Studio / other local server** — any server speaking the OpenAI-compatible `/v1/chat/completions` API (LM Studio, llama.cpp, vLLM, text-generation-webui, LocalAI, and similar). The second option just needs a **Server address** (defaults to LM Studio's own port, `http://localhost:1234`); with Ollama there's nothing to configure, StoryBook finds it automatically. No cloud provider is offered — see the main [README](../README.md).

Two model dropdowns under **Settings**, plus a **Context window** field (how much text the model can hold at once — with Ollama, a "Suggest from model" button reads the right value straight from it):

- **Writing** (default `stheno-custom:latest`) — Draft, Recast, Extend, Elaborate, Rewrite, Brainstorm Ask, Interview, Development method suggestions.
- **Review** (default `qwen2.5-coder:7b`) — Extract facts, Import lore, Interview fact-extraction, Ask Manuscript, word swap, sentence split, paragraph break, illustration prompts, Analyze, Proofread.
