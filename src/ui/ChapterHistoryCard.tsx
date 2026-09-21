import React, { useEffect, useMemo, useRef, useState } from "react";
import type { ProseHistoryOp, ProseRevision } from "@core/BookSchema";
import { LIVE_HISTORY_ID, defaultCompareId, diffProse, type ProseDiffHunk } from "@core/proseDiff";
import { useLocale } from "./i18n";

export function ChapterHistoryCard({
  revisions,
  liveProse,
  onRestore,
  onClose
}: {
  revisions: ProseRevision[];
  liveProse: string;
  onRestore: (revisionId: string) => void;
  onClose: () => void;
}) {
  const { locale, messages: m } = useLocale();
  const [selected, setSelected] = useState<string | null>(revisions[0]?.id ?? LIVE_HISTORY_ID);
  const [comparing, setComparing] = useState(false);
  const [compareId, setCompareId] = useState<string | null>(null);

  const revisionIds = useMemo(() => revisions.map((row) => row.id), [revisions]);
  const current = selected === LIVE_HISTORY_ID ? null : (revisions.find((row) => row.id === selected) ?? null);
  const selectedProse = selected === LIVE_HISTORY_ID ? liveProse : (current?.prose ?? "");
  const otherId = comparing ? compareId : null;
  const otherProse = otherId ? proseFor(otherId, liveProse, revisions) : "";
  const hunks = comparing && otherId && selected ? diffProse(otherProse, selectedProse) : [];
  const same = comparing && otherId !== null && otherProse === selectedProse;

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function pick(id: string) {
    if (comparing) {
      if (id !== selected) setCompareId(id);
      return;
    }
    setSelected(id);
    setCompareId(null);
  }

  function toggleCompare() {
    if (comparing) {
      setComparing(false);
      return;
    }
    const id = selected ?? LIVE_HISTORY_ID;
    const other = defaultCompareId(id, revisionIds);
    if (!other) return;
    setComparing(true);
    setCompareId(other);
  }

  const selectedLabel = selected ? rowLabel(selected, revisions, locale, m.history.live, m.history.ops) : "";
  const otherLabel =
    otherId !== null ? rowLabel(otherId, revisions, locale, m.history.live, m.history.ops) : "";

  return (
    <div
      className="edit-overlay"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="edit-card stats-card history-card" role="dialog" aria-modal="true" aria-labelledby="history-title">
        <div className="stats-card-head">
          <p className="chapter-craft-label">{m.history.kicker}</p>
          <button type="button" className="text-button" onClick={onClose}>
            {m.common.close}
          </button>
        </div>
        <h2 id="history-title">{revisions.length > 0 ? m.history.title : m.history.emptyTitle}</h2>
        <p className="quiet">{m.history.intro}</p>

        {selected ? (
          <div className="stats-sentence">
            {comparing && otherId ? (
              <>
                {same ? <p className="quiet">{m.history.same}</p> : null}
                <HistorySplit
                  hunks={hunks}
                  empty={m.history.emptyProse}
                  fromLabel={otherLabel}
                  toLabel={selectedLabel}
                  fromKey={m.history.fromOnly}
                  toKey={m.history.toOnly}
                />
              </>
            ) : (
              <>
                <p className="chapter-craft-label">{selectedLabel}</p>
                <blockquote className="history-preview">
                  {selectedProse.trim() ? selectedProse : m.history.emptyProse}
                </blockquote>
              </>
            )}
            <div className="history-actions">
              <button
                type="button"
                className="primary"
                disabled={selected === LIVE_HISTORY_ID || selectedProse === liveProse}
                onClick={() => {
                  if (selected && selected !== LIVE_HISTORY_ID) onRestore(selected);
                }}
              >
                {m.history.restore}
              </button>
              <button
                type="button"
                className={comparing ? "text-button is-on" : "text-button"}
                aria-pressed={comparing}
                disabled={revisions.length === 0}
                onClick={toggleCompare}
              >
                {m.history.compare}
              </button>
            </div>
            {comparing ? <p className="quiet stats-spark-hint">{m.history.compareHint}</p> : null}
          </div>
        ) : revisions.length > 0 ? (
          <p className="quiet stats-spark-hint">{m.history.clickHint}</p>
        ) : (
          <p className="quiet">{m.history.empty}</p>
        )}

        <div className="stats-long stats-packed">
          <ul>
            <li className={rowClass(LIVE_HISTORY_ID, selected, otherId)}>
              <button type="button" className="stats-long-pick" onClick={() => pick(LIVE_HISTORY_ID)}>
                <span className="history-row-meta">{m.history.live}</span>
                {clip(liveProse, 120) || m.history.emptyProse}
              </button>
            </li>
            {revisions.map((row) => (
              <li key={row.id} className={rowClass(row.id, selected, otherId)}>
                <button type="button" className="stats-long-pick" onClick={() => pick(row.id)}>
                  <span className="history-row-meta">
                    {opLabel(row.op, m.history.ops)} · {formatWhen(row.at, locale)}
                  </span>
                  {clip(row.prose, 120) || m.history.emptyProse}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <p className="quiet stats-foot">{m.history.foot}</p>
      </div>
    </div>
  );
}

function HistorySplit({
  hunks,
  empty,
  fromLabel,
  toLabel,
  fromKey,
  toKey
}: {
  hunks: ProseDiffHunk[];
  empty: string;
  fromLabel: string;
  toLabel: string;
  fromKey: string;
  toKey: string;
}) {
  const leftRef = useRef<HTMLQuoteElement>(null);
  const rightRef = useRef<HTMLQuoteElement>(null);
  const syncing = useRef(false);

  useEffect(() => {
    if (leftRef.current) leftRef.current.scrollTop = 0;
    if (rightRef.current) rightRef.current.scrollTop = 0;
  }, [hunks]);

  function follow(source: HTMLElement, target: HTMLQuoteElement | null) {
    if (!target || syncing.current) return;
    syncing.current = true;
    target.scrollTop = source.scrollTop;
    requestAnimationFrame(() => {
      syncing.current = false;
    });
  }

  return (
    <div className="history-split">
      <div>
        <p className="chapter-craft-label">{fromLabel}</p>
        <p className="quiet history-col-key">
          <del aria-hidden="true">Aa</del> {fromKey}
        </p>
        <blockquote
          ref={leftRef}
          className="history-preview history-diff"
          onScroll={(event) => follow(event.currentTarget, rightRef.current)}
        >
          <DiffHunks hunks={hunks} side="from" empty={empty} />
        </blockquote>
      </div>
      <div>
        <p className="chapter-craft-label">{toLabel}</p>
        <p className="quiet history-col-key">
          <ins aria-hidden="true">Aa</ins> {toKey}
        </p>
        <blockquote
          ref={rightRef}
          className="history-preview history-diff"
          onScroll={(event) => follow(event.currentTarget, leftRef.current)}
        >
          <DiffHunks hunks={hunks} side="to" empty={empty} />
        </blockquote>
      </div>
    </div>
  );
}

function DiffHunks({
  hunks,
  side,
  empty
}: {
  hunks: ProseDiffHunk[];
  side: "from" | "to";
  empty: string;
}) {
  if (hunks.length === 0) return <>{empty}</>;
  return (
    <>
      {hunks.map((hunk, index) => {
        if (hunk.type === "eq") return <span key={index}>{hunk.text}</span>;
        const mine = side === "from" ? hunk.type === "del" : hunk.type === "ins";
        if (hunk.type === "del") {
          return mine ? (
            <del key={index}>{hunk.text}</del>
          ) : (
            <del key={index} className="history-diff-gap" aria-hidden="true">
              {hunk.text}
            </del>
          );
        }
        return mine ? (
          <ins key={index}>{hunk.text}</ins>
        ) : (
          <ins key={index} className="history-diff-gap" aria-hidden="true">
            {hunk.text}
          </ins>
        );
      })}
    </>
  );
}

function proseFor(id: string, liveProse: string, revisions: ProseRevision[]): string {
  if (id === LIVE_HISTORY_ID) return liveProse;
  return revisions.find((row) => row.id === id)?.prose ?? "";
}

function rowLabel(
  id: string,
  revisions: ProseRevision[],
  locale: string,
  liveLabel: string,
  ops: Record<ProseHistoryOp, string>
): string {
  if (id === LIVE_HISTORY_ID) return liveLabel;
  const row = revisions.find((item) => item.id === id);
  if (!row) return liveLabel;
  return `${opLabel(row.op, ops)} · ${formatWhen(row.at, locale)}`;
}

function rowClass(id: string, selected: string | null, otherId: string | null): string | undefined {
  if (selected === id) return "is-selected";
  if (otherId === id) return "is-compare";
  return undefined;
}

function opLabel(op: ProseHistoryOp, labels: Record<ProseHistoryOp, string>): string {
  return labels[op];
}

function formatWhen(iso: string, locale: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  const tag = locale === "sv" ? "sv-SE" : locale === "nb" ? "nb-NO" : "en-GB";
  return date.toLocaleString(tag, { dateStyle: "short", timeStyle: "medium" });
}

function clip(text: string, max: number): string {
  const collapsed = text.replace(/\s+/g, " ").trim();
  if (collapsed.length <= max) return collapsed;
  return `${collapsed.slice(0, max - 1).trimEnd()}…`;
}
