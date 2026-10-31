import { useEffect, useState } from "react";
import { CloseIconButton } from "./CloseIconButton";
import { MIN_PROSE_HISTORY_LIMIT, MAX_PROSE_HISTORY_LIMIT } from "@core/proseHistory";
import { DEFAULT_WRITING_PRIMER } from "@core/writingPrimer";
import { DEFAULT_OPENAI_COMPATIBLE_BASE_URL, type LlmEngine } from "@llm/provider";
import { DEFAULT_OLLAMA_BASE_URL } from "@llm/ollama";
import { MIN_CONTEXT_WINDOW, MAX_CONTEXT_WINDOW } from "@llm/contextWindow";
import {
  loadConnectionPresets,
  matchesPreset,
  newConnectionPreset,
  saveConnectionPresets,
  type ConnectionPreset
} from "@llm/connectionPresets";
import { ModelSelect } from "./SettingsPanel";
import { applyPaper, parsePaper, readPaper, PAPERS } from "./paper";
import { MASCOT_IDS, MASCOT_POSES, readMascot, setMascot, type MascotId } from "./mascot";
import {
  detectGpuSuggestion,
  isDesktopApp,
  openOllamaDownloadPage,
  type GpuSuggestion
} from "./desktopBridge";
import { HelpTip } from "./GuidePanel";
import { format, translateError, useLocale } from "./i18n";

const GPU_TIER_KEY = {
  "3b": "desktopGpuTier3b",
  "7b": "desktopGpuTier7b",
  "14b": "desktopGpuTier14b",
  "30b": "desktopGpuTier30b",
  "70b": "desktopGpuTier70b"
} as const;

/**
 * App-wide settings, split out from the per-manuscript SettingsPanel
 * (Mats: Affinity's own "Settings" vs. "Document settings" split —
 * engine/model/connection, context window, writing primer, revision
 * limit, and the editor paper color were all already localStorage-backed,
 * not manuscript fields, despite living inside the per-book dialog
 * before this). Reachable from Home and from inside a manuscript alike,
 * via AppTopBar's own "Settings" menu item — unlike the old Core/AI
 * entry points, this one needs no manuscript open first.
 */
export function AppSettingsDialog({
  models,
  model,
  reviewModel,
  translateModel,
  engine,
  baseUrl,
  contextWindow,
  writingPrimer,
  historyLimit,
  ollamaError,
  onModel,
  onReviewModel,
  onTranslateModel,
  onEngine,
  onBaseUrl,
  onContextWindow,
  onSuggestContextWindow,
  onPrimer,
  onResetPrimer,
  onHistoryLimit,
  onClose
}: {
  models: string[];
  model: string;
  reviewModel: string;
  translateModel: string;
  engine: LlmEngine;
  baseUrl: string;
  contextWindow: number;
  writingPrimer: string;
  historyLimit: number;
  ollamaError: string | null;
  onModel: (name: string) => void;
  onReviewModel: (name: string) => void;
  onTranslateModel: (name: string) => void;
  onEngine: (engine: LlmEngine) => void;
  onBaseUrl: (url: string) => void;
  onContextWindow: (n: number) => void;
  onSuggestContextWindow: () => Promise<number | null>;
  onPrimer: (text: string) => void;
  onResetPrimer: () => void;
  onHistoryLimit: (n: number) => void;
  onClose: () => void;
}) {
  const { messages: m } = useLocale();
  const [suggestingContext, setSuggestingContext] = useState(false);
  const [contextSuggestResult, setContextSuggestResult] = useState<"found" | "none" | null>(null);
  const [contextWindowDraft, setContextWindowDraft] = useState(String(contextWindow));
  useEffect(() => {
    setContextWindowDraft(String(contextWindow));
  }, [contextWindow]);
  const [historyLimitDraft, setHistoryLimitDraft] = useState(String(historyLimit));
  useEffect(() => {
    setHistoryLimitDraft(String(historyLimit));
  }, [historyLimit]);
  const [paper, setPaper] = useState(readPaper);
  const [mascot, setMascotState] = useState<MascotId>(readMascot);

  const connected = models.length > 0 && !ollamaError;
  const [gpuSuggestion, setGpuSuggestion] = useState<GpuSuggestion | null>(null);
  useEffect(() => {
    if (!isDesktopApp()) return;
    let cancelled = false;
    void detectGpuSuggestion().then((result) => {
      if (!cancelled) setGpuSuggestion(result);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="edit-overlay" role="presentation" onClick={onClose}>
      <div
        className="edit-card settings-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="app-settings-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="dialog-head">
          <span className="settings-card-title">
            <h2 id="app-settings-title">{m.editor.appSettings}</h2>
            <HelpTip body={m.editor.appSettingsLede} ariaLabel={format(m.common.infoAbout, { field: m.editor.appSettings })} />
          </span>
          <CloseIconButton onClick={onClose} label={m.common.close} />
        </div>

        <div className="settings-card-columns">
          <div className="settings-card-column">
            <section className="settings-block">
              <h2 className="settings-heading">{m.editor.modelsHeading}</h2>
              <p className={ollamaError ? "banner home-banner" : "quiet"} role={ollamaError ? "status" : undefined}>
                {ollamaError ? translateError(ollamaError, m) : null}
              </p>
              {isDesktopApp() && !connected ? (
                <div className="home-connect-desktop">
                  <button type="button" className="home-guide-button" onClick={() => void openOllamaDownloadPage()}>
                    {m.home.desktopInstallOllama}
                  </button>
                  {gpuSuggestion ? (
                    <p className="quiet">
                      {format(m.home.desktopGpuSuggestion, {
                        gb: Math.round(gpuSuggestion.vramMb / 1024),
                        tier: m.home[GPU_TIER_KEY[gpuSuggestion.tier]]
                      })}
                    </p>
                  ) : null}
                </div>
              ) : null}
              <div className="settings-engine">
                <ConnectionPresetList engine={engine} baseUrl={baseUrl} onEngine={onEngine} onBaseUrl={onBaseUrl} />
              </div>
              <div className="settings-models">
                <ModelSelect label={m.editor.writing} value={model} models={models} emptyLabel={m.editor.noModels} onChange={onModel} />
                <ModelSelect
                  label={m.editor.review}
                  value={reviewModel}
                  models={models}
                  emptyLabel={m.editor.noModels}
                  onChange={onReviewModel}
                />
                <ModelSelect
                  label={m.editor.translateModelLabel}
                  value={translateModel}
                  models={models}
                  emptyLabel={m.editor.noModels}
                  followLabel={m.editor.translateModelFollowWriting}
                  onChange={onTranslateModel}
                />
              </div>
              <label className="reader-field">
                <span className="field-label-row">
                  {m.editor.contextWindowLabel}
                  <HelpTip body={m.editor.contextWindowLede} ariaLabel={format(m.common.infoAbout, { field: m.editor.contextWindowLabel })} />
                </span>
                <div className="context-window-row">
                  <input
                    type="number"
                    min={MIN_CONTEXT_WINDOW}
                    max={MAX_CONTEXT_WINDOW}
                    inputMode="numeric"
                    value={contextWindowDraft}
                    aria-label={m.editor.contextWindowLabel}
                    onChange={(event) => setContextWindowDraft(event.target.value)}
                    onBlur={() => {
                      const n = Number(contextWindowDraft);
                      if (Number.isFinite(n)) onContextWindow(n);
                      else setContextWindowDraft(String(contextWindow));
                    }}
                  />
                  {engine === "ollama" ? (
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
                  ) : null}
                </div>
              </label>
              {engine === "ollama" ? (
                contextSuggestResult === "found" ? (
                  <p className="quiet">{format(m.editor.contextWindowSuggested, { value: contextWindow })}</p>
                ) : contextSuggestResult === "none" ? (
                  <p className="quiet">{m.editor.contextWindowSuggestError}</p>
                ) : null
              ) : (
                <p className="quiet">{m.editor.contextWindowOpenAiNote}</p>
              )}
              <label className="voice-field">
                <span className="field-label-row">
                  {m.editor.primerTitle}
                  <HelpTip body={m.editor.primerLede} ariaLabel={format(m.common.infoAbout, { field: m.editor.primerTitle })} />
                </span>
                <textarea
                  className="primer-field"
                  value={writingPrimer}
                  onChange={(event) => onPrimer(event.target.value)}
                  rows={6}
                  aria-label={format(m.editor.primerAria, { model })}
                />
              </label>
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
            </section>
          </div>

          <div className="settings-card-column">
            <section className="settings-block">
              <h2 className="settings-heading">{m.editor.editorSettingsHeading}</h2>
              <div className="settings-field-row">
                <label className="reader-field">
                  <span className="field-label-row">
                    {m.editor.historyLimit}
                    <HelpTip body={m.editor.historyLimitLede} ariaLabel={format(m.common.infoAbout, { field: m.editor.historyLimit })} />
                  </span>
                  <input
                    type="number"
                    min={MIN_PROSE_HISTORY_LIMIT}
                    max={MAX_PROSE_HISTORY_LIMIT}
                    inputMode="numeric"
                    value={historyLimitDraft}
                    aria-label={m.editor.historyLimit}
                    onChange={(event) => setHistoryLimitDraft(event.target.value)}
                    onBlur={() => {
                      const n = Number(historyLimitDraft);
                      if (Number.isFinite(n)) onHistoryLimit(n);
                      else setHistoryLimitDraft(String(historyLimit));
                    }}
                  />
                </label>
                <label className="reader-field">
                  <span className="field-label-row">
                    {m.editor.paperLabel}
                    <HelpTip body={m.editor.paperLede} ariaLabel={format(m.common.infoAbout, { field: m.editor.paperLabel })} />
                  </span>
                  <select
                    value={paper}
                    aria-label={m.editor.paperLabel}
                    onChange={(event) => {
                      const next = parsePaper(event.target.value);
                      applyPaper(next);
                      setPaper(next);
                    }}
                  >
                    {PAPERS.map((option) => (
                      <option key={option} value={option}>
                        {m.editor.paperOptions[option]}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </section>

            <section className="settings-block">
              <h2 className="settings-heading">{m.editor.assistantHeading}</h2>
              <p className="quiet mascot-picker-lede">{m.editor.mascotLede}</p>
              <div className="mascot-picker" role="radiogroup" aria-label={m.editor.mascotLabel}>
                {MASCOT_IDS.map((option) => (
                  <button
                    key={option}
                    type="button"
                    className="mascot-picker-option"
                    role="radio"
                    aria-checked={mascot === option}
                    onClick={() => {
                      setMascot(option);
                      setMascotState(option);
                    }}
                  >
                    <span className="mascot-picker-thumb">
                      {option === "none" ? null : <img src={MASCOT_POSES[option][0]} alt="" />}
                    </span>
                    <span>{m.editor.mascotOptions[option]}</span>
                  </button>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * A named engine+address combination the author can expand to see or
 * change, and switch to by expanding it — one tile per saved local server,
 * so swapping between e.g. Ollama, LM Studio, and a test rig like Strata
 * doesn't mean retyping the address each time (roadmap-ideas.md, tester
 * feedback 2026-10-09). When the live engine/address doesn't match any
 * saved preset (first run, or an edit not saved yet), an unsaved "Current
 * connection" tile fills in so the fields are never hidden — "+ New model"
 * always saves whatever is live right now under a new name.
 */
function ConnectionPresetList({
  engine,
  baseUrl,
  onEngine,
  onBaseUrl
}: {
  engine: LlmEngine;
  baseUrl: string;
  onEngine: (engine: LlmEngine) => void;
  onBaseUrl: (url: string) => void;
}) {
  const { messages: m } = useLocale();
  const [presets, setPresets] = useState<ConnectionPreset[]>(() => loadConnectionPresets());
  const [expandedId, setExpandedId] = useState<string | null>(
    () => presets.find((preset) => matchesPreset(preset, engine, baseUrl))?.id ?? null
  );
  const [justCreatedId, setJustCreatedId] = useState<string | null>(null);

  const updatePresets = (next: ConnectionPreset[]) => {
    setPresets(next);
    saveConnectionPresets(next);
  };

  const selectPreset = (preset: ConnectionPreset) => {
    if (expandedId === preset.id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(preset.id);
    onEngine(preset.engine);
    onBaseUrl(preset.baseUrl);
  };

  const hasActivePreset = presets.some((preset) => matchesPreset(preset, engine, baseUrl));

  const engineField = (
    <label className="craft-field">
      <span className="field-label-row">
        {m.editor.engineLabel}
        <HelpTip body={m.editor.engineLede} ariaLabel={format(m.common.infoAbout, { field: m.editor.engineLabel })} />
      </span>
      <select
        value={engine}
        onChange={(event) => onEngine(event.target.value === "openai-compatible" ? "openai-compatible" : "ollama")}
        aria-label={m.editor.engineLabel}
      >
        <option value="ollama">{m.editor.engineOllama}</option>
        <option value="openai-compatible">{m.editor.engineOpenAiCompatible}</option>
      </select>
    </label>
  );

  const baseUrlField = (
    <label className="voice-field">
      <span className="field-label-row">
        {m.editor.baseUrlLabel}
        <HelpTip body={m.editor.baseUrlLede} ariaLabel={format(m.common.infoAbout, { field: m.editor.baseUrlLabel })} />
      </span>
      <input
        value={baseUrl}
        onChange={(event) => onBaseUrl(event.target.value)}
        placeholder={engine === "ollama" ? DEFAULT_OLLAMA_BASE_URL : DEFAULT_OPENAI_COMPATIBLE_BASE_URL}
        aria-label={m.editor.baseUrlLabel}
      />
    </label>
  );

  return (
    <div className="connection-presets">
      {hasActivePreset ? null : (
        <div className="connection-preset is-active">
          <div className="connection-preset-head connection-preset-head-static">
            <span>{m.editor.connectionPresetsCurrentLabel}</span>
          </div>
          <div className="connection-preset-body">
            {engineField}
            {baseUrlField}
          </div>
        </div>
      )}
      {presets.map((preset) => {
        const isOpen = expandedId === preset.id;
        const isActive = matchesPreset(preset, engine, baseUrl);
        return (
          <div className={isActive ? "connection-preset is-active" : "connection-preset"} key={preset.id}>
            {isOpen ? (
              <div className="connection-preset-head">
                <input
                  className="connection-preset-name"
                  value={preset.name}
                  onChange={(event) =>
                    updatePresets(presets.map((item) => (item.id === preset.id ? { ...item, name: event.target.value } : item)))
                  }
                  aria-label={m.editor.connectionPresetNameLabel}
                  autoFocus={preset.id === justCreatedId}
                  onFocus={(event) => event.target.select()}
                  onBlur={() => setJustCreatedId(null)}
                />
                {isActive ? <span className="connection-preset-active">{m.editor.connectionPresetActive}</span> : null}
                <button
                  type="button"
                  className="icon-button chevron"
                  aria-expanded={isOpen}
                  aria-label={`${m.common.close}: ${preset.name}`}
                  onClick={() => setExpandedId(null)}
                >
                  ▾
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="connection-preset-head"
                aria-expanded={isOpen}
                onClick={() => selectPreset(preset)}
              >
                <span className="connection-preset-name-label">
                  {preset.name}
                  <span className="connection-preset-subtitle">
                    {preset.engine === "ollama" ? m.editor.engineOllama : preset.baseUrl || m.editor.engineOpenAiCompatible}
                  </span>
                </span>
                {isActive ? <span className="connection-preset-active">{m.editor.connectionPresetActive}</span> : null}
                <span className="chevron" aria-hidden="true">
                  ▸
                </span>
              </button>
            )}
            {isOpen ? (
              <div className="connection-preset-body">
                {engineField}
                {baseUrlField}
                <div className="connection-preset-actions">
                  <button
                    type="button"
                    className="icon-button"
                    aria-label={`${m.editor.connectionPresetDelete}: ${preset.name}`}
                    onClick={() => {
                      if (!window.confirm(format(m.editor.connectionPresetDeleteConfirm, { name: preset.name }))) return;
                      updatePresets(presets.filter((item) => item.id !== preset.id));
                      setExpandedId(null);
                    }}
                  >
                    ×
                  </button>
                  <button
                    type="button"
                    className="text-button"
                    onClick={() =>
                      updatePresets(presets.map((item) => (item.id === preset.id ? { ...item, engine, baseUrl } : item)))
                    }
                  >
                    {m.editor.connectionPresetUpdate}
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        );
      })}
      <button
        type="button"
        className="text-button connection-preset-add"
        onClick={() => {
          const preset = newConnectionPreset(
            engine,
            baseUrl,
            presets.map((item) => item.name)
          );
          updatePresets([...presets, preset]);
          setExpandedId(preset.id);
          setJustCreatedId(preset.id);
        }}
      >
        {m.editor.connectionPresetNew}
      </button>
    </div>
  );
}
