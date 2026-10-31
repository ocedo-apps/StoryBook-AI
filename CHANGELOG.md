# Changelog

All notable changes to StoryBook AI are documented here. This file follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) conventions and the
project uses [Semantic Versioning](https://semver.org/).

This file starts tracking from the 1.0.0 release. The full development
history before that — every incremental step, in detail — lives in
`project_spec.md`'s changelog (in Swedish; it's the project's internal
working log).

## [1.0.242] - 2026-10-31

### Added
- "Create series from this book" in the Story Bible — turns a finished standalone book into the first book of a brand-new series in one click: creates the series (named after the book), assigns the book to it, and promotes every one of the book's locked facts up to series canon, instead of doing those three steps by hand one fact at a time.

## [1.0.241] - 2026-10-31

### Changed
- Kaamilla is now the default assistant for anyone who's never touched the setting (previously off by default). The first time she appears on Home this way, a one-time bubble next to her existing tip introduces her and explains how to turn her off or switch characters in Settings — it never reappears once dismissed, or once the assistant setting has been changed at all (including turning it off before ever seeing the bubble).

## [1.0.240] - 2026-10-31

### Added
- A third mascot, Kaambot, alongside Kaamilla and Kaamy.

### Changed
- The mascot picker in Settings is now a visual card grid (your own mockup, Mats) instead of a dropdown — a picture and name per option, including "None," with the selected one highlighted. The description above it now says outright that you can change it anytime, instead of hiding that in a tooltip.

## [1.0.239] - 2026-10-31

### Fixed
- An invalid local-server address (e.g. an unfinished URL saved while setting up Ollama or an OpenAI-compatible server) no longer bricks the whole app. The address check threw before any error handling could catch it, crashing straight into the full-page error screen on every app start — now it surfaces as the normal "can't reach the server" state in Settings instead.

## [1.0.238] - 2026-10-31

### Fixed
- The mascot speech bubble now stays light (its own comic-style colors) in dark theme instead of flipping to dark along with the rest of the UI.

## [1.0.237] - 2026-10-31

### Fixed
- The title input on Home's hero pill no longer leaves a visible gap before the arrow button — it now stretches to fill the row up to the button, instead of stopping short at a fixed max-width.

## [1.0.236] - 2026-10-31

### Changed
- Home's hero area now matches the reference design more closely: the page content is centered as a whole (not left-biased), the headline and mascot tip sit indented relative to the full-width pill and cards, the pill's label has more horizontal breathing room, and the arrow button is pinned flush to the pill's own right padding instead of trailing behind unclaimed flex space.

## [1.0.235] - 2026-10-31

### Fixed
- Home's own container (and the pill hero inside it) could never actually reach its specified max-width on a wide screen — a flexbox quirk (auto side margins skip the default stretch behavior) left it shrink-wrapped to its content instead. The pill now genuinely reaches 1400px on a wide enough window.

### Changed
- Exact vertical spacing on Home's hero area, matched to measurements: 75px from the top bar to the headline, 60px from the lede to the pill, 35px from the pill to the mascot's tip.

## [1.0.234] - 2026-10-31

### Changed
- The pill-shaped hero on Home matches the mockup more closely: the duplicate logo above the headline is removed, the label and the title field sit on one row instead of two, and the arrow button lost its circular background in favor of a plain, larger icon, all at the exact sizes given.

## [1.0.233] - 2026-10-31

### Changed
- Home's "Start a new manuscript" card is now a large pill-shaped hero input, replacing the smaller card it used to share equal billing with Import backup and Import manuscript.

## [1.0.232] - 2026-10-31

### Added
- Kaamy joins Kaamilla as a selectable mascot in Settings.
- Each mascot now has several poses and shows a random one each time its tip appears, instead of always the same picture.

## [1.0.231] - 2026-10-31

### Changed
- The mascot's own avatar now scales up proportionally when its speech bubble is taller (e.g. a tip with a linked action), instead of staying a fixed size regardless of the bubble next to it.

## [1.0.230] - 2026-10-31

### Added
- An optional mascot (Kaamilla, more to come) can show up with tips on Home, such as pointing out the Guide — off by default, turned on from Settings. Short tips get a speech bubble with a pointed corner anchored near the mascot's mouth; tips with a linked action (like opening the Guide) drop the point and use a plain bubble with a docked button instead, since those are long enough that a point would land nowhere near the mouth either way.

## [1.0.229] - 2026-10-30

### Changed
- The "Codex" nav button in the top bar is now always visible, including on the Home screen before any manuscript is open, with a small dot showing whether it's connected. Clicking it without a manuscript open shows pairing and connection status only; the full sharing/versions dialog still opens once a manuscript is open. The separate "kaampi Codex" card on Home is removed — this is now the one place for it.

## [1.0.228] - 2026-10-29

### Changed
- The top bar's logo size, height, horizontal padding, and app-switcher pill spacing/sizing now match kaampi Explore's own top bar, for a consistent look across the family. Write's own menu items (Manuscripts, Guide, Settings) are unchanged.

## [1.0.227] - 2026-10-29

### Fixed
- The Synopsis panel's heading and lede no longer become illegible when a dark editor background texture (e.g. "Fabric", "Triangles", "Forest", "Milky Way") is selected in Manuscript Settings — they now switch to a light ink automatically instead of always using the dark, paper-oriented ink color.

## [1.0.226] - 2026-10-29

### Changed
- The three screenshots in the Guide's "Write together with AI" pilot section are now captured in the light theme at a higher source resolution (2560×1440), replacing the earlier dark-theme, lower-resolution versions.



### Changed
- Piloted a more pedagogical layout for the in-app Guide, inspired by Sudowrite's own docs: the "Write together with AI" section now walks through Draft, selecting a passage for Extend/Elaborate/Rewrite, and Write a beat as three labelled steps, each illustrated with a real screenshot of the app, plus a closing tip. Other Guide sections are unchanged for now — this was a trial of the format before extending it further.



### Changed
- The top-bar app switcher now shows each app's actual wordmark logo (kaampi Write, Explore, Comic), matching kaampi Explore's own switcher, instead of plain text. Dark-mode versions of the kaampi Explore and kaampi Comic logos were generated using the exact same recolor kaampi Write's own light/dark logo pair already uses.

### Added
- A top-bar app switcher, matching kaampi Explore's own: kaampi Write, kaampi Explore and kaampi Comic as a row of links next to each other. In the desktop app, a sibling app that's actually running shows as a live, clickable link with a status dot; otherwise (or in the plain web app, where a live check isn't possible) clicking opens a small dialog with the app's address, an install link, and a manual "Open app" action.

### Changed
- The top-bar button that opens the per-manuscript backup/sharing/versions dialog is now labeled "Codex" instead of the leftover internal name "Core" (the dialog's own copy already said "kaampi Codex" throughout — only the button itself hadn't caught up).

## [1.0.221] - 2026-10-29

### Changed
- The app-wide Settings dialog is now the same size as Manuscript settings, with a two-column layout — AI settings on the left, Editor (revisions, paper color) on the right — instead of a cramped single narrow column.

## [1.0.220] - 2026-10-29

### Changed
- Split Settings into two dialogs: a new, always-reachable "Settings" on the top bar (its own menu item, next to Manuscripts and Guide) for everything app-wide — AI engine and server, the three model pickers, context window, writing primer, how many revisions to keep, and the editor's paper color — and "Manuscript settings" (the old in-editor Settings, renamed) for what's specific to the open manuscript: craft fields, typography, illustrations, proofreading thoroughness, and polish instructions. The duplicate "Connect a local AI" section on the start screen is gone — Settings now covers that from anywhere, with no manuscript needed first.

## [1.0.219] - 2026-10-29

### Added
- A kaampi Codex card on the start screen, as prominent as the other start cards — shows connection status at a glance (connected, paired but offline, or not connected with an inline pairing-key field) instead of requiring a manuscript to already be open to find the small "Core" button that did this before.

## [1.0.218] - 2026-10-29

### Changed
- The chapter image moved from a settings popover into the editor itself, right below the chapter title — it now scrolls away with the prose instead of being tucked out of sight in Chapter settings.

## [1.0.217] - 2026-10-29

### Added
- A macOS desktop build (`.dmg`, universal — one download for both Apple Silicon and Intel), alongside the existing Windows and Linux installers. kaampi Codex pairing now works from the macOS desktop app too, storing its credential in Keychain. Unsigned and unnotarized: Gatekeeper requires a one-time right-click-Open (or `xattr -cr`) before it'll launch — see docs/running.md.

## [1.0.216] - 2026-10-29

### Added
- A Linux desktop build (`.deb` and `.AppImage`), alongside the existing Windows installer. kaampi Codex pairing — previously Windows-only — now works from the Linux desktop app too, storing its credential in the Secret Service (GNOME Keyring, KWallet, etc.) instead of Windows Credential Manager.

## [1.0.215] - 2026-10-29

### Changed
- The Maximize/Restore control moved from the bottom action bar to the top-right of the chapter-name panel, and now renders as an icon instead of the words "Maximize"/"Restore".

## [1.0.214] - 2026-10-29

### Changed
- The editor's scrollbar now matches the chosen paper color, not just the app's dark/light theme — a light scrollbar on a warm/sepia/gray paper, a dark one on dark paper, regardless of which theme the rest of the app is in.

## [1.0.213] - 2026-10-29

### Fixed
- The "Manuscripts" menu (top-left) opened anchored to its own right edge — a fix meant only for the right-aligned File/Tools menus but applied to the shared panel style everywhere — which pushed it off the left edge of the window since the Manuscripts trigger itself sits at the left. Manuscripts now anchors left again; File/Tools keep their own right-anchored variant.

## [1.0.212] - 2026-10-29

### Added
- A new "Editor paper" setting (Settings → General): choose the writing surface's own background and text color from five presets (Match theme, Warm white, Sepia, Soft gray, Dark), independent of the app's overall dark/light theme. Lets you keep a dark theme everywhere else while writing on a lighter page, without that fighting the theme toggle. Applies app-wide, saved locally, like the theme choice itself — not a per-manuscript setting.

## [1.0.211] - 2026-10-29

### Fixed
- The File/Tools/Settings/Find-Replace menus (and the locale and theme-mode dropdowns) opened anchored to their trigger's left edge, which could push the panel past the window's right edge and force an unwanted horizontal scrollbar on the whole app — all of these triggers live in the right-aligned part of the top bar. Anchored to the trigger's right edge instead, so the panel grows into space that's actually there.

## [1.0.210] - 2026-10-28

### Changed
- The close icon's color is now the same neutral gray as the native scrollbar thumb (sampled per theme, not a themed accent color), so it reads as a quiet chrome control rather than drawing extra attention.

## [1.0.209] - 2026-10-28

### Changed
- The chapter title field in the editor is now centered instead of left-aligned, including the padding on both sides (it previously zeroed the left padding to flush the old left-aligned text, which skewed centered text off-axis).

## [1.0.208] - 2026-10-28

### Fixed
- The new close icon sat noticeably below the actual top-right corner in some dialogs — the header rows it lives in use `align-items: baseline` (Story Bible cards) or `center` (Settings, Core dialog), both wrong for an icon-only button next to a plain text title, dragging it down. Pinned with `align-self: flex-start` so it sits flush at the top regardless of the row's own alignment.

## [1.0.207] - 2026-10-28

### Changed
- Every dialog/card that has its own header-row dismiss control now uses the same close icon (a new design asset) instead of a mix of a "Close" text button and a plain "×" character — about 20 dialogs, including Settings, the Core connection dialog, Ask the Manuscript, the Story Bible cards, Critics/Proofread/Developmental Edit, and the chapter options popover. Cards whose only close action sits in a footer row next to a primary button (e.g. "Ask about this passage", Find/Replace) keep their text "Close"/"Cancel" button — that's a different pattern (a footer confirm/cancel row), not the header dismiss control this request was about.

## [1.0.206] - 2026-10-28

### Fixed
- The previous spacing fix for the Core dialog's title (v1.0.204) silently did nothing — a more specific `.edit-card h2 { margin: 0; }` rule was overriding it regardless of the margin value, so the gap stayed at 0px no matter how large a number was set. Fixed by raising the selector's own specificity instead of just raising the value, and increased the gap enough to be clearly visible this time.

## [1.0.205] - 2026-10-28

### Changed
- Renamed "Core" to "kaampi Codex" throughout the app's visible text (the Core connection dialog, the Backup dialog's "Send to Core" action, and a handful of error messages) — "Core" was the old internal/working name for the service now branded kaampi Codex. Also rewrote the Core connection dialog's explanatory copy (what it is, what "not connected" or "offline" actually mean) to read more like an explanation and less like a status code, for someone opening it without prior context on kaampi Write or kaampi Codex.
- Caught several other leftover "StoryBook"/"StoryCore"/"ComicBook AI" mentions in error messages, guide text and code comments that the original rename pass missed.

## [1.0.204] - 2026-10-28

### Changed
- More breathing room between the Core dialog's eyebrow label ("kaampi Write Core") and the manuscript title below it — they sat almost flush against each other.

## [1.0.203] - 2026-10-28

### Fixed
- The Core connection dialog still said "Storybook Core" and referred to "Storybook" by name in several places (pairing key label, local-storage notice, and the "show this manuscript in Sandbox/Comic" sharing switches) — missed in the earlier rename pass. Now says kaampi Write / kaampi Explore / kaampi Comic throughout. A couple of Core-revision-restore error messages had the same leftover naming and are fixed too.

## [1.0.202] - 2026-10-28

### Changed
- The UI typeface changed from Figtree to Barlow, matching the condensed grotesque family the kaampi logo itself is built on (Bahnschrift). Newsreader stays as the headline/prose typeface — the two sit close enough that the swap isn't worth it, and Newsreader's warmer, more editorial character fits a writing tool better than a fully neutral serif would. Self-hosted as before (six static weights/styles, no network request).

## [1.0.201] - 2026-10-28

### Added
- A browser-tab favicon, set for the first time (none was configured before) — the same magenta kaampi Write mark as the desktop app icon, not transparent.

## [1.0.200] - 2026-10-28

### Changed
- Replaced the desktop app icon (taskbar, window, installer, Windows Store tile assets) with the new kaampi Write mark — a magenta square with a white serif "W" — generated from a single square source image via Tauri's own icon generator so every required size and format (`.ico`, `.icns`, all PNG tiers) stays consistent.

## [1.0.199] - 2026-10-28

### Changed
- Replaced the StoryBook AI wordmark with the new kaampi Write logo (provided as SVG, swapped in as vector files for crisp rendering at any size instead of the previous raster PNGs), in both the top bar and the home screen, with matching light/dark variants.

## [1.0.198] - 2026-10-28

### Changed
- Renamed the app from "StoryBook AI" to "kaampi Write" throughout the visible UI, in-app copy (all three locales), window title, installer prose, launcher scripts and documentation — part of the wider "kaampi" rebrand of the creative-tool suite (alongside kaampi Comic, kaampi Explore and kaampi Codex). This release intentionally does not touch anything that identifies the already-installed desktop app to Windows or to a paired local Core service: the Tauri app identifier (`se.ocedo.storybookai`), the deep-link scheme, the Core pairing identity string (`"app": "storybook"`), and the Windows Credential Manager entry are all unchanged, so an existing install keeps working and stays paired exactly as before. The GitHub repository itself has not moved yet; that is a separate, deliberate step.

## [1.0.197] - 2026-10-28

### Added
- Pairing with a local Core connection no longer requires copying a 64-character key by hand on a machine where Core was just installed. A freshly installed Core writes its first-run pairing credentials to a local file next to its database; the desktop app now reads Storybook's own entry from that file automatically (via a new `core_auto_claim` Tauri command) before ever showing the manual key field, claiming it once so a sibling app reading the same file later gets its own turn instead of the same token. The manual key field is still there as a fallback whenever auto-pairing finds nothing (different machines, a key already claimed, non-Windows).

## [1.0.196] - 2026-10-28

### Changed
- The Storybook Core dialog is reorganized into two tabs, Sharing and Versions, instead of one long scrolling list — the sharing switches and the private-version controls (save now, auto-save, version history, restore/compare) were sharing a single view with no separation. The dialog heading now shows the open manuscript's own title (truncated with an ellipsis past 32 characters) instead of a generic "Storybook Core" label — you already know you're in a Core dialog from the button you just clicked; what you don't get for free is which manuscript. The dialog's outer size now stays fixed regardless of which tab is open — only the tab's own content scrolls, so switching tabs no longer resizes the card.

## [1.0.195] - 2026-10-27

### Added
- The Backup dialog now offers "Send to Core" alongside the existing JSON file backup, when paired with a desktop Core connection. It saves a private version of the open manuscript straight to Core without leaving the dialog, reusing the same checkpoint the Core connection dialog's own "Save private version to Core" button already uses. The JSON file stays the primary, always-available action — Core is an addition, never a replacement, consistent with Core being optional and never blocking local saves.

## [1.0.194] - 2026-10-27

### Added
- A "Core" button in the top bar, visible whenever a manuscript is open, opens a per-manuscript connection dialog for Storybook Core — a separate, optional local service (own repo: `ocedo-apps/StoryCore`) that can hold private whole-manuscript version checkpoints and a filtered, shareable projection for sibling apps (Sandbox, Comic). Off by default; the manuscript's prose and Story Bible keep living in local IndexedDB exactly as before regardless of Core's presence.
- Desktop-only for now: pairing, publishing and revoking read through a native Tauri bridge (`core_bridge.rs`) using a loopback-only connection (`127.0.0.1:43127`) and Windows Credential Manager for the paired key — never exposed to the webview or persisted in browser storage. The browser/web build shows the dialog but reports that the connection requires the desktop app.
- An offline-tolerant sharing queue (`CoreSharingOutbox`) marks a manuscript's Sandbox/Comic visibility pending on every local save or deletion and retries publication on launch, reconnection and a 30-second interval — a Core outage never blocks or alters the local save itself.
- Sharing publishes only the existing filtered export (`packManuscriptExport` — full prose and synopsis, but only locked, visible Story Bible facts; Brainstorm and unapproved/hidden facts never cross this boundary), the same rule Draft itself already follows.

### Fixed
- `@ocedo-apps/storycore` (the shared schema this release's Core wiring depends on) is consumed as a git dependency pinned to that repo's root — its own package.json must stay buildable as that package directly, not nested under a `packages/` nothing outside the repo can see. Restructured there to keep that contract intact while still separating it from the actual Core service's code (now in that repo's own `packages/service`).

## [1.0.193] - 2026-10-26

### Fixed
- The Guide/Handbook page had no side padding at all — text and the category tabs sat flush against both the left and right rail borders, unlike every other reading page (Synopsis, Timeline, Development method) which already gets breathing room on both sides. Added the same padding.

## [1.0.192] - 2026-10-26

### Fixed
- The chapter row's remove-chapter trash emoji (🗑️) got the same line-art SVG treatment as the settings/scenes icons in the previous release — same blurry/tinted-color-emoji issue, just missed the first pass.

## [1.0.191] - 2026-10-26

### Fixed
- Replaced the chapter row's settings (⚙️) and scenes (🎬) color-emoji icons with the app's own line-art SVGs — the emoji rendered blurry and could pick up an unintended color tint from the OS/browser's own emoji font, neither of which the app's theme ever controlled.

## [1.0.190] - 2026-10-26

### Added
- Critics: three distinct reader personas — Impatient reader, Pacing critic, Confused reader — each give their own quote-and-note read on the open chapter, separate from Analyze's existing categories. Opt-in per run (pick one or more in a setup card before running; each checked persona is its own AI call) and grouped by persona in the results, so a disagreement between two critics on the same passage is easy to spot.

## [1.0.189] - 2026-10-26

### Fixed
- The relationship-mirror rewrite from the previous release could still invent a feeling: "reluctant mentor to Wick" on Amber's card risked mirroring to "reluctant student of Amber" on Wick's — inverting the role correctly but implying Wick shares an attitude the original fact never stated (the reluctance was Amber's). The mirror prompt now explicitly drops a describing word about the original character's own attitude or feeling rather than carrying it onto the other side.

## [1.0.188] - 2026-10-26

### Fixed
- Locking a relationship fact that names another character (e.g. "reluctant mentor to Wick" on Amber's card) used to suggest the exact same wording on the other character's card with just the name swapped — "reluctant mentor to Amber" on Wick's, same role, backwards. A directional relationship (mentor/mentee, parent/child) needs its role inverted, not just its name swapped; a symmetric one ("met at the docks") didn't have this problem. The mirrored suggestion is now drafted by the Review model so it reads correctly from the other character's point of view, with the old mechanical name-swap kept as the fallback if that call fails or returns nothing usable — the suggestion still lands in the review queue either way, never locked automatically.

## [1.0.187] - 2026-10-26

### Added
- A new "Writing Tips" tab in the Guide (Handbook) — 14 sections of practical craft and habit advice, not app documentation: finding a writing routine (short/regular sessions, draft-then-edit, a concrete time/place plan, stepping away when stuck, reading widely), writing an opening that hooks a reader (raise a question, hold off on backstory, show traits through detail, save the surprises), a self-check pass for AI-assisted prose (over-explaining, predictability, repetitive emotional beats, straight timelines), and a sources section citing the underlying research and craft writing. All three shipped locales (English, Swedish, Norwegian).

## [1.0.186] - 2026-10-25

### Fixed
- A reasoning model (local, via Ollama or LM Studio/an OpenAI-compatible server) that spends its whole reply budget on hidden "thinking" before writing anything visible used to surface as a plain "returned an empty reply" or a bare "cut off" message with no clue why — now both providers check the cutoff/reasoning-exhaustion condition first, and when the server reports `reasoning_tokens` (LM Studio does), the error names the count and suggests turning off the model's "thinking" toggle or raising the reply budget. Also extended the fixed-plus-reasoning-headroom budget (already applied to Polish) to Analyze and to fact extraction, the two operations a tester hit this on directly — a 1800-of-1800-token reasoning burn on Analyze, and a cutoff at the shared 4000-token extraction budget.

## [1.0.185] - 2026-10-24

### Added
- Series entity pages: click a locked entity's name in a series' Story Bible to open its own page — a portrait (up to 4 reference images, visual only, never sent to Draft), and a free-form "History & description" field for writing its lore as a wiki article, not a fact list. Nothing in that text reaches Draft directly; an "Extract facts from this text" button runs it through the same extractor a lore import uses, landing proposed facts in the review queue, source-labeled "Lore". The entity's already-locked facts show alongside it, labeled "what Draft sees" — the structured claims that actually reach the model, kept visibly separate from the free-written history.

## [1.0.184] - 2026-10-24

### Added
- A "Check consistency" button on a series' own Story Bible compares every locked fact across the series and all its books, flagging any entity+predicate where two sources disagree — including claims two sibling books independently locked without ever seeing each other's version. Instant and deterministic, no AI call involved; shows "No contradictions found" when there's nothing to flag.

## [1.0.183] - 2026-10-24

### Added
- A book that belongs to a Series now warns before silently diverging from that series' canon: locking a new or edited fact whose value differs from what the series already says for that entity — "Differs from the series: Identity: 'Guardian of Dun Sorrow' — this book would now say something else" — asks for confirmation ("Lock anyway") instead of overriding it without a word. The series keeps its own value either way unless you also send the book's new one up to it; a standalone book, or a value that matches series canon, sees nothing new.

## [1.0.182] - 2026-10-24

### Added
- "Export for other apps" on a book that belongs to a Series now bakes that series' own locked facts into the export too, alongside the book's own — the same canon Draft itself writes with. A sibling app reading the export sees a self-contained Story Bible, not just this one book's slice of it. No change for a standalone book.

## [1.0.181] - 2026-10-24

### Added
- A book that belongs to a Series now actually writes with that series' locked canon in mind — Draft, Recast, scene-level Draft/Recast, Polish, passage rewrites, illustration-prompt entity detection, and Character Interview all now see the series' own locked facts as a base layer, with this book's own locked facts winning on anything it's established differently. Purely additive to what the model sees; a book's own Story Bible is untouched, and a standalone book (no series) behaves exactly as before.

## [1.0.180] - 2026-10-24

### Added
- Series world-building: each series now has its own Brainstorm, Synopsis, and Story Bible, separate from any book in it — build a series' world before any book exists, the same way you'd build one book's. Extract facts from the series synopsis the same way a book's synopsis works; nothing locks in automatically, everything lands in a review queue first. A book's own locked Story Bible facts can be sent up to the series with a new "Send to series" button, tagged with which book (and chapter, if any) it came from — shown as "Established in: Book Title, Chapter N" in the series' own Story Bible.

## [1.0.179] - 2026-10-24

### Added
- Series: a new "Series" section on the shelf lets you group books that share a world — create a series, open it to see and manage its books, start a new book inside it, or move an existing standalone manuscript into one from its shelf row. Closing a book you opened from inside a series takes you back to that series, not the whole shelf. This is the first step of a larger series feature; building the series' own world/lore (so it can be written once and carried into every book in it) is still to come.

## [1.0.177] - 2026-10-24

### Added
- Bring a series forward: a new "Import previous book" entry (FILE menu) lets you load the previous book's own "Export for other apps" file and pick which characters, places, and other entities to carry into this one. Their locked facts land in the review queue as ordinary candidates — nothing locks in automatically, since what held in the last book isn't guaranteed to still hold in this one — each one clearly marked "Source: Previous book". A free-text field on the same card covers anything from the previous book that was never captured as a structured fact; an AI reads it and proposes facts the same way importing a lore article does, carrying the same "Previous book" source label.

## [1.0.176] - 2026-10-23

### Added
- The Ollama engine can now point at a server on another computer on your local network, not just this one — Settings now shows the same "Server address" field for Ollama that the OpenAI-compatible engine already had, with your own computer's default as a placeholder. The Guide section and FAQ entry on running an AI server elsewhere on the network, and the CORS error message, are updated to match.



### Fixed
- Polish could cut off after the chapter's first scene on a reasoning model — the model's own "thinking" before it writes a word eats into the same token budget as the rewrite itself, and Polish's budget had no room set aside for that. It now reserves an extra 2000 tokens for a model's reasoning pass, on top of the existing length-based budget for the rewrite.

## [1.0.174] - 2026-10-22

### Fixed
- The progress dialog nearly disappeared into the dimmed backdrop in the dark theme — its card used the app's own (dark) panel color, which sat too close in tone to the overlay behind it. It now always uses a light "lightbox" card, matching ComicBook AI's own dialog, regardless of which theme the rest of the app is in.

## [1.0.173] - 2026-10-22

### Added
- Draft now shows the same progress dialog as Extract/Analyze/Summarize for the dead stretch between clicking the button and the model's first word arriving (worst on a cold model load) — it disappears the instant text starts streaming into the chapter, so the live generation itself is never covered.

## [1.0.172] - 2026-10-22

### Added
- A blocking progress dialog — ported from ComicBook AI's beat-analysis dialog, same animated spinner, focus lock, Escape/Cancel, and background lockout — now shows for AI jobs that have nothing else visible to watch while they run: Extract facts (chapter, brief, synopsis, brainstorm note, interview), Analyze, Polish, Illustration prompt, Ask manuscript, Ask about this chapter, Develop, Import lore articles, and Summarize. Draft, Extend/Elaborate/Instruct/Beat, Recast, Translate, the brainstorm/interview chats, Proofread, and Developmental keep their existing live feedback — the dialog would only hide it there.

### Fixed
- Extract facts, Extract facts (synopsis), Extract facts (brainstorm note), and Summarize had no way to cancel a slow request — Cancel/Escape is now wired through all of them like it already was for Analyze and the others.

## [1.0.171] - 2026-10-22

### Fixed
- The ⚙️/🎬 chapter popover (Settings and Scenes) only ever rendered inside the chapter-writing view, so clicking either icon from Brainstorm, Synopsis, Development method, Timeline, or Briefs quietly did nothing. It now renders regardless of which page you're on.

## [1.0.170] - 2026-10-22

### Fixed
- Synopsis, Development method, and Timeline/Plotlines sat flush against the panel edges, unlike Brainstorm and Briefs — a side effect of an earlier change that removed the manuscript view's own horizontal padding. All three now get the same inner margin Brainstorm and Briefs already had.

## [1.0.169] - 2026-10-22

### Fixed
- Summarize could return what reads as new chapter prose (invented scenes and dialogue) instead of a short digest, on a weaker or less instruction-following model — the system prompt is now explicit that this isn't a continuation task. Summarize always proposes its result for you to accept or discard now, even on a first, empty summary, so a bad result like that never lands unreviewed.

## [1.0.168] - 2026-10-22

### Changed
- Summarize no longer silently overwrites a chapter summary that's already there (handwritten or from an earlier Summarize). It still fills an empty summary directly, but with existing text, it now proposes the new one in a small box below — "Use this" applies it, "Discard" drops it, the current text stays put either way until you choose.

## [1.0.167] - 2026-10-22

### Changed
- "Extract facts" and "Summarize" now sit next to each other, same width, when the chapter rail is wide enough — and stack, still same width, when it isn't.

## [1.0.166] - 2026-10-22

### Changed
- The chapter summary field no longer shows placeholder text between the "Extract facts" and "Summarize" buttons when it's empty — just blank space to write into or leave for Summarize to fill.

## [1.0.165] - 2026-10-22

### Changed
- The chapter brief panel's "Extract facts" and "Summarize chapter" controls are now small buttons instead of text links, and the long explanatory sentence under an empty summary is gone — replaced with a short placeholder. "Summarize chapter" is now just "Summarize".

## [1.0.164] - 2026-10-21

### Fixed
- The cross-app export ("Export for other apps") and the manuscript backup's `adaptationChapters` could include a trailing scene with no text and no instructions — an "add scene" placeholder the author hadn't written into yet. Both now leave it out (a chapter keeps at least one real scene regardless).

## [1.0.163] - 2026-10-21

### Fixed
- The actual cross-app export ComicBook AI reads (the `@ocedo-apps/storycore` "StoryCore" format, FILE → "Export for other apps") was missing `synopsis`, `brief`, and `scenes` — the previous release (v1.0.162) had extended a different export (the manuscript backup JSON) instead. StoryCore's own format bumped 1 → 2 to add a manuscript-level `synopsis` and, per chapter, `brief` plus `scenes` (id, order, title, description, instructions) — the same shape the backup export already carries. A format-1 export (from before this release) still reads fine; the new fields fill in as empty.

## [1.0.162] - 2026-10-21

### Added
- The manuscript backup JSON (format bumped 1 → 2) now also includes `adaptationChapters`: every live chapter in reading order, each with its id, title, brief, full prose, and its scenes (id, order, title, the scene's own prose as `description`, and its writing instruction as `instructions`) — built for an external comic-adaptation tool to read directly, without having to re-derive chapter/scene order or filter out discarded chapters itself. The existing `book` field is untouched, so restoring an old or new backup into StoryBook AI behaves identically either way.

## [1.0.161] - 2026-10-21

### Added
- A "Remove" button on each locked fact in the Story Bible, for a claim that's simply wrong (a near-duplicate left over from a merge, a fact attributed to the wrong entity) rather than one being corrected with a new value — asks for confirmation first, and can't be undone. If another fact had superseded it, that fact becomes current again instead of pointing at a row that no longer exists.

## [1.0.160] - 2026-10-21

### Fixed
- The chapter ⚙️/🎬 popover could run off the bottom of the screen for a chapter row low in the list, with no way to scroll the rest into view (most noticeable with several scenes open at once). It now always stays fully on screen and scrolls internally instead.

## [1.0.159] - 2026-10-21

### Fixed
- Briefs board: a chapter card with a long brief grows to fit it now, instead of the text silently overflowing past the card's own border into whatever sat below it. Two flexbox/grid sizing defaults were fighting the card's natural content-based height — both fixed.

## [1.0.158] - 2026-10-20

### Changed
- The chapter row's remove button is now a trash can icon (🗑️) instead of a plain "×" — matches the size and style of the row's other icons (⚙️ settings, 🎬 scenes).

## [1.0.157] - 2026-10-20

### Fixed
- The stronger side shadow from v1.0.156 bled into the chapter title bar and bottom toolbar, since it widened the blur more than the matching negative spread that keeps it off the top/bottom edges. Rebalanced so the shadow is strictly left/right again.

## [1.0.156] - 2026-10-20

### Changed
- The side shadow is stronger and more visible (more opacity, more blur). The prose column is wider (54rem → 60rem, chapter title bar along with it), and the text inside it has a wider inner margin (1.5rem → 3rem on each side) so it no longer sits so close to the page's edges.

### Fixed
- The rare-word/AI-tic/fact highlight overlay had its own separately hardcoded padding that hadn't been kept in sync with the prose padding bumped in v1.0.151 — highlight marks could drift from the actual text they were meant to cover near the top/bottom. Now shares the same padding values.

## [1.0.155] - 2026-10-20

### Fixed
- The new side shadow (v1.0.154) was invisible — it was silently clipped by its own scrolling parent (setting one overflow axis to a value other than `visible` forces the other axis to clip too, even when never set explicitly). Moved the shadow to the non-scrolling wrapper one level out, where it isn't clipped.

## [1.0.154] - 2026-10-20

### Added
- A soft depth shadow on the left/right edges of the prose page, so it reads as lifted slightly off the background rather than just outlined.

## [1.0.153] - 2026-10-20

### Added
- Six new editor backgrounds: Cork board, Triangles, Fabric, School doodles, Pine trees, Leaves — seamless repeating tiles, alongside the existing Misty forest and Milky Way photos (which still scale to cover, not repeat).

## [1.0.152] - 2026-10-20

### Fixed
- The top/bottom fade over the prose also dimmed the scrollbar track and thumb, since it spans the full width of the area the scrollbar sits in. Now measures the actual scrollbar width and insets the fade from the right by that amount, so the scrollbar stays clear.

## [1.0.151] - 2026-10-20

### Fixed
- The prose text had too little breathing room at the top/bottom of the editable area, so a line could end up scrolled partway into the top/bottom fade overlay and look faded even though it was ordinary text, not a hint of more content. Increased the prose's own top/bottom padding (60px / 80px) past the fade's own height, so a scrolled-to-the-edge line always clears it.

## [1.0.150] - 2026-10-20

### Changed
- The bottom toolbar's word count and action buttons spread across the full width of the bar again (word count on the far left, buttons stretched to the far right) instead of staying clustered in the prose column's width — the chapter title bar is unaffected, still aligned with the prose column.

## [1.0.149] - 2026-10-20

### Changed
- Removed the gap above and below the prose page — the chapter title bar, the prose box, and the bottom toolbar now sit flush against each other with no background showing between them, instead of a small margin on each side.

## [1.0.148] - 2026-10-20

### Fixed
- The chapter title bar and bottom toolbar had a thin sliver of the background visible along their left/right edges — a percentage-based bleed margin doesn't exactly cancel a percentage-based padding on its parent (they resolve against different box widths), so the two never quite lined up. Rebuilt without that cancellation trick: the bars are genuinely edge to edge now, no sliver anywhere.

## [1.0.147] - 2026-10-20

### Changed
- The chapter title and the bottom toolbar's word count/buttons now align with the width of the prose column instead of spreading across the full bar — the bar's background still bleeds edge to edge, but its content stays in the same narrower, centered column as the manuscript text, matching the reference mockup more closely.

## [1.0.146] - 2026-10-20

### Fixed
- The chapter title bar and bottom toolbar had rounded corners left over from when they were narrow, centered cards — now that they're flush with the edges on all sides, those corners left small triangular slivers of the background peeking through at the top and bottom. Squared off.

## [1.0.145] - 2026-10-20

### Changed
- The chapter title bar and the bottom toolbar now sit flush against the top/bottom of the editor too (previously there was a vertical margin above/below them), in maximized view as well — previously that view kept them narrow and centered, now it matches the regular view's full-width bars.

## [1.0.144] - 2026-10-20

### Changed
- The chapter title bar and the bottom toolbar row now span the full width of the editor, same cream/panel background edge to edge — matching the reference mockup. The prose column itself stays centered and narrower, so any editor background image still shows on both sides of it, just not behind the title bar or the toolbar row anymore.

## [1.0.143] - 2026-10-20

### Changed
- The prose page now has a soft fade at its top and bottom edge, hinting that text continues above/below without a hard cut — it stays put over the text as you scroll rather than scrolling away with it.

## [1.0.142] - 2026-10-20

### Changed
- Chapter settings and Scenes used to live inline above the chapter's prose, pushing it down whenever either was opened. Both now open as a floating popover instead — a ⚙️ and a 🎬 icon on each chapter row in the Chapters rail — laid on top of the manuscript rather than shrinking it, so the writing area keeps its full height. Opening either for a chapter other than the one currently open also switches to it, same as clicking the row itself, since the underlying actions (Recast, Draft/Recast/Analyze a scene) apply to whichever chapter is open.

## [1.0.141] - 2026-10-20

### Changed
- The home page now opens with a 2×2 "Where would you like to start?" card grid (Start a new manuscript, Import backup, Import manuscript (text file), the Guide) instead of a row of small buttons plus a separate title form — each card states what it does before you click it. Same four actions as before, reorganized rather than replaced.

## [1.0.140] - 2026-10-20

### Changed
- Renamed "Import from Novelcrafter" to "Import manuscript (text file)" — it turns out "Novelcraft" and "Novelcrafter" are two different, unrelated tools, and the import itself was never actually Novelcrafter-specific (plain text/Markdown, not any proprietary format). Added a line inviting authors using a tool that doesn't export plain text/Markdown to get in touch with a sample export file.

## [1.0.139] - 2026-10-20

### Added
- "Import from Novelcrafter" on the home page: starts a brand-new manuscript from a Markdown export (pick Markdown, not Word, when exporting from Novelcrafter). Upload a file or paste the text; the import splits on Markdown headings into chapters, with an adjustable heading-level picker and a live chapter-count preview — different writing tools' exports don't agree on which heading level marks a chapter, so this is a guided guess rather than a fixed assumption. `*italic*`/`**bold**` markers convert into real formatting, the same conversion already offered under Tools → Convert markers to formatting. First of a planned family of import adapters (Scrivener and Sudowriter next); a Codex/character import is deferred until a real Novelcrafter export sample is available to build and test against — Novelcrafter's own documentation doesn't publish that file's internal format.

## [1.0.138] - 2026-10-20

### Changed
- The bottom bar (word count, highlight toggles, Draft/Polish/Stats/etc. buttons) used to sit directly on the manuscript background — now boxed in its own panel, same treatment as the chapter-head card and the left/right rails, so it reads cleanly against any editor background.

## [1.0.137] - 2026-10-20

### Added
- Settings → Typography now has an "Editor background" picker: a decorative backdrop (none, a misty forest, or the Milky Way) shown behind the chapter-head card and the prose page, live-editor-only — it never touches Publish exports, which have no such canvas. The chapter-head card and the prose page are both now fully opaque regardless of this setting, so any picture can be chosen without checking it for contrast against the writing.

### Fixed
- The bordered editing surface from v1.0.135 only wrapped tightly around whatever text was already there, so a short chapter looked like a small boxed input rather than a page — the border stopped right after the last line instead of reaching toward the bottom of the available space. It now fills the full visible height by default (and keeps growing — scrolling inside, as before — once the text outgrows that).

## [1.0.135] - 2026-10-20

### Changed
- The prose editor's text area used to span exactly as wide as its own text, with no visual boundary — hard to tell where the editing surface actually ends. It now has real padding around the text and a thin border marking its outer edge, same treatment in both themes. The rare-word highlight overlay (an invisible twin of the text used to paint highlight marks) got matching padding and a transparent border of the same width so its marks stay pixel-aligned with the real text underneath.

## [1.0.134] - 2026-10-20

### Added
- The left (Chapters) and right (Story Bible) panels can now be resized by dragging their inner edge, instead of being fixed at 15rem/28rem. Each panel keeps its own remembered width within sane bounds (180–420px left, 280–620px right) whether pinned open or auto-hiding at the edge.

### Fixed
- The Windows desktop build has been failing CI since v1.0.127 (`npm ci` dying with "Permission denied (publickey)") because `package-lock.json`'s locked `@ocedo-apps/storycore` dependency recorded a `git+ssh://` resolved URL instead of `git+https://` — likely baked in by an `npm install` run on a machine with an SSH URL rewrite for github.com. The CI runner has no SSH key for GitHub, only token-based HTTPS access, so every build since then failed before it ever reached the actual app build step. Fixed by correcting the one `resolved` entry back to `git+https://`; verified with a real `npm ci` in an isolated directory.

## [1.0.133] - 2026-10-20

### Fixed
- v1.0.132's new native Save dialog never actually worked: `showSaveFilePicker` was called detached from its `window` receiver (`const picker = window.showSaveFilePicker; picker(...)`), which every real browser throws for ("Illegal invocation" — Web API methods require their original receiver), not just Brave. Backup, Publish, and the app export now call it correctly (`picker.call(window, ...)`), open the picker synchronously inside the click/submit handler before any async work (font loading, PDF/IDML rendering) can consume the click's transient user activation, and show a saving state plus a clear error if the write itself fails rather than silently closing the dialog. A visible hint in both dialogs now also points out Brave's own "Ask where to save each file before downloading" setting, for the fallback path on browsers where the picker API is unavailable or disabled. Confirmed fixed by Mats directly in Brave.

### Fixed
- Polish requested a flat 1,800 output tokens regardless of chapter length, and the result of hitting that limit — the model's reply silently cut off mid-rewrite — was never checked at all, both confirmed on a real 4,000-word chapter's failed Polish pass. Polish's token budget now scales from the chapter's own length, with headroom for the rewrite running a little longer than the original. Both local-model adapters (Ollama, and the OpenAI-compatible one LM Studio/Strata-style servers use) now also throw a clear error whenever a non-streaming reply's own finish/done reason says it was cut off at the token limit, instead of silently handing back partial prose as if it were the whole, finished reply — a gap that affected every feature using a non-streaming call, not just Polish.

## [1.0.132] - 2026-10-18

### Fixed
- Backup, Publish, the app-export, and the Story Bible card export all downloaded through a hidden `<a download>` plus a synthetic click — reported as doing nothing at all in Brave (no dialog, no file, no error) when creating a backup. All four now try a real native Save dialog first (the File System Access API's `showSaveFilePicker`, supported by every Chromium browser including Brave, plus the desktop app's own WebView2), only falling back to the old `<a download>` trick where that API doesn't exist (Firefox, Safari) or fails for a reason other than the user cancelling — cancelling the new dialog is now also respected as a real "don't save," not silently retried with the fallback.

## [1.0.131] - 2026-10-17

### Fixed
- IDML export's `DocumentPreference` stated `PagesPerDocument` (always the correct, real total page count) and `AllowPageShuffle="true"` document-wide — found, by Mats hand-editing an exported file's own XML and confirming in InDesign that the extra blank pages disappeared, to be the actual root cause of this investigation's entire "extra blank pages" saga. `PagesPerDocument` reads as an instruction telling InDesign to pre-build that many generic blank pages before it even looks at designmap.xml's own `<Spread>` list, which it then reconciles its real Spreads against — a single untreaded page cleanly replaces one of those pre-built blanks, but a multi-frame thread can't (linking a chain of frames together needs real frame-level work a generic placeholder page was never built for), so InDesign gives up reconciling that unit's share and appends fresh pages for the thread instead, leaving its own abandoned pre-built blanks sitting unused. That mechanism fits every piece of evidence gathered across this investigation: only multi-frame units were ever affected, never single-frame ones; the blank pages had nothing on them at all (not even an empty frame — they were never real Spreads); the story's own text always read once in the Story Editor; and removing the old "+1" safety frame in v1.0.128 shrank the blank count by exactly 1, because it shrank `PagesPerDocument` by 1 too. `PagesPerDocument` is now dropped entirely — InDesign builds the page sequence purely from designmap.xml's own Spreads without it — and `DocumentPreference`'s own `AllowPageShuffle` (a different, document-wide setting from each `Spread`'s own `AllowPageShuffle`, confirmed `"true"` on every real Spread and left unchanged) is now `"false"`.

## [1.0.130] - 2026-10-17

### Fixed
- IDML export's `Page`, `TextFrame`, and `Story` elements were a visibly stripped-down subset of what a real InDesign (21.6) export writes — confirmed by the first genuine two-story reference available in this investigation (one untreaded single-frame story, one threaded across two more, mirroring this writer's own title+chapter shape exactly; every earlier reference was either one giant single story or this writer's own already-broken export re-saved by InDesign). `Page` now carries `SnapshotBlendingMode`, `OptionalPage`, `AppliedTrapPreset`, `MasterPageTransform`, `TabOrder`, `GridStartingPoint`, `UseMasterGrid`, a `Descriptor`/`PageColor` properties block, and a `GridDataInformation` block, matched on the master's own page too; `Page`'s `Name` is now its real sequential page number (`"1"`, `"2"`, …, matching every real page this writer has now seen) rather than a custom chapter label, which was never a real IDML convention. `TextFrame` now carries `ParentInterfaceChangeCount`/`TargetInterfaceChangeCount`/`LastUpdatedInterfaceChangeCount` and `HorizontalLayoutConstraints`/`VerticalLayoutConstraints` (both pairs flagged as untried candidates earlier in this investigation, now finally confirmed with real values), plus `OverriddenPageItemProps`, `BeforeGroupingLayerPosition`, `FlexItemWidthMode`/`FlexItemHeightMode`, six Gradient* zeros, `AppliedObjectStyle`, `Locked`, `Visible`, and `Name`. `Spread`'s `BindingLocation` is now `"0"` only on the document's very first Spread and `"1"` on every other one (not threading-specific — confirmed by position, not by which story a page belongs to). `Story` now carries `UserText`, `IsEndnoteStory`, a real `StoryTitle="$ID/"` (not an empty string), `StoryPreference`'s `OpticalMarginSize`/`FrameType`, an `InCopyExportOption` element, and the `Ai*` Content Credentials attributes InDesign 21.x states on every story. None of these individually explains "page duplication," but this writer's elements were under-specified on BOTH of the reference's stories — threaded and untreaded alike — so this is a comprehensive fidelity pass rather than another single-attribute guess.

## [1.0.129] - 2026-10-17

### Fixed
- IDML export's every real `Page` stated `AppliedAlternateLayout="n"` since v1.0.126 — confirmed wrong by a genuine InDesign (21.6) export's own full designmap.xml (not just the one Spread file this writer had been compared against before): a real content page's `AppliedAlternateLayout` holds its document's own `<Section>`'s `Self` id, never `"n"` — `"n"` is only correct on a page genuinely outside any section, which a real export's master page is but no real content page ever is. The same reference's `<Section>` also carries `AlternateLayoutLength` and a literal `AlternateLayout` name (its page size and orientation, e.g. "A4 V") that this writer never stated at all, and uses `ContinueNumbering="true"` with no `PageNumberStart` rather than this writer's `PageNumberStart="1" ContinueNumbering="false"` — even for its own single, first section. Every real `Page` now references the document's `<Section>` via `AppliedAlternateLayout`, and the `<Section>` itself states `AlternateLayoutLength`/`AlternateLayout` and matches the real export's numbering attributes. Ruled out first, with the user's own direct inspection in InDesign: the story's text reads once in the Story Editor (not duplicated), nothing is selectable on any of the extra blank pages (no frame placed there at all), and the last real frame shows no overset indicator — together ruling out content duplication, frame-level duplication, and overset-driven page insertion as the cause, narrowing this down to page/section-level metadata.

## [1.0.128] - 2026-10-17

### Fixed
- IDML export always threaded a multi-page chapter/title/bible unit across one more frame than its real height estimate called for (`estimatedPages + 1`), a safety margin against that estimate undercounting, added when threading was reintroduced in v1.0.114. That extra frame is the one structural trait that lines up with the entire "extra blank pages" saga with no exception since: present on every multi-frame threaded unit, never on an untreaded single-frame one (like the title page, never once affected) — independent of which of the twelve earlier fixes in this investigation (ids, `<Section>`, `<Layer>`, `AppliedMaster`/`AllowPageShuffle`, `InsetSpacing`, `AppliedAlternateLayout`, the v1.0.127 Story XML paragraph/Br rewrite) was already in place. A trailing thread frame that often ends up empty is exactly the shape of thing InDesign's own text-reflow logic could plausibly mistake for overset needing its own extra pages, at a magnitude keyed to the story's existing page count. Already confirmed not to be a frame-capacity problem (no real overset on any real page, per direct inspection in InDesign) — removing the one extra frame itself, not changing how a page's worth of content is measured, is the test. Threaded units now get exactly their real height estimate's own frame count, no margin beyond it.

## [1.0.127] - 2026-10-17

### Fixed
- IDML export embedded a literal paragraph-end mark (a `&#13;` CR character reference) inside every paragraph's own `<Content>`, and always gave each paragraph its own `<ParagraphStyleRange>` — a real InDesign (21.6) Story XML never marks a paragraph's end with a character in the text at all; it's purely structural. Confirmed against a genuine, native "Call of Cthulhu" Story XML a user exported directly from InDesign (never touched by this writer's own code): many consecutive same-styled paragraphs share ONE `<ParagraphStyleRange>`/`<CharacterStyleRange>`, separated only by sibling `<Br/>` elements between their `<Content>` blocks, and the file's very last paragraph has no trailing `<Br/>` or CR at all — just the closing tags. This is the first difference found in this investigation that's a genuine encoding-correctness bug rather than a missing attribute, and gives a plausible mechanism tying it to the one constant across eleven earlier, unsuccessful fixes (padded ids, `<Section>`, `<Layer>`, `AppliedMaster`/`AllowPageShuffle`, `InsetSpacing`, `AppliedAlternateLayout`): a stray control character repeated once per paragraph could only ever desync InDesign's recomposition where text actually flows across a frame boundary — i.e. only in a threaded (multi-frame) Story, exactly matching the reported pattern of untreaded single-frame units (like the title page) never being affected. Consecutive same-style paragraphs are now folded into one `<ParagraphStyleRange>`, joined by `<Br/>`, with no character ever embedded to mark a paragraph's end.

## [1.0.126] - 2026-10-16

### Fixed
- IDML export never stated `AppliedAlternateLayout` on any `Page` — a real InDesign (21.6) export always does (`"n"` when none applies). Found an exact numerical pattern across two real reports: a 2-story (title + one chapter) export's 4 real pages became 7 in InDesign (the chapter's own 3-frame thread duplicated as 3 extra blank pages, the untreaded title left alone), and a 58-page book's 115 matched just as precisely (three chapters' 14+24+19 threaded frames each duplicated as 57 extra blank pages). Every multi-frame threaded unit's own frame count was being exactly duplicated as blank pages, every single-frame unit untouched — fitting InDesign generating an implicit alternate-layout page set for content whose alternate-layout status this writer left undefined rather than explicitly stating "none". `AppliedAlternateLayout="n"` and `LayoutRule="UseMaster"` (`"Off"` on the master's own page) are now stated on every page, matching the real export exactly.

## [1.0.125] - 2026-10-16

### Fixed
- IDML export wrote `InsetSpacing` as a flat `TextFrame` attribute (`InsetSpacing="0 0 0 0"`); a real InDesign (21.6) export writes it as a nested `<Properties><InsetSpacing type="list">` of four `<ListItem type="unit">` values instead. Investigated after InDesign's own re-saved copy of a reportedly-broken export confirmed its internal page count (7, for a single ~380-word chapter — about 54 words per page) wasn't a display illusion, suggesting each text frame's usable area was being read as far smaller than intended, consistent with a list-valued preference InDesign's stricter parser doesn't recognize in flat-attribute form.

## [1.0.124] - 2026-10-16

### Fixed
- IDML export set `AppliedMaster="n"` (no master) on every real page and `AllowPageShuffle="false"` everywhere — a combination no real InDesign-authored document ever produces for an ordinary content page, confirmed by inspecting a real InDesign (21.6) export's own Spread and MasterSpread XML shared directly by a user. Every page now applies the document's real master spread, and `AllowPageShuffle` is `true` (matching the real export), both on `DocumentPreference` and every `Spread`. Investigated after v1.0.123's Layer fix also turned out not to resolve InDesign showing dozens of extra empty pages beyond what the file actually contains.

## [1.0.123] - 2026-10-16

### Fixed
- IDML export never declared a `<Layer>` in designmap.xml, and no `TextFrame` ever carried an `ItemLayer` attribute — every page item in a real IDML package belongs to a layer, and this writer never assigned one. Found by comparing against a real InDesign (21.6) export shared directly by a user, after v1.0.122's Section element (also a real, confirmed gap) turned out not to resolve InDesign showing dozens of extra empty pages beyond what the file actually contains. A single Layer is now declared, referenced by the document's `ActiveLayer`, and every TextFrame is explicitly assigned to it.

## [1.0.122] - 2026-10-16

### Fixed
- IDML export never wrote a `<Section>` element, so every page always displayed as "unsectioned" in InDesign's own Pages panel — something no real InDesign-authored document is. Investigated further after v1.0.121's id zero-padding (a real, confirmed structural issue in its own right) turned out not to fix the reported symptom: InDesign was still showing dozens of extra, completely empty pages (nothing placeable on them, the default master applied) that don't exist anywhere in the exported file — confirmed by opening the identical file in Affinity, which showed exactly the expected page count. Facing Pages and Smart Text Reflow were each checked and ruled out directly in InDesign's own preferences too. A `<Section>` covering the whole document, with its `PageStart` pointing at the first real page, is the one remaining concrete structural gap against real IDML convention left to close — added here, though not yet confirmed to resolve the underlying InDesign-side behavior.

## [1.0.121] - 2026-10-16

### Fixed
- Found the actual root cause of IDML export's blank-pages-before-real-text problem: every internal id (Spread, Page, Story, TextFrame) was an unpadded incrementing number ("uSpread6", "uSpread12", ..., "uSpread108"), which sorts correctly as a number but scrambles badly as a plain string — anything starting with a higher leading digit sorts first lexicographically. InDesign's own Pages panel turned out to display this writer's threaded spreads in that scrambled string order rather than designmap.xml's actual order. Reproduced the exact reported symptom directly: a synthetic 30-chapter book's title spread (always first in designmap.xml) landed at lexicographic-sort position 108 of 121 — matching a real report of a manuscript's title text appearing on page 108 instead of page 1. Every id is now zero-padded to a fixed width, so string order always matches creation/designmap order.

## [1.0.120] - 2026-10-16

### Fixed
- IDML export's pages all sat at an identical pasteboard position (every `Spread`'s `ItemTransform` was "1 0 0 1 0 0"), unlike any InDesign-authored IDML file — a real document's pasteboard is one continuous strip with each Spread occupying its own successive segment, never multiple Spreads stacked on top of each other. Investigated after a user report that InDesign (unlike Affinity, which rendered the same file correctly) showed the first several dozen pages of a manuscript blank before any real chapter text appeared, even with font substitution ruled out. Each Spread now gets its own position on the pasteboard, one page-width apart, in the same order they're listed in designmap.xml.

## [1.0.119] - 2026-10-16

### Fixed
- Publish could fail to save a file in Brave while working fine in Chrome, for every format. Every Publish click awaited a network fetch for the manuscript's chosen font before triggering the download; some browsers only allow a download to fire within a short window of the user's own click, and that window can be lost once a real `await` crosses it, more strictly enforced in some browsers than others. Font files are now cached after their first fetch and pre-warmed as soon as the Publish dialog opens, so by the time the user actually clicks Publish, nothing awaits a network request before the download is triggered.

## [1.0.118] - 2026-10-16

### Fixed
- IDML export's page-count estimate (how many pages to pre-allocate for a chapter's threaded flow) carried a stale `+ size * 0.3` allowance per block, left over from before v1.0.117 removed Body Text's real `SpaceAfter`. The allowance was meant to approximate that `SpaceAfter`; once the real value became 0, the allowance no longer corresponded to anything, inflating the estimate — across a whole book, a real test showed this contributing to leaving a large fraction of pages empty. It's now computed from each style's actual `SpaceAfter`/`SpaceBefore` (0 for Body Text and its variants, matching what v1.0.117 actually shipped).

## [1.0.117] - 2026-10-16

### Fixed
- IDML export showed a doubled gap between paragraphs in the default "spaced" paragraph style. The Body Text paragraph style carried its own `SpaceAfter`, on top of the explicit blank-line paragraph already inserted between real paragraphs (the same empty-paragraph-as-separator convention every other export format uses) — stacking the two doubled the visible gap. Body Text no longer carries its own `SpaceAfter`.

## [1.0.116] - 2026-10-15

### Fixed
- Publish stopped saving any file at all, in every format — the dialog would stay open a moment and then just close, with no OS Save dialog ever appearing. `downloadBlob` was revoking its Blob's object URL immediately after triggering the download, which is safe in Chromium (it captures the blob reference at click time) but not guaranteed everywhere, notably Windows' WebView2 (what the desktop app runs on) — if the browser/WebView is still asynchronously starting the download when the URL is revoked, the download silently disappears with no error shown. The revoke now happens after a short delay instead of immediately.

## [1.0.115] - 2026-10-15

### Changed
- IDML export's paragraph styles now have human-readable names in InDesign's own Paragraph Styles panel — "Title", "Chapter Name", "Body Text", "Body Text First", "Body Text Indented", "Scene Break" — instead of programmer-style identifiers like "ChapterHeading" or "BodyFirst".

## [1.0.114] - 2026-10-15

### Changed
- IDML export links each chapter's pages into one real, threaded flow again (`PreviousTextFrame`/`NextTextFrame` on a single shared Story per chapter), instead of a separate, independent page for every page break. Threading was tried once, abandoned after a real test showed far too many pages and no visible text, and is back now that the actual causes of that failure — a `TextFrame` with no real shape (v1.0.112) and InDesign reshuffling standalone pages (v1.0.113) — are both fixed and independently confirmed working. A chapter opened in InDesign now reflows across its pages the way editing a real book layout should, rather than every page being its own island.

## [1.0.113] - 2026-10-15

### Fixed
- IDML export's pages opened correctly in Affinity (all pages, text fully visible — the previous fix worked) but InDesign still inserted a blank companion page before nearly every real page, almost doubling the page count. InDesign was reshuffling this export's standalone, one-page-per-spread layout into its own default facing-pages pairing. `AllowPageShuffle="false"` — set on every spread and now also on the document's own preferences, matching ComicBook AI's own IDML writer — tells it not to.

## [1.0.112] - 2026-10-15

### Fixed
- IDML export's own self-paginated pages opened with far more pages than expected and almost no visible text in InDesign or Affinity, with tiny text frames in the corner of some pages — exactly what the previous fix's own self-pagination was meant to avoid. Every `TextFrame` only ever defined its size and position through a bare `GeometricBounds` attribute with an identity transform; IDML's actual page-item model expects a `<Properties><PathGeometry>` rectangle in the frame's own local coordinates, positioned on the page through `ItemTransform`'s translation instead, with `GeometricBounds` only a cached summary value, not an authoritative one. Found by comparing against ComicBook AI's own IDML writer, which includes a `PathGeometry` on every page item it draws. Every `TextFrame` now does the same.

## [1.0.111] - 2026-10-15

### Fixed
- IDML export produced far too many pages (115/229 reported, for content that should have needed far fewer) with almost no visible text in either InDesign or Affinity. The previous approach threaded several `TextFrame`s per chapter together (`PreviousTextFrame`/`NextTextFrame`) and relied on the reader application to work out which text landed on which page when the file was opened — syntax that follows the IDML spec, but with no real IDML file to verify it against, it wasn't trustworthy enough to build pagination on, and evidently isn't read the way expected. IDML export now paginates itself: it measures each paragraph's real wrapped height with the manuscript's actual font (the same font-metric word-wrap PDF export already uses for its own pagination) and decides page breaks directly, so every page's content is exactly what belongs on it — nothing is left for InDesign or Affinity to compute, and nothing for them to get wrong. No `TextFrame` is threaded to another one anymore.

## [1.0.110] - 2026-10-15

### Added
- Page size and margin (Settings → Typography): choose A4, US Letter, or 6×9in trade paperback, plus a narrow/normal/wide margin — for IDML, PDF, and ODT, the three export formats with a real printed page (RTF and HTML/ePub reflow with no fixed page geometry). Defaults to 6×9in with a normal margin, matching IDML's previous fixed size. The editor's own writing column also scales its width to roughly match the chosen page's proportions — not true pagination, just a closer preview; the column still scrolls as one continuous piece.
- IDML export now flows a chapter's (or the Story Bible's) text across as many same-size, threaded pages as it needs, instead of squeezing everything onto one oversized page. Every page in the document is the same fixed size (the chosen page size above), and InDesign/Affinity compute the real page-by-page text flow themselves when the file is opened, the same as a real multi-page layout.

### Changed
- PDF's page size, previously hardcoded to A4, and ODT's page layout, previously left unset (inheriting whatever the opening application's own default was), now both follow the new Page size/margin setting.

## [1.0.109] - 2026-10-15

### Fixed
- IDML export opened in InDesign and Affinity (after the v1.0.108 packaging fix) but still showed inconsistent page sizes and almost no visible text. Every page's `GeometricBounds` (title page, each chapter, the Story Bible) was previously computed independently, sized just tall enough for that page's own content — but InDesign and Affinity expect uniform page geometry across a document, and distrust per-page sizes that vary, reflowing the whole document to an unrelated size and desyncing text frame placement from the actual pages. All pages in an IDML export now share one height — the tallest page the book needs — matching the pattern used by ComicBook AI's own IDML export. A short chapter now has more empty space at the bottom of its page than before; this is an accepted tradeoff of uniform sizing, not a bug.

## [1.0.108] - 2026-10-15

### Fixed
- IDML export failed to open in InDesign and Affinity. `META-INF/container.xml` — the first file any IDML reader looks at to even find the rest of the package — used the wrong XML namespace and attribute names; now uses the correct OCF container convention. designmap.xml was also missing InDesign's own `<?aid ...?>` package marker, had the wrong attribute case on `ZeroPoint`, and declared a default XML namespace on `<Document>` that shouldn't be there.

## [1.0.107] - 2026-10-14

### Added
- IDML export (Publish → IDML (InDesign)), for an author doing the book's own typesetting in Adobe InDesign. One text frame per chapter, each on its own generously tall page sized to hold the whole chapter without threading to another page — not a finished book layout, raw material for the author to lay out themselves. Carries chapter headings, prose (with real bold/italic/underline, drop caps, and scene-break ornaments), and the Story Bible, the same content every other Publish format includes. Built from scratch — no existing reference to work from, confirmed by searching ComicBook AI's repo directly — and not verifiable by actually opening the result in InDesign in this environment; the zip structure, XML well-formedness, and every internal cross-reference are tested, but treat a first export as a first draft worth opening and reporting back on.

### Fixed
- Bold, italic, and underline applied in the chapter editor were silently dropped by every Publish export format — RTF, ODT, HTML, ePub, and PDF all flattened formatted prose to plain text, with no warning. All five now carry it through: real `<b>`/`<i>`/`<u>` in HTML and ePub, RTF control words, named ODT character styles, and bold plus a drawn underline rule in PDF. Italic is the one deliberate exception in PDF specifically — the app draws its own PDF text and has no italic font file embedded for any of its 13 typefaces, so an italic run there renders in the regular weight rather than faking a slant; every other format renders italic correctly, since they leave font selection to the reading application.

## [1.0.105] - 2026-10-14

### Changed
- Guide: updated the map of StoryBook AI, "Which tool do I need?", and "Three complete workflows" overview sections to reference every tool added across this Guide catch-up — Polish, Developmental analysis, Language versions, Attached context, Darlings, and Placeholders — now that each has its own section to point to. Final batch of the Guide catch-up started in v1.0.99.

## [1.0.104] - 2026-10-14

### Added
- Guide: a new Connection presets section in Getting Started, and the Scenes section now mentions "Create scene" from a text selection alongside "Split into two…". Sixth batch of the ongoing Guide catch-up (see v1.0.99).

## [1.0.103] - 2026-10-14

### Changed
- Guide: rewrote the "Convert markers to formatting says nothing was found" FAQ entry to lead with Smart quotes (v1.0.98) for the quote-mark case — Convert markers usually isn't needed for that anymore — and kept the copy-paste workaround for other markers (asterisks, custom pairs). Fifth batch of the ongoing Guide catch-up (see v1.0.99).

## [1.0.102] - 2026-10-14

### Added
- Guide: two new Images, Publishing & Backup sections, Typography and Language versions of a manuscript, plus updated Publish (Paragraph style) and Backup (Export for other apps / StoryCore) sections. Fourth batch of the ongoing Guide catch-up (see v1.0.99).

## [1.0.101] - 2026-10-14

### Added
- Guide: two new Revise sections, Polish and Developmental analysis, plus an updated Proofread section naming its seven checks and the placeholder warning. Third batch of the ongoing Guide catch-up (see v1.0.99).

## [1.0.100] - 2026-10-14

### Added
- Guide: four new Writing sections — Attached context, Darlings, Placeholders, and Smart quotes. Second batch of the ongoing Guide catch-up (see v1.0.99).

## [1.0.99] - 2026-10-14

### Added
- Guide: four new Story Bible & World sections documenting features that had shipped without any Guide coverage — Chapter summary, Aliases and exclusion phrases, Merge Story Bible cards, and Edit vs. Update a fact. First batch of a broader Guide catch-up; the Guide's narrative content hadn't been updated since v1.0.34, roughly 65 releases behind.

## [1.0.98] - 2026-10-14

### Added
- Smart quotes. Straight double quotes (`"`) typed in the chapter editor now turn into real opening/closing curly quotes (" / ") automatically, based on what comes right before — start of text, whitespace, a bracket, a dash, or another opening quote opens; anything else closes. A new "Smarten quotes in whole manuscript" action (Tools → Convert markers) converts every straight quote already in the manuscript the same way, in one pass.

## [1.0.97] - 2026-10-13

### Added
- Developmental analysis (Tools menu). A manually started, resumable pass over the whole manuscript that reads structure rather than line-level prose: scene by scene, then chapter by chapter, then one final report — never the whole manuscript in a single model call. The report covers pacing, whether tension escalates, and which Plotlines threads advance, stall, or get resolved, with specific chapters flagged worth a look. Grounded in whatever Plotlines tags and Timeline positions the manuscript already has; works without either, just with a coarser read, and says so before starting.

## [1.0.96] - 2026-10-13

### Changed
- Draft, Extend/Elaborate/Beat, and the default Polish instructions now push back on three AI storytelling habits documented in a recent research paper on narrative idiosyncrasies in AI fiction (roadmap-ideas.md #45): over-explaining a scene's theme or lesson through the narration, conveying emotion almost exclusively through physical sensation rather than ever naming it plainly, and resolving every scene neatly through the protagonist's own choice. Polish's instructions also stopped treating every emotion word as something to strip — naming a feeling plainly is sometimes the stronger choice, not always a tell.

## [1.0.95] - 2026-10-13

### Added
- Language versions of a manuscript. A manuscript can now spin off a separate, linked edition in another language (title bar → the language switcher next to the manuscript title → "New language version…"), with its own chapters pre-created empty and linked to their source counterparts — translate each one from the chapter editor ("Translate chapter"), which carries over the source chapter's prose plus the manuscript's Story Bible and Voice for consistent names and terms. A translated chapter flags when its source has changed since the last translation ("Source changed since this was translated"), with a same-language diff ("Show what changed") of exactly what moved, and a "Re-translate chapter" action. The manuscript shelf now groups a source manuscript with its language versions instead of listing them as unrelated rows. Settings → AI settings gained a third model choice, Translate, alongside Writing and Review — defaults to the Writing model until set.

## [1.0.94] - 2026-10-13

### Added
- Proofread now scales two previously-fixed limits to the author's own setup instead of using the same hard caps for everyone. Style's chapter sampling (how much of each chapter it reads for a register or mood slip) now scales from Settings' Context window — a short chapter can be sent whole once it fits, instead of always trimming to a fixed snippet. Scenes' repeated-scene search gets a new Settings → AI settings → Proofread thoroughness level (Fast/Balanced/Thorough), controlling how many candidate pairs are sent to the model — a call-count question Context window isn't a good fit for. Both default to today's existing behavior unchanged.

## [1.0.93] - 2026-10-13

### Added
- Attached context for Draft and Recast. A chapter can now pin an earlier chapter — or just one of its scenes — as extra reference material, from Chapter settings → Attached context. Its full prose is sent alongside the Story Bible, not just a one-line summary, for when a place, object, or character needs to read exactly as it was first described. Shows a rough token-cost estimate for whatever's pinned.

## [1.0.92] - 2026-10-13

### Fixed
- Clicking into an existing block-quote line (the `>` convention) and pressing Enter near its start could corrupt it — the quote's hidden marker would duplicate, and the two paragraphs' text would run together with no break between them, intermittently and without an obvious trigger. The marker is invisible, so a click or Home near the start of a quote line had no way to land anywhere predictable relative to it; Enter there now always produces a clean new paragraph instead.

## [1.0.91] - 2026-10-13

### Added
- Decorative scene-break styles. Settings → Typography → Scene break now offers four named ornaments for a `---` paragraph — Classic book vignette (❦), Minimalist diamond (❖), French elegance (⚜), and Glimmer / star (✦) — alongside today's plain short rule. Shows live in the editor and carries into every Publish export, with simpler versions where a format can't do a true fade (ODT, RTF use a centered symbol, no fading line) or the ornament itself (PDF draws a small vector shape instead of the character, since the manuscript's chosen body font has no dingbat glyphs to draw).

### Fixed
- A scene break (`---` on its own line) was never recognized by any Publish export — HTML, ePub, ODT, RTF, and PDF all rendered the literal three dashes as ordinary text. All five now render a proper rule (the default "plain" style, or one of the new named ornaments), matching what the editor has always shown.

## [1.0.90] - 2026-10-13

### Added
- Pending facts from Extract Facts can now be merged straight onto an existing Story Bible card of the same kind, right from the review queue — no more locking a fact first just to merge it afterward. Pick "Merge with…" on the card, and if the target already has a conflicting value for that same fact, you'll be asked whether to keep both or replace the old one, exactly like the existing "Replace or add?" choice on manual fact entry.

## [1.0.89] - 2026-10-13

### Added
- Merge Story Bible cards. Pick "Merge cards…" in the Story Bible panel, select two or more cards of the same kind (say, "Kael" and "the Captain" that turned out to be the same person), and merge them into one. Nothing is deleted — every fact moves onto the merged card, you choose which value wins wherever the cards disagreed, and each old name becomes an alias so a later mention of either still resolves to it. Optionally replaces the old names in the manuscript text too.

### Fixed
- Deleting a Story Bible entity left its tracked aliases and exclusions behind under the deleted entity's id. Harmless on its own, but needless clutter — now cleaned up along with everything else `deleteEntity` already removed.

## [1.0.88] - 2026-10-13

### Added
- Proofread now warns if there's an open placeholder note before it runs — easy to forget one's still waiting once you've moved on, and it's never been checked for before. Not a blocker, just a reminder; it updates to match whichever scope (whole manuscript or just the open chapter) you pick.

## [1.0.87] - 2026-10-11

### Fixed
- Pasting multi-paragraph text could leave stray blank lines behind — real, but only ever visual: the chapter's stored prose was always clean underneath, and the gaps vanished the moment any other edit (typing a `>` quote line, for instance) forced a redraw. Paste now builds one paragraph at a time instead of handing the browser the whole clipboard text at once, so the stray blank blocks never appear in the first place.

## [1.0.86] - 2026-10-11

### Fixed
- Find & Replace made the chapter's prose render as a garbled double-exposure of overlapping text. The real editable text and the highlight overlay that marks your matches were both fully visible and drawn on top of each other — not a data problem, chapter text was always intact underneath.

## [1.0.85] - 2026-10-11

### Fixed
- Draft, Recast, and every other streaming AI operation could finish without writing anything — no error, no change, nothing — when a model streamed its reply under a field the app doesn't read (a reasoning/thinking model sending `reasoning_content` instead of the final answer, for example). The server's own usage logs could show real output while the editor stayed untouched. Both local-server connections (Ollama and the OpenAI-compatible one used for LM Studio and similar servers) now raise a clear error instead of finishing silently when a streamed reply never carries any actual reply text.

## [1.0.84] - 2026-10-11

### Added
- A new way to split a chapter into scenes: mark the text that should be its own scene and pick "Create scene" from the selection menu, instead of hunting for the right paragraph in the Scenes panel's "Split in two…" list.

## [1.0.83] - 2026-10-10

### Fixed
- The Polish review window was stuck at the same narrow width as a small confirmation dialog, cramming its side-by-side before/after text into two thin, scrolling columns. It now opens as wide as the History comparison view, which uses the same side-by-side layout.

## [1.0.82] - 2026-10-10

### Added
- A new Polish step. Runs a cleanup pass over the whole chapter — cuts exposition inserts, emotion-naming, vague statements, purple prose, and tightens dialogue — then shows the original and the rewrite side by side with word-level highlighting before anything is kept. Accept or discard; nothing touches the chapter until you say so. The instructions Polish gives the model are editable per manuscript in Settings → Polish.

## [1.0.81] - 2026-10-10

### Fixed
- Analyze's run never showed up under Tools → "View AI context…" — it recorded the prompt sent to the model but not the model's own reply, the one AI operation in the app missing that. Fixed; "What came back" now appears for Analyze like it already does for every other job.

## [1.0.80] - 2026-10-10

### Changed
- Stats is now a real button next to Analyze, instead of blending into the quiet word-count/Rare/Clichés/Story Bible Names row where it was easy to miss.

## [1.0.79] - 2026-10-10

### Fixed
- Analyze's "show vs tell" check was discarding some of its own correct catches — a sanity filter on the model's output only recognized a short list of feeling-words, so lines like "he pushed the feelings aside" or "a sense of comfort settled over him" were silently dropped even when the model had already flagged them right. The filter now recognizes a much wider range of telling language.

## [1.0.78] - 2026-10-10

### Added
- Settings → Typography gets a Color choice for the prose — one for the app's dark theme, one for light, so it stays legible and intentional in both instead of one color picked for whichever theme you happened to be in. Live in the editor; Publish exports (HTML, ePub, ODT, RTF, PDF) always use the light-mode color, the usual dark-text-on-a-light-page convention for a static document.

## [1.0.77] - 2026-10-09

### Fixed
- The drop cap ("anfang") sat lower than it should across every typeface — its box was sized about 9% taller than the number of lines it was meant to span, wrapping one extra line of text below the target instead of stopping cleanly. Fixed in the live editor and in HTML/ePub exports.

## [1.0.76] - 2026-10-09

### Added
- Settings → Typography gets a Weight choice (Regular or Bold) alongside Font — the manuscript's prose can now sit heavier on the page, in the editor and in every Publish export.

## [1.0.75] - 2026-10-09

### Added
- Settings → Typography's Font list grows from 5 to 13 typefaces — Alegreya, Fraunces, Literata, Lora, Libron, Spectral, PT Serif and Source Serif 4 under Serif; PT Sans, Chivo, Asap, Open Sans and Rubik under Sans serif. The list is grouped by those two headings, and each entry shows in its own typeface so you can tell them apart before picking one.

## [1.0.74] - 2026-10-09

### Changed
- The manuscript's font is now one setting, not a separate pick on every export. Settings → Typography gets a Font choice (System serif, Lora, Literata, Source Serif 4, or Asap — Literata by default) that drives the live editor and every Publish export, so you see what you'll get before you export it. Publish's own font picker is gone — it shows the chosen font as a note instead.

## [1.0.73] - 2026-10-09

### Changed
- Settings has a new Typography section — Drop cap moved there from among POV/Tense/Viewpoint, making room for more typography controls to come.

## [1.0.72] - 2026-10-09

### Fixed
- The drop cap's own letter was being clipped at the top, with an odd gap underneath — a too-tight line spacing made its box shorter than the letter itself. Fixed in the editor, and in HTML/ePub exports.

## [1.0.71] - 2026-10-09

### Added
- Drop cap ("anfang") under Settings → General: choose off or 2–5 lines, and each chapter's opening letter grows to match — live while you write, and carried into Publish's HTML, ePub, and ODT exports. (RTF and PDF don't support it yet.)

## [1.0.70] - 2026-10-09

### Added
- Connection presets under Settings → Models. Save your Engine and Server address as a named tile — Ollama, LM Studio, a test rig, whatever you switch between — and click a tile to use it again instead of retyping the address. Each tile expands to show (and edit) its own settings, with an Update button to save changes and a delete button to remove it. Whatever is live right now, saved or not, always stays visible and editable.

## [1.0.69] - 2026-10-09

### Fixed
- The desktop app's own last fix (1.0.68) still refused local servers running on a non-default port — which is every real one (Ollama, LM Studio, Strata, and similar all use a custom port). The permission the desktop app was given only covered the plain default port for a plain web address, not a custom one. It now covers any port.

## [1.0.68] - 2026-10-08

### Fixed
- The desktop app could refuse to connect to a local server (Ollama, LM Studio, Strata, and similar) that worked fine from the browser version, because that server's allowed-origins setting didn't recognize the desktop app's own internal address. The desktop app now reaches local servers directly through its own backend instead of its embedded browser window, so this no longer matters.

## [1.0.67] - 2026-10-08

### Changed
- Add chapter illustration now lives inside Chapter settings — open it to reach the banner — instead of sitting next to it.

## [1.0.66] - 2026-10-08

### Changed
- Reordered the chapter header: Add chapter illustration now sits right under Chapter settings, and the chapter title (with its plotline threads) now sits under Scenes.

## [1.0.65] - 2026-10-08

### Fixed
- Scenes sat outside the chapter's own centered column, so on a wide window the scene list visibly started further left than the chapter title, threads and prose above and below it. It now lives directly under Chapter settings, at the same width as the rest of the chapter.

## [1.0.64] - 2026-10-08

### Added
- Aliases can now be set right when creating a new Story Bible character, place, or object — not just afterward. The "New…" dialog has an Aliases field alongside the name and first claim.

## [1.0.63] - 2026-10-08

### Fixed
- Proofread's Age stage was asked to "read closely" for profanity, violence, and sexual content unsuited to a young reader, but was never actually given the chapter text — only word-count and sentence-length numbers — so it had nothing real to check and could in principle report a quote that wasn't really there. Content screening for an under-18 Reader now happens during the Grammar stage instead, which already reads every chapter in full and already verifies every quote it reports against the real text before showing it.

## [1.0.62] - 2026-10-07

### Fixed
- The scene-break line from v1.0.61 wasn't actually visible — it had no width and no spacing above or below it, just a 1-pixel-tall sliver, because of a CSS unit that unintentionally zeroed itself out. It's a proper short centered line now.
- Typing `>` to start a quoted line, then continuing to type right after it without pressing Enter first, made everything you typed invisible (and could silently swallow the space after `>`). Both are fixed — the text you type now shows up as you type it, exactly as typed.

## [1.0.61] - 2026-10-07

### Fixed
- A scene-break line (`---` on its own) or a quoted line (`>` at the start) typed by hand now turns into its visual line/indent immediately, instead of staying as plain dashes or a plain `>` until the chapter was closed and reopened. Also fixed: pressing Enter right after typing one of these used to do nothing at all, because of how the line was being hidden in the page — the scene-break line is built differently now so Enter works normally again.

## [1.0.60] - 2026-10-07

### Changed
- Ask Manuscript's dialog is now sized to match its own reading-width text column instead of sharing Settings' wide, two-column width — no more empty space down the right side. The question field is two lines tall and the same width as the answer text, instead of stretching full width at three lines.

### Fixed
- The question field's minimum height was stuck at a much taller generic value from the same kind of CSS specificity tie fixed in Settings for Voice and the writing-primer field — it's back to actually being as tall as its `rows` say.

## [1.0.59] - 2026-10-07

### Changed
- Ask Manuscript is now a large dialog (the same size as Settings) instead of its own full-page view, closing with its own Close button, by clicking outside it, or with Escape. The question field stays pinned at the bottom, with the answer and its sources scrolling in their own area above — so a long answer never pushes the question field out of view, the same convention Claude, Gemini, and ChatGPT use.
- The explanatory text above and the empty-state hint below the question field are gone — the same information now lives in the field's own placeholder text.
- "Versions per chapter" is now just "Revisions" — shorter, with the "?" tooltip still there for anyone wondering what it means.

## [1.0.58] - 2026-10-07

### Fixed
- Prose language, Reader, and Versions per chapter now line up on the same row in Settings — Reader's input used to sit a few pixels lower than the other two, since it was the only one of the three without a "?" tooltip button holding its label to the same height. Reader now has one too.
- Prose language, Reader, and Versions per chapter are equally wide, matching the row below them (POV/Tense/Viewpoint) — Prose language no longer takes up twice the width for no reason.
- Voice and the writing-primer text were rendering at a much larger serif size (matching manuscript prose) than intended, because of a CSS specificity tie going the wrong way. Both are back to their intended compact size, matching the chapter cards in the left panel.

## [1.0.57] - 2026-10-07

### Changed
- "Suggest from model" is now a clear button right next to the Context window field in Settings, instead of a faint link underneath it.
- "View AI context…" moved from Settings to the Tools menu — it inspects what was actually sent to the model, which fits better alongside Proofread and Ask Manuscript than among the writing settings.

## [1.0.56] - 2026-10-07

### Changed
- Prose language, Reader, and Versions per chapter now sit side by side in Settings' General card, and so do POV, Tense, and Viewpoint — matching how they're grouped already, and leaving more height for everything below.

## [1.0.55] - 2026-10-07

### Changed
- The Settings dialog now grows taller on a tall window instead of staying capped at a fixed height — less or no internal scrolling needed to see everything, with the same graceful scroll-within-the-dialog fallback on a shorter window.

## [1.0.54] - 2026-10-07

### Changed
- The Settings dialog's explanatory sentences under each field no longer sit permanently on the page — they were taking up a lot of its height. Each field's label (and the dialog's own title, and the AI settings heading) now has a small "?" next to it; hover or focus it to see the same explanation as a tooltip.

## [1.0.53] - 2026-10-07

### Changed
- Settings is now a large dialog opened from the top bar, instead of its own full-page view. It closes with its own Close button, by clicking outside it, or with Escape — returning to exactly the chapter or view you had open, instead of navigating away from it. Fields are reorganized into three clearly labeled groups — General, Illustrations, and AI settings — with "Versions per chapter" moved out of AI settings and into General, next to Prose language and Reader.

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
