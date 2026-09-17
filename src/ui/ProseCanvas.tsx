import React, { useEffect, useMemo, useRef, useState } from "react";
import { applyReplace, isNonEmptySpan, selectedText, type TextSpan } from "@core/textSpan";
import { htmlFromProse, splitFlowParagraphs } from "@core/proseFlow";
import { matchWordCase, swapContext } from "@core/wordAlternatives";
import { findRareHits, rareHitAt } from "@core/rareWords";
import {
  isCaretAtEnd,
  offsetFromPoint,
  placeCaretAtEnd,
  proseFromElement,
  spanFromSelection
} from "./proseDom";

type RewriteMenu = { kind: "rewrite"; x: number; y: number; span: TextSpan };
type AltsMenu = {
  kind: "alts";
  x: number;
  y: number;
  span: TextSpan;
  word: string;
  sentence: string;
  before: string;
  after: string;
  status: "loading" | "ready" | "error";
  options: string[];
};
type MenuState = RewriteMenu | AltsMenu;
type InstructState = { span: TextSpan; marked: string; instruction: string };

export function ProseCanvas({
  value,
  onChange,
  placeholder,
  disabled,
  highlightRare = false,
  names = [],
  onExtend,
  onElaborate,
  onInstruct,
  onLift,
  onSuggestAlternatives,
  instructTitle = "Rewrite",
  instructHint = "Tell the model how to change the marked passage. Only that span is replaced.",
  instructPlaceholder = "Shorter. More tension. In Emma’s voice. Cut the metaphor.",
  instructAction = "Rewrite"
}: {
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  disabled?: boolean;
  highlightRare?: boolean;
  names?: string[];
  onExtend: (span: TextSpan) => void;
  onElaborate: (span: TextSpan) => void;
  onInstruct: (span: TextSpan, instruction: string) => void;
  onLift?: (span: TextSpan) => void;
  onSuggestAlternatives?: (args: {
    word: string;
    sentence: string;
    before?: string;
    after?: string;
    signal: AbortSignal;
  }) => Promise<string[]>;
  instructTitle?: string;
  instructHint?: string;
  instructPlaceholder?: string;
  instructAction?: string;
}) {
  const areaRef = useRef<HTMLDivElement>(null);
  const rareRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menu, setMenu] = useState<MenuState | null>(null);
  const [manual, setManual] = useState<{ span: TextSpan; draft: string } | null>(null);
  const [instruct, setInstruct] = useState<InstructState | null>(null);

  useEffect(() => {
    if (!menu) return;
    function onPointer(event: MouseEvent) {
      if (menuRef.current?.contains(event.target as Node)) return;
      setMenu(null);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setMenu(null);
    }
    window.addEventListener("mousedown", onPointer);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onPointer);
      window.removeEventListener("keydown", onKey);
    };
  }, [menu]);

  function spanFromArea(): TextSpan | null {
    const area = areaRef.current;
    if (!area) return null;
    const span = spanFromSelection(area);
    return span && isNonEmptySpan(value, span) ? span : null;
  }

  function placeMenu(event: React.MouseEvent, extraHeight: number, extraWidth = 0): { x: number; y: number } {
    const pad = 12;
    const width = (onLift ? 200 : 188) + extraWidth;
    const height = extraHeight;
    return {
      x: Math.min(event.clientX, window.innerWidth - width - pad),
      y: Math.min(event.clientY, window.innerHeight - height - pad)
    };
  }

  function onContextMenu(event: React.MouseEvent<HTMLDivElement>) {
    if (disabled) return;
    const area = areaRef.current;
    if (!area) return;

    if (highlightRare && onSuggestAlternatives) {
      const offset = offsetFromPoint(area, event.clientX, event.clientY);
      const hit = rareHitAt(value, offset, names);
      if (hit) {
        event.preventDefault();
        const at = placeMenu(event, 260, 24);
        const ctx = swapContext(value, hit.start, hit.end);
        setMenu({
          kind: "alts",
          ...at,
          span: { start: hit.start, end: hit.end },
          word: hit.word,
          sentence: ctx.sentence,
          before: ctx.before,
          after: ctx.after,
          status: "loading",
          options: []
        });
        return;
      }
    }

    const span = spanFromArea();
    if (!span) return;
    event.preventDefault();
    const at = placeMenu(event, onLift ? 210 : 168);
    setMenu({ kind: "rewrite", ...at, span });
  }

  const suggestRef = useRef(onSuggestAlternatives);
  suggestRef.current = onSuggestAlternatives;

  useEffect(() => {
    if (!menu || menu.kind !== "alts" || menu.status !== "loading") return;
    const suggest = suggestRef.current;
    if (!suggest) return;
    const abort = new AbortController();
    const { word, sentence, before, after } = menu;
    void suggest({
      word,
      sentence,
      ...(before ? { before } : {}),
      ...(after ? { after } : {}),
      signal: abort.signal
    })
      .then((options) => {
        setMenu((current) =>
          current?.kind === "alts" && current.status === "loading"
            ? { ...current, status: options.length > 0 ? "ready" : "error", options }
            : current
        );
      })
      .catch((err: unknown) => {
        if ((err as { name?: string }).name === "AbortError") return;
        setMenu((current) =>
          current?.kind === "alts" && current.status === "loading" ? { ...current, status: "error", options: [] } : current
        );
      });
    return () => abort.abort();
  }, [menu]);

  function run(kind: "extend" | "elaborate" | "instruct" | "manual" | "lift") {
    if (!menu || menu.kind !== "rewrite") return;
    const span = menu.span;
    setMenu(null);
    if (kind === "manual") {
      setManual({ span, draft: selectedText(value, span) });
      return;
    }
    if (kind === "instruct") {
      setInstruct({ span, marked: selectedText(value, span), instruction: "" });
      return;
    }
    if (kind === "lift") {
      onLift?.(span);
      return;
    }
    if (kind === "extend") onExtend(span);
    else onElaborate(span);
  }

  function applyAlternative(next: string) {
    if (!menu || menu.kind !== "alts") return;
    onChange(applyReplace(value, menu.span, matchWordCase(menu.word, next)));
    setMenu(null);
  }

  function applyManual(event: React.FormEvent) {
    event.preventDefault();
    if (!manual) return;
    onChange(applyReplace(value, manual.span, manual.draft));
    setManual(null);
  }

  function applyInstruct(event: React.FormEvent) {
    event.preventDefault();
    if (!instruct || !instruct.instruction.trim()) return;
    const next = instruct;
    setInstruct(null);
    onInstruct(next.span, next.instruction.trim());
  }

  function syncRareScroll() {
    const area = areaRef.current;
    const rare = rareRef.current;
    if (!area || !rare) return;
    rare.scrollTop = area.scrollTop;
    rare.scrollLeft = area.scrollLeft;
  }

  useEffect(() => {
    syncRareScroll();
  }, [highlightRare, value]);

  useEffect(() => {
    const area = areaRef.current;
    if (!area) return;
    const current = proseFromElement(area);
    const empty = !value.trim();
    if (!empty && current === value) return;
    if (empty && current === "") {
      if (area.innerHTML !== "<p><br></p>") area.innerHTML = "<p><br></p>";
      return;
    }
    const focused = document.activeElement === area;
    const atEnd = focused && isCaretAtEnd(area);
    area.innerHTML = htmlFromProse(value);
    if (focused && atEnd) placeCaretAtEnd(area);
  }, [value]);

  function emitProse() {
    const area = areaRef.current;
    if (!area) return;
    onChange(proseFromElement(area));
  }

  return (
    <div className={highlightRare ? "prose-wrap is-rare" : "prose-wrap"}>
      {highlightRare ? (
        <div ref={rareRef} className="prose-rare" aria-hidden="true">
          <ProseMarkup text={value} names={names} />
        </div>
      ) : null}
      <div
        ref={areaRef}
        className="prose"
        contentEditable={!disabled}
        role="textbox"
        aria-multiline="true"
        aria-placeholder={placeholder}
        data-placeholder={placeholder ?? ""}
        data-empty={value.trim() ? "false" : "true"}
        suppressContentEditableWarning
        spellCheck
        onInput={emitProse}
        onScroll={syncRareScroll}
        onContextMenu={onContextMenu}
        onKeyDown={(event) => {
          if (event.key !== "Enter" || event.shiftKey) return;
          event.preventDefault();
          document.execCommand("insertParagraph");
        }}
        onPaste={(event) => {
          event.preventDefault();
          const pasted = event.clipboardData.getData("text/plain");
          document.execCommand("insertText", false, pasted);
        }}
      />
      {menu?.kind === "rewrite" ? (
        <div
          ref={menuRef}
          className="selection-menu"
          style={{ left: menu.x, top: menu.y }}
          role="menu"
        >
          <button type="button" role="menuitem" onClick={() => run("extend")}>
            Extend
          </button>
          <button type="button" role="menuitem" onClick={() => run("elaborate")}>
            Elaborate
          </button>
          <button type="button" role="menuitem" onClick={() => run("instruct")}>
            {instructAction}…
          </button>
          {onLift ? (
            <button type="button" role="menuitem" onClick={() => run("lift")}>
              Lift to synopsis
            </button>
          ) : null}
          <button type="button" role="menuitem" onClick={() => run("manual")}>
            Manual Edit
          </button>
        </div>
      ) : null}
      {menu?.kind === "alts" ? (
        <div
          ref={menuRef}
          className="selection-menu alts-menu"
          style={{ left: menu.x, top: menu.y }}
          role="menu"
        >
          <p className="selection-menu-label">Instead of “{menu.word}”</p>
          {menu.status === "loading" ? <p className="quiet">Looking…</p> : null}
          {menu.status === "error" ? (
            <>
              <p className="quiet">No alternatives this time.</p>
              <button
                type="button"
                role="menuitem"
                onClick={() => setMenu({ ...menu, status: "loading", options: [] })}
              >
                Retry
              </button>
            </>
          ) : null}
          {menu.options.map((option) => (
            <button type="button" role="menuitem" key={option} onClick={() => applyAlternative(option)}>
              {option}
            </button>
          ))}
        </div>
      ) : null}
      {manual ? (
        <div
          className="edit-overlay"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setManual(null);
          }}
        >
          <form className="edit-card" action="#" onSubmit={applyManual} aria-labelledby="manual-edit-title">
            <h2 id="manual-edit-title">Manual Edit</h2>
            <p className="quiet">Rewrite only the marked passage. The rest of the text stays put.</p>
            <textarea
              value={manual.draft}
              onChange={(event) => setManual({ ...manual, draft: event.target.value })}
              rows={8}
              autoFocus
            />
            <div className="edit-actions">
              <button type="button" className="text-button" onClick={() => setManual(null)}>
                Cancel
              </button>
              <button type="submit" className="primary">
                Apply
              </button>
            </div>
          </form>
        </div>
      ) : null}
      {instruct ? (
        <div
          className="edit-overlay"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setInstruct(null);
          }}
        >
          <form className="edit-card" action="#" onSubmit={applyInstruct} aria-labelledby="rewrite-title">
            <h2 id="rewrite-title">{instructTitle}</h2>
            <p className="quiet">{instructHint}</p>
            <blockquote className="marked-passage">{instruct.marked}</blockquote>
            <textarea
              value={instruct.instruction}
              onChange={(event) => setInstruct({ ...instruct, instruction: event.target.value })}
              placeholder={instructPlaceholder}
              rows={4}
              autoFocus
              required
            />
            <div className="edit-actions">
              <button type="button" className="text-button" onClick={() => setInstruct(null)}>
                Cancel
              </button>
              <button type="submit" className="primary" disabled={!instruct.instruction.trim()}>
                {instructAction}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}

function ProseMarkup({ text, names }: { text: string; names: string[] }) {
  const paras = splitFlowParagraphs(text);
  if (paras.length === 0) return <p><br /></p>;
  return (
    <>
      {paras.map((block, index) => (
        <p key={index}>
          <RareMarkup text={block} names={names} />
        </p>
      ))}
    </>
  );
}

function RareMarkup({ text, names }: { text: string; names: string[] }) {
  const hits = useMemo(() => findRareHits(text, names), [names, text]);
  if (hits.length === 0) return <>{text}</>;
  const parts: React.ReactNode[] = [];
  let cursor = 0;
  for (const hit of hits) {
    if (hit.start > cursor) parts.push(text.slice(cursor, hit.start));
    parts.push(<mark key={hit.start}>{text.slice(hit.start, hit.end)}</mark>);
    cursor = hit.end;
  }
  if (cursor < text.length) parts.push(text.slice(cursor));
  return <>{parts}</>;
}
