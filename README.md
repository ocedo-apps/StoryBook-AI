# StoryBook AI

A local-first prose tool. The Story Bible holds truth. The model drafts. You decide.

This is a sibling of Sandbox AI, not a part of it. Campaign export comes later.

## Run

```bash
npm install
npm run dev
```

Opens on [http://localhost:5175](http://localhost:5175) so it does not collide with Sandbox (5173).

Draft and fact extraction talk to local [Ollama](https://ollama.com). Allow the origin:

```bash
OLLAMA_ORIGINS=http://localhost:5175 ollama serve
```

You can still write and lock facts by hand if Ollama is off.

## Loop

1. Title a manuscript. **Brainstorm** is private scratch — Ask the model, keep secrets here. Draft never reads it.
2. Select a note and **Lift to synopsis** when it should become the map. The note stays in brainstorm.
3. Open Chapter 1. Sketch a chapter brief if you want.
4. **Draft** fills or continues the chapter from the synopsis, the Story Bible, and the brief.
5. Select a passage and right-click: **Extend** continues it, **Elaborate** expands it, **Rewrite…** follows your instruction, **Manual Edit** rewrites the span by hand.
6. Edit until the prose is yours.
7. **Extract facts** proposes Story Bible rows. You can thicken them before Lock, or **Edit** a locked row later. **Add** on a name starts another fact about that person.
8. Locked facts constrain the next draft. The synopsis stays the map. Brainstorm stays yours.

`npm test` covers the fact schema, ConsistencyGate, extractor JSON recovery, and IndexedDB round-trip.
