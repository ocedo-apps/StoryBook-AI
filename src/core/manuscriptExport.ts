import { groupBibleEntities } from "./bibleGroups";
import { sortedChapters, type Book } from "./BookSchema";
import { profileFor } from "./characterProfile";
import { PREDICATE_LABELS } from "./predicates";
import { peelModelAsides } from "./proseFlow";
import { newId } from "./ids";

function exportProse(text: string): string {
  return peelModelAsides(text).prose.trim();
}

export type ManuscriptExportEntity = {
  name: string;
  lines: string[];
};

export type ManuscriptExportSection = {
  heading: string;
  entities: ManuscriptExportEntity[];
};

export type ManuscriptExportChapter = {
  heading: string;
  brief: string;
  voice: string;
  prose: string;
};

export type ManuscriptExport = {
  title: string;
  exportedLabel: string;
  note: string;
  voice: string;
  viewpoint: string;
  readerAge?: number;
  synopsis: string;
  chapters: ManuscriptExportChapter[];
  bible: ManuscriptExportSection[];
};

export function buildManuscriptExport(book: Book, note = "", exportedAt = new Date().toISOString()): ManuscriptExport {
  const bible: ManuscriptExportSection[] = [];
  for (const section of groupBibleEntities(book.facts, book.entity_kinds)) {
    bible.push({
      heading: section.label,
      entities: section.entities.map((entity) => {
        const profile = profileFor(book.profiles, entity.entity_ref);
        const lines: string[] = [];
        if (profile.pronoun) lines.push(`Pronoun: ${profile.pronoun}`);
        if (profile.approximateAge !== undefined) lines.push(`Approximate age: ${profile.approximateAge}`);
        if (profile.looks.trim()) lines.push(`Looks: ${profile.looks.trim()}`);
        if (profile.personality.trim()) lines.push(`Personality: ${profile.personality.trim()}`);
        for (const fact of entity.facts) {
          lines.push(`${PREDICATE_LABELS[fact.predicate]}: ${fact.value.trim()}`);
        }
        return { name: entity.entity_label, lines };
      })
    });
  }
  return {
    title: book.title.trim() || "Untitled manuscript",
    exportedLabel: `Exported ${exportedAt.slice(0, 10) || new Date().toISOString().slice(0, 10)}.`,
    note: note.trim(),
    voice: book.voice.trim(),
    viewpoint: book.viewpoint.trim(),
    ...(book.reader_age !== undefined ? { readerAge: book.reader_age } : {}),
    synopsis: exportProse(book.synopsis),
    chapters: sortedChapters(book).map((chapter) => ({
      heading: `${chapter.sequence_index + 1}. ${chapter.title.trim() || `Chapter ${chapter.sequence_index + 1}`}`,
      brief: chapter.brief.trim(),
      voice: chapter.voice?.trim() ?? "",
      prose: exportProse(chapter.prose)
    })),
    bible
  };
}

export function formatExportMarkdown(doc: ManuscriptExport): string {
  const lines: string[] = [`# ${doc.title}`, "", doc.exportedLabel];
  if (doc.note) {
    lines.push("", doc.note);
  }
  if (doc.voice || doc.viewpoint || doc.readerAge !== undefined) {
    lines.push("");
    if (doc.voice) lines.push(`Voice: ${doc.voice}`);
    if (doc.viewpoint) lines.push(`Viewpoint: ${doc.viewpoint}`);
    if (doc.readerAge !== undefined) lines.push(`Reader: ${doc.readerAge}`);
  }
  if (doc.synopsis) {
    lines.push("", "## Synopsis", "", doc.synopsis);
  }
  for (const chapter of doc.chapters) {
    lines.push("", `## ${chapter.heading}`);
    if (chapter.brief) {
      lines.push("", `Brief: ${chapter.brief}`);
    }
    if (chapter.voice) {
      lines.push(`Voice: ${chapter.voice}`);
    }
    if (chapter.prose) {
      lines.push("", chapter.prose);
    }
  }
  if (doc.bible.length > 0) {
    lines.push("", "## Story Bible");
    for (const section of doc.bible) {
      lines.push("", `### ${section.heading}`);
      for (const entity of section.entities) {
        lines.push("", `**${entity.name}**`);
        for (const line of entity.lines) lines.push(`- ${line}`);
      }
    }
  }
  lines.push("");
  return lines.join("\n");
}

const HTML_EXPORT_CSS = `body{max-width:42rem;margin:2.5rem auto;padding:0 1.5rem;font-family:Georgia,"Times New Roman",serif;line-height:1.6;color:#1a1a1a}h1{font-size:1.9rem;margin-bottom:0.25rem}h2{font-size:1.35rem;margin-top:2.5rem}h3{font-size:1.1rem}.meta{color:#666;font-size:0.9rem}ul{padding-left:1.25rem}`;

function htmlParagraphs(text: string): string {
  const lines = text.split(/\r\n|\n|\r/);
  if (lines.length === 0) return "";
  return lines.map((line) => (line ? `<p>${xmlEscape(line)}</p>` : "<p><br/></p>")).join("\n");
}

export function formatExportHtml(doc: ManuscriptExport): string {
  const body: string[] = [`<h1>${xmlEscape(doc.title)}</h1>`, `<p class="meta">${xmlEscape(doc.exportedLabel)}</p>`];
  if (doc.note) body.push(`<p class="meta">${xmlEscape(doc.note)}</p>`);
  if (doc.voice || doc.viewpoint || doc.readerAge !== undefined) {
    const meta: string[] = [];
    if (doc.voice) meta.push(`Voice: ${xmlEscape(doc.voice)}`);
    if (doc.viewpoint) meta.push(`Viewpoint: ${xmlEscape(doc.viewpoint)}`);
    if (doc.readerAge !== undefined) meta.push(`Reader: ${doc.readerAge}`);
    body.push(`<p class="meta">${meta.join("<br/>")}</p>`);
  }
  if (doc.synopsis) {
    body.push("<h2>Synopsis</h2>", htmlParagraphs(doc.synopsis));
  }
  for (const chapter of doc.chapters) {
    body.push(`<h2>${xmlEscape(chapter.heading)}</h2>`);
    if (chapter.brief) body.push(`<p class="meta">Brief: ${xmlEscape(chapter.brief)}</p>`);
    if (chapter.voice) body.push(`<p class="meta">Voice: ${xmlEscape(chapter.voice)}</p>`);
    if (chapter.prose) body.push(htmlParagraphs(chapter.prose));
  }
  if (doc.bible.length > 0) {
    body.push("<h2>Story Bible</h2>");
    for (const section of doc.bible) {
      body.push(`<h3>${xmlEscape(section.heading)}</h3>`);
      for (const entity of section.entities) {
        body.push(`<p><strong>${xmlEscape(entity.name)}</strong></p>`);
        if (entity.lines.length > 0) {
          body.push(`<ul>${entity.lines.map((line) => `<li>${xmlEscape(line)}</li>`).join("")}</ul>`);
        }
      }
    }
  }
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<title>${xmlEscape(doc.title)}</title>
<style>${HTML_EXPORT_CSS}</style>
</head>
<body>
${body.join("\n")}
</body>
</html>
`;
}

export function formatExportRtf(doc: ManuscriptExport): string {
  const parts: string[] = [
    "{\\rtf1\\ansi\\ansicpg1252\\deff0",
    "{\\fonttbl{\\f0\\froman Times New Roman;}}",
    "\\f0\\fs24",
    `{\\fs40\\b ${rtfEscape(doc.title)}}\\par`,
    "\\par",
    `${rtfEscape(doc.exportedLabel)}\\par`
  ];
  if (doc.note) {
    parts.push("\\par", `${rtfEscape(doc.note)}\\par`);
  }
  if (doc.voice) parts.push(`${rtfEscape(`Voice: ${doc.voice}`)}\\par`);
  if (doc.viewpoint) parts.push(`${rtfEscape(`Viewpoint: ${doc.viewpoint}`)}\\par`);
  if (doc.readerAge !== undefined) parts.push(`${rtfEscape(`Reader: ${doc.readerAge}`)}\\par`);
  if (doc.synopsis) {
    parts.push("\\par", `{\\fs32\\b ${rtfEscape("Synopsis")}}\\par`, "\\par", `${rtfBlock(doc.synopsis)}`);
  }
  for (const chapter of doc.chapters) {
    parts.push("\\par", `{\\fs32\\b ${rtfEscape(chapter.heading)}}\\par`);
    if (chapter.brief) parts.push("\\par", `${rtfEscape(`Brief: ${chapter.brief}`)}\\par`);
    if (chapter.voice) parts.push(`${rtfEscape(`Voice: ${chapter.voice}`)}\\par`);
    if (chapter.prose) parts.push("\\par", rtfBlock(chapter.prose));
  }
  if (doc.bible.length > 0) {
    parts.push("\\par", `{\\fs32\\b ${rtfEscape("Story Bible")}}\\par`);
    for (const section of doc.bible) {
      parts.push("\\par", `{\\fs28\\b ${rtfEscape(section.heading)}}\\par`);
      for (const entity of section.entities) {
        parts.push("\\par", `{\\b ${rtfEscape(entity.name)}}\\par`);
        for (const line of entity.lines) parts.push(`${rtfEscape(line)}\\par`);
      }
    }
  }
  parts.push("}");
  return parts.join("\n");
}

export function packOdt(doc: ManuscriptExport): Uint8Array {
  return zipStore([
    { name: "mimetype", data: utf8("application/vnd.oasis.opendocument.text") },
    { name: "content.xml", data: utf8(odtContentXml(doc)) },
    { name: "styles.xml", data: utf8(ODT_STYLES) },
    { name: "META-INF/manifest.xml", data: utf8(ODT_MANIFEST) }
  ]);
}

const EPUB_CSS = `body{font-family:Georgia,"Times New Roman",serif;line-height:1.6;margin:1.25em}h1{font-size:1.6em}h2{font-size:1.3em}.meta{color:#555;font-size:0.9em}`;

type EpubPage = { id: string; file: string; title: string; body: string };

function epubXhtml(title: string, body: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
<head><meta charset="utf-8"/><title>${xmlEscape(title)}</title><link rel="stylesheet" type="text/css" href="../styles/stylesheet.css"/></head>
<body>
${body}
</body>
</html>
`;
}

export function packEpub(doc: ManuscriptExport): Uint8Array {
  const pages: EpubPage[] = [];

  const titleMeta: string[] = [];
  if (doc.voice) titleMeta.push(`Voice: ${xmlEscape(doc.voice)}`);
  if (doc.viewpoint) titleMeta.push(`Viewpoint: ${xmlEscape(doc.viewpoint)}`);
  if (doc.readerAge !== undefined) titleMeta.push(`Reader: ${doc.readerAge}`);
  const titleBody = [
    `<h1>${xmlEscape(doc.title)}</h1>`,
    `<p class="meta">${xmlEscape(doc.exportedLabel)}</p>`,
    doc.note ? `<p class="meta">${xmlEscape(doc.note)}</p>` : "",
    titleMeta.length > 0 ? `<p class="meta">${titleMeta.join("<br/>")}</p>` : ""
  ]
    .filter(Boolean)
    .join("\n");
  pages.push({ id: "title", file: "text/title.xhtml", title: doc.title, body: titleBody });

  if (doc.synopsis) {
    pages.push({
      id: "synopsis",
      file: "text/synopsis.xhtml",
      title: "Synopsis",
      body: `<h1>Synopsis</h1>\n${htmlParagraphs(doc.synopsis)}`
    });
  }

  doc.chapters.forEach((chapter, index) => {
    const parts = [`<h1>${xmlEscape(chapter.heading)}</h1>`];
    if (chapter.brief) parts.push(`<p class="meta">Brief: ${xmlEscape(chapter.brief)}</p>`);
    if (chapter.voice) parts.push(`<p class="meta">Voice: ${xmlEscape(chapter.voice)}</p>`);
    if (chapter.prose) parts.push(htmlParagraphs(chapter.prose));
    pages.push({
      id: `chapter-${index}`,
      file: `text/chapter-${index}.xhtml`,
      title: chapter.heading,
      body: parts.join("\n")
    });
  });

  if (doc.bible.length > 0) {
    const parts = ["<h1>Story Bible</h1>"];
    for (const section of doc.bible) {
      parts.push(`<h2>${xmlEscape(section.heading)}</h2>`);
      for (const entity of section.entities) {
        parts.push(`<p><strong>${xmlEscape(entity.name)}</strong></p>`);
        if (entity.lines.length > 0) {
          parts.push(`<ul>${entity.lines.map((line) => `<li>${xmlEscape(line)}</li>`).join("")}</ul>`);
        }
      }
    }
    pages.push({ id: "bible", file: "text/bible.xhtml", title: "Story Bible", body: parts.join("\n") });
  }

  const manifestItems = pages
    .map((page) => `    <item id="${page.id}" href="${page.file}" media-type="application/xhtml+xml"/>`)
    .join("\n");
  const spineItems = pages.map((page) => `    <itemref idref="${page.id}"/>`).join("\n");
  const navList = pages
    .map((page) => `        <li><a href="${page.file}">${xmlEscape(page.title)}</a></li>`)
    .join("\n");

  const opf = `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="book-id">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="book-id">urn:uuid:${newId()}</dc:identifier>
    <dc:title>${xmlEscape(doc.title)}</dc:title>
    <dc:language>en</dc:language>
    <meta property="dcterms:modified">${new Date().toISOString().replace(/\.\d+Z$/, "Z")}</meta>
  </metadata>
  <manifest>
${manifestItems}
    <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>
    <item id="css" href="styles/stylesheet.css" media-type="text/css"/>
  </manifest>
  <spine>
${spineItems}
  </spine>
</package>
`;

  const nav = `<?xml version="1.0" encoding="UTF-8"?>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
<head><meta charset="utf-8"/><title>${xmlEscape(doc.title)}</title><link rel="stylesheet" type="text/css" href="styles/stylesheet.css"/></head>
<body>
  <nav epub:type="toc" id="toc">
    <h1>${xmlEscape(doc.title)}</h1>
    <ol>
${navList}
    </ol>
  </nav>
</body>
</html>
`;

  const container = `<?xml version="1.0" encoding="UTF-8"?>
<container xmlns="urn:oasis:names:tc:opendocument:xmlns:container" version="1.0">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>
`;

  return zipStore([
    { name: "mimetype", data: utf8("application/epub+zip") },
    { name: "META-INF/container.xml", data: utf8(container) },
    { name: "OEBPS/content.opf", data: utf8(opf) },
    { name: "OEBPS/nav.xhtml", data: utf8(nav) },
    { name: "OEBPS/styles/stylesheet.css", data: utf8(EPUB_CSS) },
    ...pages.map((page) => ({ name: `OEBPS/${page.file}`, data: utf8(epubXhtml(page.title, page.body)) }))
  ]);
}

function rtfBlock(text: string): string {
  return text.split(/\r\n|\n|\r/).map((line) => `${rtfEscape(line)}\\par`).join("\n");
}

function rtfEscape(text: string): string {
  let out = "";
  for (const char of text) {
    const code = char.codePointAt(0) ?? 0;
    if (char === "\\" || char === "{" || char === "}") out += `\\${char}`;
    else if (code === 9) out += "\\tab ";
    else if (code < 128) out += char;
    else if (code <= 0xffff) {
      const signed = code > 32767 ? code - 65536 : code;
      out += `\\u${signed}?`;
    } else {
      const s = code - 0x10000;
      const hi = 0xd800 + (s >> 10);
      const lo = 0xdc00 + (s & 0x3ff);
      out += `\\u${hi > 32767 ? hi - 65536 : hi}?\\u${lo > 32767 ? lo - 65536 : lo}?`;
    }
  }
  return out;
}

function xmlEscape(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function odtParagraphs(text: string, style = "Standard"): string {
  const lines = text.split(/\r\n|\n|\r/);
  if (lines.length === 0) return `<text:p text:style-name="${style}"/>`;
  return lines
    .map((line) =>
      line
        ? `<text:p text:style-name="${style}">${xmlEscape(line)}</text:p>`
        : `<text:p text:style-name="${style}"/>`
    )
    .join("");
}

function odtHeading(level: 1 | 2 | 3, text: string): string {
  const style = level === 1 ? "Title" : level === 2 ? "Heading_20_1" : "Heading_20_2";
  return `<text:h text:style-name="${style}" text:outline-level="${level}">${xmlEscape(text)}</text:h>`;
}

function odtContentXml(doc: ManuscriptExport): string {
  const body: string[] = [odtHeading(1, doc.title), odtParagraphs(doc.exportedLabel)];
  if (doc.note) body.push(odtParagraphs(doc.note));
  if (doc.voice) body.push(odtParagraphs(`Voice: ${doc.voice}`));
  if (doc.viewpoint) body.push(odtParagraphs(`Viewpoint: ${doc.viewpoint}`));
  if (doc.readerAge !== undefined) body.push(odtParagraphs(`Reader: ${doc.readerAge}`));
  if (doc.synopsis) {
    body.push(odtHeading(2, "Synopsis"), odtParagraphs(doc.synopsis));
  }
  for (const chapter of doc.chapters) {
    body.push(odtHeading(2, chapter.heading));
    if (chapter.brief) body.push(odtParagraphs(`Brief: ${chapter.brief}`));
    if (chapter.voice) body.push(odtParagraphs(`Voice: ${chapter.voice}`));
    if (chapter.prose) body.push(odtParagraphs(chapter.prose));
  }
  if (doc.bible.length > 0) {
    body.push(odtHeading(2, "Story Bible"));
    for (const section of doc.bible) {
      body.push(odtHeading(3, section.heading));
      for (const entity of section.entities) {
        body.push(odtParagraphs(entity.name, "Strong"));
        for (const line of entity.lines) body.push(odtParagraphs(line));
      }
    }
  }
  return `<?xml version="1.0" encoding="UTF-8"?>
<office:document-content xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0" xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0" office:version="1.3">
  <office:automatic-styles/>
  <office:body>
    <office:text>${body.join("")}</office:text>
  </office:body>
</office:document-content>
`;
}

const ODT_STYLES = `<?xml version="1.0" encoding="UTF-8"?>
<office:document-styles xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0" xmlns:fo="urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0" office:version="1.3">
  <office:styles>
    <style:style style:name="Standard" style:family="paragraph">
      <style:text-properties style:font-name="Liberation Serif" fo:font-size="12pt"/>
    </style:style>
    <style:style style:name="Title" style:family="paragraph" style:parent-style-name="Standard">
      <style:text-properties fo:font-size="22pt" fo:font-weight="bold"/>
    </style:style>
    <style:style style:name="Heading_20_1" style:display-name="Heading 1" style:family="paragraph" style:parent-style-name="Standard">
      <style:text-properties fo:font-size="16pt" fo:font-weight="bold"/>
    </style:style>
    <style:style style:name="Heading_20_2" style:display-name="Heading 2" style:family="paragraph" style:parent-style-name="Standard">
      <style:text-properties fo:font-size="14pt" fo:font-weight="bold"/>
    </style:style>
    <style:style style:name="Strong" style:family="paragraph" style:parent-style-name="Standard">
      <style:text-properties fo:font-weight="bold"/>
    </style:style>
  </office:styles>
</office:document-styles>
`;

const ODT_MANIFEST = `<?xml version="1.0" encoding="UTF-8"?>
<manifest:manifest xmlns:manifest="urn:oasis:names:tc:opendocument:xmlns:manifest:1.0" manifest:version="1.3">
  <manifest:file-entry manifest:full-path="/" manifest:media-type="application/vnd.oasis.opendocument.text"/>
  <manifest:file-entry manifest:full-path="content.xml" manifest:media-type="text/xml"/>
  <manifest:file-entry manifest:full-path="styles.xml" manifest:media-type="text/xml"/>
  <manifest:file-entry manifest:full-path="META-INF/manifest.xml" manifest:media-type="text/xml"/>
</manifest:manifest>
`;

function utf8(text: string): Uint8Array {
  return new TextEncoder().encode(text);
}

function crc32(data: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < data.length; i += 1) {
    crc ^= data[i]!;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1;
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function zipStore(files: { name: string; data: Uint8Array }[]): Uint8Array {
  const chunks: Uint8Array[] = [];
  const central: Uint8Array[] = [];
  let offset = 0;
  for (const file of files) {
    const name = utf8(file.name);
    const crc = crc32(file.data);
    const local = new Uint8Array(30 + name.length);
    const view = new DataView(local.buffer);
    view.setUint32(0, 0x04034b50, true);
    view.setUint16(4, 20, true);
    view.setUint16(14, crc & 0xffff, true);
    view.setUint16(16, crc >>> 16, true);
    view.setUint32(18, file.data.length, true);
    view.setUint32(22, file.data.length, true);
    view.setUint16(26, name.length, true);
    local.set(name, 30);
    chunks.push(local, file.data);
    const dir = new Uint8Array(46 + name.length);
    const dview = new DataView(dir.buffer);
    dview.setUint32(0, 0x02014b50, true);
    dview.setUint16(4, 20, true);
    dview.setUint16(6, 20, true);
    dview.setUint16(16, crc & 0xffff, true);
    dview.setUint16(18, crc >>> 16, true);
    dview.setUint32(20, file.data.length, true);
    dview.setUint32(24, file.data.length, true);
    dview.setUint16(28, name.length, true);
    dview.setUint32(42, offset, true);
    dir.set(name, 46);
    central.push(dir);
    offset += local.length + file.data.length;
  }
  const centralSize = central.reduce((sum, part) => sum + part.length, 0);
  const end = new Uint8Array(22);
  const eview = new DataView(end.buffer);
  eview.setUint32(0, 0x06054b50, true);
  eview.setUint16(8, files.length, true);
  eview.setUint16(10, files.length, true);
  eview.setUint32(12, centralSize, true);
  eview.setUint32(16, offset, true);
  const total = offset + centralSize + end.length;
  const out = new Uint8Array(total);
  let at = 0;
  for (const part of chunks) {
    out.set(part, at);
    at += part.length;
  }
  for (const part of central) {
    out.set(part, at);
    at += part.length;
  }
  out.set(end, at);
  return out;
}
