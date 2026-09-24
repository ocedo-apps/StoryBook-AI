import { describe, expect, it } from "vitest";
import { addChapter, createBook, updateChapter, type Book } from "@core/BookSchema";
import {
  DRAFT_SYSTEM,
  PASSAGE_SYSTEM,
  RECAST_SYSTEM,
  draftSceneUserPrompt,
  draftUserPrompt,
  formatVoiceForPrompt,
  passageUserPrompt,
  recastSceneUserPrompt,
  recastUserPrompt,
  resolveVoice
} from "@core/generateProse";

function splitBook() {
  let book = createBook("The Salt Road");
  const chapterId = book.chapters[0]!.id;
  book = updateChapter(book, chapterId, {
    prose: "Henrik walked to the quay at dawn.\n\nA gull cried overhead.\n\nHe cast off at last.",
    scenes: [
      { id: "s1", startParagraph: 0, title: "The quay", brief: "Keep it quiet." },
      { id: "s2", startParagraph: 2 }
    ]
  });
  return { book, chapterId };
}

describe("draftUserPrompt", () => {
  it("includes the synopsis as the story map", () => {
    const book = { ...createBook("The Salt Road"), synopsis: "Emma leaves the quay before winter." };
    const prompt = draftUserPrompt(book, book.chapters[0]!);
    expect(prompt).toContain("Emma leaves the quay before winter.");
    expect(prompt).toContain("where the story is going");
  });

  it("omits the synopsis block when it is empty", () => {
    const book = createBook("The Salt Road");
    const prompt = draftUserPrompt(book, book.chapters[0]!);
    expect(prompt).not.toContain("where the story is going");
  });

  it("names the prose language when the author set one", () => {
    const book = { ...createBook("The Salt Road"), prose_language: "Swedish" };
    const prompt = draftUserPrompt(book, book.chapters[0]!);
    expect(prompt).toContain("Prose language: Swedish");
  });

  it("omits the prose language line when it is empty", () => {
    const book = createBook("The Salt Road");
    const prompt = draftUserPrompt(book, book.chapters[0]!);
    expect(prompt).not.toContain("Prose language:");
  });

  it("never feeds earlier chapter versions to the draft", () => {
    let book = createBook("The Salt Road");
    book = updateChapter(book, book.chapters[0]!.id, {
      prose: "Dawn on the quay.",
      revisions: [
        {
          id: "rev-1",
          at: "2026-09-21T00:00:00.000Z",
          op: "draft",
          prose: "SECRET the stowaway is the captain's sister."
        }
      ]
    });
    const prompt = draftUserPrompt(book, book.chapters[0]!);
    expect(prompt).toContain("Dawn on the quay.");
    expect(prompt).not.toContain("SECRET");
    expect(prompt).not.toContain("captain's sister");
  });

  it("never feeds brainstorm notes to the chapter draft", () => {
    const book = {
      ...createBook("The Salt Road"),
      brainstorm: "The stowaway is the captain's sister. Do not reveal this yet.",
      synopsis: "A mysterious stowaway is aboard."
    };
    const prompt = draftUserPrompt(book, book.chapters[0]!);
    expect(prompt).toContain("A mysterious stowaway is aboard.");
    expect(prompt).not.toContain("captain's sister");
    expect(prompt).not.toContain("brainstorm");
  });

  it("never feeds attached pictures to the chapter draft", () => {
    const book = {
      ...createBook("The Salt Road"),
      media: [
        {
          entity_ref: "emma",
          pictures: [{ thumbDataUrl: "data:image/jpeg;base64,thumb", imageDataUrl: "data:image/jpeg;base64,SECRETPICTURE" }]
        }
      ]
    };
    const prompt = draftUserPrompt(book, book.chapters[0]!);
    expect(prompt).not.toContain("SECRETPICTURE");
    expect(prompt).not.toContain("data:image");
  });

  it("feeds character looks and personality, but never tags", () => {
    const book = createBook("The Salt Road");
    const prompt = draftUserPrompt(
      {
        ...book,
        facts: [
          {
            id: "1",
            entity_ref: "emma",
            entity_label: "Emma",
            predicate: "core.identity",
            value: "Bartender at the Aurora Room",
            sequence_index: 0,
            status: "locked",
            source: "author",
            created_at: book.created_at
          }
        ],
        profiles: [
          {
            entity_ref: "emma",
            pronoun: "she",
            approximateAge: 42,
            looks: "salt-cut hands",
            personality: "dry, keeps her own counsel",
            tags: ["SECRETTAG", "double nature"]
          }
        ]
      },
      book.chapters[0]!
    );
    expect(prompt).toContain("Pronoun: she");
    expect(prompt).toContain("Approximate age: 42");
    expect(prompt).toContain("Looks: salt-cut hands");
    expect(prompt).toContain("Personality: dry, keeps her own counsel");
    expect(prompt).not.toContain("SECRETTAG");
    expect(prompt).not.toContain("double nature");
  });

  it("omits a hidden card and a hidden claim from Draft", () => {
    const book = createBook("The Salt Road");
    const withCanon = {
      ...book,
      facts: [
        {
          id: "1",
          entity_ref: "emma",
          entity_label: "Emma",
          predicate: "core.identity" as const,
          value: "Bartender at the Aurora Room",
          sequence_index: 0,
          status: "locked" as const,
          source: "author" as const,
          created_at: book.created_at
        },
        {
          id: "2",
          entity_ref: "emma",
          entity_label: "Emma",
          predicate: "core.trait" as const,
          value: "She killed the skipper",
          sequence_index: 1,
          status: "locked" as const,
          source: "author" as const,
          hidden_from_ai: true,
          created_at: book.created_at
        },
        {
          id: "3",
          entity_ref: "stranger",
          entity_label: "the stranger",
          predicate: "core.identity" as const,
          value: "Pays in salt",
          sequence_index: 2,
          status: "locked" as const,
          source: "author" as const,
          created_at: book.created_at
        }
      ],
      profiles: [
        {
          entity_ref: "stranger",
          looks: "a grey coat",
          personality: "",
          tags: []
        }
      ],
      hidden_entities: ["stranger"]
    };
    const prompt = draftUserPrompt(withCanon, book.chapters[0]!);
    expect(prompt).toContain("Bartender at the Aurora Room");
    expect(prompt).not.toContain("She killed the skipper");
    expect(prompt).not.toContain("Pays in salt");
    expect(prompt).not.toContain("a grey coat");
  });

  it("states the manuscript camera even when viewpoint is empty", () => {
    const book = createBook("The Salt Road");
    const prompt = draftUserPrompt(book, book.chapters[0]!);
    expect(prompt).toContain("Third person limited");
    expect(prompt).toContain("Past tense throughout");
  });

  it("names a first-person viewpoint in present tense", () => {
    const book = { ...createBook("The Salt Road"), pov: "first" as const, tense: "present" as const, viewpoint: "Emma" };
    const prompt = draftUserPrompt(book, book.chapters[0]!);
    expect(prompt).toContain("First person as Emma");
    expect(prompt).toContain("Present tense throughout");
  });

  it("uses a chapter viewpoint instead of the manuscript default", () => {
    let book = { ...createBook("The Salt Road"), viewpoint: "Emma" };
    book = addChapter(book);
    const second = book.chapters[1]!;
    book = updateChapter(book, second.id, { viewpoint: "the stranger" });
    const prompt = draftUserPrompt(book, book.chapters[1]!);
    expect(prompt).toContain("Third person limited to the stranger");
    expect(prompt).not.toContain("Third person limited to Emma");
    expect(prompt).toContain("different point of view");
    expect(prompt).toContain("3rd limited to Emma");
  });

  it("keeps the manuscript camera when the chapter has no override", () => {
    const book = { ...createBook("The Salt Road"), viewpoint: "Emma" };
    const prompt = draftUserPrompt(book, book.chapters[0]!);
    expect(prompt).toContain("limited to Emma");
    expect(prompt).not.toContain("different point of view");
  });

  it("uses a chapter Voice when set, and the manuscript Voice when not", () => {
    let book = { ...createBook("The Salt Road"), voice: "Dry, maritime, short sentences" };
    const inherited = draftUserPrompt(book, book.chapters[0]!);
    expect(inherited).toContain("Dry, maritime, short sentences");
    expect(inherited).not.toContain("different voice");
    book = updateChapter(book, book.chapters[0]!.id, { voice: "Closer, more interior" });
    const prompt = draftUserPrompt(book, book.chapters[0]!);
    expect(prompt).toContain("Closer, more interior");
    expect(prompt).toContain("different voice");
    expect(prompt).not.toContain("Dry, maritime, short sentences");
  });

  it("sends Reader age to draft and does not feed it as canon", () => {
    const book = { ...createBook("The Salt Road"), reader_age: 12 };
    const prompt = draftUserPrompt(book, book.chapters[0]!);
    expect(prompt).toContain("about 12 years old");
    expect(prompt).toContain("not canon");
    expect(prompt).not.toContain("children's book");
  });

  it("uses a chapter Reader when set", () => {
    let book: Book = { ...createBook("The Salt Road"), reader_age: 12 };
    expect(draftUserPrompt(book, book.chapters[0]!)).toContain("about 12 years old");
    book = updateChapter(book, book.chapters[0]!.id, { reader_age: 16 });
    const prompt = draftUserPrompt(book, book.chapters[0]!);
    expect(prompt).toContain("about 16 years old");
    expect(prompt).toContain("different reader");
    expect(prompt).not.toContain("about 12 years old");
  });

  it("still names the chapter after the synopsis", () => {
    let book = { ...createBook("The Salt Road"), synopsis: "A debt in salt." };
    book = updateChapter(book, book.chapters[0]!.id, { title: "The last key" });
    const prompt = draftUserPrompt(book, book.chapters[0]!);
    expect(prompt.indexOf("A debt in salt.")).toBeLessThan(prompt.indexOf("The last key"));
  });
});

describe("resolveVoice", () => {
  it("prefers the chapter field and treats missing as manuscript", () => {
    expect(resolveVoice({ voice: "Dry" }, {})).toBe("Dry");
    expect(resolveVoice({ voice: "Dry" }, { voice: "Closer" })).toBe("Closer");
    expect(formatVoiceForPrompt("Closer", "Dry")).toContain("different voice");
    expect(formatVoiceForPrompt("Dry", "Dry")).toBe("Voice:\nDry");
    expect(formatVoiceForPrompt("")).toBe("");
  });
});

describe("passageUserPrompt", () => {
  it("asks for a continuation of the marked passage", () => {
    const book = createBook("The Salt Road");
    const prompt = passageUserPrompt({
      book,
      chapter: book.chapters[0]!,
      mode: "extend",
      before: "Dawn.",
      selected: "Emma turned the last key.",
      after: ""
    });
    expect(prompt).toContain("Emma turned the last key.");
    expect(prompt).toContain("next sentences");
  });

  it("does not include brainstorm notes in a chapter passage rewrite", () => {
    const book = { ...createBook("The Salt Road"), brainstorm: "The stowaway is the captain's sister." };
    const prompt = passageUserPrompt({
      book,
      chapter: book.chapters[0]!,
      mode: "extend",
      before: "Dawn.",
      selected: "Emma turned the last key.",
      after: ""
    });
    expect(prompt).not.toContain("captain's sister");
  });

  it("asks for a rewrite when elaborating", () => {
    const book = createBook("The Salt Road");
    const prompt = passageUserPrompt({
      book,
      chapter: book.chapters[0]!,
      mode: "elaborate",
      before: "",
      selected: "The tide pulled.",
      after: ""
    });
    expect(prompt).toContain("Rewrite the marked passage");
  });

  it("passes a custom author instruction", () => {
    const book = createBook("The Salt Road");
    const prompt = passageUserPrompt({
      book,
      chapter: book.chapters[0]!,
      mode: "instruct",
      before: "",
      selected: "The tide pulled.",
      after: "",
      instruction: "Shorter, more tension."
    });
    expect(prompt).toContain("Shorter, more tension.");
    expect(prompt).toContain("Author instruction");
    expect(prompt).toContain("Third person limited");
    expect(prompt).toContain("NOTE:");
    expect(prompt).toContain("old phrase");
    expect(prompt).toContain("No heading and no Rewritten passage:");
  });

  it("applies the chapter camera to a passage rewrite", () => {
    let book = { ...createBook("The Salt Road"), viewpoint: "Emma" };
    book = updateChapter(book, book.chapters[0]!.id, { tense: "present" });
    const prompt = passageUserPrompt({
      book,
      chapter: book.chapters[0]!,
      mode: "extend",
      before: "Dawn.",
      selected: "Emma turned the last key.",
      after: ""
    });
    expect(prompt).toContain("Present tense throughout");
    expect(prompt).toContain("different point of view");
  });
});

describe("paragraph focus", () => {
  it("tells draft and rewrite not to pack unrelated narrative layers into one paragraph", () => {
    expect(DRAFT_SYSTEM).toContain("Start a new paragraph when focus shifts");
    expect(PASSAGE_SYSTEM).toContain("Start a new paragraph when focus shifts");
    expect(PASSAGE_SYSTEM).toContain("no Rewritten passage:");
    expect(RECAST_SYSTEM).toContain("Start a new paragraph when focus shifts");
    expect(DRAFT_SYSTEM).toMatch(/not as a film treatment/i);
    expect(PASSAGE_SYSTEM).toMatch(/not as a film treatment/i);
    expect(RECAST_SYSTEM).toMatch(/not as a film treatment/i);
  });
});

describe("recastUserPrompt", () => {
  it("asks to recast existing prose to the chapter camera", () => {
    let book = { ...createBook("The Salt Road"), viewpoint: "Emma" };
    book = updateChapter(book, book.chapters[0]!.id, {
      tense: "present",
      prose: "Emma locked the door and waited."
    });
    const prompt = recastUserPrompt(book, book.chapters[0]!);
    expect(prompt).toContain("Emma locked the door and waited.");
    expect(prompt).toContain("Present tense throughout");
    expect(prompt).toContain("Recast the whole chapter");
    expect(prompt).toContain("3rd limited to Emma");
  });
});

describe("draftSceneUserPrompt", () => {
  it("sends only the target scene's prose to continue, with its title and brief", () => {
    const { book, chapterId } = splitBook();
    const prompt = draftSceneUserPrompt(book, book.chapters.find((c) => c.id === chapterId)!, "s1");
    expect(prompt).toContain("scene 1 of 2");
    expect(prompt).toContain("Scene title: The quay");
    expect(prompt).toContain("Keep it quiet.");
    expect(prompt).toContain(
      "Existing prose for this scene (continue from the end, do not repeat):\nHenrik walked to the quay at dawn.\n\nA gull cried overhead."
    );
  });

  it("shows the next scene's opening as context without asking to repeat it", () => {
    const { book, chapterId } = splitBook();
    const prompt = draftSceneUserPrompt(book, book.chapters.find((c) => c.id === chapterId)!, "s1");
    expect(prompt).toContain("next scene in this chapter already begins");
    expect(prompt).toContain("He cast off at last.");
  });

  it("uses the previous scene's tail, not the previous chapter, for a later scene", () => {
    const { book, chapterId } = splitBook();
    const prompt = draftSceneUserPrompt(book, book.chapters.find((c) => c.id === chapterId)!, "s2");
    expect(prompt).toContain("scene 2 of 2");
    expect(prompt).toContain("End of the previous scene in this chapter");
    expect(prompt).toContain("A gull cried overhead.");
    expect(prompt).toContain("Existing prose for this scene (continue from the end, do not repeat):\nHe cast off at last.");
  });

  it("falls back to the whole-chapter prompt for an unknown scene id", () => {
    const { book, chapterId } = splitBook();
    const chapter = book.chapters.find((c) => c.id === chapterId)!;
    expect(draftSceneUserPrompt(book, chapter, "ghost")).toBe(draftUserPrompt(book, chapter));
  });
});

describe("recastSceneUserPrompt", () => {
  it("sends only the target scene's prose and asks to recast just that scene", () => {
    const { book, chapterId } = splitBook();
    const prompt = recastSceneUserPrompt(book, book.chapters.find((c) => c.id === chapterId)!, "s2");
    expect(prompt).toContain("scene 2 of 2");
    expect(prompt).toContain("Current prose for this scene:\nHe cast off at last.");
    expect(prompt).toContain("Recast only this scene");
    expect(prompt).not.toContain("Henrik walked to the quay at dawn.");
  });
});
