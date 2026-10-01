import React, { useEffect, useState } from "react";
import { peopleLabels } from "@core/bibleGroups";
import {
  ADVANCED_POV_MODES,
  PRIMARY_POV_MODES,
  TENSES,
  needsViewpoint,
  parsePov,
  parseTense
} from "@core/craft";
import { DEFAULT_WRITING_PRIMER } from "@core/writingPrimer";
import { MIN_PROSE_HISTORY_LIMIT, MAX_PROSE_HISTORY_LIMIT } from "@core/proseHistory";
import { READER_CATEGORIES, READER_TIER_AGE, applyReaderAge, readerCategory, type ReaderCategory } from "@core/reader";
import { findStyleByPromptText, ILLUSTRATION_ORIENTATIONS, type IllustrationStyle } from "@core/illustrationStyle";
import type { Book } from "@core/BookSchema";
import type { LlmEngine } from "@llm/provider";
import { MIN_CONTEXT_WINDOW, MAX_CONTEXT_WINDOW } from "@llm/contextWindow";
import { BlobThumbnail } from "./BlobThumbnail";
import { format, useLocale } from "./i18n";
import { PromptInspectorCard } from "./PromptInspector";
import type { PromptDebugEntry } from "./promptDebug";

export function SettingsPanel({
  book,
  models,
  model,
  reviewModel,
  engine,
  baseUrl,
  contextWindow,
  writingPrimer,
  historyLimit,
  illustrationStyles,
  lastPrompt,
  onPatch,
  onModel,
  onReviewModel,
  onEngine,
  onBaseUrl,
  onContextWindow,
  onSuggestContextWindow,
  onPrimer,
  onResetPrimer,
  onHistoryLimit,
  onBrowseIllustrationLibrary,
  onBack
}: {
  book: Book;
  models: string[];
  model: string;
  reviewModel: string;
  engine: LlmEngine;
  baseUrl: string;
  contextWindow: number;
  writingPrimer: string;
  historyLimit: number;
  illustrationStyles: IllustrationStyle[];
  lastPrompt: PromptDebugEntry | null;
  onPatch: (mutate: (book: Book) => Book) => void;
  onModel: (name: string) => void;
  onReviewModel: (name: string) => void;
  onEngine: (engine: LlmEngine) => void;
  onBaseUrl: (url: string) => void;
  onContextWindow: (n: number) => void;
  onSuggestContextWindow: () => Promise<number | null>;
  onPrimer: (text: string) => void;
  onResetPrimer: () => void;
  onHistoryLimit: (n: number) => void;
  onBrowseIllustrationLibrary: () => void;
  /**
   * A tester found no way out of Settings other than the header logo,
   * which exits the manuscript entirely (back to the shelf) rather than
   * just closing this panel — the chapter rail underneath stays clickable
   * as an unlabeled alternate route, but nobody found it on their own.
   * This gives Settings its own explicit, labeled way back to writing.
   */
  onBack: () => void;
}) {
  const { messages: m } = useLocale();
  const [contextOpen, setContextOpen] = useState(false);
  const [suggestingContext, setSuggestingContext] = useState(false);
  const [contextSuggestResult, setContextSuggestResult] = useState<"found" | "none" | null>(null);
  // Kept as a separate, uncommitted draft while typing — committing (and
  // therefore clamping to MIN_CONTEXT_WINDOW) on every keystroke meant a
  // single digit typed partway through a bigger number (e.g. the "3" in
  // "32000") was below the minimum and got silently snapped up to it,
  // wiping out whatever was typed next. Only commit, and let the min/max
  // clamp apply, once the author leaves the field.
  const [contextWindowDraft, setContextWindowDraft] = useState(String(contextWindow));
  useEffect(() => {
    setContextWindowDraft(String(contextWindow));
  }, [contextWindow]);
  const [historyLimitDraft, setHistoryLimitDraft] = useState(String(historyLimit));
  useEffect(() => {
    setHistoryLimitDraft(String(historyLimit));
  }, [historyLimit]);
  const people = peopleLabels(book.facts, book.entity_kinds);
  const showViewpoint = needsViewpoint(book.pov);
  const selectedStyle = findStyleByPromptText(illustrationStyles, book.illustration_style);
  const [editingText, setEditingText] = useState(false);

  return (
    <main className="manuscript settings-page">
      <button type="button" className="text-button settings-back" onClick={onBack}>
        {m.editor.backToManuscript}
      </button>
      <h1 className="chapter-title">{m.editor.settings}</h1>
      <p className="synopsis-lede">{m.editor.settingsLede}</p>

      <section className="settings-block">
        <label className="voice-field">
          <span>{m.editor.proseLanguage}</span>
          <input
            value={book.prose_language}
            onChange={(event) => onPatch((current) => ({ ...current, prose_language: event.target.value }))}
            placeholder={m.editor.proseLanguagePlaceholder}
            title={m.editor.proseLanguageTitle}
            aria-label={m.editor.proseLanguage}
          />
        </label>
        <p className="quiet">{m.editor.proseLanguageTitle}</p>
      </section>

      <section className="settings-block">
        <div className="craft-fields">
          <label className="craft-field">
            <span>{m.craft.pov}</span>
            <select value={book.pov} onChange={(event) => onPatch((current) => ({ ...current, pov: parsePov(event.target.value) }))} aria-label={m.craft.povAria}>
              <PovModeOptions />
            </select>
          </label>
          <label className="craft-field">
            <span>{m.craft.tense}</span>
            <select
              value={book.tense}
              onChange={(event) => onPatch((current) => ({ ...current, tense: parseTense(event.target.value) }))}
              aria-label={m.craft.tenseAria}
            >
              {TENSES.map((mode) => (
                <option key={mode} value={mode}>
                  {m.craft.tenses[mode]}
                </option>
              ))}
            </select>
          </label>
          {showViewpoint ? (
            <label className="craft-field">
              <span>{m.craft.viewpoint}</span>
              <input
                list="settings-viewpoint-people"
                value={book.viewpoint}
                onChange={(event) => onPatch((current) => ({ ...current, viewpoint: event.target.value }))}
                placeholder={m.craft.viewpointPlaceholder}
                aria-label={m.craft.viewpointAria}
              />
              {people.length > 0 ? (
                <datalist id="settings-viewpoint-people">
                  {people.map((name) => (
                    <option key={name} value={name} />
                  ))}
                </datalist>
              ) : null}
            </label>
          ) : null}
        </div>
        <label className="voice-field">
          <span>{m.editor.voice}</span>
          <textarea
            value={book.voice}
            onChange={(event) => onPatch((current) => ({ ...current, voice: event.target.value }))}
            placeholder={m.editor.voicePlaceholder}
            rows={3}
          />
        </label>
        <div className="illustration-style-preview-field">
          <span className="field-label">{m.illustration.fieldLabel}</span>
          <button type="button" className="illustration-style-preview" onClick={onBrowseIllustrationLibrary}>
            {selectedStyle?.exampleImage ? (
              <BlobThumbnail blob={selectedStyle.exampleImage.blob} alt={selectedStyle.name} variant="settings" />
            ) : (
              <span className="illustration-style-settings-thumb illustration-style-placeholder" aria-hidden="true" />
            )}
            <span className="illustration-style-preview-info">
              <strong className="illustration-style-preview-name">
                {selectedStyle?.name ?? (book.illustration_style.trim() ? m.illustration.customStyleLabel : m.illustration.noStyleSelected)}
              </strong>
              <span className="illustration-style-preview-cta">{m.illustration.browseLibrary}</span>
            </span>
          </button>
          <div className="illustration-orientation-toggle" role="group" aria-label={m.illustration.orientationLabel}>
            {ILLUSTRATION_ORIENTATIONS.map((orientation) => (
              <button
                key={orientation}
                type="button"
                className="text-button"
                aria-pressed={book.illustration_orientation === orientation}
                onClick={() => onPatch((current) => ({ ...current, illustration_orientation: orientation }))}
              >
                {m.illustration.orientations[orientation]}
              </button>
            ))}
          </div>
          <button type="button" className="text-button illustration-style-edit-toggle" onClick={() => setEditingText((v) => !v)}>
            {editingText ? m.illustration.hideManualEdit : m.illustration.editTextManually}
          </button>
          {editingText ? (
            <textarea
              value={book.illustration_style}
              onChange={(event) => onPatch((current) => ({ ...current, illustration_style: event.target.value }))}
              rows={3}
            />
          ) : null}
        </div>
        <label className="reader-field">
          <span>{m.editor.reader}</span>
          <select
            value={book.reader_age === undefined ? "adult" : readerCategory(book.reader_age)}
            title={m.editor.readerTitle}
            aria-label={m.editor.reader}
            onChange={(event) => {
              const category = event.target.value as ReaderCategory;
              const age = category === "adult" ? undefined : READER_TIER_AGE[category];
              onPatch((current) => applyReaderAge(current, age));
            }}
          >
            {READER_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {m.editor.readerCategories[category]}
              </option>
            ))}
          </select>
          {readerCategory(book.reader_age) !== "adult" ? <p className="reader-hint">{m.editor.readerTierHint}</p> : null}
        </label>
      </section>

      <section className="settings-block">
        <h2 className="settings-heading">{m.editor.modelsHeading}</h2>
        <div className="settings-engine">
          <label className="craft-field">
            <span>{m.editor.engineLabel}</span>
            <select
              value={engine}
              onChange={(event) => onEngine(event.target.value === "openai-compatible" ? "openai-compatible" : "ollama")}
              aria-label={m.editor.engineLabel}
            >
              <option value="ollama">{m.editor.engineOllama}</option>
              <option value="openai-compatible">{m.editor.engineOpenAiCompatible}</option>
            </select>
          </label>
          {engine === "openai-compatible" ? (
            <label className="voice-field">
              <span>{m.editor.baseUrlLabel}</span>
              <input
                value={baseUrl}
                onChange={(event) => onBaseUrl(event.target.value)}
                placeholder={m.editor.baseUrlPlaceholder}
                title={m.editor.baseUrlLede}
                aria-label={m.editor.baseUrlLabel}
              />
            </label>
          ) : null}
        </div>
        <p className="quiet">{engine === "openai-compatible" ? m.editor.baseUrlLede : m.editor.engineLede}</p>
        <div className="settings-models">
          <ModelSelect label={m.editor.writing} value={model} models={models} emptyLabel={m.editor.noModels} onChange={onModel} />
          <ModelSelect
            label={m.editor.review}
            value={reviewModel}
            models={models}
            emptyLabel={m.editor.noModels}
            onChange={onReviewModel}
          />
        </div>
        <label className="reader-field">
          <span>{m.editor.contextWindowLabel}</span>
          <input
            type="number"
            min={MIN_CONTEXT_WINDOW}
            max={MAX_CONTEXT_WINDOW}
            inputMode="numeric"
            value={contextWindowDraft}
            title={m.editor.contextWindowLede}
            aria-label={m.editor.contextWindowLabel}
            onChange={(event) => setContextWindowDraft(event.target.value)}
            onBlur={() => {
              const n = Number(contextWindowDraft);
              if (Number.isFinite(n)) onContextWindow(n);
              else setContextWindowDraft(String(contextWindow));
            }}
          />
        </label>
        <p className="quiet">{m.editor.contextWindowLede}</p>
        {engine === "ollama" ? (
          <div className="edit-actions">
            <button
              type="button"
              className="text-button"
              disabled={suggestingContext}
              onClick={() => {
                setSuggestingContext(true);
                setContextSuggestResult(null);
                void onSuggestContextWindow().then((found) => {
                  setSuggestingContext(false);
                  setContextSuggestResult(found !== null ? "found" : "none");
                });
              }}
            >
              {suggestingContext ? m.editor.contextWindowSuggesting : m.editor.contextWindowSuggest}
            </button>
            {contextSuggestResult === "found" ? (
              <span className="quiet">{format(m.editor.contextWindowSuggested, { value: contextWindow })}</span>
            ) : contextSuggestResult === "none" ? (
              <span className="quiet">{m.editor.contextWindowSuggestError}</span>
            ) : null}
          </div>
        ) : (
          <p className="quiet">{m.editor.contextWindowOpenAiNote}</p>
        )}
        <label className="settings-checkbox-field">
          <input
            type="checkbox"
            checked={book.filter_lore_by_relevance}
            onChange={(event) => onPatch((current) => ({ ...current, filter_lore_by_relevance: event.target.checked }))}
          />
          {m.editor.filterLoreLabel}
        </label>
        <p className="quiet">{m.editor.filterLoreLede}</p>
        <div className="edit-actions">
          <button type="button" className="text-button" onClick={() => setContextOpen(true)}>
            {m.aiContext.trigger}
          </button>
        </div>
        {contextOpen ? <PromptInspectorCard entry={lastPrompt} onClose={() => setContextOpen(false)} /> : null}
        <label className="reader-field">
          <span>{m.editor.historyLimit}</span>
          <input
            type="number"
            min={MIN_PROSE_HISTORY_LIMIT}
            max={MAX_PROSE_HISTORY_LIMIT}
            inputMode="numeric"
            value={historyLimitDraft}
            title={m.editor.historyLimitLede}
            aria-label={m.editor.historyLimit}
            onChange={(event) => setHistoryLimitDraft(event.target.value)}
            onBlur={() => {
              const n = Number(historyLimitDraft);
              if (Number.isFinite(n)) onHistoryLimit(n);
              else setHistoryLimitDraft(String(historyLimit));
            }}
          />
        </label>
        <p className="quiet">{m.editor.historyLimitLede}</p>
        <label className="voice-field">
          <span>{m.editor.primerTitle}</span>
          <textarea
            className="primer-field"
            value={writingPrimer}
            onChange={(event) => onPrimer(event.target.value)}
            rows={6}
            aria-label={format(m.editor.primerAria, { model })}
          />
        </label>
        <p className="quiet">{m.editor.primerLede}</p>
        <div className="edit-actions">
          <button
            type="button"
            className="text-button"
            onClick={onResetPrimer}
            disabled={writingPrimer.trim() === DEFAULT_WRITING_PRIMER.trim()}
          >
            {m.editor.primerRestore}
          </button>
        </div>
        <p className="quiet">{m.editor.uiLanguageStays}</p>
      </section>
    </main>
  );
}

export function ModelSelect({
  label,
  value,
  models,
  emptyLabel,
  onChange
}: {
  label: string;
  value: string;
  models: string[];
  emptyLabel: string;
  onChange: (name: string) => void;
}) {
  return (
    <label className="model-field settings-model">
      <span>{label}</span>
      <select
        value={models.includes(value) ? value : models[0] ?? ""}
        onChange={(event) => onChange(event.target.value)}
        disabled={models.length === 0}
        aria-label={label}
      >
        {models.length === 0 ? <option value="">{emptyLabel}</option> : null}
        {models.map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </select>
    </label>
  );
}

function PovModeOptions() {
  const { messages: m } = useLocale();
  return (
    <>
      <optgroup label={m.craft.usual}>
        {PRIMARY_POV_MODES.map((mode) => (
          <option key={mode} value={mode}>
            {m.craft.modes[mode]}
          </option>
        ))}
      </optgroup>
      <optgroup label={m.craft.more}>
        {ADVANCED_POV_MODES.map((mode) => (
          <option key={mode} value={mode}>
            {m.craft.modes[mode]}
          </option>
        ))}
      </optgroup>
    </>
  );
}
