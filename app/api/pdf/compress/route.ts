import { NextRequest, NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";
import { checkAndConsumeEnergy } from "@/lib/energy";

export async function POST(request: NextRequest) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file uploaded." }, { status: 400 });

  const energyErr = await checkAndConsumeEnergy();
  if (energyErr) return energyErr;

  try {
    const pdfDoc   = await PDFDocument.load(await file.arrayBuffer());
    // useObjectStreams merges and compresses cross-reference table + objects
    const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
    const baseName = file.name.replace(/\.pdf$/i, "");

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${baseName}-compressed.pdf"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to compress PDF." }, { status: 422 });
  }
}
