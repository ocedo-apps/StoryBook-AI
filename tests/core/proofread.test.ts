import { describe, expect, it } from "vitest";
import { addChapter, createBook, parseBook, updateChapter, type Book } from "@core/BookSchema";
import {
  craftDriftNotes,
  flagStale,
  grammarUserPrompt,
  parseAgeResult,
  parseGrammarItems,
  parseSceneVerdict,
  proofreadPercent,
  proseHash,
  startProofreadJob
} from "@core/proofread";
import { collectSceneScan } from "@core/proofreadScenes";
import { runProofread } from "@core/proofreadRun";
import type { NarrativeFact } from "@core/NarrativeFact";

function twoChapters() {
  let book = createBook("Night Keys");
  book = addChapter(book);
  const first = book.chapters[0]!.id;
  const second = book.chapters[1]!.id;
  book = updateChapter(book, first, {
    title: "The lock",
    prose:
      "Emma locked the quay door and counted the night keys by the lamp on the wet planks before the stranger spoke a word."
  });
  book = updateChapter(book, second, {
    title: "The harbour",
    prose:
      "At the harbour gate Emma turned the lock and numbered the night keys under the lamp on the wet planks while the tide pulled away."
  });
  return { book, first, second };
}

describe("proofread job", () => {
  it("loads older saves that have no proofread job", () => {
    const book = createBook("Legacy");
    const { proofread: _proofread, ...without } = book;
    void _proofread;
    expect(parseBook(without).proofread).toBeUndefined();
  });

  it("starts a running grammar pass with chapter hashes", () => {
    const { book, first } = twoChapters();
    const job = startProofreadJob(book);
    expect(job.status).toBe("running");
    expect(job.stage).toBe("grammar");
    expect(job.chapterHashes[first]).toBe(proseHash(book.chapters[0]!.prose));
    expect(proofreadPercent(job, 2)).toBe(0);
  });

  it("marks flags stale when that chapter’s prose changed", () => {
    const { book, first } = twoChapters();
    const job = startProofreadJob(book);
    const flagged = {
      ...job,
      flags: [
        {
          id: "g1",
          stage: "grammar" as const,
          chapterId: first,
          quote: "counted the night keys",
          observation: "A slip."
        }
      ]
    };
    const rewritten = updateChapter(book, first, { prose: "Emma waited on the quay." });
    const next = flagStale(flagged, rewritten);
    expect(next.flags[0]?.stale).toBe(true);
  });
});

describe("scene scan", () => {
  it("flags distant paraphrases that share names and content words", () => {
    const { book, first, second } = twoChapters();
    const scan = collectSceneScan(book, ["Emma"]);
    expect(scan.total).toBeGreaterThan(0);
    expect(
      scan.candidates.some((item) => item.chapterId === first && item.chapterIdB === second)
    ).toBe(true);
  });

  it("does not treat neighbouring paragraphs in the same chapter as a repeated scene", () => {
    let book = createBook("Night Keys");
    const id = book.chapters[0]!.id;
    book = updateChapter(book, id, {
      prose: [
        "Emma locked the quay door and counted the night keys by the lamp on the wet planks before anyone spoke.",
        "Emma locked the quay door and counted the night keys by the lamp on the wet planks while the tide turned.",
        "Rain hit the deck and the lamps went out along the canal for the night."
      ].join("\n\n")
    });
    const scan = collectSceneScan(book, ["Emma"]);
    expect(scan.candidates.some((item) => item.chapterId === id && item.chapterIdB === id)).toBe(false);
  });
});

describe("prompts and parsers", () => {
  it("keeps brainstorm out of the grammar prompt", () => {
    const { book, first } = twoChapters();
    const secret = {
      ...book,
      brainstorm: "The stowaway is the captain's sister. Do not reveal this yet."
    };
    const chapter = secret.chapters.find((item) => item.id === first)!;
    const prompt = grammarUserPrompt(secret, chapter);
    expect(prompt).toContain("Emma locked the quay door");
    expect(prompt).not.toContain("stowaway");
    expect(prompt).not.toContain("brainstorm");
    expect(prompt).not.toContain("captain's sister");
  });

  it("keeps grammar items that quote the chapter", () => {
    const items = parseGrammarItems(
      '{"items":[{"quote":"counted the night keys","observation":"Night keys is fine as a name.","suggestion":"counted the keys"}]}',
      "Emma locked the quay door and counted the night keys by the lamp."
    );
    expect(items).toHaveLength(1);
    expect(items[0]?.suggestion).toBe("counted the keys");
  });

  it("drops grammar items that are not in the prose", () => {
    expect(
      parseGrammarItems(
        '{"items":[{"quote":"The skipper sang an aria","observation":"Spelling."}]}',
        "Emma locked the quay door."
      )
    ).toEqual([]);
  });

  it("only keeps a scene verdict when the model says the same beat, not a refrain", () => {
    expect(parseSceneVerdict('{"same":true,"refrain":false,"observation":"The lock is turned twice."}')?.same).toBe(
      true
    );
    expect(parseSceneVerdict('{"same":true,"refrain":true,"observation":"A callback to the keys."}')).toBeNull();
    expect(parseSceneVerdict('{"same":false,"refrain":false,"observation":""}')).toBeNull();
  });

  it("reads an age report", () => {
    const { book, first } = twoChapters();
    const parsed = parseAgeResult(
      `{"report":"Fits a reader of twelve.","items":[{"chapter":1,"quote":"counted the night keys by the lamp","observation":"Fine for twelve."}]}`,
      book
    );
    expect(parsed.report).toContain("twelve");
    expect(parsed.items[0]?.chapterId).toBe(first);
  });
});

describe("craftDriftNotes", () => {
  it("names a chapter whose camera was set apart from the manuscript", () => {
    const { book, second } = twoChapters();
    const shifted = updateChapter(book, second, { pov: "first", viewpoint: "Emma" });
    const notes = craftDriftNotes(shifted);
    expect(notes.some((note) => note.includes("1st person"))).toBe(true);
  });
});

describe("runProofread", () => {
  it("walks the five stages, saves as it goes, and never sends brainstorm", async () => {
    const { book } = twoChapters();
    const secret = { ...book, brainstorm: "The stowaway is the captain's sister." };
    let latest = secret;
    const saved: string[] = [];
    const prompts: string[] = [];
    const job = startProofreadJob(secret);

    await expect(
      runProofread(
        job,
        {
          complete: async (_system, user) => {
            prompts.push(user);
            if (user.includes("Passage A")) {
              return '{"same":true,"refrain":false,"observation":"The lock is turned twice."}';
            }
            if (user.includes("Numbers")) {
              return '{"report":"Holds for the intended reader.","items":[]}';
            }
            if (user.includes("intended register") || user.includes("Voice is unset")) {
              return '{"items":[]}';
            }
            return '{"items":[]}';
          },
          getBook: () => latest,
          save: async (next) => {
            saved.push(next.stage);
            latest = { ...latest, proofread: next };
          },
          saveFacts: async (facts) => {
            latest = { ...latest, facts };
          }
        },
        new AbortController().signal
      )
    ).resolves.toMatchObject({ status: "done", stage: "done" });

    expect(saved.includes("scenes")).toBe(true);
    expect(saved.includes("style")).toBe(true);
    expect(saved.includes("facts")).toBe(true);
    expect(saved.at(-1)).toBe("done");
    expect(prompts.some((prompt) => prompt.includes("stowaway"))).toBe(false);
    expect(latest.proofread?.flags.some((flag) => flag.stage === "scenes")).toBe(true);
  });

  it("throws AbortError before it writes a later stage", async () => {
    const { book } = twoChapters();
    const job = startProofreadJob(book);
    const abort = new AbortController();
    abort.abort();
    await expect(
      runProofread(
        job,
        {
          complete: async () => '{"items":[]}',
          getBook: () => book,
          save: async () => undefined,
          saveFacts: async () => undefined
        },
        abort.signal
      )
    ).rejects.toMatchObject({ name: "AbortError" });
  });
});

function lockedJeffCaptain(chapterId: string): NarrativeFact {
  return {
    id: "locked-jeff",
    entity_ref: "jeff",
    entity_label: "Jeff",
    predicate: "core.identity",
    value: "A captain",
    sequence_index: 0,
    chapter_id: chapterId,
    status: "locked",
    source: "author",
    created_at: "2026-09-14T00:00:00.000Z"
  };
}

function runFactsOnly(book: Book, complete: (system: string, user: string) => Promise<string>) {
  let latest = book;
  const job = { ...startProofreadJob(book), stage: "facts" as const, styleDone: true, ageDone: true };
  return runProofread(
    job,
    {
      complete: async (system, user) => complete(system, user),
      getBook: () => latest,
      save: async (next) => {
        latest = { ...latest, proofread: next };
      },
      saveFacts: async (facts) => {
        latest = { ...latest, facts };
      }
    },
    new AbortController().signal
  ).then(() => latest);
}

describe("runProofread — facts stage", () => {
  it("extracts new facts per chapter and files them for Story Bible review", async () => {
    const { book, first, second } = twoChapters();
    const latest = await runFactsOnly(book, async () => '{"facts":[{"entity_label":"Emma","entity_ref":"emma","predicate":"core.trait","value":"Careful with locks"}]}');

    expect(latest.proofread?.status).toBe("done");
    expect(latest.proofread?.factsDone).toEqual(expect.arrayContaining([first, second]));
    const factFlags = latest.proofread?.flags.filter((flag) => flag.stage === "facts") ?? [];
    // Both chapters proposed the same claim, so only the first files a flag — the second
    // is an exact duplicate of a still-pending proposal, added nothing, and stays silent.
    expect(factFlags).toHaveLength(1);
    expect(factFlags[0]?.observation).toContain("new fact");
    expect(latest.facts.filter((fact) => fact.entity_ref === "emma")).toHaveLength(1);
  });

  it("extracts facts per scene and stamps each with its own scene, not just the chapter's first", async () => {
    let book = createBook("Night Keys");
    const chapterId = book.chapters[0]!.id;
    book = updateChapter(book, chapterId, {
      prose: "Emma locked the quay door.\n\nJeff whistled an old tune.",
      scenes: [
        { id: "scene-a", startParagraph: 0 },
        { id: "scene-b", startParagraph: 1 }
      ]
    });

    const latest = await runFactsOnly(book, async (_system, user) =>
      user.includes("scene 1")
        ? '{"facts":[{"entity_label":"Emma","entity_ref":"emma","predicate":"core.trait","value":"Careful with locks"}]}'
        : user.includes("scene 2")
          ? '{"facts":[{"entity_label":"Jeff","entity_ref":"jeff","predicate":"core.trait","value":"Whistles when nervous"}]}'
          : '{"facts":[]}'
    );

    const emma = latest.facts.find((fact) => fact.entity_ref === "emma");
    const jeff = latest.facts.find((fact) => fact.entity_ref === "jeff");
    expect(emma?.scene_id).toBe("scene-a");
    expect(jeff?.scene_id).toBe("scene-b");

    // Both scenes contributed, but the chapter still gets one summary flag, not one per scene.
    const factFlags = latest.proofread?.flags.filter((flag) => flag.stage === "facts" && flag.chapterId === chapterId) ?? [];
    expect(factFlags).toHaveLength(1);
    expect(factFlags[0]?.observation).toContain("2 new facts");
  });

  it("proposes a merge instead of a hard conflict for a near-duplicate of a locked fact", async () => {
    let { book, first } = twoChapters();
    book = { ...book, facts: [lockedJeffCaptain(first)] };
    const latest = await runFactsOnly(book, async (_system, user) =>
      user.includes("The lock")
        ? '{"facts":[{"entity_label":"Jeff","entity_ref":"jeff","predicate":"core.identity","value":"A captain on a space ship"}]}'
        : '{"facts":[]}'
    );

    const suggestion = latest.facts.find((fact) => fact.is_merge_suggestion);
    expect(suggestion?.value).toBe("A captain on a space ship");
    expect(suggestion?.conflict_with).toBe("locked-jeff");
    const factFlags = latest.proofread?.flags.filter((flag) => flag.stage === "facts") ?? [];
    expect(factFlags.some((flag) => flag.chapterId === first)).toBe(true);
  });

  it("files no flag for a chapter where extraction adds nothing new", async () => {
    const { book } = twoChapters();
    const latest = await runFactsOnly(book, async () => '{"facts":[]}');
    expect(latest.proofread?.flags.filter((flag) => flag.stage === "facts")).toHaveLength(0);
    expect(latest.facts).toHaveLength(0);
  });

  it("survives an unparsable extractor response instead of aborting the pass", async () => {
    const { book } = twoChapters();
    const latest = await runFactsOnly(book, async () => "not json at all");
    expect(latest.proofread?.status).toBe("done");
    expect(latest.facts).toHaveLength(0);
  });

  it("skips chapters already recorded in factsDone when resumed", async () => {
    const { book, first, second } = twoChapters();
    let calls = 0;
    const job = {
      ...startProofreadJob(book),
      stage: "facts" as const,
      styleDone: true,
      ageDone: true,
      factsDone: [first]
    };
    let latest = book;
    await runProofread(
      job,
      {
        complete: async () => {
          calls += 1;
          return '{"facts":[]}';
        },
        getBook: () => latest,
        save: async (next) => {
          latest = { ...latest, proofread: next };
        },
        saveFacts: async (facts) => {
          latest = { ...latest, facts };
        }
      },
      new AbortController().signal
    );
    expect(calls).toBe(1);
    expect(latest.proofread?.factsDone).toEqual(expect.arrayContaining([first, second]));
  });
});
