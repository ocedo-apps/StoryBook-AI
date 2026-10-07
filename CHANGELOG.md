# Changelog

All notable changes to StoryBook AI are documented here. This file follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) conventions and the
project uses [Semantic Versioning](https://semver.org/).

This file starts tracking from the 1.0.0 release. The full development
history before that — every incremental step, in detail — lives in
`project_spec.md`'s changelog (in Swedish; it's the project's internal
working log).

## [1.0.52] - 2026-10-07

### Fixed
- "Summarize chapter" asked the model for only a very small reply budget (far smaller than every other short-answer prompt in the app). A model that thinks or plans before writing its actual answer — increasingly common among local models, reasoning ones especially — could burn through that budget before ever reaching the summary, coming back empty or with just its own unfinished preamble (which can look like the chapter's opening echoed back). The budget is now generous enough to leave room for that before the real 2-4 sentence summary.

## [1.0.51] - 2026-10-07

### Changed
- Reorganized the manuscript's top bar. Brainstorm, Synopsis, Development method, Briefs, and Timeline — previously a vertical list in the left panel — are now tabs on a single top row, next to the manuscript title. The remaining actions are grouped into two dropdown menus, "File" (Backup, Export for other apps, Import lore, Publish) and "Tools" (Convert markers, Ask Manuscript, Proofread), with Settings and the renamed "Find/Replace" staying as direct buttons. This clears up the crowded, sometimes overlapping row of buttons the top bar used to show at normal window widths.
- The left panel is now narrower, holding only the chapter list and a word-count/goal indicator at the bottom. The Story Bible panel on the right is correspondingly wider, with more room for longer alias lists, trait text, and mentions.

## [1.0.50] - 2026-10-07

### Added
- A new "Update…" button on a Story Bible fact that changes over the story (anything but Identity) jumps straight to Add fact, pre-filled with the same category and focused, instead of requiring you to retype the category by hand. A short note now explains what adding a claim under an existing category actually does: it offers to replace it, keeping the earlier value visible in History, anchored to the chapter you're writing.

### Changed
- "Edit" (which corrects what a claim always was) and "Update…" (which marks it as changing from this chapter onward) are now visually distinct actions on each fact, instead of one easy-to-miss "Add fact" form doing double duty for both.

## [1.0.49] - 2026-10-07

### Changed
- Creating a new Story Bible card no longer asks which category ("Identity", "Trait", etc.) the first fact belongs to — the right one is chosen automatically. Adding further facts to an existing character now offers a short, relevant list ("Trait", "Relationship") instead of the full eight-category list, so there's no longer a confusing choice between near-identical categories that worked the same way either way.

## [1.0.48] - 2026-10-07

### Added
- Story Bible entities can now have aliases — nicknames, titles, alter egos — that count as a mention alongside the main name, both in the Mentions tracker and in the lore-relevance filter (`filter_lore_by_relevance`). A character known as "Em" in the prose is now recognized even if her Story Bible card is named "Emma".
- Entities can also have exclusion phrases: specific phrases that should never count as a mention even though the name appears inside them. For a name that doubles as an ordinary word, excluding "rose garden" stops every mention of the flower bed from being read as a sighting of a character named Rose.

## [1.0.47] - 2026-10-06

### Added
- A new "Chapter summary" field, next to Chapter brief — a short note on what actually happens in the chapter, written by hand or generated with a new "Summarize chapter" button. Earlier chapters' summaries now feed Draft, Extend, Elaborate, and Beat for later chapters, in story-time order, so the model can keep track of what has already happened without needing each earlier chapter's full prose in context. A chapter nobody has summarized yet is simply left out — nothing required, nothing breaks.

## [1.0.46] - 2026-10-06

### Fixed
- The Timeline / Plotlines matrix no longer gets squeezed into a cramped scrolling box of its own — a CSS quirk (setting only horizontal overflow still forces the browser to treat the box as scrollable on both axes, which collapsed its height inside the page's flex layout) had it shrinking down to a sliver with a tight inner scrollbar. The page scrolls normally again.
- The matrix's chapter-column headers and thread-row labels now stay in view (frozen, like a spreadsheet) while scrolling in either direction, instead of scrolling out of sight and leaving the grid impossible to read at a glance.

## [1.0.45] - 2026-10-06

### Added
- Publish got a new "Paragraph style" option: the long-standing "blank line between paragraphs" look, or a new "indented, no blank line" classic book style (RTF, ODT, HTML, ePub, PDF, and plain text). A chapter's opening paragraph is left flush, as in print. Markdown is unaffected — a blank line is what makes a paragraph a paragraph there.

## [1.0.44] - 2026-10-06

### Added
- An empty chapter now shows its brief as faint ghost text right in the editor — a template to write over — instead of only in the collapsed "Chapter settings" panel. Falls back to the usual hint when there's no brief yet; disappears the moment you start writing for real.

## [1.0.43] - 2026-10-06

### Added
- A paragraph starting with `>` now renders as a quoted block — indented, with a rule down the side — the way a letter or note read aloud is set in print. Several `>` lines in a row share one continuous rule. Cosmetic only: the marker stays in the saved text, and formatting inside a quoted line still works.

## [1.0.42] - 2026-10-06

### Fixed
- Typing straight into a brand-new, empty chapter could silently lose the very first paragraph once a later paragraph break was added — the editor now always starts with a real paragraph to type into, instead of leaving that first line as text outside any block.

## [1.0.41] - 2026-10-06

### Added
- A paragraph containing only `---` now renders as a scene-break rule in the editor, instead of showing as literal dashes. Purely visual — the saved text is unchanged, so export, word count, and everything else still sees `---`.

## [1.0.40] - 2026-10-06

### Added
- Darlings — "kill your darlings," but keep the bodies. Select a passage and "Cut to Darlings" from the right-click menu to pull it out of the chapter without deleting it for good; it lands in a "N darlings kept" tray with every other cut passage in the book, where you can restore it to its spot or discard it for good. A cut or restore gets its own row in the chapter's history too.

## [1.0.39] - 2026-10-05

### Added
- Auto-hiding side panels — pin (📌) stays the default, exactly like today, but a new unpin toggle (📍) in the Chapters panel and the Story Bible lets either one shrink to a thin edge strip and slide back out over the manuscript when you hover near it, instead of always taking up space.

## [1.0.38] - 2026-10-04

### Added
- Placeholders — drop a marker mid-draft without breaking your flow ("what was this character's last name again?") from the right-click menu at your cursor, then keep writing. A small pin shows where it sits in the text; click it to see the note, edit it, or mark it resolved. Chapters with an open one get a small dot in the chapter list, and a compact "N placeholders to come back to" panel lists every one in the book with a jump to its chapter.

## [1.0.37] - 2026-10-03

### Changed
- Brainstorm's "Ask…" is now "Talk it through…" — a real back-and-forth chat instead of a single question and answer. The AI sees your whole story and the notes already on the board, and remembers the conversation turn to turn, like a thinking partner you can keep talking to. The conversation itself is never saved — close the window and it's gone — but each of its replies gets its own "Add to notes" button, so you only keep the ideas you actually want.

## [1.0.36] - 2026-10-03

### Fixed
- Character/entity Interview now also sees locked facts about other Story Bible entities mentioned in the conversation — either because the interviewee's own facts already name them (e.g. a relationship), or because the author asks about them directly. Previously an Interview could only ever see the one entity's own card, so asking about anyone or anything else gave the model nothing to work from except inventing an answer — risking a contradiction with what was actually established elsewhere. One level only: a mentioned entity's own mentions aren't chased further.

## [1.0.35] - 2026-10-02

### Added
- "Export for other apps" — a new, separate export next to Backup that writes a [StoryCore](https://github.com/ocedo-apps/StoryCore)-shaped JSON snapshot of the manuscript: locked, visible Story Bible facts (grouped by kind — characters, locations, objects, groups, events, concepts) and chapters, for a sibling app such as ComicBook AI to import. A snapshot, not a live link — unlocked, flagged, or hidden-from-the-model facts are never included, the same visibility rule Draft itself uses.

## [1.0.34] - 2026-10-02

### Added
- Two new Guide sections documenting the last two releases: "Keeping a large imported Story Bible relevant" (Story Bible & World), explaining the new lore-relevance filter toggle, and "Ask about a chapter or a passage" (Revise the Manuscript), explaining the new free-form craft-feedback feature. The map of StoryBook AI and the "Which tool do I need?" overview were also updated to mention the new Ask feature.

## [1.0.33] - 2026-10-02

### Added
- "Ask about chapter…" — a free-form question to the Review model about the chapter's craft (pacing, tension, voice, whether the ending lands), with a system prompt that explicitly encourages honest, critical feedback instead of politely hedging. Two ways to use it: a new button next to Analyze asks about the whole chapter, or mark a passage in the text and choose "Ask…" from its menu to ask about just that passage (with surrounding context). The answer is a read-only reply — nothing is changed or saved, same as Ask Manuscript.

## [1.0.32] - 2026-10-01

### Added
- An optional, off-by-default setting ("Only show relevant lore for Draft") that filters imported lore facts (not facts established by the manuscript itself) out of the Draft prompt's Story Bible section unless the fact's own entity, or — for an Event entity — one of its participants or its location, is actually mentioned in the chapter. Pin an individual lore fact to always include it regardless, with the same cycle button already used for story-time position overrides. Addresses a tester's report that a large imported Story Bible buries the handful of facts actually relevant to the chapter being written, and that cross-referenced facts (e.g. a sponsorship event whose participant is named elsewhere, but which is never itself named in the text) could be missed entirely.

## [1.0.31] - 2026-10-01

### Added
- A new Guide section, "An AI server on another computer on the network" (Help & Troubleshooting), walking through connecting to Ollama or LM Studio running on a different machine on your LAN: which engine to pick (only "LM Studio / other local server" exposes a server-address field — the Ollama engine always points at localhost), the address format, and the server-side settings (OLLAMA_HOST/OLLAMA_ORIGINS for Ollama, Serve on Local Network/Enable CORS for LM Studio) plus the firewall rule needed on the other machine.

## [1.0.30] - 2026-09-30

### Changed
- "Check for updates" now opens a proper dialog instead of a small line of text on the home screen — easy to miss feedback from a tester's report ("it just flashes"). The dialog shows the checking/up-to-date/update-available states clearly, with a download link and a link to the full changelog when a newer version exists.

## [1.0.29] - 2026-09-30

### Added
- The desktop app can now check for updates: a "Check for updates" button on the home screen compares the running app against the latest GitHub release and links straight to it when a newer one exists. Desktop-app-only, same as the Ollama helper above. Every push to main now also publishes a GitHub Release with the Windows installer attached (instead of only the 90-day workflow-run artifact), so there's a stable link to check against and to actually download.
- Clicking a `storybookai://` link (from anywhere, including a plain browser tab) launches the desktop app and runs the same update check, opening the release page directly if one is available — the fallback path for anyone running StoryBook AI manually instead of through the desktop app.

### Changed
- The Guide's privacy section no longer claims "no update checks against GitHub" — that stopped being true once the desktop app could check for its own updates. The core promise is unchanged and still holds without qualification: StoryBook AI itself never sends your manuscript anywhere. The desktop app's optional update check only ever asks about its own version, never your text, which it doesn't have access to.

## [1.0.28] - 2026-09-30

### Added
- The desktop app (see roadmap-ideas.md #35) now helps with the first step of connecting a local AI: when it can't find Ollama yet, an "Install Ollama" button opens Ollama's official download page in your system browser, and — on an NVIDIA graphics card — a rough size suggestion ("this computer can likely run a model around 7-8 billion parameters") based on the card's VRAM. Both are desktop-app-only; nothing changes for anyone running StoryBook AI in a plain browser tab.

## [1.0.27] - 2026-09-30

### Added
- Character cards now have Goals and Fears fields alongside Looks and Personality — Draft reads them the same way.
- Event cards now have Where (a Location) and Who was there (Characters present) — structured links to existing Story Bible cards, not free text.
- A Location card now shows "Events here" and "People here", read straight off which Events are placed there and who's in them — nothing to fill in on the Location card itself, so there's only one place to keep it up to date.

### Changed
- Deleting a Character or Location now also clears it out of any Event's Where/Who was there, instead of leaving a dangling reference.
- "Extract facts" on the Synopsis and on any chapter or scene brief — the same planning-content pipeline Brainstorm notes got in 1.0.25, now covering all three sources the roadmap called for. A chapter or scene brief's candidates are attributed to that chapter (and scene, when extracted from a scene's own brief) the same way Interview-extracted facts already are, so they're gated by the same story-time visibility rule; Synopsis, like Brainstorm and Lore, isn't tied to any one chapter.

## [1.0.25] - 2026-09-30

### Added
- "Extract facts" on each Brainstorm note — the same review-queue pipeline Chapter, Interview, and Lore import already use, now reachable from planning material too, so an idea written naturally in a note doesn't have to be manually re-typed into Story Bible. Uses a new extractor prompt tuned for planning text: a hedged or speculative claim ("Nora may discover…") keeps its own hedge in the extracted candidate rather than being flattened into a flat, false-certain claim — it still only ever produces a candidate for review, never locks automatically. Proposed and flagged facts in the review queue now show which source they came from (Chapter, Interview, Lore, or Brainstorm) when known.

## [1.0.24] - 2026-09-30

### Changed
- Reworked the Handbook's "From interview to story" section for readability: shorter paragraphs, and the two techniques (a chapter-locked fact applying from the chapter's first page vs. linking a fact to a specific scene) are now each under their own short lead-in line instead of running together as one long explanation.

## [1.0.23] - 2026-09-30

### Added
- Facts extracted from an Interview can now be linked to a specific scene within a chapter, not just the chapter as a whole. For a chapter split into scenes, the "As of" picker lists its scenes alongside "Whole chapter"; a fact linked to a scene stays invisible to Draft until that scene's own pass, rather than from the whole chapter's first page — solving the mid-chapter-reveal problem the Handbook already described (a friend turning out to be the antagonist partway through a chapter, say), provided the author drafts scene by scene rather than the whole chapter in one pass. The Handbook's "From interview to story" section now walks through this with that exact example.

## [1.0.22] - 2026-09-30

### Changed
- The Handbook's "From interview to story" section now explains that a locked fact is tied to a chapter as a whole, not a point within it — important for a mid-chapter reveal (a friend turning out to be the one who hurt the protagonist's wife, say), where locking the reveal as of that chapter makes it visible to Draft from the chapter's very first page, not just from the reveal onward.

## [1.0.21] - 2026-09-30

### Added
- Interview's "Extract facts" now shows "As of chapter" — a dropdown, in story-time order, for which chapter these facts belong to in the plot's own chronology. Draft only sees a fact from that point in the story onward, so this matters for anything that could only become true partway through (e.g. a character's feelings about someone he hasn't met yet). Previously this was decided silently by whichever chapter happened to be open in the editor, with no way to see or correct it before locking a fact into the wrong point in the story.

## [1.0.20] - 2026-09-30

### Added
- A "Keep both" option next to Lock/Merge and Reject when a proposed fact conflicts with an existing one. The conflict check only knows "same entity, same predicate, different wording" — it has no way to tell a genuine contradiction from two independent facts that happen to share a broad predicate like Trait (a sexual orientation and a monogamy preference, say, share zero words and get flagged as if they contradicted each other). "Keep both" locks the new fact without retiring the one it was checked against, for exactly that case.

## [1.0.19] - 2026-09-30

### Fixed
- The fact-review queue could scroll its own "Review facts" heading and Close button out of view on a long list — the whole card scrolled as one block. Only the list of proposed facts scrolls now; the heading and Close stay put.

### Changed
- Proposed-fact text fields are shorter by default (2 lines instead of 3) — a locked fact is almost always a short claim, not a paragraph.
- The review queue's title is now "Review facts" instead of the more generic "Review".

## [1.0.18] - 2026-09-30

### Fixed
- The Interview card's info column (title, portrait, personality) needed its own scrollbar once the portrait was added — the card's fixed height hadn't grown to match. Made the whole card taller instead, so nothing on the left needs to scroll.

### Changed
- The question field now sends on Enter, like an ordinary chat box, instead of only inserting a line break. Shift+Enter still adds a line break for a multi-part question.

## [1.0.17] - 2026-09-30

### Fixed
- Extract facts on an Interview could genuinely hide its own result: the fact-review queue opens itself automatically whenever a new pending fact appears, but it shares the same stacking layer as every other modal — so it could open right behind the still-open Interview card, invisible. The review queue now always wins that stacking fight.

### Changed
- "Extract facts" is now an orange primary button instead of a plain text link, matching Ask and every other main action in the app, so it's easier to spot.

## [1.0.16] - 2026-09-30

### Added
- Interview now shows the entity's own portrait (its first Story Bible picture) at the top of the info column, right below the title — matching a mockup shared by the author. Falls back to the same initial-letter placeholder the small chat avatars already use when the entity has no picture yet.

## [1.0.15] - 2026-09-29

### Added
- The Home page's "Connect a local AI" section now collapses — Engine and model rarely change once set up, so there's no reason for the controls to take up space on every visit. It opens by default whenever there's nothing connected yet or something's wrong, and collapses once it's working; a status line stays visible either way, and a manual toggle always overrides the default.

## [1.0.14] - 2026-09-29

### Changed
- Styled the Home page's "Connect a local AI" box to match the rest of the page: same card background as a manuscript's shelf card (it was using a tinted accent color instead), and full-width instead of an oddly narrow fixed measure it had accidentally inherited from Settings' own styling. Also widened the gap before "Start a new manuscript" now that there's a full card sitting above it.

## [1.0.13] - 2026-09-29

### Changed
- Removed the static "Getting started with a local AI" three-card explainer from the Home page — now redundant with the working "Connect a local AI" section above it. Its one piece of unique information (where to get Ollama if you don't have a local AI server yet) moved into that section's own "not connected" message instead of disappearing.

## [1.0.12] - 2026-09-29

### Added
- The Home page now has a real "Connect a local AI" section — Engine, server address, and model pickers — right below the header, usable before creating a manuscript. Previously, connecting your model was only possible from Settings, which only existed once a manuscript was open, even though the app's own onboarding text told you to connect first, and the "Connect a local AI" button in the Guide only ever opened more explanatory text, never an actual connection form. Engine/server/model were already global settings (not tied to any one book), so nothing had to change to make them reachable from Home too.

### Added
- Settings now has its own "← Back to manuscript" link. Previously the only way out was the header logo, which exits the whole manuscript back to the shelf rather than just closing Settings — a tester never found the (unlabeled) alternative of clicking a chapter in the rail underneath.

### Fixed
- The Brainstorm hint told authors to "drag a note into the send column when it should become plot" — but no column is labeled "send" (it's "To synopsis"), and the app has a separate, unrelated "Plotlines" feature, so "become plot" pointed at the wrong destination. Reworded to name the actual column.
- A long brainstorm note (a tester's ~400-word one) had nothing capping its height in the "To synopsis" column, so it grew to fill the whole column and pushed every other note out of view. Long notes now scroll within their own card instead.

### Fixed
- Found the actual bug behind the empty extraction results, using the new raw-response view: the local model returned a bare `[...]` array of facts instead of the `{"facts": [...]}` object the prompt's example nests it in — valid JSON on its own, just one bracket layer flatter than expected. The old parser assumed the response always opened with `{` and mis-sliced it into several comma-joined objects with no enclosing bracket, which failed to parse and, in salvaging the pieces, lost the very bracket that recovery needed. The parser now recognizes either shape.
- Also caught and fixed a genuinely wrong instruction along the way: the Interview extraction prompt flatly said the interviewee always answers in the first person. That's only true for a character — asking about a place, object, group, event, or concept (like "Henrik's apartment") is answered in the third person, naming the subject directly. Harmless in the one case seen so far, since the narration named the subject every time regardless, but worded to no longer assume one grammatical person over the other.

### Added
- AI Context Inspector ("Show AI context" in Settings) now shows the model's raw reply alongside what was sent, for fact extraction (Interview and chapter). Diagnosing an extraction that came back empty or wrong required guessing blind at what a local model actually returned — this makes the real response visible without needing a developer console.

## [1.0.8] - 2026-09-29

### Changed
- Extract facts (Interview and chapter extraction) now explicitly names age, relationship status, and occupation as examples of the "trait" fact type, and Interview extraction now says explicitly that a hedged or approximate self-description ("let's say 35", "in my mid-thirties") is still a fact worth extracting, in the interviewee's own words. A tester's answer clearly stated an age and a relationship status and the extractor still found nothing — most likely because neither obviously fit any predicate's one-line description as written before, and a hedge read as a guess to rule out rather than the character's own way of putting it.

## [1.0.7] - 2026-09-29

### Fixed
- Extract facts on an Interview could show a raw, untranslated parser error ("Extractor returned no JSON object.") when a weaker local model failed to produce any JSON at all instead of the expected empty result — now treated the same as "found nothing," with the same friendly message, in both Interview and chapter extraction.

### Changed
- Tightened the Interview fact-extraction prompt to reduce the chance of a local model straying into explanatory prose instead of the required JSON: simplified one rule that invited reasoning about edge cases, and added an explicit "respond with only the JSON object" instruction at the end (models tend to follow instructions placed right before they start generating more reliably than ones stated only at the top).

## [1.0.6] - 2026-09-29

### Fixed
- Extract facts on an Interview transcript could come back empty even when the character had clearly stated facts — because they always answer in the first person ("my favorite food is..."), and the extractor's prompt (shared with chapter/lore extraction, written for third-person narrative) never told the model that "I"/"my" in an interview turn means the interviewee. Interview extraction now uses its own prompt that names the interviewee up front and says explicitly what their pronouns resolve to.

## [1.0.5] - 2026-09-29

### Changed
- Interview widened into a two-column layout: character info and personality stay in a fixed-width column on the left, while the conversation itself — questions and replies — gets a wide column on the right with real room to breathe, instead of squeezing everything into one narrow strip. Stacks back into a single column on narrow screens.

## [1.0.4] - 2026-09-29

### Fixed
- The tester confirmed 1.0.3's streaming fix actually worked — a reply was coming through — but the transcript area where it appears was rendering almost zero pixels tall, so the reply was there and invisible. The card used `max-height` on a flex column whose middle section fills leftover space; without a *definite* height to compute "leftover" from, that middle section collapsed instead of expanding. Switched to a fixed height, which is also just how a chat window should behave regardless of how much history it holds.

## [1.0.3] - 2026-09-29

### Fixed
- Interview still hung with no reply even after 1.0.2's timeout — the tester confirmed other AI features (Extend/Elaborate) worked fine, which was the key clue: Interview was the one place still using a single non-streaming request for the Writing model, waiting for the entire reply with zero visible feedback until it was fully generated. Every other Writing-model call already streams token by token. Interview now does too — the reply appears as it's written, like the rest of the app, instead of sitting silent until (or unless) the whole thing arrives at once.

## [1.0.2] - 2026-09-29

### Fixed
- Interview (and its "Extract facts" pass) had no timeout on the underlying model request at all — if the local server hung (still loading the model, a stalled connection) the Ask button stayed dimmed indefinitely with no error, since nothing ever resolved to clear it. Both now give up after two minutes with a clear error instead of waiting forever.

## [1.0.1] - 2026-09-29

### Fixed
- Interviewing a character could silently do nothing when a question was sent while an unrelated AI action elsewhere in the app was still running — the question vanished from the field with no reply, no error, and no loading indicator. The global "busy" state that blocked it wasn't visible to the Interview card, so its Ask and Extract facts buttons stayed enabled and gave no feedback. Now: the card disables its controls and explains why whenever something else is in flight, and if it's ever hit anyway, it shows an error instead of failing silently.

## [1.0.0] - 2026-09-29

First release labeled 1.0. Highlights from the stretch leading up to it:

### Added
- Mac (`starta.command`) and Linux (`starta.sh`) launcher scripts, matching the existing Windows `starta.bat` — install dependencies on first run, then start the app.
- Timeline and Plotlines merged into a single board: chapters as columns in story-time order, threads as rows, a continuous colored bar wherever a thread runs through a chapter.
- A dedicated ten-color palette for Plotline threads, freely chosen per thread via an Edit thread card (name, color, optional description shown as a tooltip).
- "Hide from AI" option per thread — keeps it visible in the writing view while excluding it from the Draft/Extend/Elaborate prompt.
- A chapter's tagged threads now show as a reminder above its title while writing, and (unless hidden) as guidance in the Draft/Extend/Elaborate prompt.
- Generic multi-article lore import: paste or upload text, it splits on headers into candidate articles you can pick from before extracting.
- A short, always-visible "Chronological position" label next to each chapter's story-time field, replacing a placeholder that no longer fit.

### Fixed
- The Context Window and Versions-per-chapter settings fields no longer clamp mid-keystroke while typing a value outside the current range.
- Extract Facts no longer creates duplicate Story Bible cards for the same person — entity identity is now derived deterministically from the label instead of trusted from the model.

### Changed
- `package.json` version bumped from `0.1.0` to `1.0.0`.
