import { describe, expect, it } from "vitest";
import { addChapter, createBook, openingSurface, parseBook, removeChapter, updateChapter } from "@core/BookSchema";

describe("createBook", () => {
  it("starts with an empty bible, empty scratch, and empty synopsis", () => {
    const book = createBook("The Salt Road");
    expect(book.title).toBe("The Salt Road");
    expect(book.pov).toBe("limited");
    expect(book.tense).toBe("past");
    expect(book.viewpoint).toBe("");
    expect(book.brainstorm).toBe("");
    expect(book.synopsis).toBe("");
    expect(book.chapters).toHaveLength(1);
    expect(book.facts).toEqual([]);
    expect(book.media).toEqual([]);
    expect(book.profiles).toEqual([]);
    expect(book.hidden_entities).toEqual([]);
    expect(book.entity_kinds).toEqual([]);
  });

  it("loads older saves that have no synopsis, brainstorm, craft, media, profiles, hidden entities, or kind overrides", () => {
    const book = createBook("Legacy");
    const {
      synopsis: _synopsis,
      brainstorm: _brainstorm,
      pov: _pov,
      tense: _tense,
      viewpoint: _viewpoint,
      media: _media,
      profiles: _profiles,
      hidden_entities: _hidden,
      entity_kinds: _kinds,
      ...without
    } = book;
    void _synopsis;
    void _brainstorm;
    void _pov;
    void _tense;
    void _viewpoint;
    void _media;
    void _profiles;
    void _hidden;
    void _kinds;
    const parsed = parseBook(without);
    expect(parsed.synopsis).toBe("");
    expect(parsed.brainstorm).toBe("");
    expect(parsed.pov).toBe("limited");
    expect(parsed.tense).toBe("past");
    expect(parsed.viewpoint).toBe("");
    expect(parsed.media).toEqual([]);
    expect(parsed.profiles).toEqual([]);
    expect(parsed.hidden_entities).toEqual([]);
    expect(parsed.entity_kinds).toEqual([]);
  });
});

describe("openingSurface", () => {
  it("opens on brainstorm until there is a synopsis or chapter prose", () => {
    const book = createBook("X");
    expect(openingSurface(book)).toBe("brainstorm");
    const mapped = { ...book, synopsis: "Emma leaves before winter." };
    expect(openingSurface(mapped)).toBe("synopsis");
    const started = updateChapter(mapped, mapped.chapters[0]!.id, { prose: "Dawn." });
    expect(openingSurface(started)).toBe("chapter");
  });
});

describe("chapters", () => {
  it("appends and reindexes after remove", () => {
    let book = createBook("X");
    book = addChapter(book);
    book = addChapter(book);
    expect(book.chapters).toHaveLength(3);
    const middle = book.chapters[1]?.id;
    expect(middle).toBeTruthy();
    book = removeChapter(book, middle!);
    expect(book.chapters.map((chapter) => chapter.sequence_index)).toEqual([0, 1]);
  });

  it("will not delete the last chapter", () => {
    const book = createBook("X");
    const only = book.chapters[0]!.id;
    expect(removeChapter(book, only).chapters).toHaveLength(1);
  });

  it("updates prose without touching other chapters", () => {
    let book = addChapter(createBook("X"));
    const first = book.chapters[0]!.id;
    book = updateChapter(book, first, { prose: "The tide pulled at the ropes." });
    expect(book.chapters[0]?.prose).toContain("tide");
    expect(book.chapters[1]?.prose).toBe("");
  });

  it("lets a chapter override viewpoint and then inherit again", () => {
    let book = addChapter({ ...createBook("X"), viewpoint: "Emma" });
    const second = book.chapters[1]!.id;
    book = updateChapter(book, second, { viewpoint: "the stranger" });
    expect(book.chapters[1]?.viewpoint).toBe("the stranger");
    expect(book.chapters[0]?.viewpoint).toBeUndefined();
    book = updateChapter(book, second, { viewpoint: undefined });
    expect(book.chapters[1]?.viewpoint).toBeUndefined();
    expect(Object.prototype.hasOwnProperty.call(book.chapters[1], "viewpoint")).toBe(false);
  });

  it("loads older chapters that have no craft fields", () => {
    const book = createBook("Legacy");
    const chapter = book.chapters[0]!;
    const parsed = parseBook({
      ...book,
      chapters: [
        {
          id: chapter.id,
          title: chapter.title,
          brief: chapter.brief,
          prose: chapter.prose,
          sequence_index: chapter.sequence_index
        }
      ]
    });
    expect(parsed.chapters[0]?.pov).toBeUndefined();
    expect(parsed.chapters[0]?.tense).toBeUndefined();
    expect(parsed.chapters[0]?.viewpoint).toBeUndefined();
    expect(parsed.chapters[0]?.continues_from).toBeUndefined();
  });
});
