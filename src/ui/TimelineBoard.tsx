import { useState } from "react";
import type { TimelineBoardColumn } from "@core/timelineBoard";
import type { Plotline } from "@core/BookSchema";
import type { PlotlineColor } from "@core/plotlineColors";
import { format, useLocale } from "./i18n";
import { PlotlineEditCard } from "./PlotlineEditCard";

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
  onUpdatePlotline,
  onRemovePlotline,
  onJumpToChapter
}: {
  columns: TimelineBoardColumn[];
  plotlines: Plotline[];
  onSetStoryTime: (chapterId: string, text: string) => void;
  onMove: (chapterId: string, direction: "up" | "down") => void;
  onToggle: (chapterId: string, plotlineId: string) => void;
  onAddPlotline: (title: string) => void;
  onUpdatePlotline: (plotlineId: string, patch: { title: string; color: PlotlineColor; description: string }) => void;
  onRemovePlotline: (plotlineId: string) => void;
  onJumpToChapter: (chapterId: string) => void;
}) {
  const { messages: m } = useLocale();
  const [draft, setDraft] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const editing = plotlines.find((plotline) => plotline.id === editingId) ?? null;

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
                          <span className="timeline-position">
                            {format(m.timeline.readingPosition, { n: column.sequenceIndex + 1 })}
                          </span>
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
                        <span className="timeline-flag">{column.outOfOrder ? m.timeline.outOfOrder : null}</span>
                        <span className="timeline-position">{m.timeline.storyTimeCaption}</span>
                        <input
                          type="text"
                          className="timeline-story-time"
                          value={column.storyTime}
                          placeholder={m.timeline.storyTimePlaceholder}
                          onChange={(event) => onSetStoryTime(column.chapterId, event.target.value)}
                          aria-label={format(m.timeline.storyTimeLabel, { chapter: column.chapterTitle })}
                        />
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {plotlines.map((plotline) => (
                  <tr key={plotline.id}>
                    <th scope="row" className={`plotline-row-head plotline-column-head is-${plotline.color}`}>
                      <div className="plotline-row-title">
                        <span className="plotline-row-title-text" title={plotline.description || undefined}>
                          {plotline.title}
                        </span>
                        <button
                          type="button"
                          className="text-button plotline-edit"
                          onClick={() => setEditingId(plotline.id)}
                          aria-label={format(m.plotlines.editLabel, { title: plotline.title })}
                        >
                          {m.plotlines.editAction}
                        </button>
                      </div>
                    </th>
                    {columns.map((column, index) => {
                      const active = column.activePlotlineIds.includes(plotline.id);
                      // Consecutive active cells in a row read as one unbroken bar
                      // instead of separate dots — run-start/run-end decide which
                      // corners round, so only the ends of a stretch are capped.
                      const isRunStart = active && (index === 0 || !columns[index - 1]!.activePlotlineIds.includes(plotline.id));
                      const isRunEnd =
                        active && (index === columns.length - 1 || !columns[index + 1]!.activePlotlineIds.includes(plotline.id));
                      const cellClass = [
                        "plotline-cell",
                        active ? `is-active is-${plotline.color}` : "",
                        isRunStart ? "is-run-start" : "",
                        isRunEnd ? "is-run-end" : ""
                      ]
                        .filter(Boolean)
                        .join(" ");
                      return (
                        <td key={column.chapterId}>
                          <button
                            type="button"
                            className={cellClass}
                            aria-pressed={active}
                            title={active ? plotline.description || undefined : undefined}
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

      {editing ? (
        <PlotlineEditCard
          plotline={editing}
          onSave={(patch) => {
            onUpdatePlotline(editing.id, patch);
            setEditingId(null);
          }}
          onRemove={() => {
            onRemovePlotline(editing.id);
            setEditingId(null);
          }}
          onClose={() => setEditingId(null)}
        />
      ) : null}
    </main>
  );
}
