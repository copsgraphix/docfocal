import { PDFDocument, StandardFonts } from "pdf-lib";

const PAGE_WIDTH = 595;
const PAGE_HEIGHT = 842;
const MARGIN = 60;
const FONT_SIZE = 11;
const LINE_HEIGHT = FONT_SIZE * 1.45;

export async function textToPdf(text: string): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);

  const maxWidth = PAGE_WIDTH - MARGIN * 2;

  // Word-wrap all lines
  const inputLines = text.split("\n");
  const wrappedLines: string[] = [];

  for (const rawLine of inputLines) {
    if (rawLine.trim() === "") {
      wrappedLines.push("");
      continue;
    }
    const words = rawLine.split(" ");
    let current = "";
    for (const word of words) {
      const candidate = current ? current + " " + word : word;
      if (font.widthOfTextAtSize(candidate, FONT_SIZE) <= maxWidth) {
        current = candidate;
      } else {
        if (current) wrappedLines.push(current);
        // If a single word is too long, push it as-is
        current = word;
      }
    }
    if (current) wrappedLines.push(current);
  }

  // Render lines onto pages
  let page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - MARGIN;

  for (const line of wrappedLines) {
    if (y < MARGIN) {
      page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      y = PAGE_HEIGHT - MARGIN;
    }
    if (line !== "") {
      page.drawText(line, { x: MARGIN, y, size: FONT_SIZE, font });
    }
    y -= LINE_HEIGHT;
  }

  return doc.save();
}
