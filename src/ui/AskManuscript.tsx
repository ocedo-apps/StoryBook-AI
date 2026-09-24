import { useState } from "react";
import { format, useLocale } from "./i18n";
import type { AskManuscriptAnswer } from "@core/askManuscript";

export function AskManuscriptPanel({
  answer,
  busy,
  onAsk,
  onJumpToChapter
}: {
  answer: AskManuscriptAnswer | null;
  busy: boolean;
  onAsk: (question: string) => void;
  onJumpToChapter: (chapterId: string) => void;
}) {
  const { messages: m } = useLocale();
  const [question, setQuestion] = useState("");

  return (
    <main className="manuscript ask-manuscript">
      <h1 className="chapter-title">{m.askManuscript.title}</h1>
      <p className="synopsis-lede">{m.askManuscript.lede}</p>
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
          rows={3}
          disabled={busy}
          required
        />
        <div className="ask-manuscript-actions">
          <button type="submit" className="primary" disabled={busy || !question.trim()}>
            {busy ? m.askManuscript.asking : m.askManuscript.action}
          </button>
        </div>
      </form>

      {answer ? (
        <div className="ask-manuscript-answer">
          <h2 className="ask-manuscript-heading">{m.askManuscript.answerHeading}</h2>
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
      ) : (
        <p className="quiet ask-manuscript-empty">{m.askManuscript.empty}</p>
      )}
    </main>
  );
}
