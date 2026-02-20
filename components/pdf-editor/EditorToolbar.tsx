"use client";

import {
  MousePointer2,
  Highlighter,
  Type,
  Square,
  Circle,
  Minus,
  Pencil,
  Image,
  RectangleHorizontal,
  Eraser,
  Crop,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type ToolName =
  | "select"
  | "highlight"
  | "text"
  | "rect"
  | "circle"
  | "line"
  | "draw"
  | "image"
  | "redact"
  | "erase"
  | "crop";

interface EditorToolbarProps {
  activeTool: ToolName;
  onToolChange: (tool: ToolName) => void;
  drawColor: string;
  onDrawColorChange: (c: string) => void;
  brushWidth: number;
  onBrushWidthChange: (w: number) => void;
  highlightColor: string;
  onHighlightColorChange: (c: string) => void;
  onImagePick: () => void;
}

const TOOLS: { name: ToolName; icon: React.ElementType; label: string }[] = [
  { name: "select",    icon: MousePointer2,       label: "Select" },
  { name: "highlight", icon: Highlighter,          label: "Highlight" },
  { name: "text",      icon: Type,                 label: "Text" },
  { name: "rect",      icon: Square,               label: "Rectangle" },
  { name: "circle",    icon: Circle,               label: "Circle" },
  { name: "line",      icon: Minus,                label: "Line" },
  { name: "draw",      icon: Pencil,               label: "Draw" },
  { name: "image",     icon: Image,                label: "Image" },
  { name: "redact",    icon: RectangleHorizontal,  label: "Redact" },
  { name: "erase",     icon: Eraser,               label: "Erase" },
  { name: "crop",      icon: Crop,                 label: "Crop" },
];

export function EditorToolbar({
  activeTool,
  onToolChange,
  drawColor,
  onDrawColorChange,
  brushWidth,
  onBrushWidthChange,
  highlightColor,
  onHighlightColorChange,
  onImagePick,
}: EditorToolbarProps) {
  return (
    <div className="flex w-14 shrink-0 flex-col items-center gap-1 border-r border-border bg-bg-main py-3">
      {TOOLS.map(({ name, icon: Icon, label }) => (
        <button
          key={name}
          title={label}
          onClick={() => {
            if (name === "image") {
              onToolChange(name);
              onImagePick();
            } else {
              onToolChange(name);
            }
          }}
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
            activeTool === name
              ? "bg-brand-primary text-white"
              : "text-text-secondary hover:bg-bg-section hover:text-text-primary"
          )}
        >
          <Icon className="h-4 w-4" />
        </button>
      ))}

      {/* Divider */}
      <div className="my-2 w-8 border-t border-border" />

      {/* Draw color */}
      {(activeTool === "draw" || activeTool === "rect" || activeTool === "circle" || activeTool === "line") && (
        <div className="flex flex-col items-center gap-1">
          <span className="text-[9px] text-text-secondary">Color</span>
          <input
            type="color"
            value={drawColor}
            onChange={(e) => onDrawColorChange(e.target.value)}
            className="h-7 w-9 cursor-pointer rounded border border-border bg-transparent p-0"
            title="Stroke color"
          />
        </div>
      )}

      {/* Highlight color */}
      {activeTool === "highlight" && (
        <div className="flex flex-col items-center gap-1">
          <span className="text-[9px] text-text-secondary">Color</span>
          <input
            type="color"
            value={highlightColor}
            onChange={(e) => onHighlightColorChange(e.target.value)}
            className="h-7 w-9 cursor-pointer rounded border border-border bg-transparent p-0"
            title="Highlight color"
          />
        </div>
      )}

      {/* Brush width (draw mode only) */}
      {activeTool === "draw" && (
        <div className="flex flex-col items-center gap-1 px-1">
          <span className="text-[9px] text-text-secondary">Size</span>
          <input
            type="range"
            min={1}
            max={20}
            value={brushWidth}
            onChange={(e) => onBrushWidthChange(Number(e.target.value))}
            className="w-10 accent-brand-primary"
            style={{ writingMode: "vertical-lr", direction: "rtl", height: 60 }}
            title="Brush size"
          />
          <span className="text-[9px] text-text-secondary">{brushWidth}</span>
        </div>
      )}
    </div>
  );
}
