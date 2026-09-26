import { describe, expect, it } from "vitest";
import { createBook, parseBook, updateChapter } from "@core/BookSchema";
import {
  DEFAULT_PROSE_HISTORY_LIMIT,
  MAX_PROSE_HISTORY_LIMIT,
  MIN_PROSE_HISTORY_LIMIT,
  clampProseHistoryLimit,
  parseProseHistoryLimit,
  readProseHistoryLimit,
  recordProseRevision,
  restoreProseRevision,
  rewriteHistoryOp,
  writeProseHistoryLimit
} from "@core/proseHistory";

function memoryStore(seed: Record<string, string> = {}): Storage {
  const data = { ...seed };
  return {
    get length() {
      return Object.keys(data).length;
    },
    clear() {
      for (const key of Object.keys(data)) delete data[key];
    },
    getItem(key: string) {
      return Object.prototype.hasOwnProperty.call(data, key) ? data[key]! : null;
    },
    key() {
      return null;
    },
    removeItem(key: string) {
      delete data[key];
    },
    setItem(key: string, value: string) {
      data[key] = value;
    }
  };
}

describe("parseProseHistoryLimit", () => {
  it("defaults to 12 and clamps 3–50", () => {
    expect(parseProseHistoryLimit(null)).toBe(DEFAULT_PROSE_HISTORY_LIMIT);
    expect(parseProseHistoryLimit("")).toBe(DEFAULT_PROSE_HISTORY_LIMIT);
    expect(parseProseHistoryLimit("nope")).toBe(DEFAULT_PROSE_HISTORY_LIMIT);
    expect(clampProseHistoryLimit(2)).toBe(MIN_PROSE_HISTORY_LIMIT);
    expect(clampProseHistoryLimit(99)).toBe(MAX_PROSE_HISTORY_LIMIT);
    expect(parseProseHistoryLimit("15")).toBe(15);
  });

  it("round-trips through localStorage", () => {
    const store = memoryStore();
    expect(readProseHistoryLimit(store)).toBe(DEFAULT_PROSE_HISTORY_LIMIT);
    writeProseHistoryLimit(8, store);
    expect(readProseHistoryLimit(store)).toBe(8);
    writeProseHistoryLimit(1, store);
    expect(readProseHistoryLimit(store)).toBe(MIN_PROSE_HISTORY_LIMIT);
  });
});

describe("recordProseRevision", () => {
  it("pushes newest first and does not change live prose", () => {
    let book = createBook("Night Keys");
    const id = book.chapters[0]!.id;
    book = updateChapter(book, id, { prose: "Emma locked the door." });
    book = recordProseRevision(book, id, "draft", "Dawn on the quay.", 12);
    book = recordProseRevision(book, id, "recast", "Emma locked the door.", 12);
    const chapter = book.chapters[0]!;
    expect(chapter.prose).toBe("Emma locked the door.");
    expect(chapter.revisions.map((row) => row.op)).toEqual(["recast", "draft"]);
    expect(chapter.revisions[0]?.prose).toBe("Emma locked the door.");
    expect(chapter.revisions[1]?.prose).toBe("Dawn on the quay.");
  });

  it("drops the oldest when the cap is full", () => {
    let book = createBook("Night Keys");
    const id = book.chapters[0]!.id;
    for (let i = 0; i < 5; i += 1) {
      book = recordProseRevision(book, id, "draft", `v${i}`, 3);
    }
    const rows = book.chapters[0]!.revisions;
    expect(rows).toHaveLength(3);
    expect(rows.map((row) => row.prose)).toEqual(["v4", "v3", "v2"]);
  });

  it("maps instruct onto rewrite", () => {
    expect(rewriteHistoryOp("instruct")).toBe("rewrite");
    expect(rewriteHistoryOp("extend")).toBe("extend");
    expect(rewriteHistoryOp("elaborate")).toBe("elaborate");
    expect(rewriteHistoryOp("beat")).toBe("beat");
  });
});

describe("restoreProseRevision", () => {
  it("jumps to that row and snapshots live prose when it differs", () => {
    let book = createBook("Night Keys");
    const id = book.chapters[0]!.id;
    book = updateChapter(book, id, { prose: "First draft." });
    book = recordProseRevision(book, id, "draft", "", 12);
    book = updateChapter(book, id, { prose: "Recast later." });
    book = recordProseRevision(book, id, "recast", "First draft.", 12);
    book = updateChapter(book, id, { prose: "Live now." });
    const firstDraft = book.chapters[0]!.revisions.find((row) => row.op === "draft")!;
    book = restoreProseRevision(book, id, firstDraft.id, 12);
    const chapter = book.chapters[0]!;
    expect(chapter.prose).toBe("");
    expect(chapter.revisions[0]?.op).toBe("restore");
    expect(chapter.revisions[0]?.prose).toBe("Live now.");
    expect(chapter.revisions.some((row) => row.id === firstDraft.id)).toBe(true);
    expect(chapter.revisions.some((row) => row.op === "recast")).toBe(true);
  });

  it("does nothing when live prose already matches", () => {
    let book = createBook("Night Keys");
    const id = book.chapters[0]!.id;
    book = updateChapter(book, id, { prose: "Same." });
    book = recordProseRevision(book, id, "draft", "Same.", 12);
    const row = book.chapters[0]!.revisions[0]!;
    const next = restoreProseRevision(book, id, row.id, 12);
    expect(next).toBe(book);
    expect(next.chapters[0]?.revisions).toHaveLength(1);
  });
});

describe("parseBook revisions", () => {
  it("loads older chapters that have no revisions list", () => {
    const book = createBook("Legacy");
    const chapter = book.chapters[0]!;
    const { revisions: _revisions, ...without } = chapter;
    void _revisions;
    const parsed = parseBook({ ...book, chapters: [without] });
    expect(parsed.chapters[0]?.revisions).toEqual([]);
  });
});
