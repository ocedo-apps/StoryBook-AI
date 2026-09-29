# Changelog

All notable changes to StoryBook AI are documented here. This file follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) conventions and the
project uses [Semantic Versioning](https://semver.org/).

This file starts tracking from the 1.0.0 release. The full development
history before that — every incremental step, in detail — lives in
`project_spec.md`'s changelog (in Swedish; it's the project's internal
working log).

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
