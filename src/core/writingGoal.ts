import { countWords } from "./proseStats";
import { sortedChapters, type Book, type WritingGoal } from "./BookSchema";

export function manuscriptWordCount(book: Book): number {
  return sortedChapters(book).reduce((sum, chapter) => sum + countWords(chapter.prose), 0);
}

export type GoalPace = {
  currentWords: number;
  targetWords: number;
  remainingWords: number;
  percent: number;
  remainingWritingDays: number;
  dailyPaceNeeded: number;
  isOverdue: boolean;
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Average writing days between now and the deadline, scaled by daysPerWeek/7. Never negative. */
function remainingWritingDays(now: Date, deadline: Date, daysPerWeek: number): number {
  const calendarDays = Math.max(0, (deadline.getTime() - now.getTime()) / MS_PER_DAY);
  return calendarDays * (daysPerWeek / 7);
}

/** Recomputed fresh each call — never stored, so it can't go stale. */
export function computeGoalPace(book: Book, goal: WritingGoal, now = new Date()): GoalPace {
  const currentWords = manuscriptWordCount(book);
  const remainingWords = Math.max(0, goal.targetWords - currentWords);
  const percent = goal.targetWords > 0 ? Math.min(100, Math.round((currentWords / goal.targetWords) * 100)) : 0;
  const deadline = new Date(goal.deadline);
  const days = remainingWritingDays(now, deadline, goal.daysPerWeek);
  const isOverdue = deadline.getTime() < now.getTime() && remainingWords > 0;
  const dailyPaceNeeded = remainingWords === 0 ? 0 : days > 0 ? remainingWords / days : remainingWords;
  return {
    currentWords,
    targetWords: goal.targetWords,
    remainingWords,
    percent,
    remainingWritingDays: days,
    dailyPaceNeeded,
    isOverdue
  };
}
