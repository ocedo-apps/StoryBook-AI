import type { Book } from "./BookSchema";
import type { FactDraft } from "./NarrativeFact";
import { splitFlowParagraphs } from "./proseFlow";
import { entityLabels } from "./bibleGroups";
import { chapterScenes } from "./bookScene";
import { applyExtractorDrafts } from "./ConsistencyGate";
import { EXTRACTOR_SYSTEM, extractorUserPrompt, parseExtractorPayload } from "./extractFacts";
import {
  AGE_SYSTEM,
  GRAMMAR_SYSTEM,
  SCENE_SYSTEM,
  STYLE_SYSTEM,
  ageUserPrompt,
  craftDriftNotes,
  factsObservation,
  grammarUserPrompt,
  makeFlag,
  manuscriptAgeStats,
  parseAgeResult,
  parseGrammarItems,
  parseSceneVerdict,
  parseStyleItems,
  proseChapters,
  sceneUserPrompt,
  styleUserPrompt,
  touchProofread,
  type ProofreadJob
} from "./proofread";
import { collectSceneScan } from "./proofreadScenes";

export type ProofreadIO = {
  complete: (system: string, user: string, signal: AbortSignal) => Promise<string>;
  getBook: () => Book;
  save: (job: ProofreadJob) => Promise<void>;
  /** Persists newly extracted/merged facts as the facts stage adds them. */
  saveFacts: (facts: Book["facts"]) => Promise<void>;
};

export async function runProofread(job: ProofreadJob, io: ProofreadIO, signal: AbortSignal): Promise<ProofreadJob> {
  let current = job;
  current = await runGrammar(current, io, signal);
  current = await runScenes(current, io, signal);
  current = await runStyle(current, io, signal);
  current = await runAge(current, io, signal);
  current = await runFacts(current, io, signal);
  current = touchProofread(current, { status: "done", stage: "done", detail: "" });
  await io.save(current);
  return current;
}

async function runGrammar(job: ProofreadJob, io: ProofreadIO, signal: AbortSignal): Promise<ProofreadJob> {
  let current = job;
  if (current.stage !== "grammar") return current;
  current = touchProofread(current, { stage: "grammar", status: "running" });
  const book = io.getBook();
  const chapters = proseChapters(book);
  for (const chapter of chapters) {
    throwIfAborted(signal);
    if (current.grammarDone.includes(chapter.id)) continue;
    current = touchProofread(current, {
      detail: `grammar:${chapter.sequence_index + 1}`
    });
    await io.save(current);
    const raw = await io.complete(GRAMMAR_SYSTEM, grammarUserPrompt(book, chapter), signal);
    const parsed = parseGrammarItems(raw, chapter.prose);
    const flags = [
      ...current.flags,
      ...parsed.map((item) => makeFlag("grammar", chapter.id, item))
    ];
    current = touchProofread(current, {
      flags,
      grammarDone: [...current.grammarDone, chapter.id]
    });
    await io.save(current);
  }
  return touchProofread(current, { stage: "scenes" });
}

async function runScenes(job: ProofreadJob, io: ProofreadIO, signal: AbortSignal): Promise<ProofreadJob> {
  let current = job;
  if (current.stage !== "scenes" && ["style", "age", "facts", "done"].includes(current.stage)) return current;
  current = touchProofread(current, { stage: "scenes", status: "running" });
  const book = io.getBook();
  if (current.scenePairsTotal === 0 && current.sceneQueue.length === 0) {
    const names = entityLabels(book.facts, book.entity_kinds);
    const scan = collectSceneScan(book, names);
    current = touchProofread(current, {
      scenePairsTotal: scan.total,
      scenePairsDone: scan.total,
      sceneQueue: scan.candidates,
      sceneQueueIndex: 0
    });
    await io.save(current);
  }
  const chapters = new Map(proseChapters(io.getBook()).map((chapter) => [chapter.id, chapter]));
  while (current.sceneQueueIndex < current.sceneQueue.length) {
    throwIfAborted(signal);
    const pair = current.sceneQueue[current.sceneQueueIndex];
    if (!pair) break;
    const left = chapters.get(pair.chapterId);
    const right = chapters.get(pair.chapterIdB);
    if (!left || !right) {
      current = touchProofread(current, { sceneQueueIndex: current.sceneQueueIndex + 1 });
      await io.save(current);
      continue;
    }
    const leftPara = splitFlowParagraphs(left.prose)[pair.paragraphIndex] ?? "";
    const rightPara = splitFlowParagraphs(right.prose)[pair.paragraphIndexB] ?? "";
    current = touchProofread(current, {
      detail: `scenes:${left.sequence_index + 1}:${right.sequence_index + 1}`
    });
    await io.save(current);
    const raw = await io.complete(
      SCENE_SYSTEM,
      sceneUserPrompt(
        { title: left.title.trim() || `Chapter ${left.sequence_index + 1}`, n: left.sequence_index + 1, text: leftPara },
        { title: right.title.trim() || `Chapter ${right.sequence_index + 1}`, n: right.sequence_index + 1, text: rightPara }
      ),
      signal
    );
    const verdict = parseSceneVerdict(raw);
    const flags = verdict
      ? [
          ...current.flags,
          makeFlag("scenes", left.id, {
            chapterIdB: right.id,
            quote: leftPara.trim(),
            quoteB: rightPara.trim(),
            observation: verdict.observation
          })
        ]
      : current.flags;
    current = touchProofread(current, {
      flags,
      sceneQueueIndex: current.sceneQueueIndex + 1
    });
    await io.save(current);
  }
  return touchProofread(current, { stage: "style" });
}

async function runStyle(job: ProofreadJob, io: ProofreadIO, signal: AbortSignal): Promise<ProofreadJob> {
  let current = job;
  if (current.stage !== "style" && ["age", "facts", "done"].includes(current.stage)) return current;
  if (current.styleDone) return touchProofread(current, { stage: "age" });
  throwIfAborted(signal);
  current = touchProofread(current, { stage: "style", status: "running", detail: "style" });
  await io.save(current);
  const book = io.getBook();
  const notes = craftDriftNotes(book);
  const raw = await io.complete(STYLE_SYSTEM, styleUserPrompt(book), signal);
  const parsed = parseStyleItems(raw, book);
    current = touchProofread(current, {
      craftNotes: notes,
      flags: [
        ...current.flags,
        ...parsed.map((item) => {
          const { chapterId, ...rest } = item;
          return makeFlag("style", chapterId, rest);
        })
      ],
      styleDone: true,
      stage: "age"
    });
  await io.save(current);
  return current;
}

async function runAge(job: ProofreadJob, io: ProofreadIO, signal: AbortSignal): Promise<ProofreadJob> {
  let current = job;
  if (current.ageDone || current.stage === "done") return current;
  throwIfAborted(signal);
  current = touchProofread(current, { stage: "age", status: "running", detail: "age" });
  await io.save(current);
  const book = io.getBook();
  const stats = manuscriptAgeStats(book);
  const raw = await io.complete(AGE_SYSTEM, ageUserPrompt(book, stats), signal);
  const parsed = parseAgeResult(raw, book);
  const next: Partial<ProofreadJob> = {
    flags: [
      ...current.flags,
      ...parsed.items.map((item) => {
        const { chapterId, ...rest } = item;
        return makeFlag("age", chapterId, rest);
      })
    ],
    ageDone: true,
    stage: "facts"
  };
  if (parsed.report) next.ageReport = parsed.report;
  current = touchProofread(current, next);
  await io.save(current);
  return current;
}

async function runFacts(job: ProofreadJob, io: ProofreadIO, signal: AbortSignal): Promise<ProofreadJob> {
  let current = job;
  if (current.stage !== "facts") return current;
  current = touchProofread(current, { stage: "facts", status: "running" });
  const chapters = proseChapters(io.getBook());
  for (const chapter of chapters) {
    throwIfAborted(signal);
    if (current.factsDone.includes(chapter.id)) continue;
    current = touchProofread(current, { detail: `facts:${chapter.sequence_index + 1}` });
    await io.save(current);

    const scenes = chapterScenes(chapter);
    let added = 0;
    for (const scene of scenes) {
      if (!scene.prose.trim()) continue;
      throwIfAborted(signal);
      const title = scenes.length > 1 ? `${chapter.title} — scene ${scene.sequence_index + 1}` : chapter.title;
      const raw = await io.complete(EXTRACTOR_SYSTEM, extractorUserPrompt(scene.prose, title), signal);
      let drafts: FactDraft[] = [];
      try {
        drafts = parseExtractorPayload(raw);
      } catch {
        drafts = [];
      }
      const book = io.getBook();
      const before = book.facts.length;
      const nextFacts = applyExtractorDrafts(book.facts, drafts, chapter.sequence_index, chapter.id, scene.id);
      const sceneAdded = nextFacts.length - before;
      if (sceneAdded > 0) await io.saveFacts(nextFacts);
      added += sceneAdded;
    }

    const flags =
      added > 0
        ? [...current.flags, makeFlag("facts", chapter.id, { quote: "", observation: factsObservation(added) })]
        : current.flags;
    current = touchProofread(current, { flags, factsDone: [...current.factsDone, chapter.id] });
    await io.save(current);
  }
  return touchProofread(current, { stage: "done" });
}

function throwIfAborted(signal: AbortSignal): void {
  if (!signal.aborted) return;
  const error = new Error("Aborted");
  error.name = "AbortError";
  throw error;
}
