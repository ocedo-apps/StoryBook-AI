import { describe, expect, it } from "vitest";
import { addChapter, createBook, discardChapter, discardedChapters, openingSurface, parseBook, removeChapter, restoreChapter, sortedChapters, updateChapter } from "@core/BookSchema";

describe("createBook", () => {
  it("starts with an empty bible, empty scratch, and empty synopsis", () => {
    const book = createBook("The Salt Road");
    expect(book.title).toBe("The Salt Road");
    expect(book.pov).toBe("limited");
    expect(book.tense).toBe("past");
    expect(book.viewpoint).toBe("");
    expect(book.illustration_orientation).toBe("landscape");
    expect(book.prose_language).toBe("");
    expect(book.brainstorm).toBe("");
    expect(book.brainstorm_notes).toEqual([]);
    expect(book.synopsis).toBe("");
    expect(book.chapters).toHaveLength(1);
    expect(book.chapters[0]?.revisions).toEqual([]);
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
      brainstorm_notes: _notes,
      pov: _pov,
      tense: _tense,
      viewpoint: _viewpoint,
      illustration_orientation: _orientation,
      prose_language: _language,
      media: _media,
      profiles: _profiles,
      hidden_entities: _hidden,
      entity_kinds: _kinds,
      ...without
    } = book;
    void _synopsis;
    void _brainstorm;
    void _notes;
    void _pov;
    void _tense;
    void _viewpoint;
    void _orientation;
    void _language;
    void _media;
    void _profiles;
    void _hidden;
    void _kinds;
    const parsed = parseBook(without);
    expect(parsed.synopsis).toBe("");
    expect(parsed.brainstorm).toBe("");
    expect(parsed.brainstorm_notes).toEqual([]);
    expect(parsed.pov).toBe("limited");
    expect(parsed.tense).toBe("past");
    expect(parsed.viewpoint).toBe("");
    expect(parsed.illustration_orientation).toBe("landscape");
    expect(parsed.prose_language).toBe("");
    expect(parsed.media).toEqual([]);
    expect(parsed.profiles).toEqual([]);
    expect(parsed.hidden_entities).toEqual([]);
    expect(parsed.entity_kinds).toEqual([]);
    expect(parsed.reader_age).toBeUndefined();
  });
});

describe("openingSurface", () => {
  it("opens a blank manuscript on settings", () => {
    const book = createBook("X");
    expect(openingSurface(book)).toBe("settings");
  });

  it("opens on brainstorm once notes exist, then synopsis, then chapter prose", () => {
    const book = { ...createBook("X"), brainstorm: "A stowaway." };
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
    book = discardChapter(book, middle!);
    expect(sortedChapters(book).map((chapter) => chapter.sequence_index)).toEqual([0, 1]);
    expect(discardedChapters(book)).toHaveLength(1);
    expect(book.chapters).toHaveLength(3);
  });

  it("will not discard the last live chapter", () => {
    const book = createBook("X");
    const only = book.chapters[0]!.id;
    expect(discardChapter(book, only).chapters).toHaveLength(1);
    expect(removeChapter(book, only).chapters).toHaveLength(1);
  });

  it("restores a discarded chapter at the end of the live list", () => {
    let book = addChapter(addChapter(createBook("X")));
    const first = book.chapters[0]!;
    book = updateChapter(book, first.id, { prose: "Emma locked the quay." });
    book = discardChapter(book, first.id);
    expect(sortedChapters(book).map((chapter) => chapter.title)).toEqual(["Chapter 2", "Chapter 3"]);
    book = restoreChapter(book, first.id);
    const live = sortedChapters(book);
    expect(live.map((chapter) => chapter.title)).toEqual(["Chapter 2", "Chapter 3", "Chapter 1"]);
    expect(live[2]?.prose).toBe("Emma locked the quay.");
    expect(discardedChapters(book)).toHaveLength(0);
  });

  it("throws a discarded chapter away for good", () => {
    let book = addChapter(createBook("X"));
    const second = book.chapters[1]!;
    book = discardChapter(book, second.id);
    book = removeChapter(book, second.id);
    expect(book.chapters).toHaveLength(1);
    expect(discardedChapters(book)).toHaveLength(0);
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

  it("lets a chapter override Voice and then inherit again", () => {
    let book = addChapter({ ...createBook("X"), voice: "Dry, maritime, short sentences" });
    const second = book.chapters[1]!.id;
    book = updateChapter(book, second, { voice: "Closer, more interior" });
    expect(book.chapters[1]?.voice).toBe("Closer, more interior");
    expect(book.chapters[0]?.voice).toBeUndefined();
    book = updateChapter(book, second, { voice: undefined });
    expect(book.chapters[1]?.voice).toBeUndefined();
    expect(Object.prototype.hasOwnProperty.call(book.chapters[1], "voice")).toBe(false);
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
    expect(parsed.chapters[0]?.voice).toBeUndefined();
    expect(parsed.chapters[0]?.continues_from).toBeUndefined();
    expect(parsed.chapters[0]?.revisions).toEqual([]);
    expect(parsed.chapters[0]?.startImage).toBeUndefined();
  });

  it("round-trips a chapter's start image", () => {
    const book = createBook("Legacy");
    const chapter = book.chapters[0]!;
    const withImage = updateChapter(book, chapter.id, {
      startImage: { thumbDataUrl: "data:image/jpeg;base64,thumb", imageDataUrl: "data:image/jpeg;base64,full" }
    });
    const parsed = parseBook(withImage);
    expect(parsed.chapters[0]?.startImage?.thumbDataUrl).toBe("data:image/jpeg;base64,thumb");
    expect(parsed.chapters[0]?.startImage?.imageDataUrl).toBe("data:image/jpeg;base64,full");

    const withoutImage = updateChapter(withImage, chapter.id, { startImage: undefined });
    expect(withoutImage.chapters[0]?.startImage).toBeUndefined();
  });
});
