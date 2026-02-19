import { NextRequest, NextResponse } from "next/server";
import JSZip from "jszip";
import { textToPdf } from "@/lib/pdf-text-layout";

function stripTags(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s{2,}/g, " ").trim();
}

function decodeEntities(str: string): string {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#160;/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)));
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
    const bytes = await file.arrayBuffer();
    const zip = await JSZip.loadAsync(bytes);

    // 1. Find OPF path from container.xml
    const containerXml = await zip.file("META-INF/container.xml")?.async("string");
    if (!containerXml) throw new Error("No container.xml found.");

    const opfPathMatch = containerXml.match(/full-path="([^"]+\.opf)"/);
    if (!opfPathMatch) throw new Error("No OPF path found.");
    const opfPath = opfPathMatch[1];
    const opfDir = opfPath.includes("/") ? opfPath.slice(0, opfPath.lastIndexOf("/") + 1) : "";

    // 2. Parse OPF for spine order
    const opfXml = await zip.file(opfPath)?.async("string");
    if (!opfXml) throw new Error("OPF file not found.");

    // Build manifest: id → href
    const manifestMap = new Map<string, string>();
    const itemRegex = /<item\s[^>]*id="([^"]+)"[^>]*href="([^"]+)"[^>]*/g;
    let m: RegExpExecArray | null;
    while ((m = itemRegex.exec(opfXml)) !== null) {
      manifestMap.set(m[1], m[2]);
    }

    // Get spine idref order
    const spineSection = opfXml.match(/<spine[^>]*>([\s\S]*?)<\/spine>/)?.[1] ?? "";
    const idrefRegex = /idref="([^"]+)"/g;
    const orderedHrefs: string[] = [];
    while ((m = idrefRegex.exec(spineSection)) !== null) {
      const href = manifestMap.get(m[1]);
      if (href) orderedHrefs.push(href);
    }

    // 3. Extract text from each chapter
    const textParts: string[] = [];
    for (const href of orderedHrefs) {
      const fullPath = opfDir + href;
      const chapterFile =
        zip.file(fullPath) ?? zip.file(href);
      if (!chapterFile) continue;
      const html = await chapterFile.async("string");
      const text = decodeEntities(stripTags(html));
      if (text.trim()) textParts.push(text);
    }

    if (textParts.length === 0) {
      throw new Error("No readable content found in EPUB.");
    }

    const fullText = textParts.join("\n\n");
    const pdfBytes = await textToPdf(fullText);
    const baseName = file.name.replace(/\.epub$/i, "");

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${baseName}.pdf"`,
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Conversion failed.";
    return NextResponse.json(
      { error: `Failed to convert EPUB to PDF: ${msg}` },
      { status: 422 }
    );
  }
}
