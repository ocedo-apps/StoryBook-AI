import { useState } from "react";
import type { PlotlineMatrixRow } from "@core/plotlines";
import type { Plotline } from "@core/BookSchema";
import { format, useLocale } from "./i18n";

export function PlotlineMatrixPanel({
  rows,
  plotlines,
  onToggle,
  onAddPlotline,
  onRenamePlotline,
  onRemovePlotline,
  onJumpToChapter
}: {
  rows: PlotlineMatrixRow[];
  plotlines: Plotline[];
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
      <h1 className="chapter-title">{m.plotlines.title}</h1>
      <p className="synopsis-lede">{m.plotlines.lede}</p>

      {rows.length === 0 ? (
        <p className="quiet">{m.plotlines.emptyChapters}</p>
      ) : plotlines.length === 0 ? (
        <p className="quiet">{m.plotlines.emptyPlotlines}</p>
      ) : (
        <div className="plotline-matrix-scroll">
          <table className="plotline-matrix">
            <thead>
              <tr>
                <th className="plotline-matrix-corner">{m.plotlines.chapterColumn}</th>
                {plotlines.map((plotline) => (
                  <th key={plotline.id} className={`plotline-column-head is-${plotline.color}`}>
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
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.chapterId}>
                  <th scope="row" className="plotline-row-head">
                    <button type="button" className="bible-mention-jump" onClick={() => onJumpToChapter(row.chapterId)}>
                      {row.chapterTitle}
                    </button>
                  </th>
                  {plotlines.map((plotline) => {
                    const active = row.activePlotlineIds.includes(plotline.id);
                    return (
                      <td key={plotline.id}>
                        <button
                          type="button"
                          className={active ? `plotline-cell is-active is-${plotline.color}` : "plotline-cell"}
                          aria-pressed={active}
                          aria-label={format(m.plotlines.cellLabel, { chapter: row.chapterTitle, thread: plotline.title })}
                          onClick={() => onToggle(row.chapterId, plotline.id)}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
