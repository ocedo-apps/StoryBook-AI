import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import {
  createBook,
  openingSurface,
  sortedChapters,
  touch,
  updateChapter,
  type Book,
  type BookSummary,
  type EditorSurface
} from "@core/BookSchema";
import { BRAINSTORM_PASSAGE_SYSTEM, brainstormChatSystemPrompt, brainstormPassageUserPrompt, liftFragmentToSynopsis, sendStagedNotesToSynopsis, type BrainstormChatMessage } from "@core/brainstorm";
import { applyAssembledBrainstorm } from "@core/brainstormNotes";
import { applyAuthorAddition, applyAuthorDraft, applyExtractorDrafts, approveFact, keepFactSeparate, rejectFact, reviseFact } from "@core/ConsistencyGate";
import { applyMarkerConversion, type MarkerConversionRule } from "@core/markerConversion";
import { withRelationshipMirrorFor } from "@core/relationshipMirror";
import { chapterScenes, mergeSceneWithNext, replaceSceneProse, sceneIdRemovedByMerge } from "@core/bookScene";
import {
  ASK_MANUSCRIPT_SYSTEM,
  askManuscriptUserPrompt,
  rankByKeywordOverlap,
  rankBySimilarity,
  type AskManuscriptAnswer,
  type ManuscriptEvidence,
  type ManuscriptSource
} from "@core/askManuscript";
import { ASK_ABOUT_PASSAGE_SYSTEM, askAboutChapterUserPrompt, askAboutSelectionUserPrompt } from "@core/askAboutPassage";
import { characterInterviewSystem, type InterviewMessage } from "@core/characterInterview";
import type { BibleKind } from "@core/bibleGroups";
import { profileFor, upsertCharacterProfile } from "@core/characterProfile";
import {
  beatPlotlines,
  developExpandUserPrompt,
  developmentMethodById,
  materializeBeats,
  DEVELOP_EXPAND_SYSTEM,
  type DevelopmentStep
} from "@core/developmentMethod";
import { removePlotline } from "@core/plotlines";
import {
  ANALYZE_SYSTEM,
  analyzeSceneUserPrompt,
  analyzeUserPrompt,
  parseChapterFeedback,
  type ChapterFeedback
} from "@core/chapterFeedback";
import { applyOrientationHint, enforceNoTextConstraint, illustrationPromptMessages, relevantEntitiesForPassage } from "@core/illustrationPrompt";
import {
  EXTRACTOR_SYSTEM,
  extractorUserPrompt,
  INTERVIEW_EXTRACTOR_SYSTEM,
  interviewExtractorUserPrompt,
  parseExtractorPayload,
  PLANNING_EXTRACTOR_SYSTEM,
  planningExtractorUserPrompt
} from "@core/extractFacts";
import type { LoreArticleCandidate } from "@core/loreImport";
import { SUMMARIZE_CHAPTER_SYSTEM, summarizeChapterUserPrompt } from "@core/chapterSummary";
import { proseChapters, startProofreadJob, touchProofread, type ProofreadStage } from "@core/proofread";
import { runProofread } from "@core/proofreadRun";
import {
  DRAFT_SYSTEM,
  PASSAGE_SYSTEM,
  RECAST_SYSTEM,
  draftSceneUserPrompt,
  draftUserPrompt,
  passageUserPrompt,
  recastSceneUserPrompt,
  recastUserPrompt,
  resolveVoice
} from "@core/generateProse";
import {
  readProseHistoryLimit,
  recordProseRevision,
  restoreProseRevision,
  rewriteHistoryOp,
  writeProseHistoryLimit,
  type ProseHistoryOp
} from "@core/proseHistory";
import { clearWritingPrimer, readWritingPrimer, withWritingPrimer, writeWritingPrimer } from "@core/writingPrimer";
import { peelModelAsides } from "@core/proseFlow";
import { resolveReader, kidlitReader } from "@core/reader";
import { applyExtend, applyReplace, normalizeSpan, surroundingPassage, type TextSpan } from "@core/textSpan";
import { shiftFormattingRanges, type ProseFormattingRange } from "@core/proseFormatting";
import {
  addPlaceholder,
  diffEditRange,
  removePlaceholder,
  shiftPlaceholders,
  updatePlaceholderNote,
  type Placeholder
} from "@core/placeholders";
import { cutToDarling, discardDarling, restoreDarling, shiftDarlings, type Darling } from "@core/darlings";
import { ALTERNATIVES_SYSTEM, alternativesUserPrompt, dropWrongSense, parseAlternativeWords } from "@core/wordAlternatives";
import { BREAK_SYSTEM, breakUserPrompt, parseParagraphBreak } from "@core/paragraphBreak";
import { SPLIT_SYSTEM, parseSplitSuggestion, splitUserPrompt } from "@core/sentenceSplit";
import { nowIso, slugify } from "@core/ids";
import type { CorePredicate } from "@core/predicates";
import type { FactDraft } from "@core/NarrativeFact";
import {
  DEFAULT_OLLAMA_MODEL,
  DEFAULT_REVIEW_MODEL,
  getOllamaModelContextLength,
  listOllamaModels,
  pickListedOllamaModel,
  pickListedReviewModel
} from "@llm/ollama";
import {
  DEFAULT_OPENAI_COMPATIBLE_BASE_URL,
  LocalProviderConfigError,
  OllamaModelProvider,
  OpenAICompatibleLocalProvider,
  type LlmEngine,
  type LocalModelProvider
} from "@llm/provider";
import { readContextWindow, writeContextWindow } from "@llm/contextWindow";
import { BookNotFoundError, BookRepository } from "@persistence/Repository";
import {
  ManuscriptBackupError,
  parseManuscriptBackup
} from "@core/manuscriptBackup";
import { forgetLastJsonBackup, recordLastJsonBackup } from "./jsonBackupStamp";
import type { PromptDebugEntry, PromptDebugMessage, PromptOperation, PromptDebugTarget } from "./promptDebug";
import { BookStoreContext, type BookStoreValue, type Busy } from "./useBookStore";
import { count, format, getMessages, STORE_ERROR } from "./i18n";

const MODEL_KEY = "storybook-ai.model";
const REVIEW_MODEL_KEY = "storybook-ai.review-model";
const LAST_BOOK_KEY = "storybook-ai.last-book";
const ENGINE_KEY = "storybook-ai.engine";
const BASE_URL_KEY = "storybook-ai.base-url";
/**
 * A whole unsplit chapter (or a long interview) can hold many facts to
 * enumerate in one JSON response — 1200 was tight enough that a dense
 * chapter routinely got its response cut off mid-array, which then failed
 * to parse at all. `parseExtractorPayload` now salvages a truncated
 * response's complete facts regardless, but a roomier budget means it
 * rarely needs to. Also used as Proofread's shared per-stage token budget,
 * since its "facts" stage runs this same extractor.
 */
const EXTRACTOR_MAX_TOKENS = 4000;

function readEngine(): LlmEngine {
  return localStorage.getItem(ENGINE_KEY) === "openai-compatible" ? "openai-compatible" : "ollama";
}

function lastPositionKey(bookId: string): string {
  return `storybook-ai.last-position.${bookId}`;
}

/** Where you were last time you had this book open — which tab, and which chapter if it was the chapter tab. Falls back to null (caller then uses openingSurface's guess) if nothing is stored, the stored chapter no longer exists, or the value is corrupt. */
function readLastPosition(book: Book): { surface: EditorSurface; chapterId: string | null } | null {
  const raw = localStorage.getItem(lastPositionKey(book.id));
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as { surface?: EditorSurface; chapterId?: string | null };
    if (!parsed.surface) return null;
    const chapters = sortedChapters(book);
    const chapterId = parsed.chapterId && chapters.some((chapter) => chapter.id === parsed.chapterId) ? parsed.chapterId : null;
    if (parsed.surface === "chapter" && !chapterId) return null;
    return { surface: parsed.surface, chapterId };
  } catch {
    return null;
  }
}

/**
 * Crossfades between pages via the browser's View Transitions API — Home vs.
 * Editor at the default duration, and the editor's own rail surfaces
 * (Brainstorm, Synopsis, ...) faster since those are clicked far more often.
 * Falls back to a plain state update where unsupported (e.g. Firefox).
 */
function withViewTransition(update: () => void, durationMs = 320): void {
  if (typeof document.startViewTransition === "function") {
    document.documentElement.style.setProperty("--vt-duration", `${durationMs}ms`);
    document.startViewTransition(() => flushSync(update));
  } else {
    update();
  }
}

function ollamaHint(error: unknown): string {
  if (error instanceof LocalProviderConfigError && error.message === STORE_ERROR.serverUrlMissing) {
    return STORE_ERROR.serverUrlMissing;
  }
  const message = error instanceof Error ? error.message : String(error);
  if (/failed to fetch|networkerror|load failed/i.test(message)) {
    return STORE_ERROR.ollamaOrigins;
  }
  return message;
}

/**
 * No call into `LocalModelProvider` ever had a client-side timeout — a
 * request just waits on `fetch` forever. Most of the time that's fine (a
 * slow local model is still working), but if the server hangs (still
 * loading a model, a stalled connection, a wrong port that accepts TCP but
 * never answers) the UI has no way to tell "still thinking" from "will
 * never respond," and — since nothing ever settles — no `finally` block
 * ever runs to clear `busy` either, so the calling control stays dimmed
 * forever with no error. Two minutes is generous for a slow machine or a
 * cold model load, short of "may as well be broken."
 */
const LOCAL_MODEL_TIMEOUT_MS = 120_000;

function withRequestTimeout(abort: AbortController): { timedOut: () => boolean; clear: () => void } {
  let timedOut = false;
  const id = window.setTimeout(() => {
    timedOut = true;
    abort.abort();
  }, LOCAL_MODEL_TIMEOUT_MS);
  return { timedOut: () => timedOut, clear: () => window.clearTimeout(id) };
}

/** Lists models from whichever engine is configured — Ollama's own API, or the OpenAI-compatible one LM Studio and llama.cpp-server share. */
function listEngineModels(engine: LlmEngine, baseUrl: string): Promise<string[]> {
  if (engine === "openai-compatible") {
    const trimmed = baseUrl.trim();
    if (!trimmed) return Promise.reject(new LocalProviderConfigError(STORE_ERROR.serverUrlMissing));
    return new OpenAICompatibleLocalProvider({ model: "", baseUrl: trimmed }).listModels();
  }
  return listOllamaModels();
}

function activeVoice(book: Book, surface: EditorSurface, chapterId: string | null): string {
  if (surface !== "chapter") return book.voice.trim();
  const chapter = book.chapters.find((item) => item.id === chapterId);
  return resolveVoice(book, chapter);
}

function activeReader(book: Book, surface: EditorSurface, chapterId: string | null): number | undefined {
  if (surface !== "chapter") return book.reader_age;
  const chapter = book.chapters.find((item) => item.id === chapterId);
  return resolveReader(book, chapter);
}

export function BookStoreProvider({ children }: { children: React.ReactNode }) {
  const repo = useMemo(() => new BookRepository(), []);
  const [summaries, setSummaries] = useState<BookSummary[]>([]);
  const [book, setBook] = useState<Book | null>(null);
  const [chapterId, setChapterIdState] = useState<string | null>(null);
  const [surface, setSurface] = useState<EditorSurface>("brainstorm");
  const [models, setModels] = useState<string[]>([]);
  const [model, setModelState] = useState(() => localStorage.getItem(MODEL_KEY) ?? DEFAULT_OLLAMA_MODEL);
  const [writingPrimer, setWritingPrimerState] = useState(() =>
    readWritingPrimer(localStorage.getItem(MODEL_KEY) ?? DEFAULT_OLLAMA_MODEL)
  );
  const [reviewModel, setReviewModelState] = useState(
    () => localStorage.getItem(REVIEW_MODEL_KEY) ?? DEFAULT_REVIEW_MODEL
  );
  const [engine, setEngineState] = useState<LlmEngine>(readEngine);
  const [baseUrl, setBaseUrlState] = useState(() => localStorage.getItem(BASE_URL_KEY) ?? "");
  const [contextWindow, setContextWindowState] = useState(() => readContextWindow());
  const [historyLimit, setHistoryLimitState] = useState(() => readProseHistoryLimit());
  const [ollamaError, setOllamaError] = useState<string | null>(null);
  const [busy, setBusy] = useState<Busy>(null);
  const [error, setError] = useState<string | null>(null);
  const [chapterFeedback, setChapterFeedback] = useState<ChapterFeedback | null>(null);
  const [modelAsides, setModelAsides] = useState<string[]>([]);
  const [lastPrompt, setLastPrompt] = useState<PromptDebugEntry | null>(null);
  const [askManuscriptAnswer, setAskManuscriptAnswer] = useState<AskManuscriptAnswer | null>(null);
  const [askPassageAnswer, setAskPassageAnswer] = useState<{ question: string; answer: string } | null>(null);
  const [interviewEntity, setInterviewEntity] = useState<{ ref: string; label: string; kind: BibleKind } | null>(null);
  const [interviewHistory, setInterviewHistory] = useState<InterviewMessage[]>([]);
  const [interviewPersonalityDraft, setInterviewPersonalityDraft] = useState("");
  const [brainstormChatHistory, setBrainstormChatHistory] = useState<BrainstormChatMessage[]>([]);
  /**
   * Which chapter Extract facts attributes new facts to, in story time — not
   * always the chapter open in the editor. An interview isn't extracted
   * from that chapter's own prose (unlike chapter extraction, where the
   * source chapter IS the natural story-time position), so guessing "the
   * chapter you happen to have open" can silently misdate a fact that only
   * becomes true later — e.g. a character's preference between two people
   * he hasn't met yet. Defaults to the open chapter when the interview
   * starts (today's old behavior), but now as a visible, changeable choice
   * rather than a silent one.
   */
  const [interviewExtractChapterId, setInterviewExtractChapterIdState] = useState<string | null>(null);
  /**
   * Which scene, within `interviewExtractChapterId`, the extracted fact is
   * attributed to (roadmap-ideas.md #33 follow-up) — null means "the whole
   * chapter," the old, simpler default. Set together with the chapter id
   * (never independently) so the two can never point at mismatched
   * chapters; see `setInterviewExtractPosition`.
   */
  const [interviewExtractSceneId, setInterviewExtractSceneId] = useState<string | null>(null);
  const [developSuggestion, setDevelopSuggestion] = useState<string | null>(null);
  const [importLoreProgress, setImportLoreProgress] = useState<{ current: number; total: number } | null>(null);
  const bookRef = useRef<Book | null>(null);
  const chapterRef = useRef<string | null>(null);
  const surfaceRef = useRef<EditorSurface>("brainstorm");
  const abortRef = useRef<AbortController | null>(null);
  const proofreadLock = useRef(false);
  const saveTimer = useRef<number | null>(null);
  const writingPrimerRef = useRef(writingPrimer);
  const historyLimitRef = useRef(historyLimit);
  const engineRef = useRef(engine);
  const baseUrlRef = useRef(baseUrl);
  const contextWindowRef = useRef(contextWindow);

  bookRef.current = book;
  chapterRef.current = chapterId;
  surfaceRef.current = surface;
  writingPrimerRef.current = writingPrimer;
  historyLimitRef.current = historyLimit;
  engineRef.current = engine;
  baseUrlRef.current = baseUrl;
  contextWindowRef.current = contextWindow;

  const writingSystem = (job: string) => withWritingPrimer(job, writingPrimerRef.current);

  function makeProvider(modelName: string, name?: string): LocalModelProvider {
    if (engineRef.current === "openai-compatible") {
      return new OpenAICompatibleLocalProvider({
        model: modelName,
        baseUrl: baseUrlRef.current.trim() || DEFAULT_OPENAI_COMPATIBLE_BASE_URL,
        ...(name ? { name } : {})
      });
    }
    return new OllamaModelProvider({ model: modelName, contextWindow: contextWindowRef.current, ...(name ? { name } : {}) });
  }

  const persist = useCallback(
    async (next: Book) => {
      await repo.save(next);
      setSummaries(await repo.list());
    },
    [repo]
  );

  const refresh = useCallback(async () => {
    setSummaries(await repo.list());
  }, [repo]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    const last = localStorage.getItem(LAST_BOOK_KEY);
    if (!last) return;
    void repo.get(last).then((loaded) => {
      const remembered = readLastPosition(loaded);
      setBook(loaded);
      setChapterIdState(remembered?.chapterId ?? sortedChapters(loaded)[0]?.id ?? null);
      setSurface(remembered?.surface ?? openingSurface(loaded));
    }).catch(() => {
      localStorage.removeItem(LAST_BOOK_KEY);
    });
  }, [repo]);

  useEffect(() => {
    if (!book) return;
    localStorage.setItem(lastPositionKey(book.id), JSON.stringify({ surface, chapterId }));
  }, [book?.id, surface, chapterId]);

  useEffect(() => {
    let cancelled = false;
    void listEngineModels(engine, baseUrl)
      .then((names) => {
        if (cancelled) return;
        setModels(names);
        setOllamaError(null);
        const preferred = localStorage.getItem(MODEL_KEY) ?? DEFAULT_OLLAMA_MODEL;
        const picked = pickListedOllamaModel(preferred, names);
        if (picked) {
          setModelState(picked);
          localStorage.setItem(MODEL_KEY, picked);
          setWritingPrimerState(readWritingPrimer(picked));
        }
        const reviewPreferred = localStorage.getItem(REVIEW_MODEL_KEY) ?? DEFAULT_REVIEW_MODEL;
        const reviewPicked = pickListedReviewModel(reviewPreferred, names);
        if (reviewPicked) {
          setReviewModelState(reviewPicked);
          localStorage.setItem(REVIEW_MODEL_KEY, reviewPicked);
        }
      })
      .catch((err) => {
        if (cancelled) return;
        setModels([]);
        setOllamaError(ollamaHint(err));
      });
    return () => {
      cancelled = true;
    };
  }, [engine, baseUrl]);

  const flushSave = useCallback(async (next: Book) => {
    if (saveTimer.current !== null) {
      window.clearTimeout(saveTimer.current);
      saveTimer.current = null;
    }
    bookRef.current = next;
    setBook(next);
    await persist(next);
  }, [persist]);

  const persistProseWrite = useCallback(
    async (
      latest: Book,
      id: string,
      assembled: string,
      op: ProseHistoryOp,
      before: string,
      formatting?: ProseFormattingRange[],
      placeholders?: Placeholder[],
      darlings?: Darling[]
    ) => {
      let next = latest;
      if (before !== assembled) {
        next = recordProseRevision(next, id, op, before, historyLimitRef.current);
      }
      await flushSave(
        updateChapter(next, id, {
          prose: assembled,
          ...(formatting ? { formatting } : {}),
          ...(placeholders ? { placeholders } : {}),
          ...(darlings ? { darlings } : {})
        })
      );
    },
    [flushSave]
  );

  const convertMarkersToFormatting = useCallback(
    async (rules: MarkerConversionRule[]) => {
      const current = bookRef.current;
      if (!current) return { totalConversions: 0, chaptersChanged: 0 };
      let next = current;
      let totalConversions = 0;
      let chaptersChanged = 0;
      for (const chapter of current.chapters) {
        const result = applyMarkerConversion(
          chapter.prose,
          chapter.formatting ?? [],
          rules,
          chapter.placeholders ?? [],
          chapter.darlings ?? []
        );
        if (result.count === 0) continue;
        totalConversions += result.count;
        chaptersChanged += 1;
        next = recordProseRevision(next, chapter.id, "format", chapter.prose, historyLimitRef.current);
        next = updateChapter(next, chapter.id, {
          prose: result.prose,
          formatting: result.formatting,
          placeholders: result.placeholders,
          darlings: result.darlings
        });
      }
      if (chaptersChanged > 0) await flushSave(next);
      return { totalConversions, chaptersChanged };
    },
    [flushSave]
  );

  const patchBook = useCallback(
    async (mutate: (current: Book) => Book) => {
      const current = bookRef.current;
      if (!current) return;
      const mutated = mutate(current);
      if (mutated === current) return;
      const next = touch(mutated, {
        title: mutated.title.trim() || "Untitled manuscript"
      });
      bookRef.current = next;
      setBook(next);
      if (saveTimer.current !== null) window.clearTimeout(saveTimer.current);
      saveTimer.current = window.setTimeout(() => {
        void persist(next);
        saveTimer.current = null;
      }, 400);
    },
    [persist]
  );

  const openBook = useCallback(
    async (id: string) => {
      const loaded = await repo.get(id);
      const remembered = readLastPosition(loaded);
      withViewTransition(() => {
        setBook(loaded);
        setChapterIdState(remembered?.chapterId ?? sortedChapters(loaded)[0]?.id ?? null);
        setSurface(remembered?.surface ?? openingSurface(loaded));
        setChapterFeedback(null);
      });
      localStorage.setItem(LAST_BOOK_KEY, id);
      setError(null);
    },
    [repo]
  );

  const closeBook = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setBusy(null);
    if (saveTimer.current !== null) {
      window.clearTimeout(saveTimer.current);
      saveTimer.current = null;
    }
    const current = bookRef.current;
    if (current) void persist(current);
    withViewTransition(() => {
      setBook(null);
      setChapterIdState(null);
      setSurface("brainstorm");
      setChapterFeedback(null);
    });
    localStorage.removeItem(LAST_BOOK_KEY);
    void refresh();
  }, [persist, refresh]);

  const newBook = useCallback(
    async (title: string) => {
      const created = createBook(title);
      await repo.save(created);
      setSummaries(await repo.list());
      withViewTransition(() => {
        setBook(created);
        setChapterIdState(sortedChapters(created)[0]?.id ?? null);
        setSurface(openingSurface(created));
        setChapterFeedback(null);
      });
      localStorage.setItem(LAST_BOOK_KEY, created.id);
      setError(null);
    },
    [repo]
  );

  const importManuscript = useCallback(
    async (file: File) => {
      let parsed: unknown;
      try {
        parsed = JSON.parse(await file.text()) as unknown;
      } catch {
        setError(STORE_ERROR.notJson);
        return;
      }
      let backup;
      try {
        backup = parseManuscriptBackup(parsed);
      } catch (err) {
        setError(err instanceof ManuscriptBackupError ? err.code : STORE_ERROR.backupUnreadable);
        return;
      }
      let exists = false;
      try {
        await repo.get(backup.book.id);
        exists = true;
      } catch (err) {
        if (!(err instanceof BookNotFoundError)) {
          setError(err instanceof Error ? err.message : STORE_ERROR.shelfUnreadable);
          return;
        }
      }
      if (exists && !window.confirm(format(getMessages().home.replaceConfirm, { title: backup.book.title }))) return;
      const current = bookRef.current;
      if (current && current.id !== backup.book.id) {
        if (saveTimer.current !== null) {
          window.clearTimeout(saveTimer.current);
          saveTimer.current = null;
        }
        await persist(current);
      }
      abortRef.current?.abort();
      abortRef.current = null;
      setBusy(null);
      await repo.save(backup.book);
      setSummaries(await repo.list());
      const remembered = readLastPosition(backup.book);
      withViewTransition(() => {
        setBook(backup.book);
        setChapterIdState(remembered?.chapterId ?? sortedChapters(backup.book)[0]?.id ?? null);
        setSurface(remembered?.surface ?? openingSurface(backup.book));
        setChapterFeedback(null);
      });
      localStorage.setItem(LAST_BOOK_KEY, backup.book.id);
      recordLastJsonBackup(backup.book.id, new Date().toISOString());
      setError(null);
    },
    [persist, repo]
  );

  const deleteBook = useCallback(
    async (id: string) => {
      await repo.delete(id);
      forgetLastJsonBackup(id);
      localStorage.removeItem(lastPositionKey(id));
      if (bookRef.current?.id === id) {
        withViewTransition(() => {
          setBook(null);
          setChapterIdState(null);
          setSurface("brainstorm");
          setChapterFeedback(null);
        });
      }
      await refresh();
    },
    [refresh, repo]
  );

  const setModel = useCallback((name: string) => {
    setModelState(name);
    localStorage.setItem(MODEL_KEY, name);
    setWritingPrimerState(readWritingPrimer(name));
  }, []);

  const setWritingPrimer = useCallback((text: string) => {
    setWritingPrimerState(text);
    writeWritingPrimer(model, text);
  }, [model]);

  const resetWritingPrimer = useCallback(() => {
    clearWritingPrimer(model);
    setWritingPrimerState(readWritingPrimer(model));
  }, [model]);

  const setReviewModel = useCallback((name: string) => {
    setReviewModelState(name);
    localStorage.setItem(REVIEW_MODEL_KEY, name);
  }, []);

  const setEngine = useCallback((next: LlmEngine) => {
    setEngineState(next);
    localStorage.setItem(ENGINE_KEY, next);
    if (next === "openai-compatible" && !localStorage.getItem(BASE_URL_KEY)) {
      setBaseUrlState(DEFAULT_OPENAI_COMPATIBLE_BASE_URL);
      localStorage.setItem(BASE_URL_KEY, DEFAULT_OPENAI_COMPATIBLE_BASE_URL);
    }
  }, []);

  const setBaseUrl = useCallback((url: string) => {
    setBaseUrlState(url);
    localStorage.setItem(BASE_URL_KEY, url);
  }, []);

  const setContextWindow = useCallback((n: number) => {
    writeContextWindow(n);
    setContextWindowState(readContextWindow());
  }, []);

  /**
   * Pre-fills the context-window field from the connected model's own
   * reported maximum (Ollama only — an OpenAI-compatible server's context
   * length is set when the author loads the model there, not per request,
   * so there is nothing equivalent to ask it for here). Returns the value
   * on success so Settings can show what it found; null on failure or when
   * Ollama doesn't report one, so Settings can say so rather than silently
   * doing nothing.
   */
  const suggestContextWindow = useCallback(async (): Promise<number | null> => {
    if (engineRef.current !== "ollama") return null;
    try {
      const found = await getOllamaModelContextLength({ model });
      if (found === undefined) return null;
      setContextWindow(found);
      return found;
    } catch {
      return null;
    }
  }, [model, setContextWindow]);

  const setHistoryLimit = useCallback((n: number) => {
    const next = Number.isFinite(n) ? n : readProseHistoryLimit();
    writeProseHistoryLimit(next);
    setHistoryLimitState(readProseHistoryLimit());
  }, []);

  const setChapterId = useCallback((id: string) => {
    withViewTransition(() => {
      setChapterIdState(id);
      setSurface("chapter");
    }, 160);
  }, []);

  const selectChapter = useCallback((id: string) => {
    setChapterIdState(id);
  }, []);

  const showSettings = useCallback(() => {
    withViewTransition(() => setSurface("settings"), 160);
  }, []);

  const showBrainstorm = useCallback(() => {
    withViewTransition(() => setSurface("brainstorm"), 160);
  }, []);

  const showSynopsis = useCallback(() => {
    withViewTransition(() => setSurface("synopsis"), 160);
  }, []);

  const showAsk = useCallback(() => {
    withViewTransition(() => setSurface("ask"), 160);
  }, []);

  const showTimeline = useCallback(() => {
    withViewTransition(() => setSurface("timeline"), 160);
  }, []);

  const showPlotlines = useCallback(() => {
    withViewTransition(() => setSurface("plotlines"), 160);
  }, []);

  const showMethod = useCallback(() => {
    withViewTransition(() => setSurface("method"), 160);
  }, []);

  const showGuide = useCallback(() => {
    withViewTransition(() => setSurface("guide"), 160);
  }, []);

  const showHandbook = useCallback(() => {
    withViewTransition(() => setSurface("handbook"), 160);
  }, []);

  const dismissModelAside = useCallback(() => setModelAsides([]), []);

  const manuscriptFromModel = (raw: string, fallback: string) => {
    const { prose, asides } = peelModelAsides(raw);
    if (asides.length > 0) setModelAsides(asides);
    return prose.trim() ? prose : fallback;
  };

  /**
   * Records exactly what's about to be sent to the model, for the AI Context Inspector.
   * Called right before the request goes out, so it captures intent even if the
   * request itself later fails or is aborted.
   */
  const recordPrompt = useCallback(
    (operation: PromptOperation, model: string, messages: PromptDebugMessage[], target?: PromptDebugTarget) => {
      setLastPrompt({ operation, model, messages, at: nowIso(), ...(target ? { target } : {}) });
    },
    []
  );

  /**
   * Attaches the model's raw reply to whichever entry recordPrompt most
   * recently opened, so the AI Context Inspector can show not just what was
   * sent but what actually came back. Currently wired only into fact
   * extraction (Interview and chapter) — the one place a tester needed to
   * see the raw response to tell a formatting failure from a genuine "found
   * nothing," rather than guessing blind from a symptom relayed in chat.
   */
  const recordPromptResponse = useCallback((response: string) => {
    setLastPrompt((prev) => (prev ? { ...prev, response } : prev));
  }, []);

  const draftChapter = useCallback(async () => {
    const current = bookRef.current;
    const id = chapterRef.current;
    if (!current || !id || busy) return;
    const chapter = current.chapters.find((item) => item.id === id);
    if (!chapter) return;
    if (models.length === 0) {
      setError(ollamaError ?? STORE_ERROR.noModel);
      return;
    }

    abortRef.current?.abort();
    const abort = new AbortController();
    abortRef.current = abort;
    setBusy("draft");
    setError(null);
    setModelAsides([]);

    const provider = makeProvider(model);
    const before = chapter.prose;
    const beforeFormatting = chapter.formatting ?? [];
    const beforePlaceholders = chapter.placeholders ?? [];
    const beforeDarlings = chapter.darlings ?? [];
    // Draft appends after whatever is already there — the kept prefix's
    // characters don't move, so their formatting survives untouched; only
    // the freshly generated tail (from here on) has none of its own.
    const insertionPoint = before.replace(/\s+$/, "").length;
    let assembled = chapter.prose;
    const prefix = assembled.trim() ? `${assembled.replace(/\s+$/, "")}\n\n` : "";
    assembled = prefix;
    let raw = "";

    const draftFormatting = () => shiftFormattingRanges(beforeFormatting, insertionPoint, insertionPoint, assembled.length - insertionPoint);
    const draftPlaceholders = () => shiftPlaceholders(beforePlaceholders, insertionPoint, insertionPoint, assembled.length - insertionPoint);
    const draftDarlings = () => shiftDarlings(beforeDarlings, insertionPoint, insertionPoint, assembled.length - insertionPoint);

    try {
      await patchBook((book) => updateChapter(book, id, { prose: assembled }));
      const draftMessages: PromptDebugMessage[] = [
        { role: "system", content: writingSystem(DRAFT_SYSTEM) },
        { role: "user", content: draftUserPrompt(current, chapter) }
      ];
      recordPrompt("draft", model, draftMessages);
      for await (const chunk of provider.streamChat({
        messages: draftMessages,
        temperature: 0.85,
        maxTokens: 900,
        signal: abort.signal
      })) {
        if (chunk.type === "text_delta") {
          raw += chunk.text;
          assembled = prefix + manuscriptFromModel(raw, "");
          setBook((prev) =>
            prev
              ? updateChapter(prev, id, {
                  prose: assembled,
                  formatting: draftFormatting(),
                  placeholders: draftPlaceholders(),
                  darlings: draftDarlings()
                })
              : prev
          );
        } else if (chunk.type === "error") {
          throw new Error(chunk.message);
        }
      }
      const latest = bookRef.current;
      if (latest) await persistProseWrite(latest, id, assembled, "draft", before, draftFormatting(), draftPlaceholders(), draftDarlings());
    } catch (err) {
      if ((err as { name?: string }).name === "AbortError") {
        const latest = bookRef.current;
        if (latest)
          await persistProseWrite(latest, id, assembled, "draft", before, draftFormatting(), draftPlaceholders(), draftDarlings());
      } else {
        setError(ollamaHint(err));
      }
    } finally {
      setBusy(null);
      abortRef.current = null;
    }
  }, [busy, flushSave, model, models.length, ollamaError, patchBook, persistProseWrite]);

  const recastChapter = useCallback(async () => {
    const current = bookRef.current;
    const id = chapterRef.current;
    if (!current || !id || busy) return;
    const chapter = current.chapters.find((item) => item.id === id);
    if (!chapter?.prose.trim()) {
      setError(STORE_ERROR.recastEmpty);
      return;
    }
    if (models.length === 0) {
      setError(ollamaError ?? STORE_ERROR.noModel);
      return;
    }

    abortRef.current?.abort();
    const abort = new AbortController();
    abortRef.current = abort;
    setBusy("recast");
    setError(null);
    setModelAsides([]);

    const original = chapter.prose;
    // Recast regenerates the whole chapter from scratch — old formatting
    // positions no longer line up with the new prose, so they're cleared
    // rather than shifted. If the model produces nothing and the chapter
    // falls back to its original text, the original formatting comes back
    // with it.
    const originalFormatting = chapter.formatting ?? [];
    const originalPlaceholders = chapter.placeholders ?? [];
    // Darlings hold real authored text, not just a position — unlike
    // formatting/placeholders they're kept (not cleared) through a wholesale
    // regenerate, and simply clamped to the new prose's length on restore.
    const originalDarlings = chapter.darlings ?? [];
    let assembled = "";
    let raw = "";

    try {
      const provider = makeProvider(model);
      const recastMessages: PromptDebugMessage[] = [
        { role: "system", content: writingSystem(RECAST_SYSTEM) },
        { role: "user", content: recastUserPrompt(current, chapter) }
      ];
      recordPrompt("recast", model, recastMessages);
      for await (const chunk of provider.streamChat({
        messages: recastMessages,
        temperature: 0.5,
        maxTokens: 1600,
        signal: abort.signal
      })) {
        if (chunk.type === "text_delta") {
          raw += chunk.text;
          assembled = manuscriptFromModel(raw, "");
          const finished = assembled.trim() ? assembled : original;
          setBook((prev) =>
            prev
              ? updateChapter(prev, id, {
                  prose: finished,
                  formatting: assembled.trim() ? [] : originalFormatting,
                  placeholders: assembled.trim() ? [] : originalPlaceholders,
                  darlings: originalDarlings
                })
              : prev
          );
        } else if (chunk.type === "error") {
          throw new Error(chunk.message);
        }
      }
      const latest = bookRef.current;
      if (latest) {
        const finished = assembled.trim() ? assembled : original;
        await persistProseWrite(
          latest,
          id,
          finished,
          "recast",
          original,
          assembled.trim() ? [] : originalFormatting,
          assembled.trim() ? [] : originalPlaceholders,
          originalDarlings
        );
      }
    } catch (err) {
      if ((err as { name?: string }).name === "AbortError") {
        const latest = bookRef.current;
        if (latest) {
          const finished = assembled.trim() ? assembled : original;
          await persistProseWrite(
            latest,
            id,
            finished,
            "recast",
            original,
            assembled.trim() ? [] : originalFormatting,
            assembled.trim() ? [] : originalPlaceholders,
            originalDarlings
          );
        }
      } else {
        setError(ollamaHint(err));
        const latest = bookRef.current;
        if (latest)
          await flushSave(
            updateChapter(latest, id, {
              prose: original,
              formatting: originalFormatting,
              placeholders: originalPlaceholders,
              darlings: originalDarlings
            })
          );
      }
    } finally {
      setBusy(null);
      abortRef.current = null;
    }
  }, [busy, flushSave, model, models.length, ollamaError, persistProseWrite]);

  const draftScene = useCallback(
    async (sceneId: string) => {
      const current = bookRef.current;
      const id = chapterRef.current;
      if (!current || !id || busy) return;
      const chapter = current.chapters.find((item) => item.id === id);
      const scene = chapter ? chapterScenes(chapter).find((item) => item.id === sceneId) : undefined;
      if (!chapter || !scene) return;
      if (models.length === 0) {
        setError(ollamaError ?? STORE_ERROR.noModel);
        return;
      }

      abortRef.current?.abort();
      const abort = new AbortController();
      abortRef.current = abort;
      setBusy("draft");
      setError(null);
      setModelAsides([]);

      const provider = makeProvider(model);
      const before = chapter.prose;
      const prefix = scene.prose.trim() ? `${scene.prose.replace(/\s+$/, "")}\n\n` : "";
      let raw = "";

      // Scene-level Draft/Recast splice a chunk into the middle of
      // `chapter.prose`; shifting formatting precisely for just the
      // affected scene isn't done yet, so the whole chapter's formatting is
      // cleared rather than risk stale ranges landing on the wrong words.
      const finish = async (sceneAssembled: string) => {
        const spliced = replaceSceneProse(chapter, sceneId, sceneAssembled);
        const latest = bookRef.current ?? current;
        await persistProseWrite(updateChapter(latest, id, { scenes: spliced.scenes }), id, spliced.prose, "draft", before, [], []);
      };

      try {
        const draftMessages: PromptDebugMessage[] = [
          { role: "system", content: writingSystem(DRAFT_SYSTEM) },
          { role: "user", content: draftSceneUserPrompt(current, chapter, sceneId) }
        ];
        recordPrompt("draft", model, draftMessages);
        for await (const chunk of provider.streamChat({
          messages: draftMessages,
          temperature: 0.85,
          maxTokens: 900,
          signal: abort.signal
        })) {
          if (chunk.type === "text_delta") {
            raw += chunk.text;
            const sceneAssembled = prefix + manuscriptFromModel(raw, "");
            const spliced = replaceSceneProse(chapter, sceneId, sceneAssembled);
            setBook((prev) =>
              prev ? updateChapter(prev, id, { prose: spliced.prose, scenes: spliced.scenes, formatting: [], placeholders: [] }) : prev
            );
          } else if (chunk.type === "error") {
            throw new Error(chunk.message);
          }
        }
        await finish(prefix + manuscriptFromModel(raw, ""));
      } catch (err) {
        if ((err as { name?: string }).name === "AbortError") {
          await finish(prefix + manuscriptFromModel(raw, ""));
        } else {
          setError(ollamaHint(err));
        }
      } finally {
        setBusy(null);
        abortRef.current = null;
      }
    },
    [busy, model, models.length, ollamaError, persistProseWrite]
  );

  const recastScene = useCallback(
    async (sceneId: string) => {
      const current = bookRef.current;
      const id = chapterRef.current;
      if (!current || !id || busy) return;
      const chapter = current.chapters.find((item) => item.id === id);
      const scene = chapter ? chapterScenes(chapter).find((item) => item.id === sceneId) : undefined;
      if (!chapter || !scene?.prose.trim()) {
        setError(STORE_ERROR.recastEmpty);
        return;
      }
      if (models.length === 0) {
        setError(ollamaError ?? STORE_ERROR.noModel);
        return;
      }

      abortRef.current?.abort();
      const abort = new AbortController();
      abortRef.current = abort;
      setBusy("recast");
      setError(null);
      setModelAsides([]);

      const before = chapter.prose;
      const originalScene = scene.prose;
      // Same reasoning as draftScene: no precise per-scene shift yet, so a
      // real recast clears the chapter's formatting; falling all the way
      // back to the original scene text keeps the original formatting too.
      const originalFormatting = chapter.formatting ?? [];
      const originalPlaceholders = chapter.placeholders ?? [];
      let raw = "";

      const finish = async (sceneAssembled: string) => {
        const finalScene = sceneAssembled.trim() ? sceneAssembled : originalScene;
        const spliced = replaceSceneProse(chapter, sceneId, finalScene);
        const latest = bookRef.current ?? current;
        await persistProseWrite(
          updateChapter(latest, id, { scenes: spliced.scenes }),
          id,
          spliced.prose,
          "recast",
          before,
          sceneAssembled.trim() ? [] : originalFormatting,
          sceneAssembled.trim() ? [] : originalPlaceholders
        );
      };

      try {
        const provider = makeProvider(model);
        const recastMessages: PromptDebugMessage[] = [
          { role: "system", content: writingSystem(RECAST_SYSTEM) },
          { role: "user", content: recastSceneUserPrompt(current, chapter, sceneId) }
        ];
        recordPrompt("recast", model, recastMessages);
        let assembled = "";
        for await (const chunk of provider.streamChat({
          messages: recastMessages,
          temperature: 0.5,
          maxTokens: 1600,
          signal: abort.signal
        })) {
          if (chunk.type === "text_delta") {
            raw += chunk.text;
            assembled = manuscriptFromModel(raw, "");
            const spliced = replaceSceneProse(chapter, sceneId, assembled.trim() ? assembled : originalScene);
            setBook((prev) =>
              prev
                ? updateChapter(prev, id, {
                    prose: spliced.prose,
                    scenes: spliced.scenes,
                    formatting: assembled.trim() ? [] : originalFormatting,
                    placeholders: assembled.trim() ? [] : originalPlaceholders
                  })
                : prev
            );
          } else if (chunk.type === "error") {
            throw new Error(chunk.message);
          }
        }
        await finish(assembled);
      } catch (err) {
        if ((err as { name?: string }).name === "AbortError") {
          await finish(manuscriptFromModel(raw, ""));
        } else {
          setError(ollamaHint(err));
          const spliced = replaceSceneProse(chapter, sceneId, originalScene);
          const latest = bookRef.current ?? current;
          await flushSave(
            updateChapter(latest, id, {
              prose: spliced.prose,
              scenes: spliced.scenes,
              formatting: originalFormatting,
              placeholders: originalPlaceholders
            })
          );
        }
      } finally {
        setBusy(null);
        abortRef.current = null;
      }
    },
    [busy, flushSave, model, models.length, ollamaError, persistProseWrite]
  );

  const analyzeScene = useCallback(
    async (sceneId: string) => {
      const current = bookRef.current;
      const id = chapterRef.current;
      if (!current || !id || busy) return false;
      const chapter = current.chapters.find((item) => item.id === id);
      const scene = chapter ? chapterScenes(chapter).find((item) => item.id === sceneId) : undefined;
      if (!chapter || !scene?.prose.trim()) {
        setError(STORE_ERROR.analyzeEmpty);
        return false;
      }
      if (models.length === 0) {
        setError(ollamaError ?? STORE_ERROR.noModel);
        return false;
      }

      abortRef.current?.abort();
      const abort = new AbortController();
      abortRef.current = abort;
      setBusy("analyze");
      setError(null);
      try {
        const analyzeMessages: PromptDebugMessage[] = [
          { role: "system", content: ANALYZE_SYSTEM },
          { role: "user", content: analyzeSceneUserPrompt(current, chapter, sceneId) }
        ];
        recordPrompt("analyze", reviewModel, analyzeMessages);
        const raw = await makeProvider(reviewModel).chat({
          messages: analyzeMessages,
          temperature: 0.25,
          maxTokens: 1800,
          signal: abort.signal
        });
        const items = parseChapterFeedback(raw, scene.prose, {
          voice: resolveVoice(current, chapter),
          ...(kidlitReader(resolveReader(current, chapter)) ? { kidlit: true } : {})
        }).map((item) => ({
          ...item,
          paragraphIndex: item.paragraphIndex === null ? null : item.paragraphIndex + scene.startParagraph
        }));
        setChapterFeedback({ chapterId: id, items });
        return true;
      } catch (err) {
        if ((err as { name?: string }).name === "AbortError") return false;
        setError(ollamaHint(err));
        return false;
      } finally {
        setBusy(null);
        abortRef.current = null;
      }
    },
    [busy, reviewModel, models.length, ollamaError]
  );

  const mergeScene = useCallback(
    (sceneId: string) => {
      const id = chapterRef.current;
      if (!id) return;
      void patchBook((current) => {
        const chapter = current.chapters.find((item) => item.id === id);
        if (!chapter) return current;
        const removedId = sceneIdRemovedByMerge(chapter, sceneId);
        const withChapter = updateChapter(current, id, { scenes: mergeSceneWithNext(chapter, sceneId) });
        if (!removedId) return withChapter;
        return {
          ...withChapter,
          facts: withChapter.facts.map((fact) => (fact.scene_id === removedId ? { ...fact, scene_id: sceneId } : fact))
        };
      });
    },
    [patchBook]
  );

  const rewriteSpan = useCallback(
    async (args: {
      target: "prose" | "synopsis" | "brainstorm";
      mode: "extend" | "elaborate" | "instruct" | "beat";
      span: TextSpan;
      instruction?: string;
    }) => {
      const current = bookRef.current;
      const id = chapterRef.current;
      if (!current || busy) return;
      if (args.target === "prose" && !id) return;
      if (models.length === 0) {
        setError(ollamaError ?? STORE_ERROR.noModel);
        return;
      }

      const chapter = id ? current.chapters.find((item) => item.id === id) : undefined;
      if (args.target === "prose" && !chapter) return;
      const source =
        args.target === "synopsis"
          ? current.synopsis
          : args.target === "brainstorm"
            ? current.brainstorm
            : chapter?.prose;
      if (source === undefined) return;
      const around = surroundingPassage(source, args.span);
      if (args.mode !== "beat" && !around.selected) return;
      if ((args.mode === "instruct" || args.mode === "beat") && !(args.instruction ?? "").trim()) return;

      abortRef.current?.abort();
      const abort = new AbortController();
      abortRef.current = abort;
      setBusy(args.mode);
      setError(null);
      if (args.target !== "brainstorm") setModelAsides([]);

      let generated = "";

      // Extend/Beat insert after the span without touching its own text
      // (applyExtend), so the "edit" for formatting purposes is a
      // zero-width insertion at its end; Elaborate/Instruct replace the
      // whole span (applyReplace) — matches `assemble()` below exactly, so
      // shifted ranges land where the actual edit happened.
      const { start: spanStart, end: spanEnd } = normalizeSpan(args.span.start, args.span.end);
      const isInsertion = args.mode === "extend" || args.mode === "beat";
      const editStart = isInsertion ? spanEnd : spanStart;
      const editEnd = spanEnd;
      const sourceFormatting = args.target === "prose" ? (chapter?.formatting ?? []) : [];
      const formattingFor = (next: string) =>
        shiftFormattingRanges(sourceFormatting, editStart, editEnd, next.length - source.length + (editEnd - editStart));
      const sourcePlaceholders = args.target === "prose" ? (chapter?.placeholders ?? []) : [];
      const placeholdersFor = (next: string) =>
        shiftPlaceholders(sourcePlaceholders, editStart, editEnd, next.length - source.length + (editEnd - editStart));
      const sourceDarlings = args.target === "prose" ? (chapter?.darlings ?? []) : [];
      const darlingsFor = (next: string) =>
        shiftDarlings(sourceDarlings, editStart, editEnd, next.length - source.length + (editEnd - editStart));

      const write = (next: string) => {
        if (args.target === "synopsis") {
          setBook((prev) => (prev ? { ...prev, synopsis: next } : prev));
          return;
        }
        if (args.target === "brainstorm") {
          setBook((prev) => (prev ? applyAssembledBrainstorm(prev, next) : prev));
          return;
        }
        setBook((prev) =>
          prev && id
            ? updateChapter(prev, id, {
                prose: next,
                formatting: formattingFor(next),
                placeholders: placeholdersFor(next),
                darlings: darlingsFor(next)
              })
            : prev
        );
      };

      const assemble = () => {
        const chunk =
          args.target === "brainstorm"
            ? generated
            : manuscriptFromModel(generated, args.mode === "extend" ? "" : around.selected);
        return args.mode === "extend" || args.mode === "beat"
          ? applyExtend(source, args.span, chunk)
          : applyReplace(source, args.span, chunk);
      };

      const persistAssembled = async (latest: Book, assembled: string) => {
        if (args.target === "synopsis") await flushSave(touch(latest, { synopsis: assembled }));
        else if (args.target === "brainstorm") {
          const patched = applyAssembledBrainstorm(latest, assembled);
          await flushSave(touch(latest, { brainstorm: patched.brainstorm, brainstorm_notes: patched.brainstorm_notes }));
        }
        else if (id) {
          await persistProseWrite(
            latest,
            id,
            assembled,
            rewriteHistoryOp(args.mode),
            source,
            formattingFor(assembled),
            placeholdersFor(assembled),
            darlingsFor(assembled)
          );
        }
      };

      const userContent =
        args.target === "brainstorm"
          ? brainstormPassageUserPrompt({
              book: current,
              mode: args.mode,
              before: around.before,
              selected: around.selected,
              after: around.after,
              ...(args.instruction ? { instruction: args.instruction } : {})
            })
          : passageUserPrompt({
              book: current,
              chapter: args.target === "prose" ? chapter ?? null : null,
              mode: args.mode,
              before: around.before,
              selected: around.selected,
              after: around.after,
              ...(args.instruction ? { instruction: args.instruction } : {})
            });

      try {
        const provider = makeProvider(model);
        const rewriteMessages: PromptDebugMessage[] = [
          { role: "system", content: writingSystem(args.target === "brainstorm" ? BRAINSTORM_PASSAGE_SYSTEM : PASSAGE_SYSTEM) },
          { role: "user", content: userContent }
        ];
        recordPrompt(args.mode, model, rewriteMessages, args.target);
        for await (const chunk of provider.streamChat({
          messages: rewriteMessages,
          temperature: args.target === "brainstorm" ? 0.9 : 0.8,
          maxTokens: args.mode === "extend" || args.mode === "beat" ? 280 : 420,
          signal: abort.signal
        })) {
          if (chunk.type === "text_delta") {
            generated += chunk.text;
            write(assemble());
          } else if (chunk.type === "error") {
            throw new Error(chunk.message);
          }
        }
        const latest = bookRef.current;
        if (!latest) return;
        await persistAssembled(latest, assemble());
      } catch (err) {
        if ((err as { name?: string }).name === "AbortError") {
          const latest = bookRef.current;
          if (!latest) return;
          await persistAssembled(latest, assemble());
        } else {
          setError(ollamaHint(err));
        }
      } finally {
        setBusy(null);
        abortRef.current = null;
      }
    },
    [busy, flushSave, model, models.length, ollamaError, persistProseWrite]
  );

  const restoreChapterProse = useCallback(
    async (revisionId: string) => {
      const current = bookRef.current;
      const id = chapterRef.current;
      if (!current || !id || busy) return;
      await flushSave(restoreProseRevision(current, id, revisionId, historyLimitRef.current));
    },
    [busy, flushSave]
  );

  const cutChapterDarling = useCallback(
    async (span: TextSpan) => {
      const current = bookRef.current;
      const id = chapterRef.current;
      if (!current || !id || busy) return;
      const chapter = current.chapters.find((item) => item.id === id);
      if (!chapter) return;
      const before = chapter.prose;
      const result = cutToDarling(before, span, chapter.darlings ?? []);
      const next = recordProseRevision(current, id, "darling", before, historyLimitRef.current);
      await flushSave(updateChapter(next, id, { prose: result.prose, darlings: result.darlings }));
    },
    [busy, flushSave]
  );

  const restoreChapterDarling = useCallback(
    async (chapterId: string, darlingId: string) => {
      const current = bookRef.current;
      if (!current || busy) return;
      const chapter = current.chapters.find((item) => item.id === chapterId);
      if (!chapter) return;
      const before = chapter.prose;
      const result = restoreDarling(before, chapter.darlings ?? [], darlingId);
      if (!result) return;
      const next = recordProseRevision(current, chapterId, "darling", before, historyLimitRef.current);
      await flushSave(updateChapter(next, chapterId, { prose: result.prose, darlings: result.darlings }));
    },
    [busy, flushSave]
  );

  const discardChapterDarling = useCallback(
    async (chapterId: string, darlingId: string) => {
      const current = bookRef.current;
      if (!current) return;
      const chapter = current.chapters.find((item) => item.id === chapterId);
      if (!chapter) return;
      await flushSave(updateChapter(current, chapterId, { darlings: discardDarling(chapter.darlings ?? [], darlingId) }));
    },
    [flushSave]
  );

  const startBrainstormChat = useCallback(() => {
    setBrainstormChatHistory([]);
  }, []);

  const closeBrainstormChat = useCallback(() => {
    setBrainstormChatHistory([]);
  }, []);

  const askBrainstormChat = useCallback(
    async (message: string) => {
      const current = bookRef.current;
      const trimmed = message.trim();
      if (!current || !trimmed) return;
      if (busy) {
        setError(STORE_ERROR.busy);
        return;
      }
      if (models.length === 0) {
        setError(ollamaError ?? STORE_ERROR.noModel);
        return;
      }

      const priorTurns = brainstormChatHistory;
      const userTurn: BrainstormChatMessage = { role: "user", content: trimmed };
      setBrainstormChatHistory([...priorTurns, userTurn]);

      abortRef.current?.abort();
      const abort = new AbortController();
      abortRef.current = abort;
      setBusy("brainstorm-chat");
      setError(null);
      const requestTimeout = withRequestTimeout(abort);

      try {
        const provider = makeProvider(model);
        const askMessages: PromptDebugMessage[] = [
          { role: "system", content: writingSystem(brainstormChatSystemPrompt(current)) },
          ...priorTurns,
          userTurn
        ];
        recordPrompt("brainstorm-chat", model, askMessages);
        let raw = "";
        for await (const chunk of provider.streamChat({
          messages: askMessages,
          temperature: 0.9,
          maxTokens: 500,
          signal: abort.signal
        })) {
          if (chunk.type === "text_delta") {
            raw += chunk.text;
            setBrainstormChatHistory([...priorTurns, userTurn, { role: "assistant", content: raw }]);
          } else if (chunk.type === "error") {
            throw new Error(chunk.message);
          }
        }
        setBrainstormChatHistory([...priorTurns, userTurn, { role: "assistant", content: raw.trim() }]);
      } catch (err) {
        if ((err as { name?: string }).name === "AbortError") {
          if (requestTimeout.timedOut()) setError(STORE_ERROR.timeout);
          return;
        }
        setError(ollamaHint(err));
      } finally {
        requestTimeout.clear();
        setBusy(null);
        abortRef.current = null;
      }
    },
    [brainstormChatHistory, busy, model, models.length, ollamaError, recordPrompt]
  );

  const liftToSynopsis = useCallback(
    async (fragment: string) => {
      const current = bookRef.current;
      if (!current) return;
      const next = liftFragmentToSynopsis(current.synopsis, fragment);
      if (next === current.synopsis) return;
      await flushSave(touch(current, { synopsis: next }));
    },
    [flushSave]
  );

  const sendBrainstormToSynopsis = useCallback(async () => {
    const current = bookRef.current;
    if (!current) return;
    const next = sendStagedNotesToSynopsis(current);
    if (next !== current) {
      await flushSave(
        touch(current, {
          synopsis: next.synopsis,
          brainstorm: next.brainstorm,
          brainstorm_notes: next.brainstorm_notes
        })
      );
    }
    setSurface("synopsis");
  }, [flushSave]);

  const suggestAlternatives = useCallback(
    async (args: {
      word: string;
      sentence: string;
      before?: string;
      after?: string;
      signal?: AbortSignal;
    }) => {
      if (models.length === 0) {
        const message = ollamaError ?? STORE_ERROR.noModel;
        setError(message);
        throw new Error(message);
      }
      try {
        const alternativesMessages: PromptDebugMessage[] = [
          { role: "system", content: ALTERNATIVES_SYSTEM },
          {
            role: "user",
            content: alternativesUserPrompt(
              args.word,
              args.sentence,
              bookRef.current ? activeVoice(bookRef.current, surfaceRef.current, chapterRef.current) : "",
              {
                ...(args.before ? { before: args.before } : {}),
                ...(args.after ? { after: args.after } : {})
              },
              bookRef.current ? activeReader(bookRef.current, surfaceRef.current, chapterRef.current) : undefined
            )
          }
        ];
        recordPrompt("word-swap", reviewModel, alternativesMessages);
        const raw = await makeProvider(reviewModel).chat({
          messages: alternativesMessages,
          temperature: 0.3,
          maxTokens: 140,
          ...(args.signal ? { signal: args.signal } : {})
        });
        return dropWrongSense(args.word, args.sentence, parseAlternativeWords(raw, args.word));
      } catch (err) {
        if ((err as { name?: string }).name === "AbortError") throw err;
        setError(ollamaHint(err));
        throw err;
      }
    },
    [reviewModel, models.length, ollamaError]
  );

  const suggestSentenceSplit = useCallback(
    async (sentence: string, signal?: AbortSignal) => {
      if (models.length === 0) {
        const message = ollamaError ?? STORE_ERROR.noModel;
        setError(message);
        throw new Error(message);
      }
      try {
        const splitMessages: PromptDebugMessage[] = [
          { role: "system", content: SPLIT_SYSTEM },
          { role: "user", content: splitUserPrompt(sentence, bookRef.current ? activeVoice(bookRef.current, surfaceRef.current, chapterRef.current) : "", bookRef.current ? activeReader(bookRef.current, surfaceRef.current, chapterRef.current) : undefined) }
        ];
        recordPrompt("sentence-split", reviewModel, splitMessages);
        const raw = await makeProvider(reviewModel).chat({
          messages: splitMessages,
          temperature: 0.55,
          maxTokens: 280,
          ...(signal ? { signal } : {})
        });
        const split = parseSplitSuggestion(raw, sentence);
        if (!split) return "";
        return split;
      } catch (err) {
        if ((err as { name?: string }).name === "AbortError") throw err;
        setError(ollamaHint(err));
        throw err;
      }
    },
    [reviewModel, models.length, ollamaError]
  );

  const suggestParagraphBreak = useCallback(
    async (paragraph: string, signal?: AbortSignal) => {
      if (models.length === 0) {
        const message = ollamaError ?? STORE_ERROR.noModel;
        setError(message);
        throw new Error(message);
      }
      try {
        const breakMessages: PromptDebugMessage[] = [
          { role: "system", content: BREAK_SYSTEM },
          { role: "user", content: breakUserPrompt(paragraph, bookRef.current ? activeVoice(bookRef.current, surfaceRef.current, chapterRef.current) : "", bookRef.current ? activeReader(bookRef.current, surfaceRef.current, chapterRef.current) : undefined) }
        ];
        recordPrompt("paragraph-break", reviewModel, breakMessages);
        const raw = await makeProvider(reviewModel).chat({
          messages: breakMessages,
          temperature: 0.4,
          maxTokens: 700,
          ...(signal ? { signal } : {})
        });
        return parseParagraphBreak(raw, paragraph);
      } catch (err) {
        if ((err as { name?: string }).name === "AbortError") throw err;
        setError(ollamaHint(err));
        throw err;
      }
    },
    [reviewModel, models.length, ollamaError]
  );

  const stopDraft = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const extractChapter = useCallback(async () => {
    const current = bookRef.current;
    const id = chapterRef.current;
    if (!current || !id || busy) return;
    const chapter = current.chapters.find((item) => item.id === id);
    if (!chapter?.prose.trim()) {
      setError(STORE_ERROR.extractEmpty);
      return;
    }
    if (models.length === 0) {
      setError(ollamaError ?? STORE_ERROR.noModel);
      return;
    }
    setBusy("extract");
    setError(null);
    try {
      const scenes = chapterScenes(chapter);
      const provider = makeProvider(reviewModel);
      let totalDrafts = 0;
      for (const scene of scenes) {
        if (!scene.prose.trim()) continue;
        const title = scenes.length > 1 ? `${chapter.title} — scene ${scene.sequence_index + 1}` : chapter.title;
        const extractMessages: PromptDebugMessage[] = [
          { role: "system", content: EXTRACTOR_SYSTEM },
          { role: "user", content: extractorUserPrompt(scene.prose, title) }
        ];
        recordPrompt("extract", reviewModel, extractMessages);
        const raw = await provider.chat({
          messages: extractMessages,
          temperature: 0.1,
          maxTokens: EXTRACTOR_MAX_TOKENS
        });
        recordPromptResponse(raw);
        // See the matching comment in extractInterview: a parse failure
        // (no JSON at all in the response) means the same thing to the
        // author as an empty result, so it's treated the same way rather
        // than surfacing the raw parser exception.
        let drafts: FactDraft[];
        try {
          drafts = parseExtractorPayload(raw);
        } catch {
          drafts = [];
        }
        totalDrafts += drafts.length;
        const latest = bookRef.current ?? current;
        const nextFacts = applyExtractorDrafts(latest.facts, drafts, chapter.sequence_index, chapter.id, scene.id, "chapter");
        await flushSave(touch(latest, { facts: nextFacts }));
      }
      if (totalDrafts === 0) setError(STORE_ERROR.extractorNone);
    } catch (err) {
      setError(ollamaHint(err));
    } finally {
      setBusy(null);
    }
  }, [busy, flushSave, reviewModel, models.length, ollamaError]);

  const analyzeChapter = useCallback(async () => {
    const current = bookRef.current;
    const id = chapterRef.current;
    if (!current || !id || busy) return false;
    const chapter = current.chapters.find((item) => item.id === id);
    if (!chapter?.prose.trim()) {
      setError(STORE_ERROR.analyzeEmpty);
      return false;
    }
    if (models.length === 0) {
      setError(ollamaError ?? STORE_ERROR.noModel);
      return false;
    }

    abortRef.current?.abort();
    const abort = new AbortController();
    abortRef.current = abort;
    setBusy("analyze");
    setError(null);
    try {
      const analyzeMessages: PromptDebugMessage[] = [
        { role: "system", content: ANALYZE_SYSTEM },
        { role: "user", content: analyzeUserPrompt(current, chapter) }
      ];
      recordPrompt("analyze", reviewModel, analyzeMessages);
      const raw = await makeProvider(reviewModel).chat({
        messages: analyzeMessages,
        temperature: 0.25,
        maxTokens: 1800,
        signal: abort.signal
      });
      const items = parseChapterFeedback(raw, chapter.prose, {
        voice: resolveVoice(current, chapter),
        ...(kidlitReader(resolveReader(current, chapter)) ? { kidlit: true } : {})
      });
      setChapterFeedback({ chapterId: id, items });
      return true;
    } catch (err) {
      if ((err as { name?: string }).name === "AbortError") return false;
      setError(ollamaHint(err));
      return false;
    } finally {
      setBusy(null);
      abortRef.current = null;
    }
  }, [busy, reviewModel, models.length, ollamaError]);

  const generateIllustrationPrompt = useCallback(
    async (passage: string) => {
      const current = bookRef.current;
      if (!current || busy || !passage.trim()) return null;
      if (models.length === 0) {
        setError(ollamaError ?? STORE_ERROR.noModel);
        return null;
      }

      abortRef.current?.abort();
      const abort = new AbortController();
      abortRef.current = abort;
      setBusy("illustrate");
      setError(null);
      try {
        const entities = relevantEntitiesForPassage(passage, current);
        const illustrateMessages = illustrationPromptMessages(passage, entities, current.illustration_style);
        recordPrompt("illustrate", reviewModel, illustrateMessages);
        const raw = await makeProvider(reviewModel).chat({
          messages: illustrateMessages,
          temperature: 0.4,
          maxTokens: 500,
          signal: abort.signal
        });
        const withTextConstraint = enforceNoTextConstraint(raw.trim(), current.illustration_style);
        return applyOrientationHint(withTextConstraint, current.illustration_orientation);
      } catch (err) {
        if ((err as { name?: string }).name === "AbortError") return null;
        setError(ollamaHint(err));
        return null;
      } finally {
        setBusy(null);
        abortRef.current = null;
      }
    },
    [busy, reviewModel, models.length, ollamaError]
  );

  const askManuscript = useCallback(
    async (question: string) => {
      const current = bookRef.current;
      const trimmed = question.trim();
      if (!current || busy || !trimmed) return;
      if (models.length === 0) {
        setError(ollamaError ?? STORE_ERROR.noModel);
        return;
      }
      const chaptersWithProse = proseChapters(current);
      if (chaptersWithProse.length === 0) {
        setError(STORE_ERROR.askManuscriptEmpty);
        return;
      }

      abortRef.current?.abort();
      const abort = new AbortController();
      abortRef.current = abort;
      setBusy("ask-manuscript");
      setError(null);

      const sources: ManuscriptSource[] = chaptersWithProse.flatMap((chapterItem) =>
        chapterScenes(chapterItem)
          .filter((scene) => scene.prose.trim())
          .map((scene) => ({
            sceneId: scene.id,
            chapterId: chapterItem.id,
            chapterTitle: chapterItem.title,
            prose: scene.prose
          }))
      );

      try {
        const provider = makeProvider(reviewModel);
        let evidence: ManuscriptEvidence[];
        try {
          const [sourceEmbeddings, queryEmbeddings] = await Promise.all([
            provider.embed({ texts: sources.map((source) => source.prose), signal: abort.signal }),
            provider.embed({ texts: [trimmed], signal: abort.signal })
          ]);
          const queryEmbedding = queryEmbeddings[0];
          if (!queryEmbedding) throw new Error("No query embedding returned.");
          evidence = rankBySimilarity(queryEmbedding, sources, sourceEmbeddings, undefined, trimmed);
        } catch (embedErr) {
          if ((embedErr as { name?: string }).name === "AbortError") throw embedErr;
          evidence = rankByKeywordOverlap(trimmed, sources);
        }

        if (evidence.length === 0) {
          setError(STORE_ERROR.askManuscriptNoMatch);
          return;
        }

        const askMessages: PromptDebugMessage[] = [
          { role: "system", content: ASK_MANUSCRIPT_SYSTEM },
          { role: "user", content: askManuscriptUserPrompt(trimmed, evidence) }
        ];
        recordPrompt("ask-manuscript", reviewModel, askMessages);
        const raw = await provider.chat({
          messages: askMessages,
          temperature: 0.2,
          maxTokens: 700,
          signal: abort.signal
        });
        setAskManuscriptAnswer({ question: trimmed, answer: raw.trim(), evidence });
      } catch (err) {
        if ((err as { name?: string }).name === "AbortError") return;
        setError(ollamaHint(err));
      } finally {
        setBusy(null);
        abortRef.current = null;
      }
    },
    [busy, models.length, ollamaError, recordPrompt, reviewModel]
  );

  const askAboutPassage = useCallback(
    async (args: { span?: TextSpan; question: string }) => {
      const current = bookRef.current;
      const id = chapterRef.current;
      const trimmed = args.question.trim();
      if (!current || !id || busy || !trimmed) return false;
      const chapter = current.chapters.find((item) => item.id === id);
      if (!chapter?.prose.trim()) {
        setError(STORE_ERROR.analyzeEmpty);
        return false;
      }
      if (models.length === 0) {
        setError(ollamaError ?? STORE_ERROR.noModel);
        return false;
      }

      abortRef.current?.abort();
      const abort = new AbortController();
      abortRef.current = abort;
      setBusy("ask-passage");
      setError(null);
      try {
        const userContent = args.span
          ? askAboutSelectionUserPrompt({ book: current, chapter, ...surroundingPassage(chapter.prose, args.span), question: trimmed })
          : askAboutChapterUserPrompt(current, chapter, trimmed);
        const askMessages: PromptDebugMessage[] = [
          { role: "system", content: ASK_ABOUT_PASSAGE_SYSTEM },
          { role: "user", content: userContent }
        ];
        recordPrompt("ask-passage", reviewModel, askMessages);
        const raw = await makeProvider(reviewModel).chat({
          messages: askMessages,
          temperature: 0.4,
          maxTokens: 700,
          signal: abort.signal
        });
        setAskPassageAnswer({ question: trimmed, answer: raw.trim() });
        return true;
      } catch (err) {
        if ((err as { name?: string }).name === "AbortError") return false;
        setError(ollamaHint(err));
        return false;
      } finally {
        setBusy(null);
        abortRef.current = null;
      }
    },
    [busy, models.length, ollamaError, recordPrompt, reviewModel]
  );

  /** The only way to change either half of the extraction position — keeps chapter and scene from ever pointing at mismatched chapters. */
  const setInterviewExtractPosition = useCallback((chapterId: string, sceneId: string | null) => {
    setInterviewExtractChapterIdState(chapterId);
    setInterviewExtractSceneId(sceneId);
  }, []);

  const startInterview = useCallback((entityRef: string, entityLabel: string, kind: BibleKind) => {
    setInterviewEntity({ ref: entityRef, label: entityLabel, kind });
    setInterviewHistory([]);
    setInterviewPersonalityDraft(profileFor(bookRef.current?.profiles ?? [], entityRef).personality);
    const current = bookRef.current;
    const opened = current?.chapters.find((item) => item.id === chapterRef.current);
    const chapterId = opened?.id ?? (current ? sortedChapters(current)[0]?.id ?? null : null);
    setInterviewExtractChapterIdState(chapterId);
    setInterviewExtractSceneId(null);
  }, []);

  const closeInterview = useCallback(() => {
    abortRef.current?.abort();
    setInterviewEntity(null);
    setInterviewHistory([]);
    setInterviewPersonalityDraft("");
    setInterviewExtractChapterIdState(null);
    setInterviewExtractSceneId(null);
  }, []);

  const saveInterviewPersonality = useCallback(() => {
    const target = interviewEntity;
    if (!target) return;
    void patchBook((current) => {
      const profile = profileFor(current.profiles, target.ref);
      return touch(current, {
        profiles: upsertCharacterProfile(current.profiles, { ...profile, personality: interviewPersonalityDraft })
      });
    });
  }, [interviewEntity, interviewPersonalityDraft, patchBook]);

  const askCharacter = useCallback(
    async (question: string) => {
      const current = bookRef.current;
      const target = interviewEntity;
      const trimmed = question.trim();
      if (!current || !target || !trimmed) return;
      // Interview shares the app's single global `busy` flag with every other
      // AI action, but this card only disables its own controls for its own
      // in-flight call — so a question asked while something unrelated is
      // still running (a Draft left going in another tab of the app, say)
      // used to hit this guard and return with no feedback at all: the
      // question vanished from the field, nothing was ever added to the
      // transcript, and nothing told the author why. Surface it instead.
      if (busy) {
        setError(STORE_ERROR.busy);
        return;
      }
      if (models.length === 0) {
        setError(ollamaError ?? STORE_ERROR.noModel);
        return;
      }

      const priorTurns = interviewHistory;
      const userTurn: InterviewMessage = { role: "user", content: trimmed };
      setInterviewHistory([...priorTurns, userTurn]);

      abortRef.current?.abort();
      const abort = new AbortController();
      abortRef.current = abort;
      setBusy("interview");
      setError(null);
      const requestTimeout = withRequestTimeout(abort);

      try {
        const provider = makeProvider(model);
        const askMessages: PromptDebugMessage[] = [
          {
            role: "system",
            content: characterInterviewSystem(
              current,
              target.ref,
              target.label,
              target.kind,
              interviewPersonalityDraft,
              [...priorTurns.map((turn) => turn.content), trimmed].join("\n")
            )
          },
          ...priorTurns,
          userTurn
        ];
        recordPrompt("interview", model, askMessages);
        // Streamed, like Draft/Extend/Elaborate — not because the reply needs
        // to look typed out (though it's a nice side effect), but because a
        // single non-streaming call sits with zero visible feedback until the
        // whole reply is generated, which on a slower model reads as "hung"
        // even when it's still working. Every other Writing-model call in the
        // app already streams; this was the one exception.
        let raw = "";
        for await (const chunk of provider.streamChat({
          messages: askMessages,
          temperature: 0.9,
          maxTokens: 400,
          signal: abort.signal
        })) {
          if (chunk.type === "text_delta") {
            raw += chunk.text;
            setInterviewHistory([...priorTurns, userTurn, { role: "assistant", content: raw }]);
          } else if (chunk.type === "error") {
            throw new Error(chunk.message);
          }
        }
        setInterviewHistory([...priorTurns, userTurn, { role: "assistant", content: raw.trim() }]);
      } catch (err) {
        if ((err as { name?: string }).name === "AbortError") {
          if (requestTimeout.timedOut()) setError(STORE_ERROR.timeout);
          return;
        }
        setError(ollamaHint(err));
      } finally {
        requestTimeout.clear();
        setBusy(null);
        abortRef.current = null;
      }
    },
    [busy, interviewEntity, interviewHistory, interviewPersonalityDraft, model, models.length, ollamaError, recordPrompt]
  );

  const extractInterview = useCallback(async () => {
    const current = bookRef.current;
    const target = interviewEntity;
    if (!current || !target || interviewHistory.length === 0) return;
    // Same reasoning as askCharacter above: the global busy flag can be set
    // by an unrelated action while this card's own controls stay enabled,
    // so refusing silently here would look identical to nothing happening.
    if (busy) {
      setError(STORE_ERROR.busy);
      return;
    }
    if (models.length === 0) {
      setError(ollamaError ?? STORE_ERROR.noModel);
      return;
    }
    abortRef.current?.abort();
    const abort = new AbortController();
    abortRef.current = abort;
    setBusy("extract-interview");
    setError(null);
    const requestTimeout = withRequestTimeout(abort);
    try {
      const transcript = interviewHistory
        .map((turn) => `${turn.role === "user" ? "Author" : target.label}: ${turn.content}`)
        .join("\n\n");
      const provider = makeProvider(reviewModel);
      const extractMessages: PromptDebugMessage[] = [
        { role: "system", content: INTERVIEW_EXTRACTOR_SYSTEM },
        { role: "user", content: interviewExtractorUserPrompt(transcript, target.label) }
      ];
      recordPrompt("extract-interview", reviewModel, extractMessages);
      const raw = await provider.chat({
        messages: extractMessages,
        temperature: 0.1,
        maxTokens: EXTRACTOR_MAX_TOKENS,
        signal: abort.signal
      });
      recordPromptResponse(raw);
      // A weak local model can fail to produce any JSON at all (rambling
      // prose instead of the required object) rather than the well-formed
      // {"facts":[]} that means "found nothing" — parseExtractorPayload
      // throws in that case. To the author both look identical: no facts
      // came out of this pass. Treat a parse failure the same as an empty
      // result instead of leaking the raw parser exception as the error.
      let drafts: FactDraft[];
      try {
        drafts = parseExtractorPayload(raw);
      } catch {
        drafts = [];
      }
      if (drafts.length === 0) {
        setError(STORE_ERROR.interviewExtractorNone);
        return;
      }
      const chapter =
        current.chapters.find((item) => item.id === interviewExtractChapterId) ??
        current.chapters.find((item) => item.id === chapterRef.current) ??
        sortedChapters(current)[0];
      if (!chapter) return;
      // Only trust interviewExtractSceneId when it actually belongs to the
      // chapter just resolved — setInterviewExtractPosition keeps the two in
      // sync, but the chapter fallbacks above exist precisely for when
      // interviewExtractChapterId itself couldn't be resolved.
      const sceneId = chapter.id === interviewExtractChapterId ? (interviewExtractSceneId ?? undefined) : undefined;
      const nextFacts = applyExtractorDrafts(current.facts, drafts, chapter.sequence_index, chapter.id, sceneId, "interview");
      await flushSave(touch(current, { facts: nextFacts }));
    } catch (err) {
      if ((err as { name?: string }).name === "AbortError") {
        if (requestTimeout.timedOut()) setError(STORE_ERROR.timeout);
        return;
      }
      setError(ollamaHint(err));
    } finally {
      requestTimeout.clear();
      setBusy(null);
      abortRef.current = null;
    }
  }, [
    busy,
    flushSave,
    interviewEntity,
    interviewExtractChapterId,
    interviewExtractSceneId,
    interviewHistory,
    models.length,
    ollamaError,
    recordPrompt,
    recordPromptResponse,
    reviewModel
  ]);

  /**
   * Extract candidate Story Bible facts straight from a Brainstorm note —
   * the first of several planning-content sources (Synopsis and chapter/
   * scene briefs are next) meant to close the "author writes naturally,
   * then has to re-type the same information into Story Bible" gap. Not
   * tied to any chapter (same reasoning as importLoreArticles below: a
   * brainstorm note isn't manuscript prose, so nothing here is "as of" a
   * story-time position) and uses PLANNING_EXTRACTOR_SYSTEM rather than
   * EXTRACTOR_SYSTEM — planning text mixes settled claims with possibilities
   * ("Nora may discover…") that a prose-tuned extractor would flatten into
   * false certainty. Every candidate still lands in the same review queue
   * as any other extraction, tagged origin: "brainstorm" for the "Source:
   * Brainstorm" line — never locked directly.
   */
  const extractBrainstormNote = useCallback(
    async (noteId: string) => {
      const current = bookRef.current;
      if (!current || busy) return;
      const note = current.brainstorm_notes.find((item) => item.id === noteId);
      if (!note?.text.trim()) return;
      if (models.length === 0) {
        setError(ollamaError ?? STORE_ERROR.noModel);
        return;
      }
      setBusy("extract-brainstorm");
      setError(null);
      try {
        const provider = makeProvider(reviewModel);
        const extractMessages: PromptDebugMessage[] = [
          { role: "system", content: PLANNING_EXTRACTOR_SYSTEM },
          { role: "user", content: planningExtractorUserPrompt(note.text, "Brainstorm note") }
        ];
        recordPrompt("extract-brainstorm", reviewModel, extractMessages);
        const raw = await provider.chat({
          messages: extractMessages,
          temperature: 0.1,
          maxTokens: EXTRACTOR_MAX_TOKENS
        });
        recordPromptResponse(raw);
        let drafts: FactDraft[];
        try {
          drafts = parseExtractorPayload(raw);
        } catch {
          drafts = [];
        }
        if (drafts.length === 0) {
          setError(STORE_ERROR.brainstormExtractorNone);
          return;
        }
        const latest = bookRef.current ?? current;
        const nextFacts = applyExtractorDrafts(latest.facts, drafts, latest.facts.length, undefined, undefined, "brainstorm");
        await flushSave(touch(latest, { facts: nextFacts }));
      } catch (err) {
        setError(ollamaHint(err));
      } finally {
        setBusy(null);
      }
    },
    [busy, flushSave, models.length, ollamaError, recordPrompt, recordPromptResponse, reviewModel]
  );

  /**
   * Second of the three planning-content sources (Brainstorm notes above,
   * chapter/scene briefs below) — same PLANNING_EXTRACTOR_SYSTEM, same
   * unattached-to-any-chapter treatment as importLoreArticles: Synopsis
   * describes the whole story, not one chapter's story-time position.
   */
  const extractSynopsis = useCallback(async () => {
    const current = bookRef.current;
    if (!current || busy || !current.synopsis.trim()) return;
    if (models.length === 0) {
      setError(ollamaError ?? STORE_ERROR.noModel);
      return;
    }
    setBusy("extract-synopsis");
    setError(null);
    try {
      const provider = makeProvider(reviewModel);
      const extractMessages: PromptDebugMessage[] = [
        { role: "system", content: PLANNING_EXTRACTOR_SYSTEM },
        { role: "user", content: planningExtractorUserPrompt(current.synopsis, "Synopsis") }
      ];
      recordPrompt("extract-synopsis", reviewModel, extractMessages);
      const raw = await provider.chat({
        messages: extractMessages,
        temperature: 0.1,
        maxTokens: EXTRACTOR_MAX_TOKENS
      });
      recordPromptResponse(raw);
      let drafts: FactDraft[];
      try {
        drafts = parseExtractorPayload(raw);
      } catch {
        drafts = [];
      }
      if (drafts.length === 0) {
        setError(STORE_ERROR.synopsisExtractorNone);
        return;
      }
      const latest = bookRef.current ?? current;
      const nextFacts = applyExtractorDrafts(latest.facts, drafts, latest.facts.length, undefined, undefined, "synopsis");
      await flushSave(touch(latest, { facts: nextFacts }));
    } catch (err) {
      setError(ollamaHint(err));
    } finally {
      setBusy(null);
    }
  }, [busy, flushSave, models.length, ollamaError, recordPrompt, recordPromptResponse, reviewModel]);

  /**
   * Third planning-content source: a chapter's own brief, or (with sceneId)
   * one scene's own brief. Unlike Brainstorm/Synopsis, briefs ARE naturally
   * chapter-scoped — so, exactly like Interview extraction since v1.0.23,
   * this attributes the resulting facts to that chapter (and scene, when
   * given), reusing the same story-time visibility gate: a fact from a
   * scene's own brief stays invisible to Draft until that scene's own pass,
   * a fact from the chapter's whole brief from the chapter's first page.
   */
  const extractBrief = useCallback(
    async (chapterId: string, sceneId?: string) => {
      const current = bookRef.current;
      if (!current || busy) return;
      const chapter = current.chapters.find((item) => item.id === chapterId);
      if (!chapter) return;
      const scene = sceneId ? chapterScenes(chapter).find((item) => item.id === sceneId) : undefined;
      const text = sceneId ? scene?.brief : chapter.brief;
      if (!text?.trim()) return;
      if (models.length === 0) {
        setError(ollamaError ?? STORE_ERROR.noModel);
        return;
      }
      setBusy("extract-brief");
      setError(null);
      try {
        const provider = makeProvider(reviewModel);
        const title = chapter.title.trim() || "Untitled";
        const label = sceneId ? `${title} — scene brief` : `${title} — chapter brief`;
        const extractMessages: PromptDebugMessage[] = [
          { role: "system", content: PLANNING_EXTRACTOR_SYSTEM },
          { role: "user", content: planningExtractorUserPrompt(text, label) }
        ];
        recordPrompt("extract-brief", reviewModel, extractMessages);
        const raw = await provider.chat({
          messages: extractMessages,
          temperature: 0.1,
          maxTokens: EXTRACTOR_MAX_TOKENS
        });
        recordPromptResponse(raw);
        let drafts: FactDraft[];
        try {
          drafts = parseExtractorPayload(raw);
        } catch {
          drafts = [];
        }
        if (drafts.length === 0) {
          setError(STORE_ERROR.briefExtractorNone);
          return;
        }
        const latest = bookRef.current ?? current;
        const nextFacts = applyExtractorDrafts(
          latest.facts,
          drafts,
          chapter.sequence_index,
          chapter.id,
          sceneId,
          "brief"
        );
        await flushSave(touch(latest, { facts: nextFacts }));
      } catch (err) {
        setError(ollamaHint(err));
      } finally {
        setBusy(null);
      }
    },
    [busy, flushSave, models.length, ollamaError, recordPrompt, recordPromptResponse, reviewModel]
  );

  const summarizeChapter = useCallback(
    async (chapterId: string) => {
      const current = bookRef.current;
      if (!current || busy) return;
      const chapter = current.chapters.find((item) => item.id === chapterId);
      if (!chapter || !chapter.prose.trim()) return;
      if (models.length === 0) {
        setError(ollamaError ?? STORE_ERROR.noModel);
        return;
      }
      setBusy("summarize");
      setError(null);
      try {
        const provider = makeProvider(reviewModel);
        const summarizeMessages: PromptDebugMessage[] = [
          { role: "system", content: SUMMARIZE_CHAPTER_SYSTEM },
          { role: "user", content: summarizeChapterUserPrompt(chapter) }
        ];
        recordPrompt("summarize", reviewModel, summarizeMessages);
        const raw = await provider.chat({ messages: summarizeMessages, temperature: 0.2, maxTokens: 220 });
        recordPromptResponse(raw);
        const summary = manuscriptFromModel(raw, "");
        if (!summary) {
          setError(STORE_ERROR.summarizeNone);
          return;
        }
        const latest = bookRef.current ?? current;
        await flushSave(updateChapter(latest, chapterId, { summary }));
      } catch (err) {
        setError(ollamaHint(err));
      } finally {
        setBusy(null);
      }
    },
    [busy, flushSave, models.length, ollamaError, recordPrompt, recordPromptResponse, reviewModel]
  );

  /**
   * A porting aid for an author's existing lorebook (roadmap-ideas.md #28,
   * step 1: source-agnostic, before any format-specific adapter exists) —
   * run one or more pasted/uploaded articles through the same extractor a
   * chapter or interview uses. Not tied to any chapter (no
   * chapter_id/scene_id): an article isn't manuscript prose, so nothing
   * here is "as of" a story-time position. Every article lands in the same
   * review queue as any other extraction, never locked directly.
   *
   * Runs sequentially, not in parallel — a local model server generally
   * only processes one generation at a time anyway, and sequential keeps
   * "article 3 of 7" progress reporting simple and correct. One article
   * failing (a bad response, a dropped connection) is reported but doesn't
   * abort the rest of the batch; the single-article case (the common one,
   * still just a one-element array) behaves exactly as before.
   */
  const importLoreArticles = useCallback(
    async (
      articles: LoreArticleCandidate[]
    ): Promise<{ articlesProcessed: number; articlesWithFacts: number; totalFacts: number }> => {
      const trimmed = articles
        .map((article) => ({ title: article.title.trim(), text: article.text.trim() }))
        .filter((article) => article.text);
      const current = bookRef.current;
      const empty = { articlesProcessed: 0, articlesWithFacts: 0, totalFacts: 0 };
      if (!current || busy || trimmed.length === 0) return empty;
      if (models.length === 0) {
        setError(ollamaError ?? STORE_ERROR.noModel);
        return empty;
      }
      setBusy("import-lore");
      setError(null);
      let articlesWithFacts = 0;
      let totalFacts = 0;
      try {
        for (let i = 0; i < trimmed.length; i++) {
          const article = trimmed[i]!;
          setImportLoreProgress({ current: i + 1, total: trimmed.length });
          try {
            const provider = makeProvider(reviewModel);
            const extractMessages: PromptDebugMessage[] = [
              { role: "system", content: EXTRACTOR_SYSTEM },
              { role: "user", content: extractorUserPrompt(article.text, article.title || "Imported lore article") }
            ];
            recordPrompt("import-lore", reviewModel, extractMessages);
            const raw = await provider.chat({
              messages: extractMessages,
              temperature: 0.1,
              maxTokens: EXTRACTOR_MAX_TOKENS
            });
            const drafts = parseExtractorPayload(raw);
            if (drafts.length === 0) continue;
            const latest = bookRef.current ?? current;
            const nextFacts = applyExtractorDrafts(latest.facts, drafts, latest.facts.length, undefined, undefined, "lore");
            await flushSave(touch(latest, { facts: nextFacts }));
            articlesWithFacts += 1;
            totalFacts += drafts.length;
          } catch (err) {
            setError(ollamaHint(err));
          }
        }
        if (articlesWithFacts === 0) setError(STORE_ERROR.importLoreNone);
        return { articlesProcessed: trimmed.length, articlesWithFacts, totalFacts };
      } finally {
        setBusy(null);
        setImportLoreProgress(null);
      }
    },
    [busy, flushSave, models.length, ollamaError, recordPrompt, reviewModel]
  );

  const setDevelopmentMethod = useCallback(
    async (id: string | null) => {
      setDevelopSuggestion(null);
      const current = bookRef.current;
      if (!current) return;

      // Switching away from a method never deletes its beats automatically
      // (materializeBeats' own contract) — but offer to, so a leftover beat
      // sheet from a method the author no longer uses doesn't just pile up
      // as unused Plotline rows (see roadmap-ideas.md #33 follow-up).
      let removeIds: string[] = [];
      const previousId = current.development_method;
      if (previousId && previousId !== id) {
        const previousMethod = developmentMethodById(previousId);
        const previousMessages =
          getMessages().method.methods[previousId as keyof ReturnType<typeof getMessages>["method"]["methods"]];
        if (previousMethod && previousMessages) {
          const previousLabels: Record<string, string> = {};
          for (const step of previousMethod.steps) {
            if (step.kind !== "beat") continue;
            const stepMessages = (previousMessages.steps as Record<string, { label: string }>)[step.id];
            if (stepMessages) previousLabels[step.id] = stepMessages.label;
          }
          const leftover = beatPlotlines(current, previousMethod, previousLabels);
          if (
            leftover.length > 0 &&
            window.confirm(
              format(count(leftover.length, getMessages().method.removeOldBeatsConfirm), {
                method: previousMessages.name,
                titles: leftover.map((plotline) => plotline.title).join(", ")
              })
            )
          ) {
            removeIds = leftover.map((plotline) => plotline.id);
          }
        }
      }

      const method = id ? developmentMethodById(id) : undefined;
      const methodMessages = id ? getMessages().method.methods[id as keyof ReturnType<typeof getMessages>["method"]["methods"]] : undefined;
      await patchBook((currentForPatch) => {
        const withoutOldBeats = removeIds.reduce((book, plotlineId) => removePlotline(book, plotlineId), currentForPatch);
        const withMethod = touch(withoutOldBeats, { development_method: id ?? undefined });
        if (!method || !methodMessages) return withMethod;
        const labelsByStepId: Record<string, string> = {};
        for (const step of method.steps) {
          if (step.kind !== "beat") continue;
          const stepMessages = (methodMessages.steps as Record<string, { label: string }>)[step.id];
          if (stepMessages) labelsByStepId[step.id] = stepMessages.label;
        }
        return materializeBeats(withMethod, method, labelsByStepId);
      });
    },
    [patchBook]
  );

  const developExpand = useCallback(
    async (step: Extract<DevelopmentStep, { kind: "expand" }>, draft: string) => {
      const current = bookRef.current;
      if (!current || busy) return;
      if (models.length === 0) {
        setError(ollamaError ?? STORE_ERROR.noModel);
        return;
      }
      const method = developmentMethodById(current.development_method);
      const methodMessages = current.development_method
        ? getMessages().method.methods[current.development_method as keyof ReturnType<typeof getMessages>["method"]["methods"]]
        : undefined;
      const stepMessages = methodMessages ? (methodMessages.steps as Record<string, { label: string; prompt: string }>)[step.id] : undefined;
      if (!method || !stepMessages) return;

      abortRef.current?.abort();
      const abort = new AbortController();
      abortRef.current = abort;
      setBusy("develop");
      setError(null);
      setDevelopSuggestion(null);

      try {
        const provider = makeProvider(model);
        const askMessages: PromptDebugMessage[] = [
          { role: "system", content: writingSystem(DEVELOP_EXPAND_SYSTEM) },
          {
            role: "user",
            content: developExpandUserPrompt({
              book: current,
              stepLabel: stepMessages.label,
              stepPrompt: stepMessages.prompt,
              priorStepsText: current.synopsis,
              draft
            })
          }
        ];
        recordPrompt("develop", model, askMessages);
        const raw = await provider.chat({
          messages: askMessages,
          temperature: 0.8,
          maxTokens: 500,
          signal: abort.signal
        });
        setDevelopSuggestion(raw.trim());
      } catch (err) {
        if ((err as { name?: string }).name === "AbortError") return;
        setError(ollamaHint(err));
      } finally {
        setBusy(null);
        abortRef.current = null;
      }
    },
    [busy, model, models.length, ollamaError, recordPrompt]
  );

  const dismissDevelopSuggestion = useCallback(() => setDevelopSuggestion(null), []);

  const startProofread = useCallback(
    async (opts?: { restart?: boolean; stages?: ProofreadStage[]; scopeChapterId?: string }) => {
      const current = bookRef.current;
      if (!current || busy || proofreadLock.current) return;
      if (proseChapters(current).length === 0) {
        setError(STORE_ERROR.proofreadEmpty);
        return;
      }
      if (models.length === 0) {
        setError(ollamaError ?? STORE_ERROR.noModel);
        return;
      }

      const existing = current.proofread;
      const restart = Boolean(opts?.restart);
      const job =
        !restart && existing && (existing.status === "paused" || existing.status === "running" || existing.status === "error")
          ? touchProofread(existing, { status: "running" })
          : startProofreadJob(current, {
              ...(opts?.stages ? { stages: opts.stages } : {}),
              ...(opts?.scopeChapterId ? { scopeChapterId: opts.scopeChapterId } : {})
            });

      proofreadLock.current = true;
      const abort = new AbortController();
      abortRef.current = abort;
      setBusy("proofread");
      setError(null);
      await flushSave(touch(current, { proofread: job }));
      try {
        await runProofread(
          job,
          {
            complete: (system, user, signal) => {
              const proofreadMessages: PromptDebugMessage[] = [
                { role: "system", content: system },
                { role: "user", content: user }
              ];
              recordPrompt("proofread", reviewModel, proofreadMessages);
              return makeProvider(reviewModel).chat({
                messages: proofreadMessages,
                temperature: 0.2,
                maxTokens: EXTRACTOR_MAX_TOKENS,
                signal
              });
            },
            getBook: () => bookRef.current ?? current,
            save: async (next) => {
              const latest = bookRef.current;
              if (!latest) return;
              await flushSave(touch(latest, { proofread: next }));
            },
            saveFacts: async (facts) => {
              const latest = bookRef.current;
              if (!latest) return;
              await flushSave(touch(latest, { facts }));
            }
          },
          abort.signal
        );
      } catch (err) {
        const latest = bookRef.current;
        const proofread = latest?.proofread;
        if ((err as { name?: string }).name === "AbortError") {
          if (latest && proofread) {
            await flushSave(touch(latest, { proofread: touchProofread(proofread, { status: "paused" }) }));
          }
          return;
        }
        setError(ollamaHint(err));
        if (latest && proofread) {
          await flushSave(touch(latest, { proofread: touchProofread(proofread, { status: "error" }) }));
        }
      } finally {
        proofreadLock.current = false;
        setBusy(null);
        abortRef.current = null;
      }
    },
    [busy, flushSave, models.length, ollamaError, reviewModel]
  );

  useEffect(() => {
    if (!book?.proofread || book.proofread.status !== "running") return;
    if (busy) return;
    if (models.length === 0) return;
    void startProofread();
  }, [book?.id, book?.proofread?.status, busy, models.length, startProofread]);

  const addFact = useCallback(
    async (input: { label: string; predicate: CorePredicate; value: string; mode?: "replace" | "add" }) => {
      const current = bookRef.current;
      const id = chapterRef.current;
      if (!current) return;
      const chapter = current.chapters.find((item) => item.id === id) ?? sortedChapters(current)[0];
      const draft: FactDraft = {
        entity_ref: slugify(input.label),
        entity_label: input.label.trim(),
        predicate: input.predicate,
        value: input.value.trim()
      };
      if (!draft.entity_label || !draft.value) return;
      const sceneId = chapter ? chapterScenes(chapter)[0]?.id : undefined;
      const applied =
        input.mode === "add"
          ? applyAuthorAddition(current.facts, draft, chapter?.sequence_index ?? 0, chapter?.id, sceneId)
          : applyAuthorDraft(current.facts, draft, chapter?.sequence_index ?? 0, chapter?.id, sceneId);
      const facts = withRelationshipMirrorFor(applied, draft, current.entity_kinds);
      await flushSave(touch(current, { facts }));
    },
    [flushSave]
  );

  const revise = useCallback(
    async (factId: string, value: string) => {
      const current = bookRef.current;
      if (!current) return;
      const target = current.facts.find((fact) => fact.id === factId);
      const revised = reviseFact(current.facts, factId, value);
      const facts = target
        ? withRelationshipMirrorFor(revised, { entity_ref: target.entity_ref, predicate: target.predicate, value }, current.entity_kinds)
        : revised;
      await flushSave(touch(current, { facts }));
    },
    [flushSave]
  );

  const approve = useCallback(
    async (factId: string, value?: string) => {
      const current = bookRef.current;
      if (!current) return;
      const next = value ? reviseFact(current.facts, factId, value) : current.facts;
      const approved = approveFact(next, factId);
      const target = approved.find((fact) => fact.id === factId);
      const facts = target
        ? withRelationshipMirrorFor(
            approved,
            { entity_ref: target.entity_ref, predicate: target.predicate, value: target.value },
            current.entity_kinds
          )
        : approved;
      await flushSave(touch(current, { facts }));
    },
    [flushSave]
  );

  const reject = useCallback(
    async (factId: string) => {
      const current = bookRef.current;
      if (!current) return;
      await flushSave(touch(current, { facts: rejectFact(current.facts, factId) }));
    },
    [flushSave]
  );

  const keepSeparate = useCallback(
    async (factId: string, value?: string) => {
      const current = bookRef.current;
      if (!current) return;
      const next = value ? reviseFact(current.facts, factId, value) : current.facts;
      await flushSave(touch(current, { facts: keepFactSeparate(next, factId) }));
    },
    [flushSave]
  );

  const value: BookStoreValue = {
    summaries,
    book,
    chapterId,
    surface,
    models,
    model,
    writingPrimer,
    reviewModel,
    engine,
    baseUrl,
    contextWindow,
    historyLimit,
    ollamaError,
    busy,
    error,
    chapterFeedback,
    modelAsides,
    lastPrompt,
    askManuscriptAnswer,
    askPassageAnswer,
    interviewEntity,
    interviewHistory,
    interviewPersonalityDraft,
    brainstormChatHistory,
    interviewExtractChapterId,
    interviewExtractSceneId,
    setInterviewExtractPosition,
    developSuggestion,
    importLoreProgress,
    refresh,
    openBook,
    closeBook,
    newBook,
    importManuscript,
    deleteBook,
    patchBook,
    setChapterId,
    selectChapter,
    showSettings,
    showBrainstorm,
    showSynopsis,
    showAsk,
    showTimeline,
    showPlotlines,
    showMethod,
    showGuide,
    showHandbook,
    convertMarkersToFormatting,
    dismissModelAside,
    setModel,
    setWritingPrimer,
    resetWritingPrimer,
    setReviewModel,
    setEngine,
    setBaseUrl,
    setContextWindow,
    suggestContextWindow,
    setHistoryLimit,
    draftChapter,
    recastChapter,
    draftScene,
    recastScene,
    analyzeScene,
    mergeScene,
    rewriteSpan,
    restoreChapterProse,
    summarizeChapter,
    cutChapterDarling,
    restoreChapterDarling,
    discardChapterDarling,
    startBrainstormChat,
    askBrainstormChat,
    closeBrainstormChat,
    liftToSynopsis,
    sendBrainstormToSynopsis,
    suggestAlternatives,
    suggestSentenceSplit,
    suggestParagraphBreak,
    stopDraft,
    extractChapter,
    analyzeChapter,
    startProofread,
    generateIllustrationPrompt,
    askManuscript,
    askAboutPassage,
    startInterview,
    askCharacter,
    extractInterview,
    extractBrainstormNote,
    extractSynopsis,
    extractBrief,
    importLoreArticles,
    closeInterview,
    setInterviewPersonalityDraft,
    saveInterviewPersonality,
    setDevelopmentMethod,
    developExpand,
    dismissDevelopSuggestion,
    addFact,
    reviseFact: revise,
    approve,
    reject,
    keepSeparate
  };

  return <BookStoreContext.Provider value={value}>{children}</BookStoreContext.Provider>;
}
