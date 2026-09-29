import { useEffect, useMemo, useRef, useState } from "react";
import { splitLoreArticles, type LoreArticleCandidate } from "@core/loreImport";
import { count, format, useLocale } from "./i18n";

/**
 * A porting aid for an author's existing lorebook (roadmap-ideas.md #28,
 * step 1): paste or upload text, run it through the extractor, and let
 * whatever it finds land in the normal review queue — same mechanism as
 * extracting facts from a chapter or an interview, just without a chapter
 * behind it. Ephemeral like the interview transcript: the pasted text
 * itself is never saved to the book, only whatever facts come out of it.
 *
 * Text with no Markdown headers is treated as one article, with its title
 * typed in separately — the exact shape this card had before batching
 * existed, so the common single-article case is unchanged. Headers split
 * it into several candidate articles instead, each toggled on by default;
 * the author can exclude ones that don't belong before running the batch.
 */
export function LoreImportCard({
  busy,
  progress,
  onImport,
  onClose
}: {
  busy: boolean;
  progress: { current: number; total: number } | null;
  onImport: (articles: LoreArticleCandidate[]) => void;
  onClose: () => void;
}) {
  const { messages: m } = useLocale();
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [excluded, setExcluded] = useState<Set<number>>(new Set());
  const fileRef = useRef<HTMLInputElement>(null);

  const detected = useMemo(() => splitLoreArticles(text), [text]);
  const isBatch = detected.length > 1;

  useEffect(() => {
    setExcluded(new Set());
  }, [detected.length]);

  const articlesToImport: LoreArticleCandidate[] = isBatch
    ? detected.filter((_, index) => !excluded.has(index))
    : [{ title, text }];
  const includedCount = articlesToImport.filter((article) => article.text.trim()).length;

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
        {isBatch ? null : (
          <label className="bible-field">
            <span className="bible-field-label">{m.bible.importLoreArticleTitle}</span>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder={m.bible.importLoreArticleTitlePlaceholder}
            />
          </label>
        )}
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
          <button type="button" className="text-button" onClick={() => fileRef.current?.click()}>
            {m.bible.importLoreUpload}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".txt,.md,text/plain,text/markdown"
            className="visually-hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (!file) return;
              void file.text().then((content) => setText(content));
            }}
          />
        </div>
        {isBatch ? (
          <div className="lore-import-articles">
            <p className="quiet">{format(m.bible.importLoreFoundCount, { count: count(detected.length, m.bible.importLoreArticlesCount) })}</p>
            <ul className="lore-import-article-list">
              {detected.map((article, index) => (
                <li key={index} className="lore-import-article-row">
                  <label>
                    <input
                      type="checkbox"
                      checked={!excluded.has(index)}
                      onChange={(event) => {
                        setExcluded((prev) => {
                          const next = new Set(prev);
                          if (event.target.checked) next.delete(index);
                          else next.add(index);
                          return next;
                        });
                      }}
                    />
                    <span>{article.title || m.editor.untitled}</span>
                  </label>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        <div className="edit-actions">
          <button type="button" className="text-button" onClick={onClose}>
            {m.common.cancel}
          </button>
          <button
            type="button"
            className="primary"
            disabled={busy || includedCount === 0}
            onClick={() => onImport(articlesToImport)}
          >
            {busy
              ? progress
                ? format(m.bible.importLoreExtractingProgress, { current: progress.current, total: progress.total })
                : m.bible.importLoreExtracting
              : isBatch
                ? format(m.bible.importLoreActionCount, { count: count(includedCount, m.bible.importLoreArticlesCount) })
                : m.bible.importLoreAction}
          </button>
        </div>
      </div>
    </div>
  );
}
