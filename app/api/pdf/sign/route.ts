import { PDFDocument } from "pdf-lib";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const file = formData.get("file") as File | null;
    const sig  = formData.get("signature") as File | null;
    if (!file || !sig)
      return NextResponse.json({ error: "file and signature are required" }, { status: 400 });

    const page = Math.max(1, parseInt((formData.get("page") as string) || "1", 10));
    // Percentages (0–100) from the form
    const xPct = parseFloat((formData.get("x") as string) || "5")  / 100;
    const yPct = parseFloat((formData.get("y") as string) || "82") / 100; // from top
    const wPct = parseFloat((formData.get("w") as string) || "25") / 100;

    const pdfBytes = new Uint8Array(await file.arrayBuffer());
    const sigBytes = new Uint8Array(await sig.arrayBuffer());

    const pdfDoc  = await PDFDocument.load(pdfBytes);
    const sigImage = await pdfDoc.embedPng(sigBytes);

    const pages      = pdfDoc.getPages();
    const targetPage = pages[Math.min(page - 1, pages.length - 1)];
    const { width: pw, height: ph } = targetPage.getSize();

    const imgW = wPct * pw;
    const imgH = imgW * (sigImage.height / sigImage.width);
    const imgX = xPct * pw;
    // pdf-lib origin is bottom-left; yPct is measured from top
    const imgY = ph - yPct * ph - imgH;

    targetPage.drawImage(sigImage, { x: imgX, y: imgY, width: imgW, height: imgH });

    const output = await pdfDoc.save();
    return new NextResponse(Buffer.from(output), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="signed.pdf"`,
      },
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Sign failed" },
      { status: 500 }
    );
  }
}
