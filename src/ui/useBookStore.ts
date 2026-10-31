import { createContext, useContext } from "react";
import type { Book, BookSummary, EditorSurface } from "@core/BookSchema";
import type { BibleKind, EntityKind } from "@core/bibleGroups";
import type { AskManuscriptAnswer } from "@core/askManuscript";
import type { InterviewMessage } from "@core/characterInterview";
import type { BrainstormChatMessage } from "@core/brainstorm";
import type { DevelopmentStep } from "@core/developmentMethod";
import type { ChapterFeedback } from "@core/chapterFeedback";
import type { CriticItem, CriticPersonaId } from "@core/critics";
import type { FactDraft, FactOrigin, NarrativeFact } from "@core/NarrativeFact";
import type { CorePredicate } from "@core/predicates";
import type { ProofreadStage } from "@core/proofread";
import type { MarkerConversionRule } from "@core/markerConversion";
import type { LoreArticleCandidate } from "@core/loreImport";
import type { ImportedChapterCandidate } from "@core/manuscriptImport";
import type { TextSpan } from "@core/textSpan";
import type { PromptDebugEntry } from "./promptDebug";
import type { LlmEngine } from "@llm/provider";
import type { CoreBookRevision } from "@core/coreRevisionRestore";

export type Busy =
  | "draft"
  | "extract"
  | "extend"
  | "elaborate"
  | "instruct"
  | "beat"
  | "brainstorm-chat"
  | "ask-manuscript"
  | "ask-passage"
  | "recast"
  | "polish"
  | "analyze"
  | "critics"
  | "proofread"
  | "illustrate"
  | "interview"
  | "extract-interview"
  | "extract-brainstorm"
  | "extract-synopsis"
  | "extract-brief"
  | "import-lore"
  | "develop"
  | "summarize"
  | "translate"
  | "developmental"
  | null;

/** A Polish result waiting on the author's review (PolishReviewCard) — not yet written to the chapter. */
export type PolishDraft = { chapterId: string; original: string; candidate: string };

export type BookStoreValue = {
  summaries: BookSummary[];
  book: Book | null;
  chapterId: string | null;
  surface: EditorSurface;
  models: string[];
  model: string;
  writingPrimer: string;
  reviewModel: string;
  translateModel: string;
  engine: LlmEngine;
  baseUrl: string;
  contextWindow: number;
  historyLimit: number;
  ollamaError: string | null;
  busy: Busy;
  draftAwaiting: boolean;
  error: string | null;
  chapterFeedback: ChapterFeedback | null;
  criticFeedback: { chapterId: string; items: CriticItem[] } | null;
  runCritics: (personas: CriticPersonaId[]) => Promise<boolean>;
  dismissCriticFeedback: () => void;
  polishDraft: PolishDraft | null;
  modelAsides: string[];
  lastPrompt: PromptDebugEntry | null;
  askManuscriptAnswer: AskManuscriptAnswer | null;
  askPassageAnswer: { question: string; answer: string } | null;
  interviewEntity: { ref: string; label: string; kind: BibleKind } | null;
  interviewHistory: InterviewMessage[];
  interviewPersonalityDraft: string;
  brainstormChatHistory: BrainstormChatMessage[];
  interviewExtractChapterId: string | null;
  interviewExtractSceneId: string | null;
  setInterviewExtractPosition: (chapterId: string, sceneId: string | null) => void;
  developSuggestion: string | null;
  importLoreProgress: { current: number; total: number } | null;
  /** The open book's series' own locked facts, if it belongs to one — empty for a standalone book. Same data Draft/Recast/export merge in; read-only, never the book's own `facts`. */
  seriesFacts: NarrativeFact[];
  refresh: () => Promise<void>;
  openBook: (id: string) => Promise<void>;
  closeBook: () => void;
  newBook: (title: string, seriesId?: string) => Promise<void>;
  newLanguageVersion: (targetLanguage: string) => Promise<void>;
  /** Loads another manuscript by id without opening it — used by the language switcher/stale check (roadmap-ideas.md #43). */
  loadBook: (id: string) => Promise<Book>;
  /** Flush local edits, then queue an explicit owner-only Core checkpoint. */
  checkpointBook: () => Promise<void>;
  restoreCoreRevision: (source: CoreBookRevision, mode: "same-book" | "new-book") => Promise<boolean>;
  importCoreManuscript: (projectId: string) => Promise<void>;
  importManuscript: (file: File) => Promise<void>;
  /** Assigns, or (with `undefined`) clears, which Series a book belongs to — works on any book, not just the open one. */
  setBookSeries: (bookId: string, seriesId: string | undefined) => Promise<void>;
  importMarkdownManuscript: (title: string, chapters: ImportedChapterCandidate[]) => Promise<void>;
  deleteBook: (id: string) => Promise<void>;
  patchBook: (mutate: (book: Book) => Book) => Promise<void>;
  setChapterId: (id: string) => void;
  selectChapter: (id: string) => void;
  showSettings: () => void;
  showBrainstorm: () => void;
  showSynopsis: () => void;
  showAsk: () => void;
  showTimeline: () => void;
  showPlotlines: () => void;
  showMethod: () => void;
  showGuide: () => void;
  showHandbook: () => void;
  convertMarkersToFormatting: (rules: MarkerConversionRule[]) => Promise<{ totalConversions: number; chaptersChanged: number }>;
  smartenManuscriptQuotes: () => Promise<{ chaptersChanged: number }>;
  dismissModelAside: () => void;
  setModel: (name: string) => void;
  setWritingPrimer: (text: string) => void;
  resetWritingPrimer: () => void;
  setReviewModel: (name: string) => void;
  setTranslateModel: (name: string) => void;
  setEngine: (engine: LlmEngine) => void;
  setBaseUrl: (url: string) => void;
  setContextWindow: (n: number) => void;
  suggestContextWindow: () => Promise<number | null>;
  setHistoryLimit: (n: number) => void;
  draftChapter: () => Promise<void>;
  recastChapter: () => Promise<void>;
  translateChapter: () => Promise<void>;
  polishChapter: () => Promise<boolean>;
  acceptPolish: () => Promise<void>;
  discardPolish: () => void;
  draftScene: (sceneId: string) => Promise<void>;
  recastScene: (sceneId: string) => Promise<void>;
  analyzeScene: (sceneId: string) => Promise<boolean>;
  mergeScene: (sceneId: string) => void;
  rewriteSpan: (args: {
    target: "prose" | "synopsis" | "brainstorm";
    mode: "extend" | "elaborate" | "instruct" | "beat";
    span: TextSpan;
    instruction?: string;
  }) => Promise<void>;
  restoreChapterProse: (revisionId: string) => Promise<void>;
  summarizeChapter: (chapterId: string) => Promise<string | undefined>;
  cutChapterDarling: (span: TextSpan) => Promise<void>;
  restoreChapterDarling: (chapterId: string, darlingId: string) => Promise<void>;
  discardChapterDarling: (chapterId: string, darlingId: string) => Promise<void>;
  startBrainstormChat: () => void;
  askBrainstormChat: (message: string) => Promise<void>;
  closeBrainstormChat: () => void;
  liftToSynopsis: (fragment: string) => Promise<void>;
  sendBrainstormToSynopsis: () => Promise<void>;
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
  startProofread: (opts?: { restart?: boolean; stages?: ProofreadStage[]; scopeChapterId?: string }) => Promise<void>;
  startDevelopmentalAnalysis: (opts?: { restart?: boolean }) => Promise<void>;
  generateIllustrationPrompt: (passage: string) => Promise<string | null>;
  askManuscript: (question: string) => Promise<void>;
  askAboutPassage: (args: { span?: TextSpan; question: string }) => Promise<boolean>;
  setDevelopmentMethod: (id: string | null) => Promise<void>;
  developExpand: (step: Extract<DevelopmentStep, { kind: "expand" }>, draft: string) => Promise<void>;
  dismissDevelopSuggestion: () => void;
  startInterview: (entityRef: string, entityLabel: string, kind: BibleKind) => void;
  askCharacter: (question: string) => Promise<void>;
  extractInterview: () => Promise<void>;
  extractBrainstormNote: (noteId: string) => Promise<void>;
  extractSynopsis: () => Promise<void>;
  extractBrief: (chapterId: string, sceneId?: string) => Promise<void>;
  importLoreArticles: (
    articles: LoreArticleCandidate[],
    origin?: FactOrigin
  ) => Promise<{ articlesProcessed: number; articlesWithFacts: number; totalFacts: number }>;
  importSeriesFacts: (drafts: FactDraft[]) => Promise<{ imported: number }>;
  closeInterview: () => void;
  setInterviewPersonalityDraft: (text: string) => void;
  saveInterviewPersonality: () => void;
  addFact: (draft: { label: string; predicate: CorePredicate; value: string; mode?: "replace" | "add" }) => Promise<void>;
  reviseFact: (factId: string, value: string) => Promise<void>;
  retractFact: (factId: string) => Promise<void>;
  approve: (factId: string, value?: string) => Promise<void>;
  reject: (factId: string) => Promise<void>;
  keepSeparate: (factId: string, value?: string) => Promise<void>;
  mirrorRelationshipFact: (
    facts: NarrativeFact[],
    match: { entity_ref: string; predicate: CorePredicate; value: string },
    kinds: EntityKind[]
  ) => Promise<NarrativeFact[]>;
};

export const BookStoreContext = createContext<BookStoreValue | null>(null);

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
