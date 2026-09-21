import { describe, expect, it } from "vitest";
import { createBook, parseBook } from "@core/BookSchema";
import {
  addBrainstormNote,
  applyAssembledBrainstorm,
  applyBrainstormNoteTexts,
  boardNotes,
  compileNotesToText,
  ensureBrainstormNotes,
  joinBrainstormNotes,
  nextNotePosition,
  notesInReadingOrder,
  removeBrainstormNote,
  replaceInBrainstormNotes,
  sendNotes,
  stageBrainstormNote,
  unstageBrainstormNote,
  updateBrainstormNote
} from "@core/brainstormNotes";

describe("ensureBrainstormNotes", () => {
  it("leaves an empty scratch page empty", () => {
    const book = createBook("Night Keys");
    expect(ensureBrainstormNotes(book).brainstorm_notes).toEqual([]);
  });

  it("turns older running text into the first note without inventing a second copy", () => {
    const book = { ...createBook("Night Keys"), brainstorm: "A mysterious stowaway." };
    const once = ensureBrainstormNotes(book);
    expect(once.brainstorm_notes).toHaveLength(1);
    expect(once.brainstorm_notes[0]?.text).toBe("A mysterious stowaway.");
    expect(once.brainstorm_notes[0]?.id).toBe(`${book.id}-scratch`);
    expect(ensureBrainstormNotes(once).brainstorm_notes).toHaveLength(1);
  });

  it("loads a save that never had notes", () => {
    const book = createBook("Legacy");
    const { brainstorm_notes: _notes, ...without } = book;
    void _notes;
    const parsed = parseBook({ ...without, brainstorm: "Who knows the ship?" });
    expect(parsed.brainstorm_notes).toHaveLength(1);
    expect(parsed.brainstorm).toBe("Who knows the ship?");
  });
});

describe("note edits", () => {
  it("keeps the running text in sync when notes change", () => {
    let book = createBook("Night Keys");
    book = addBrainstormNote(book, { text: "A stowaway.", x: 40, y: 80 });
    book = addBrainstormNote(book, { text: "Salt on the quay." });
    expect(book.brainstorm).toBe("A stowaway.\n\nSalt on the quay.");
    book = updateBrainstormNote(book, book.brainstorm_notes[0]!.id, { text: "A sister." });
    expect(joinBrainstormNotes(book.brainstorm_notes)).toBe("A sister.\n\nSalt on the quay.");
    book = removeBrainstormNote(book, book.brainstorm_notes[1]!.id);
    expect(book.brainstorm).toBe("A sister.");
  });

  it("gives a new note an id even when none is passed", () => {
    const book = addBrainstormNote(createBook("Night Keys"));
    expect(book.brainstorm_notes[0]?.id.length).toBeGreaterThan(0);
  });

  it("staggers a new note so it does not cover the last one", () => {
    const first = nextNotePosition([]);
    const second = nextNotePosition([{ id: "a", text: "", x: first.x, y: first.y, color: "paper" }]);
    expect(second.x).not.toBe(first.x);
    expect(second.y).not.toBe(first.y);
  });

  it("replaces inside each note, not as one block of text", () => {
    let book = createBook("Night Keys");
    book = addBrainstormNote(book, { text: "Emma on the quay." });
    book = addBrainstormNote(book, { text: "Emma keeps the keys." });
    book = replaceInBrainstormNotes(book, (text) => text.replaceAll("Emma", "Mara"));
    expect(book.brainstorm_notes.map((note) => note.text)).toEqual(["Mara on the quay.", "Mara keeps the keys."]);
  });

  it("writes an assembled reply onto a single note", () => {
    let book = addBrainstormNote(createBook("Night Keys"), { text: "A stowaway." });
    book = applyAssembledBrainstorm(book, "A sister on the quay.");
    expect(book.brainstorm_notes).toHaveLength(1);
    expect(book.brainstorm_notes[0]?.text).toBe("A sister on the quay.");
    expect(book.brainstorm).toBe("A sister on the quay.");
  });

  it("paints a note without changing its text", () => {
    let book = addBrainstormNote(createBook("Night Keys"), { text: "A stowaway." });
    expect(book.brainstorm_notes[0]?.color).toBe("paper");
    book = updateBrainstormNote(book, book.brainstorm_notes[0]!.id, { color: "sage" });
    expect(book.brainstorm_notes[0]?.color).toBe("sage");
    expect(book.brainstorm).toBe("A stowaway.");
  });

  it("loads a note that never had a colour as paper", () => {
    const book = createBook("Legacy");
    const parsed = parseBook({
      ...book,
      brainstorm: "Who knows the ship?",
      brainstorm_notes: [{ id: "scratch", text: "Who knows the ship?", x: 24, y: 24 }]
    });
    expect(parsed.brainstorm_notes[0]?.color).toBe("paper");
    expect(parsed.brainstorm).toBe("Who knows the ship?");
  });
});

describe("compile notes", () => {
  it("reads the board top to bottom, then left to right", () => {
    const lower = { id: "low", text: "Below.", x: 10, y: 200, color: "paper" as const };
    const right = { id: "right", text: "Right.", x: 300, y: 24, color: "paper" as const };
    const left = { id: "left", text: "Left.", x: 24, y: 30, color: "paper" as const };
    expect(notesInReadingOrder([lower, right, left]).map((note) => note.id)).toEqual(["left", "right", "low"]);
  });

  it("joins notes in the given id order and skips empty ones", () => {
    const notes = [
      { id: "a", text: "A stowaway.", x: 24, y: 24, color: "paper" as const },
      { id: "b", text: "   ", x: 80, y: 24, color: "paper" as const },
      { id: "c", text: "Salt on the quay.", x: 24, y: 200, color: "paper" as const }
    ];
    expect(compileNotesToText(notes, ["c", "a", "b"])).toBe("Salt on the quay.\n\nA stowaway.");
    expect(compileNotesToText(notes, ["c"])).toBe("Salt on the quay.");
  });
});

describe("send column", () => {
  it("stages notes in tray order and returns them to the board", () => {
    let book = createBook("Night Keys");
    book = addBrainstormNote(book, { id: "a", text: "A stowaway." });
    book = addBrainstormNote(book, { id: "b", text: "A sister." });
    book = addBrainstormNote(book, { id: "c", text: "Salt on the quay." });
    book = stageBrainstormNote(book, "c");
    book = stageBrainstormNote(book, "a");
    expect(sendNotes(book.brainstorm_notes).map((note) => note.id)).toEqual(["c", "a"]);
    expect(boardNotes(book.brainstorm_notes).map((note) => note.id)).toEqual(["b"]);
    book = stageBrainstormNote(book, "c", 1);
    expect(sendNotes(book.brainstorm_notes).map((note) => note.id)).toEqual(["a", "c"]);
    book = unstageBrainstormNote(book, "a", 40, 80);
    expect(book.brainstorm_notes.find((note) => note.id === "a")?.send_index).toBeUndefined();
    expect(book.brainstorm_notes.find((note) => note.id === "a")?.x).toBe(40);
    expect(book.brainstorm_notes.find((note) => note.id === "a")?.y).toBe(80);
    expect(sendNotes(book.brainstorm_notes).map((note) => note.id)).toEqual(["c"]);
  });

  it("keeps live text when a staged note returns to the board", () => {
    let book = addBrainstormNote(createBook("Night Keys"), { id: "a", text: "" });
    book = applyBrainstormNoteTexts(book, [["a", "A stowaway."]]);
    book = stageBrainstormNote(book, "a");
    book = unstageBrainstormNote(book, "a", 40, 80);
    expect(book.brainstorm_notes.find((note) => note.id === "a")?.text).toBe("A stowaway.");
    expect(sendNotes(book.brainstorm_notes)).toEqual([]);
  });

  it("ignores staged notes when placing a new one", () => {
    const staged = { id: "s", text: "Salt.", x: 900, y: 900, color: "paper" as const, send_index: 0 };
    const board = { id: "b", text: "A sister.", x: 24, y: 24, color: "paper" as const };
    expect(nextNotePosition([staged, board])).toEqual({ x: 60, y: 68 });
  });

  it("loads a save that never had a send column", () => {
    const book = createBook("Legacy");
    const parsed = parseBook({
      ...book,
      brainstorm: "Who knows the ship?",
      brainstorm_notes: [{ id: "scratch", text: "Who knows the ship?", x: 24, y: 24, color: "sage" }]
    });
    expect(parsed.brainstorm_notes[0]?.send_index).toBeUndefined();
    expect(parsed.brainstorm_notes[0]?.color).toBe("sage");
  });

  it("writes live editor text onto notes without dropping the rest", () => {
    let book = createBook("Night Keys");
    book = addBrainstormNote(book, { id: "a", text: "Kept." });
    book = addBrainstormNote(book, { id: "b", text: "" });
    book = addBrainstormNote(book, { id: "c", text: "" });
    const next = applyBrainstormNoteTexts(book, [
      ["b", "Second."],
      ["c", "Third."]
    ]);
    expect(next.brainstorm_notes.map((note) => note.text)).toEqual(["Kept.", "Second.", "Third."]);
    expect(applyBrainstormNoteTexts(next, [["b", "Second."]])).toBe(next);
  });

  it("keeps a staged index through parse", () => {
    const book = createBook("Night Keys");
    const parsed = parseBook({
      ...book,
      brainstorm: "Salt on the quay.",
      brainstorm_notes: [
        { id: "salt", text: "Salt on the quay.", x: 24, y: 24, color: "rust", send_index: 0 }
      ]
    });
    expect(parsed.brainstorm_notes[0]?.send_index).toBe(0);
  });
});
