import { useState } from "react";
import type { TimelineBoardColumn } from "@core/timelineBoard";
import type { Plotline } from "@core/BookSchema";
import { format, useLocale } from "./i18n";

/**
 * Timeline and Plotlines answer different questions ("when" vs. "what
 * develops"), but they share the same left-to-right story-time axis — this
 * merges the two pages (roadmap-ideas.md #33) into one table: chapters as
 * columns in story-time order, threads as rows, so a gap in a thread is
 * visible directly instead of cross-checking a list against a matrix.
 */
export function TimelineBoardPanel({
  columns,
  plotlines,
  onSetStoryTime,
  onMove,
  onToggle,
  onAddPlotline,
  onRenamePlotline,
  onRemovePlotline,
  onJumpToChapter
}: {
  columns: TimelineBoardColumn[];
  plotlines: Plotline[];
  onSetStoryTime: (chapterId: string, text: string) => void;
  onMove: (chapterId: string, direction: "up" | "down") => void;
  onToggle: (chapterId: string, plotlineId: string) => void;
  onAddPlotline: (title: string) => void;
  onRenamePlotline: (plotlineId: string, title: string) => void;
  onRemovePlotline: (plotlineId: string) => void;
  onJumpToChapter: (chapterId: string) => void;
}) {
  const { messages: m } = useLocale();
  const [draft, setDraft] = useState("");

  return (
    <main className="manuscript plotline-matrix-page">
      <h1 className="chapter-title">{m.timeline.title}</h1>
      <p className="synopsis-lede">{m.timeline.lede}</p>
      <p className="synopsis-lede">{m.plotlines.lede}</p>

      {columns.length === 0 ? (
        <p className="quiet">{m.plotlines.emptyChapters}</p>
      ) : (
        <>
          <div className="plotline-matrix-scroll">
            <table className="plotline-matrix">
              <thead>
                <tr>
                  <th className="plotline-matrix-corner" />
                  {columns.map((column, index) => (
                    <th
                      key={column.chapterId}
                      scope="col"
                      className={column.outOfOrder ? "timeline-board-column is-out-of-order" : "timeline-board-column"}
                    >
                      <div className="timeline-board-column-inner">
                        <button
                          type="button"
                          className="bible-mention-jump timeline-title"
                          onClick={() => onJumpToChapter(column.chapterId)}
                        >
                          {column.chapterTitle}
                        </button>
                        <span className="timeline-position">
                          {format(m.timeline.readingPosition, { n: column.sequenceIndex + 1 })}
                        </span>
                        {column.outOfOrder ? <span className="timeline-flag">{m.timeline.outOfOrder}</span> : null}
                        <input
                          type="text"
                          className="timeline-story-time"
                          value={column.storyTime}
                          placeholder={m.timeline.storyTimePlaceholder}
                          onChange={(event) => onSetStoryTime(column.chapterId, event.target.value)}
                          aria-label={format(m.timeline.storyTimeLabel, { chapter: column.chapterTitle })}
                        />
                        <div className="timeline-move">
                          <button
                            type="button"
                            className="text-button"
                            onClick={() => onMove(column.chapterId, "up")}
                            disabled={index === 0}
                            aria-label={m.timeline.moveEarlier}
                          >
                            ←
                          </button>
                          <button
                            type="button"
                            className="text-button"
                            onClick={() => onMove(column.chapterId, "down")}
                            disabled={index === columns.length - 1}
                            aria-label={m.timeline.moveLater}
                          >
                            →
                          </button>
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {plotlines.map((plotline) => (
                  <tr key={plotline.id}>
                    <th scope="row" className={`plotline-row-head plotline-column-head is-${plotline.color}`}>
                      <input
                        className="plotline-column-title"
                        value={plotline.title}
                        onChange={(event) => onRenamePlotline(plotline.id, event.target.value)}
                        aria-label={m.plotlines.renameLabel}
                      />
                      <button
                        type="button"
                        className="text-button plotline-remove"
                        onClick={() => onRemovePlotline(plotline.id)}
                        aria-label={format(m.plotlines.removeThread, { title: plotline.title })}
                      >
                        ×
                      </button>
                    </th>
                    {columns.map((column) => {
                      const active = column.activePlotlineIds.includes(plotline.id);
                      return (
                        <td key={column.chapterId}>
                          <button
                            type="button"
                            className={active ? `plotline-cell is-active is-${plotline.color}` : "plotline-cell"}
                            aria-pressed={active}
                            aria-label={format(m.plotlines.cellLabel, { chapter: column.chapterTitle, thread: plotline.title })}
                            onClick={() => onToggle(column.chapterId, plotline.id)}
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {plotlines.length === 0 ? <p className="quiet">{m.plotlines.emptyPlotlines}</p> : null}
        </>
      )}

      <form
        className="plotline-add-form"
        action="#"
        onSubmit={(event) => {
          event.preventDefault();
          const trimmed = draft.trim();
          if (!trimmed) return;
          onAddPlotline(trimmed);
          setDraft("");
        }}
      >
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder={m.plotlines.addPlaceholder}
          aria-label={m.plotlines.addPlaceholder}
        />
        <button type="submit" className="primary" disabled={!draft.trim()}>
          {m.plotlines.addAction}
        </button>
      </form>
    </main>
  );
}
