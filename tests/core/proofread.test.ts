import { describe, expect, it } from "vitest";
import { addChapter, createBook, parseBook, updateChapter } from "@core/BookSchema";
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
  it("walks the four stages, saves as it goes, and never sends brainstorm", async () => {
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
          }
        },
        new AbortController().signal
      )
    ).resolves.toMatchObject({ status: "done", stage: "done" });

    expect(saved.includes("scenes")).toBe(true);
    expect(saved.includes("style")).toBe(true);
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
          save: async () => undefined
        },
        abort.signal
      )
    ).rejects.toMatchObject({ name: "AbortError" });
  });
});
