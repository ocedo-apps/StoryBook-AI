import { useState } from "react";
import type { PlaceholderLocation } from "@core/placeholders";
import { count, format, useLocale } from "./i18n";

export function PlaceholdersPanel({
  items,
  onJump
}: {
  items: PlaceholderLocation[];
  onJump: (chapterId: string, placeholderId: string) => void;
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
        {count(items.length, m.placeholders.count)}
      </button>
      {open ? (
        <ul className="continuity-leak-list">
          {items.map(({ chapterId, chapterTitle, placeholder }) => (
            <li key={placeholder.id} className="continuity-leak-item">
              <p className="continuity-leak-value">{placeholder.note.trim() || m.placeholders.empty}</p>
              <button type="button" className="bible-mention-jump" onClick={() => onJump(chapterId, placeholder.id)}>
                {format(m.placeholders.jumpTo, { chapter: chapterTitle })}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
