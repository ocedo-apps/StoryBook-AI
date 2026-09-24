import React, { useEffect } from "react";
import type { Book } from "@core/BookSchema";
import {
  PROOFREAD_STAGES,
  flagStale,
  proofreadPercent,
  proseChapters,
  type ProofreadFlag,
  type ProofreadJob,
  type ProofreadStage
} from "@core/proofread";
import { format, useLocale } from "./i18n";

export function ProofreadCard({
  book,
  job,
  running,
  onClose,
  onStop,
  onContinue,
  onRunAgain,
  onOpenChapter
}: {
  book: Book;
  job: ProofreadJob;
  running: boolean;
  onClose: () => void;
  onStop: () => void;
  onContinue: () => void;
  onRunAgain: () => void;
  onOpenChapter: (chapterId: string) => void;
}) {
  const { messages: m } = useLocale();
  const viewed = flagStale(job, book);
  const chapters = proseChapters(book);
  const percent = proofreadPercent(viewed, chapters.length);
  const live = running || viewed.status === "running";
  const paused = viewed.status === "paused";
  const failed = viewed.status === "error";
  const done = viewed.status === "done";

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      if (live) return;
      onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [live, onClose]);

  const groups = PROOFREAD_STAGES.map((stage) => ({
    stage,
    rows: viewed.flags.filter((flag) => flag.stage === stage)
  })).filter((group) => group.rows.length > 0);

  return (
    <div
      className="edit-overlay"
      role="presentation"
      onMouseDown={(event) => {
        if (live) return;
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="edit-card stats-card proofread-card" role="dialog" aria-modal="true" aria-labelledby="proofread-title">
        <div className="stats-card-head">
          <p className="chapter-craft-label">{m.proofread.action}</p>
          {live ? (
            <button type="button" className="text-button" onClick={onStop}>
              {m.common.stop}
            </button>
          ) : (
            <button type="button" className="text-button" onClick={onClose}>
              {m.common.close}
            </button>
          )}
        </div>
        <h2 id="proofread-title">{live || paused || failed ? m.proofread.runningTitle : m.proofread.resultsTitle}</h2>
        <p className="quiet">{m.proofread.lede}</p>
        {paused ? <p className="quiet">{m.proofread.paused}</p> : null}
        {failed ? <p className="quiet">{m.proofread.error}</p> : null}

        {!done ? (
          <>
            <ol className="proofread-stages">
              {PROOFREAD_STAGES.map((stage) => (
                <li key={stage} className={stageClass(viewed, stage)}>
                  <span className="proofread-mark" aria-hidden="true">
                    {stageMark(viewed, stage)}
                  </span>
                  <span>{stageLine(viewed, stage, chapters.length, m)}</span>
                </li>
              ))}
            </ol>
            <div className="proofread-bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}>
              <span style={{ width: `${percent}%` }} />
            </div>
            <p className="quiet">{format(m.proofread.percent, { n: percent })}</p>
            {viewed.detail ? <p className="quiet">{format(m.proofread.now, { detail: nowDetail(viewed.detail, m) })}</p> : null}
          </>
        ) : null}

        {viewed.ageReport ? (
          <div className="stats-sentence">
            <p className="chapter-craft-label">{m.proofread.age}</p>
            <p className="quiet">{viewed.ageReport}</p>
          </div>
        ) : null}

        {viewed.craftNotes.length > 0 ? (
          <div className="stats-long stats-packed">
            <p className="chapter-craft-label">{m.proofread.craft}</p>
            <ul>
              {viewed.craftNotes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {groups.length === 0 && done ? <p className="quiet">{m.proofread.emptyResults}</p> : null}
        {groups.length > 0 ? <p className="quiet stats-spark-hint">{m.proofread.clickHint}</p> : null}

        {groups.map((group) => (
          <div key={group.stage} className="stats-long stats-packed">
            <p className="chapter-craft-label">{m.proofread[group.stage]}</p>
            <ul>
              {group.rows.map((flag) => (
                <li key={flag.id}>
                  <button type="button" className="stats-long-pick" onClick={() => onOpenChapter(flag.chapterId)}>
                    {flagLabel(flag, book, m)}
                    {flag.stale ? ` · ${m.proofread.stale}` : ""}
                  </button>
                  {flag.quote ? <p className="quiet">{clip(flag.quote, 140)}</p> : null}
                  {flag.quoteB ? <p className="quiet">{clip(flag.quoteB, 140)}</p> : null}
                  <p className="quiet">{flag.observation}</p>
                  {flag.suggestion ? (
                    <p className="quiet">
                      {m.proofread.suggestion}: {flag.suggestion}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="edit-actions">
          {paused || failed ? (
            <button type="button" className="primary" onClick={onContinue}>
              {m.proofread.continue}
            </button>
          ) : null}
          {done ? (
            <button type="button" className="primary" onClick={onRunAgain}>
              {m.proofread.runAgain}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function stageClass(job: ProofreadJob, stage: ProofreadStage): string {
  if (stageDone(job, stage)) return "is-done";
  if (job.stage === stage) return "is-current";
  return "is-wait";
}

function stageMark(job: ProofreadJob, stage: ProofreadStage): string {
  if (stageDone(job, stage)) return "✓";
  if (job.stage === stage) return "▶";
  return "";
}

function stageDone(job: ProofreadJob, stage: ProofreadStage): boolean {
  if (job.status === "done") return true;
  const order = { grammar: 0, scenes: 1, style: 2, age: 3, facts: 4, done: 5 };
  return order[job.stage] > order[stage];
}

function stageLine(
  job: ProofreadJob,
  stage: ProofreadStage,
  chapterCount: number,
  m: ReturnType<typeof useLocale>["messages"]
): string {
  if (stage === "grammar") {
    return format(m.proofread.grammarProgress, { done: job.grammarDone.length, total: Math.max(1, chapterCount) });
  }
  if (stage === "scenes") {
    return format(m.proofread.scenesProgress, { done: job.scenePairsDone, total: job.scenePairsTotal });
  }
  if (stage === "style") return m.proofread.styleProgress;
  if (stage === "facts") {
    return format(m.proofread.factsProgress, { done: job.factsDone.length, total: Math.max(1, chapterCount) });
  }
  return m.proofread.ageProgress;
}

function nowDetail(detail: string, m: ReturnType<typeof useLocale>["messages"]): string {
  const grammar = /^grammar:(\d+)$/.exec(detail);
  if (grammar) return format(m.proofread.nowGrammar, { n: grammar[1] ?? "" });
  const scenes = /^scenes:(\d+):(\d+)$/.exec(detail);
  if (scenes) return format(m.proofread.nowScenes, { a: scenes[1] ?? "", b: scenes[2] ?? "" });
  const facts = /^facts:(\d+)$/.exec(detail);
  if (facts) return format(m.proofread.nowFacts, { n: facts[1] ?? "" });
  if (detail === "style") return m.proofread.nowStyle;
  if (detail === "age") return m.proofread.nowAge;
  return detail;
}

function flagLabel(flag: ProofreadFlag, book: Book, m: ReturnType<typeof useLocale>["messages"]): string {
  const left = book.chapters.find((chapter) => chapter.id === flag.chapterId);
  const a = (left?.sequence_index ?? 0) + 1;
  if (!flag.chapterIdB) return format(m.proofread.chapter, { n: a });
  const right = book.chapters.find((chapter) => chapter.id === flag.chapterIdB);
  const b = (right?.sequence_index ?? 0) + 1;
  return format(m.proofread.chapters, { a, b });
}

function clip(text: string, max: number): string {
  const trimmed = text.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max).trim()}…`;
}
