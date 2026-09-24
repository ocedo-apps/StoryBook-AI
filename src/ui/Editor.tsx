import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { peopleLabels, entityLabels } from "@core/bibleGroups";
import { countWords } from "@core/proseStats";
import { replaceCollapsedSentence } from "@core/sentenceSplit";
import {
  CONTINUES_NONE,
  defaultPredecessor,
  earlierChapters,
  moveChapter,
  parseContinuesFrom,
  reorderDropIndex,
  strandLinksForChapter
} from "@core/continuesFrom";
import {
  ADVANCED_POV_MODES,
  PRIMARY_POV_MODES,
  TENSES,
  hasCraftOverride,
  needsViewpoint,
  parseOptionalPov,
  parseOptionalTense,
  resolveCraft,
  type ChapterCraft,
  type CraftFields,
  type PovMode,
  type Tense
} from "@core/craft";
import { characterCast } from "@core/characterProfile";
import {
  formatManuscriptMarkdown,
  manuscriptBackupBasename,
  manuscriptExportBasename,
  manuscriptNeedsJsonBackup,
  packManuscriptBackup,
  ensureDownloadFilename
} from "@core/manuscriptBackup";
import { buildManuscriptExport, formatExportHtml, formatExportRtf, packEpub, packOdt, packPdf } from "@core/manuscriptExport";
import { PUBLISH_FONTS, publishFontById, loadPublishFontEmbed, type PublishFontId } from "@core/publishFonts";
import {
  addChapter,
  clearWritingGoal,
  discardChapter,
  discardedChapters,
  removeChapter,
  restoreChapter,
  setWritingGoal,
  sortedChapters,
  updateChapter,
  type Chapter,
  type WritingGoal
} from "@core/BookSchema";
import { computeGoalPace, manuscriptWordCount } from "@core/writingGoal";
import { moveStoryTimeOrder, timelineEntries } from "@core/timeline";
import { knowledgeLeaksForChapter } from "@core/continuity";
import { addPlotline, plotlineMatrixRows, removePlotline, renamePlotline, toggleChapterPlotline } from "@core/plotlines";
import { replaceInBrainstormNotes } from "@core/brainstormNotes";
import { parseReaderAge, readerTuning, resolveReader } from "@core/reader";
import { selectedText } from "@core/textSpan";
import { useIllustrationStyles } from "./useIllustrationStyles";
import { IllustrationStyleLibraryCard } from "./IllustrationStyleLibraryCard";
import { AskManuscriptPanel } from "./AskManuscript";
import { TimelinePanel } from "./Timeline";
import { useBookStore } from "./useBookStore";
import { downloadBytes, downloadJson, downloadText } from "./downloadJson";
import { readLastJsonBackup, recordLastJsonBackup } from "./jsonBackupStamp";
import { BiblePanel } from "./BiblePanel";
import { SettingsPanel } from "./SettingsPanel";
import { ThemeToggle } from "./ThemeToggle";
import { LocaleSelect } from "./LocaleSelect";
import { ChapterFeedbackCard } from "./ChapterFeedbackCard";
import { ChapterHistoryCard } from "./ChapterHistoryCard";
import { ChapterStartImageBanner } from "./ChapterStartImage";
import { ContinuityWarning } from "./ContinuityWarning";
import { PlotlineMatrixPanel } from "./PlotlineMatrix";
import { ChapterBriefCopy } from "./ChapterBriefCopy";
import { DispositionBoard } from "./DispositionBoard";
import { BrainstormBoard } from "./BrainstormBoard";
import { ProseCanvas } from "./ProseCanvas";
import { ProseStatsCard } from "./ProseStatsCard";
import { FindReplaceCard, type FindHighlight, type FindLaunch } from "./FindReplaceCard";
import { ProofreadCard } from "./ProofreadCard";
import { ProgressCard } from "./ProgressCard";
import type { FindOccurrence } from "@core/findReplace";
import { count, format, translateError, type Messages, useLocale } from "./i18n";

function craftCue(book: CraftFields, chapter: ChapterCraft, m: Messages): string {
  if (!hasCraftOverride(chapter)) return "";
  const resolved = resolveCraft(book, chapter);
  if (chapter.viewpoint !== undefined) {
    return chapter.viewpoint.trim() || m.craft.modes[resolved.pov];
  }
  if (chapter.pov !== undefined && needsViewpoint(resolved.pov) && resolved.viewpoint.trim()) {
    return `${m.craft.modes[resolved.pov]} · ${resolved.viewpoint.trim()}`;
  }
  if (chapter.pov !== undefined) return m.craft.modes[resolved.pov];
  if (chapter.tense !== undefined) return m.craft.tenses[resolved.tense];
  return "";
}

function continuesCue(chapters: Chapter[], chapter: Chapter, m: Messages): string {
  if (!chapter.continues_from) return "";
  if (chapter.continues_from === CONTINUES_NONE) return m.editor.newStrand;
  const from = chapters.find((item) => item.id === chapter.continues_from);
  if (!from || from.sequence_index >= chapter.sequence_index) return "";
  return `← ${from.sequence_index + 1}`;
}

function indexAnchor(stack: HTMLElement, chapterId: string): HTMLElement | null {
  const row = stack.querySelector(`[data-chapter-id="${CSS.escape(chapterId)}"]`);
  if (!(row instanceof HTMLElement)) return null;
  const index = row.querySelector(".chapter-index");
  return index instanceof HTMLElement ? index : row;
}

function ChapterStrandOverlay({
  chapters,
  selectedId,
  layoutKey,
  children
}: {
  chapters: Chapter[];
  selectedId: string | null;
  layoutKey: string;
  children: React.ReactNode;
}) {
  const stackRef = useRef<HTMLDivElement>(null);
  const [lines, setLines] = useState<{ y1: number; y2: number }[]>([]);
  const linkKey = selectedId
    ? strandLinksForChapter(chapters, selectedId)
        .map((link) => `${link.sourceId}:${link.continuerId}`)
        .join("|")
    : "";

  useLayoutEffect(() => {
    const stack = stackRef.current;
    const links = selectedId ? strandLinksForChapter(chapters, selectedId) : [];
    if (!stack || links.length === 0) {
      setLines((prev) => (prev.length === 0 ? prev : []));
      return;
    }

    function measure() {
      if (!stack) return;
      const stackBox = stack.getBoundingClientRect();
      const next: { y1: number; y2: number }[] = [];
      for (const link of links) {
        const source = indexAnchor(stack, link.sourceId);
        const continuer = indexAnchor(stack, link.continuerId);
        if (!source || !continuer) continue;
        const a = source.getBoundingClientRect();
        const b = continuer.getBoundingClientRect();
        next.push({
          y1: a.top + a.height / 2 - stackBox.top,
          y2: b.top + b.height / 2 - stackBox.top
        });
      }
      setLines((prev) =>
        prev.length === next.length && prev.every((line, i) => line.y1 === next[i]?.y1 && line.y2 === next[i]?.y2)
          ? prev
          : next
      );
    }

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(stack);
    for (const item of Array.from(stack.querySelectorAll("li"))) observer.observe(item);
    return () => observer.disconnect();
  }, [chapters, layoutKey, linkKey, selectedId]);

  return (
    <div className="chapter-list-scroll">
      <div className="chapter-list-stack" ref={stackRef}>
        {children}
        {lines.length > 0 ? (
          <svg className="chapter-strands" aria-hidden="true">
            {lines.map((line, index) => (
              <g key={index}>
                <line x1="6" y1={line.y1} x2="6" y2={line.y2} />
                <circle cx="6" cy={line.y1} r="2.25" />
                <circle cx="6" cy={line.y2} r="2.25" />
              </g>
            ))}
          </svg>
        ) : null}
      </div>
    </div>
  );
}

function choiceLabel(chapter: Chapter, untitled: string): string {
  return `${chapter.sequence_index + 1} · ${chapter.title.trim() || untitled}`;
}

function StatsTrigger({
  words,
  highlighting,
  onOpen,
  onToggleHighlight
}: {
  words: number;
  highlighting: boolean;
  onOpen: () => void;
  onToggleHighlight: () => void;
}) {
  const { messages: m } = useLocale();
  return (
    <span className="stats-cluster">
      <button type="button" className="stats-trigger" onClick={onOpen}>
        <span className="word-count">{count(words, m.stats.wordsShort)}</span>
        <span className="stats-trigger-label">{m.stats.label}</span>
      </button>
      <button
        type="button"
        className={highlighting ? "stats-trigger is-on" : "stats-trigger"}
        onClick={onToggleHighlight}
        aria-pressed={highlighting}
        title={highlighting ? m.stats.rareOnTitle : m.stats.rareOffTitle}
      >
        <span className="stats-trigger-label">{highlighting ? m.stats.rareOn : m.stats.rareOff}</span>
      </button>
    </span>
  );
}

function MaximizeButton({
  maximized,
  onToggle
}: {
  maximized: boolean;
  onToggle: () => void;
}) {
  const { messages: m } = useLocale();
  return (
    <button
      type="button"
      className="text-button maximize-btn"
      onClick={onToggle}
      aria-pressed={maximized}
      title={maximized ? m.editor.restoreTitle : m.editor.maximizeTitle}
    >
      {maximized ? m.editor.restore : m.editor.maximize}
    </button>
  );
}

function selectedFindNeedle(): string {
  const line = window.getSelection()?.toString().split(/\r?\n/)[0]?.trim() ?? "";
  return line.slice(0, 120);
}

function rewriteWhoFrom(craft: CraftFields): string {
  return needsViewpoint(craft.pov) ? craft.viewpoint.trim() : "";
}

function ModelAsideCallout({ asides, onDismiss }: { asides: string[]; onDismiss: () => void }) {
  const { messages: m } = useLocale();
  if (asides.length === 0) return null;
  return (
    <aside className="model-aside" role="status">
      <div className="model-aside-copy">
        <p className="aside-kicker">{m.canvas.modelAside}</p>
        {asides.map((text, index) => (
          <p key={index} className="aside-body">
            {text}
          </p>
        ))}
      </div>
      <button type="button" className="text-button" onClick={onDismiss}>
        {m.common.close}
      </button>
    </aside>
  );
}

export function Editor() {
  const store = useBookStore();
  const { messages: m } = useLocale();
  const { book, chapterId, surface, busy, error, models, model, writingPrimer, reviewModel, ollamaError, chapterFeedback, modelAsides } = store;
  if (!book) return null;

  const chapters = sortedChapters(book);
  const discarded = discardedChapters(book);
  const currentWords = manuscriptWordCount(book);
  const goalPace = book.goal ? computeGoalPace(book, book.goal) : null;
  const chapter = chapters.find((item) => item.id === chapterId) ?? chapters[0];
  if (!chapter) return null;
  const onBrainstorm = surface === "brainstorm";
  const onSynopsis = surface === "synopsis";
  const onSettings = surface === "settings";
  const onAskManuscript = surface === "ask";
  const onTimeline = surface === "timeline";
  const onPlotlines = surface === "plotlines";
  const [boardOpen, setBoardOpen] = useState(false);
  const onBoard = boardOpen;
  const [askOpen, setAskOpen] = useState(false);
  const [ask, setAsk] = useState("");
  const [maximized, setMaximized] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [progressOpen, setProgressOpen] = useState(false);
  const [illustrationLibraryOpen, setIllustrationLibraryOpen] = useState(false);
  const [illustrateOpen, setIllustrateOpen] = useState(false);
  const [illustratePrompt, setIllustratePrompt] = useState<string | null>(null);
  const [illustrateCopied, setIllustrateCopied] = useState(false);
  const illustrationStyles = useIllustrationStyles();
  const [backupOpen, setBackupOpen] = useState(false);
  const [backupNote, setBackupNote] = useState("");
  const [backupFilename, setBackupFilename] = useState("");
  const [publishOpen, setPublishOpen] = useState(false);
  const [publishFilename, setPublishFilename] = useState("");
  const [publishFormat, setPublishFormat] = useState<"md" | "rtf" | "odt" | "html" | "epub" | "pdf">("md");
  const [publishFontId, setPublishFontId] = useState<PublishFontId>("system");
  const [findOpen, setFindOpen] = useState(false);
  const [proofreadOpen, setProofreadOpen] = useState(false);
  const [findLaunch, setFindLaunch] = useState<FindLaunch>({});
  const [findKey, setFindKey] = useState(0);
  const [findHighlight, setFindHighlight] = useState<FindHighlight | null>(null);
  const [lastJsonBackupAt, setLastJsonBackupAt] = useState(() => readLastJsonBackup(book.id));
  const [highlightRare, setHighlightRare] = useState(false);
  const [dragChapterId, setDragChapterId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<{ id: string; after: boolean } | "end" | null>(null);
  const [continuesNotice, setContinuesNotice] = useState<string | null>(null);
  const [expandedBriefs, setExpandedBriefs] = useState<string[]>(() =>
    surface === "chapter" && chapterId ? [chapterId] : []
  );
  const dragChapterIdRef = useRef<string | null>(null);
  const names = entityLabels(book.facts, book.entity_kinds);
  const pageText =
    onSettings || onAskManuscript || onTimeline || onPlotlines
      ? ""
      : onBrainstorm
        ? book.brainstorm
        : onSynopsis
          ? book.synopsis
          : chapter.prose;
  const notes = chapterFeedback?.chapterId === chapter.id ? chapterFeedback : null;
  const activeReaderAge =
    onBrainstorm || onSynopsis || onSettings || onAskManuscript || onTimeline || onPlotlines
      ? book.reader_age
      : resolveReader(book, chapter);
  const readerExtra = readerTuning(activeReaderAge).extraSyllables;
  const findCanvas =
    findHighlight && findHighlight.needle.trim()
      ? {
          findNeedle: findHighlight.needle,
          findFlags: findHighlight.flags,
          ...(findHighlight.activeStart !== undefined ? { findActiveStart: findHighlight.activeStart } : {})
        }
      : {};

  const partnerBusy = busy === "extend" || busy === "elaborate" || busy === "instruct" || busy === "ask";
  const jsonBackupDue = manuscriptNeedsJsonBackup(book.updated_at, lastJsonBackupAt);
  const canReorder = chapters.length > 1;

  function draggingChapterId(event?: React.DragEvent): string | null {
    const fromData = event?.dataTransfer.getData("text/plain") ?? "";
    return fromData || dragChapterIdRef.current || dragChapterId;
  }

  function stopChapterDrag() {
    dragChapterIdRef.current = null;
    setDragChapterId(null);
    setDropTarget(null);
  }

  function applyChapterMove(chapterIdToMove: string, toIndex: number) {
    if (!book) return;
    const { book: next, cleared } = moveChapter(book, chapterIdToMove, toIndex);
    if (next === book) return;
    void store.patchBook((current) => moveChapter(current, chapterIdToMove, toIndex).book);
    noteClearedContinues(cleared);
  }

  async function saveExport(kind: "md" | "rtf" | "odt" | "html" | "epub" | "pdf") {
    if (!book) return;
    const packed = packManuscriptBackup(book);
    const doc = buildManuscriptExport(book, packed.note, packed.exportedAt);
    const fontOption = publishFontById(publishFontId);
    const embed = kind === "md" ? undefined : await loadPublishFontEmbed(publishFontId);
    const font =
      kind === "md" ? undefined : { name: fontOption.name, stack: fontOption.stack, ...(embed ? { embed } : {}) };
    if (kind === "md") {
      downloadText(ensureDownloadFilename(publishFilename, "md"), formatManuscriptMarkdown(packed), "text/markdown");
    } else if (kind === "rtf") {
      downloadText(ensureDownloadFilename(publishFilename, "rtf"), formatExportRtf(doc, font), "application/rtf");
    } else if (kind === "odt") {
      downloadBytes(
        ensureDownloadFilename(publishFilename, "odt"),
        packOdt(doc, font),
        "application/vnd.oasis.opendocument.text"
      );
    } else if (kind === "html") {
      downloadText(ensureDownloadFilename(publishFilename, "html"), formatExportHtml(doc, font), "text/html");
    } else if (kind === "epub") {
      downloadBytes(ensureDownloadFilename(publishFilename, "epub"), packEpub(doc, font), "application/epub+zip");
    } else {
      downloadBytes(ensureDownloadFilename(publishFilename, "pdf"), await packPdf(doc, font), "application/pdf");
    }
    setPublishOpen(false);
  }

  function openPublish() {
    if (!book) return;
    setBackupOpen(false);
    setProgressOpen(false);
    setFindOpen(false);
    setFindHighlight(null);
    setIllustrationLibraryOpen(false);
    setIllustrateOpen(false);
    setPublishFilename(manuscriptExportBasename(book));
    setPublishOpen(true);
  }

  function openProgress() {
    setBackupOpen(false);
    setPublishOpen(false);
    setFindOpen(false);
    setFindHighlight(null);
    setIllustrationLibraryOpen(false);
    setIllustrateOpen(false);
    setProgressOpen(true);
  }

  function openFind() {
    setBackupOpen(false);
    setPublishOpen(false);
    setProgressOpen(false);
    setAskOpen(false);
    setStatsOpen(false);
    setNotesOpen(false);
    setIllustrationLibraryOpen(false);
    setIllustrateOpen(false);
    if (findOpen) {
      setFindOpen(false);
      setFindHighlight(null);
      return;
    }
    setFindLaunch({ needle: selectedFindNeedle() });
    setFindKey((n) => n + 1);
    setFindOpen(true);
  }

  function openProofread() {
    setBackupOpen(false);
    setPublishOpen(false);
    setProgressOpen(false);
    setAskOpen(false);
    setStatsOpen(false);
    setNotesOpen(false);
    setFindOpen(false);
    setFindHighlight(null);
    setBoardOpen(false);
    setProofreadOpen(true);
    if (!book?.proofread) void store.startProofread();
  }

  function dismissProofread() {
    if (busy === "proofread") return;
    setProofreadOpen(false);
  }

  function findPhrase(phrase: string) {
    const trimmed = phrase.trim();
    if (!trimmed) return;
    setBackupOpen(false);
    setPublishOpen(false);
    setProgressOpen(false);
    setAskOpen(false);
    setNotesOpen(false);
    setStatsOpen(false);
    setFindLaunch({
      needle: trimmed,
      here: true,
      wholeWord: !/\s/.test(trimmed)
    });
    setFindKey((n) => n + 1);
    setFindOpen(true);
  }

  const onFindHighlight = useCallback((query: FindHighlight | null) => {
    setFindHighlight(query);
  }, []);

  function revealFind(occurrence: FindOccurrence) {
    setBoardOpen(false);
    if (occurrence.field === "brainstorm") store.showBrainstorm();
    else if (occurrence.field === "synopsis") store.showSynopsis();
    else if (occurrence.chapterId) store.setChapterId(occurrence.chapterId);
  }

  function openBoard() {
    setBoardOpen(true);
    if (!chapterId && chapters[0]) store.selectChapter(chapters[0].id);
  }

  function openChapterFromBoard(id: string) {
    setBoardOpen(false);
    store.setChapterId(id);
  }

  function noteClearedContinues(cleared: { title: string; fromTitle: string }[]) {
    if (cleared.length === 0) {
      setContinuesNotice(null);
      return;
    }
    setContinuesNotice(
      cleared
        .map((item) =>
          format(m.editor.continuesCleared, {
            title: item.title.trim() || m.editor.untitled,
            from: item.fromTitle.trim() || m.editor.untitled
          })
        )
        .join(" ")
    );
  }

  useEffect(() => {
    if (!maximized) return;
    function onKey(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      if (document.querySelector(".edit-overlay")) return;
      setMaximized(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [maximized]);

  useEffect(() => {
    if (busy === "proofread") setProofreadOpen(true);
  }, [busy]);

  useEffect(() => {
    const status = book.proofread?.status;
    if (status === "running" || status === "paused") setProofreadOpen(true);
    else setProofreadOpen(false);
  }, [book.id]);

  useEffect(() => {
    if (!backupOpen && !publishOpen && !findOpen && !illustrateOpen) return;
    function onKey(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setBackupOpen(false);
      setPublishOpen(false);
      setFindOpen(false);
      setFindHighlight(null);
      setIllustrateOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [backupOpen, publishOpen, findOpen, illustrateOpen]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (!(event.ctrlKey || event.metaKey) || !event.shiftKey) return;
      if (event.key !== "f" && event.key !== "F") return;
      event.preventDefault();
      openFind();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [findOpen]);

  useEffect(() => {
    setLastJsonBackupAt(readLastJsonBackup(book.id));
  }, [book.id]);

  useEffect(() => {
    setNotesOpen(false);
  }, [chapter.id]);

  return (
    <div className={maximized ? "editor is-maximized" : "editor"}>
      <header className="editor-top">
        <button type="button" className="text-button" onClick={store.closeBook}>
          {m.editor.allManuscripts}
        </button>
        <input
          className="title-input"
          value={book.title}
          onChange={(event) => void store.patchBook((current) => ({ ...current, title: event.target.value }))}
          aria-label={m.editor.manuscriptTitle}
        />
        <button type="button" className="text-button theme-toggle progress-header" onClick={openProgress}>
          {goalPace
            ? format(m.progress.percentComplete, { percent: goalPace.percent })
            : `${count(currentWords, m.stats.wordsShort)} · ${m.progress.setGoal}`}
        </button>
        <div className="model-fields">
          <LocaleSelect />
          <ThemeToggle />
          <button
            type="button"
            className={jsonBackupDue ? "text-button theme-toggle backup-cue is-due" : "text-button theme-toggle backup-cue"}
            title={jsonBackupDue ? m.editor.backupDueTitle : m.editor.backupTitle}
            onClick={() => {
              setPublishOpen(false);
              setProgressOpen(false);
              setFindOpen(false);
              setFindHighlight(null);
              setBackupNote("");
              setBackupFilename(manuscriptBackupBasename(book));
              setBackupOpen(true);
            }}
          >
            {jsonBackupDue ? m.editor.backupDue : m.editor.backup}
          </button>
          <div className="find-anchor">
            <button
              type="button"
              className={findOpen ? "text-button theme-toggle is-on" : "text-button theme-toggle"}
              aria-expanded={findOpen}
              aria-controls="find-panel"
              onClick={openFind}
            >
              {m.find.action}
            </button>
            {findOpen ? (
              <FindReplaceCard
                key={findKey}
                book={book}
                surface={surface}
                chapterId={chapterId}
                pageText={pageText}
                names={names}
                launch={findLaunch}
                disabled={busy !== null}
                onHighlight={onFindHighlight}
                onReveal={revealFind}
                onReplace={(mutate) => void store.patchBook(mutate)}
                onClose={() => {
                  setFindOpen(false);
                  setFindHighlight(null);
                }}
              />
            ) : null}
          </div>
        </div>
      </header>

      {(error || ollamaError) && (
        <p className="banner" role="status">
          {translateError(error ?? ollamaError ?? "", m)}
        </p>
      )}
      {continuesNotice ? (
        <p className="banner banner-notice" role="status">
          <span>{continuesNotice}</span>
          <button type="button" className="text-button" onClick={() => setContinuesNotice(null)}>
            {m.common.close}
          </button>
        </p>
      ) : null}

      <div className="editor-body">
        <aside className="rail rail-left">
          <button
            type="button"
            className={onSettings && !onBoard ? "synopsis-item is-active" : "synopsis-item"}
            onClick={() => {
              dismissProofread();
              setBoardOpen(false);
              store.showSettings();
            }}
          >
            {m.editor.settings}
          </button>
          <button
            type="button"
            className={onBrainstorm && !onBoard ? "synopsis-item is-active" : "synopsis-item"}
            onClick={() => {
              dismissProofread();
              setBoardOpen(false);
              store.showBrainstorm();
            }}
          >
            {m.editor.brainstorm}
          </button>
          <button
            type="button"
            className={onSynopsis && !onBoard ? "synopsis-item is-active" : "synopsis-item"}
            onClick={() => {
              dismissProofread();
              setBoardOpen(false);
              store.showSynopsis();
            }}
          >
            {m.editor.synopsis}
          </button>
          <button
            type="button"
            className={onAskManuscript && !onBoard ? "synopsis-item is-active" : "synopsis-item"}
            onClick={() => {
              dismissProofread();
              setBoardOpen(false);
              store.showAsk();
            }}
          >
            {m.askManuscript.nav}
          </button>
          <button
            type="button"
            className={onTimeline && !onBoard ? "synopsis-item is-active" : "synopsis-item"}
            onClick={() => {
              dismissProofread();
              setBoardOpen(false);
              store.showTimeline();
            }}
          >
            {m.timeline.nav}
          </button>
          <button
            type="button"
            className={onPlotlines && !onBoard ? "synopsis-item is-active" : "synopsis-item"}
            onClick={() => {
              dismissProofread();
              setBoardOpen(false);
              store.showPlotlines();
            }}
          >
            {m.plotlines.nav}
          </button>
          <button
            type="button"
            className={onBoard ? "synopsis-item is-active" : "synopsis-item"}
            onClick={() => {
              dismissProofread();
              openBoard();
            }}
          >
            {m.editor.briefs}
          </button>
          <div className="rail-head">
            <h2>{m.editor.chapters}</h2>
            <button type="button" className="text-button" onClick={() => void store.patchBook(addChapter)}>
              {m.editor.add}
            </button>
          </div>
          <ChapterStrandOverlay
            chapters={chapters}
            selectedId={surface === "chapter" || onBoard ? chapterId : null}
            layoutKey={`${expandedBriefs.join(",")}:${chapters
              .map((item) => `${item.id}:${item.continues_from ?? ""}:${item.sequence_index}`)
              .join("|")}`}
          >
          <ol
            className="chapter-list"
            aria-label={m.editor.reorderChapters}
            onDragOver={(event) => {
              if (!canReorder || !dragChapterIdRef.current) return;
              event.preventDefault();
              event.dataTransfer.dropEffect = "move";
              if (event.target === event.currentTarget && dropTarget !== "end") setDropTarget("end");
            }}
            onDrop={(event) => {
              event.preventDefault();
              const fromId = draggingChapterId(event);
              stopChapterDrag();
              if (!fromId) return;
              applyChapterMove(fromId, chapters.length - 1);
            }}
          >
            {chapters.map((item, index) => {
              const cue = craftCue(book, item, m);
              const continues = continuesCue(chapters, item, m);
              const selected = item.id === chapterId && (surface === "chapter" || onBoard);
              const briefOpen = expandedBriefs.includes(item.id);
              const briefId = `chapter-brief-${item.id}`;
              const dropAfterEnd = dropTarget === "end" && index === chapters.length - 1;
              const rowDrop =
                dropTarget && dropTarget !== "end" && dropTarget.id === item.id && dragChapterId !== item.id
                  ? dropTarget
                  : null;
              const rowClass = [
                briefOpen ? "is-open" : "",
                dragChapterId === item.id ? "is-dragging" : "",
                dropAfterEnd || rowDrop?.after ? "is-drop-after" : "",
                rowDrop && !rowDrop.after ? "is-drop-before" : ""
              ]
                .filter(Boolean)
                .join(" ");
              const briefTitle = item.title.trim() || m.editor.untitled;
              return (
              <li
                key={item.id}
                {...(rowClass ? { className: rowClass } : {})}
                onDragOver={(event) => {
                  if (!canReorder || !dragChapterIdRef.current) return;
                  event.preventDefault();
                  event.stopPropagation();
                  event.dataTransfer.dropEffect = "move";
                  const rect = event.currentTarget.getBoundingClientRect();
                  const after = event.clientY > rect.top + rect.height / 2;
                  if (
                    dropTarget === "end" ||
                    dropTarget?.id !== item.id ||
                    dropTarget.after !== after
                  ) {
                    setDropTarget({ id: item.id, after });
                  }
                }}
                onDragLeave={(event) => {
                  if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
                  if (dropTarget !== "end" && dropTarget?.id === item.id) setDropTarget(null);
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  const fromId = draggingChapterId(event);
                  const rect = event.currentTarget.getBoundingClientRect();
                  const after = event.clientY > rect.top + rect.height / 2;
                  const fromIndex = chapters.findIndex((chapter) => chapter.id === fromId);
                  stopChapterDrag();
                  if (!fromId || fromIndex < 0) return;
                  applyChapterMove(fromId, reorderDropIndex(fromIndex, index, after));
                }}
              >
                <button
                  type="button"
                  className={selected ? "chapter-item is-active" : "chapter-item"}
                  data-chapter-id={item.id}
                  {...(canReorder ? { draggable: true } : {})}
                  onDragStart={(event) => {
                    if (!canReorder) return;
                    event.dataTransfer.setData("text/plain", item.id);
                    event.dataTransfer.effectAllowed = "move";
                    dragChapterIdRef.current = item.id;
                    setDragChapterId(item.id);
                  }}
                  onDragEnd={() => {
                    stopChapterDrag();
                  }}
                  onKeyDown={(event) => {
                    if (!canReorder || (!event.altKey && !event.metaKey)) return;
                    if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
                    event.preventDefault();
                    const toIndex = event.key === "ArrowUp" ? index - 1 : index + 1;
                    if (toIndex < 0 || toIndex >= chapters.length) return;
                    applyChapterMove(item.id, toIndex);
                  }}
                  onClick={() => {
                    dismissProofread();
                    if (onBoard) store.selectChapter(item.id);
                    else store.setChapterId(item.id);
                    setExpandedBriefs((ids) => (ids.includes(item.id) ? ids : [...ids, item.id]));
                  }}
                >
                  <span className="chapter-index">{item.sequence_index + 1}</span>
                  <span className="chapter-name">
                    <span className="chapter-name-text">{item.title.trim() || m.editor.untitled}</span>
                    {cue || (item.voice !== undefined && item.voice.trim()) || item.reader_age !== undefined || continues ? (
                      <span className="chapter-cues">
                        {cue ? <span className="chapter-cue">{cue}</span> : null}
                        {item.voice !== undefined && item.voice.trim() ? <span className="chapter-cue">{m.editor.voiceCue}</span> : null}
                        {item.reader_age !== undefined ? <span className="chapter-cue">{m.editor.readerCue}</span> : null}
                        {continues ? <span className="chapter-cue">{continues}</span> : null}
                      </span>
                    ) : null}
                  </span>
                </button>
                <div className="chapter-row-tools">
                  <button
                    type="button"
                    className="icon-button chapter-brief-toggle"
                    aria-expanded={briefOpen}
                    aria-controls={briefId}
                    aria-label={format(briefOpen ? m.editor.hideBrief : m.editor.showBrief, { title: briefTitle })}
                    onClick={() =>
                      setExpandedBriefs((ids) =>
                        ids.includes(item.id) ? ids.filter((id) => id !== item.id) : [...ids, item.id]
                      )
                    }
                  >
                    <span className="chevron" aria-hidden="true">
                      ▾
                    </span>
                  </button>
                  {chapters.length > 1 ? (
                    <button
                      type="button"
                      className="icon-button"
                      aria-label={format(m.editor.removeChapter, {
                        title: item.title || m.editor.removeChapterFallback
                      })}
                      onClick={() => {
                        const title = item.title.trim() || m.editor.untitled;
                        if (!window.confirm(format(m.editor.discardChapterConfirm, { title }))) return;
                        const remaining = chapters.filter((entry) => entry.id !== item.id);
                        const fallback = remaining[0]?.id;
                        void store.patchBook((current) => discardChapter(current, item.id)).then(() => {
                          if (item.id === chapterId && fallback) store.setChapterId(fallback);
                        });
                      }}
                    >
                      ×
                    </button>
                  ) : null}
                </div>
                {briefOpen ? (
                  <div className="chapter-brief">
                    <ChapterBriefCopy
                      id={briefId}
                      value={item.brief}
                      placeholder={m.editor.briefPlaceholder}
                      label={m.editor.chapterBrief}
                      onCommit={(brief) =>
                        void store.patchBook((current) => updateChapter(current, item.id, { brief }))
                      }
                    />
                  </div>
                ) : null}
              </li>
              );
            })}
          </ol>
          <button
            type="button"
            className={
              proofreadOpen || busy === "proofread" ? "synopsis-item proofread-item is-active" : "synopsis-item proofread-item"
            }
            onClick={openProofread}
            disabled={busy !== null && busy !== "proofread"}
          >
            {m.editor.proofread}
          </button>
          </ChapterStrandOverlay>
          <button
            type="button"
            className={publishOpen ? "synopsis-item publish-item is-active" : "synopsis-item publish-item"}
            onClick={openPublish}
          >
            {m.editor.publish}
          </button>
          {discarded.length > 0 ? (
            <>
              <div className="rail-head">
                <h2>{m.editor.discardedChapters}</h2>
              </div>
              <ul className="chapter-list discarded-list">
                {discarded.map((item) => {
                  const title = item.title.trim() || m.editor.untitled;
                  return (
                    <li key={item.id}>
                      <span className="discarded-name">{title}</span>
                      <div className="chapter-row-tools">
                        <button
                          type="button"
                          className="text-button"
                          aria-label={format(m.editor.restoreChapter, { title })}
                          onClick={() => void store.patchBook((current) => restoreChapter(current, item.id))}
                        >
                          {m.editor.restoreDiscarded}
                        </button>
                        <button
                          type="button"
                          className="icon-button"
                          aria-label={format(m.editor.throwAwayChapter, { title })}
                          onClick={() => {
                            if (!window.confirm(format(m.editor.throwAwayConfirm, { title }))) return;
                            void store.patchBook((current) => removeChapter(current, item.id));
                          }}
                        >
                          ×
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </>
          ) : null}
        </aside>

        {onSettings && !onBoard ? (
          <SettingsPanel
            book={book}
            models={models}
            model={model}
            reviewModel={reviewModel}
            writingPrimer={writingPrimer}
            historyLimit={store.historyLimit}
            illustrationStyles={illustrationStyles.styles}
            lastPrompt={store.lastPrompt}
            onPatch={(mutate) => void store.patchBook(mutate)}
            onModel={store.setModel}
            onReviewModel={store.setReviewModel}
            onPrimer={store.setWritingPrimer}
            onResetPrimer={store.resetWritingPrimer}
            onHistoryLimit={store.setHistoryLimit}
            onBrowseIllustrationLibrary={() => setIllustrationLibraryOpen(true)}
          />
        ) : onBoard ? (
          <DispositionBoard
            book={book}
            chapters={chapters}
            chapterId={chapterId}
            footActions={<MaximizeButton maximized={maximized} onToggle={() => setMaximized((on) => !on)} />}
            onSelect={store.selectChapter}
            onOpen={openChapterFromBoard}
            onMoved={noteClearedContinues}
            onPatch={(mutate) => void store.patchBook(mutate)}
          />
        ) : onBrainstorm ? (
          <BrainstormBoard
            book={book}
            busy={busy !== null}
            footActions={
              <>
                <StatsTrigger
                  words={countWords(book.brainstorm)}
                  highlighting={highlightRare}
                  onOpen={() => setStatsOpen(true)}
                  onToggleHighlight={() => setHighlightRare((on) => !on)}
                />
                <MaximizeButton maximized={maximized} onToggle={() => setMaximized((on) => !on)} />
              </>
            }
            extraActions={
              partnerBusy ? (
                <button type="button" onClick={store.stopDraft}>
                  {m.common.stop}
                </button>
              ) : (
                <>
                  <button type="button" onClick={() => setAskOpen(true)} disabled={busy !== null}>
                    {m.editor.ask}
                  </button>
                  <button type="button" onClick={store.showSynopsis} disabled={busy !== null}>
                    {m.editor.openSynopsis}
                  </button>
                </>
              )
            }
            onPatch={(mutate) => void store.patchBook(mutate)}
            onSend={() => void store.sendBrainstormToSynopsis()}
          >
            {askOpen ? (
              <div
                className="edit-overlay"
                role="presentation"
                onMouseDown={(event) => {
                  if (event.target === event.currentTarget) setAskOpen(false);
                }}
              >
                <form
                  className="edit-card"
                  action="#"
                  onSubmit={(event) => {
                    event.preventDefault();
                    const question = ask.trim();
                    if (!question) return;
                    setAsk("");
                    setAskOpen(false);
                    void store.askBrainstorm(question);
                  }}
                  aria-labelledby="ask-title"
                >
                  <h2 id="ask-title">{m.editor.askTitle}</h2>
                  <p className="quiet">{m.editor.askBody}</p>
                  <textarea
                    value={ask}
                    onChange={(event) => setAsk(event.target.value)}
                    placeholder={m.editor.askPlaceholder}
                    rows={4}
                    autoFocus
                    required
                  />
                  <div className="edit-actions">
                    <button type="button" className="text-button" onClick={() => setAskOpen(false)}>
                      {m.common.cancel}
                    </button>
                    <button type="submit" className="primary" disabled={!ask.trim()}>
                      {m.editor.askAction}
                    </button>
                  </div>
                </form>
              </div>
            ) : null}
          </BrainstormBoard>
        ) : onAskManuscript ? (
          <AskManuscriptPanel
            answer={store.askManuscriptAnswer}
            busy={busy === "ask-manuscript"}
            onAsk={(question) => void store.askManuscript(question)}
            onJumpToChapter={store.setChapterId}
          />
        ) : onTimeline ? (
          <TimelinePanel
            entries={timelineEntries(book)}
            onSetStoryTime={(chapterIdToPatch, text) =>
              void store.patchBook((current) =>
                updateChapter(current, chapterIdToPatch, { story_time: text.trim() === "" ? undefined : text })
              )
            }
            onMove={(chapterIdToMove, direction) =>
              void store.patchBook((current) => moveStoryTimeOrder(current, chapterIdToMove, direction))
            }
            onJumpToChapter={store.setChapterId}
          />
        ) : onPlotlines ? (
          <PlotlineMatrixPanel
            rows={plotlineMatrixRows(book)}
            plotlines={book.plotlines}
            onToggle={(chapterIdToMark, plotlineId) =>
              void store.patchBook((current) => toggleChapterPlotline(current, chapterIdToMark, plotlineId))
            }
            onAddPlotline={(title) => void store.patchBook((current) => addPlotline(current, title))}
            onRenamePlotline={(plotlineId, title) =>
              void store.patchBook((current) => renamePlotline(current, plotlineId, title))
            }
            onRemovePlotline={(plotlineId) => void store.patchBook((current) => removePlotline(current, plotlineId))}
            onJumpToChapter={store.setChapterId}
          />
        ) : onSynopsis ? (
          <main className="manuscript">
            <h1 className="chapter-title">{m.editor.synopsis}</h1>
            <p className="synopsis-lede">{m.editor.synopsisLede}</p>
            <ProseCanvas
              value={book.synopsis}
              onChange={(next) => void store.patchBook((current) => ({ ...current, synopsis: next }))}
              placeholder={m.editor.synopsisPlaceholder}
              disabled={busy !== null}
              highlightRare={highlightRare}
              names={names}
              {...(readerExtra !== undefined ? { extraSyllables: readerExtra } : {})}
              {...findCanvas}
              onSuggestAlternatives={(args) => store.suggestAlternatives(args)}
              onExtend={(span) => void store.rewriteSpan({ target: "synopsis", mode: "extend", span })}
              onElaborate={(span) => void store.rewriteSpan({ target: "synopsis", mode: "elaborate", span })}
              onInstruct={(span, instruction) =>
                void store.rewriteSpan({ target: "synopsis", mode: "instruct", span, instruction })
              }
              rewriteWho={rewriteWhoFrom(book)}
              aside={<ModelAsideCallout asides={modelAsides} onDismiss={store.dismissModelAside} />}
            />
            <footer className="manuscript-foot">
              <StatsTrigger
                words={countWords(book.synopsis)}
                highlighting={highlightRare}
                onOpen={() => setStatsOpen(true)}
                onToggleHighlight={() => setHighlightRare((on) => !on)}
              />
              <div className="actions">
                <MaximizeButton maximized={maximized} onToggle={() => setMaximized((on) => !on)} />
                {busy === "extend" || busy === "elaborate" || busy === "instruct" ? (
                  <button type="button" onClick={store.stopDraft}>
                    {m.common.stop}
                  </button>
                ) : (
                  <button type="button" className="primary" onClick={() => store.setChapterId(chapter.id)} disabled={busy !== null}>
                    {format(m.editor.startChapter, { n: chapter.sequence_index + 1 })}
                  </button>
                )}
              </div>
            </footer>
          </main>
        ) : (
          <main className="manuscript">
            <div className="chapter-head">
              <input
                className="chapter-title"
                value={chapter.title}
                onChange={(event) =>
                  void store.patchBook((current) => updateChapter(current, chapter.id, { title: event.target.value }))
                }
                aria-label={m.editor.chapterTitle}
              />
              <div className="chapter-head-top">
                <div className="craft-field">
                  <span>{m.editor.voice}</span>
                  {chapter.voice !== undefined ? (
                    <button
                      type="button"
                      className="text-button chapter-voice-reset"
                      onClick={() =>
                        void store.patchBook((current) => updateChapter(current, chapter.id, { voice: undefined }))
                      }
                    >
                      {m.editor.manuscript}
                    </button>
                  ) : null}
                  <textarea
                    value={chapter.voice ?? ""}
                    onChange={(event) => {
                      const next = event.target.value;
                      void store.patchBook((current) =>
                        updateChapter(current, chapter.id, { voice: next.trim() === "" ? undefined : next })
                      );
                    }}
                    placeholder={book.voice.trim() ? m.editor.chapterVoiceInherit : m.editor.voicePlaceholder}
                    rows={1}
                    aria-label={m.editor.chapterVoice}
                  />
                </div>
                <div className="craft-field reader-head-field">
                  <span>{m.editor.reader}</span>
                  {chapter.reader_age !== undefined ? (
                    <button
                      type="button"
                      className="text-button chapter-voice-reset"
                      onClick={() =>
                        void store.patchBook((current) =>
                          updateChapter(current, chapter.id, { reader_age: undefined })
                        )
                      }
                    >
                      {m.editor.manuscript}
                    </button>
                  ) : null}
                  <input
                    type="number"
                    min={1}
                    max={99}
                    inputMode="numeric"
                    value={chapter.reader_age ?? ""}
                    title={m.editor.readerTitle}
                    aria-label={m.editor.chapterReader}
                    placeholder={
                      book.reader_age !== undefined
                        ? format(m.editor.chapterReaderInherit, { age: book.reader_age })
                        : m.editor.readerPlaceholder
                    }
                    onChange={(event) => {
                      const raw = event.target.value;
                      if (raw === "") {
                        void store.patchBook((current) =>
                          updateChapter(current, chapter.id, { reader_age: undefined })
                        );
                        return;
                      }
                      const age = parseReaderAge(raw);
                      if (age === undefined) return;
                      void store.patchBook((current) => updateChapter(current, chapter.id, { reader_age: age }));
                    }}
                  />
                </div>
              </div>
              <ChapterCraftFields
                bookPov={book.pov}
                bookTense={book.tense}
                bookViewpoint={book.viewpoint}
                chapter={chapter}
                chapters={chapters}
                people={peopleLabels(book.facts, book.entity_kinds)}
                recasting={busy === "recast"}
                recastDisabled={busy !== null || !chapter.prose.trim()}
                onRecast={() => void store.recastChapter()}
                onPatch={(patch) => void store.patchBook((current) => updateChapter(current, chapter.id, patch))}
              />
            </div>
            <ProseCanvas
              value={chapter.prose}
              onChange={(next) => void store.patchBook((current) => updateChapter(current, chapter.id, { prose: next }))}
              placeholder={m.editor.chapterPlaceholder}
              disabled={busy !== null}
              highlightRare={highlightRare}
              names={names}
              {...(readerExtra !== undefined ? { extraSyllables: readerExtra } : {})}
              {...findCanvas}
              onSuggestAlternatives={(args) => store.suggestAlternatives(args)}
              onExtend={(span) => void store.rewriteSpan({ target: "prose", mode: "extend", span })}
              onElaborate={(span) => void store.rewriteSpan({ target: "prose", mode: "elaborate", span })}
              onInstruct={(span, instruction) =>
                void store.rewriteSpan({ target: "prose", mode: "instruct", span, instruction })
              }
              onIllustrate={(span) => {
                setIllustratePrompt(null);
                setIllustrateOpen(true);
                void store.generateIllustrationPrompt(selectedText(chapter.prose, span)).then((prompt) => setIllustratePrompt(prompt));
              }}
              rewriteWho={rewriteWhoFrom(resolveCraft(book, chapter))}
              aside={
                <>
                  <ChapterStartImageBanner
                    image={chapter.startImage}
                    onSet={(picture) => void store.patchBook((current) => updateChapter(current, chapter.id, { startImage: picture }))}
                    onRemove={() => void store.patchBook((current) => updateChapter(current, chapter.id, { startImage: undefined }))}
                  />
                  <ContinuityWarning leaks={knowledgeLeaksForChapter(book, chapter.id)} onJumpToChapter={store.setChapterId} />
                  <ModelAsideCallout asides={modelAsides} onDismiss={store.dismissModelAside} />
                </>
              }
            />
            <footer className="manuscript-foot">
              <StatsTrigger
                words={countWords(chapter.prose)}
                highlighting={highlightRare}
                onOpen={() => setStatsOpen(true)}
                onToggleHighlight={() => setHighlightRare((on) => !on)}
              />
              <div className="actions">
                <MaximizeButton maximized={maximized} onToggle={() => setMaximized((on) => !on)} />
                {busy === "draft" || busy === "extend" || busy === "elaborate" || busy === "instruct" || busy === "recast" ? (
                  <button type="button" onClick={store.stopDraft}>
                    {m.common.stop}
                  </button>
                ) : (
                  <button type="button" className="primary" onClick={() => void store.draftChapter()} disabled={busy !== null}>
                    {m.editor.draft}
                  </button>
                )}
                <button type="button" onClick={() => void store.extractChapter()} disabled={busy !== null}>
                  {busy === "extract" ? m.editor.extracting : m.editor.extract}
                </button>
                {busy === "analyze" ? (
                  <button type="button" onClick={store.stopDraft}>
                    {m.common.stop}
                  </button>
                ) : (
                  <button
                    type="button"
                    title={m.notes.intro}
                    onClick={() => {
                      void store.analyzeChapter().then((ok) => {
                        if (ok) setNotesOpen(true);
                      });
                    }}
                    disabled={busy !== null || !chapter.prose.trim()}
                  >
                    {m.editor.analyze}
                  </button>
                )}
                {notes ? (
                  <button type="button" onClick={() => setNotesOpen(true)} disabled={busy !== null}>
                    {m.editor.notes}
                  </button>
                ) : null}
                <button
                  type="button"
                  title={m.history.intro}
                  onClick={() => setHistoryOpen(true)}
                  disabled={busy !== null || chapter.revisions.length === 0}
                >
                  {m.editor.history}
                </button>
              </div>
            </footer>
          </main>
        )}

        <BiblePanel />
      </div>
      {statsOpen ? (
        <ProseStatsCard
          text={pageText}
          names={names}
          highlighting={highlightRare}
          onHighlight={() => setHighlightRare(true)}
          onSuggestSplit={(sentence, signal) => store.suggestSentenceSplit(sentence, signal)}
          onSuggestBreak={(paragraph, signal) => store.suggestParagraphBreak(paragraph, signal)}
          onFindPhrase={findPhrase}
          {...(onBrainstorm || onSynopsis ? {} : { craft: resolveCraft(book, chapter) })}
          {...(activeReaderAge !== undefined ? { readerAge: activeReaderAge } : {})}
          cast={characterCast(book.facts, book.entity_kinds, book.profiles)}
          onApplySplit={(sentence, split) => {
            const current = onBrainstorm ? book.brainstorm : onSynopsis ? book.synopsis : chapter.prose;
            const next = replaceCollapsedSentence(current, sentence, split);
            if (!next) return false;
            if (onBrainstorm) {
              void store.patchBook((item) =>
                replaceInBrainstormNotes(item, (text) => replaceCollapsedSentence(text, sentence, split) ?? text)
              );
            } else if (onSynopsis) void store.patchBook((item) => ({ ...item, synopsis: next }));
            else void store.patchBook((item) => updateChapter(item, chapter.id, { prose: next }));
            return true;
          }}
          onClose={() => setStatsOpen(false)}
        />
      ) : null}
      {proofreadOpen && book.proofread ? (
        <ProofreadCard
          book={book}
          job={book.proofread}
          running={busy === "proofread"}
          onClose={() => setProofreadOpen(false)}
          onStop={store.stopDraft}
          onContinue={() => void store.startProofread()}
          onRunAgain={() => void store.startProofread({ restart: true })}
          onOpenChapter={(id) => {
            setProofreadOpen(false);
            store.setChapterId(id);
          }}
        />
      ) : null}
      {notesOpen && notes ? (
        <ChapterFeedbackCard
          items={notes.items}
          {...(activeReaderAge !== undefined ? { readerAge: activeReaderAge } : {})}
          onClose={() => setNotesOpen(false)}
        />
      ) : null}
      {historyOpen ? (
        <ChapterHistoryCard
          revisions={chapter.revisions}
          liveProse={chapter.prose}
          onRestore={(revisionId) => void store.restoreChapterProse(revisionId)}
          onClose={() => setHistoryOpen(false)}
        />
      ) : null}
      {progressOpen ? (
        <ProgressCard
          book={book}
          onSetGoal={(goal: WritingGoal) => void store.patchBook((current) => setWritingGoal(current, goal))}
          onClearGoal={() => void store.patchBook((current) => clearWritingGoal(current))}
          onClose={() => setProgressOpen(false)}
        />
      ) : null}
      {illustrationLibraryOpen ? (
        <IllustrationStyleLibraryCard
          styles={illustrationStyles.styles}
          currentStyleText={book.illustration_style}
          onSelect={(style) => {
            void store.patchBook((current) => ({ ...current, illustration_style: style.promptText }));
            setIllustrationLibraryOpen(false);
          }}
          onReapplyIfCurrent={(style) => {
            void store.patchBook((current) => ({ ...current, illustration_style: style.promptText }));
          }}
          onSave={illustrationStyles.saveStyle}
          onDelete={illustrationStyles.deleteStyle}
          onClose={() => setIllustrationLibraryOpen(false)}
        />
      ) : null}
      {illustrateOpen ? (
        <div
          className="edit-overlay"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setIllustrateOpen(false);
          }}
        >
          <div className="edit-card" role="dialog" aria-modal="true" aria-labelledby="illustrate-title">
            <h2 id="illustrate-title">{m.illustration.promptTitle}</h2>
            <p className="quiet">{m.illustration.promptHint}</p>
            {busy === "illustrate" ? (
              <p className="quiet">{m.illustration.generating}</p>
            ) : illustratePrompt === null ? (
              <p className="quiet">{store.error ? translateError(store.error, m) : m.illustration.generateError}</p>
            ) : (
              <p className="marked-passage">{illustratePrompt}</p>
            )}
            <div className="edit-actions">
              <button type="button" className="text-button" onClick={() => setIllustrateOpen(false)}>
                {m.common.close}
              </button>
              {illustratePrompt ? (
                <button
                  type="button"
                  className="primary"
                  onClick={() => {
                    void navigator.clipboard.writeText(illustratePrompt).then(() => {
                      setIllustrateCopied(true);
                      window.setTimeout(() => setIllustrateCopied(false), 1500);
                    });
                  }}
                >
                  {illustrateCopied ? m.common.copied : m.common.copy}
                </button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
      {backupOpen ? (
        <div className="edit-overlay" role="presentation" onClick={() => setBackupOpen(false)}>
          <form
            className="edit-card backup-card"
            action="#"
            onClick={(event) => event.stopPropagation()}
            onSubmit={(event) => {
              event.preventDefault();
              const packed = packManuscriptBackup(book, backupNote);
              downloadJson(ensureDownloadFilename(backupFilename, "json"), packed);
              recordLastJsonBackup(book.id, packed.exportedAt);
              setLastJsonBackupAt(packed.exportedAt);
              setBackupOpen(false);
            }}
            aria-labelledby="backup-title"
          >
            <h2 id="backup-title">{m.backup.title}</h2>
            <p className="quiet">{m.backup.body}</p>
            <label className="field-label" htmlFor="backup-note">
              {m.backup.whatHappened}
            </label>
            <textarea
              id="backup-note"
              rows={2}
              value={backupNote}
              onChange={(event) => setBackupNote(event.target.value)}
              placeholder={m.backup.whatHappenedPlaceholder}
            />
            <label className="field-label" htmlFor="backup-filename">
              {m.backup.documentName}
            </label>
            <input
              id="backup-filename"
              type="text"
              value={backupFilename}
              onChange={(event) => setBackupFilename(event.target.value)}
              autoComplete="off"
              spellCheck={false}
            />
            <div className="edit-actions">
              <button type="button" className="text-button" onClick={() => setBackupOpen(false)}>
                {m.common.cancel}
              </button>
              <button type="submit" className="primary">
                {m.backup.action}
              </button>
            </div>
          </form>
        </div>
      ) : null}
      {publishOpen ? (
        <div className="edit-overlay" role="presentation" onClick={() => setPublishOpen(false)}>
          <form
            className="edit-card backup-card"
            action="#"
            onClick={(event) => event.stopPropagation()}
            onSubmit={(event) => {
              event.preventDefault();
              void saveExport(publishFormat);
            }}
            aria-labelledby="publish-title"
          >
            <h2 id="publish-title">{m.publish.title}</h2>
            <p className="quiet">{m.publish.body}</p>
            <label className="field-label" htmlFor="publish-filename">
              {m.publish.documentName}
            </label>
            <input
              id="publish-filename"
              type="text"
              value={publishFilename}
              onChange={(event) => setPublishFilename(event.target.value)}
              autoComplete="off"
              spellCheck={false}
            />
            <label className="field-label" htmlFor="publish-format">
              {m.publish.format}
            </label>
            <select
              id="publish-format"
              value={publishFormat}
              onChange={(event) => setPublishFormat(event.target.value as typeof publishFormat)}
            >
              <option value="md">{m.publish.markdown}</option>
              <option value="rtf">{m.publish.rtf}</option>
              <option value="odt">{m.publish.odt}</option>
              <option value="html">{m.publish.html}</option>
              <option value="epub">{m.publish.epub}</option>
              <option value="pdf">{m.publish.pdf}</option>
            </select>
            <label className="field-label" htmlFor="publish-font">
              {m.publish.font}
            </label>
            <select
              id="publish-font"
              value={publishFontId}
              onChange={(event) => setPublishFontId(event.target.value as PublishFontId)}
              disabled={publishFormat === "md"}
            >
              {PUBLISH_FONTS.map((font) => (
                <option key={font.id} value={font.id}>
                  {font.id === "system" ? m.publish.systemFont : font.label}
                </option>
              ))}
            </select>
            <div className="edit-actions">
              <button type="button" className="text-button" onClick={() => setPublishOpen(false)}>
                {m.common.cancel}
              </button>
              <button type="submit" className="primary">
                {m.publish.action}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}

function PovModeOptions() {
  const { messages: m } = useLocale();
  return (
    <>
      <optgroup label={m.craft.usual}>
        {PRIMARY_POV_MODES.map((mode) => (
          <option key={mode} value={mode}>
            {m.craft.modes[mode]}
          </option>
        ))}
      </optgroup>
      <optgroup label={m.craft.more}>
        {ADVANCED_POV_MODES.map((mode) => (
          <option key={mode} value={mode}>
            {m.craft.modes[mode]}
          </option>
        ))}
      </optgroup>
    </>
  );
}

function ChapterCraftFields({
  bookPov,
  bookTense,
  bookViewpoint,
  chapter,
  chapters,
  people,
  recasting,
  recastDisabled,
  onRecast,
  onPatch
}: {
  bookPov: PovMode;
  bookTense: Tense;
  bookViewpoint: string;
  chapter: Chapter;
  chapters: Chapter[];
  people: string[];
  recasting: boolean;
  recastDisabled: boolean;
  onRecast: () => void;
  onPatch: (patch: {
    pov?: PovMode | undefined;
    tense?: Tense | undefined;
    viewpoint?: string | undefined;
    continues_from?: string | undefined;
  }) => void;
}) {
  const { messages: m } = useLocale();
  const resolved = resolveCraft({ pov: bookPov, tense: bookTense, viewpoint: bookViewpoint }, chapter);
  const showViewpoint = needsViewpoint(resolved.pov);
  const inheritedViewpoint = bookViewpoint.trim();
  const previous = defaultPredecessor(chapters, chapter);
  const strandOptions = earlierChapters(chapters, chapter).filter((item) => item.id !== previous?.id);
  const continuesValue =
    chapter.continues_from === CONTINUES_NONE || strandOptions.some((item) => item.id === chapter.continues_from)
      ? (chapter.continues_from ?? "")
      : "";

  return (
    <div className="chapter-craft">
      <div className="chapter-craft-grid">
        <label className="craft-field">
          <span>{m.craft.pov}</span>
          <select
            value={chapter.pov ?? ""}
            onChange={(event) => onPatch({ pov: parseOptionalPov(event.target.value) })}
            aria-label={m.craft.chapterPov}
          >
            <option value="">{format(m.craft.inheritPov, { label: m.craft.modes[bookPov] })}</option>
            <PovModeOptions />
          </select>
        </label>
        <label className="craft-field">
          <span>{m.craft.tense}</span>
          <select
            value={chapter.tense ?? ""}
            onChange={(event) => onPatch({ tense: parseOptionalTense(event.target.value) })}
            aria-label={m.craft.chapterTense}
          >
            <option value="">{format(m.craft.inheritTense, { label: m.craft.tenses[bookTense] })}</option>
            {TENSES.map((mode) => (
              <option key={mode} value={mode}>
                {m.craft.tenses[mode]}
              </option>
            ))}
          </select>
        </label>
        {showViewpoint ? (
          <label className="craft-field">
            <span>{m.craft.viewpoint}</span>
            <span className="chapter-viewpoint-row">
              <input
                list="chapter-viewpoint-people"
                value={chapter.viewpoint ?? ""}
                onChange={(event) => {
                  const next = event.target.value;
                  onPatch({ viewpoint: next === "" ? undefined : next });
                }}
                placeholder={
                  inheritedViewpoint
                    ? format(m.craft.viewpointInherit, { name: inheritedViewpoint })
                    : m.craft.viewpointPlaceholder
                }
                aria-label={m.craft.chapterViewpoint}
              />
              {chapter.viewpoint !== undefined ? (
                <button type="button" className="text-button" onClick={() => onPatch({ viewpoint: undefined })}>
                  {m.editor.manuscript}
                </button>
              ) : null}
            </span>
            {people.length > 0 ? (
              <datalist id="chapter-viewpoint-people">
                {people.map((name) => (
                  <option key={name} value={name} />
                ))}
              </datalist>
            ) : null}
          </label>
        ) : null}
        {chapter.sequence_index > 0 ? (
          <label className="craft-field chapter-continues">
            <span>{m.craft.continuesFrom}</span>
            <select
              value={continuesValue}
              onChange={(event) => onPatch({ continues_from: parseContinuesFrom(event.target.value) })}
              aria-label={m.craft.continuesFrom}
            >
              <option value="">
                {previous
                  ? format(m.craft.previousChapterNamed, { label: choiceLabel(previous, m.editor.untitled) })
                  : m.craft.previousChapter}
              </option>
              <option value={CONTINUES_NONE}>{m.craft.noneStrand}</option>
              {strandOptions.map((item) => (
                <option key={item.id} value={item.id}>
                  {choiceLabel(item, m.editor.untitled)}
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </div>
      <div className="chapter-craft-actions">
        <button
          type="button"
          onClick={onRecast}
          disabled={recastDisabled}
          title={m.editor.recastTitle}
        >
          {recasting ? m.editor.recasting : m.editor.recast}
        </button>
      </div>
    </div>
  );
}
