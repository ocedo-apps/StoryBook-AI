import { useState } from "react";
import { useLocale } from "./i18n";

/**
 * A porting aid for an author's existing lorebook (roadmap: rich-lore
 * import): paste one article's text, run it through the extractor, and let
 * whatever it finds land in the normal review queue — same mechanism as
 * extracting facts from a chapter or an interview, just without a chapter
 * behind it. Ephemeral like the interview transcript: the pasted text
 * itself is never saved to the book, only whatever facts come out of it.
 */
export function LoreImportCard({
  busy,
  onImport,
  onClose
}: {
  busy: boolean;
  onImport: (title: string, text: string) => void;
  onClose: () => void;
}) {
  const { messages: m } = useLocale();
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");

  return (
    <div
      className="edit-overlay"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="edit-card bible-card" role="dialog" aria-modal="true" aria-labelledby="lore-import-title">
        <div className="bible-card-head">
          <h2 id="lore-import-title">{m.bible.importLoreTitle}</h2>
          <div className="bible-card-head-actions">
            <button type="button" className="text-button" onClick={onClose}>
              {m.bible.close}
            </button>
          </div>
        </div>
        <p className="quiet">{m.bible.importLoreLede}</p>
        <label className="bible-field">
          <span className="bible-field-label">{m.bible.importLoreArticleTitle}</span>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder={m.bible.importLoreArticleTitlePlaceholder}
          />
        </label>
        <label className="bible-field">
          <span className="bible-field-label">{m.bible.importLoreText}</span>
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder={m.bible.importLoreTextPlaceholder}
            rows={12}
          />
        </label>
        <div className="edit-actions">
          <button type="button" className="text-button" onClick={onClose}>
            {m.common.cancel}
          </button>
          <button type="button" className="primary" disabled={busy || !text.trim()} onClick={() => onImport(title, text)}>
            {busy ? m.bible.importLoreExtracting : m.bible.importLoreAction}
          </button>
        </div>
      </div>
    </div>
  );
}
