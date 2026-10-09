import React, { useEffect, useMemo, useRef, useState } from "react";
import { applyReplace, isNonEmptySpan, selectedText, type TextSpan } from "@core/textSpan";
import { htmlFromProse, splitFlowParagraphs } from "@core/proseFlow";
import {
  FORMATTING_STYLES,
  formattingRangesEqual,
  isFullyStyled,
  shiftFormattingRanges,
  type ProseFormattingRange,
  type ProseFormattingStyle
} from "@core/proseFormatting";
import {
  addPlaceholder,
  diffEditRange,
  removePlaceholder,
  shiftPlaceholders,
  updatePlaceholderNote,
  type Placeholder
} from "@core/placeholders";
import { shiftDarlings, type Darling } from "@core/darlings";
import { applyWordSwap, swapContext } from "@core/wordAlternatives";
import { findRareHits, rareHitAt } from "@core/rareWords";
import { findAiTicHits } from "@core/aiTics";
import { findNameHitsInText } from "@core/bibleMentions";
import { findMarksByParagraph, type FindFlags } from "@core/findReplace";
import {
  blockMarkupNeedsSync,
  currentCaretOffset,
  formattingFromElement,
  isCaretAtEnd,
  offsetFromPoint,
  placeCaretAtEnd,
  placeSelectionAtSpan,
  proseFromElement,
  rectAtOffset,
  spanFromSelection
} from "./proseDom";
import { useLocale, format } from "./i18n";
import {
  insertRewriteChip,
  REWRITE_CHIP_IDS,
  rewriteChipLabel,
  rewriteChipPrompt,
  type RewriteChipId
} from "./rewriteChips";

type RewriteMenu = { kind: "rewrite"; x: number; y: number; span: TextSpan };
type CursorMenu = { kind: "cursor-menu"; x: number; y: number; span: TextSpan };
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
type MenuState = RewriteMenu | CursorMenu | AltsMenu;
type InstructState = { span: TextSpan; marked: string; instruction: string };
type BeatState = { span: TextSpan; instruction: string };
type AskState = { span: TextSpan; marked: string; question: string };
type PlaceholderFormState = { at: number; note: string };
type ActivePlaceholderState = { id: string; note: string };

export function ProseCanvas({
  value,
  onChange,
  placeholder,
  disabled,
  highlightRare = false,
  highlightTics = false,
  highlightFacts = false,
  names = [],
  extraSyllables,
  findNeedle,
  findFlags,
  findActiveStart,
  onExtend,
  onElaborate,
  onInstruct,
  onBeat,
  onLift,
  onIllustrate,
  onAskAboutPassage,
  onSuggestAlternatives,
  instructTitle,
  instructHint,
  instructPlaceholder,
  instructAction,
  rewriteWho = "",
  aside,
  nameLinks,
  onJumpToEntity,
  formatting = [],
  onFormatChange,
  onToggleFormat,
  placeholders = [],
  onPlaceholdersChange,
  activePlaceholderId,
  darlings = [],
  onDarlingsChange,
  onCutToDarling,
  dropCapLines = 0,
  bodyFontStack
}: {
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  disabled?: boolean;
  highlightRare?: boolean;
  highlightTics?: boolean;
  highlightFacts?: boolean;
  names?: string[];
  extraSyllables?: number;
  findNeedle?: string;
  findFlags?: FindFlags;
  findActiveStart?: number;
  onExtend: (span: TextSpan) => void;
  onElaborate: (span: TextSpan) => void;
  onInstruct: (span: TextSpan, instruction: string) => void;
  /** Insert one short beat at the cursor — no selection needed. Chapter/scene prose only; omitted for Synopsis and Brainstorm. */
  onBeat?: (span: TextSpan, instruction: string) => void;
  onLift?: (span: TextSpan) => void;
  onIllustrate?: (span: TextSpan) => void;
  /** Free-form critical craft feedback on the marked passage (roadmap-ideas.md #32) — ephemeral, never edits the text. */
  onAskAboutPassage?: (span: TextSpan, question: string) => void;
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
  /** Named viewpoint when the camera needs one. Empty = stay in the camera. */
  rewriteWho?: string;
  aside?: React.ReactNode;
  /** Story Bible entities whose names, when Ctrl/Cmd-clicked in the text, jump to their card. */
  nameLinks?: { entity_ref: string; entity_label: string }[];
  onJumpToEntity?: (entityRef: string) => void;
  /** Bold/Italic/Underline ranges over `value`'s own offsets. Omitted (default `[]`) disables the formatting toolbar entirely — Synopsis has no use for it yet. */
  formatting?: ProseFormattingRange[];
  /** Fires after typing or a manual edit changes what's formatted, so the caller can persist it — the counterpart to `onChange` for formatting. */
  onFormatChange?: (next: ProseFormattingRange[]) => void;
  /** A deliberate Bold/Italic/Underline toggle on the given selection, from the floating format toolbar or a Ctrl+B/I/U shortcut. */
  onToggleFormat?: (span: TextSpan, style: ProseFormattingStyle) => void;
  /** Sticky-note markers at `value`'s own offsets. Omitted (default `[]`) hides the inline marker and the context-menu action entirely — Synopsis and Brainstorm have no use for it. */
  placeholders?: Placeholder[];
  /** Fires whenever the placeholder set changes: typing shifts positions, the context menu adds one, or its own popup edits or resolves one. */
  onPlaceholdersChange?: (next: Placeholder[]) => void;
  /** Set briefly (e.g. from a book-wide placeholders list) to scroll that one marker into view. */
  activePlaceholderId?: string;
  /** Darlings cut from `value`. Only read to keep their positions aligned as `value` changes elsewhere — the panel that lists and restores them lives outside the canvas. */
  darlings?: Darling[];
  /** Fires whenever typing or a manual edit shifts darling positions. */
  onDarlingsChange?: (next: Darling[]) => void;
  /** Cuts the selected span out to the Darlings tray — a history row, unlike an ordinary edit. Omitted hides the "Cut to Darlings" menu action entirely — Synopsis and Brainstorm have no use for it. */
  onCutToDarling?: (span: TextSpan) => void;
  /** Drop-cap ("anfang") height in lines for the opening letter of the first paragraph — 0 (the default) renders plainly. Chapter prose only; Synopsis and Brainstorm never pass this. */
  dropCapLines?: number;
  /** CSS font-family stack for the manuscript's chosen body typeface (Settings → Typography → Font). Omitted keeps the app's own default prose font — Synopsis and Brainstorm never pass this, only chapter prose does. */
  bodyFontStack?: string;
}) {
  const { messages: m } = useLocale();
  const rewriteTitle = instructTitle ?? m.canvas.rewriteTitle;
  const rewriteHint = instructHint ?? m.canvas.rewriteHint;
  const rewritePlaceholder = instructPlaceholder ?? m.canvas.rewritePlaceholder;
  const rewriteAction = instructAction ?? m.canvas.rewriteAction;
  const scrollRef = useRef<HTMLDivElement>(null);
  const areaRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const rareRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const instructFieldRef = useRef<HTMLTextAreaElement>(null);
  const [menu, setMenu] = useState<MenuState | null>(null);
  const [manual, setManual] = useState<{ span: TextSpan; draft: string } | null>(null);
  const [instruct, setInstruct] = useState<InstructState | null>(null);
  const [beat, setBeat] = useState<BeatState | null>(null);
  const [ask, setAsk] = useState<AskState | null>(null);
  const [placeholderForm, setPlaceholderForm] = useState<PlaceholderFormState | null>(null);
  const [activePlaceholder, setActivePlaceholder] = useState<ActivePlaceholderState | null>(null);
  const [placeholderMarks, setPlaceholderMarks] = useState<{ id: string; left: number; top: number }[]>([]);
  const [hoverTip, setHoverTip] = useState<{ x: number; y: number; text: string } | null>(null);
  const [formatBar, setFormatBar] = useState<{ x: number; y: number; span: TextSpan } | null>(null);
  const [pendingSelection, setPendingSelection] = useState<TextSpan | null>(null);
  const [pendingCaretOffset, setPendingCaretOffset] = useState<number | null>(null);
  const formattingEnabled = Boolean(onFormatChange || onToggleFormat);
  const placeholdersEnabled = Boolean(onPlaceholdersChange);
  const darlingsEnabled = Boolean(onDarlingsChange);

  const highlightHits = useMemo(() => {
    if (highlightRare) {
      return findRareHits(value, names, extraSyllables !== undefined ? { extraSyllables } : undefined).map((hit) => ({
        start: hit.start,
        end: hit.end,
        text: m.stats.rareMarkTitle
      }));
    }
    if (highlightTics) {
      return findAiTicHits(value).map((hit) => ({
        start: hit.start,
        end: hit.end,
        text: hit.kind === "dash" ? m.stats.ticDashTitle : m.stats.ticPhraseTitle
      }));
    }
    return [];
  }, [highlightRare, highlightTics, value, names, extraSyllables, m]);

  const nameHits = useMemo(
    () => (nameLinks && nameLinks.length > 0 ? findNameHitsInText(value, nameLinks) : []),
    [nameLinks, value]
  );

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

  function toggleFormat(style: ProseFormattingStyle, span: TextSpan) {
    if (!onToggleFormat) return;
    setPendingSelection(span);
    onToggleFormat(span, style);
  }

  useEffect(() => {
    if (!formattingEnabled) return;
    function onSelectionChange() {
      const area = areaRef.current;
      if (!area) {
        setFormatBar(null);
        return;
      }
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0 || sel.isCollapsed || !sel.anchorNode || !area.contains(sel.anchorNode)) {
        setFormatBar(null);
        return;
      }
      const span = spanFromArea();
      if (!span) {
        setFormatBar(null);
        return;
      }
      const rect = sel.getRangeAt(0).getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) {
        setFormatBar(null);
        return;
      }
      const pad = 8;
      const width = 132;
      const height = 40;
      setFormatBar({
        x: Math.min(Math.max(rect.left + rect.width / 2 - width / 2, pad), window.innerWidth - width - pad),
        y: Math.max(rect.top - height, pad),
        span
      });
    }
    document.addEventListener("selectionchange", onSelectionChange);
    return () => document.removeEventListener("selectionchange", onSelectionChange);
  }, [formattingEnabled, value]);

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
      const hit = rareHitAt(value, offset, names, extraSyllables !== undefined ? { extraSyllables } : undefined);
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
    if (span) {
      event.preventDefault();
      const at = placeMenu(event, (onLift ? 210 : 168) + (onCutToDarling ? 36 : 0));
      setMenu({ kind: "rewrite", ...at, span });
      return;
    }

    if (onBeat || placeholdersEnabled) {
      const offset = offsetFromPoint(area, event.clientX, event.clientY);
      event.preventDefault();
      const extraHeight = onBeat && placeholdersEnabled ? 100 : 60;
      const at = placeMenu(event, extraHeight);
      setMenu({ kind: "cursor-menu", ...at, span: { start: offset, end: offset } });
    }
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

  function run(kind: "extend" | "elaborate" | "instruct" | "manual" | "lift" | "illustrate" | "ask" | "darling") {
    if (!menu || menu.kind !== "rewrite") return;
    const span = menu.span;
    setMenu(null);
    if (kind === "manual") {
      setManual({ span, draft: selectedText(value, span) });
      return;
    }
    if (kind === "darling") {
      onCutToDarling?.(span);
      return;
    }
    if (kind === "instruct") {
      setInstruct({ span, marked: selectedText(value, span), instruction: "" });
      return;
    }
    if (kind === "ask") {
      setAsk({ span, marked: selectedText(value, span), question: "" });
      return;
    }
    if (kind === "lift") {
      onLift?.(span);
      return;
    }
    if (kind === "illustrate") {
      onIllustrate?.(span);
      return;
    }
    if (kind === "extend") onExtend(span);
    else onElaborate(span);
  }

  function applyAlternative(next: string) {
    if (!menu || menu.kind !== "alts") return;
    onChange(applyWordSwap(value, menu.span, menu.word, next));
    setMenu(null);
  }

  function applyManual(event: React.FormEvent) {
    event.preventDefault();
    if (!manual) return;
    onChange(applyReplace(value, manual.span, manual.draft));
    if (formattingEnabled) {
      onFormatChange?.(shiftFormattingRanges(formatting, manual.span.start, manual.span.end, manual.draft.length));
    }
    if (placeholdersEnabled) {
      onPlaceholdersChange?.(shiftPlaceholders(placeholders, manual.span.start, manual.span.end, manual.draft.length));
    }
    if (darlingsEnabled) {
      onDarlingsChange?.(shiftDarlings(darlings, manual.span.start, manual.span.end, manual.draft.length));
    }
    setManual(null);
  }

  function applyChip(id: RewriteChipId) {
    if (!instruct) return;
    const piece = rewriteChipPrompt(m, id, rewriteWho);
    setInstruct({ ...instruct, instruction: insertRewriteChip(instruct.instruction, piece) });
    window.setTimeout(() => instructFieldRef.current?.focus(), 0);
  }

  function applyInstruct(event: React.FormEvent) {
    event.preventDefault();
    if (!instruct || !instruct.instruction.trim()) return;
    const next = instruct;
    setInstruct(null);
    onInstruct(next.span, next.instruction.trim());
  }

  function applyBeat(event: React.FormEvent) {
    event.preventDefault();
    if (!beat || !beat.instruction.trim() || !onBeat) return;
    const next = beat;
    setBeat(null);
    onBeat(next.span, next.instruction.trim());
  }

  function applyAsk(event: React.FormEvent) {
    event.preventDefault();
    if (!ask || !ask.question.trim() || !onAskAboutPassage) return;
    const next = ask;
    setAsk(null);
    onAskAboutPassage(next.span, next.question.trim());
  }

  function applyPlaceholderForm(event: React.FormEvent) {
    event.preventDefault();
    if (!placeholderForm) return;
    const { at, note } = placeholderForm;
    setPlaceholderForm(null);
    onPlaceholdersChange?.(addPlaceholder(placeholders, at, note.trim()));
  }

  function saveActivePlaceholder(event: React.FormEvent) {
    event.preventDefault();
    if (!activePlaceholder) return;
    const { id, note } = activePlaceholder;
    setActivePlaceholder(null);
    onPlaceholdersChange?.(updatePlaceholderNote(placeholders, id, note.trim()));
  }

  function resolveActivePlaceholder() {
    if (!activePlaceholder) return;
    const { id } = activePlaceholder;
    setActivePlaceholder(null);
    onPlaceholdersChange?.(removePlaceholder(placeholders, id));
  }

  useEffect(() => {
    if (!findNeedle?.trim() || findActiveStart === undefined) return;
    const scroller = scrollRef.current;
    const overlay = rareRef.current;
    const mark = overlay?.querySelector("mark.is-current");
    if (!scroller || !(mark instanceof HTMLElement)) return;
    const markRect = mark.getBoundingClientRect();
    const scrollerRect = scroller.getBoundingClientRect();
    scroller.scrollTop += markRect.top - scrollerRect.top - scroller.clientHeight / 3;
  }, [findActiveStart, findNeedle, value]);

  useEffect(() => {
    const area = areaRef.current;
    if (!area) return;
    const current = proseFromElement(area);
    const empty = !value.trim();
    const textChanged = empty ? current !== "" : current !== value;
    const formattingChanged = formattingEnabled && !formattingRangesEqual(formattingFromElement(area), formatting);
    // `textChanged` alone can't see this: `---` reads back the same whether
    // it's a bare <p> or already has its .prose-hr class (same for a
    // >-quote), so typing one by hand would never pick up its markup
    // without this extra check (see blockMarkupNeedsSync's own comment).
    const markupChanged = !empty && blockMarkupNeedsSync(area);
    if (!textChanged && !formattingChanged && !markupChanged) {
      // Nothing to reconcile against `value` — but a brand-new, never-typed-
      // in chapter still needs a real block to type into. Left as a plain
      // empty root, the first keystroke lands as a stray text node outside
      // any <p>/<div>, which proseFromElement's block-walk silently drops
      // once a later Enter adds a real sibling block next to it.
      if (empty && area.innerHTML !== "<p><br></p>") area.innerHTML = "<p><br></p>";
      return;
    }
    if (empty && current === "") {
      if (area.innerHTML !== "<p><br></p>") area.innerHTML = "<p><br></p>";
      return;
    }
    const focused = document.activeElement === area;
    const atEnd = focused && isCaretAtEnd(area);
    area.innerHTML = htmlFromProse(value, formatting);
    if (pendingSelection) {
      placeSelectionAtSpan(area, pendingSelection);
      setPendingSelection(null);
    } else if (pendingCaretOffset !== null) {
      // A markup-sync rebuild isn't always at the end of the text (an HR
      // typed in the middle of the manuscript, say) — restore the caret to
      // where it actually was, same idea as pendingSelection above but for
      // a collapsed caret instead of a selection range.
      placeSelectionAtSpan(area, { start: pendingCaretOffset, end: pendingCaretOffset });
      setPendingCaretOffset(null);
    } else if (focused && atEnd) {
      placeCaretAtEnd(area);
    }
  }, [value, formatting, formattingEnabled, pendingSelection, pendingCaretOffset]);

  useEffect(() => {
    if (!placeholdersEnabled || placeholders.length === 0) {
      if (placeholderMarks.length > 0) setPlaceholderMarks([]);
      return;
    }
    function recompute() {
      const area = areaRef.current;
      const body = bodyRef.current;
      if (!area || !body) return;
      const bodyRect = body.getBoundingClientRect();
      const next = placeholders
        .map((item) => {
          const rect = rectAtOffset(area, item.at);
          if (!rect) return null;
          return { id: item.id, left: rect.left - bodyRect.left, top: rect.top - bodyRect.top };
        })
        .filter((item): item is { id: string; left: number; top: number } => item !== null);
      setPlaceholderMarks(next);
    }
    recompute();
    window.addEventListener("resize", recompute);
    return () => window.removeEventListener("resize", recompute);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, placeholders, placeholdersEnabled]);

  useEffect(() => {
    if (!activePlaceholderId) return;
    const scroller = scrollRef.current;
    const marker = areaRef.current?.parentElement?.querySelector(`[data-placeholder-id="${activePlaceholderId}"]`);
    if (!scroller || !(marker instanceof HTMLElement)) return;
    const markerRect = marker.getBoundingClientRect();
    const scrollerRect = scroller.getBoundingClientRect();
    scroller.scrollTop += markerRect.top - scrollerRect.top - scroller.clientHeight / 3;
  }, [activePlaceholderId, placeholderMarks]);

  function emitProse() {
    const area = areaRef.current;
    if (!area) return;
    const next = proseFromElement(area);
    if (blockMarkupNeedsSync(area)) setPendingCaretOffset(currentCaretOffset(area));
    onChange(next);
    if (formattingEnabled) onFormatChange?.(formattingFromElement(area));
    if ((placeholdersEnabled || darlingsEnabled) && next !== value) {
      const { editStart, editEnd, insertedLength } = diffEditRange(value, next);
      if (placeholdersEnabled && placeholders.length > 0) {
        onPlaceholdersChange?.(shiftPlaceholders(placeholders, editStart, editEnd, insertedLength));
      }
      if (darlingsEnabled && darlings.length > 0) {
        onDarlingsChange?.(shiftDarlings(darlings, editStart, editEnd, insertedLength));
      }
    }
  }

  const findOn = Boolean(findNeedle?.trim());
  const overlayOn = findOn || highlightRare || highlightTics || highlightFacts;
  const overlayModeClass = highlightRare ? "is-rare" : highlightTics ? "is-tics" : highlightFacts ? "is-facts" : "";

  return (
    <div
      ref={scrollRef}
      className={overlayOn ? ["prose-wrap", overlayModeClass, findOn ? "is-find" : ""].filter(Boolean).join(" ") : "prose-wrap"}
    >
      {aside}
      <div className="prose-body" ref={bodyRef}>
      {overlayOn ? (
        <div ref={rareRef} className="prose-rare" aria-hidden="true">
          <ProseMarkup
            text={value}
            names={names}
            highlightTics={highlightTics}
            highlightFacts={highlightFacts}
            nameLinks={nameLinks ?? []}
            {...(extraSyllables !== undefined ? { extraSyllables } : {})}
            {...(findOn && findNeedle && findFlags
              ? {
                  findNeedle,
                  findFlags,
                  ...(findActiveStart !== undefined ? { findActiveStart } : {})
                }
              : {})}
          />
        </div>
      ) : null}
      <div
        ref={areaRef}
        className={dropCapLines > 0 ? "prose has-drop-cap" : "prose"}
        style={
          {
            ...(dropCapLines > 0 ? { "--drop-cap-lines": dropCapLines } : {}),
            ...(bodyFontStack ? { fontFamily: bodyFontStack } : {})
          } as React.CSSProperties
        }
        contentEditable={!disabled}
        role="textbox"
        aria-multiline="true"
        aria-placeholder={placeholder}
        data-placeholder={placeholder ?? ""}
        data-empty={value.trim() ? "false" : "true"}
        suppressContentEditableWarning
        spellCheck
        onInput={emitProse}
        onContextMenu={onContextMenu}
        onMouseMove={(event) => {
          if (highlightHits.length === 0 && nameHits.length === 0) {
            if (hoverTip) setHoverTip(null);
            return;
          }
          const area = areaRef.current;
          if (!area) return;
          const offset = offsetFromPoint(area, event.clientX, event.clientY);
          const nameHit = nameHits.find((item) => offset >= item.start && offset <= item.end);
          if (nameHit && onJumpToEntity) {
            setHoverTip({ x: event.clientX, y: event.clientY, text: format(m.canvas.jumpToEntity, { name: nameHit.entityLabel }) });
            return;
          }
          const hit = highlightHits.find((item) => offset >= item.start && offset <= item.end);
          if (hit) setHoverTip({ x: event.clientX, y: event.clientY, text: hit.text });
          else if (hoverTip) setHoverTip(null);
        }}
        onMouseLeave={() => setHoverTip(null)}
        onClickCapture={(event) => {
          if (!onJumpToEntity || nameHits.length === 0) return;
          if (!event.metaKey && !event.ctrlKey) return;
          const area = areaRef.current;
          if (!area) return;
          const offset = offsetFromPoint(area, event.clientX, event.clientY);
          const hit = nameHits.find((item) => offset >= item.start && offset <= item.end);
          if (!hit) return;
          event.preventDefault();
          event.stopPropagation();
          onJumpToEntity(hit.entityRef);
        }}
        onKeyDown={(event) => {
          if (onToggleFormat && (event.ctrlKey || event.metaKey) && !event.shiftKey && !event.altKey) {
            const key = event.key.toLowerCase();
            const style = key === "b" ? "bold" : key === "i" ? "italic" : key === "u" ? "underline" : null;
            if (style) {
              event.preventDefault();
              const span = spanFromArea();
              if (span) toggleFormat(style, span);
              return;
            }
          }
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
      {placeholdersEnabled && placeholderMarks.length > 0 ? (
        <div className="prose-placeholders">
          {placeholderMarks.map((mark) => {
            const owner = placeholders.find((item) => item.id === mark.id);
            if (!owner) return null;
            return (
              <button
                key={mark.id}
                type="button"
                className="prose-placeholder-mark"
                data-placeholder-id={mark.id}
                style={{ left: mark.left, top: mark.top }}
                title={owner.note || m.canvas.placeholderEmptyNote}
                aria-label={m.canvas.placeholderOpen}
                onClick={(event) => {
                  event.stopPropagation();
                  setActivePlaceholder({ id: owner.id, note: owner.note });
                }}
              >
                📌
              </button>
            );
          })}
        </div>
      ) : null}
      {hoverTip ? (
        <div className="prose-hover-tip" style={{ left: hoverTip.x, top: hoverTip.y }} role="tooltip">
          {hoverTip.text}
        </div>
      ) : null}
      </div>
      {formatBar && onToggleFormat ? (
        <div
          className="format-toolbar"
          style={{ left: formatBar.x, top: formatBar.y }}
          role="toolbar"
          aria-label={m.canvas.formatToolbar}
          onMouseDown={(event) => event.preventDefault()}
        >
          {FORMATTING_STYLES.map((style) => {
            const on = isFullyStyled(formatting, formatBar.span.start, formatBar.span.end, style);
            const label = style === "bold" ? m.canvas.bold : style === "italic" ? m.canvas.italic : m.canvas.underline;
            return (
              <button
                key={style}
                type="button"
                className={on ? "format-btn is-on" : "format-btn"}
                aria-pressed={on}
                title={label}
                aria-label={label}
                onClick={() => toggleFormat(style, formatBar.span)}
              >
                {style === "bold" ? "B" : style === "italic" ? "I" : "U"}
              </button>
            );
          })}
        </div>
      ) : null}
      {menu?.kind === "rewrite" ? (
        <div
          ref={menuRef}
          className="selection-menu"
          style={{ left: menu.x, top: menu.y }}
          role="menu"
        >
          <button type="button" role="menuitem" onClick={() => run("extend")}>
            {m.canvas.extend}
          </button>
          <button type="button" role="menuitem" onClick={() => run("elaborate")}>
            {m.canvas.elaborate}
          </button>
          <button type="button" role="menuitem" onClick={() => run("instruct")}>
            {rewriteAction}…
          </button>
          {onAskAboutPassage ? (
            <button type="button" role="menuitem" onClick={() => run("ask")}>
              {m.canvas.ask}
            </button>
          ) : null}
          {onLift ? (
            <button type="button" role="menuitem" onClick={() => run("lift")}>
              {m.canvas.lift}
            </button>
          ) : null}
          {onCutToDarling ? (
            <button type="button" role="menuitem" onClick={() => run("darling")}>
              {m.canvas.cutToDarling}
            </button>
          ) : null}
          {onIllustrate ? (
            <button type="button" role="menuitem" onClick={() => run("illustrate")}>
              {m.canvas.illustrate}
            </button>
          ) : null}
          <button type="button" role="menuitem" onClick={() => run("manual")}>
            {m.canvas.manual}
          </button>
        </div>
      ) : null}
      {menu?.kind === "cursor-menu" ? (
        <div ref={menuRef} className="selection-menu" style={{ left: menu.x, top: menu.y }} role="menu">
          {onBeat ? (
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                const span = menu.span;
                setMenu(null);
                setBeat({ span, instruction: "" });
              }}
            >
              {m.canvas.beat}
            </button>
          ) : null}
          {placeholdersEnabled ? (
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                const at = menu.span.start;
                setMenu(null);
                setPlaceholderForm({ at, note: "" });
              }}
            >
              {m.canvas.placeholderAdd}
            </button>
          ) : null}
        </div>
      ) : null}
      {menu?.kind === "alts" ? (
        <div
          ref={menuRef}
          className="selection-menu alts-menu"
          style={{ left: menu.x, top: menu.y }}
          role="menu"
        >
          <p className="selection-menu-label">{format(m.canvas.insteadOf, { word: menu.word })}</p>
          {menu.status === "loading" ? <p className="quiet">{m.canvas.looking}</p> : null}
          {menu.status === "error" ? (
            <>
              <p className="quiet">{m.canvas.noAlts}</p>
              <button
                type="button"
                role="menuitem"
                onClick={() => setMenu({ ...menu, status: "loading", options: [] })}
              >
                {m.canvas.retry}
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
            <h2 id="manual-edit-title">{m.canvas.manualTitle}</h2>
            <p className="quiet">{m.canvas.manualBody}</p>
            <textarea
              value={manual.draft}
              onChange={(event) => setManual({ ...manual, draft: event.target.value })}
              rows={8}
              autoFocus
            />
            <div className="edit-actions">
              <button type="button" className="text-button" onClick={() => setManual(null)}>
                {m.common.cancel}
              </button>
              <button type="submit" className="primary">
                {m.canvas.apply}
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
            <h2 id="rewrite-title">{rewriteTitle}</h2>
            <p className="quiet">{rewriteHint}</p>
            <blockquote className="marked-passage">{instruct.marked}</blockquote>
            <div className="rewrite-chips" role="group" aria-label={m.canvas.rewriteChips.group}>
              {REWRITE_CHIP_IDS.map((id) => {
                const piece = rewriteChipPrompt(m, id, rewriteWho);
                const on = instruct.instruction.includes(piece);
                return (
                  <button
                    key={id}
                    type="button"
                    className={on ? "rewrite-chip is-on" : "rewrite-chip"}
                    aria-pressed={on}
                    onClick={() => applyChip(id)}
                  >
                    {rewriteChipLabel(m, id)}
                  </button>
                );
              })}
            </div>
            <textarea
              ref={instructFieldRef}
              value={instruct.instruction}
              onChange={(event) => setInstruct({ ...instruct, instruction: event.target.value })}
              placeholder={rewritePlaceholder}
              rows={4}
              autoFocus
              required
            />
            <div className="edit-actions">
              <button type="button" className="text-button" onClick={() => setInstruct(null)}>
                {m.common.cancel}
              </button>
              <button type="submit" className="primary" disabled={!instruct.instruction.trim()}>
                {rewriteAction}
              </button>
            </div>
          </form>
        </div>
      ) : null}
      {beat ? (
        <div
          className="edit-overlay"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setBeat(null);
          }}
        >
          <form className="edit-card" action="#" onSubmit={applyBeat} aria-labelledby="beat-title">
            <h2 id="beat-title">{m.canvas.beatTitle}</h2>
            <p className="quiet">{m.canvas.beatHint}</p>
            <textarea
              value={beat.instruction}
              onChange={(event) => setBeat({ ...beat, instruction: event.target.value })}
              placeholder={m.canvas.beatPlaceholder}
              rows={3}
              autoFocus
              required
            />
            <div className="edit-actions">
              <button type="button" className="text-button" onClick={() => setBeat(null)}>
                {m.common.cancel}
              </button>
              <button type="submit" className="primary" disabled={!beat.instruction.trim()}>
                {m.canvas.beatAction}
              </button>
            </div>
          </form>
        </div>
      ) : null}
      {ask ? (
        <div
          className="edit-overlay"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setAsk(null);
          }}
        >
          <form className="edit-card" action="#" onSubmit={applyAsk} aria-labelledby="ask-passage-title">
            <h2 id="ask-passage-title">{m.canvas.askTitle}</h2>
            <p className="quiet">{m.canvas.askHint}</p>
            <blockquote className="marked-passage">{ask.marked}</blockquote>
            <textarea
              value={ask.question}
              onChange={(event) => setAsk({ ...ask, question: event.target.value })}
              placeholder={m.canvas.askPlaceholder}
              rows={3}
              autoFocus
              required
            />
            <div className="edit-actions">
              <button type="button" className="text-button" onClick={() => setAsk(null)}>
                {m.common.cancel}
              </button>
              <button type="submit" className="primary" disabled={!ask.question.trim()}>
                {m.canvas.askAction}
              </button>
            </div>
          </form>
        </div>
      ) : null}
      {placeholderForm ? (
        <div
          className="edit-overlay"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setPlaceholderForm(null);
          }}
        >
          <form className="edit-card" action="#" onSubmit={applyPlaceholderForm} aria-labelledby="placeholder-add-title">
            <h2 id="placeholder-add-title">{m.canvas.placeholderAddTitle}</h2>
            <p className="quiet">{m.canvas.placeholderAddHint}</p>
            <textarea
              value={placeholderForm.note}
              onChange={(event) => setPlaceholderForm({ ...placeholderForm, note: event.target.value })}
              placeholder={m.canvas.placeholderPlaceholder}
              rows={2}
              autoFocus
            />
            <div className="edit-actions">
              <button type="button" className="text-button" onClick={() => setPlaceholderForm(null)}>
                {m.common.cancel}
              </button>
              <button type="submit" className="primary">
                {m.canvas.placeholderAddAction}
              </button>
            </div>
          </form>
        </div>
      ) : null}
      {activePlaceholder ? (
        <div
          className="edit-overlay"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setActivePlaceholder(null);
          }}
        >
          <form className="edit-card" action="#" onSubmit={saveActivePlaceholder} aria-labelledby="placeholder-view-title">
            <h2 id="placeholder-view-title">{m.canvas.placeholderViewTitle}</h2>
            <textarea
              value={activePlaceholder.note}
              onChange={(event) => setActivePlaceholder({ ...activePlaceholder, note: event.target.value })}
              placeholder={m.canvas.placeholderPlaceholder}
              rows={2}
              autoFocus
            />
            <div className="edit-actions">
              <button type="button" className="text-button" onClick={() => setActivePlaceholder(null)}>
                {m.common.cancel}
              </button>
              <button type="button" className="text-button" onClick={resolveActivePlaceholder}>
                {m.canvas.placeholderResolve}
              </button>
              <button type="submit" className="primary">
                {m.canvas.placeholderSave}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}

function ProseMarkup({
  text,
  names,
  extraSyllables,
  highlightTics = false,
  highlightFacts = false,
  nameLinks = [],
  findNeedle,
  findFlags,
  findActiveStart
}: {
  text: string;
  names: string[];
  extraSyllables?: number;
  highlightTics?: boolean;
  highlightFacts?: boolean;
  nameLinks?: { entity_ref: string; entity_label: string }[];
  findNeedle?: string;
  findFlags?: FindFlags;
  findActiveStart?: number;
}) {
  const paras = splitFlowParagraphs(text);
  const findMarks =
    findNeedle && findFlags
      ? findMarksByParagraph(
          text,
          findNeedle,
          findFlags,
          findActiveStart
        )
      : [];
  if (paras.length === 0) return <p><br /></p>;
  return (
    <>
      {paras.map((block, index) => (
        <p key={index}>
          {findNeedle && findFlags ? (
            <FindMarkup text={block} marks={findMarks[index] ?? []} />
          ) : highlightTics ? (
            <TicMarkup text={block} />
          ) : highlightFacts ? (
            <FactMarkup text={block} nameLinks={nameLinks} />
          ) : (
            <RareMarkup
              text={block}
              names={names}
              {...(extraSyllables !== undefined ? { extraSyllables } : {})}
            />
          )}
        </p>
      ))}
    </>
  );
}

function FactMarkup({ text, nameLinks }: { text: string; nameLinks: { entity_ref: string; entity_label: string }[] }) {
  const hits = useMemo(() => (nameLinks.length > 0 ? findNameHitsInText(text, nameLinks) : []), [text, nameLinks]);
  if (hits.length === 0) return <>{text}</>;
  const parts: React.ReactNode[] = [];
  let cursor = 0;
  for (const hit of hits) {
    if (hit.start > cursor) parts.push(text.slice(cursor, hit.start));
    parts.push(
      <mark key={hit.start} title={hit.entityLabel}>
        {text.slice(hit.start, hit.end)}
      </mark>
    );
    cursor = hit.end;
  }
  if (cursor < text.length) parts.push(text.slice(cursor));
  return <>{parts}</>;
}

function FindMarkup({ text, marks }: { text: string; marks: { start: number; end: number; current: boolean }[] }) {
  if (marks.length === 0) return <>{text}</>;
  const parts: React.ReactNode[] = [];
  let cursor = 0;
  for (const mark of marks) {
    if (mark.start > cursor) parts.push(text.slice(cursor, mark.start));
    parts.push(
      <mark key={mark.start} {...(mark.current ? { className: "is-current" } : {})}>
        {text.slice(mark.start, mark.end)}
      </mark>
    );
    cursor = mark.end;
  }
  if (cursor < text.length) parts.push(text.slice(cursor));
  return <>{parts}</>;
}

function TicMarkup({ text }: { text: string }) {
  const { messages: m } = useLocale();
  const hits = useMemo(() => findAiTicHits(text), [text]);
  if (hits.length === 0) return <>{text}</>;
  const parts: React.ReactNode[] = [];
  let cursor = 0;
  for (const hit of hits) {
    if (hit.start > cursor) parts.push(text.slice(cursor, hit.start));
    const title = hit.kind === "dash" ? m.stats.ticDashTitle : m.stats.ticPhraseTitle;
    parts.push(
      <mark key={hit.start} title={title}>
        {text.slice(hit.start, hit.end)}
      </mark>
    );
    cursor = hit.end;
  }
  if (cursor < text.length) parts.push(text.slice(cursor));
  return <>{parts}</>;
}

function RareMarkup({
  text,
  names,
  extraSyllables
}: {
  text: string;
  names: string[];
  extraSyllables?: number;
}) {
  const { messages: m } = useLocale();
  const hits = useMemo(
    () => findRareHits(text, names, extraSyllables !== undefined ? { extraSyllables } : undefined),
    [extraSyllables, names, text]
  );
  if (hits.length === 0) return <>{text}</>;
  const parts: React.ReactNode[] = [];
  let cursor = 0;
  for (const hit of hits) {
    if (hit.start > cursor) parts.push(text.slice(cursor, hit.start));
    parts.push(
      <mark key={hit.start} title={m.stats.rareMarkTitle}>
        {text.slice(hit.start, hit.end)}
      </mark>
    );
    cursor = hit.end;
  }
  if (cursor < text.length) parts.push(text.slice(cursor));
  return <>{parts}</>;
}
