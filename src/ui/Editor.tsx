import React, { useEffect, useState } from "react";
import { peopleLabels, entityLabels } from "@core/bibleGroups";
import { countWords } from "@core/proseStats";
import { replaceCollapsedSentence } from "@core/sentenceSplit";
import {
  chapterChoiceLabel,
  chapterContinuesCue,
  CONTINUES_NONE,
  defaultPredecessor,
  earlierChapters,
  parseContinuesFrom
} from "@core/continuesFrom";
import {
  ADVANCED_POV_MODES,
  PRIMARY_POV_MODES,
  POV_LABELS,
  TENSES,
  TENSE_LABELS,
  chapterCraftCue,
  needsViewpoint,
  parseOptionalPov,
  parseOptionalTense,
  parsePov,
  parseTense,
  resolveCraft,
  type PovMode,
  type Tense
} from "@core/craft";
import { characterCast } from "@core/characterProfile";
import { ANALYZE_INTRO } from "@core/chapterFeedback";
import {
  formatManuscriptMarkdown,
  manuscriptBackupBasename,
  manuscriptExportBasename,
  manuscriptNeedsJsonBackup,
  packManuscriptBackup,
  ensureDownloadFilename
} from "@core/manuscriptBackup";
import { buildManuscriptExport, formatExportRtf, packOdt } from "@core/manuscriptExport";
import { addChapter, removeChapter, sortedChapters, updateChapter, type Chapter } from "@core/BookSchema";
import { useBookStore } from "./useBookStore";
import { downloadBytes, downloadJson, downloadText } from "./downloadJson";
import { readLastJsonBackup, recordLastJsonBackup } from "./jsonBackupStamp";
import { BiblePanel } from "./BiblePanel";
import { ThemeToggle } from "./ThemeToggle";
import { ChapterFeedbackCard } from "./ChapterFeedbackCard";
import { ProseCanvas } from "./ProseCanvas";
import { ProseStatsCard } from "./ProseStatsCard";

function ModelSelect({
  label,
  value,
  models,
  onChange
}: {
  label: string;
  value: string;
  models: string[];
  onChange: (name: string) => void;
}) {
  return (
    <label className="model-field">
      <span>{label}</span>
      <select
        value={models.includes(value) ? value : models[0] ?? ""}
        onChange={(event) => onChange(event.target.value)}
        disabled={models.length === 0}
        aria-label={label}
      >
        {models.length === 0 ? <option value="">No Ollama models</option> : null}
        {models.map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </select>
    </label>
  );
}

function StatsTrigger({
  words,
  highlighting,
  onOpen,
  onToggleHighlight
}: {
  words: number;
  highlighting: boolean;
  onOpen: () => void;
  onToggleHighlight: () => void;
}) {
  return (
    <span className="stats-cluster">
      <button type="button" className="stats-trigger" onClick={onOpen}>
        <span className="word-count">{words} words</span>
        <span className="stats-trigger-label">Stats</span>
      </button>
      <button
        type="button"
        className={highlighting ? "stats-trigger is-on" : "stats-trigger"}
        onClick={onToggleHighlight}
        aria-pressed={highlighting}
        title={highlighting ? "Hide uncommon words" : "Mark uncommon words"}
      >
        <span className="stats-trigger-label">{highlighting ? "Rare on" : "Rare off"}</span>
      </button>
    </span>
  );
}

function MaximizeButton({
  maximized,
  onToggle
}: {
  maximized: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      className="text-button maximize-btn"
      onClick={onToggle}
      aria-pressed={maximized}
      title={maximized ? "Restore panels (Esc)" : "Hide panels and write"}
    >
      {maximized ? "Restore" : "Maximize"}
    </button>
  );
}

export function Editor() {
  const store = useBookStore();
  const { book, chapterId, surface, busy, error, models, model, reviewModel, ollamaError, chapterFeedback } = store;
  if (!book) return null;

  const chapters = sortedChapters(book);
  const chapter = book.chapters.find((item) => item.id === chapterId) ?? chapters[0];
  if (!chapter) return null;
  const onBrainstorm = surface === "brainstorm";
  const onSynopsis = surface === "synopsis";
  const [askOpen, setAskOpen] = useState(false);
  const [ask, setAsk] = useState("");
  const [maximized, setMaximized] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const [backupOpen, setBackupOpen] = useState(false);
  const [backupNote, setBackupNote] = useState("");
  const [backupFilename, setBackupFilename] = useState("");
  const [exportOpen, setExportOpen] = useState(false);
  const [exportFilename, setExportFilename] = useState("");
  const [lastJsonBackupAt, setLastJsonBackupAt] = useState(() => readLastJsonBackup(book.id));
  const [highlightRare, setHighlightRare] = useState(false);
  const names = entityLabels(book.facts, book.entity_kinds);
  const notes = chapterFeedback?.chapterId === chapter.id ? chapterFeedback : null;

  const partnerBusy = busy === "extend" || busy === "elaborate" || busy === "instruct" || busy === "ask";
  const jsonBackupDue = manuscriptNeedsJsonBackup(book.updated_at, lastJsonBackupAt);

  function saveExport(kind: "md" | "rtf" | "odt") {
    if (!book) return;
    const packed = packManuscriptBackup(book);
    const doc = buildManuscriptExport(book, packed.note, packed.exportedAt);
    if (kind === "md") {
      downloadText(ensureDownloadFilename(exportFilename, "md"), formatManuscriptMarkdown(packed), "text/markdown");
    } else if (kind === "rtf") {
      downloadText(ensureDownloadFilename(exportFilename, "rtf"), formatExportRtf(doc), "application/rtf");
    } else {
      downloadBytes(
        ensureDownloadFilename(exportFilename, "odt"),
        packOdt(doc),
        "application/vnd.oasis.opendocument.text"
      );
    }
    setExportOpen(false);
  }

  useEffect(() => {
    if (!maximized) return;
    function onKey(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      if (document.querySelector(".edit-overlay")) return;
      setMaximized(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [maximized]);

  useEffect(() => {
    if (!backupOpen && !exportOpen) return;
    function onKey(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setBackupOpen(false);
      setExportOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [backupOpen, exportOpen]);

  useEffect(() => {
    setLastJsonBackupAt(readLastJsonBackup(book.id));
  }, [book.id]);

  useEffect(() => {
    setNotesOpen(false);
  }, [chapter.id]);

  return (
    <div className={maximized ? "editor is-maximized" : "editor"}>
      <header className="editor-top">
        <button type="button" className="text-button" onClick={store.closeBook}>
          All manuscripts
        </button>
        <input
          className="title-input"
          value={book.title}
          onChange={(event) => void store.patchBook((current) => ({ ...current, title: event.target.value }))}
          aria-label="Manuscript title"
        />
        <div className="model-fields">
          <ModelSelect label="Writing" value={model} models={models} onChange={store.setModel} />
          <ModelSelect label="Review" value={reviewModel} models={models} onChange={store.setReviewModel} />
          <ThemeToggle />
          <button
            type="button"
            className={jsonBackupDue ? "text-button theme-toggle backup-cue is-due" : "text-button theme-toggle backup-cue"}
            title={
              jsonBackupDue
                ? "This manuscript has changed since the last JSON backup"
                : "Backup"
            }
            onClick={() => {
              setExportOpen(false);
              setBackupNote("");
              setBackupFilename(manuscriptBackupBasename(book));
              setBackupOpen(true);
            }}
          >
            {jsonBackupDue ? "! Backup" : "Backup"}
          </button>
          <button
            type="button"
            className="text-button theme-toggle"
            onClick={() => {
              setBackupOpen(false);
              setExportFilename(manuscriptExportBasename(book));
              setExportOpen(true);
            }}
          >
            Export
          </button>
        </div>
      </header>

      {(error || ollamaError) && (
        <p className="banner" role="status">
          {error ?? ollamaError}
        </p>
      )}

      <div className="editor-body">
        <aside className="rail rail-left">
          <button
            type="button"
            className={onBrainstorm ? "synopsis-item is-active" : "synopsis-item"}
            onClick={store.showBrainstorm}
          >
            Brainstorm
          </button>
          <button
            type="button"
            className={onSynopsis ? "synopsis-item is-active" : "synopsis-item"}
            onClick={store.showSynopsis}
          >
            Synopsis
          </button>
          <div className="rail-head">
            <h2>Chapters</h2>
            <button type="button" className="text-button" onClick={() => void store.patchBook(addChapter)}>
              Add
            </button>
          </div>
          <ol className="chapter-list">
            {chapters.map((item) => {
              const cue = chapterCraftCue(book, item);
              const continues = chapterContinuesCue(chapters, item);
              return (
              <li key={item.id}>
                <button
                  type="button"
                  className={surface === "chapter" && item.id === chapterId ? "chapter-item is-active" : "chapter-item"}
                  onClick={() => store.setChapterId(item.id)}
                >
                  <span className="chapter-index">{item.sequence_index + 1}</span>
                  <span className="chapter-name">
                    <span className="chapter-name-text">{item.title.trim() || "Untitled"}</span>
                    {cue ? <span className="chapter-cue">{cue}</span> : null}
                    {item.voice !== undefined && item.voice.trim() ? <span className="chapter-cue">Voice</span> : null}
                    {continues ? <span className="chapter-cue">{continues}</span> : null}
                  </span>
                </button>
                {chapters.length > 1 ? (
                  <button
                    type="button"
                    className="icon-button"
                    aria-label={`Remove ${item.title || "chapter"}`}
                    onClick={() => {
                      const remaining = chapters.filter((entry) => entry.id !== item.id);
                      const fallback = remaining[0]?.id;
                      void store.patchBook((current) => removeChapter(current, item.id)).then(() => {
                        if (item.id === chapterId && fallback) store.setChapterId(fallback);
                      });
                    }}
                  >
                    ×
                  </button>
                ) : null}
              </li>
              );
            })}
          </ol>
          <CraftFields
            pov={book.pov}
            tense={book.tense}
            viewpoint={book.viewpoint}
            people={peopleLabels(book.facts, book.entity_kinds)}
            onPov={(pov) => void store.patchBook((current) => ({ ...current, pov }))}
            onTense={(tense) => void store.patchBook((current) => ({ ...current, tense }))}
            onViewpoint={(viewpoint) => void store.patchBook((current) => ({ ...current, viewpoint }))}
          />
          <label className="voice-field">
            <span>Voice</span>
            <textarea
              value={book.voice}
              onChange={(event) => void store.patchBook((current) => ({ ...current, voice: event.target.value }))}
              placeholder="Dry, maritime, short sentences"
              rows={3}
            />
          </label>
        </aside>

        {onBrainstorm ? (
          <main className="manuscript">
            <h1 className="chapter-title">Brainstorm</h1>
            <p className="synopsis-lede">
              Private scratch. The model thinks with you here. Draft never reads this. Select a passage and lift it
              when it should become the map.
            </p>
            <ProseCanvas
              value={book.brainstorm}
              onChange={(next) => void store.patchBook((current) => ({ ...current, brainstorm: next }))}
              placeholder="A mysterious stowaway. Who knows the ship. The crew does not. What if she is the captain’s sister — or no one they have met?"
              disabled={busy !== null}
              highlightRare={highlightRare}
              names={names}
              onSuggestAlternatives={(args) => store.suggestAlternatives(args)}
              onExtend={(span) => void store.rewriteSpan({ target: "brainstorm", mode: "extend", span })}
              onElaborate={(span) => void store.rewriteSpan({ target: "brainstorm", mode: "elaborate", span })}
              onInstruct={(span, instruction) =>
                void store.rewriteSpan({ target: "brainstorm", mode: "instruct", span, instruction })
              }
              onLift={(span) => void store.liftToSynopsis(span)}
              instructTitle="Change this note"
              instructHint="Tell the model what to do with the marked note. Only that span is replaced."
              instructPlaceholder="Give me two endings. Press on why she stays. Three names for the stowaway."
              instructAction="Rewrite"
            />
            <footer className="manuscript-foot">
              <StatsTrigger
                words={countWords(book.brainstorm)}
                highlighting={highlightRare}
                onOpen={() => setStatsOpen(true)}
                onToggleHighlight={() => setHighlightRare((on) => !on)}
              />
              <div className="actions">
                <MaximizeButton maximized={maximized} onToggle={() => setMaximized((on) => !on)} />
                {partnerBusy ? (
                  <button type="button" onClick={store.stopDraft}>
                    Stop
                  </button>
                ) : (
                  <>
                    <button type="button" onClick={() => setAskOpen(true)} disabled={busy !== null}>
                      Ask…
                    </button>
                    <button type="button" className="primary" onClick={store.showSynopsis} disabled={busy !== null}>
                      Open synopsis
                    </button>
                  </>
                )}
              </div>
            </footer>
            {askOpen ? (
              <div
                className="edit-overlay"
                role="presentation"
                onMouseDown={(event) => {
                  if (event.target === event.currentTarget) setAskOpen(false);
                }}
              >
                <form
                  className="edit-card"
                  action="#"
                  onSubmit={(event) => {
                    event.preventDefault();
                    const question = ask.trim();
                    if (!question) return;
                    setAsk("");
                    setAskOpen(false);
                    void store.askBrainstorm(question);
                  }}
                  aria-labelledby="ask-title"
                >
                  <h2 id="ask-title">Ask</h2>
                  <p className="quiet">
                    The reply is appended to your notes. It is not canon, and chapter draft will not see it.
                  </p>
                  <textarea
                    value={ask}
                    onChange={(event) => setAsk(event.target.value)}
                    placeholder="Who is the stowaway? Give me three options and press on the weakest."
                    rows={4}
                    autoFocus
                    required
                  />
                  <div className="edit-actions">
                    <button type="button" className="text-button" onClick={() => setAskOpen(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="primary" disabled={!ask.trim()}>
                      Ask
                    </button>
                  </div>
                </form>
              </div>
            ) : null}
          </main>
        ) : onSynopsis ? (
          <main className="manuscript">
            <h1 className="chapter-title">Synopsis</h1>
            <p className="synopsis-lede">
              The short form of the story — who, what happens, where it lands. Draft follows this map. It is not
              canon until you lock facts.
            </p>
            <ProseCanvas
              value={book.synopsis}
              onChange={(next) => void store.patchBook((current) => ({ ...current, synopsis: next }))}
              placeholder="Emma keeps the night keys. A stranger pays in salt. By winter she has to leave the quay, or the canal takes the bar."
              disabled={busy !== null}
              highlightRare={highlightRare}
              names={names}
              onSuggestAlternatives={(args) => store.suggestAlternatives(args)}
              onExtend={(span) => void store.rewriteSpan({ target: "synopsis", mode: "extend", span })}
              onElaborate={(span) => void store.rewriteSpan({ target: "synopsis", mode: "elaborate", span })}
              onInstruct={(span, instruction) =>
                void store.rewriteSpan({ target: "synopsis", mode: "instruct", span, instruction })
              }
            />
            <footer className="manuscript-foot">
              <StatsTrigger
                words={countWords(book.synopsis)}
                highlighting={highlightRare}
                onOpen={() => setStatsOpen(true)}
                onToggleHighlight={() => setHighlightRare((on) => !on)}
              />
              <div className="actions">
                <MaximizeButton maximized={maximized} onToggle={() => setMaximized((on) => !on)} />
                {busy === "extend" || busy === "elaborate" || busy === "instruct" ? (
                  <button type="button" onClick={store.stopDraft}>
                    Stop
                  </button>
                ) : (
                  <button type="button" className="primary" onClick={() => store.setChapterId(chapter.id)} disabled={busy !== null}>
                    Start Chapter {chapter.sequence_index + 1}
                  </button>
                )}
              </div>
            </footer>
          </main>
        ) : (
          <main className="manuscript">
            <div className="chapter-head">
              <input
                className="chapter-title"
                value={chapter.title}
                onChange={(event) =>
                  void store.patchBook((current) => updateChapter(current, chapter.id, { title: event.target.value }))
                }
                aria-label="Chapter title"
              />
              <div className="chapter-head-top">
                <label className="craft-field">
                  <span>Brief</span>
                  <textarea
                    value={chapter.brief}
                    onChange={(event) =>
                      void store.patchBook((current) =>
                        updateChapter(current, chapter.id, { brief: event.target.value })
                      )
                    }
                    placeholder="What this chapter must do. A writing instruction, not canon."
                    rows={1}
                    aria-label="Chapter brief"
                  />
                </label>
                <div className="craft-field">
                  <span>Voice</span>
                  {chapter.voice !== undefined ? (
                    <button
                      type="button"
                      className="text-button chapter-voice-reset"
                      onClick={() =>
                        void store.patchBook((current) => updateChapter(current, chapter.id, { voice: undefined }))
                      }
                    >
                      Manuscript
                    </button>
                  ) : null}
                  <textarea
                    value={chapter.voice ?? ""}
                    onChange={(event) => {
                      const next = event.target.value;
                      void store.patchBook((current) =>
                        updateChapter(current, chapter.id, { voice: next.trim() === "" ? undefined : next })
                      );
                    }}
                    placeholder={book.voice.trim() ? "Manuscript voice" : "Dry, maritime, short sentences"}
                    rows={1}
                    aria-label="Chapter voice"
                  />
                </div>
              </div>
              <ChapterCraftFields
                bookPov={book.pov}
                bookTense={book.tense}
                bookViewpoint={book.viewpoint}
                chapter={chapter}
                chapters={chapters}
                people={peopleLabels(book.facts, book.entity_kinds)}
                recasting={busy === "recast"}
                recastDisabled={busy !== null || !chapter.prose.trim()}
                onRecast={() => void store.recastChapter()}
                onPatch={(patch) => void store.patchBook((current) => updateChapter(current, chapter.id, patch))}
              />
            </div>
            <ProseCanvas
              value={chapter.prose}
              onChange={(next) => void store.patchBook((current) => updateChapter(current, chapter.id, { prose: next }))}
              placeholder="The chapter lives here. Draft, then rewrite until it is yours."
              disabled={busy !== null}
              highlightRare={highlightRare}
              names={names}
              onSuggestAlternatives={(args) => store.suggestAlternatives(args)}
              onExtend={(span) => void store.rewriteSpan({ target: "prose", mode: "extend", span })}
              onElaborate={(span) => void store.rewriteSpan({ target: "prose", mode: "elaborate", span })}
              onInstruct={(span, instruction) =>
                void store.rewriteSpan({ target: "prose", mode: "instruct", span, instruction })
              }
            />
            <footer className="manuscript-foot">
              <StatsTrigger
                words={countWords(chapter.prose)}
                highlighting={highlightRare}
                onOpen={() => setStatsOpen(true)}
                onToggleHighlight={() => setHighlightRare((on) => !on)}
              />
              <div className="actions">
                <MaximizeButton maximized={maximized} onToggle={() => setMaximized((on) => !on)} />
                {busy === "draft" || busy === "extend" || busy === "elaborate" || busy === "instruct" || busy === "recast" ? (
                  <button type="button" onClick={store.stopDraft}>
                    Stop
                  </button>
                ) : (
                  <button type="button" className="primary" onClick={() => void store.draftChapter()} disabled={busy !== null}>
                    Draft
                  </button>
                )}
                <button type="button" onClick={() => void store.extractChapter()} disabled={busy !== null}>
                  {busy === "extract" ? "Extracting…" : "Extract facts"}
                </button>
                {busy === "analyze" ? (
                  <button type="button" onClick={store.stopDraft}>
                    Stop
                  </button>
                ) : (
                  <button
                    type="button"
                    title={ANALYZE_INTRO}
                    onClick={() => {
                      void store.analyzeChapter().then((ok) => {
                        if (ok) setNotesOpen(true);
                      });
                    }}
                    disabled={busy !== null || !chapter.prose.trim()}
                  >
                    Analyze
                  </button>
                )}
                {notes ? (
                  <button type="button" onClick={() => setNotesOpen(true)} disabled={busy !== null}>
                    Notes
                  </button>
                ) : null}
              </div>
            </footer>
          </main>
        )}

        <BiblePanel />
      </div>
      {statsOpen ? (
        <ProseStatsCard
          text={onBrainstorm ? book.brainstorm : onSynopsis ? book.synopsis : chapter.prose}
          names={names}
          highlighting={highlightRare}
          onHighlight={() => setHighlightRare(true)}
          onSuggestSplit={(sentence, signal) => store.suggestSentenceSplit(sentence, signal)}
          onSuggestBreak={(paragraph, signal) => store.suggestParagraphBreak(paragraph, signal)}
          {...(onBrainstorm || onSynopsis ? {} : { craft: resolveCraft(book, chapter) })}
          cast={characterCast(book.facts, book.entity_kinds, book.profiles)}
          onApplySplit={(sentence, split) => {
            const current = onBrainstorm ? book.brainstorm : onSynopsis ? book.synopsis : chapter.prose;
            const next = replaceCollapsedSentence(current, sentence, split);
            if (!next) return false;
            if (onBrainstorm) void store.patchBook((item) => ({ ...item, brainstorm: next }));
            else if (onSynopsis) void store.patchBook((item) => ({ ...item, synopsis: next }));
            else void store.patchBook((item) => updateChapter(item, chapter.id, { prose: next }));
            return true;
          }}
          onClose={() => setStatsOpen(false)}
        />
      ) : null}
      {notesOpen && notes ? <ChapterFeedbackCard items={notes.items} onClose={() => setNotesOpen(false)} /> : null}
      {backupOpen ? (
        <div className="edit-overlay" role="presentation" onClick={() => setBackupOpen(false)}>
          <form
            className="edit-card backup-card"
            action="#"
            onClick={(event) => event.stopPropagation()}
            onSubmit={(event) => {
              event.preventDefault();
              const packed = packManuscriptBackup(book, backupNote);
              downloadJson(ensureDownloadFilename(backupFilename, "json"), packed);
              recordLastJsonBackup(book.id, packed.exportedAt);
              setLastJsonBackupAt(packed.exportedAt);
              setBackupOpen(false);
            }}
            aria-labelledby="backup-title"
          >
            <h2 id="backup-title">Backup</h2>
            <p className="quiet">
              A JSON copy this app can read back. Import backup on the shelf restores it. Anything written since that
              file will be lost.
            </p>
            <label className="field-label" htmlFor="backup-note">
              What happened
            </label>
            <textarea
              id="backup-note"
              rows={2}
              value={backupNote}
              onChange={(event) => setBackupNote(event.target.value)}
              placeholder="Optional. Recast chapter 2, new Voice on 3."
            />
            <label className="field-label" htmlFor="backup-filename">
              Document name
            </label>
            <input
              id="backup-filename"
              type="text"
              value={backupFilename}
              onChange={(event) => setBackupFilename(event.target.value)}
              autoComplete="off"
              spellCheck={false}
            />
            <div className="edit-actions">
              <button type="button" className="text-button" onClick={() => setBackupOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="primary">
                Backup
              </button>
            </div>
          </form>
        </div>
      ) : null}
      {exportOpen ? (
        <div className="edit-overlay" role="presentation" onClick={() => setExportOpen(false)}>
          <form
            className="edit-card backup-card"
            action="#"
            onClick={(event) => event.stopPropagation()}
            onSubmit={(event) => event.preventDefault()}
            aria-labelledby="export-title"
          >
            <h2 id="export-title">Export</h2>
            <p className="quiet">A readable copy of the story. Leaves brainstorm out. RTF and ODT open in Scrivener.</p>
            <label className="field-label" htmlFor="export-filename">
              Document name
            </label>
            <input
              id="export-filename"
              type="text"
              value={exportFilename}
              onChange={(event) => setExportFilename(event.target.value)}
              autoComplete="off"
              spellCheck={false}
            />
            <div className="edit-actions">
              <button type="button" className="text-button" onClick={() => setExportOpen(false)}>
                Cancel
              </button>
              <button type="button" className="primary" onClick={() => saveExport("md")}>
                Markdown
              </button>
              <button type="button" className="primary" onClick={() => saveExport("rtf")}>
                RTF
              </button>
              <button type="button" className="primary" onClick={() => saveExport("odt")}>
                ODT
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}

function PovModeOptions() {
  return (
    <>
      <optgroup label="Usual">
        {PRIMARY_POV_MODES.map((mode) => (
          <option key={mode} value={mode}>
            {POV_LABELS[mode]}
          </option>
        ))}
      </optgroup>
      <optgroup label="More">
        {ADVANCED_POV_MODES.map((mode) => (
          <option key={mode} value={mode}>
            {POV_LABELS[mode]}
          </option>
        ))}
      </optgroup>
    </>
  );
}

function CraftFields({
  pov,
  tense,
  viewpoint,
  people,
  onPov,
  onTense,
  onViewpoint
}: {
  pov: PovMode;
  tense: Tense;
  viewpoint: string;
  people: string[];
  onPov: (pov: PovMode) => void;
  onTense: (tense: Tense) => void;
  onViewpoint: (viewpoint: string) => void;
}) {
  const showViewpoint = needsViewpoint(pov);
  return (
    <div className="craft-fields">
      <label className="craft-field">
        <span>POV</span>
        <select value={pov} onChange={(event) => onPov(parsePov(event.target.value))} aria-label="Point of view">
          <PovModeOptions />
        </select>
      </label>
      <label className="craft-field">
        <span>Tense</span>
        <select value={tense} onChange={(event) => onTense(parseTense(event.target.value))} aria-label="Tense">
          {TENSES.map((mode) => (
            <option key={mode} value={mode}>
              {TENSE_LABELS[mode]}
            </option>
          ))}
        </select>
      </label>
      {showViewpoint ? (
        <label className="craft-field">
          <span>Viewpoint</span>
          <input
            list="viewpoint-people"
            value={viewpoint}
            onChange={(event) => onViewpoint(event.target.value)}
            placeholder="Whose head?"
            aria-label="Viewpoint character"
          />
          {people.length > 0 ? (
            <datalist id="viewpoint-people">
              {people.map((name) => (
                <option key={name} value={name} />
              ))}
            </datalist>
          ) : null}
        </label>
      ) : null}
    </div>
  );
}

function ChapterCraftFields({
  bookPov,
  bookTense,
  bookViewpoint,
  chapter,
  chapters,
  people,
  recasting,
  recastDisabled,
  onRecast,
  onPatch
}: {
  bookPov: PovMode;
  bookTense: Tense;
  bookViewpoint: string;
  chapter: Chapter;
  chapters: Chapter[];
  people: string[];
  recasting: boolean;
  recastDisabled: boolean;
  onRecast: () => void;
  onPatch: (patch: {
    pov?: PovMode | undefined;
    tense?: Tense | undefined;
    viewpoint?: string | undefined;
    continues_from?: string | undefined;
  }) => void;
}) {
  const resolved = resolveCraft({ pov: bookPov, tense: bookTense, viewpoint: bookViewpoint }, chapter);
  const showViewpoint = needsViewpoint(resolved.pov);
  const inheritedViewpoint = bookViewpoint.trim();
  const previous = defaultPredecessor(chapters, chapter);
  const strandOptions = earlierChapters(chapters, chapter).filter((item) => item.id !== previous?.id);
  const continuesValue =
    chapter.continues_from === CONTINUES_NONE || strandOptions.some((item) => item.id === chapter.continues_from)
      ? (chapter.continues_from ?? "")
      : "";

  return (
    <div className="chapter-craft">
      <div className="chapter-craft-grid">
        <label className="craft-field">
          <span>POV</span>
          <select
            value={chapter.pov ?? ""}
            onChange={(event) => onPatch({ pov: parseOptionalPov(event.target.value) })}
            aria-label="Chapter point of view"
          >
            <option value="">Manuscript · {POV_LABELS[bookPov]}</option>
            <PovModeOptions />
          </select>
        </label>
        <label className="craft-field">
          <span>Tense</span>
          <select
            value={chapter.tense ?? ""}
            onChange={(event) => onPatch({ tense: parseOptionalTense(event.target.value) })}
            aria-label="Chapter tense"
          >
            <option value="">Manuscript · {TENSE_LABELS[bookTense]}</option>
            {TENSES.map((mode) => (
              <option key={mode} value={mode}>
                {TENSE_LABELS[mode]}
              </option>
            ))}
          </select>
        </label>
        {showViewpoint ? (
          <label className="craft-field">
            <span>Viewpoint</span>
            <span className="chapter-viewpoint-row">
              <input
                list="chapter-viewpoint-people"
                value={chapter.viewpoint ?? ""}
                onChange={(event) => {
                  const next = event.target.value;
                  onPatch({ viewpoint: next === "" ? undefined : next });
                }}
                placeholder={inheritedViewpoint ? `${inheritedViewpoint} (manuscript)` : "Whose head?"}
                aria-label="Chapter viewpoint character"
              />
              {chapter.viewpoint !== undefined ? (
                <button type="button" className="text-button" onClick={() => onPatch({ viewpoint: undefined })}>
                  Manuscript
                </button>
              ) : null}
            </span>
            {people.length > 0 ? (
              <datalist id="chapter-viewpoint-people">
                {people.map((name) => (
                  <option key={name} value={name} />
                ))}
              </datalist>
            ) : null}
          </label>
        ) : null}
        {chapter.sequence_index > 0 ? (
          <label className="craft-field chapter-continues">
            <span>Continues from</span>
            <select
              value={continuesValue}
              onChange={(event) => onPatch({ continues_from: parseContinuesFrom(event.target.value) })}
              aria-label="Continues from"
            >
              <option value="">Previous chapter{previous ? ` · ${chapterChoiceLabel(previous)}` : ""}</option>
              <option value={CONTINUES_NONE}>None · new strand</option>
              {strandOptions.map((item) => (
                <option key={item.id} value={item.id}>
                  {chapterChoiceLabel(item)}
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </div>
      <div className="chapter-craft-actions">
        <button
          type="button"
          onClick={onRecast}
          disabled={recastDisabled}
          title="Rewrite this chapter to the current POV, tense, and viewpoint"
        >
          {recasting ? "Recasting…" : "Recast prose"}
        </button>
      </div>
    </div>
  );
}
