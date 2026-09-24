import type { TimelineEntry } from "@core/timeline";
import { format, useLocale } from "./i18n";

export function TimelinePanel({
  entries,
  onSetStoryTime,
  onMove,
  onJumpToChapter
}: {
  entries: TimelineEntry[];
  onSetStoryTime: (chapterId: string, text: string) => void;
  onMove: (chapterId: string, direction: "up" | "down") => void;
  onJumpToChapter: (chapterId: string) => void;
}) {
  const { messages: m } = useLocale();

  return (
    <main className="manuscript timeline-panel">
      <h1 className="chapter-title">{m.timeline.title}</h1>
      <p className="synopsis-lede">{m.timeline.lede}</p>
      <ol className="timeline-list">
        {entries.map((entry, index) => (
          <li key={entry.chapterId} className={entry.outOfOrder ? "timeline-row is-out-of-order" : "timeline-row"}>
            <div className="timeline-row-head">
              <button type="button" className="bible-mention-jump timeline-title" onClick={() => onJumpToChapter(entry.chapterId)}>
                {entry.chapterTitle}
              </button>
              <span className="timeline-position">{format(m.timeline.readingPosition, { n: entry.sequenceIndex + 1 })}</span>
              {entry.outOfOrder ? <span className="timeline-flag">{m.timeline.outOfOrder}</span> : null}
            </div>
            <input
              type="text"
              className="timeline-story-time"
              value={entry.storyTime}
              placeholder={m.timeline.storyTimePlaceholder}
              onChange={(event) => onSetStoryTime(entry.chapterId, event.target.value)}
              aria-label={format(m.timeline.storyTimeLabel, { chapter: entry.chapterTitle })}
            />
            <div className="timeline-move">
              <button
                type="button"
                className="text-button"
                onClick={() => onMove(entry.chapterId, "up")}
                disabled={index === 0}
                aria-label={m.timeline.moveEarlier}
              >
                ↑
              </button>
              <button
                type="button"
                className="text-button"
                onClick={() => onMove(entry.chapterId, "down")}
                disabled={index === entries.length - 1}
                aria-label={m.timeline.moveLater}
              >
                ↓
              </button>
            </div>
          </li>
        ))}
      </ol>
    </main>
  );
}
