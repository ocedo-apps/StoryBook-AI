import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { CONTINUES_NONE, moveChapter } from "@core/continuesFrom";
import { updateChapter, type Book, type Chapter } from "@core/BookSchema";
import { ChapterBriefCopy } from "./ChapterBriefCopy";
import { format, useLocale, type Messages } from "./i18n";

const DRAG_THRESHOLD = 8;

function continuesCue(chapters: Chapter[], chapter: Chapter, m: Messages): string {
  if (!chapter.continues_from) return "";
  if (chapter.continues_from === CONTINUES_NONE) return m.editor.newStrand;
  const from = chapters.find((item) => item.id === chapter.continues_from);
  if (!from || from.sequence_index >= chapter.sequence_index) return "";
  return `← ${from.sequence_index + 1}`;
}

function previewMove<T>(items: readonly T[], fromIndex: number, toIndex: number): T[] {
  if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) return [...items];
  const next = [...items];
  const [moved] = next.splice(fromIndex, 1);
  if (!moved) return [...items];
  next.splice(Math.max(0, Math.min(toIndex, next.length)), 0, moved);
  return next;
}

function cardRects(board: HTMLElement): Map<string, DOMRect> {
  const map = new Map<string, DOMRect>();
  for (const card of Array.from(board.querySelectorAll<HTMLElement>("[data-brief-id]"))) {
    const id = card.dataset.briefId;
    if (id) map.set(id, card.getBoundingClientRect());
  }
  return map;
}

function flipCards(board: HTMLElement, previous: Map<string, DOMRect>) {
  for (const card of Array.from(board.querySelectorAll<HTMLElement>("[data-brief-id]"))) {
    const id = card.dataset.briefId;
    if (!id || card.classList.contains("is-lifted")) continue;
    const prev = previous.get(id);
    if (!prev) continue;
    const next = card.getBoundingClientRect();
    const dx = prev.left - next.left;
    const dy = prev.top - next.top;
    if (dx === 0 && dy === 0) continue;
    card.style.transition = "none";
    card.style.transform = `translate(${dx}px, ${dy}px)`;
    requestAnimationFrame(() => {
      card.style.transition = "transform 0.2s ease";
      card.style.transform = "";
    });
  }
}

function dropIndexAtPoint(
  board: HTMLElement,
  chapters: Chapter[],
  fromIndex: number,
  dragId: string,
  currentToIndex: number,
  clientX: number,
  clientY: number
): number {
  const others = chapters.filter((chapter) => chapter.id !== dragId);
  for (const node of Array.from(board.querySelectorAll<HTMLElement>("[data-brief-id]"))) {
    if (node.classList.contains("is-lifted")) continue;
    const id = node.dataset.briefId;
    if (!id) continue;
    const rect = node.getBoundingClientRect();
    if (clientX < rect.left || clientX > rect.right || clientY < rect.top || clientY > rect.bottom) continue;
    if (id === dragId) return currentToIndex;
    const overOthers = others.findIndex((chapter) => chapter.id === id);
    if (overOthers < 0) return currentToIndex;
    const after = clientX > rect.left + rect.width / 2;
    return after ? overOthers + 1 : overOthers;
  }
  const slots = Array.from(board.querySelectorAll<HTMLElement>("[data-brief-id]")).filter(
    (node) => !node.classList.contains("is-lifted")
  );
  const last = slots[slots.length - 1];
  if (!last) return currentToIndex;
  const rect = last.getBoundingClientRect();
  if (clientY > rect.bottom || (clientY >= rect.top && clientX > rect.right)) return others.length;
  return currentToIndex;
}

type Lift = {
  id: string;
  fromIndex: number;
  toIndex: number;
  offsetX: number;
  offsetY: number;
  width: number;
  height: number;
  x: number;
  y: number;
};

export function DispositionBoard({
  book,
  chapters,
  chapterId,
  footActions,
  onSelect,
  onOpen,
  onMoved,
  onPatch
}: {
  book: Book;
  chapters: Chapter[];
  chapterId: string | null;
  footActions?: React.ReactNode;
  onSelect: (id: string) => void;
  onOpen: (id: string) => void;
  onMoved: (cleared: { title: string; fromTitle: string }[]) => void;
  onPatch: (mutate: (book: Book) => Book) => void;
}) {
  const { messages: m } = useLocale();
  const boardRef = useRef<HTMLDivElement>(null);
  const liftElRef = useRef<HTMLElement>(null);
  const liftRef = useRef<Lift | null>(null);
  const previousRects = useRef<Map<string, DOMRect>>(new Map());
  const didDrag = useRef(false);
  const [lift, setLift] = useState<Lift | null>(null);
  const canReorder = chapters.length > 1;
  liftRef.current = lift;

  const display = lift ? previewMove(chapters, lift.fromIndex, lift.toIndex) : chapters;
  const selected = chapters.find((item) => item.id === chapterId) ?? chapters[0];
  const liftedChapter = lift ? chapters.find((item) => item.id === lift.id) : undefined;

  function applyMove(chapterIdToMove: string, toIndex: number) {
    const { book: next, cleared } = moveChapter(book, chapterIdToMove, toIndex);
    if (next === book) return;
    onPatch((current) => moveChapter(current, chapterIdToMove, toIndex).book);
    onMoved(cleared);
  }

  useLayoutEffect(() => {
    const board = boardRef.current;
    if (!board || previousRects.current.size === 0) return;
    flipCards(board, previousRects.current);
    previousRects.current = new Map();
  }, [lift, chapters]);

  useEffect(() => {
    if (!lift) return;
    const pointerIds = new Set<number>();

    function onMove(event: PointerEvent) {
      const current = liftRef.current;
      if (!current) return;
      pointerIds.add(event.pointerId);
      const node = liftElRef.current;
      if (node) {
        current.x = event.clientX - current.offsetX;
        current.y = event.clientY - current.offsetY;
        node.style.transform = `translate(${current.x}px, ${current.y}px) rotate(2deg) scale(1.03)`;
      }
      event.preventDefault();
      const board = boardRef.current;
      if (!board) return;
      const nextIndex = dropIndexAtPoint(
        board,
        chapters,
        current.fromIndex,
        current.id,
        current.toIndex,
        event.clientX,
        event.clientY
      );
      if (nextIndex === current.toIndex) return;
      previousRects.current = cardRects(board);
      setLift({ ...current, toIndex: nextIndex });
    }

    function onUp(event: PointerEvent) {
      const current = liftRef.current;
      if (!current) return;
      if (pointerIds.size > 0 && !pointerIds.has(event.pointerId)) return;
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      const board = boardRef.current;
      if (board) previousRects.current = cardRects(board);
      liftRef.current = null;
      if (current.toIndex !== current.fromIndex) applyMove(current.id, current.toIndex);
      setLift(null);
    }

    window.addEventListener("pointermove", onMove, { passive: false });
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [lift?.id, chapters, book]);

  function startLift(event: React.PointerEvent, item: Chapter, index: number) {
    if (!canReorder || event.button !== 0) return;
    const target = event.target as HTMLElement;
    if (target.isContentEditable || target.closest("[contenteditable]")) return;
    const card = event.currentTarget as HTMLElement;
    const rect = card.getBoundingClientRect();
    const pending = {
      id: item.id,
      fromIndex: index,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
      width: rect.width,
      height: rect.height
    };

    function onMove(moveEvent: PointerEvent) {
      if (moveEvent.pointerId !== pending.pointerId) return;
      const dx = moveEvent.clientX - pending.startX;
      const dy = moveEvent.clientY - pending.startY;
      if (Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onCancel);
      window.removeEventListener("pointercancel", onCancel);
      didDrag.current = true;
      try {
        card.setPointerCapture(pending.pointerId);
      } catch {
        /* synthetic pointer events have no capture */
      }
      const next: Lift = {
        id: pending.id,
        fromIndex: pending.fromIndex,
        toIndex: pending.fromIndex,
        offsetX: pending.offsetX,
        offsetY: pending.offsetY,
        width: pending.width,
        height: pending.height,
        x: moveEvent.clientX - pending.offsetX,
        y: moveEvent.clientY - pending.offsetY
      };
      liftRef.current = next;
      setLift(next);
    }

    function onCancel(cancelEvent: PointerEvent) {
      if (cancelEvent.pointerId !== pending.pointerId) return;
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onCancel);
      window.removeEventListener("pointercancel", onCancel);
    }

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onCancel);
    window.addEventListener("pointercancel", onCancel);
  }

  return (
    <main className="manuscript manuscript-board">
      <h1 className="chapter-title">{m.editor.briefs}</h1>
      <p className="synopsis-lede">{m.editor.briefsLede}</p>
      <div
        ref={boardRef}
        className={lift ? "brief-board is-reordering" : "brief-board"}
        aria-label={m.editor.reorderBriefs}
      >
        {display.map((item) => {
          const continues = continuesCue(chapters, item, m);
          const title = item.title.trim() || m.editor.untitled;
          const isSelected = item.id === (chapterId ?? selected?.id);
          const isSlot = lift?.id === item.id;
          const originalIndex = chapters.findIndex((chapter) => chapter.id === item.id);
          const cardClass = [
            "brief-card",
            isSelected ? "is-active" : "",
            isSlot ? "is-slot" : "",
            canReorder ? "is-movable" : ""
          ]
            .filter(Boolean)
            .join(" ");
          return (
            <article
              key={item.id}
              className={cardClass}
              data-brief-id={item.id}
              onPointerDown={(event) => {
                const target = event.target as HTMLElement;
                if (target.closest(".chapter-brief-text")) return;
                startLift(event, item, originalIndex);
              }}
              onClick={() => {
                if (didDrag.current) {
                  didDrag.current = false;
                  return;
                }
                onSelect(item.id);
              }}
            >
              <div className="brief-card-head">
                <span className="chapter-index">{item.sequence_index + 1}</span>
                <button
                  type="button"
                  className="brief-card-title"
                  onDoubleClick={(event) => {
                    if (didDrag.current) return;
                    event.preventDefault();
                    event.stopPropagation();
                    onOpen(item.id);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      onOpen(item.id);
                      return;
                    }
                    if (!canReorder || (!event.altKey && !event.metaKey)) return;
                    if (
                      event.key !== "ArrowUp" &&
                      event.key !== "ArrowDown" &&
                      event.key !== "ArrowLeft" &&
                      event.key !== "ArrowRight"
                    ) {
                      return;
                    }
                    event.preventDefault();
                    const toIndex =
                      event.key === "ArrowUp" || event.key === "ArrowLeft" ? originalIndex - 1 : originalIndex + 1;
                    if (toIndex < 0 || toIndex >= chapters.length) return;
                    applyMove(item.id, toIndex);
                  }}
                >
                  {title}
                </button>
                {continues ? <span className="chapter-cue">{continues}</span> : null}
              </div>
              <ChapterBriefCopy
                id={`board-brief-${item.id}`}
                value={item.brief}
                placeholder={m.editor.briefPlaceholder}
                label={m.editor.chapterBrief}
                className="brief-card-copy"
                onCommit={(brief) => onPatch((current) => updateChapter(current, item.id, { brief }))}
              />
            </article>
          );
        })}
      </div>
      {lift && liftedChapter ? (
        <article
          ref={liftElRef}
          className="brief-card is-lifted"
          aria-hidden="true"
          style={{
            width: lift.width,
            height: lift.height,
            transform: `translate(${lift.x}px, ${lift.y}px) rotate(2deg) scale(1.03)`
          }}
        >
          <div className="brief-card-head">
            <span className="chapter-index">{liftedChapter.sequence_index + 1}</span>
            <span className="brief-card-title">{liftedChapter.title.trim() || m.editor.untitled}</span>
            {continuesCue(chapters, liftedChapter, m) ? (
              <span className="chapter-cue">{continuesCue(chapters, liftedChapter, m)}</span>
            ) : null}
          </div>
          <p className="chapter-brief-text brief-card-copy">
            {liftedChapter.brief.trim() || m.editor.briefPlaceholder}
          </p>
        </article>
      ) : null}
      <footer className="manuscript-foot">
        {footActions}
        <div className="actions">
          {selected ? (
            <button type="button" className="primary" onClick={() => onOpen(selected.id)}>
              {format(m.editor.openChapter, { title: selected.title.trim() || m.editor.untitled })}
            </button>
          ) : null}
        </div>
      </footer>
    </main>
  );
}
