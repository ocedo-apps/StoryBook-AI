import React, { useEffect, useRef, useState } from "react";
import { useBookStore } from "./useBookStore";
import { HandbookPanel } from "./HandbookPanel";
import { ModelSelect } from "./SettingsPanel";
import { count, format, translateError, useLocale } from "./i18n";
import {
  checkForUpdates,
  detectGpuSuggestion,
  isDesktopApp,
  openExternalUrl,
  openOllamaDownloadPage,
  type GpuSuggestion,
  type UpdateStatus
} from "./desktopBridge";

const GPU_TIER_KEY = {
  "3b": "desktopGpuTier3b",
  "7b": "desktopGpuTier7b",
  "14b": "desktopGpuTier14b",
  "30b": "desktopGpuTier30b",
  "70b": "desktopGpuTier70b"
} as const;

export function Home({
  guideOpen,
  onOpenGuide,
  onCloseGuide
}: {
  guideOpen: boolean;
  onOpenGuide: () => void;
  onCloseGuide: () => void;
}) {
  const {
    summaries,
    newBook,
    openBook,
    deleteBook,
    importManuscript,
    error,
    engine,
    baseUrl,
    models,
    model,
    reviewModel,
    ollamaError,
    setEngine,
    setBaseUrl,
    setModel,
    setReviewModel
  } = useBookStore();
  const { messages: m } = useLocale();
  const [title, setTitle] = useState("");
  const [search, setSearch] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const filteredSummaries = summaries.filter((item) => item.title.toLowerCase().includes(search.trim().toLowerCase()));

  // Engine/model rarely changes once it works — no reason for the controls
  // to sit open and take up space every visit. null means "no explicit
  // choice yet": default to open while there's nothing connected or
  // something's wrong, collapsed once it's working, same as any other
  // status the author doesn't need to keep looking at. A manual toggle
  // always wins over that default for the rest of the session.
  const [connectOpen, setConnectOpen] = useState<boolean | null>(null);
  const connected = models.length > 0 && !ollamaError;
  const isConnectOpen = connectOpen ?? !connected;

  // Only the standalone desktop app can reach the OS (open a browser tab,
  // read GPU memory) — a plain browser tab has neither capability, so this
  // whole block stays invisible there.
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

  const [updateStatus, setUpdateStatus] = useState<UpdateStatus | null>(null);
  const [updateChecking, setUpdateChecking] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  function runUpdateCheck() {
    setUpdateChecking(true);
    setUpdateError(null);
    setUpdateStatus(null);
    checkForUpdates()
      .then(setUpdateStatus)
      .catch((err: unknown) => setUpdateError(String(err)))
      .finally(() => setUpdateChecking(false));
  }

  function submitNew(event?: React.SyntheticEvent) {
    event?.preventDefault();
    void newBook(title).then(() => setTitle(""));
  }

  return (
    <div className="home">
      <header className="home-brand">
        <img className="home-logo home-logo-light" src="/logo.png" alt="StoryBook AI" />
        <img className="home-logo home-logo-dark" src="/logo-dark.png" alt="StoryBook AI" />
        <div className="home-heading-row">
          <h1>
            {m.home.headline}
            <br />
            {m.home.truth}
          </h1>
          <div className="home-heading-actions">
            <button type="button" className="home-guide-button" onClick={onOpenGuide}>
              {m.guide.openFromHome}
            </button>
            <button type="button" className="home-guide-button" onClick={() => fileRef.current?.click()}>
              {m.home.importBackup}
            </button>
            {isDesktopApp() ? (
              <button type="button" className="home-guide-button" onClick={runUpdateCheck} disabled={updateChecking}>
                {updateChecking ? m.home.desktopCheckingUpdate : m.home.desktopCheckUpdate}
              </button>
            ) : null}
            <input
              ref={fileRef}
              className="setup-file"
              type="file"
              accept="application/json,.json"
              onChange={(event) => {
                const file = event.target.files?.[0];
                event.target.value = "";
                if (file) void importManuscript(file);
              }}
            />
          </div>
        </div>
        <p className="lede">{m.home.lede}</p>
        {updateError ? (
          <p className="banner home-banner" role="status">
            {format(m.home.desktopUpdateCheckFailed, { error: updateError })}
          </p>
        ) : updateStatus ? (
          <p className="quiet" role="status">
            {updateStatus.updateAvailable ? (
              <>
                {format(m.home.desktopUpdateAvailable, { current: updateStatus.current, latest: updateStatus.latest })}{" "}
                <button type="button" className="link-button" onClick={() => void openExternalUrl(updateStatus.releaseUrl)}>
                  {m.home.desktopUpdateLink}
                </button>
              </>
            ) : (
              format(m.home.desktopUpToDate, { current: updateStatus.current })
            )}
          </p>
        ) : null}
      </header>

      {error ? (
        <p className="banner home-banner" role="status">
          {translateError(error, m)}
        </p>
      ) : null}

      {/*
        A tester's feedback: "Connect a local AI" (in the Guide/Handbook)
        only ever opened more explanatory text, never actual connection
        setup — and Settings, where the real Engine/model controls live,
        was only reachable after creating a manuscript. Engine/baseUrl/
        model are already global (localStorage-backed, not per-book), so
        the real controls belong right here too, with nothing to create
        first.
      */}
      <section className="home-connect" aria-label={m.guide.connectAiButton}>
        <button
          type="button"
          className="home-connect-toggle"
          aria-expanded={isConnectOpen}
          onClick={() => setConnectOpen(!isConnectOpen)}
        >
          <span className="chevron" aria-hidden="true">
            {isConnectOpen ? "▾" : "▸"}
          </span>
          <h2 className="settings-heading home-heading-lg">{m.guide.connectAiButton}</h2>
        </button>
        <p className={ollamaError ? "banner home-banner" : "quiet"} role={ollamaError ? "status" : undefined}>
          {ollamaError ? translateError(ollamaError, m) : models.length > 0 ? count(models.length, m.home.connectFound) : m.home.connectNotFound}
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
        {isConnectOpen ? (
          <>
            <div className="settings-engine">
              <label className="craft-field">
                <span>{m.editor.engineLabel}</span>
                <select
                  value={engine}
                  onChange={(event) => setEngine(event.target.value === "openai-compatible" ? "openai-compatible" : "ollama")}
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
                    onChange={(event) => setBaseUrl(event.target.value)}
                    placeholder={m.editor.baseUrlPlaceholder}
                    title={m.editor.baseUrlLede}
                    aria-label={m.editor.baseUrlLabel}
                  />
                </label>
              ) : null}
            </div>
            {models.length > 0 ? (
              <div className="settings-models">
                <ModelSelect label={m.editor.writing} value={model} models={models} emptyLabel={m.editor.noModels} onChange={setModel} />
                <ModelSelect
                  label={m.editor.review}
                  value={reviewModel}
                  models={models}
                  emptyLabel={m.editor.noModels}
                  onChange={setReviewModel}
                />
              </div>
            ) : null}
          </>
        ) : null}
      </section>

      <form className="new-book" action="#" onSubmit={submitNew}>
        <label className="field-label home-heading-lg" htmlFor="new-title">
          {m.home.newManuscript}
        </label>
        <div className="new-book-row">
          <input
            id="new-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder={m.home.titlePlaceholder}
            autoComplete="off"
          />
          <button type="button" onClick={() => submitNew()}>
            {m.home.open}
          </button>
        </div>
      </form>

      <section className="book-shelf" aria-label={m.home.shelf}>
        <h2 className="settings-heading home-heading-lg">{m.home.shelfHeading}</h2>

        {summaries.length === 0 ? (
          <p className="empty-shelf">{m.home.emptyShelf}</p>
        ) : (
          <>
            <input
              type="search"
              className="book-shelf-search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={m.home.searchPlaceholder}
              aria-label={m.home.searchPlaceholder}
            />
            {filteredSummaries.length === 0 ? <p className="empty-shelf">{m.home.noSearchResults}</p> : null}
          </>
        )}

        {filteredSummaries.length > 0 ? (
          <ul>
            {filteredSummaries.map((item) => (
              <li key={item.id}>
                <button type="button" className="book-card" onClick={() => void openBook(item.id)}>
                  <strong>{item.title}</strong>
                  <span>
                    {count(item.chapterCount, m.home.chapters)}
                    <span className="dot">·</span>
                    {count(item.factCount, m.home.facts)}
                  </span>
                </button>
                <button
                  type="button"
                  className="text-button danger"
                  onClick={() => {
                    if (window.confirm(format(m.home.deleteConfirm, { title: item.title }))) {
                      void deleteBook(item.id);
                    }
                  }}
                >
                  {m.home.delete}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      {guideOpen ? (
        <div
          className="edit-overlay"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) onCloseGuide();
          }}
        >
          <div className="edit-card guide-overlay-card">
            <div className="edit-actions guide-overlay-close">
              <button type="button" className="text-button" onClick={onCloseGuide}>
                {m.guide.closeAction}
              </button>
            </div>
            <HandbookPanel />
          </div>
        </div>
      ) : null}
    </div>
  );
}
