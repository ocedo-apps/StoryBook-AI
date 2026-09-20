import React, { useEffect, useMemo, useState } from "react";
import type { Book, EditorSurface } from "@core/BookSchema";
import {
  defaultFindFlags,
  findHits,
  listCanvasOccurrences,
  occurrenceOnPage,
  replaceInBook,
  totalHits,
  type FindFlags,
  type FindOccurrence,
  type FindScope
} from "@core/findReplace";
import { format, useLocale } from "./i18n";

export type FindHighlight = {
  needle: string;
  flags: FindFlags;
  activeStart?: number;
};

export function FindReplaceCard({
  book,
  surface,
  chapterId,
  initialFind,
  disabled,
  onHighlight,
  onReveal,
  onReplace,
  onClose
}: {
  book: Book;
  surface: EditorSurface;
  chapterId: string | null;
  initialFind: string;
  disabled: boolean;
  onHighlight: (query: FindHighlight | null) => void;
  onReveal: (occurrence: FindOccurrence) => void;
  onReplace: (mutate: (book: Book) => Book) => void;
  onClose: () => void;
}) {
  const { messages: m } = useLocale();
  const [needle, setNeedle] = useState(initialFind);
  const [replacement, setReplacement] = useState("");
  const [flags, setFlags] = useState<FindFlags>(defaultFindFlags);
  const [wholeManuscript, setWholeManuscript] = useState(true);
  const [includeBrainstorm, setIncludeBrainstorm] = useState(false);
  const [active, setActive] = useState(0);

  const scope = useMemo<FindScope>(() => {
    if (wholeManuscript) return { surface: "manuscript", includeBrainstorm };
    if (surface === "chapter") {
      return { surface: "chapter", ...(chapterId ? { chapterId } : {}), includeBrainstorm: false };
    }
    return { surface, includeBrainstorm: false };
  }, [chapterId, includeBrainstorm, surface, wholeManuscript]);

  const hits = useMemo(() => findHits(book, needle, flags, scope), [book, flags, needle, scope]);
  const total = totalHits(hits);
  const occurrences = useMemo(
    () => listCanvasOccurrences(book, needle, flags, scope),
    [book, flags, needle, scope]
  );

  useEffect(() => {
    const onPage = occurrences.findIndex((item) => occurrenceOnPage(item, surface, chapterId));
    setActive(onPage >= 0 ? onPage : 0);
  }, [flags, includeBrainstorm, needle, wholeManuscript]);

  useEffect(() => {
    const current = occurrences[active];
    if (!needle.trim() || occurrences.length === 0) {
      onHighlight(needle.trim() ? { needle, flags } : null);
      return;
    }
    const highlight: FindHighlight = { needle, flags };
    if (current && occurrenceOnPage(current, surface, chapterId)) highlight.activeStart = current.start;
    onHighlight(highlight);
  }, [active, chapterId, flags, needle, occurrences, onHighlight, surface]);

  useEffect(() => {
    const field = document.getElementById("find-needle");
    if (field instanceof HTMLInputElement) {
      field.focus();
      field.select();
    }
  }, []);

  useEffect(() => {
    return () => onHighlight(null);
  }, [onHighlight]);

  function applyReplace() {
    if (!needle.trim() || total === 0 || disabled) return;
    onReplace((current) => replaceInBook(current, needle, replacement, flags, scope));
  }

  function step(delta: number) {
    if (occurrences.length === 0) return;
    const next = (active + delta + occurrences.length) % occurrences.length;
    setActive(next);
    const occurrence = occurrences[next];
    if (occurrence) onReveal(occurrence);
  }

  return (
    <form
      id="find-panel"
      className="edit-card backup-card find-popover"
      action="#"
      onSubmit={(event) => {
        event.preventDefault();
        applyReplace();
      }}
      aria-labelledby="find-title"
    >
      <h2 id="find-title">{m.find.title}</h2>
      <p className="quiet">{m.find.body}</p>
      <label className="field-label" htmlFor="find-needle">
        {m.find.find}
      </label>
      <div className="find-needle-row">
        <input
          id="find-needle"
          type="text"
          value={needle}
          onChange={(event) => setNeedle(event.target.value)}
          onKeyDown={(event) => {
            if (event.key !== "Enter") return;
            event.preventDefault();
            step(event.shiftKey ? -1 : 1);
          }}
          autoComplete="off"
          spellCheck={false}
        />
        <div className="find-stepper">
          <button type="button" className="text-button" onClick={() => step(-1)} disabled={occurrences.length === 0} aria-label={m.find.prev}>
            ↑
          </button>
          <button type="button" className="text-button" onClick={() => step(1)} disabled={occurrences.length === 0} aria-label={m.find.next}>
            ↓
          </button>
        </div>
      </div>
      {needle.trim() ? (
        <p className="quiet">
          {occurrences.length === 0
            ? m.find.none
            : format(m.find.position, { current: Math.min(active + 1, occurrences.length), total: occurrences.length })}
        </p>
      ) : null}
      <label className="field-label" htmlFor="find-replacement">
        {m.find.replaceWith}
      </label>
      <input
        id="find-replacement"
        type="text"
        value={replacement}
        onChange={(event) => setReplacement(event.target.value)}
        autoComplete="off"
        spellCheck={false}
      />
      <div className="find-flags">
        <FlagToggle
          pressed={flags.matchCase}
          onToggle={() => setFlags((current) => ({ ...current, matchCase: !current.matchCase }))}
          label={m.find.matchCase}
        />
        <FlagToggle
          pressed={flags.wholeWord}
          onToggle={() => setFlags((current) => ({ ...current, wholeWord: !current.wholeWord }))}
          label={m.find.wholeWord}
        />
        <FlagToggle
          pressed={!wholeManuscript}
          onToggle={() => setWholeManuscript((current) => !current)}
          label={m.find.here}
        />
        {wholeManuscript ? (
          <FlagToggle
            pressed={includeBrainstorm}
            onToggle={() => setIncludeBrainstorm((current) => !current)}
            label={m.find.includeBrainstorm}
          />
        ) : null}
      </div>
      <div className="edit-actions">
        <button type="button" className="text-button" onClick={onClose}>
          {m.common.close}
        </button>
        <button type="submit" className="primary" disabled={!needle.trim() || total === 0 || disabled}>
          {total > 0 ? format(m.find.replaceCount, { count: total }) : m.find.replace}
        </button>
      </div>
    </form>
  );
}

function FlagToggle({
  pressed,
  onToggle,
  label
}: {
  pressed: boolean;
  onToggle: () => void;
  label: string;
}) {
  return (
    <button type="button" className={pressed ? "text-button is-on" : "text-button"} aria-pressed={pressed} onClick={onToggle}>
      {label}
    </button>
  );
}
