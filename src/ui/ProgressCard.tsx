import React, { useEffect, useState } from "react";
import type { Book, WritingGoal } from "@core/BookSchema";
import { computeGoalPace, manuscriptWordCount } from "@core/writingGoal";
import { count, format, useLocale } from "./i18n";

export function ProgressCard({
  book,
  onSetGoal,
  onClearGoal,
  onClose
}: {
  book: Book;
  onSetGoal: (goal: WritingGoal) => void;
  onClearGoal: () => void;
  onClose: () => void;
}) {
  const { messages: m } = useLocale();
  const goal = book.goal;
  const [editing, setEditing] = useState(!goal);
  const [targetWords, setTargetWords] = useState(goal ? String(goal.targetWords) : "");
  const [deadline, setDeadline] = useState(goal?.deadline.slice(0, 10) ?? "");
  const [daysPerWeek, setDaysPerWeek] = useState(goal ? String(goal.daysPerWeek) : "7");

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const currentWords = manuscriptWordCount(book);
  const pace = goal ? computeGoalPace(book, goal) : null;

  function submitGoal(event: React.FormEvent) {
    event.preventDefault();
    const target = Number(targetWords);
    const days = Number(daysPerWeek);
    if (!Number.isFinite(target) || target <= 0) return;
    if (!deadline) return;
    if (!Number.isFinite(days) || days < 1 || days > 7) return;
    onSetGoal({ targetWords: Math.round(target), deadline, daysPerWeek: Math.round(days) });
    setEditing(false);
  }

  return (
    <div className="edit-overlay" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <div className="edit-card" role="dialog" aria-modal="true" aria-labelledby="progress-title">
        <div className="stats-card-head">
          <p className="chapter-craft-label">{m.progress.title}</p>
          <button type="button" className="text-button" onClick={onClose}>
            {m.common.close}
          </button>
        </div>
        <h2 id="progress-title">{count(currentWords, m.stats.wordsShort)}</h2>

        {pace && !editing ? (
          <div className="progress-pace">
            <p>{format(m.progress.wordsOfTarget, { current: pace.currentWords, target: pace.targetWords })}</p>
            <p className="chapter-craft-label">{format(m.progress.percentComplete, { percent: pace.percent })}</p>
            {pace.remainingWords > 0 ? (
              <p className={pace.isOverdue ? "quiet progress-overdue" : "quiet"}>
                {pace.isOverdue
                  ? format(m.progress.overdue, { remaining: pace.remainingWords })
                  : format(m.progress.dailyPaceNeeded, { perDay: Math.ceil(pace.dailyPaceNeeded) })}
              </p>
            ) : (
              <p className="quiet">{m.progress.targetReached}</p>
            )}
            <div className="edit-actions">
              <button type="button" className="text-button" onClick={() => setEditing(true)}>
                {m.progress.editGoal}
              </button>
              <button type="button" className="text-button danger" onClick={onClearGoal}>
                {m.progress.removeGoal}
              </button>
            </div>
          </div>
        ) : (
          <form className="progress-goal-form" onSubmit={submitGoal}>
            <label className="field-label" htmlFor="progress-target-words">
              {m.progress.targetWordsLabel}
            </label>
            <input
              id="progress-target-words"
              type="number"
              min={1}
              inputMode="numeric"
              value={targetWords}
              onChange={(event) => setTargetWords(event.target.value)}
            />
            <label className="field-label" htmlFor="progress-deadline">
              {m.progress.deadlineLabel}
            </label>
            <input
              id="progress-deadline"
              type="date"
              value={deadline}
              onChange={(event) => setDeadline(event.target.value)}
            />
            <label className="field-label" htmlFor="progress-days-per-week">
              {m.progress.daysPerWeekLabel}
            </label>
            <input
              id="progress-days-per-week"
              type="number"
              min={1}
              max={7}
              inputMode="numeric"
              value={daysPerWeek}
              onChange={(event) => setDaysPerWeek(event.target.value)}
            />
            <div className="edit-actions">
              {goal ? (
                <button type="button" className="text-button" onClick={() => setEditing(false)}>
                  {m.common.cancel}
                </button>
              ) : null}
              <button type="submit" className="primary">
                {m.progress.saveGoal}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
