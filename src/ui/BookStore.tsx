import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  addChapter,
  createBook,
  openingSurface,
  removeChapter,
  sortedChapters,
  touch,
  updateChapter,
  type Book,
  type BookSummary,
  type EditorSurface
} from "@core/BookSchema";
import { BRAINSTORM_ASK_SYSTEM, BRAINSTORM_PASSAGE_SYSTEM, brainstormAskUserPrompt, brainstormPassageUserPrompt, liftFragmentToSynopsis } from "@core/brainstorm";
import { applyAuthorDraft, applyExtractorDrafts, approveFact, rejectFact, reviseFact } from "@core/ConsistencyGate";
import { ANALYZE_SYSTEM, analyzeUserPrompt, parseChapterFeedback, type ChapterFeedback } from "@core/chapterFeedback";
import { EXTRACTOR_SYSTEM, extractorUserPrompt, parseExtractorPayload } from "@core/extractFacts";
import { DRAFT_SYSTEM, PASSAGE_SYSTEM, RECAST_SYSTEM, draftUserPrompt, passageUserPrompt, recastUserPrompt } from "@core/generateProse";
import { applyExtend, applyReplace, selectedText, surroundingPassage, type TextSpan } from "@core/textSpan";
import { ALTERNATIVES_SYSTEM, alternativesUserPrompt, dropWrongSense, parseAlternativeWords } from "@core/wordAlternatives";
import { BREAK_SYSTEM, breakUserPrompt, parseParagraphBreak } from "@core/paragraphBreak";
import { SPLIT_SYSTEM, parseSplitSuggestion, splitUserPrompt } from "@core/sentenceSplit";
import { slugify } from "@core/ids";
import type { CorePredicate } from "@core/predicates";
import type { FactDraft } from "@core/NarrativeFact";
import {
  completeOllamaChat,
  DEFAULT_OLLAMA_MODEL,
  DEFAULT_REVIEW_MODEL,
  listOllamaModels,
  OllamaProvider,
  pickListedOllamaModel,
  pickListedReviewModel
} from "@llm/ollama";
import { BookRepository } from "@persistence/Repository";

const MODEL_KEY = "storybook-ai.model";
const REVIEW_MODEL_KEY = "storybook-ai.review-model";
const LAST_BOOK_KEY = "storybook-ai.last-book";

type Busy = "draft" | "extract" | "extend" | "elaborate" | "instruct" | "ask" | "recast" | "analyze" | null;

type BookStoreValue = {
  summaries: BookSummary[];
  book: Book | null;
  chapterId: string | null;
  surface: EditorSurface;
  models: string[];
  model: string;
  reviewModel: string;
  ollamaError: string | null;
  busy: Busy;
  error: string | null;
  chapterFeedback: ChapterFeedback | null;
  refresh: () => Promise<void>;
  openBook: (id: string) => Promise<void>;
  closeBook: () => void;
  newBook: (title: string) => Promise<void>;
  deleteBook: (id: string) => Promise<void>;
  patchBook: (mutate: (book: Book) => Book) => Promise<void>;
  setChapterId: (id: string) => void;
  showBrainstorm: () => void;
  showSynopsis: () => void;
  setModel: (name: string) => void;
  setReviewModel: (name: string) => void;
  draftChapter: () => Promise<void>;
  recastChapter: () => Promise<void>;
  rewriteSpan: (args: {
    target: "prose" | "synopsis" | "brainstorm";
    mode: "extend" | "elaborate" | "instruct";
    span: TextSpan;
    instruction?: string;
  }) => Promise<void>;
  askBrainstorm: (instruction: string) => Promise<void>;
  liftToSynopsis: (span: TextSpan) => Promise<void>;
  suggestAlternatives: (args: {
    word: string;
    sentence: string;
    before?: string;
    after?: string;
    signal?: AbortSignal;
  }) => Promise<string[]>;
  suggestSentenceSplit: (sentence: string, signal?: AbortSignal) => Promise<string>;
  suggestParagraphBreak: (paragraph: string, signal?: AbortSignal) => Promise<string>;
  stopDraft: () => void;
  extractChapter: () => Promise<void>;
  analyzeChapter: () => Promise<boolean>;
  addFact: (draft: { label: string; predicate: CorePredicate; value: string }) => Promise<void>;
  reviseFact: (factId: string, value: string) => Promise<void>;
  approve: (factId: string, value?: string) => Promise<void>;
  reject: (factId: string) => Promise<void>;
};

const BookStoreContext = createContext<BookStoreValue | null>(null);

function ollamaHint(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  if (/failed to fetch|networkerror|load failed/i.test(message)) {
    return "Ollama did not accept the browser. Start it with OLLAMA_ORIGINS=http://localhost:5175";
  }
  return message;
}

export function BookStoreProvider({ children }: { children: React.ReactNode }) {
  const repo = useMemo(() => new BookRepository(), []);
  const [summaries, setSummaries] = useState<BookSummary[]>([]);
  const [book, setBook] = useState<Book | null>(null);
  const [chapterId, setChapterIdState] = useState<string | null>(null);
  const [surface, setSurface] = useState<EditorSurface>("brainstorm");
  const [models, setModels] = useState<string[]>([]);
  const [model, setModelState] = useState(() => localStorage.getItem(MODEL_KEY) ?? DEFAULT_OLLAMA_MODEL);
  const [reviewModel, setReviewModelState] = useState(
    () => localStorage.getItem(REVIEW_MODEL_KEY) ?? DEFAULT_REVIEW_MODEL
  );
  const [ollamaError, setOllamaError] = useState<string | null>(null);
  const [busy, setBusy] = useState<Busy>(null);
  const [error, setError] = useState<string | null>(null);
  const [chapterFeedback, setChapterFeedback] = useState<ChapterFeedback | null>(null);
  const bookRef = useRef<Book | null>(null);
  const chapterRef = useRef<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const saveTimer = useRef<number | null>(null);

  bookRef.current = book;
  chapterRef.current = chapterId;

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
      setBook(loaded);
      setChapterIdState(sortedChapters(loaded)[0]?.id ?? null);
      setSurface(openingSurface(loaded));
    }).catch(() => {
      localStorage.removeItem(LAST_BOOK_KEY);
    });
  }, [repo]);

  useEffect(() => {
    let cancelled = false;
    void listOllamaModels()
      .then((names) => {
        if (cancelled) return;
        setModels(names);
        setOllamaError(null);
        const preferred = localStorage.getItem(MODEL_KEY) ?? DEFAULT_OLLAMA_MODEL;
        const picked = pickListedOllamaModel(preferred, names);
        if (picked) {
          setModelState(picked);
          localStorage.setItem(MODEL_KEY, picked);
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
        setOllamaError(ollamaHint(err));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const flushSave = useCallback(async (next: Book) => {
    if (saveTimer.current !== null) {
      window.clearTimeout(saveTimer.current);
      saveTimer.current = null;
    }
    setBook(next);
    await persist(next);
  }, [persist]);

  const patchBook = useCallback(
    async (mutate: (current: Book) => Book) => {
      const current = bookRef.current;
      if (!current) return;
      const mutated = mutate(current);
      const next = touch(mutated, {
        title: mutated.title.trim() || "Untitled manuscript"
      });
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
      setBook(loaded);
      const first = sortedChapters(loaded)[0]?.id ?? null;
      setChapterIdState(first);
      setSurface(openingSurface(loaded));
      setChapterFeedback(null);
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
    setBook(null);
    setChapterIdState(null);
    setSurface("brainstorm");
    setChapterFeedback(null);
    localStorage.removeItem(LAST_BOOK_KEY);
    void refresh();
  }, [persist, refresh]);

  const newBook = useCallback(
    async (title: string) => {
      const created = createBook(title);
      await repo.save(created);
      setSummaries(await repo.list());
      setBook(created);
      setChapterIdState(sortedChapters(created)[0]?.id ?? null);
      setSurface(openingSurface(created));
      setChapterFeedback(null);
      localStorage.setItem(LAST_BOOK_KEY, created.id);
      setError(null);
    },
    [repo]
  );

  const deleteBook = useCallback(
    async (id: string) => {
      await repo.delete(id);
      if (bookRef.current?.id === id) {
        setBook(null);
        setChapterIdState(null);
        setSurface("brainstorm");
        setChapterFeedback(null);
      }
      await refresh();
    },
    [refresh, repo]
  );

  const setModel = useCallback((name: string) => {
    setModelState(name);
    localStorage.setItem(MODEL_KEY, name);
  }, []);

  const setReviewModel = useCallback((name: string) => {
    setReviewModelState(name);
    localStorage.setItem(REVIEW_MODEL_KEY, name);
  }, []);

  const setChapterId = useCallback((id: string) => {
    setChapterIdState(id);
    setSurface("chapter");
  }, []);

  const showBrainstorm = useCallback(() => {
    setSurface("brainstorm");
  }, []);

  const showSynopsis = useCallback(() => {
    setSurface("synopsis");
  }, []);

  const draftChapter = useCallback(async () => {
    const current = bookRef.current;
    const id = chapterRef.current;
    if (!current || !id || busy) return;
    const chapter = current.chapters.find((item) => item.id === id);
    if (!chapter) return;
    if (models.length === 0) {
      setError(ollamaError ?? "No local model. Start Ollama, then reload.");
      return;
    }

    abortRef.current?.abort();
    const abort = new AbortController();
    abortRef.current = abort;
    setBusy("draft");
    setError(null);

    const provider = new OllamaProvider({ model });
    let assembled = chapter.prose;
    const prefix = assembled.trim() ? `${assembled.replace(/\s+$/, "")}\n\n` : "";
    assembled = prefix;

    try {
      await patchBook((book) => updateChapter(book, id, { prose: assembled }));
      for await (const chunk of provider.streamCompletion({
        messages: [
          { role: "system", content: DRAFT_SYSTEM },
          { role: "user", content: draftUserPrompt(current, chapter) }
        ],
        temperature: 0.85,
        maxTokens: 900,
        signal: abort.signal
      })) {
        if (chunk.type === "text_delta") {
          assembled += chunk.text;
          setBook((prev) => (prev ? updateChapter(prev, id, { prose: assembled }) : prev));
        } else if (chunk.type === "error") {
          throw new Error(chunk.message);
        }
      }
      const latest = bookRef.current;
      if (latest) await flushSave(updateChapter(latest, id, { prose: assembled }));
    } catch (err) {
      if ((err as { name?: string }).name === "AbortError") {
        const latest = bookRef.current;
        if (latest) await flushSave(updateChapter(latest, id, { prose: assembled }));
      } else {
        setError(ollamaHint(err));
      }
    } finally {
      setBusy(null);
      abortRef.current = null;
    }
  }, [busy, flushSave, model, models.length, ollamaError, patchBook]);

  const recastChapter = useCallback(async () => {
    const current = bookRef.current;
    const id = chapterRef.current;
    if (!current || !id || busy) return;
    const chapter = current.chapters.find((item) => item.id === id);
    if (!chapter?.prose.trim()) {
      setError("Write or draft some prose before recasting the camera.");
      return;
    }
    if (models.length === 0) {
      setError(ollamaError ?? "No local model. Start Ollama, then reload.");
      return;
    }

    abortRef.current?.abort();
    const abort = new AbortController();
    abortRef.current = abort;
    setBusy("recast");
    setError(null);

    const original = chapter.prose;
    let assembled = "";

    try {
      const provider = new OllamaProvider({ model });
      for await (const chunk of provider.streamCompletion({
        messages: [
          { role: "system", content: RECAST_SYSTEM },
          { role: "user", content: recastUserPrompt(current, chapter) }
        ],
        temperature: 0.5,
        maxTokens: 1600,
        signal: abort.signal
      })) {
        if (chunk.type === "text_delta") {
          assembled += chunk.text;
          setBook((prev) => (prev ? updateChapter(prev, id, { prose: assembled }) : prev));
        } else if (chunk.type === "error") {
          throw new Error(chunk.message);
        }
      }
      const latest = bookRef.current;
      if (latest) await flushSave(updateChapter(latest, id, { prose: assembled.trim() ? assembled : original }));
    } catch (err) {
      if ((err as { name?: string }).name === "AbortError") {
        const latest = bookRef.current;
        if (latest) await flushSave(updateChapter(latest, id, { prose: assembled.trim() ? assembled : original }));
      } else {
        setError(ollamaHint(err));
        const latest = bookRef.current;
        if (latest) await flushSave(updateChapter(latest, id, { prose: original }));
      }
    } finally {
      setBusy(null);
      abortRef.current = null;
    }
  }, [busy, flushSave, model, models.length, ollamaError]);

  const rewriteSpan = useCallback(
    async (args: {
      target: "prose" | "synopsis" | "brainstorm";
      mode: "extend" | "elaborate" | "instruct";
      span: TextSpan;
      instruction?: string;
    }) => {
      const current = bookRef.current;
      const id = chapterRef.current;
      if (!current || busy) return;
      if (args.target === "prose" && !id) return;
      if (models.length === 0) {
        setError(ollamaError ?? "No local model. Start Ollama, then reload.");
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
      if (!around.selected) return;
      if (args.mode === "instruct" && !(args.instruction ?? "").trim()) return;

      abortRef.current?.abort();
      const abort = new AbortController();
      abortRef.current = abort;
      setBusy(args.mode);
      setError(null);

      let generated = "";

      const write = (next: string) => {
        if (args.target === "synopsis") {
          setBook((prev) => (prev ? { ...prev, synopsis: next } : prev));
          return;
        }
        if (args.target === "brainstorm") {
          setBook((prev) => (prev ? { ...prev, brainstorm: next } : prev));
          return;
        }
        setBook((prev) => (prev && id ? updateChapter(prev, id, { prose: next }) : prev));
      };

      const assemble = () =>
        args.mode === "extend" ? applyExtend(source, args.span, generated) : applyReplace(source, args.span, generated);

      const persistAssembled = async (latest: Book, assembled: string) => {
        if (args.target === "synopsis") await flushSave(touch(latest, { synopsis: assembled }));
        else if (args.target === "brainstorm") await flushSave(touch(latest, { brainstorm: assembled }));
        else if (id) await flushSave(updateChapter(latest, id, { prose: assembled }));
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
        const provider = new OllamaProvider({ model });
        for await (const chunk of provider.streamCompletion({
          messages: [
            { role: "system", content: args.target === "brainstorm" ? BRAINSTORM_PASSAGE_SYSTEM : PASSAGE_SYSTEM },
            { role: "user", content: userContent }
          ],
          temperature: args.target === "brainstorm" ? 0.9 : 0.8,
          maxTokens: args.mode === "extend" ? 280 : 420,
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
    [busy, flushSave, model, models.length, ollamaError]
  );

  const askBrainstorm = useCallback(
    async (instruction: string) => {
      const current = bookRef.current;
      const question = instruction.trim();
      if (!current || !question || busy) return;
      if (models.length === 0) {
        setError(ollamaError ?? "No local model. Start Ollama, then reload.");
        return;
      }

      abortRef.current?.abort();
      const abort = new AbortController();
      abortRef.current = abort;
      setBusy("ask");
      setError(null);

      const prefix = current.brainstorm.trim() ? `${current.brainstorm.replace(/\s+$/, "")}\n\n` : "";
      let assembled = prefix;

      try {
        await patchBook((book) => ({ ...book, brainstorm: assembled }));
        const provider = new OllamaProvider({ model });
        for await (const chunk of provider.streamCompletion({
          messages: [
            { role: "system", content: BRAINSTORM_ASK_SYSTEM },
            { role: "user", content: brainstormAskUserPrompt(current, question) }
          ],
          temperature: 0.9,
          maxTokens: 700,
          signal: abort.signal
        })) {
          if (chunk.type === "text_delta") {
            assembled += chunk.text;
            setBook((prev) => (prev ? { ...prev, brainstorm: assembled } : prev));
          } else if (chunk.type === "error") {
            throw new Error(chunk.message);
          }
        }
        const latest = bookRef.current;
        if (latest) await flushSave(touch(latest, { brainstorm: assembled }));
      } catch (err) {
        if ((err as { name?: string }).name === "AbortError") {
          const latest = bookRef.current;
          if (latest) await flushSave(touch(latest, { brainstorm: assembled }));
        } else {
          setError(ollamaHint(err));
        }
      } finally {
        setBusy(null);
        abortRef.current = null;
      }
    },
    [busy, flushSave, model, models.length, ollamaError, patchBook]
  );

  const liftToSynopsis = useCallback(
    async (span: TextSpan) => {
      const current = bookRef.current;
      if (!current) return;
      const next = liftFragmentToSynopsis(current.synopsis, selectedText(current.brainstorm, span));
      if (next === current.synopsis) return;
      await flushSave(touch(current, { synopsis: next }));
    },
    [flushSave]
  );

  const suggestAlternatives = useCallback(
    async (args: {
      word: string;
      sentence: string;
      before?: string;
      after?: string;
      signal?: AbortSignal;
    }) => {
      if (models.length === 0) {
        const message = ollamaError ?? "No local model. Start Ollama, then reload.";
        setError(message);
        throw new Error(message);
      }
      try {
        const raw = await completeOllamaChat({
          model: reviewModel,
          messages: [
            { role: "system", content: ALTERNATIVES_SYSTEM },
            {
              role: "user",
              content: alternativesUserPrompt(args.word, args.sentence, bookRef.current?.voice ?? "", {
                ...(args.before ? { before: args.before } : {}),
                ...(args.after ? { after: args.after } : {})
              })
            }
          ],
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
        const message = ollamaError ?? "No local model. Start Ollama, then reload.";
        setError(message);
        throw new Error(message);
      }
      try {
        const raw = await completeOllamaChat({
          model: reviewModel,
          messages: [
            { role: "system", content: SPLIT_SYSTEM },
            { role: "user", content: splitUserPrompt(sentence, bookRef.current?.voice ?? "") }
          ],
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
        const message = ollamaError ?? "No local model. Start Ollama, then reload.";
        setError(message);
        throw new Error(message);
      }
      try {
        const raw = await completeOllamaChat({
          model: reviewModel,
          messages: [
            { role: "system", content: BREAK_SYSTEM },
            { role: "user", content: breakUserPrompt(paragraph, bookRef.current?.voice ?? "") }
          ],
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
      setError("Write or draft some prose before extracting facts.");
      return;
    }
    if (models.length === 0) {
      setError(ollamaError ?? "No local model. Start Ollama, then reload.");
      return;
    }
    setBusy("extract");
    setError(null);
    try {
      const raw = await completeOllamaChat({
        model: reviewModel,
        messages: [
          { role: "system", content: EXTRACTOR_SYSTEM },
          { role: "user", content: extractorUserPrompt(chapter.prose, chapter.title) }
        ],
        temperature: 0.1,
        maxTokens: 1200
      });
      const drafts = parseExtractorPayload(raw);
      const latest = bookRef.current ?? current;
      const nextFacts = applyExtractorDrafts(latest.facts, drafts, chapter.sequence_index, chapter.id);
      await flushSave(touch(latest, { facts: nextFacts }));
      if (drafts.length === 0) setError("Extractor found no stated facts in this chapter.");
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
      setError("Write or draft some prose before analyzing the chapter.");
      return false;
    }
    if (models.length === 0) {
      setError(ollamaError ?? "No local model. Start Ollama, then reload.");
      return false;
    }

    abortRef.current?.abort();
    const abort = new AbortController();
    abortRef.current = abort;
    setBusy("analyze");
    setError(null);
    try {
      const raw = await completeOllamaChat({
        model: reviewModel,
        messages: [
          { role: "system", content: ANALYZE_SYSTEM },
          { role: "user", content: analyzeUserPrompt(current, chapter) }
        ],
        temperature: 0.25,
        maxTokens: 1800,
        signal: abort.signal
      });
      const items = parseChapterFeedback(raw, chapter.prose, { voice: current.voice });
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

  const addFact = useCallback(
    async (input: { label: string; predicate: CorePredicate; value: string }) => {
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
      const facts = applyAuthorDraft(current.facts, draft, chapter?.sequence_index ?? 0, chapter?.id);
      await flushSave(touch(current, { facts }));
    },
    [flushSave]
  );

  const revise = useCallback(
    async (factId: string, value: string) => {
      const current = bookRef.current;
      if (!current) return;
      await flushSave(touch(current, { facts: reviseFact(current.facts, factId, value) }));
    },
    [flushSave]
  );

  const approve = useCallback(
    async (factId: string, value?: string) => {
      const current = bookRef.current;
      if (!current) return;
      const next = value ? reviseFact(current.facts, factId, value) : current.facts;
      await flushSave(touch(current, { facts: approveFact(next, factId) }));
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

  const value: BookStoreValue = {
    summaries,
    book,
    chapterId,
    surface,
    models,
    model,
    reviewModel,
    ollamaError,
    busy,
    error,
    chapterFeedback,
    refresh,
    openBook,
    closeBook,
    newBook,
    deleteBook,
    patchBook,
    setChapterId,
    showBrainstorm,
    showSynopsis,
    setModel,
    setReviewModel,
    draftChapter,
    recastChapter,
    rewriteSpan,
    askBrainstorm,
    liftToSynopsis,
    suggestAlternatives,
    suggestSentenceSplit,
    suggestParagraphBreak,
    stopDraft,
    extractChapter,
    analyzeChapter,
    addFact,
    reviseFact: revise,
    approve,
    reject
  };

  return <BookStoreContext.Provider value={value}>{children}</BookStoreContext.Provider>;
}

export function useBookStore(): BookStoreValue {
  const value = useContext(BookStoreContext);
  if (!value) throw new Error("useBookStore must be used inside BookStoreProvider");
  return value;
}

export function useChapter() {
  const { book, chapterId } = useBookStore();
  if (!book || !chapterId) return null;
  return book.chapters.find((chapter) => chapter.id === chapterId) ?? null;
}

export { addChapter, removeChapter, updateChapter, sortedChapters };
