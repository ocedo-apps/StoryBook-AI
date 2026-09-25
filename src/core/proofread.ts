import type { Book, Chapter } from "./BookSchema";
import { POV_LABELS, TENSE_LABELS, resolveCraft, summarizeCraft } from "./craft";
import { recoverJsonObject } from "./extractFacts";
import { formatBibleForPrompt, resolveVoice } from "./generateProse";
import { newId, nowIso } from "./ids";
import { analyzeProse, entityNameTokens } from "./proseStats";
import { tallyRareWords } from "./rareWords";
import { formatReaderForReview, kidlitReader, readerTuning, resolveReader } from "./reader";
import { splitFlowParagraphs } from "./proseFlow";
import { entityLabels } from "./bibleGroups";
import { bookFactChains, chainsWithHistory } from "./bibleHistory";
import { timelineEntries } from "./timeline";
import {
  ProofreadFlagSchema,
  ProofreadJobSchema,
  PROOFREAD_STAGES,
  PROOFREAD_STATUSES,
  SceneQueueItemSchema,
  type ProofreadFlag,
  type ProofreadJob,
  type ProofreadStage,
  type ProofreadStatus,
  type SceneQueueItem
} from "./proofreadSchema";

export {
  ProofreadFlagSchema,
  ProofreadJobSchema,
  PROOFREAD_STAGES,
  PROOFREAD_STATUSES,
  SceneQueueItemSchema
};
export type { ProofreadFlag, ProofreadJob, ProofreadStage, ProofreadStatus, SceneQueueItem };

export function proseChapters(book: Book): Chapter[] {
  return book.chapters
    .filter((chapter) => chapter.discarded_at === undefined && chapter.prose.trim().length > 0)
    .sort((a, b) => a.sequence_index - b.sequence_index);
}

export function proseHash(text: string): string {
  let hash = 2166136261;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16);
}

export function chapterHashes(book: Book): Record<string, string> {
  const hashes: Record<string, string> = {};
  for (const chapter of proseChapters(book)) {
    hashes[chapter.id] = proseHash(chapter.prose);
  }
  return hashes;
}

export function startProofreadJob(book: Book): ProofreadJob {
  const stamp = nowIso();
  return {
    id: newId(),
    started_at: stamp,
    updated_at: stamp,
    status: "running",
    stage: "grammar",
    grammarDone: [],
    scenePairsTotal: 0,
    scenePairsDone: 0,
    sceneQueue: [],
    sceneQueueIndex: 0,
    styleDone: false,
    ageDone: false,
    continuityDone: false,
    setupsDone: false,
    factsDone: [],
    detail: "",
    flags: [],
    craftNotes: [],
    chapterHashes: chapterHashes(book)
  };
}

export function touchProofread(job: ProofreadJob, patch: Partial<ProofreadJob>): ProofreadJob {
  return { ...job, ...patch, updated_at: nowIso() };
}

export function proofreadPercent(job: ProofreadJob, chapterCount: number): number {
  if (job.status === "done" || job.stage === "done") return 100;
  const chapters = Math.max(1, chapterCount);
  if (job.stage === "grammar") {
    return Math.round((job.grammarDone.length / chapters) * 28);
  }
  if (job.stage === "scenes") {
    const local = job.scenePairsTotal ? job.scenePairsDone / job.scenePairsTotal : 1;
    if (job.sceneQueue.length === 0) return 28 + Math.round(local * 22);
    if (job.scenePairsDone < job.scenePairsTotal) return 28 + Math.round(local * 22);
    const llm = job.sceneQueueIndex / Math.max(1, job.sceneQueue.length);
    return 50 + Math.round(llm * 22);
  }
  if (job.stage === "style") return job.styleDone ? 85 : 74;
  if (job.stage === "facts") return 92 + Math.round((job.factsDone.length / chapters) * 8);
  return 92;
}

export function flagStale(job: ProofreadJob, book: Book): ProofreadJob {
  const live = chapterHashes(book);
  const flags = job.flags.map((flag) => {
    const left = live[flag.chapterId] !== job.chapterHashes[flag.chapterId];
    const right = flag.chapterIdB ? live[flag.chapterIdB] !== job.chapterHashes[flag.chapterIdB] : false;
    if (!left && !right) {
      if (!flag.stale) return flag;
      const next = { ...flag };
      delete next.stale;
      return next;
    }
    return flag.stale ? flag : { ...flag, stale: true };
  });
  return { ...job, flags };
}

export function craftDriftNotes(book: Book): string[] {
  const chapters = proseChapters(book);
  const manuscript = resolveCraft(book);
  const notes: string[] = [];
  for (const chapter of chapters) {
    const craft = resolveCraft(book, chapter);
    const n = chapter.sequence_index + 1;
    const title = chapter.title.trim() || `Chapter ${n}`;
    if (chapter.pov !== undefined && craft.pov !== manuscript.pov) {
      notes.push(`${title} is set to ${POV_LABELS[craft.pov]} while the manuscript default is ${POV_LABELS[manuscript.pov]}.`);
    }
    if (chapter.tense !== undefined && craft.tense !== manuscript.tense) {
      notes.push(`${title} is set to ${TENSE_LABELS[craft.tense].toLowerCase()} while the manuscript default is ${TENSE_LABELS[manuscript.tense].toLowerCase()}.`);
    }
    if (chapter.viewpoint !== undefined && craft.viewpoint.trim() !== manuscript.viewpoint.trim()) {
      notes.push(
        `${title} looks through ${craft.viewpoint.trim() || "no named viewpoint"} while the manuscript default is ${manuscript.viewpoint.trim() || "unset"}.`
      );
    }
  }
  return notes;
}

export type AgeStats = {
  words: number;
  chapters: number;
  meanSentence: number;
  longCount: number;
  rareShare: number;
  readerAge?: number;
};

export function manuscriptAgeStats(book: Book): AgeStats {
  const chapters = proseChapters(book);
  const names = entityLabels(book.facts, book.entity_kinds);
  const text = chapters.map((chapter) => chapter.prose).join("\n\n");
  const readerAge = resolveReader(book);
  const tuning = readerTuning(readerAge);
  const stats = analyzeProse(text, entityNameTokens(names), { longSentence: tuning.longSentence });
  const rare = tallyRareWords(
    text,
    names,
    tuning.extraSyllables !== undefined ? { extraSyllables: tuning.extraSyllables } : undefined
  );
  const row: AgeStats = {
    words: stats.words,
    chapters: chapters.length,
    meanSentence: stats.meanSentence,
    longCount: stats.longCount,
    rareShare: stats.words ? rare.count / stats.words : 0
  };
  if (readerAge !== undefined) row.readerAge = readerAge;
  return row;
}

export const GRAMMAR_SYSTEM = `You proofread one chapter of fiction. You do not write prose.
Return JSON only, shaped as: {"items":[{"quote":"...","observation":"...","suggestion":"..."}]}

Flag only:
- a clear grammar break (agreement, tense slip that is not the chosen tense, a sentence that does not parse)
- a spelling error that is not a name, a dialect choice, or an invented in-world term

Rules:
- quote must be verbatim from the chapter, short enough to find.
- observation names the problem in one short sentence. It is not a rewrite.
- suggestion is optional: a corrected wording for that quote only. The author decides. Omit it if you are unsure.
- Do not flag Voice, dialect, fragments used as style, or Story Bible names.
- Do not flag POV or tense that match the camera you were given.
- Empty is allowed: {"items":[]}.
- At most 8 items. Prefer the strongest flags.`;

export function grammarUserPrompt(book: Book, chapter: Chapter): string {
  const craft = resolveCraft(book, chapter);
  const voice = resolveVoice(book, chapter);
  const names = entityLabels(book.facts, book.entity_kinds);
  const parts = [
    `Manuscript: ${book.title}`,
    `Camera: ${summarizeCraft(craft)}`,
    voice ? `Voice:\n${voice}` : "Voice is unset.",
    names.length > 0 ? `Do not flag these names:\n${names.join(", ")}` : "",
    `Story Bible:\n${formatBibleForPrompt(book, "No locked facts yet.")}`,
    `Chapter ${chapter.sequence_index + 1}: ${chapter.title.trim() || "Untitled"}`,
    `Prose:\n${chapter.prose.trim()}`,
    "Proofread only this chapter. JSON only."
  ];
  return parts.filter(Boolean).join("\n\n");
}

export function parseGrammarItems(raw: string, prose: string): Omit<ProofreadFlag, "id" | "stage" | "chapterId">[] {
  let payload: unknown;
  try {
    payload = recoverJsonObject(raw);
  } catch {
    return [];
  }
  const rows = (payload as { items?: unknown })?.items;
  if (!Array.isArray(rows)) return [];
  const items: Omit<ProofreadFlag, "id" | "stage" | "chapterId">[] = [];
  for (const row of rows) {
    if (items.length >= 8) break;
    if (!row || typeof row !== "object") continue;
    const rec = row as Record<string, unknown>;
    const quote = typeof rec.quote === "string" ? rec.quote.trim() : "";
    const observation = typeof rec.observation === "string" ? rec.observation.trim() : "";
    if (quote.length < 4 || !observation) continue;
    if (!quoteInProse(prose, quote)) continue;
    const suggestion = typeof rec.suggestion === "string" ? rec.suggestion.trim() : "";
    const item: Omit<ProofreadFlag, "id" | "stage" | "chapterId"> = { quote, observation };
    if (suggestion && suggestion !== quote) item.suggestion = suggestion;
    items.push(item);
  }
  return items;
}

export const SCENE_SYSTEM = `You compare two passages from the same novel. You do not write prose.
Return JSON only: {"same":false,"refrain":false,"observation":"..."}

same is true only when both passages narrate the same beat or event, just with different wording (the lock is turned twice as if it were the first time; the same arrival happens twice).
refrain is true when the echo is a deliberate callback, motif, or later consequence — then same must be false.
If the passages are different events, same is false and refrain is false.

Rules:
- observation is one short sentence. Empty if same is false and refrain is false.
- Never invent plot. Never mention brainstorm.`;

export function sceneUserPrompt(left: { title: string; n: number; text: string }, right: { title: string; n: number; text: string }): string {
  return [
    `Passage A — Chapter ${left.n}: ${left.title}`,
    clip(left.text, 900),
    `Passage B — Chapter ${right.n}: ${right.title}`,
    clip(right.text, 900),
    "JSON only."
  ].join("\n\n");
}

export function parseSceneVerdict(raw: string): { same: boolean; observation: string } | null {
  let payload: unknown;
  try {
    payload = recoverJsonObject(raw);
  } catch {
    return null;
  }
  if (!payload || typeof payload !== "object") return null;
  const rec = payload as Record<string, unknown>;
  const same = rec.same === true;
  const refrain = rec.refrain === true;
  if (!same || refrain) return null;
  const observation = typeof rec.observation === "string" ? rec.observation.trim() : "";
  if (!observation) return null;
  return { same: true, observation };
}

export const STYLE_SYSTEM = `You review whether chapters of a novel stay in the same register and mood. You do not write prose.
Return JSON only: {"items":[{"chapter":1,"quote":"...","observation":"..."}]}

Flag a genuine slip, of either kind:
- Register: the narrator’s diction, sentence shape, or irony jumps in a way the Voice field does not ask for.
- Mood: the emotional atmosphere lurches against its neighboring chapters — a chapter reads whimsical right after one that read grim, with nothing in the story (a twist, a death, a reveal) to earn the turn.
Do not flag a chapter that was given a different camera on purpose.
Do not flag a one-off short sentence in a chase.
Do not flag a deliberate tonal turn the story itself sets up.
Empty is allowed: {"items":[]}.
At most 8 items. quote must be verbatim.`;

export function styleUserPrompt(book: Book): string {
  const voice = book.voice.trim();
  const chapters = proseChapters(book);
  const samples = chapters.map((chapter) => {
    const craft = resolveCraft(book, chapter);
    const n = chapter.sequence_index + 1;
    const title = chapter.title.trim() || `Chapter ${n}`;
    const chapterVoice = resolveVoice(book, chapter);
    const paras = splitFlowParagraphs(chapter.prose);
    const head = paras.slice(0, 2).join(" ");
    const tail = paras.length > 2 ? paras[paras.length - 1] : "";
    return [
      `Chapter ${n}: ${title}`,
      `Camera: ${summarizeCraft(craft)}`,
      chapterVoice && chapterVoice !== voice ? `Chapter voice: ${chapterVoice}` : "",
      clip(head, 420),
      tail ? clip(tail, 280) : ""
    ]
      .filter(Boolean)
      .join("\n");
  });
  return [
    `Manuscript: ${book.title}`,
    voice ? `Voice (intended register):\n${voice}` : "Voice is unset. Only flag a wild jump in diction.",
    samples.join("\n\n"),
    "JSON only."
  ].join("\n\n");
}

export function parseStyleItems(
  raw: string,
  book: Book
): Omit<ProofreadFlag, "id" | "stage">[] {
  let payload: unknown;
  try {
    payload = recoverJsonObject(raw);
  } catch {
    return [];
  }
  const rows = (payload as { items?: unknown })?.items;
  if (!Array.isArray(rows)) return [];
  const chapters = proseChapters(book);
  const items: Omit<ProofreadFlag, "id" | "stage">[] = [];
  for (const row of rows) {
    if (items.length >= 8) break;
    if (!row || typeof row !== "object") continue;
    const rec = row as Record<string, unknown>;
    const n = typeof rec.chapter === "number" ? rec.chapter : Number(rec.chapter);
    const chapter = chapters.find((item) => item.sequence_index + 1 === n) ?? chapters[n - 1];
    if (!chapter) continue;
    const quote = typeof rec.quote === "string" ? rec.quote.trim() : "";
    const observation = typeof rec.observation === "string" ? rec.observation.trim() : "";
    if (quote.length < 8 || !observation) continue;
    items.push({ chapterId: chapter.id, quote, observation });
  }
  return items;
}

export const AGE_SYSTEM = `You write a short last-pass note on whether the prose fits the intended reader. You do not write prose.
Return JSON only: {"report":"...","items":[{"chapter":1,"quote":"...","observation":"...","category":"craft"}]}

report is 2–5 sentences. It may use the numbers you were given. It is not a rewrite and not a request to bowdlerize.
items are optional quotes that would lose that reader, or — when Reader is under 18 — an adult taking the decisive move, or a moral stated instead of earned. Tag these "category":"craft".
When Reader is under 18, also read for profanity, graphic violence, and sexual or explicit content that does not fit that age, even where it otherwise serves the story. Tag these "category":"content". Age-appropriate danger, fear, or loss is not itself a flag — only flag what a parent or librarian would call out as wrong for that specific age.
Empty items are allowed. At most 6 items.`;

export function ageUserPrompt(book: Book, stats: AgeStats): string {
  const reader = formatReaderForReview(stats.readerAge);
  const kid = kidlitReader(stats.readerAge);
  const share = Math.round(stats.rareShare * 100);
  return [
    `Manuscript: ${book.title}`,
    stats.readerAge !== undefined
      ? `Reader age: ${stats.readerAge}`
      : "Reader is unset. Use an adult baseline. Do not ask to simplify.",
    reader,
    `Numbers (whole manuscript, live chapters only): ${stats.chapters} chapters, ${stats.words} words, typical sentence ${stats.meanSentence.toFixed(1)} words, ${stats.longCount} long sentences, ${share}% uncommon words.`,
    kid ? "Use child_agency and lecture when they apply." : "Skip child_agency and lecture.",
    kid
      ? "This is a children's/YA manuscript. Read closely for profanity, graphic violence, and sexual or explicit content unsuited to this reader, and tag any as content."
      : "",
    "Do not mention brainstorm. JSON only."
  ]
    .filter(Boolean)
    .join("\n\n");
}

export function parseAgeResult(raw: string, book: Book): { report: string; items: Omit<ProofreadFlag, "id" | "stage">[] } {
  let payload: unknown;
  try {
    payload = recoverJsonObject(raw);
  } catch {
    return { report: "", items: [] };
  }
  if (!payload || typeof payload !== "object") return { report: "", items: [] };
  const rec = payload as Record<string, unknown>;
  const report = typeof rec.report === "string" ? rec.report.trim() : "";
  const chapters = proseChapters(book);
  const items: Omit<ProofreadFlag, "id" | "stage">[] = [];
  const rows = rec.items;
  if (Array.isArray(rows)) {
    for (const row of rows) {
      if (items.length >= 6) break;
      if (!row || typeof row !== "object") continue;
      const item = row as Record<string, unknown>;
      const n = typeof item.chapter === "number" ? item.chapter : Number(item.chapter);
      const chapter = chapters.find((entry) => entry.sequence_index + 1 === n) ?? chapters[n - 1];
      if (!chapter) continue;
      const quote = typeof item.quote === "string" ? item.quote.trim() : "";
      const observation = typeof item.observation === "string" ? item.observation.trim() : "";
      if (quote.length < 8 || !observation) continue;
      const category = item.category === "content" ? ({ category: "content" } as const) : {};
      items.push({ chapterId: chapter.id, quote, observation, ...category });
    }
  }
  return { report, items };
}

/** One entity's recorded place across the manuscript, oldest to newest by story time. */
export type ContinuityChain = {
  entityRef: string;
  entityLabel: string;
  entries: {
    chapterId: string;
    /** 1-based reading-order chapter number, the same numbering the rest of Proofread shows the author. */
    chapterNumber: number;
    /** The author's own free-text story-time label for that chapter, e.g. "Day 3". Empty when unset. */
    storyTime: string;
    value: string;
  }[];
};

/**
 * Every entity whose `core.place` fact changed at least once, ordered by
 * story time (not reading order) so a flashback does not look like a jump.
 * Reuses bookFactChains/chainsWithHistory (bibleHistory.ts, built for the
 * Time-aware Story Bible) and timelineEntries (timeline.ts) rather than
 * re-deriving either — this is the deterministic half of Continuity 2.0's
 * spatial check; only the plausibility judgment itself needs the model.
 */
export function manuscriptPlaceChains(book: Book): ContinuityChain[] {
  const storyTimeRank = new Map(timelineEntries(book).map((entry) => [entry.chapterId, entry]));
  const placeChains = chainsWithHistory(bookFactChains(book.facts)).filter((chain) => chain.predicate === "core.place");
  const result: ContinuityChain[] = [];
  for (const chain of placeChains) {
    const head = chain.entries[0];
    if (!head) continue;
    const entries = chain.entries
      .map((fact) => {
        const position = fact.chapter_id ? storyTimeRank.get(fact.chapter_id) : undefined;
        if (!position) return null;
        return {
          chapterId: position.chapterId,
          chapterNumber: position.sequenceIndex + 1,
          storyTime: position.storyTime,
          value: fact.value,
          storyTimeRank: position.storyTimeRank
        };
      })
      .filter((entry): entry is NonNullable<typeof entry> => entry !== null)
      .sort((a, b) => a.storyTimeRank - b.storyTimeRank)
      .map(({ storyTimeRank: _rank, ...entry }) => entry);
    if (entries.length > 1) result.push({ entityRef: head.entity_ref, entityLabel: head.entity_label, entries });
  }
  return result;
}

export const CONTINUITY_SYSTEM = `You check a manuscript's Story Bible for one specific error: an entity (a person or an object) recorded at a place that contradicts where it was recorded earlier, given no established travel or explanation.
Return JSON only: {"items":[{"entity":"...","chapterA":1,"chapterB":2,"observation":"..."}]}

You are given each entity's place history in the manuscript's own story-time order (not reading order), with each chapter's number and any author-given time label. A place changing between entries is normal — that is how a story moves. Only flag a change that looks impossible or unexplained given how much story time passed — for example the same day with no travel shown, or two entries at the same story time with different places for the same entity.
Do not flag a change just because it exists. Do not flag missing detail about HOW an entity traveled — only flag a change that reads as a contradiction, not an ordinary unwritten journey.
Empty items are allowed. At most 6 items.`;

export function continuityUserPrompt(book: Book, chains: ContinuityChain[]): string {
  const blocks = chains.map((chain) => {
    const lines = chain.entries.map(
      (entry) => `  - Chapter ${entry.chapterNumber}${entry.storyTime ? ` (story time: ${entry.storyTime})` : ""}: ${entry.value}`
    );
    return `${chain.entityLabel}:\n${lines.join("\n")}`;
  });
  return [
    `Manuscript: ${book.title}`,
    blocks.length > 0 ? blocks.join("\n\n") : "No entity has more than one recorded place.",
    "JSON only."
  ].join("\n\n");
}

export function parseContinuityResult(raw: string, chains: ContinuityChain[]): Omit<ProofreadFlag, "id" | "stage">[] {
  let payload: unknown;
  try {
    payload = recoverJsonObject(raw);
  } catch {
    return [];
  }
  const rows = (payload as { items?: unknown })?.items;
  if (!Array.isArray(rows)) return [];
  const items: Omit<ProofreadFlag, "id" | "stage">[] = [];
  for (const row of rows) {
    if (items.length >= 6) break;
    if (!row || typeof row !== "object") continue;
    const rec = row as Record<string, unknown>;
    const entity = typeof rec.entity === "string" ? rec.entity.trim() : "";
    const observation = typeof rec.observation === "string" ? rec.observation.trim() : "";
    const aNumber = typeof rec.chapterA === "number" ? rec.chapterA : Number(rec.chapterA);
    const bNumber = typeof rec.chapterB === "number" ? rec.chapterB : Number(rec.chapterB);
    if (!entity || !observation) continue;
    const chain = chains.find((candidate) => candidate.entityLabel === entity);
    if (!chain) continue;
    const a = chain.entries.find((entry) => entry.chapterNumber === aNumber);
    const b = chain.entries.find((entry) => entry.chapterNumber === bNumber);
    if (!a || !b) continue;
    items.push({ chapterId: a.chapterId, chapterIdB: b.chapterId, quote: a.value, quoteB: b.value, observation });
  }
  return items;
}

export const SETUP_SYSTEM = `You check a manuscript for setups that never got a payoff — a planted detail, promise, or question raised early that the story seems to forget: an object called out for later use, a threat or prophecy, a question a character asks that is never answered, a promise made and never kept or broken on the page.
Return JSON only: {"items":[{"chapter":4,"observation":"..."}]}

Only flag a setup that reads as deliberately planted — most background detail never needs a payoff, and not flagging something is always safer than a false alarm. Do not flag a setup that a later chapter's excerpt already appears to resolve. Cite the chapter where it was introduced. The observation should name the setup in one clause and say briefly why it looks unresolved so far.
Empty items are allowed. At most 6 items.`;

export function setupUserPrompt(book: Book): string {
  const chapters = proseChapters(book);
  const samples = chapters.map((chapter) => {
    const n = chapter.sequence_index + 1;
    const title = chapter.title.trim() || `Chapter ${n}`;
    const paras = splitFlowParagraphs(chapter.prose);
    const head = paras.slice(0, 2).join(" ");
    const tail = paras.length > 2 ? paras[paras.length - 1] : "";
    return [`Chapter ${n}: ${title}`, clip(head, 420), tail ? clip(tail, 280) : ""].filter(Boolean).join("\n");
  });
  return [`Manuscript: ${book.title}`, samples.join("\n\n"), "JSON only."].join("\n\n");
}

export function parseSetupResult(raw: string, book: Book): Omit<ProofreadFlag, "id" | "stage">[] {
  let payload: unknown;
  try {
    payload = recoverJsonObject(raw);
  } catch {
    return [];
  }
  const rows = (payload as { items?: unknown })?.items;
  if (!Array.isArray(rows)) return [];
  const chapters = proseChapters(book);
  const items: Omit<ProofreadFlag, "id" | "stage">[] = [];
  for (const row of rows) {
    if (items.length >= 6) break;
    if (!row || typeof row !== "object") continue;
    const rec = row as Record<string, unknown>;
    const n = typeof rec.chapter === "number" ? rec.chapter : Number(rec.chapter);
    const chapter = chapters.find((entry) => entry.sequence_index + 1 === n) ?? chapters[n - 1];
    if (!chapter) continue;
    const observation = typeof rec.observation === "string" ? rec.observation.trim() : "";
    if (!observation) continue;
    items.push({ chapterId: chapter.id, quote: "", observation });
  }
  return items;
}

/**
 * Reuses the existing Extract facts pipeline (EXTRACTOR_SYSTEM,
 * extractorUserPrompt, parseExtractorPayload, ConsistencyGate) across the
 * whole live manuscript — proposals and merge suggestions land in the same
 * Story Bible review queue an author-triggered extraction already uses.
 * No dedicated AI prompt for this stage: this note is just a pointer there.
 */
export function factsObservation(added: number): string {
  return `${added} new ${added === 1 ? "fact" : "facts"} proposed — see Story Bible → Review.`;
}

export function makeFlag(
  stage: ProofreadStage,
  chapterId: string,
  rest: Omit<ProofreadFlag, "id" | "stage" | "chapterId">
): ProofreadFlag {
  return { id: newId(), stage, chapterId, ...rest };
}

function quoteInProse(prose: string, quote: string): boolean {
  const needle = collapse(quote);
  if (!needle) return false;
  return collapse(prose).includes(needle);
}

function collapse(text: string): string {
  return text.replace(/\s+/g, " ").trim().toLowerCase();
}

function clip(text: string, max: number): string {
  const trimmed = text.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max).trim()}…`;
}
