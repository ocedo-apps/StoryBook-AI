import { useState } from "react";
import { useLocale } from "./i18n";

/**
 * Free-form critical craft feedback (roadmap-ideas.md #32). One card serves
 * two entry points: opened directly (via the "Ask about chapter" button) it
 * starts empty and the author types a whole-chapter question here; opened
 * after a ProseCanvas selection already asked its own question, it shows the
 * answer immediately, with the question field free for a follow-up.
 */
export function AskAboutPassageCard({
  answer,
  busy,
  onAsk,
  onClose
}: {
  answer: { question: string; answer: string } | null;
  busy: boolean;
  onAsk: (question: string) => void;
  onClose: () => void;
}) {
  const { messages: m } = useLocale();
  const [question, setQuestion] = useState("");

  return (
    <div
      className="edit-overlay"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <form
        className="edit-card"
        action="#"
        aria-labelledby="ask-passage-card-title"
        onSubmit={(event) => {
          event.preventDefault();
          const trimmed = question.trim();
          if (!trimmed || busy) return;
          onAsk(trimmed);
          setQuestion("");
        }}
      >
        <h2 id="ask-passage-card-title">{m.askPassage.title}</h2>
        <p className="quiet">{m.askPassage.lede}</p>
        <textarea
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder={m.askPassage.placeholder}
          rows={3}
          disabled={busy}
          autoFocus
          required
        />
        <div className="edit-actions">
          <button type="button" className="text-button" onClick={onClose}>
            {m.common.close}
          </button>
          <button type="submit" className="primary" disabled={busy || !question.trim()}>
            {busy ? m.askPassage.asking : m.askPassage.action}
          </button>
        </div>
        {answer ? (
          <div className="ask-manuscript-answer">
            <blockquote className="marked-passage">{answer.question}</blockquote>
            <h3 className="ask-manuscript-heading">{m.askPassage.answerHeading}</h3>
            <p className="ask-manuscript-answer-text">{answer.answer}</p>
          </div>
        ) : null}
      </form>
    </div>
  );
}
