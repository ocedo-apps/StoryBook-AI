import { isLiveChapter, sortedChapters, touch, type Book, type Chapter, type EditorSurface } from "./BookSchema";
import { replaceInBrainstormNotes } from "./brainstormNotes";
import { flagEchoes } from "./echoDetect";
import { flagPhraseReuse } from "./phraseReuse";
import { splitFlowParagraphs } from "./proseFlow";

export type FindFlags = {
  matchCase: boolean;
  wholeWord: boolean;
};

export type FindScope = {
  surface: EditorSurface | "manuscript";
  chapterId?: string;
  includeBrainstorm: boolean;
};

export type FindSnippetField = "brainstorm" | "synopsis" | "voice" | "viewpoint" | "title" | "brief" | "prose";

export type FindSnippet = {
  field: FindSnippetField;
  preview: string;
};

export type FindHit = {
  id: string;
  kind: "brainstorm" | "synopsis" | "voice" | "viewpoint" | "chapter";
  count: number;
  snippets: FindSnippet[];
  chapterId?: string;
  chapterTitle?: string;
};

export type FindOccurrence = {
  kind: "brainstorm" | "synopsis" | "chapter";
  field: "brainstorm" | "synopsis" | "prose";
  start: number;
  end: number;
  chapterId?: string;
};

export type OverlayMark = {
  start: number;
  end: number;
  current: boolean;
};

export function defaultFindFlags(): FindFlags {
  return { matchCase: false, wholeWord: false };
}

export type RepeatKind = "echo" | "reuse";

export function flagsForRepeatKind(kind: RepeatKind): FindFlags {
  return { matchCase: false, wholeWord: kind === "echo" };
}

export function listRepeatPhrases(text: string, names: Iterable<string>, kind: RepeatKind): string[] {
  if (kind === "echo") return flagEchoes(text, names).map((hit) => hit.phrase);
  return flagPhraseReuse(text, names).map((hit) => hit.phrase);
}

export function findPattern(needle: string, flags: FindFlags): RegExp | null {
  const source = needle.trim();
  if (!source) return null;
  const escaped = source.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const body = flags.wholeWord ? `(?<![\\p{L}\\p{N}])${escaped}(?![\\p{L}\\p{N}])` : escaped;
  return new RegExp(body, flags.matchCase ? "gu" : "giu");
}

export function replaceInText(text: string, needle: string, replacement: string, flags: FindFlags): string {
  const pattern = findPattern(needle, flags);
  if (!pattern || !text) return text;
  return text.replace(pattern, replacement);
}

export function hitCountInText(text: string, needle: string, flags: FindFlags): number {
  return matchesInText(text, needle, flags).length;
}

const SNIPPET_RADIUS = 42;
const SNIPPET_CAP = 12;

export function matchesInText(text: string, needle: string, flags: FindFlags): { start: number; end: number }[] {
  const pattern = findPattern(needle, flags);
  if (!pattern || !text) return [];
  return [...text.matchAll(pattern)].flatMap((match) => {
    const start = match.index;
    if (start === undefined || !match[0]) return [];
    return [{ start, end: start + match[0].length }];
  });
}

export function snippetsInText(
  text: string,
  needle: string,
  flags: FindFlags,
  field: FindSnippetField
): FindSnippet[] {
  return matchesInText(text, needle, flags)
    .slice(0, SNIPPET_CAP)
    .map((match) => ({ field, preview: snippetAround(text, match.start, match.end) }));
}

export function snippetAround(text: string, start: number, end: number): string {
  let from = Math.max(0, start - SNIPPET_RADIUS);
  let to = Math.min(text.length, end + SNIPPET_RADIUS);
  while (from > 0 && !/\s/.test(text[from] ?? " ")) from -= 1;
  if (from > 0) from += 1;
  while (to < text.length && !/\s/.test(text[to] ?? " ")) to += 1;
  const slice = text.slice(from, to).replace(/\s+/g, " ").trim();
  const prefix = from > 0 ? "…" : "";
  const suffix = to < text.length ? "…" : "";
  return `${prefix}${slice}${suffix}`;
}

export function totalHits(hits: FindHit[]): number {
  return hits.reduce((sum, hit) => sum + hit.count, 0);
}

/** Matches in the big text field, in reading order. Used for next/previous. */
export function listCanvasOccurrences(book: Book, needle: string, flags: FindFlags, scope: FindScope): FindOccurrence[] {
  if (!findPattern(needle, flags)) return [];
  const out: FindOccurrence[] = [];
  const push = (text: string, field: FindOccurrence["field"], kind: FindOccurrence["kind"], chapterId?: string) => {
    for (const match of matchesInText(text, needle, flags)) {
      const row: FindOccurrence = { kind, field, start: match.start, end: match.end };
      if (chapterId !== undefined) row.chapterId = chapterId;
      out.push(row);
    }
  };
  if (includeBrainstorm(scope)) push(book.brainstorm, "brainstorm", "brainstorm");
  if (includeSynopsis(scope)) push(book.synopsis, "synopsis", "synopsis");
  for (const chapter of chaptersInScope(book, scope)) {
    push(chapter.prose, "prose", "chapter", chapter.id);
  }
  return out;
}

export function occurrenceOnPage(
  occurrence: FindOccurrence,
  surface: EditorSurface,
  chapterId: string | null
): boolean {
  if (surface === "brainstorm") return occurrence.field === "brainstorm";
  if (surface === "synopsis") return occurrence.field === "synopsis";
  if (surface === "settings") return false;
  return occurrence.field === "prose" && occurrence.chapterId === chapterId;
}

/** Marks per paragraph, matching the overlay that sits on the text field. */
export function findMarksByParagraph(
  text: string,
  needle: string,
  flags: FindFlags,
  activeStart?: number
): OverlayMark[][] {
  const matches = matchesInText(text, needle, flags);
  const paras = splitFlowParagraphs(text);
  let searchFrom = 0;
  return paras.map((block) => {
    let origin = text.indexOf(block, searchFrom);
    if (origin < 0) {
      return matchesInText(block, needle, flags).map((match) => ({
        start: match.start,
        end: match.end,
        current: false
      }));
    }
    searchFrom = origin + block.length;
    return matches
      .filter((match) => match.start >= origin && match.start < origin + block.length)
      .map((match) => ({
        start: match.start - origin,
        end: Math.min(match.end - origin, block.length),
        current: activeStart !== undefined && match.start === activeStart
      }));
  });
}

export function findHits(book: Book, needle: string, flags: FindFlags, scope: FindScope): FindHit[] {
  if (!findPattern(needle, flags)) return [];
  const hits: FindHit[] = [];
  const add = (hit: FindHit) => {
    if (hit.count > 0) hits.push(hit);
  };

  if (includeBrainstorm(scope)) {
    const snippets = snippetsInText(book.brainstorm, needle, flags, "brainstorm");
    add({
      id: "brainstorm",
      kind: "brainstorm",
      count: hitCountInText(book.brainstorm, needle, flags),
      snippets
    });
  }
  if (includeSynopsis(scope)) {
    const snippets = snippetsInText(book.synopsis, needle, flags, "synopsis");
    add({
      id: "synopsis",
      kind: "synopsis",
      count: hitCountInText(book.synopsis, needle, flags),
      snippets
    });
  }
  if (includeManuscriptCraft(scope)) {
    add({
      id: "voice",
      kind: "voice",
      count: hitCountInText(book.voice, needle, flags),
      snippets: snippetsInText(book.voice, needle, flags, "voice")
    });
    add({
      id: "viewpoint",
      kind: "viewpoint",
      count: hitCountInText(book.viewpoint, needle, flags),
      snippets: snippetsInText(book.viewpoint, needle, flags, "viewpoint")
    });
  }
  for (const chapter of chaptersInScope(book, scope)) {
    const snippets = [
      ...snippetsInText(chapter.title, needle, flags, "title"),
      ...snippetsInText(chapter.brief, needle, flags, "brief"),
      ...snippetsInText(chapter.prose, needle, flags, "prose"),
      ...snippetsInText(chapter.voice ?? "", needle, flags, "voice"),
      ...snippetsInText(chapter.viewpoint ?? "", needle, flags, "viewpoint")
    ];
    const count =
      hitCountInText(chapter.title, needle, flags) +
      hitCountInText(chapter.brief, needle, flags) +
      hitCountInText(chapter.prose, needle, flags) +
      hitCountInText(chapter.voice ?? "", needle, flags) +
      hitCountInText(chapter.viewpoint ?? "", needle, flags);
    add({
      id: `chapter:${chapter.id}`,
      kind: "chapter",
      count,
      snippets: snippets.slice(0, SNIPPET_CAP),
      chapterId: chapter.id,
      chapterTitle: chapter.title.trim()
    });
  }
  return hits;
}

/**
 * Literal replace in prose and writing instructions.
 * Story Bible claims stay. Brainstorm stays unless the scope says otherwise.
 */
export function replaceInBook(book: Book, needle: string, replacement: string, flags: FindFlags, scope: FindScope): Book {
  const hits = findHits(book, needle, flags, scope);
  if (totalHits(hits) === 0) return book;
  if (needle.trim() === replacement && flags.matchCase) return book;

  const swap = (text: string) => replaceInText(text, needle, replacement, flags);
  const nextChapters = book.chapters.map((chapter) =>
    chapterInScope(chapter, scope) ? replaceInChapter(chapter, swap) : chapter
  );
  const scratch = includeBrainstorm(scope) ? replaceInBrainstormNotes(book, swap) : book;

  return touch(book, {
    ...(includeBrainstorm(scope)
      ? { brainstorm: scratch.brainstorm, brainstorm_notes: scratch.brainstorm_notes }
      : {}),
    ...(includeSynopsis(scope) ? { synopsis: swap(book.synopsis) } : {}),
    ...(includeManuscriptCraft(scope) ? { voice: swap(book.voice), viewpoint: swap(book.viewpoint) } : {}),
    chapters: nextChapters
  });
}

function includeBrainstorm(scope: FindScope): boolean {
  return scope.surface === "brainstorm" || (scope.surface === "manuscript" && scope.includeBrainstorm);
}

function includeSynopsis(scope: FindScope): boolean {
  return scope.surface === "manuscript" || scope.surface === "synopsis";
}

function includeManuscriptCraft(scope: FindScope): boolean {
  return scope.surface === "manuscript" || scope.surface === "chapter";
}

function chaptersInScope(book: Book, scope: FindScope): Chapter[] {
  if (scope.surface === "brainstorm" || scope.surface === "synopsis") return [];
  if (scope.surface === "chapter") {
    const chapter = book.chapters.find((item) => item.id === scope.chapterId && isLiveChapter(item));
    return chapter ? [chapter] : [];
  }
  return sortedChapters(book);
}

function chapterInScope(chapter: Chapter, scope: FindScope): boolean {
  if (!isLiveChapter(chapter)) return false;
  if (scope.surface === "brainstorm" || scope.surface === "synopsis") return false;
  if (scope.surface === "chapter") return chapter.id === scope.chapterId;
  return true;
}

function replaceInChapter(chapter: Chapter, swap: (text: string) => string): Chapter {
  const next: Chapter = {
    ...chapter,
    title: swap(chapter.title),
    brief: swap(chapter.brief),
    prose: swap(chapter.prose)
  };
  if (chapter.voice !== undefined) next.voice = swap(chapter.voice);
  if (chapter.viewpoint !== undefined) next.viewpoint = swap(chapter.viewpoint);
  return next;
}
