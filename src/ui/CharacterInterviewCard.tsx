import { useEffect, useRef, useState } from "react";
import type { InterviewMessage } from "@core/characterInterview";
import { format, useLocale } from "./i18n";

function CharacterAvatar({ thumb, label }: { thumb: string | undefined; label: string }) {
  return (
    <span className="interview-avatar" aria-hidden="true">
      {thumb ? <img src={thumb} alt="" /> : label.trim().charAt(0).toUpperCase() || "?"}
    </span>
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
  history,
  busy,
  extracting,
  onAsk,
  onExtractFacts,
  onClose
}: {
  entity: { ref: string; label: string };
  characterThumb?: string;
  history: InterviewMessage[];
  busy: boolean;
  extracting: boolean;
  onAsk: (question: string) => void;
  onExtractFacts: () => void;
  onClose: () => void;
}) {
  const { messages: m } = useLocale();
  const [question, setQuestion] = useState("");
  const transcriptRef = useRef<HTMLDivElement>(null);

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
            <button
              type="button"
              className="text-button"
              disabled={history.length === 0 || busy || extracting}
              onClick={onExtractFacts}
            >
              {extracting ? m.interview.extracting : m.interview.extractAction}
            </button>
            <button type="button" className="text-button" onClick={onClose}>
              {m.common.close}
            </button>
          </div>
        </div>
        <h2 id="interview-title">{format(m.interview.title, { name: entity.label })}</h2>
        <p className="quiet">{format(m.interview.lede, { name: entity.label })}</p>

        <div className="interview-transcript" ref={transcriptRef}>
          {history.length === 0 ? <p className="quiet interview-empty">{format(m.interview.empty, { name: entity.label })}</p> : null}
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
          {busy ? (
            <div className="interview-row is-character">
              <CharacterAvatar thumb={characterThumb} label={entity.label} />
              <p className="quiet interview-pending">{format(m.interview.thinking, { name: entity.label })}</p>
            </div>
          ) : null}
        </div>

        <form
          className="interview-form"
          onSubmit={(event) => {
            event.preventDefault();
            const trimmed = question.trim();
            if (!trimmed || busy) return;
            onAsk(trimmed);
            setQuestion("");
          }}
        >
          <textarea
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder={format(m.interview.placeholder, { name: entity.label })}
            rows={2}
            disabled={busy}
            aria-label={m.interview.action}
          />
          <div className="edit-actions">
            <button type="submit" className="primary" disabled={busy || !question.trim()}>
              {busy ? m.interview.asking : m.interview.ask}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
