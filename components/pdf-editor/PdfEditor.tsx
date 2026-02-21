"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, Download, Hash, Droplets, Loader2 } from "lucide-react";
import Link from "next/link";
import { NoEnergyModal } from "@/components/no-energy-modal";
import { EditorToolbar, type ToolName } from "./EditorToolbar";
import { PagePanel, type PageState } from "./PagePanel";

// ─── helpers ────────────────────────────────────────────────────────────────

async function renderPdfToPages(file: File): Promise<PageState[]> {
  const { getDocument, GlobalWorkerOptions } = await import("pdfjs-dist");
  // Use local worker to avoid CDN issues
  GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.mjs",
    import.meta.url
  ).toString();

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await getDocument({ data: arrayBuffer }).promise;
  const pages: PageState[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 2 });
    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext("2d")!;
    await page.render({ canvasContext: ctx, viewport, canvas }).promise;
    pages.push({
      backgroundDataUrl: canvas.toDataURL("image/jpeg", 0.92),
      width: viewport.width / 2,
      height: viewport.height / 2,
      fabricJson: "",
    });
  }
  return pages;
}

function hexToRgba(hex: string, alpha: number) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

// ─── component ──────────────────────────────────────────────────────────────

export default function PdfEditor() {
  const [stage, setStage] = useState<"upload" | "editing">("upload");
  const [pages, setPages] = useState<PageState[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [activeTool, setActiveTool] = useState<ToolName>("select");
  const [drawColor, setDrawColor] = useState("#000000");
  const [brushWidth, setBrushWidth] = useState(4);
  const [highlightColor, setHighlightColor] = useState("#ffff00");
  const [exporting, setExporting] = useState(false);
  const [noEnergy, setNoEnergy] = useState(false);
  const [watermarkOpen, setWatermarkOpen] = useState(false);
  const [watermarkText, setWatermarkText] = useState("CONFIDENTIAL");
  const [watermarkOpacity, setWatermarkOpacity] = useState(0.3);
  const [pageNumOpen, setPageNumOpen] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const canvasElRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<import("fabric").Canvas | null>(null);
  const pagesRef = useRef<PageState[]>([]);
  const historyRef = useRef<string[]>([]); // undo stack
  const currentPageRef = useRef(0);
  const activeToolRef = useRef<ToolName>("select");
  const drawColorRef = useRef(drawColor);
  const brushWidthRef = useRef(brushWidth);
  const highlightColorRef = useRef(highlightColor);
  const mouseStartRef = useRef<{ x: number; y: number } | null>(null);
  const tempShapeRef = useRef<import("fabric").FabricObject | null>(null);
  const cropRectRef = useRef<import("fabric").Rect | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const pdfInsertInputRef = useRef<HTMLInputElement>(null);
  const destroyedRef = useRef(false);

  // ── mobile detection ──────────────────────────────────────────────────────
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Keep refs in sync
  useEffect(() => { pagesRef.current = pages; }, [pages]);
  useEffect(() => { currentPageRef.current = currentPage; }, [currentPage]);
  useEffect(() => { activeToolRef.current = activeTool; }, [activeTool]);
  useEffect(() => { drawColorRef.current = drawColor; }, [drawColor]);
  useEffect(() => { brushWidthRef.current = brushWidth; }, [brushWidth]);
  useEffect(() => { highlightColorRef.current = highlightColor; }, [highlightColor]);

  // ── save current page state ──────────────────────────────────────────────
  const saveCurrentPage = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const json = JSON.stringify(canvas.toJSON());
    setPages((prev) => {
      const next = [...prev];
      if (next[currentPageRef.current]) {
        next[currentPageRef.current] = { ...next[currentPageRef.current], fabricJson: json };
      }
      return next;
    });
    pagesRef.current = pagesRef.current.map((p, i) =>
      i === currentPageRef.current ? { ...p, fabricJson: json } : p
    );
  }, []);

  // ── load a page onto the canvas ──────────────────────────────────────────
  const loadPage = useCallback(async (index: number, pageList?: PageState[]) => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const list = pageList ?? pagesRef.current;
    const page = list[index];
    if (!page) return;

    const { FabricImage } = await import("fabric");

    canvas.setDimensions({ width: page.width, height: page.height });
    canvas.clear();

    // Load background
    const bg = await FabricImage.fromURL(page.backgroundDataUrl);
    bg.set({ left: 0, top: 0, selectable: false, evented: false, lockMovementX: true, lockMovementY: true });
    bg.scaleToWidth(page.width);
    canvas.add(bg);
    canvas.sendObjectToBack(bg);

    // Restore annotations
    if (page.fabricJson) {
      try {
        const parsed = JSON.parse(page.fabricJson);
        await canvas.loadFromJSON(parsed);
        // Re-lock background (index 0 after load)
        const objs = canvas.getObjects();
        if (objs[0]) {
          objs[0].set({ selectable: false, evented: false });
        }
      } catch {
        // ignore parse errors
      }
    }

    canvas.renderAll();
  }, []);

  // ── switch page ──────────────────────────────────────────────────────────
  const switchPage = useCallback(async (index: number) => {
    saveCurrentPage();
    setCurrentPage(index);
    currentPageRef.current = index;
    await loadPage(index);
  }, [saveCurrentPage, loadPage]);

  // ── apply tool settings to canvas ────────────────────────────────────────
  const applyToolToCanvas = useCallback(async (tool: ToolName) => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const { PencilBrush } = await import("fabric");

    canvas.isDrawingMode = false;
    canvas.selection = false;
    canvas.defaultCursor = "crosshair";

    if (tool === "select") {
      canvas.selection = true;
      canvas.defaultCursor = "default";
    } else if (tool === "draw") {
      canvas.isDrawingMode = true;
      const brush = new PencilBrush(canvas);
      brush.color = drawColorRef.current;
      brush.width = brushWidthRef.current;
      canvas.freeDrawingBrush = brush;
    } else if (tool === "erase") {
      canvas.defaultCursor = "not-allowed";
    }
    canvas.renderAll();
  }, []);

  // ── canvas event handlers ─────────────────────────────────────────────────
  const setupCanvasEvents = useCallback(async (canvas: import("fabric").Canvas) => {
    const { Rect, IText, Circle, Line, FabricImage } = await import("fabric");

    canvas.on("mouse:down", (opt) => {
      const tool = activeToolRef.current;
      const pointer = canvas.getScenePoint(opt.e);
      mouseStartRef.current = { x: pointer.x, y: pointer.y };

      if (tool === "erase") {
        const target = opt.target;
        if (target) {
          const objs = canvas.getObjects();
          // Don't erase the background (index 0)
          if (objs.indexOf(target) !== 0) {
            canvas.remove(target);
            canvas.renderAll();
          }
        }
        return;
      }

      if (tool === "text") {
        const text = new IText("Text here", {
          left: pointer.x,
          top: pointer.y,
          fontSize: 18,
          fill: "#000000",
        });
        canvas.add(text);
        canvas.setActiveObject(text);
        text.enterEditing();
        canvas.renderAll();
        return;
      }

      if (tool === "highlight") {
        const color = hexToRgba(highlightColorRef.current, 0.35);
        const rect = new Rect({
          left: pointer.x,
          top: pointer.y,
          width: 0,
          height: 0,
          fill: color,
          stroke: "transparent",
          selectable: true,
        });
        canvas.add(rect);
        tempShapeRef.current = rect;
        return;
      }

      if (tool === "rect") {
        const rect = new Rect({
          left: pointer.x,
          top: pointer.y,
          width: 0,
          height: 0,
          fill: "transparent",
          stroke: drawColorRef.current,
          strokeWidth: 2,
        });
        canvas.add(rect);
        tempShapeRef.current = rect;
        return;
      }

      if (tool === "circle") {
        const circle = new Circle({
          left: pointer.x,
          top: pointer.y,
          radius: 0,
          fill: "transparent",
          stroke: drawColorRef.current,
          strokeWidth: 2,
        });
        canvas.add(circle);
        tempShapeRef.current = circle;
        return;
      }

      if (tool === "line") {
        const line = new Line([pointer.x, pointer.y, pointer.x, pointer.y], {
          stroke: drawColorRef.current,
          strokeWidth: 2,
        });
        canvas.add(line);
        tempShapeRef.current = line;
        return;
      }

      if (tool === "redact") {
        const rect = new Rect({
          left: pointer.x,
          top: pointer.y,
          width: 0,
          height: 0,
          fill: "#000000",
          selectable: false,
          evented: false,
        });
        canvas.add(rect);
        tempShapeRef.current = rect;
        return;
      }

      if (tool === "crop") {
        // Remove existing crop rect if any
        if (cropRectRef.current) {
          canvas.remove(cropRectRef.current);
        }
        const rect = new Rect({
          left: pointer.x,
          top: pointer.y,
          width: 0,
          height: 0,
          fill: "rgba(0,120,255,0.1)",
          stroke: "#0078ff",
          strokeWidth: 2,
          strokeDashArray: [6, 4],
          selectable: true,
        });
        canvas.add(rect);
        cropRectRef.current = rect;
        tempShapeRef.current = rect;
        return;
      }

      void FabricImage; // suppress lint
    });

    canvas.on("mouse:move", (opt) => {
      const tool = activeToolRef.current;
      const shape = tempShapeRef.current;
      if (!shape || !mouseStartRef.current) return;
      const pointer = canvas.getScenePoint(opt.e);
      const { x: sx, y: sy } = mouseStartRef.current;

      if (tool === "highlight" || tool === "rect" || tool === "redact" || tool === "crop") {
        const w = pointer.x - sx;
        const h = pointer.y - sy;
        shape.set({
          left: w < 0 ? pointer.x : sx,
          top: h < 0 ? pointer.y : sy,
          width: Math.abs(w),
          height: Math.abs(h),
        });
        canvas.renderAll();
      }

      if (tool === "circle") {
        const r = Math.hypot(pointer.x - sx, pointer.y - sy) / 2;
        (shape as import("fabric").Circle).set({ radius: r });
        canvas.renderAll();
      }

      if (tool === "line") {
        (shape as import("fabric").Line).set({ x2: pointer.x, y2: pointer.y });
        canvas.renderAll();
      }
    });

    canvas.on("mouse:up", () => {
      const tool = activeToolRef.current;
      if (tool === "crop" && cropRectRef.current) {
        const r = cropRectRef.current;
        const crop = {
          x: r.left ?? 0,
          y: r.top ?? 0,
          width: r.width ?? 0,
          height: r.height ?? 0,
        };
        setPages((prev) => {
          const next = [...prev];
          if (next[currentPageRef.current]) {
            next[currentPageRef.current] = { ...next[currentPageRef.current], cropRect: crop };
          }
          return next;
        });
      }
      tempShapeRef.current = null;
      mouseStartRef.current = null;
    });
  }, []);

  // ── init Fabric canvas ────────────────────────────────────────────────────
  useEffect(() => {
    if (stage !== "editing" || !canvasElRef.current) return;
    destroyedRef.current = false;

    let canvas: import("fabric").Canvas | null = null;

    (async () => {
      const { Canvas } = await import("fabric");
      if (destroyedRef.current) return;

      canvas = new Canvas(canvasElRef.current!, {
        selection: true,
        backgroundColor: "#ffffff",
      });
      fabricRef.current = canvas;

      await setupCanvasEvents(canvas);
      await loadPage(0);
    })();

    return () => {
      destroyedRef.current = true;
      if (canvas) {
        canvas.dispose();
        fabricRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  // ── react to tool changes ─────────────────────────────────────────────────
  useEffect(() => {
    if (stage === "editing") {
      applyToolToCanvas(activeTool);
    }
  }, [activeTool, stage, applyToolToCanvas]);

  // ── update draw brush when color/width changes ────────────────────────────
  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas || !canvas.freeDrawingBrush) return;
    canvas.freeDrawingBrush.color = drawColor;
    canvas.freeDrawingBrush.width = brushWidth;
  }, [drawColor, brushWidth]);

  // ── upload handler ────────────────────────────────────────────────────────
  const handleFile = useCallback(async (file: File) => {
    if (!file.name.endsWith(".pdf")) return;
    setUploading(true);
    try {
      const parsed = await renderPdfToPages(file);
      setPages(parsed);
      pagesRef.current = parsed;
      setCurrentPage(0);
      setStage("editing");
    } finally {
      setUploading(false);
    }
  }, []);

  // ── apply watermark to all pages ──────────────────────────────────────────
  const applyWatermark = useCallback(async () => {
    saveCurrentPage();
    const { Canvas, IText } = await import("fabric");
    const { FabricImage } = await import("fabric");

    const updatedPages = await Promise.all(
      pagesRef.current.map(async (page) => {
        const offEl = document.createElement("canvas");
        const off = new Canvas(offEl, { width: page.width, height: page.height });

        const bg = await FabricImage.fromURL(page.backgroundDataUrl);
        bg.set({ left: 0, top: 0, selectable: false, evented: false });
        bg.scaleToWidth(page.width);
        off.add(bg);

        if (page.fabricJson) {
          try {
            await off.loadFromJSON(JSON.parse(page.fabricJson));
            const objs = off.getObjects();
            if (objs[0]) objs[0].set({ selectable: false, evented: false });
          } catch { /* ignore */ }
        }

        const wm = new IText(watermarkText, {
          left: page.width / 2,
          top: page.height / 2,
          originX: "center",
          originY: "center",
          fontSize: Math.min(page.width, page.height) / 8,
          fill: `rgba(180,0,0,${watermarkOpacity})`,
          angle: -30,
          selectable: false,
          evented: false,
        });
        off.add(wm);
        off.renderAll();

        const json = JSON.stringify(off.toJSON());
        off.dispose();
        return { ...page, fabricJson: json };
      })
    );

    setPages(updatedPages);
    pagesRef.current = updatedPages;
    await loadPage(currentPageRef.current, updatedPages);
    setWatermarkOpen(false);
  }, [saveCurrentPage, loadPage, watermarkText, watermarkOpacity]);

  // ── apply page numbers to all pages ──────────────────────────────────────
  const applyPageNumbers = useCallback(async () => {
    saveCurrentPage();
    const { Canvas, IText, FabricImage } = await import("fabric");

    const updatedPages = await Promise.all(
      pagesRef.current.map(async (page, i) => {
        const offEl = document.createElement("canvas");
        const off = new Canvas(offEl, { width: page.width, height: page.height });

        const bg = await FabricImage.fromURL(page.backgroundDataUrl);
        bg.set({ left: 0, top: 0, selectable: false, evented: false });
        bg.scaleToWidth(page.width);
        off.add(bg);

        if (page.fabricJson) {
          try {
            await off.loadFromJSON(JSON.parse(page.fabricJson));
            const objs = off.getObjects();
            if (objs[0]) objs[0].set({ selectable: false, evented: false });
          } catch { /* ignore */ }
        }

        const num = new IText(String(i + 1), {
          left: page.width / 2,
          top: page.height - 30,
          originX: "center",
          originY: "center",
          fontSize: 16,
          fill: "#333333",
          selectable: false,
          evented: false,
        });
        off.add(num);
        off.renderAll();

        const json = JSON.stringify(off.toJSON());
        off.dispose();
        return { ...page, fabricJson: json };
      })
    );

    setPages(updatedPages);
    pagesRef.current = updatedPages;
    await loadPage(currentPageRef.current, updatedPages);
    setPageNumOpen(false);
  }, [saveCurrentPage, loadPage]);

  // ── insert blank page ─────────────────────────────────────────────────────
  const insertBlankPage = useCallback(() => {
    const ref = pagesRef.current[currentPageRef.current];
    const w = ref?.width ?? 595;
    const h = ref?.height ?? 842;

    const offEl = document.createElement("canvas");
    offEl.width = w * 2;
    offEl.height = h * 2;
    const ctx = offEl.getContext("2d")!;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w * 2, h * 2);
    const dataUrl = offEl.toDataURL("image/jpeg", 0.92);

    const newPage: PageState = { backgroundDataUrl: dataUrl, width: w, height: h, fabricJson: "" };
    setPages((prev) => {
      const next = [...prev, newPage];
      pagesRef.current = next;
      return next;
    });
  }, []);

  // ── insert pages from PDF ─────────────────────────────────────────────────
  const handleInsertPdf = useCallback(async (file: File) => {
    const newPages = await renderPdfToPages(file);
    setPages((prev) => {
      const next = [...prev, ...newPages];
      pagesRef.current = next;
      return next;
    });
  }, []);

  // ── image pick handler ────────────────────────────────────────────────────
  const handleImageFile = useCallback(async (file: File) => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const { FabricImage } = await import("fabric");
    const url = URL.createObjectURL(file);
    const img = await FabricImage.fromURL(url);
    img.scaleToWidth(Math.min(200, canvas.width! / 2));
    img.set({ left: 50, top: 50 });
    canvas.add(img);
    canvas.setActiveObject(img);
    canvas.renderAll();
  }, []);

  // ── export PDF ───────────────────────────────────────────────────────────
  const exportPdf = useCallback(async () => {
    setExporting(true);
    try {
      // Check energy
      const energyRes = await fetch("/api/energy/consume", { method: "POST" });
      if (energyRes.status === 402) {
        setNoEnergy(true);
        return;
      }

      saveCurrentPage();

      const { Canvas, FabricImage } = await import("fabric");
      const { PDFDocument } = await import("pdf-lib");

      const pdfDoc = await PDFDocument.create();

      for (const page of pagesRef.current) {
        // Render page to jpeg
        const offEl = document.createElement("canvas");
        const off = new Canvas(offEl, { width: page.width, height: page.height });

        const bg = await FabricImage.fromURL(page.backgroundDataUrl);
        bg.set({ left: 0, top: 0, selectable: false, evented: false });
        bg.scaleToWidth(page.width);
        off.add(bg);

        if (page.fabricJson) {
          try {
            await off.loadFromJSON(JSON.parse(page.fabricJson));
            const objs = off.getObjects();
            if (objs[0]) objs[0].set({ selectable: false, evented: false });
          } catch { /* ignore */ }
        }
        off.renderAll();

        const dataUrl = off.toDataURL({ format: "jpeg", quality: 0.92, multiplier: 1 });
        off.dispose();

        // Strip data URL prefix
        const base64 = dataUrl.split(",")[1];
        const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
        const jpgImg = await pdfDoc.embedJpg(bytes);

        const pageW = page.width;
        const pageH = page.height;
        const pdfPage = pdfDoc.addPage([pageW, pageH]);
        pdfPage.drawImage(jpgImg, { x: 0, y: 0, width: pageW, height: pageH });

        if (page.cropRect) {
          const { x, y, width: cw, height: ch } = page.cropRect;
          // pdf-lib Y is from bottom-left
          pdfPage.setCropBox(x, pageH - y - ch, cw, ch);
        }
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "edited.pdf";
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  }, [saveCurrentPage]);

  // ─────────────────────────────────────────────────────────────────────────
  // UPLOAD SCREEN
  // ─────────────────────────────────────────────────────────────────────────
  if (stage === "upload") {
    return (
      <div className="-m-6 flex h-[calc(100vh-4rem)] flex-col items-center justify-center">
        <div className="w-full max-w-lg px-6">
          <h2 className="mb-2 text-2xl font-bold text-text-primary">PDF Editor</h2>
          <p className="mb-8 text-text-secondary">
            Upload a PDF to annotate, redact, draw and export it.
          </p>

          <label
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              const file = e.dataTransfer.files[0];
              if (file) handleFile(file);
            }}
            className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-16 transition-colors ${
              dragOver
                ? "border-brand-primary bg-brand-primary/5"
                : "border-border bg-bg-main hover:border-brand-primary/50"
            }`}
          >
            {uploading ? (
              <Loader2 className="mb-3 h-10 w-10 animate-spin text-brand-primary" />
            ) : (
              <svg className="mb-4 h-12 w-12 text-text-secondary/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            )}
            <p className="text-sm font-medium text-text-primary">
              {uploading ? "Rendering pages…" : "Drop PDF here or click to upload"}
            </p>
            <p className="mt-1 text-xs text-text-secondary">PDF files only</p>
            <input
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
            />
          </label>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // EDITING SCREEN
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      <NoEnergyModal open={noEnergy} onClose={() => setNoEnergy(false)} />

      {/* Hidden file inputs */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleImageFile(file);
          e.target.value = "";
        }}
      />
      <input
        ref={pdfInsertInputRef}
        type="file"
        accept=".pdf"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleInsertPdf(file);
          e.target.value = "";
        }}
      />

      {/* Watermark dialog */}
      {watermarkOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setWatermarkOpen(false)} />
          <div className="relative w-80 rounded-2xl border border-border bg-bg-main p-6 shadow-2xl">
            <h3 className="mb-4 font-semibold text-text-primary">Add Watermark</h3>
            <label className="mb-1 block text-xs text-text-secondary">Text</label>
            <input
              className="mb-3 w-full rounded-lg border border-border bg-bg-section px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary"
              value={watermarkText}
              onChange={(e) => setWatermarkText(e.target.value)}
            />
            <label className="mb-1 block text-xs text-text-secondary">
              Opacity: {Math.round(watermarkOpacity * 100)}%
            </label>
            <input
              type="range" min={0.05} max={1} step={0.05}
              value={watermarkOpacity}
              onChange={(e) => setWatermarkOpacity(Number(e.target.value))}
              className="mb-4 w-full accent-brand-primary"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setWatermarkOpen(false)}
                className="flex-1 rounded-lg border border-border px-4 py-2 text-sm text-text-secondary hover:bg-bg-section"
              >
                Cancel
              </button>
              <button
                onClick={applyWatermark}
                className="flex-1 rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
              >
                Apply to All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Page numbers dialog */}
      {pageNumOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setPageNumOpen(false)} />
          <div className="relative w-72 rounded-2xl border border-border bg-bg-main p-6 shadow-2xl">
            <h3 className="mb-3 font-semibold text-text-primary">Add Page Numbers</h3>
            <p className="mb-4 text-sm text-text-secondary">
              Numbers will be added at the bottom-center of every page.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPageNumOpen(false)}
                className="flex-1 rounded-lg border border-border px-4 py-2 text-sm text-text-secondary hover:bg-bg-section"
              >
                Cancel
              </button>
              <button
                onClick={applyPageNumbers}
                className="flex-1 rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="-m-6 flex h-[calc(100vh-4rem)] flex-col">
        {/* Header */}
        <div className="flex shrink-0 items-center gap-3 border-b border-border bg-bg-main px-4 py-2">
          <Link
            href="/dashboard"
            className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm text-text-secondary transition-colors hover:bg-bg-section hover:text-text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <span className="text-sm font-semibold text-text-primary">PDF Editor</span>
          <span className="text-xs text-text-secondary">
            Page {currentPage + 1} / {pages.length}
          </span>
          <div className="flex-1" />
          <button
            onClick={() => setWatermarkOpen(true)}
            className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs text-text-secondary transition-colors hover:bg-bg-section"
          >
            <Droplets className="h-3.5 w-3.5" />
            Watermark
          </button>
          <button
            onClick={() => setPageNumOpen(true)}
            className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs text-text-secondary transition-colors hover:bg-bg-section"
          >
            <Hash className="h-3.5 w-3.5" />
            Page #
          </button>
          <button
            onClick={exportPdf}
            disabled={exporting}
            className="flex items-center gap-1.5 rounded-lg bg-brand-primary px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {exporting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Download className="h-3.5 w-3.5" />
            )}
            Export PDF
          </button>
        </div>

        {/* Main editing area */}
        <div className="flex flex-1 overflow-hidden">
          <EditorToolbar
            activeTool={activeTool}
            onToolChange={setActiveTool}
            drawColor={drawColor}
            onDrawColorChange={setDrawColor}
            brushWidth={brushWidth}
            onBrushWidthChange={setBrushWidth}
            highlightColor={highlightColor}
            onHighlightColorChange={setHighlightColor}
            onImagePick={() => imageInputRef.current?.click()}
          />

          {/* Canvas area */}
          <div className="flex flex-1 items-start justify-center overflow-auto bg-bg-section p-6">
            <div className="shadow-2xl">
              <canvas ref={canvasElRef} />
            </div>
          </div>

          <PagePanel
            pages={pages}
            currentPage={currentPage}
            onPageSelect={switchPage}
            onInsertBlank={insertBlankPage}
            onInsertFromPdf={() => pdfInsertInputRef.current?.click()}
          />
        </div>
      </div>
    </>
  );
}
