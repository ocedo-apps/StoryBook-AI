# Models

**Engine**, under Settings, picks the local backend: **Ollama**, or **LM Studio / other local server** — any server speaking the OpenAI-compatible `/v1/chat/completions` API (LM Studio, llama.cpp, vLLM, text-generation-webui, LocalAI, [Strata](https://github.com/Niko1221/Strata), and similar). The second option just needs a **Server address** (defaults to LM Studio's own port, `http://localhost:1234`; Strata's own default is `http://127.0.0.1:8080`); with Ollama there's nothing to configure, StoryBook finds it automatically. No cloud provider is offered — see the main [README](../README.md).

If a server you've pointed StoryBook at doesn't show any models, check whether it needs to be told to allow StoryBook's origin — the same CORS requirement Ollama has (`OLLAMA_ORIGINS=http://localhost:5175`). A local server that otherwise speaks the OpenAI-compatible API correctly can still refuse the browser's request until its own allowed-origins setting includes `http://localhost:5175`. Strata, for example, needs `"cors_origins": ["http://localhost:5175"]` added to its `strata-<model>.json` config — CORS is off by default there.

Two model dropdowns under **Settings**, plus a **Context window** field (how much text the model can hold at once — with Ollama, a "Suggest from model" button reads the right value straight from it):

- **Writing** (default `stheno-custom:latest`) — Draft, Recast, Extend, Elaborate, Rewrite, Brainstorm Ask, Interview, Development method suggestions.
- **Review** (default `qwen2.5-coder:7b`) — Extract facts, Import lore, Interview fact-extraction, Ask Manuscript, word swap, sentence split, paragraph break, illustration prompts, Analyze, Proofread.
