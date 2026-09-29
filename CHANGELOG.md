# Changelog

All notable changes to StoryBook AI are documented here. This file follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) conventions and the
project uses [Semantic Versioning](https://semver.org/).

This file starts tracking from the 1.0.0 release. The full development
history before that — every incremental step, in detail — lives in
`project_spec.md`'s changelog (in Swedish; it's the project's internal
working log).

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
