import { describe, expect, it } from "vitest";
import { createBook, updateChapter } from "@core/BookSchema";
import { packManuscriptBackup } from "@core/manuscriptBackup";
import { buildManuscriptExport, formatExportRtf, packOdt } from "@core/manuscriptExport";

describe("manuscript export formats", () => {
  it("writes RTF with headings and escapes control marks", () => {
    let book = { ...createBook("Night Keys"), synopsis: "Emma leaves before winter." };
    book = updateChapter(book, book.chapters[0]!.id, { title: "The quay", prose: "Emma locked the {door}." });
    const rtf = formatExportRtf(buildManuscriptExport(book, "First pass"));
    expect(rtf.startsWith("{\\rtf1")).toBe(true);
    expect(rtf).toContain("Night Keys");
    expect(rtf).toContain("The quay");
    expect(rtf).toContain("Emma locked the \\{door\\}.");
    expect(rtf).toContain("First pass");
    expect(rtf).not.toContain("brainstorm");
  });

  it("packs ODT as a zip Scrivener can import", () => {
    let book = { ...createBook("Night Keys"), brainstorm: "secret stowaway" };
    book = updateChapter(book, book.chapters[0]!.id, { title: "The quay", prose: "Emma locked the door." });
    const odt = packOdt(buildManuscriptExport(book));
    const text = new TextDecoder().decode(odt);
    expect(odt[0]).toBe(0x50);
    expect(odt[1]).toBe(0x4b);
    expect(text).toContain("application/vnd.oasis.opendocument.text");
    expect(text).toContain("Emma locked the door.");
    expect(text).toContain("The quay");
    expect(text).not.toContain("secret stowaway");
  });

  it("drops a model Note from chapter prose so it cannot ride along", () => {
    let book = createBook("Night Keys");
    book = updateChapter(book, book.chapters[0]!.id, {
      prose: '(Note: Changed "moves with practiced ease" to "surges through".)Jeff\'s eyes adjust.'
    });
    const doc = buildManuscriptExport(book);
    expect(doc.chapters[0]?.prose).toBe("Jeff's eyes adjust.");
    expect(doc.chapters[0]?.prose).not.toContain("Note:");
  });
});
