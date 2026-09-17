# StoryBook AI

A local-first prose tool. The Story Bible holds truth. The model drafts. You decide.

This is a sibling of [Sandbox AI](https://github.com/ocedo-apps/Sandbox-AI), not a part of it. Campaign export comes later. No cloud API keys: both apps talk to a local [Ollama](https://ollama.com) server.

## Run

On Windows, double-click **`starta.bat`**. Or:

```bash
npm install
npm run dev
```

Opens on [http://localhost:5175](http://localhost:5175) so it does not collide with Sandbox (5173).

Allow the origin:

```bash
OLLAMA_ORIGINS=http://localhost:5175 ollama serve
```

You can still write and lock facts by hand if Ollama is off. Manuscripts live in this browser’s IndexedDB, not in the git repo.

## Models

Two dropdowns in the header:

- **Writing** (default `stheno-custom:latest`) — Draft, Recast, Extend, Elaborate, Rewrite, Brainstorm Ask.
- **Review** (default `qwen2.5-coder:7b`) — Extract facts, word swap, sentence split, paragraph break, Analyze.

## Loop

1. Title a manuscript. **Brainstorm** is private scratch — Ask the model, keep secrets here. Draft never reads it.
2. Select a note and **Lift to synopsis** when it should become the map. The note stays in brainstorm.
3. Open Chapter 1. Sketch a chapter brief if you want. Set POV, tense, viewpoint, and **Continues from**.
4. **Draft** fills or continues the chapter from the synopsis, the Story Bible, the brief, and the camera.
5. Select a passage and right-click: **Extend** continues it, **Elaborate** expands it, **Rewrite…** follows your instruction, **Manual Edit** rewrites the span by hand.
6. **Recast prose** rewrites the open chapter to the current camera. Same events and order; no new plot. Dropdowns do not recast on their own.
7. **Stats** shows how it reads (directness, pacing, vocabulary, echo, POV leak, mixed-focus paragraphs). **Rare on** marks uncommon words; right-click one for Review alternatives.
8. **Analyze** is an opt-in Review pass. It flags quotes; it does not rewrite. **Notes** reopens the last result.
9. **Extract facts** proposes Story Bible rows. Thicken them before Lock, or **Edit** a locked row later. **Add** on a name starts another fact about that person.
10. Locked facts constrain the next draft. The synopsis stays the map. Brainstorm stays yours.

## Analyze

The review tries to find lines that neither reveal the character’s personality nor drive the scene forward.

It may also flag named feelings (show vs tell), Voice drift when Voice is set, and beats that sit against a locked Story Bible trait. Click a flag to read the quote. Notes are not rewrites and do not touch the Story Bible.

## Tests

```bash
npm test
npm run typecheck
```

`npm test` covers the Story Bible schema, ConsistencyGate, extractor JSON recovery, craft/recast prompts, Analyze parsing, word-swap sense checks, and IndexedDB round-trip.
