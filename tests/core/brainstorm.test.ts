import { describe, expect, it } from "vitest";
import {
  appendBrainstormReply,
  brainstormAskUserPrompt,
  brainstormPassageUserPrompt,
  liftFragmentToSynopsis,
  sendStagedNotesToSynopsis
} from "@core/brainstorm";
import {
  addBrainstormNote,
  applyBrainstormNoteTexts,
  boardNotes,
  sendNotes,
  stageBrainstormNote
} from "@core/brainstormNotes";
import { createBook } from "@core/BookSchema";

describe("liftFragmentToSynopsis", () => {
  it("copies a marked note onto an empty map", () => {
    expect(liftFragmentToSynopsis("", "A stowaway is aboard.")).toBe("A stowaway is aboard.");
  });

  it("appends a new fragment under the existing map", () => {
    expect(liftFragmentToSynopsis("Emma keeps the night keys.", "A stranger pays in salt.")).toBe(
      "Emma keeps the night keys.\n\nA stranger pays in salt."
    );
  });

  it("does not double-append the same compiled block", () => {
    const map = "Emma keeps the night keys.\n\nA stranger pays in salt.";
    expect(liftFragmentToSynopsis(map, "A stranger pays in salt.")).toBe(map);
    expect(liftFragmentToSynopsis(map, map)).toBe(map);
  });
});

describe("sendStagedNotesToSynopsis", () => {
  it("appends tray notes in tray order and removes only those with text", () => {
    let book = { ...createBook("Night Keys"), synopsis: "Emma keeps the night keys." };
    book = addBrainstormNote(book, { id: "sister", text: "She may be the captain’s sister." });
    book = addBrainstormNote(book, { id: "salt", text: "Salt on the quay." });
    book = addBrainstormNote(book, { id: "blank", text: "" });
    book = addBrainstormNote(book, { id: "quay", text: "The canal takes the bar." });
    book = stageBrainstormNote(book, "salt");
    book = stageBrainstormNote(book, "quay");
    book = stageBrainstormNote(book, "blank");
    const next = sendStagedNotesToSynopsis(book);
    expect(next.synopsis).toBe(
      "Emma keeps the night keys.\n\nSalt on the quay.\n\nThe canal takes the bar."
    );
    expect(boardNotes(next.brainstorm_notes).map((note) => note.id)).toEqual(["sister"]);
    expect(sendNotes(next.brainstorm_notes).map((note) => note.id)).toEqual(["blank"]);
  });

  it("sends every staged note after live text is written onto empty cards", () => {
    let book = createBook("Night Keys");
    book = addBrainstormNote(book, { id: "a", text: "" });
    book = addBrainstormNote(book, { id: "b", text: "" });
    book = addBrainstormNote(book, { id: "c", text: "" });
    book = stageBrainstormNote(book, "a");
    book = stageBrainstormNote(book, "b");
    book = stageBrainstormNote(book, "c");
    book = applyBrainstormNoteTexts(book, [
      ["a", "First card."],
      ["b", "Second card."],
      ["c", "Third card."]
    ]);
    const next = sendStagedNotesToSynopsis(book);
    expect(next.synopsis).toBe("First card.\n\nSecond card.\n\nThird card.");
    expect(next.brainstorm_notes).toEqual([]);
  });
});

describe("appendBrainstormReply", () => {
  it("starts the page with the reply when notes are empty", () => {
    expect(appendBrainstormReply("", "Two endings:")).toBe("Two endings:");
  });

  it("keeps the author's notes and adds the reply below", () => {
    expect(appendBrainstormReply("A mysterious stowaway.", "Who knows the ship?")).toBe(
      "A mysterious stowaway.\n\nWho knows the ship?"
    );
  });
});

describe("brainstorm prompts", () => {
  it("treats empty notes as the place for secrets, not a ban on secret history", () => {
    const book = createBook("Night Keys");
    const prompt = brainstormAskUserPrompt(book, "Who is the stowaway?");
    expect(prompt).toContain("Who is the stowaway?");
    expect(prompt).toContain("Secrets and alternatives belong in these notes");
    expect(prompt).not.toContain("Do not invent a secret history");
  });

  it("asks to continue a marked note without turning it into chapter prose", () => {
    const book = { ...createBook("Night Keys"), brainstorm: "A mysterious stowaway." };
    const prompt = brainstormPassageUserPrompt({
      book,
      mode: "extend",
      before: "",
      selected: "A mysterious stowaway.",
      after: ""
    });
    expect(prompt).toContain("Stay in scratch");
    expect(prompt).not.toContain("Stay in scene");
    expect(prompt).toContain("Intended manuscript craft");
    expect(prompt).toContain("Do not write chapter prose unless asked");
  });

  it("names the prose language when the author set one", () => {
    const book = { ...createBook("Night Keys"), prose_language: "Norwegian" };
    const prompt = brainstormPassageUserPrompt({
      book,
      mode: "extend",
      before: "",
      selected: "A mysterious stowaway.",
      after: ""
    });
    expect(prompt).toContain("Prose language: Norwegian");
  });

  it("never feeds attached pictures to brainstorm", () => {
    const book = {
      ...createBook("Night Keys"),
      media: [
        {
          entity_ref: "emma",
          pictures: [{ thumbDataUrl: "data:image/jpeg;base64,thumb", imageDataUrl: "data:image/jpeg;base64,SECRETPICTURE" }]
        }
      ]
    };
    const prompt = brainstormAskUserPrompt(book, "Who is the stowaway?");
    expect(prompt).not.toContain("SECRETPICTURE");
    expect(prompt).not.toContain("data:image");
  });

  it("feeds character looks, but never tags", () => {
    const book = createBook("Night Keys");
    const prompt = brainstormAskUserPrompt(
      {
        ...book,
        facts: [
          {
            id: "1",
            entity_ref: "emma",
            entity_label: "Emma",
            predicate: "core.identity",
            value: "Bartender",
            sequence_index: 0,
            status: "locked",
            source: "author",
            created_at: book.created_at
          }
        ],
        profiles: [
          {
            entity_ref: "emma",
            looks: "salt-cut hands",
            personality: "",
            tags: ["SECRETTAG"]
          }
        ]
      },
      "Who is the stowaway?"
    );
    expect(prompt).toContain("Looks: salt-cut hands");
    expect(prompt).not.toContain("SECRETTAG");
  });

  it("omits a hidden card from brainstorm", () => {
    const book = createBook("Night Keys");
    const prompt = brainstormAskUserPrompt(
      {
        ...book,
        facts: [
          {
            id: "1",
            entity_ref: "stranger",
            entity_label: "the stranger",
            predicate: "core.identity",
            value: "Pays in SECRETNAME salt",
            sequence_index: 0,
            status: "locked",
            source: "author",
            created_at: book.created_at
          }
        ],
        hidden_entities: ["stranger"]
      },
      "Who is the stowaway?"
    );
    expect(prompt).not.toContain("SECRETNAME");
    expect(prompt).not.toContain("Pays in");
  });
});
