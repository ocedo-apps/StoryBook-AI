import React, { useEffect, useState } from "react";
import { FEEDBACK_CATEGORIES, type FeedbackItem } from "@core/chapterFeedback";
import { readerCategory } from "@core/reader";
import { useLocale, format } from "./i18n";

export function ChapterFeedbackCard({
  items,
  readerAge,
  onClose
}: {
  items: FeedbackItem[];
  readerAge?: number;
  onClose: () => void;
}) {
  const { messages: m } = useLocale();
  const [selected, setSelected] = useState<number | null>(null);
  const current = selected !== null ? (items[selected] ?? null) : null;

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const groups = FEEDBACK_CATEGORIES.map((category) => ({
    category,
    rows: items
      .map((item, index) => ({ item, index }))
      .filter((row) => row.item.category === category)
  })).filter((group) => group.rows.length > 0);

  return (
    <div
      className="edit-overlay"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="edit-card stats-card" role="dialog" aria-modal="true" aria-labelledby="notes-title">
        <div className="stats-card-head">
          <p className="chapter-craft-label">{m.notes.review}</p>
          <button type="button" className="text-button" onClick={onClose}>
            {m.common.close}
          </button>
        </div>
        <h2 id="notes-title">{items.length > 0 ? m.notes.title : m.notes.emptyTitle}</h2>
        <p className="quiet">
          {m.notes.intro}
          {readerAge !== undefined && readerAge < 18
            ? ` ${format(m.notes.introReader, {
                age: readerAge,
                category: m.editor.readerCategories[readerCategory(readerAge)]
              })}`
            : ""}
        </p>

        {current ? (
          <div className="stats-sentence">
            <p className="chapter-craft-label">
              {m.notes.categories[current.category].label}
              {current.paragraphIndex !== null
                ? ` · ${format(m.notes.paragraph, { n: current.paragraphIndex + 1 })}`
                : ""}
            </p>
            <blockquote>{current.quote}</blockquote>
            <p className="chapter-craft-label">{m.notes.note}</p>
            <p className="quiet">{current.observation}</p>
            {current.relatedFact ? <p className="quiet">{current.relatedFact}</p> : null}
          </div>
        ) : items.length > 0 ? (
          <p className="quiet stats-spark-hint">{m.notes.clickHint}</p>
        ) : (
          <p className="quiet">{m.notes.nothingSolid}</p>
        )}

        {groups.map((group) => (
          <div key={group.category} className="stats-long stats-packed">
            <p className="chapter-craft-label">{m.notes.categories[group.category].label}</p>
            <p className="quiet">{m.notes.categories[group.category].blurb}</p>
            <ul>
              {group.rows.map(({ item, index }) => (
                <li key={`${item.category}-${index}`} className={selected === index ? "is-selected" : undefined}>
                  <button type="button" className="stats-long-pick" onClick={() => setSelected(index)}>
                    {clip(item.quote, 140)}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <p className="quiet stats-foot">{m.notes.foot}</p>
      </div>
    </div>
  );
}

function clip(text: string, max: number): string {
  const collapsed = text.replace(/\s+/g, " ").trim();
  if (collapsed.length <= max) return collapsed;
  return `${collapsed.slice(0, max - 1).trimEnd()}…`;
}
