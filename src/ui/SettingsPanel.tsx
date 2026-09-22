import React from "react";
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
import { applyReaderAge, parseReaderAge, readerCategory } from "@core/reader";
import type { Book } from "@core/BookSchema";
import { format, useLocale } from "./i18n";

export function SettingsPanel({
  book,
  models,
  model,
  reviewModel,
  writingPrimer,
  historyLimit,
  onPatch,
  onModel,
  onReviewModel,
  onPrimer,
  onResetPrimer,
  onHistoryLimit,
  onBrowseIllustrationLibrary
}: {
  book: Book;
  models: string[];
  model: string;
  reviewModel: string;
  writingPrimer: string;
  historyLimit: number;
  onPatch: (mutate: (book: Book) => Book) => void;
  onModel: (name: string) => void;
  onReviewModel: (name: string) => void;
  onPrimer: (text: string) => void;
  onResetPrimer: () => void;
  onHistoryLimit: (n: number) => void;
  onBrowseIllustrationLibrary: () => void;
}) {
  const { messages: m } = useLocale();
  const people = peopleLabels(book.facts, book.entity_kinds);
  const showViewpoint = needsViewpoint(book.pov);

  return (
    <main className="manuscript settings-page">
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
        <label className="voice-field">
          <span>{m.illustration.fieldLabel}</span>
          <textarea
            value={book.illustration_style}
            onChange={(event) => onPatch((current) => ({ ...current, illustration_style: event.target.value }))}
            rows={3}
          />
        </label>
        <div className="edit-actions">
          <button type="button" className="text-button" onClick={onBrowseIllustrationLibrary}>
            {m.illustration.browseLibrary}
          </button>
        </div>
        <label className="reader-field">
          <span>{m.editor.reader}</span>
          <input
            type="number"
            min={1}
            max={99}
            inputMode="numeric"
            value={book.reader_age ?? ""}
            placeholder={m.editor.readerPlaceholder}
            title={m.editor.readerTitle}
            aria-label={m.editor.reader}
            onChange={(event) => {
              const raw = event.target.value;
              if (raw === "") {
                onPatch((current) => applyReaderAge(current, undefined));
                return;
              }
              const age = parseReaderAge(raw);
              if (age === undefined) return;
              onPatch((current) => applyReaderAge(current, age));
            }}
          />
          {book.reader_age !== undefined && readerCategory(book.reader_age) !== "adult" ? (
            <p className="reader-hint">{m.editor.readerCategories[readerCategory(book.reader_age)]}</p>
          ) : null}
        </label>
      </section>

      <section className="settings-block">
        <h2 className="settings-heading">{m.editor.modelsHeading}</h2>
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
          <span>{m.editor.historyLimit}</span>
          <input
            type="number"
            min={MIN_PROSE_HISTORY_LIMIT}
            max={MAX_PROSE_HISTORY_LIMIT}
            inputMode="numeric"
            value={historyLimit}
            title={m.editor.historyLimitLede}
            aria-label={m.editor.historyLimit}
            onChange={(event) => {
              const raw = event.target.value;
              if (raw === "") return;
              const n = Number(raw);
              if (!Number.isFinite(n)) return;
              onHistoryLimit(n);
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

function ModelSelect({
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
