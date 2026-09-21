import React, { useEffect, useMemo, useState } from "react";
import type { Book, EditorSurface } from "@core/BookSchema";
import {
  defaultFindFlags,
  findHits,
  flagsForRepeatKind,
  listCanvasOccurrences,
  listRepeatPhrases,
  occurrenceOnPage,
  replaceInBook,
  totalHits,
  type FindFlags,
  type FindOccurrence,
  type FindScope,
  type RepeatKind
} from "@core/findReplace";
import { format, useLocale } from "./i18n";

export type FindHighlight = {
  needle: string;
  flags: FindFlags;
  activeStart?: number;
};

export type FindLaunch = {
  needle?: string;
  here?: boolean;
  wholeWord?: boolean;
  quick?: RepeatKind;
};

export function FindReplaceCard({
  book,
  surface,
  chapterId,
  pageText,
  names,
  launch,
  disabled,
  onHighlight,
  onReveal,
  onReplace,
  onClose
}: {
  book: Book;
  surface: EditorSurface;
  chapterId: string | null;
  pageText: string;
  names: string[];
  launch: FindLaunch;
  disabled: boolean;
  onHighlight: (query: FindHighlight | null) => void;
  onReveal: (occurrence: FindOccurrence) => void;
  onReplace: (mutate: (book: Book) => Book) => void;
  onClose: () => void;
}) {
  const { messages: m } = useLocale();
  const [quick, setQuick] = useState<RepeatKind | null>(launch.quick ?? null);
  const [repeats, setRepeats] = useState<string[]>(() =>
    launch.quick ? listRepeatPhrases(pageText, names, launch.quick) : []
  );
  const [needle, setNeedle] = useState(() => {
    if (launch.needle) return launch.needle;
    if (launch.quick) return listRepeatPhrases(pageText, names, launch.quick)[0] ?? "";
    return "";
  });
  const [replacement, setReplacement] = useState("");
  const [flags, setFlags] = useState<FindFlags>(() => {
    if (launch.quick) return flagsForRepeatKind(launch.quick);
    if (launch.wholeWord) return { matchCase: false, wholeWord: true };
    return defaultFindFlags();
  });
  const [wholeManuscript, setWholeManuscript] = useState(() => !(launch.here || launch.quick));
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
    if (!quick) {
      setRepeats([]);
      return;
    }
    setRepeats(listRepeatPhrases(pageText, names, quick));
  }, [names, pageText, quick]);

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

  function applyQuick(kind: RepeatKind) {
    if (quick === kind) {
      setQuick(null);
      return;
    }
    const phrases = listRepeatPhrases(pageText, names, kind);
    setQuick(kind);
    setWholeManuscript(false);
    setFlags(flagsForRepeatKind(kind));
    setRepeats(phrases);
    setNeedle(phrases[0] ?? "");
  }

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
      <div className="find-flags">
        <FlagToggle pressed={quick === "echo"} onToggle={() => applyQuick("echo")} label={m.find.echoes} />
        <FlagToggle pressed={quick === "reuse"} onToggle={() => applyQuick("reuse")} label={m.find.phrases} />
      </div>
      {quick ? (
        repeats.length === 0 ? (
          <p className="quiet">{quick === "echo" ? m.find.noneEcho : m.find.nonePhrases}</p>
        ) : (
          <ul className="find-repeats">
            {repeats.map((phrase) => (
              <li key={phrase}>
                <button
                  type="button"
                  className={phrase === needle ? "text-button is-on" : "text-button"}
                  aria-pressed={phrase === needle}
                  onClick={() => setNeedle(phrase)}
                >
                  {clip(phrase, 48)}
                </button>
              </li>
            ))}
          </ul>
        )
      ) : null}
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

function clip(text: string, max: number): string {
  const trimmed = text.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max).trim()}…`;
}
