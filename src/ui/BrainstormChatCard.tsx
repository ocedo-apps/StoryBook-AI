import { useEffect, useRef, useState } from "react";
import type { BrainstormChatMessage } from "@core/brainstorm";
import { useLocale } from "./i18n";

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

function PartnerAvatar() {
  return (
    <span className="interview-avatar" aria-hidden="true">
      <svg viewBox="0 0 24 24" width="60%" height="60%" fill="currentColor">
        <path d="M12 2a7 7 0 0 0-4 12.74V17a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-2.26A7 7 0 0 0 12 2z" />
        <path d="M9 20h6v1a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-1z" />
      </svg>
    </span>
  );
}

export function BrainstormChatCard({
  history,
  busy,
  blocked,
  error,
  onAsk,
  onAddToNotes,
  onClose
}: {
  history: BrainstormChatMessage[];
  busy: boolean;
  /** True while some unrelated AI action elsewhere in the app is running. */
  blocked: boolean;
  error?: string | null;
  onAsk: (message: string) => void;
  onAddToNotes: (text: string) => void;
  onClose: () => void;
}) {
  const { messages: m } = useLocale();
  const [draft, setDraft] = useState("");
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
      <div className="edit-card interview-card" role="dialog" aria-modal="true" aria-labelledby="brainstorm-chat-title">
        <div className="stats-card-head">
          <p className="chapter-craft-label">{m.brainstormChat.title}</p>
          <div className="bible-card-head-actions">
            <button type="button" className="text-button" onClick={onClose}>
              {m.common.close}
            </button>
          </div>
        </div>
        <div className="interview-body">
          <div className="interview-chat">
            <h2 id="brainstorm-chat-title" className="visually-hidden">
              {m.brainstormChat.title}
            </h2>
            <p className="quiet brainstorm-chat-lede">{m.brainstormChat.lede}</p>
            <div className="interview-transcript" ref={transcriptRef}>
              {history.length === 0 ? <p className="quiet interview-empty">{m.brainstormChat.empty}</p> : null}
              {history.map((turn, index) => {
                const isAuthor = turn.role === "user";
                return (
                  <div key={index} className={isAuthor ? "interview-row is-author" : "interview-row is-character"}>
                    {isAuthor ? <AuthorAvatar /> : <PartnerAvatar />}
                    <div>
                      <p className="interview-turn">
                        <span className="interview-turn-label">{isAuthor ? m.brainstormChat.you : m.brainstormChat.partner}</span>
                        {turn.content}
                      </p>
                      {!isAuthor && turn.content.trim() ? (
                        <button
                          type="button"
                          className="text-button brainstorm-chat-save"
                          onClick={() => onAddToNotes(turn.content)}
                        >
                          {m.brainstormChat.addToNotes}
                        </button>
                      ) : null}
                    </div>
                  </div>
                );
              })}
              {busy && history[history.length - 1]?.role !== "assistant" ? (
                <div className="interview-row is-character">
                  <PartnerAvatar />
                  <p className="quiet interview-pending">{m.brainstormChat.thinking}</p>
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
                const trimmed = draft.trim();
                if (!trimmed || busy || blocked) return;
                onAsk(trimmed);
                setDraft("");
              }}
            >
              <textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key !== "Enter" || event.shiftKey) return;
                  event.preventDefault();
                  event.currentTarget.form?.requestSubmit();
                }}
                placeholder={m.brainstormChat.placeholder}
                rows={2}
                disabled={busy || blocked}
                autoFocus
                aria-label={m.brainstormChat.title}
              />
              <div className="edit-actions">
                <button type="submit" className="primary" disabled={busy || blocked || !draft.trim()}>
                  {busy ? m.brainstormChat.sending : m.brainstormChat.send}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
