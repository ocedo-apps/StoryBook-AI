import { useEffect, useState } from "react";
import { format, useLocale } from "./i18n";
import type { AskManuscriptAnswer } from "@core/askManuscript";

export function AskManuscriptPanel({
  answer,
  busy,
  onAsk,
  onJumpToChapter,
  onClose
}: {
  answer: AskManuscriptAnswer | null;
  busy: boolean;
  onAsk: (question: string) => void;
  onJumpToChapter: (chapterId: string) => void;
  onClose: () => void;
}) {
  const { messages: m } = useLocale();
  const [question, setQuestion] = useState("");

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
        className="edit-card ask-manuscript-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ask-manuscript-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="dialog-head">
          <h2 id="ask-manuscript-title">{m.askManuscript.title}</h2>
          <button type="button" className="text-button" onClick={onClose}>
            {m.common.close}
          </button>
        </div>

        <div className="ask-manuscript-scroll">
          {answer ? (
            <div className="ask-manuscript-answer">
              <h3 className="ask-manuscript-heading">{m.askManuscript.answerHeading}</h3>
              <p className="ask-manuscript-answer-text">{answer.answer}</p>
              <h3 className="ask-manuscript-heading">{m.askManuscript.sourcesHeading}</h3>
              <ul className="ask-manuscript-sources">
                {answer.evidence.map((item) => (
                  <li key={item.sceneId} className="ask-manuscript-source">
                    <button
                      type="button"
                      className="bible-mention-jump"
                      onClick={() => onJumpToChapter(item.chapterId)}
                      aria-label={format(m.askManuscript.jumpToChapter, { chapter: item.chapterTitle })}
                    >
                      {item.chapterTitle}
                    </button>
                    <p className="ask-manuscript-excerpt">“{item.excerpt}”</p>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        <form
          className="ask-manuscript-form"
          action="#"
          onSubmit={(event) => {
            event.preventDefault();
            const trimmed = question.trim();
            if (!trimmed || busy) return;
            onAsk(trimmed);
          }}
        >
          <textarea
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder={m.askManuscript.placeholder}
            rows={2}
            disabled={busy}
            required
          />
          <div className="ask-manuscript-actions">
            <button type="submit" className="primary" disabled={busy || !question.trim()}>
              {busy ? m.askManuscript.asking : m.askManuscript.action}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
