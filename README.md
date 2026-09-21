# StoryBook AI

A local-first prose tool. The Story Bible holds truth. The model drafts. You decide.

This is a sibling of [Sandbox AI](https://github.com/ocedo-apps/Sandbox-AI), not a part of it. Campaign export (this app → Sandbox campaigns) comes later. The other direction has a first piece: Sandbox's Storyboard can group campaign scenes into chapters and export chapter shells (title + brief, no prose) as JSON — this app does not read that file back in yet. No cloud API keys: both apps talk to a local [Ollama](https://ollama.com) server.

The UI is English, Swedish, or Norwegian Bokmål. **Prose language** on Settings is the language of the sentences. Export files and model prompts follow that field when it is set, otherwise the language of the manuscript.

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

You can still write and lock facts by hand if Ollama is off. Manuscripts live in this browser’s IndexedDB, not in the git repo. **Backup** writes a JSON file the app can read back. **Publish**, at the bottom of the left rail after Proofread, writes Markdown, RTF, ODT, HTML, ePub, or PDF — prose and chapter titles only, no Synopsis or chapter briefs. Every chapter starts its own page in RTF, ODT, and PDF, and its own file in ePub.

## Models

Two dropdowns under **Settings**:

- **Writing** (default `stheno-custom:latest`) — Draft, Recast, Extend, Elaborate, Rewrite, Brainstorm Ask.
- **Review** (default `qwen2.5-coder:7b`) — Extract facts, word swap, sentence split, paragraph break, Analyze, Proofread.

## Loop

1. Title a manuscript. **Settings** is first in the left rail: camera, Voice, Reader, prose language, and which Writing and Review models to use. The page language stays in the header. A blank book opens here.
2. **Brainstorm** is private scratch: one note per idea, drag them, colour them. **Ask** writes onto a new note. Draft never reads this board.
3. Drag a note into the **send** column when it should become plot. Order in that column is paragraph order. **Send to synopsis** appends them to the map, removes those notes, and opens Synopsis. Notes left on the board stay secret.
4. Open **Briefs** to see every chapter brief as a card. Moving a card moves the chapter. The brief is a writing instruction, not canon.
5. Open a chapter. The chapter can inherit the manuscript camera, Voice, and Reader, or override them. **Continues from** picks the strand. **Primer** on Settings is the start prompt for the Writing model.
6. **Draft** fills or continues the chapter from the synopsis, the Story Bible, the brief, the camera, Reader, and prose language.
7. Select a passage and right-click: **Extend** continues it, **Elaborate** expands it, **Rewrite…** opens chips that fill your instruction (POV leak, stronger verbs, active voice, show don’t tell, long sentence) — you still press **Rewrite**. **Manual Edit** rewrites the span by hand. **Find** searches and replaces across the manuscript, with quick searches for repeated words and phrases on this page.
8. **Recast prose** rewrites the open chapter to the current camera. Same events and order; no new plot. Dropdowns do not recast on their own.
9. **History** snapshots the chapter's prose from before every Draft, Recast, Extend, Elaborate, Rewrite, or Restore — newest first, up to **Versions per chapter** on Settings (3–50, default 12). Compare any two versions (or a version against now) with a word-level diff. **Restore** jumps the chapter to that version — but never silently: if the current text differs from the target, it is saved as a new row first, so nothing is lost without its own row to jump back to.
10. **Stats** shows how it reads (directness, pacing, vocabulary, echo, repeated phrase, POV leak, mixed-focus paragraphs). Click an echo or repeated phrase to find it. **Rare on** marks uncommon words; right-click one for Review alternatives.
11. **Analyze** is an opt-in Review pass. It flags quotes; it does not rewrite. **Notes** reopens the last result.
12. **Proofread** sits under Chapters in the left rail, after the Settings → Brainstorm → Synopsis → Briefs → Chapters line, and not a locked step. It is a slower last Review pass over the whole manuscript (grammar, repeated scenes, style between chapters, age report). Progress is saved as it goes. It does not rewrite. **Publish** is the last item in the rail, right after Proofread — the workflow ends there.
13. **Extract facts** proposes Story Bible rows. Thicken them before Lock, or **Edit** a locked row later. **Add** on a name starts another fact about that person. **Export cards** sends locked people, places, and objects to Sandbox shelves.
14. Remove a chapter with **×**. It sits under Discarded chapters until you restore it or throw it away for good.
15. Locked facts constrain the next draft. The synopsis stays the map. Brainstorm stays yours.

## Analyze

The review tries to find lines that neither reveal the character’s personality nor drive the scene forward.

It may also flag named feelings (show vs tell), Voice drift when Voice is set, and beats that sit against a locked Story Bible trait. Click a flag to read the quote. Notes are not rewrites and do not touch the Story Bible.

## Tests

```bash
npm test
npm run typecheck
```

`npm test` covers the Story Bible schema, ConsistencyGate, extractor JSON recovery, craft/recast prompts, Analyze parsing, word-swap sense checks, IndexedDB round-trip, locales, find/replace, Reader, Continues from, brainstorm notes, prose history (revisions, restore, the no-silent-overwrite rule), and the word-level diff.
