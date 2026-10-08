# StoryBook AI

A local-first prose tool. The Story Bible holds truth. The model drafts. You decide.

This is a sibling of [Sandbox AI](https://github.com/ocedo-apps/Sandbox-AI), not a part of it. Campaign export (this app → Sandbox campaigns) comes later. The other direction has a first piece: Sandbox's Storyboard can group campaign scenes into chapters and export chapter shells (title + brief, no prose) as JSON — this app does not read that file back in yet. No cloud API keys: StoryBook AI talks to a local model server on your own computer or network — [Ollama](https://ollama.com), or any OpenAI-compatible server such as LM Studio, llama.cpp, or vLLM (see [Models](docs/models.md)). Cloud providers (OpenAI, Anthropic, Google, and others) are deliberately excluded — the provider layer refuses to resolve to their hostnames, not just undocumented.

The UI is English, Swedish, or Norwegian Bokmål. **Prose language** on Settings is the language of the sentences. Export files and model prompts follow that field when it is set, otherwise the language of the manuscript.

## Quickstart

On Windows, double-click **`starta.bat`**. On macOS, double-click **`starta.command`**. On Linux, run **`./starta.sh`** from a terminal (or double-click it, if your file manager runs executable scripts). Each installs dependencies on first run and then starts the app. Or, on any platform:

```bash
npm install
npm run dev
```

Opens on [http://localhost:5175](http://localhost:5175) so it does not collide with Sandbox (5173). See [Running StoryBook AI](docs/running.md) for the Ollama origin setting and how Backup/Publish get your work out.

## Documentation

- [Running StoryBook AI](docs/running.md) — install, start, local AI server, backup and publish
- [Models](docs/models.md) — picking an engine, Writing vs Review models, context window
- [The Loop](docs/guide.md) — a full walkthrough of every tool, step by step, plus Analyze
- [Testing](docs/testing.md) — running the test suite

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for what changed in each release.
