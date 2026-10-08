# Running StoryBook AI

On Windows, double-click **`starta.bat`**. On macOS, double-click **`starta.command`**. On Linux, run **`./starta.sh`** from a terminal (or double-click it, if your file manager runs executable scripts). Each installs dependencies on first run and then starts the app. Or, on any platform:

```bash
npm install
npm run dev
```

Opens on [http://localhost:5175](http://localhost:5175) so it does not collide with Sandbox (5173).

Allow the origin:

```bash
OLLAMA_ORIGINS=http://localhost:5175 ollama serve
```

## Backup & Publish

You can still write and lock facts by hand if Ollama is off. Manuscripts live in this browser's IndexedDB, not in the git repo. **Backup** writes a JSON file the app can read back. **Publish**, in the **File** menu (top bar), writes Markdown, plain text, RTF, ODT, HTML, ePub, or PDF — prose and chapter titles only, no Synopsis or chapter briefs. Every chapter starts its own page in RTF, ODT, and PDF, and its own file in ePub. HTML, ePub, and PDF can use one of four bundled OFL typefaces (Lora, Literata, Source Serif 4, Asap) instead of the default Times/Georgia look — RTF and ODT get the font by name only, since Scrivener and Word substitute from what's installed anyway.

At the bottom of the left rail, **Progress** shows the manuscript's word count and, once you set an optional target and deadline, a percentage that opens onto a full pace readout — the daily words needed to make the deadline, recalculated fresh each time rather than just falling behind silently if a week gets missed.
