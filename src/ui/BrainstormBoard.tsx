import React, { useEffect, useRef, useState } from "react";
import type { Book } from "@core/BookSchema";
import {
  addBrainstormNote,
  applyBrainstormNoteTexts,
  boardNotes,
  bringBrainstormNoteForward,
  ensureBrainstormNotes,
  nextNotePosition,
  NOTE_COLORS,
  parseNoteColor,
  removeBrainstormNote,
  sendNotes,
  stageBrainstormNote,
  unstageBrainstormNote,
  updateBrainstormNote,
  type BrainstormNote
} from "@core/brainstormNotes";
import { ChapterBriefCopy } from "./ChapterBriefCopy";
import { useLocale } from "./i18n";

const NOTE_WIDTH = 248;
const DRAG_THRESHOLD = 6;

type Drag = {
  id: string;
  from: "board" | "send";
  x: number;
  y: number;
  clientX: number;
  clientY: number;
  offsetX: number;
  offsetY: number;
  width: number;
  height: number;
  overSend: boolean;
  sendIndex: number;
  text: string;
};

function sendInsertIndex(list: HTMLElement, clientY: number, excludeId: string): number {
  const cards = Array.from(list.querySelectorAll<HTMLElement>("[data-send-id]")).filter(
    (node) =>
      !node.classList.contains("is-slot") &&
      !node.classList.contains("is-lifted") &&
      node.dataset.sendId !== excludeId
  );
  for (let i = 0; i < cards.length; i += 1) {
    const rect = cards[i]?.getBoundingClientRect();
    if (rect && clientY < rect.top + rect.height / 2) return i;
  }
  return cards.length;
}

function overRect(rect: DOMRect | undefined, clientX: number, clientY: number): boolean {
  if (!rect) return false;
  return clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom;
}

function liveNoteText(note: BrainstormNote): string {
  const nodes = [...document.querySelectorAll<HTMLElement>(`[id="idea-note-${note.id}"]`)];
  const visible = nodes.find((node) => {
    const card = node.closest("article");
    return Boolean(card) && !card.classList.contains("is-slot") && !card.classList.contains("is-ghost");
  });
  const pick = visible ?? nodes[0];
  return pick ? (pick.innerText ?? "") : note.text;
}

export function BrainstormBoard({
  book,
  busy,
  footActions,
  extraActions,
  children,
  onPatch,
  onSend
}: {
  book: Book;
  busy: boolean;
  footActions?: React.ReactNode;
  extraActions?: React.ReactNode;
  children?: React.ReactNode;
  onPatch: (mutate: (book: Book) => Book) => void;
  onSend: () => void;
}) {
  const { messages: m } = useLocale();
  const boardRef = useRef<HTMLDivElement>(null);
  const sendRef = useRef<HTMLElement>(null);
  const sendListRef = useRef<HTMLDivElement>(null);
  const didDrag = useRef(false);
  const noteCount = useRef(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [drag, setDrag] = useState<Drag | null>(null);
  const notes = ensureBrainstormNotes(book).brainstorm_notes;

  function leaveNote() {
    const active = document.activeElement;
    if (active instanceof HTMLElement && active.closest(".idea-note")) active.blur();
    setSelectedId(null);
  }

  useEffect(() => {
    if (notes.length > noteCount.current) {
      const last = notes[notes.length - 1];
      if (last) setSelectedId(last.id);
    }
    noteCount.current = notes.length;
  }, [notes]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      if (document.querySelector(".edit-overlay")) return;
      const active = document.activeElement;
      const inNote = active instanceof HTMLElement && Boolean(active.closest(".idea-note"));
      if (!inNote && !selectedId) return;
      leaveNote();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedId]);

  function boardPoint(event: { clientX: number; clientY: number }): { x: number; y: number } {
    const board = boardRef.current;
    if (!board) return { x: 24, y: 24 };
    const rect = board.getBoundingClientRect();
    return {
      x: Math.max(8, event.clientX - rect.left + board.scrollLeft),
      y: Math.max(8, event.clientY - rect.top + board.scrollTop)
    };
  }

  function startDrag(event: React.PointerEvent, note: BrainstormNote, from: "board" | "send") {
    if (event.button !== 0) return;
    const capturedText = liveNoteText(note);
    event.preventDefault();
    event.stopPropagation();
    didDrag.current = false;
    onPatch((current) =>
      bringBrainstormNoteForward(applyBrainstormNoteTexts(current, [[note.id, capturedText]]), note.id)
    );
    setSelectedId(note.id);
    const origin = boardPoint(event);
    const grabX = origin.x - note.x;
    const grabY = origin.y - note.y;
    const card = (event.currentTarget as HTMLElement).closest("article");
    const rect = card?.getBoundingClientRect();
    const queued = sendNotes(notes);
    const fromSendIndex = queued.findIndex((item) => item.id === note.id);
    let live: Drag = {
      id: note.id,
      from,
      x: note.x,
      y: note.y,
      clientX: event.clientX,
      clientY: event.clientY,
      offsetX: rect ? event.clientX - rect.left : 24,
      offsetY: rect ? event.clientY - rect.top : 12,
      width: rect?.width ?? NOTE_WIDTH,
      height: rect?.height ?? 160,
      overSend: from === "send",
      sendIndex: fromSendIndex >= 0 ? fromSendIndex : queued.length,
      text: capturedText
    };
    const pointerId = event.pointerId;
    const handle = event.currentTarget as HTMLElement;

    function hitSend(moveEvent: PointerEvent): { overSend: boolean; sendIndex: number } {
      const overSend = overRect(sendRef.current?.getBoundingClientRect(), moveEvent.clientX, moveEvent.clientY);
      const list = sendListRef.current;
      const sendIndex = overSend && list ? sendInsertIndex(list, moveEvent.clientY, note.id) : live.sendIndex;
      return { overSend, sendIndex };
    }

    function onMove(moveEvent: PointerEvent) {
      if (moveEvent.pointerId !== pointerId) return;
      const point = boardPoint(moveEvent);
      const nextPoint = { x: Math.max(8, point.x - grabX), y: Math.max(8, point.y - grabY) };
      if (!didDrag.current && Math.hypot(nextPoint.x - note.x, nextPoint.y - note.y) < DRAG_THRESHOLD) {
        const dx = moveEvent.clientX - event.clientX;
        const dy = moveEvent.clientY - event.clientY;
        if (Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
      }
      didDrag.current = true;
      const hit = hitSend(moveEvent);
      live = {
        ...live,
        x: hit.overSend && from === "board" ? live.x : nextPoint.x,
        y: hit.overSend && from === "board" ? live.y : nextPoint.y,
        clientX: moveEvent.clientX,
        clientY: moveEvent.clientY,
        overSend: hit.overSend,
        sendIndex: hit.sendIndex
      };
      setDrag(live);
    }

    function onUp(upEvent: PointerEvent) {
      if (upEvent.pointerId !== pointerId) return;
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      try {
        handle.releasePointerCapture(pointerId);
      } catch {
        /* synthetic events */
      }
      if (didDrag.current) {
        const hit = hitSend(upEvent);
        const withText = (current: Book) => applyBrainstormNoteTexts(current, [[note.id, capturedText]]);
        if (hit.overSend) {
          onPatch((current) => stageBrainstormNote(withText(current), note.id, hit.sendIndex));
        } else if (from === "send") {
          const drop = boardPoint({
            clientX: upEvent.clientX - live.offsetX,
            clientY: upEvent.clientY - live.offsetY
          });
          onPatch((current) => unstageBrainstormNote(withText(current), note.id, drop.x, drop.y));
        } else {
          onPatch((current) => updateBrainstormNote(withText(current), note.id, { x: live.x, y: live.y }));
        }
        window.setTimeout(() => {
          didDrag.current = false;
        }, 0);
      }
      setDrag(null);
    }

    try {
      handle.setPointerCapture(pointerId);
    } catch {
      /* synthetic events */
    }
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
  }

  function addAt(x: number, y: number) {
    onPatch((current) => {
      const next = addBrainstormNote(current, { text: "", x, y });
      const created = next.brainstorm_notes[next.brainstorm_notes.length - 1];
      if (created) setSelectedId(created.id);
      return next;
    });
  }

  const free = boardNotes(notes).map((note) =>
    drag && drag.id === note.id && drag.from === "board" && !drag.overSend
      ? { ...note, x: drag.x, y: drag.y }
      : note
  );
  const queued = sendNotes(notes);
  const dragged = notes.find((note) => note.id === drag?.id);
  const displaySend: BrainstormNote[] = (() => {
    if (!drag || !dragged) return queued;
    const rest = queued.filter((note) => note.id !== drag.id);
    if (drag.overSend) {
      const next = [...rest];
      next.splice(Math.max(0, Math.min(drag.sendIndex, next.length)), 0, dragged);
      return next;
    }
    if (drag.from === "send") return rest;
    return queued;
  })();
  const spaceWidth = Math.max(640, ...free.map((note) => note.x + NOTE_WIDTH + 48));
  const spaceHeight = Math.max(480, ...free.map((note) => note.y + 220));
  const selected = notes.find((note) => note.id === selectedId);
  const canSend = queued.some((note) => note.text.trim() || liveNoteText(note).trim());
  const showClone = Boolean(drag && dragged && (drag.overSend || drag.from === "send"));

  function onCanvasPointerDown(event: React.PointerEvent) {
    if (event.button !== 0 || event.target !== event.currentTarget) return;
    const start = boardPoint(event);
    const deselect = Boolean(selectedId);
    if (deselect) leaveNote();
    const pointerId = event.pointerId;
    function onUp(upEvent: PointerEvent) {
      if (upEvent.pointerId !== pointerId) return;
      window.removeEventListener("pointerup", onUp);
      if (didDrag.current) {
        didDrag.current = false;
        return;
      }
      const end = boardPoint(upEvent);
      if (Math.hypot(end.x - start.x, end.y - start.y) > DRAG_THRESHOLD) return;
      if (deselect) return;
      addAt(start.x, start.y);
    }
    window.addEventListener("pointerup", onUp);
  }

  function renderNote(note: BrainstormNote, opts: { send?: boolean; slot?: boolean }) {
    const isSelected = note.id === selected?.id;
    const color = parseNoteColor(note.color);
    const isGhost = drag?.id === note.id && (drag.overSend || drag.from === "send");
    return (
      <article
        key={note.id}
        data-send-id={opts.send ? note.id : undefined}
        className={[
          "idea-note",
          opts.send ? "idea-send-note" : "",
          `is-${color}`,
          isSelected ? "is-active" : "",
          drag?.id === note.id && !opts.slot && drag.from === "board" && !drag.overSend ? "is-dragging" : "",
          isGhost && !opts.slot ? "is-ghost" : "",
          opts.slot ? "is-slot" : ""
        ]
          .filter(Boolean)
          .join(" ")}
        style={opts.send ? undefined : { left: note.x, top: note.y, width: NOTE_WIDTH }}
        onPointerDown={() => {
          if (!opts.send) onPatch((current) => bringBrainstormNoteForward(current, note.id));
          setSelectedId(note.id);
        }}
      >
        <div className="idea-note-head">
          <button
            type="button"
            className="idea-note-handle"
            aria-label={m.editor.reorderNotes}
            onPointerDown={(event) => startDrag(event, note, opts.send ? "send" : "board")}
          />
          <button
            type="button"
            className="icon-button idea-note-remove"
            aria-label={m.editor.removeNote}
            onClick={(event) => {
              event.stopPropagation();
              if (note.text.trim() && !window.confirm(m.editor.removeNoteConfirm)) return;
              onPatch((current) => removeBrainstormNote(current, note.id));
              if (selectedId === note.id) setSelectedId(null);
            }}
          >
            ×
          </button>
        </div>
        <div className="idea-note-tints" role="group" aria-label={m.editor.noteColor}>
          {NOTE_COLORS.map((tint) => (
            <button
              key={tint}
              type="button"
              className={["idea-note-tint", `is-${tint}`, color === tint ? "is-on" : ""]
                .filter(Boolean)
                .join(" ")}
              aria-label={m.editor.noteColors[tint]}
              aria-pressed={color === tint}
              onClick={(event) => {
                event.stopPropagation();
                if (color === tint) return;
                onPatch((current) => updateBrainstormNote(current, note.id, { color: tint }));
              }}
            />
          ))}
        </div>
        <ChapterBriefCopy
          id={`idea-note-${note.id}`}
          value={note.text}
          placeholder={m.editor.brainstormPlaceholder}
          label={m.editor.noteLabel}
          className="idea-note-copy"
          onCommit={(text) => onPatch((current) => updateBrainstormNote(current, note.id, { text }))}
        />
      </article>
    );
  }

  return (
    <main className="manuscript manuscript-board">
      <h1 className="chapter-title">{m.editor.brainstorm}</h1>
      <p className="synopsis-lede">{m.editor.brainstormLede}</p>
      <div className={drag ? "idea-workspace is-reordering" : "idea-workspace"}>
        <div ref={boardRef} className={drag ? "idea-board is-reordering" : "idea-board"}>
          <div
            className="idea-board-space"
            style={{ width: spaceWidth, height: spaceHeight }}
            onPointerDown={onCanvasPointerDown}
          >
            {free.map((note) => renderNote(note, {}))}
          </div>
        </div>
        <aside
          ref={sendRef}
          className={["idea-send", drag?.overSend ? "is-drop" : ""].filter(Boolean).join(" ")}
          aria-label={m.editor.sendLane}
        >
          <div className="idea-send-head">
            <h2>{m.editor.sendLane}</h2>
            <p className="quiet">{m.editor.sendLaneLede}</p>
          </div>
          <div ref={sendListRef} className="idea-send-list">
            {displaySend.length === 0 ? (
              <p className={drag?.overSend ? "idea-send-empty is-slot" : "idea-send-empty"}>
                {m.editor.sendLaneEmpty}
              </p>
            ) : (
              displaySend.map((note) =>
                renderNote(note, {
                  send: true,
                  slot: Boolean(drag?.overSend && drag.id === note.id)
                })
              )
            )}
          </div>
          <div className="idea-send-foot">
            <button
              type="button"
              className="primary"
              disabled={busy || !canSend}
              onClick={() => {
                onPatch((current) =>
                  applyBrainstormNoteTexts(
                    current,
                    current.brainstorm_notes.map((note) => [note.id, liveNoteText(note)] as const)
                  )
                );
                onSend();
              }}
            >
              {m.editor.sendToSynopsis}
            </button>
          </div>
        </aside>
      </div>
      <footer className="manuscript-foot">
        {footActions}
        <div className="actions">
          <button
            type="button"
            onClick={() => {
              const pos = nextNotePosition(free);
              addAt(pos.x, pos.y);
            }}
            disabled={busy}
          >
            {m.editor.addNote}
          </button>
          {extraActions}
        </div>
      </footer>
      {showClone && drag && dragged ? (
        <article
          className={["idea-note", "is-lifted", `is-${parseNoteColor(dragged.color)}`].join(" ")}
          style={{
            width: drag.width,
            height: drag.height,
            transform: `translate(${drag.clientX - drag.offsetX}px, ${drag.clientY - drag.offsetY}px) rotate(2deg) scale(1.03)`
          }}
          aria-hidden="true"
        >
          <div className="idea-note-head">
            <span className="idea-note-handle" />
          </div>
          <p className="chapter-brief-text idea-note-copy">
            {(drag.text.trim() || dragged.text.trim()) || " "}
          </p>
        </article>
      ) : null}
      {children}
    </main>
  );
}
