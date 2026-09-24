import { useState } from "react";
import type { KnowledgeLeak } from "@core/continuity";
import { count, format, useLocale } from "./i18n";

export function ContinuityWarning({
  leaks,
  onJumpToChapter
}: {
  leaks: KnowledgeLeak[];
  onJumpToChapter: (chapterId: string) => void;
}) {
  const { messages: m } = useLocale();
  const [open, setOpen] = useState(false);

  if (leaks.length === 0) return null;

  return (
    <div className="continuity-warning">
      <button
        type="button"
        className="text-button continuity-warning-trigger"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
      >
        {count(leaks.length, m.continuity.leakCount)}
      </button>
      {open ? (
        <>
          <p className="quiet continuity-warning-hint">{m.continuity.leakHint}</p>
          <ul className="continuity-leak-list">
            {leaks.map((leak) => (
              <li key={leak.factId} className="continuity-leak-item">
                <p className="continuity-leak-value">
                  <strong>{leak.entityLabel}</strong> {leak.value}
                </p>
                <button
                  type="button"
                  className="bible-mention-jump"
                  onClick={() => onJumpToChapter(leak.establishedChapterId)}
                >
                  {format(m.continuity.establishedIn, { chapter: leak.establishedChapterTitle })}
                </button>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </div>
  );
}
