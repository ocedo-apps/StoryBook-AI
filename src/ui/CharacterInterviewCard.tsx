import { useEffect, useRef, useState } from "react";
import type { InterviewMessage } from "@core/characterInterview";
import type { BibleKind } from "@core/bibleGroups";
import { format, useLocale } from "./i18n";

function CharacterAvatar({ thumb, label }: { thumb: string | undefined; label: string }) {
  return (
    <span className="interview-avatar" aria-hidden="true">
      {thumb ? <img src={thumb} alt="" /> : label.trim().charAt(0).toUpperCase() || "?"}
    </span>
  );
}

/** The larger portrait at the top of the info column — a full picture from the Story Bible entity's own gallery when it has one, the same initial-letter fallback as the small chat avatar when it doesn't. */
function EntityPortrait({ image, label }: { image: string | undefined; label: string }) {
  return (
    <div className="interview-portrait" aria-hidden="true">
      {image ? <img src={image} alt="" /> : <span className="interview-portrait-fallback">{label.trim().charAt(0).toUpperCase() || "?"}</span>}
    </div>
  );
}

function AuthorAvatar() {
  return (
    <span className="interview-avatar" aria-hidden="true">
      <svg viewBox="0 0 24 24" width="60%" height="60%" fill="currentColor">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4.4 3.6-8 8-8s8 3.6 8 8v1H4v-1z" />
      </svg>
    </span>
  );
}

export function CharacterInterviewCard({
  entity,
  characterThumb,
  characterImage,
  history,
  busy,
  extracting,
  blocked,
  error,
  personalityDraft,
  savedPersonality,
  onPersonalityDraftChange,
  onSavePersonality,
  onAsk,
  onExtractFacts,
  extractChapters,
  extractChapterId,
  onExtractChapterIdChange,
  onClose
}: {
  entity: { ref: string; label: string; kind: BibleKind };
  characterThumb?: string;
  characterImage?: string;
  history: InterviewMessage[];
  busy: boolean;
  extracting: boolean;
  /** True while some unrelated AI action elsewhere in the app is running — Ask/Extract would otherwise look clickable but silently do nothing. */
  blocked: boolean;
  error?: string | null;
  personalityDraft: string;
  savedPersonality: string;
  onPersonalityDraftChange: (text: string) => void;
  onSavePersonality: () => void;
  onAsk: (question: string) => void;
  onExtractFacts: () => void;
  /** In story-time order, so picking top-to-bottom follows the plot's own chronology, not the manuscript's page order. */
  extractChapters: { id: string; title: string }[];
  extractChapterId: string | null;
  onExtractChapterIdChange: (chapterId: string) => void;
  onClose: () => void;
}) {
  const { messages: m } = useLocale();
  const [question, setQuestion] = useState("");
  const transcriptRef = useRef<HTMLDivElement>(null);
  const isCharacter = entity.kind === "characters";

  useEffect(() => {
    const el = transcriptRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [history.length, busy]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="edit-overlay"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="edit-card interview-card" role="dialog" aria-modal="true" aria-labelledby="interview-title">
        <div className="stats-card-head">
          <p className="chapter-craft-label">{m.interview.action}</p>
          <div className="bible-card-head-actions">
            {extractChapters.length > 0 ? (
              <label className="interview-extract-chapter" title={m.interview.extractAsOfHint}>
                <span>{m.interview.extractAsOf}</span>
                <select
                  value={extractChapterId ?? ""}
                  onChange={(event) => onExtractChapterIdChange(event.target.value)}
                  disabled={busy || extracting || blocked}
                  aria-label={m.interview.extractAsOf}
                >
                  {extractChapters.map((chapter) => (
                    <option key={chapter.id} value={chapter.id}>
                      {chapter.title}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
            <button
              type="button"
              className="primary"
              disabled={history.length === 0 || busy || extracting || blocked}
              onClick={onExtractFacts}
            >
              {extracting ? m.interview.extracting : m.interview.extractAction}
            </button>
            <button type="button" className="text-button" onClick={onClose}>
              {m.common.close}
            </button>
          </div>
        </div>
        <div className="interview-body">
          <div className="interview-info">
            <h2 id="interview-title">{format(isCharacter ? m.interview.title : m.interview.titleWorld, { name: entity.label })}</h2>
            <EntityPortrait image={characterImage} label={entity.label} />
            <p className="quiet">{format(isCharacter ? m.interview.lede : m.interview.ledeWorld, { name: entity.label })}</p>

            {isCharacter ? (
              <div className="interview-personality">
                <label htmlFor="interview-personality-field" className="field-label">
                  {m.interview.personalityLabel}
                </label>
                <textarea
                  id="interview-personality-field"
                  value={personalityDraft}
                  onChange={(event) => onPersonalityDraftChange(event.target.value)}
                  placeholder={m.interview.personalityPlaceholder}
                  rows={2}
                />
                <button
                  type="button"
                  className="text-button"
                  disabled={personalityDraft === savedPersonality}
                  onClick={onSavePersonality}
                >
                  {m.interview.personalitySave}
                </button>
              </div>
            ) : null}
          </div>

          <div className="interview-chat">
            <div className="interview-transcript" ref={transcriptRef}>
              {history.length === 0 ? (
                <p className="quiet interview-empty">
                  {format(isCharacter ? m.interview.empty : m.interview.emptyWorld, { name: entity.label })}
                </p>
              ) : null}
              {history.map((turn, index) => {
                const isAuthor = turn.role === "user";
                return (
                  <div key={index} className={isAuthor ? "interview-row is-author" : "interview-row is-character"}>
                    {isAuthor ? <AuthorAvatar /> : <CharacterAvatar thumb={characterThumb} label={entity.label} />}
                    <p className="interview-turn">
                      <span className="interview-turn-label">{isAuthor ? m.interview.you : entity.label}</span>
                      {turn.content}
                    </p>
                  </div>
                );
              })}
              {busy && history[history.length - 1]?.role !== "assistant" ? (
                <div className="interview-row is-character">
                  <CharacterAvatar thumb={characterThumb} label={entity.label} />
                  <p className="quiet interview-pending">
                    {format(isCharacter ? m.interview.thinking : m.interview.thinkingWorld, { name: entity.label })}
                  </p>
                </div>
              ) : null}
            </div>

            {error ? (
              <p className="interview-error" role="alert">
                {error}
              </p>
            ) : blocked ? (
              <p className="interview-error" role="status">
                {m.errors.busy}
              </p>
            ) : null}

            <form
              className="interview-form"
              onSubmit={(event) => {
                event.preventDefault();
                const trimmed = question.trim();
                if (!trimmed || busy || blocked) return;
                onAsk(trimmed);
                setQuestion("");
              }}
            >
              <textarea
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                onKeyDown={(event) => {
                  // Enter sends the question, like any chat box — Shift+Enter
                  // still inserts a newline for a multi-part question.
                  if (event.key !== "Enter" || event.shiftKey) return;
                  event.preventDefault();
                  event.currentTarget.form?.requestSubmit();
                }}
                placeholder={format(isCharacter ? m.interview.placeholder : m.interview.placeholderWorld, { name: entity.label })}
                rows={2}
                disabled={busy || blocked}
                aria-label={m.interview.action}
              />
              <div className="edit-actions">
                <button type="submit" className="primary" disabled={busy || blocked || !question.trim()}>
                  {busy ? m.interview.asking : m.interview.ask}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
