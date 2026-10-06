import { useState } from "react";
import type { DarlingLocation } from "@core/darlings";
import { count, format, useLocale } from "./i18n";

export function DarlingsPanel({
  items,
  onRestore,
  onDiscard
}: {
  items: DarlingLocation[];
  onRestore: (chapterId: string, darlingId: string) => void;
  onDiscard: (chapterId: string, darlingId: string) => void;
}) {
  const { messages: m } = useLocale();
  const [open, setOpen] = useState(false);

  if (items.length === 0) return null;

  return (
    <div className="continuity-warning">
      <button
        type="button"
        className="text-button continuity-warning-trigger"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
      >
        {count(items.length, m.darlings.count)}
      </button>
      {open ? (
        <ul className="continuity-leak-list">
          {items.map(({ chapterId, chapterTitle, darling }) => (
            <li key={darling.id} className="continuity-leak-item">
              <p className="continuity-leak-value">{darling.text}</p>
              <span className="darling-location">{format(m.darlings.jumpTo, { chapter: chapterTitle })}</span>
              <div className="darling-actions">
                <button type="button" className="bible-mention-jump" onClick={() => onRestore(chapterId, darling.id)}>
                  {m.darlings.restore}
                </button>
                <button type="button" className="text-button" onClick={() => onDiscard(chapterId, darling.id)}>
                  {m.darlings.discard}
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
