import { NextRequest, NextResponse } from "next/server";
// pdf-parse has no default export in its ESM types; use require
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require("pdf-parse");
import JSZip from "jszip";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function chunkText(text: string, chunkSize = 3000): string[] {
  const chunks: string[] = [];
  let i = 0;
  while (i < text.length) {
    chunks.push(text.slice(i, i + chunkSize));
    i += chunkSize;
  }
  return chunks;
}

function buildChapterXhtml(chapterIndex: number, text: string): string {
  const lines = text
    .split("\n")
    .map((line) => `<p>${escapeHtml(line) || "&#160;"}</p>`)
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
  <head><title>Chapter ${chapterIndex + 1}</title></head>
  <body>
    <h2>Chapter ${chapterIndex + 1}</h2>
    ${lines}
  </body>
</html>`;
}

export async function POST(request: NextRequest) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const file = formData.get("file") as File | null;
  if (!file) {
    return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const data = await pdfParse(buffer);
    const chunks = chunkText(data.text);
    const bookTitle = file.name.replace(/\.pdf$/i, "");
    const bookId = `urn:uuid:${Date.now()}`;

    const zip = new JSZip();

    // mimetype MUST be first and uncompressed
    zip.file("mimetype", "application/epub+zip", { compression: "STORE" });

    // META-INF/container.xml
    zip.file(
      "META-INF/container.xml",
      `<?xml version="1.0"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`
    );

    // Chapter files
    const chapterIds = chunks.map((_, i) => `chapter${i + 1}`);
    chunks.forEach((chunk, i) => {
      zip.file(`OEBPS/chapter${i + 1}.xhtml`, buildChapterXhtml(i, chunk));
    });

    // content.opf
    const manifestItems = chapterIds
      .map(
        (id, i) =>
          `<item id="${id}" href="chapter${i + 1}.xhtml" media-type="application/xhtml+xml"/>`
      )
      .join("\n    ");
    const spineItems = chapterIds
      .map((id) => `<itemref idref="${id}"/>`)
      .join("\n    ");

    zip.file(
      "OEBPS/content.opf",
      `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="bookid" version="2.0">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:title>${escapeHtml(bookTitle)}</dc:title>
    <dc:language>en</dc:language>
    <dc:identifier id="bookid">${bookId}</dc:identifier>
  </metadata>
  <manifest>
    <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>
    ${manifestItems}
  </manifest>
  <spine toc="ncx">
    ${spineItems}
  </spine>
</package>`
    );

    // toc.ncx
    const navPoints = chapterIds
      .map(
        (id, i) => `
    <navPoint id="${id}" playOrder="${i + 1}">
      <navLabel><text>Chapter ${i + 1}</text></navLabel>
      <content src="chapter${i + 1}.xhtml"/>
    </navPoint>`
      )
      .join("");

    zip.file(
      "OEBPS/toc.ncx",
      `<?xml version="1.0" encoding="UTF-8"?>
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
  <head>
    <meta name="dtb:uid" content="${bookId}"/>
    <meta name="dtb:depth" content="1"/>
    <meta name="dtb:totalPageCount" content="0"/>
    <meta name="dtb:maxPageNumber" content="0"/>
  </head>
  <docTitle><text>${escapeHtml(bookTitle)}</text></docTitle>
  <navMap>${navPoints}
  </navMap>
</ncx>`
    );

    const epubBytes = await zip.generateAsync({ type: "nodebuffer" });
    const baseName = file.name.replace(/\.pdf$/i, "");

    return new NextResponse(Buffer.from(epubBytes), {
      headers: {
        "Content-Type": "application/epub+zip",
        "Content-Disposition": `attachment; filename="${baseName}.epub"`,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to convert PDF to EPUB. Make sure the file is a valid PDF." },
      { status: 422 }
    );
  }
}
