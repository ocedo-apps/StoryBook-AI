import { createContext, useContext } from "react";
import type { Book, BookSummary, EditorSurface } from "@core/BookSchema";
import type { AskManuscriptAnswer } from "@core/askManuscript";
import type { InterviewMessage } from "@core/characterInterview";
import type { DevelopmentStep } from "@core/developmentMethod";
import type { ChapterFeedback } from "@core/chapterFeedback";
import type { FactDraft } from "@core/NarrativeFact";
import type { CorePredicate } from "@core/predicates";
import type { ProofreadStage } from "@core/proofread";
import type { TextSpan } from "@core/textSpan";
import type { PromptDebugEntry } from "./promptDebug";
import type { LlmEngine } from "@llm/provider";

export type Busy =
  | "draft"
  | "extract"
  | "extend"
  | "elaborate"
  | "instruct"
  | "beat"
  | "ask"
  | "ask-manuscript"
  | "recast"
  | "analyze"
  | "proofread"
  | "illustrate"
  | "interview"
  | "extract-interview"
  | "import-lore"
  | "develop"
  | null;

export type BookStoreValue = {
  summaries: BookSummary[];
  book: Book | null;
  chapterId: string | null;
  surface: EditorSurface;
  models: string[];
  model: string;
  writingPrimer: string;
  reviewModel: string;
  engine: LlmEngine;
  baseUrl: string;
  historyLimit: number;
  ollamaError: string | null;
  busy: Busy;
  error: string | null;
  chapterFeedback: ChapterFeedback | null;
  modelAsides: string[];
  lastPrompt: PromptDebugEntry | null;
  askManuscriptAnswer: AskManuscriptAnswer | null;
  interviewEntity: { ref: string; label: string } | null;
  interviewHistory: InterviewMessage[];
  interviewPersonalityDraft: string;
  developSuggestion: string | null;
  refresh: () => Promise<void>;
  openBook: (id: string) => Promise<void>;
  closeBook: () => void;
  newBook: (title: string) => Promise<void>;
  importManuscript: (file: File) => Promise<void>;
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
  dismissModelAside: () => void;
  setModel: (name: string) => void;
  setWritingPrimer: (text: string) => void;
  resetWritingPrimer: () => void;
  setReviewModel: (name: string) => void;
  setEngine: (engine: LlmEngine) => void;
  setBaseUrl: (url: string) => void;
  setHistoryLimit: (n: number) => void;
  draftChapter: () => Promise<void>;
  recastChapter: () => Promise<void>;
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
  askBrainstorm: (instruction: string) => Promise<void>;
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
  generateIllustrationPrompt: (passage: string) => Promise<string | null>;
  askManuscript: (question: string) => Promise<void>;
  setDevelopmentMethod: (id: string | null) => Promise<void>;
  developExpand: (step: Extract<DevelopmentStep, { kind: "expand" }>, draft: string) => Promise<void>;
  dismissDevelopSuggestion: () => void;
  startInterview: (entityRef: string, entityLabel: string) => void;
  askCharacter: (question: string) => Promise<void>;
  extractInterview: () => Promise<void>;
  importLoreArticle: (title: string, text: string) => Promise<void>;
  closeInterview: () => void;
  setInterviewPersonalityDraft: (text: string) => void;
  saveInterviewPersonality: () => void;
  addFact: (draft: { label: string; predicate: CorePredicate; value: string; mode?: "replace" | "add" }) => Promise<void>;
  reviseFact: (factId: string, value: string) => Promise<void>;
  approve: (factId: string, value?: string) => Promise<void>;
  reject: (factId: string) => Promise<void>;
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
