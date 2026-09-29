import { useState } from "react";
import type { Plotline } from "@core/BookSchema";
import { PLOTLINE_COLORS, type PlotlineColor } from "@core/plotlineColors";
import { format, useLocale } from "./i18n";

/**
 * One edit surface for a thread's name, color, and optional description,
 * replacing what used to be an always-visible rename field and a 10-swatch
 * color grid sitting directly in the Timeline/Plotlines row header — that
 * took up space and drew the eye every time, even when nobody was editing.
 * The description exists only to be read back as a tooltip (see
 * TimelineBoard's `title` attributes on the thread name and its bars), so
 * there's no separate display for it here beyond the placeholder saying so.
 */
export function PlotlineEditCard({
  plotline,
  onSave,
  onRemove,
  onClose
}: {
  plotline: Plotline;
  onSave: (patch: { title: string; color: PlotlineColor; description: string; hideFromAi: boolean }) => void;
  onRemove: () => void;
  onClose: () => void;
}) {
  const { messages: m } = useLocale();
  const [title, setTitle] = useState(plotline.title);
  const [color, setColor] = useState<PlotlineColor>(plotline.color);
  const [description, setDescription] = useState(plotline.description ?? "");
  const [hideFromAi, setHideFromAi] = useState(plotline.hide_from_ai ?? false);

  return (
    <div
      className="edit-overlay"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="edit-card bible-card" role="dialog" aria-modal="true" aria-labelledby="plotline-edit-title">
        <div className="bible-card-head">
          <h2 id="plotline-edit-title">{m.plotlines.editTitle}</h2>
          <div className="bible-card-head-actions">
            <button type="button" className="text-button" onClick={onClose}>
              {m.bible.close}
            </button>
          </div>
        </div>
        <label className="bible-field">
          <span className="bible-field-label">{m.plotlines.renameLabel}</span>
          <input value={title} onChange={(event) => setTitle(event.target.value)} />
        </label>
        <div className="bible-field">
          <span className="bible-field-label">{m.plotlines.colorFieldLabel}</span>
          <div className="plotline-color-picker">
            {PLOTLINE_COLORS.map((candidate) => (
              <button
                key={candidate}
                type="button"
                className={
                  candidate === color
                    ? `plotline-color-swatch is-${candidate} is-selected`
                    : `plotline-color-swatch is-${candidate}`
                }
                aria-pressed={candidate === color}
                aria-label={format(m.plotlines.colorSwatchLabel, {
                  thread: title || plotline.title,
                  color: m.plotlines.colorNames[candidate]
                })}
                onClick={() => setColor(candidate)}
              />
            ))}
          </div>
        </div>
        <label className="bible-field">
          <span className="bible-field-label">{m.plotlines.descriptionLabel}</span>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder={m.plotlines.descriptionPlaceholder}
            rows={3}
          />
        </label>
        <label className="plotline-hide-from-ai">
          <input type="checkbox" checked={hideFromAi} onChange={(event) => setHideFromAi(event.target.checked)} />
          {m.plotlines.hideFromAiLabel}
        </label>
        <p className="quiet">{m.plotlines.hideFromAiHint}</p>
        <div className="edit-actions">
          <button type="button" className="text-button danger" onClick={onRemove}>
            {format(m.plotlines.removeThread, { title: plotline.title })}
          </button>
          <button type="button" className="text-button" onClick={onClose}>
            {m.common.cancel}
          </button>
          <button
            type="button"
            className="primary"
            onClick={() => onSave({ title, color, description, hideFromAi })}
          >
            {m.common.save}
          </button>
        </div>
      </div>
    </div>
  );
}
