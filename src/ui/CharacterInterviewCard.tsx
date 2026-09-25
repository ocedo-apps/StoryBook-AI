import { useEffect, useRef, useState } from "react";
import type { InterviewMessage } from "@core/characterInterview";
import { format, useLocale } from "./i18n";

export function CharacterInterviewCard({
  entity,
  history,
  busy,
  onAsk,
  onClose
}: {
  entity: { ref: string; label: string };
  history: InterviewMessage[];
  busy: boolean;
  onAsk: (question: string) => void;
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
          <button type="button" className="text-button" onClick={onClose}>
            {m.common.close}
          </button>
        </div>
        <h2 id="interview-title">{format(m.interview.title, { name: entity.label })}</h2>
        <p className="quiet">{format(m.interview.lede, { name: entity.label })}</p>

        <div className="interview-transcript" ref={transcriptRef}>
          {history.length === 0 ? <p className="quiet interview-empty">{format(m.interview.empty, { name: entity.label })}</p> : null}
          {history.map((turn, index) => (
            <p key={index} className={turn.role === "user" ? "interview-turn is-author" : "interview-turn is-character"}>
              <span className="interview-turn-label">{turn.role === "user" ? m.interview.you : entity.label}</span>
              {turn.content}
            </p>
          ))}
          {busy ? <p className="quiet interview-pending">{format(m.interview.thinking, { name: entity.label })}</p> : null}
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
