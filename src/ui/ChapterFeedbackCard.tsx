import React, { useEffect, useState } from "react";
import { ANALYZE_INTRO, FEEDBACK_BLURBS, FEEDBACK_CATEGORIES, FEEDBACK_LABELS, type FeedbackItem } from "@core/chapterFeedback";

export function ChapterFeedbackCard({
  items,
  onClose
}: {
  items: FeedbackItem[];
  onClose: () => void;
}) {
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
          <p className="chapter-craft-label">Review</p>
          <button type="button" className="text-button" onClick={onClose}>
            Close
          </button>
        </div>
        <h2 id="notes-title">{items.length > 0 ? "Chapter notes" : "Nothing to flag"}</h2>
        <p className="quiet">{ANALYZE_INTRO}</p>

        {current ? (
          <div className="stats-sentence">
            <p className="chapter-craft-label">
              {FEEDBACK_LABELS[current.category]}
              {current.paragraphIndex !== null ? ` · Paragraph ${current.paragraphIndex + 1}` : ""}
            </p>
            <blockquote>{current.quote}</blockquote>
            <p className="chapter-craft-label">Note</p>
            <p className="quiet">{current.observation}</p>
            {current.relatedFact ? <p className="quiet">{current.relatedFact}</p> : null}
          </div>
        ) : items.length > 0 ? (
          <p className="quiet stats-spark-hint">Click a note to read the quote. Notes are not rewrites.</p>
        ) : (
          <p className="quiet">The Review model found nothing solid in this pass.</p>
        )}

        {groups.map((group) => (
          <div key={group.category} className="stats-long stats-packed">
            <p className="chapter-craft-label">{FEEDBACK_LABELS[group.category]}</p>
            <p className="quiet">{FEEDBACK_BLURBS[group.category]}</p>
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

        <p className="quiet stats-foot">Notes flag a spot. They do not rewrite the chapter or touch the Story Bible.</p>
      </div>
    </div>
  );
}

function clip(text: string, max: number): string {
  const collapsed = text.replace(/\s+/g, " ").trim();
  if (collapsed.length <= max) return collapsed;
  return `${collapsed.slice(0, max - 1).trimEnd()}…`;
}
