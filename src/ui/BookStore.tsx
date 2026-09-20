import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { BRAINSTORM_ASK_SYSTEM, BRAINSTORM_PASSAGE_SYSTEM, brainstormAskUserPrompt, brainstormPassageUserPrompt, liftFragmentToSynopsis, sendStagedNotesToSynopsis } from "@core/brainstorm";
import {
  addBrainstormNote,
  applyAssembledBrainstorm,
  ensureBrainstormNotes,
  nextNotePosition,
  updateBrainstormNote
} from "@core/brainstormNotes";
import { applyAuthorDraft, applyExtractorDrafts, approveFact, rejectFact, reviseFact } from "@core/ConsistencyGate";
import { ANALYZE_SYSTEM, analyzeUserPrompt, parseChapterFeedback, type ChapterFeedback } from "@core/chapterFeedback";
import { EXTRACTOR_SYSTEM, extractorUserPrompt, parseExtractorPayload } from "@core/extractFacts";
import { DRAFT_SYSTEM, PASSAGE_SYSTEM, RECAST_SYSTEM, draftUserPrompt, passageUserPrompt, recastUserPrompt, resolveVoice } from "@core/generateProse";
import { resolveReader, kidlitReader } from "@core/reader";
import { applyExtend, applyReplace, surroundingPassage, type TextSpan } from "@core/textSpan";
import { ALTERNATIVES_SYSTEM, alternativesUserPrompt, dropWrongSense, parseAlternativeWords } from "@core/wordAlternatives";
import { BREAK_SYSTEM, breakUserPrompt, parseParagraphBreak } from "@core/paragraphBreak";
import { SPLIT_SYSTEM, parseSplitSuggestion, splitUserPrompt } from "@core/sentenceSplit";
import { newId, slugify } from "@core/ids";
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
import { BookNotFoundError, BookRepository } from "@persistence/Repository";
import {
  ManuscriptBackupError,
  parseManuscriptBackup
} from "@core/manuscriptBackup";
import { forgetLastJsonBackup, recordLastJsonBackup } from "./jsonBackupStamp";
import { BookStoreContext, type BookStoreValue, type Busy } from "./useBookStore";
import { format, getMessages, STORE_ERROR } from "./i18n";

const MODEL_KEY = "storybook-ai.model";
const REVIEW_MODEL_KEY = "storybook-ai.review-model";
const LAST_BOOK_KEY = "storybook-ai.last-book";

function ollamaHint(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  if (/failed to fetch|networkerror|load failed/i.test(message)) {
    return STORE_ERROR.ollamaOrigins;
  }
  return message;
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
  const [reviewModel, setReviewModelState] = useState(
    () => localStorage.getItem(REVIEW_MODEL_KEY) ?? DEFAULT_REVIEW_MODEL
  );
  const [ollamaError, setOllamaError] = useState<string | null>(null);
  const [busy, setBusy] = useState<Busy>(null);
  const [error, setError] = useState<string | null>(null);
  const [chapterFeedback, setChapterFeedback] = useState<ChapterFeedback | null>(null);
  const bookRef = useRef<Book | null>(null);
  const chapterRef = useRef<string | null>(null);
  const surfaceRef = useRef<EditorSurface>("brainstorm");
  const abortRef = useRef<AbortController | null>(null);
  const saveTimer = useRef<number | null>(null);

  bookRef.current = book;
  chapterRef.current = chapterId;
  surfaceRef.current = surface;

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
      setBook(backup.book);
      setChapterIdState(sortedChapters(backup.book)[0]?.id ?? null);
      setSurface(openingSurface(backup.book));
      setChapterFeedback(null);
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

  const selectChapter = useCallback((id: string) => {
    setChapterIdState(id);
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
      setError(ollamaError ?? STORE_ERROR.noModel);
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
          setBook((prev) => (prev ? applyAssembledBrainstorm(prev, next) : prev));
          return;
        }
        setBook((prev) => (prev && id ? updateChapter(prev, id, { prose: next }) : prev));
      };

      const assemble = () =>
        args.mode === "extend" ? applyExtend(source, args.span, generated) : applyReplace(source, args.span, generated);

      const persistAssembled = async (latest: Book, assembled: string) => {
        if (args.target === "synopsis") await flushSave(touch(latest, { synopsis: assembled }));
        else if (args.target === "brainstorm") {
          const patched = applyAssembledBrainstorm(latest, assembled);
          await flushSave(touch(latest, { brainstorm: patched.brainstorm, brainstorm_notes: patched.brainstorm_notes }));
        }
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
        setError(ollamaError ?? STORE_ERROR.noModel);
        return;
      }

      abortRef.current?.abort();
      const abort = new AbortController();
      abortRef.current = abort;
      setBusy("ask");
      setError(null);

      const noteId = newId();
      const pos = nextNotePosition(ensureBrainstormNotes(current).brainstorm_notes);
      let assembled = "";

      const persistNote = async (latest: Book) => {
        const patched = updateBrainstormNote(latest, noteId, { text: assembled });
        await flushSave(touch(latest, { brainstorm: patched.brainstorm, brainstorm_notes: patched.brainstorm_notes }));
      };

      try {
        await patchBook((book) => addBrainstormNote(book, { id: noteId, text: "", x: pos.x, y: pos.y }));
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
            setBook((prev) => (prev ? updateBrainstormNote(prev, noteId, { text: assembled }) : prev));
          } else if (chunk.type === "error") {
            throw new Error(chunk.message);
          }
        }
        const latest = bookRef.current;
        if (latest) await persistNote(latest);
      } catch (err) {
        if ((err as { name?: string }).name === "AbortError") {
          const latest = bookRef.current;
          if (latest) await persistNote(latest);
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
        const raw = await completeOllamaChat({
          model: reviewModel,
          messages: [
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
        const message = ollamaError ?? STORE_ERROR.noModel;
        setError(message);
        throw new Error(message);
      }
      try {
        const raw = await completeOllamaChat({
          model: reviewModel,
          messages: [
            { role: "system", content: SPLIT_SYSTEM },
            { role: "user", content: splitUserPrompt(sentence, bookRef.current ? activeVoice(bookRef.current, surfaceRef.current, chapterRef.current) : "", bookRef.current ? activeReader(bookRef.current, surfaceRef.current, chapterRef.current) : undefined) }
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
        const message = ollamaError ?? STORE_ERROR.noModel;
        setError(message);
        throw new Error(message);
      }
      try {
        const raw = await completeOllamaChat({
          model: reviewModel,
          messages: [
            { role: "system", content: BREAK_SYSTEM },
            { role: "user", content: breakUserPrompt(paragraph, bookRef.current ? activeVoice(bookRef.current, surfaceRef.current, chapterRef.current) : "", bookRef.current ? activeReader(bookRef.current, surfaceRef.current, chapterRef.current) : undefined) }
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
      if (drafts.length === 0) setError(STORE_ERROR.extractorNone);
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
    importManuscript,
    deleteBook,
    patchBook,
    setChapterId,
    selectChapter,
    showBrainstorm,
    showSynopsis,
    setModel,
    setReviewModel,
    draftChapter,
    recastChapter,
    rewriteSpan,
    askBrainstorm,
    liftToSynopsis,
    sendBrainstormToSynopsis,
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
