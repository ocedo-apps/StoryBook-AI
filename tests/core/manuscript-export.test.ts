import { PDFDocument } from "pdf-lib";
import { describe, expect, it } from "vitest";
import { createBook, updateChapter } from "@core/BookSchema";
import { packManuscriptBackup } from "@core/manuscriptBackup";
import {
  buildManuscriptExport,
  formatExportHtml,
  formatExportMarkdown,
  formatExportRtf,
  packEpub,
  packOdt,
  packPdf
} from "@core/manuscriptExport";

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

  it("exports live prose and leaves earlier versions out", () => {
    let book = createBook("Night Keys");
    book = updateChapter(book, book.chapters[0]!.id, {
      prose: "Emma locked the door.",
      revisions: [
        {
          id: "rev-1",
          at: "2026-09-21T00:00:00.000Z",
          op: "draft",
          prose: "SECRET OLD VERSION the stowaway smiled."
        }
      ]
    });
    const doc = buildManuscriptExport(book);
    expect(doc.chapters[0]?.prose).toBe("Emma locked the door.");
    expect(JSON.stringify(doc)).not.toContain("SECRET OLD VERSION");
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

  it("writes a self-contained HTML page and escapes markup", () => {
    let book = { ...createBook("Night Keys"), brainstorm: "secret stowaway", synopsis: "Emma leaves before winter." };
    book = updateChapter(book, book.chapters[0]!.id, {
      title: "The quay",
      brief: "Emma meets the stranger",
      prose: "Emma locked the <door>."
    });
    const html = formatExportHtml(buildManuscriptExport(book, "First pass"));
    expect(html.startsWith("<!doctype html>")).toBe(true);
    expect(html).toContain("Night Keys");
    expect(html).toContain("The quay");
    expect(html).toContain("Emma locked the &lt;door&gt;.");
    expect(html).toContain("First pass");
    expect(html).not.toContain("secret stowaway");
    expect(html).not.toContain("Synopsis");
    expect(html).not.toContain("Emma leaves before winter.");
    expect(html).not.toContain("Emma meets the stranger");
    expect(html).toContain(`<h2 class="chapter">`);
  });

  it("leaves the synopsis and chapter briefs out of every publish format", async () => {
    let book = { ...createBook("Night Keys"), synopsis: "Emma leaves before winter." };
    book = updateChapter(book, book.chapters[0]!.id, {
      title: "The quay",
      brief: "Emma meets the stranger",
      prose: "Emma locked the door."
    });
    const doc = buildManuscriptExport(book);

    const md = formatExportMarkdown(doc);
    expect(md).not.toContain("Synopsis");
    expect(md).not.toContain("Emma leaves before winter.");
    expect(md).not.toContain("Brief:");
    expect(md).not.toContain("Emma meets the stranger");

    const rtf = formatExportRtf(doc);
    expect(rtf).not.toContain("Synopsis");
    expect(rtf).not.toContain("Emma leaves before winter.");
    expect(rtf).not.toContain("Brief:");
    expect(rtf).not.toContain("Emma meets the stranger");

    const odtText = new TextDecoder().decode(packOdt(doc));
    expect(odtText).not.toContain("Synopsis");
    expect(odtText).not.toContain("Emma leaves before winter.");
    expect(odtText).not.toContain("Brief:");
    expect(odtText).not.toContain("Emma meets the stranger");

    const epubText = new TextDecoder().decode(packEpub(doc));
    expect(epubText).not.toContain("synopsis.xhtml");
    expect(epubText).not.toContain("Emma leaves before winter.");
    expect(epubText).not.toContain("Brief:");
    expect(epubText).not.toContain("Emma meets the stranger");

    const pdfBytes = await packPdf(doc);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    expect(pdfDoc.getTitle()).toBe("Night Keys");
  });

  it("gives each chapter its own page in RTF and ODT, and its own file in ePub", () => {
    let book = createBook("Night Keys");
    book = updateChapter(book, book.chapters[0]!.id, { title: "The quay", prose: "Emma locked the door." });
    book = { ...book, chapters: [...book.chapters, { ...book.chapters[0]!, id: "ch2", title: "The tide", sequence_index: 1, prose: "Water rose." }] };
    const doc = buildManuscriptExport(book);

    const rtf = formatExportRtf(doc);
    expect(rtf.split("\\page").length - 1).toBe(2);

    const odtText = new TextDecoder().decode(packOdt(doc));
    expect(odtText).toContain('text:style-name="ChapterHeading"');
    expect(odtText).toContain('fo:break-before="page"');

    const epubText = new TextDecoder().decode(packEpub(doc));
    expect(epubText).toContain("text/chapter-0.xhtml");
    expect(epubText).toContain("text/chapter-1.xhtml");
  });

  it("forces a new PDF page for every chapter, even a short one", async () => {
    let book = createBook("Night Keys");
    book = updateChapter(book, book.chapters[0]!.id, { title: "The quay", prose: "Short." });
    const doc = buildManuscriptExport(book);
    const bytes = await packPdf(doc);
    const loaded = await PDFDocument.load(bytes);
    expect(loaded.getPageCount()).toBe(2);
  });

  it("packs an ePub a reader can open, with mimetype stored first and uncompressed", () => {
    let book = { ...createBook("Night Keys"), brainstorm: "secret stowaway", synopsis: "Emma leaves before winter." };
    book = updateChapter(book, book.chapters[0]!.id, { title: "The quay", prose: "Emma locked the door." });
    const epub = packEpub(buildManuscriptExport(book));
    expect(epub[0]).toBe(0x50);
    expect(epub[1]).toBe(0x4b);
    const text = new TextDecoder().decode(epub);
    expect(text).toContain("application/epub+zip");
    expect(text).toContain("OEBPS/content.opf");
    expect(text).toContain("Emma locked the door.");
    expect(text).toContain("The quay");
    expect(text).not.toContain("secret stowaway");

    const mimetypeIndex = text.indexOf("mimetypeapplication/epub+zip");
    expect(mimetypeIndex).toBeGreaterThan(-1);
    expect(mimetypeIndex).toBeLessThan(60);
  });

  it("gives an ePub page for the Story Bible and leaves it out when there are no facts", () => {
    const book = createBook("Night Keys");
    const epub = packEpub(buildManuscriptExport(book));
    const text = new TextDecoder().decode(epub);
    expect(text).not.toContain("bible.xhtml");
  });

  it("packs a PDF with the manuscript title as its document title", async () => {
    let book = { ...createBook("Night Keys"), synopsis: "Emma leaves before winter." };
    book = updateChapter(book, book.chapters[0]!.id, { title: "The quay", prose: "Emma locked the door." });
    const bytes = await packPdf(buildManuscriptExport(book));
    expect(new TextDecoder().decode(bytes.slice(0, 5))).toBe("%PDF-");
    const loaded = await PDFDocument.load(bytes);
    expect(loaded.getTitle()).toBe("Night Keys");
    expect(loaded.getPageCount()).toBeGreaterThanOrEqual(1);
  });

  it("breaks a long manuscript across more than one PDF page", async () => {
    let book = createBook("Night Keys");
    const longProse = Array.from({ length: 80 }, (_, i) => `Paragraph ${i}: a long enough line to wrap and fill the page with prose.`).join("\n");
    book = updateChapter(book, book.chapters[0]!.id, { title: "The quay", prose: longProse });
    const bytes = await packPdf(buildManuscriptExport(book));
    const loaded = await PDFDocument.load(bytes);
    expect(loaded.getPageCount()).toBeGreaterThan(1);
  });
});
