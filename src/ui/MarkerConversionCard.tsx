import { useState } from "react";
import { DEFAULT_MARKER_CONVERSION_RULES, type MarkerConversionRule } from "@core/markerConversion";
import { FORMATTING_STYLES, type ProseFormattingStyle } from "@core/proseFormatting";
import type { Book } from "@core/BookSchema";
import { count, format, useLocale } from "./i18n";

/**
 * "Convert markers to formatting", as its own top-bar tool rather than a
 * Settings section — same reasoning as Import lore: a one-off migration
 * aid for text pasted in from elsewhere, useful regardless of which page
 * of the book you're currently on.
 */
export function MarkerConversionCard({
  book,
  onPatch,
  onConvertMarkers,
  onClose
}: {
  book: Book;
  onPatch: (mutate: (book: Book) => Book) => void;
  onConvertMarkers: (rules: MarkerConversionRule[]) => Promise<{ totalConversions: number; chaptersChanged: number }>;
  onClose: () => void;
}) {
  const { messages: m } = useLocale();
  const markerRules = book.marker_conversion_rules ?? DEFAULT_MARKER_CONVERSION_RULES;
  const setMarkerRules = (updater: (rules: MarkerConversionRule[]) => MarkerConversionRule[]) => {
    onPatch((current) => ({
      ...current,
      marker_conversion_rules: updater(current.marker_conversion_rules ?? DEFAULT_MARKER_CONVERSION_RULES)
    }));
  };
  const [converting, setConverting] = useState(false);
  const [convertResult, setConvertResult] = useState<{ totalConversions: number; chaptersChanged: number } | null>(null);

  return (
    <div
      className="edit-overlay"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="edit-card" role="dialog" aria-modal="true" aria-labelledby="marker-convert-title">
        <div className="bible-card-head">
          <h2 id="marker-convert-title">{m.markerConvert.heading}</h2>
          <div className="bible-card-head-actions">
            <button type="button" className="text-button" onClick={onClose}>
              {m.bible.close}
            </button>
          </div>
        </div>
        <p className="quiet">{m.markerConvert.intro}</p>
        <div className="marker-convert-rules">
          {markerRules.map((rule, index) => (
            <div className="marker-convert-rule" key={index}>
              <input
                value={rule.open}
                onChange={(event) => {
                  const open = event.target.value;
                  setMarkerRules((rules) => rules.map((item, i) => (i === index ? { ...item, open } : item)));
                }}
                placeholder={m.markerConvert.openPlaceholder}
                aria-label={m.markerConvert.openLabel}
              />
              <input
                value={rule.close}
                onChange={(event) => {
                  const close = event.target.value;
                  setMarkerRules((rules) => rules.map((item, i) => (i === index ? { ...item, close } : item)));
                }}
                placeholder={m.markerConvert.closePlaceholder}
                aria-label={m.markerConvert.closeLabel}
              />
              <span className="quiet">{m.markerConvert.becomes}</span>
              <select
                value={rule.style}
                onChange={(event) => {
                  const style = event.target.value as ProseFormattingStyle;
                  setMarkerRules((rules) => rules.map((item, i) => (i === index ? { ...item, style } : item)));
                }}
                aria-label={m.markerConvert.styleLabel}
              >
                {FORMATTING_STYLES.map((style) => (
                  <option key={style} value={style}>
                    {m.canvas[style]}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="text-button"
                onClick={() => setMarkerRules((rules) => rules.filter((_, i) => i !== index))}
              >
                {m.markerConvert.removeRule}
              </button>
            </div>
          ))}
        </div>
        <div className="edit-actions">
          <button
            type="button"
            className="text-button"
            onClick={() => setMarkerRules((rules) => [...rules, { open: "", close: "", style: "italic" }])}
          >
            {m.markerConvert.addRule}
          </button>
          <button
            type="button"
            className="primary"
            disabled={converting || markerRules.every((rule) => rule.open.trim() === "" || rule.close.trim() === "")}
            onClick={() => {
              setConverting(true);
              setConvertResult(null);
              void onConvertMarkers(markerRules).then((result) => {
                setConvertResult(result);
                setConverting(false);
              });
            }}
          >
            {converting ? m.markerConvert.converting : m.markerConvert.convertAction}
          </button>
        </div>
        {convertResult ? (
          <p className="quiet">
            {convertResult.chaptersChanged === 0
              ? m.markerConvert.resultNone
              : format(m.markerConvert.resultSummary, {
                  markers: count(convertResult.totalConversions, m.markerConvert.markersCount),
                  chapters: count(convertResult.chaptersChanged, m.markerConvert.chaptersCount)
                })}
          </p>
        ) : null}
      </div>
    </div>
  );
}
