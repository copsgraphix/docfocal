"use client";

import { motion } from "framer-motion";
import {
  CheckCircle2,
  FilePen,
  Scissors,
  Minimize2,
  RotateCw,
  Crop,
  BookOpen,
  Shield,
  ArrowRight,
  GitMerge,
  FileOutput,
  Zap,
} from "lucide-react";
import type { CurrencyConfig } from "@/lib/geo";

// ── Animation variants ─────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};
const blurIn = {
  hidden: { opacity: 0, filter: "blur(8px)" },
  visible: { opacity: 1, filter: "blur(0px)" },
};
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const smoothT = { duration: 0.55, ease: "easeOut" as const };
const blurT   = { duration: 0.65, ease: "easeOut" as const };

// ── Shared light-theme styles ──────────────────────────────────
const BG_1  = "#FFFFFF";          // primary section bg
const BG_2  = "#F8F7F4";          // alternating section bg
const TEXT  = "#111111";
const MUTED = "#6B7280";
const RED   = "#E10600";

/** Light glassmorphism card */
const cardStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.75)",
  border: "1px solid rgba(0,0,0,0.07)",
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
  boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 20px rgba(0,0,0,0.04)",
};
const cardCls = "rounded-2xl p-6";

// ── Notebook lines overlay ─────────────────────────────────────
// Horizontal ruled lines (32px pitch) that fade at left/right edges.
const LINES_STYLE: React.CSSProperties = {
  backgroundImage: `repeating-linear-gradient(
    to bottom,
    transparent 0px,
    transparent 31px,
    rgba(0,0,0,0.055) 31px,
    rgba(0,0,0,0.055) 32px
  )`,
  maskImage:
    "linear-gradient(to right, transparent 0%, black 18%, black 82%, transparent 100%)",
  WebkitMaskImage:
    "linear-gradient(to right, transparent 0%, black 18%, black 82%, transparent 100%)",
};

function NotebookLines() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0"
      style={LINES_STYLE}
    />
  );
}

/** Section wrapper that bakes in notebook lines + relative positioning */
function NSection({
  children,
  id,
  bg = BG_1,
  className = "",
}: {
  children: React.ReactNode;
  id?: string;
  bg?: string;
  className?: string;
}) {
  return (
    <section
      id={id}
      className={`relative overflow-hidden ${className}`}
      style={{ backgroundColor: bg }}
    >
      <NotebookLines />
      <div className="relative z-10">{children}</div>
    </section>
  );
}

// ── Animated wrappers ──────────────────────────────────────────
function FadeSection({
  children,
  id,
  className = "",
}: {
  children: React.ReactNode;
  id?: string;
  className?: string;
}) {
  return (
    <motion.div
      id={id}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={stagger}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function Mv({
  children,
  className = "",
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <motion.div variants={fadeUp} transition={smoothT} className={className} style={style}>
      {children}
    </motion.div>
  );
}

function MvBlur({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div variants={blurIn} transition={blurT} className={className}>
      {children}
    </motion.div>
  );
}

// ── Gradient headline (dark on light) ─────────────────────────
function GradientHeadline({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        background: "linear-gradient(135deg, #111111 0%, #52525B 100%)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
      }}
    >
      {children}
    </span>
  );
}

// ── 3D Hero Mockup (light-mode UI) ────────────────────────────
function HeroMockup() {
  return (
    <div className="relative mx-auto mt-16 max-w-4xl px-4" style={{ perspective: "1200px" }}>
      <motion.div
        initial={{ opacity: 0, rotateX: 20, y: 44 }}
        animate={{ opacity: 1, rotateX: 5, y: 0 }}
        transition={{ duration: 1.1, ease: "easeOut", delay: 0.45 }}
        className="overflow-hidden rounded-2xl"
        style={{
          transformStyle: "preserve-3d",
          border: "1px solid rgba(0,0,0,0.08)",
          boxShadow:
            "0 40px 80px rgba(0,0,0,0.12), 0 8px 24px rgba(0,0,0,0.07), 0 0 0 1px rgba(0,0,0,0.04)",
          background: "#FFFFFF",
        }}
      >
        {/* Browser chrome */}
        <div
          className="flex items-center gap-3 border-b px-5 py-3.5"
          style={{ borderColor: "rgba(0,0,0,0.07)", background: "#F3F4F6" }}
        >
          <div className="flex gap-1.5">
            <div className="h-3 w-3 rounded-full bg-red-400/70" />
            <div className="h-3 w-3 rounded-full bg-yellow-400/70" />
            <div className="h-3 w-3 rounded-full bg-green-400/70" />
          </div>
          <div
            className="mx-auto rounded-md px-16 py-1.5 text-xs"
            style={{ background: "rgba(0,0,0,0.06)", color: "#9CA3AF" }}
          >
            docfocal.com/dashboard/editor
          </div>
        </div>

        {/* App layout */}
        <div className="flex" style={{ minHeight: 256 }}>
          {/* Sidebar */}
          <div
            className="hidden w-48 shrink-0 border-r p-4 md:block"
            style={{ borderColor: "rgba(0,0,0,0.06)", background: "#F9FAFB" }}
          >
            <div className="mb-4 h-3 w-20 rounded-full" style={{ background: `${RED}80` }} />
            {[75, 60, 70].map((w, i) => (
              <div
                key={i}
                className="mb-2 h-2.5 rounded-full"
                style={{
                  width: `${w}%`,
                  background: i === 0 ? "rgba(0,0,0,0.18)" : "rgba(0,0,0,0.07)",
                }}
              />
            ))}
          </div>

          {/* Editor */}
          <div className="flex-1 bg-white p-8">
            {/* Toolbar */}
            <div className="mb-6 flex gap-2">
              {["B", "I", "U", "H1", "H2", "≡"].map((btn, i) => (
                <div
                  key={i}
                  className="rounded px-2 py-1 text-xs font-medium"
                  style={{
                    background: i === 0 ? RED : "rgba(0,0,0,0.05)",
                    color: i === 0 ? "#fff" : "#6B7280",
                  }}
                >
                  {btn}
                </div>
              ))}
            </div>
            {/* Title */}
            <div className="mb-5 h-6 w-56 rounded-md" style={{ background: "rgba(0,0,0,0.1)" }} />
            {/* Body lines */}
            {[100, 88, 94, 72, 80, 60].map((w, i) => (
              <div
                key={i}
                className="mb-3 h-2.5 rounded-full"
                style={{ width: `${w}%`, background: "rgba(0,0,0,0.06)" }}
              />
            ))}
          </div>
        </div>
      </motion.div>

      {/* Soft shadow beneath */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-6 rounded-full"
        style={{
          width: "55%",
          height: 48,
          background: `rgba(225,6,0,0.15)`,
          filter: "blur(32px)",
        }}
      />
    </div>
  );
}

// ── Data ───────────────────────────────────────────────────────
const WHY_CHECKS = [
  "Create documents like Word or Google Docs",
  "Edit PDFs directly in your browser",
  "Convert between formats instantly",
  "Export books as structured EPUB",
  "Auto chapter numbering",
  "No forced login to start",
];

const PDF_TOOLS = [
  { icon: FilePen,   label: "Edit Text" },
  { icon: GitMerge,  label: "Merge PDFs" },
  { icon: Scissors,  label: "Split PDF" },
  { icon: Minimize2, label: "Compress" },
  { icon: RotateCw,  label: "Rotate" },
  { icon: Crop,      label: "Crop" },
];

const CONVERSIONS = ["PDF ↔ DOCX", "PDF ↔ JPG / PNG", "Image → PDF", "Document → EPUB"];
const EPUB_AUDIENCES = ["Self-publishing authors", "Course creators", "Academic writing"];

const FREE_FEATURES = [
  "No account needed",
  "3 document creations",
  "1 PDF edit per day",
  "Limited daily conversions",
  "15 MB file size limit",
  "Automatic file deletion",
];

const PRO_FEATURES = [
  "Everything in Free",
  "Unlimited documents, edits & conversions",
  "100 MB file size limit",
  "Priority processing",
  "Full CV templates",
  "Cloud save — no auto-deletion",
  "Priority support",
];

// ── Main ───────────────────────────────────────────────────────
export default function LandingPage({ currency }: { currency: CurrencyConfig }) {
  return (
    <main style={{ backgroundColor: BG_1 }}>

      {/* ══ 1. HERO ══════════════════════════════════════════ */}
      <NSection bg={BG_1} className="px-6 pb-0 pt-28 text-center">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="mx-auto max-w-4xl"
        >
          {/* Badge */}
          <motion.div variants={fadeUp} transition={smoothT} className="mb-5 flex justify-center">
            <span
              className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold"
              style={{ borderColor: `${RED}30`, color: RED, background: `${RED}08` }}
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: RED }} />
              Document workspace for everyone
            </span>
          </motion.div>

          {/* Headline */}
          <MvBlur className="mb-6 text-5xl font-black leading-[1.05] tracking-tighter md:text-7xl">
            <GradientHeadline>Create. Edit.</GradientHeadline>
            <br />
            <GradientHeadline>Convert. Publish.</GradientHeadline>
          </MvBlur>

          {/* Sub */}
          <Mv className="mb-3 text-lg md:text-xl" style={{ color: TEXT }}>
            Your complete document workspace — no login required.
          </Mv>

          {/* Body */}
          <Mv
            className="mx-auto mb-10 max-w-2xl text-sm leading-relaxed md:text-base"
            style={{ color: MUTED }}
          >
            Docfocal lets you write documents, edit PDFs, convert files, and export to
            EPUB with automatic chapter formatting — all in one place.
          </Mv>

          {/* CTAs */}
          <Mv className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <motion.a
              href="/dashboard"
              animate={{
                boxShadow: [
                  `0 0 18px ${RED}55`,
                  `0 0 38px ${RED}99`,
                  `0 0 18px ${RED}55`,
                ],
              }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              className="flex items-center gap-2 rounded-xl px-7 py-3.5 text-sm font-bold text-white"
              style={{ backgroundColor: RED }}
            >
              Start Free — No Sign Up
              <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
            </motion.a>

            <a
              href="/dashboard/upgrade"
              className="flex items-center gap-2 rounded-xl border px-7 py-3.5 text-sm font-semibold transition-colors"
              style={{
                borderColor: "rgba(0,0,0,0.12)",
                color: TEXT,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = BG_2)}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <Zap className="h-4 w-4" style={{ color: RED }} strokeWidth={1.5} />
              Upgrade to Pro
            </a>
          </Mv>

          <Mv className="mt-4 text-xs" style={{ color: "#9CA3AF" }}>
            Free usage. Limited by device. No account needed.
          </Mv>
        </motion.div>

        <HeroMockup />

        {/* Fade into next section */}
        <div
          className="pointer-events-none absolute bottom-0 left-0 right-0 h-28"
          style={{ background: `linear-gradient(to bottom, transparent, ${BG_2})` }}
        />
      </NSection>

      {/* ══ 2. WHY DOCFOCAL ══════════════════════════════════ */}
      <NSection id="features" bg={BG_2} className="px-6 py-24">
        <FadeSection className="mx-auto max-w-5xl">
          <Mv className="mb-2 text-center text-xs font-bold uppercase tracking-widest" style={{ color: RED }}>
            Why Docfocal
          </Mv>
          <MvBlur className="mb-4 text-center text-3xl font-black tracking-tighter md:text-5xl">
            <GradientHeadline>Finally, more than just a PDF tool.</GradientHeadline>
          </MvBlur>
          <Mv className="mx-auto mb-14 max-w-xl text-center text-base" style={{ color: MUTED }}>
            Unlike basic converters, Docfocal gives you a full document editor + publishing tools.
          </Mv>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {WHY_CHECKS.map((item) => (
              <Mv
                key={item}
                className={`${cardCls} flex items-start gap-3`}
                style={cardStyle}
              >
                <CheckCircle2
                  className="mt-0.5 h-5 w-5 shrink-0"
                  style={{ color: RED }}
                  strokeWidth={1.5}
                />
                <span className="text-sm font-medium" style={{ color: TEXT }}>
                  {item}
                </span>
              </Mv>
            ))}
          </div>
        </FadeSection>
      </NSection>

      {/* ══ 3. BENTO GRID ════════════════════════════════════ */}
      <NSection bg={BG_1} className="px-6 py-24">
        <FadeSection className="mx-auto max-w-6xl">
          <Mv className="mb-2 text-center text-xs font-bold uppercase tracking-widest" style={{ color: RED }}>
            Full Toolkit
          </Mv>
          <MvBlur className="mb-14 text-center text-3xl font-black tracking-tighter md:text-5xl">
            <GradientHeadline>Everything in one workspace.</GradientHeadline>
          </MvBlur>

          {/* Asymmetric 3-col grid */}
          <div className="grid gap-4 lg:grid-cols-3">

            {/* Block 1 — large */}
            <Mv
              className={`${cardCls} lg:col-span-2 lg:row-span-2`}
              style={{ ...cardStyle, borderColor: `${RED}28` }}
            >
              <div
                className="mb-4 inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold"
                style={{ background: `${RED}10`, color: RED }}
              >
                <FileOutput className="h-3.5 w-3.5" strokeWidth={1.5} />
                Creator Suite
              </div>
              <h3 className="mb-3 text-2xl font-black tracking-tight" style={{ color: TEXT }}>
                Smart Document Creator<br className="hidden sm:block" /> &amp; CV Builder
              </h3>
              <p className="mb-6 text-sm leading-relaxed" style={{ color: MUTED }}>
                Write like a pro. Publish like an author. Create Word documents or
                ATS-friendly CV templates right in your browser.
              </p>
              <div className="flex flex-wrap gap-2">
                {["A4 & Letter layouts", "Rich text editor", "Headers & Footers", "Export PDF/DOCX", "CV templates"].map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border px-3 py-1 text-xs font-medium"
                    style={{ borderColor: "rgba(0,0,0,0.08)", color: MUTED }}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Decorative doc preview */}
              <div
                className="mt-8 overflow-hidden rounded-xl border p-5"
                style={{ borderColor: "rgba(0,0,0,0.06)", background: "#F9FAFB" }}
              >
                <div className="mb-4 h-4 w-40 rounded-full" style={{ background: "rgba(0,0,0,0.12)" }} />
                {[88, 74, 92, 68].map((w, i) => (
                  <div key={i} className="mb-2.5 h-2 rounded-full" style={{ width: `${w}%`, background: "rgba(0,0,0,0.07)" }} />
                ))}
                <div className="mt-5 flex gap-2">
                  <div className="h-7 w-20 rounded-lg" style={{ background: `${RED}BB` }} />
                  <div className="h-7 w-20 rounded-lg" style={{ background: "rgba(0,0,0,0.07)" }} />
                </div>
              </div>
            </Mv>

            {/* Block 2 — PDF Editor */}
            <Mv className={cardCls} style={cardStyle}>
              <div className="mb-1 flex items-center gap-2">
                <FilePen className="h-5 w-5" style={{ color: RED }} strokeWidth={1.5} />
                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#9CA3AF" }}>
                  PDF Editor
                </span>
              </div>
              <h3 className="mb-2 text-lg font-bold" style={{ color: TEXT }}>Total PDF Control</h3>
              <p className="mb-5 text-xs leading-relaxed" style={{ color: MUTED }}>
                Edit PDFs without installing heavy software. Fast. Browser-based. Secure.
              </p>
              <div className="grid grid-cols-3 gap-2">
                {PDF_TOOLS.map(({ icon: Icon, label }) => (
                  <div
                    key={label}
                    className="flex flex-col items-center gap-1.5 rounded-xl p-3"
                    style={{ background: "rgba(0,0,0,0.03)", border: "1px solid rgba(0,0,0,0.05)" }}
                  >
                    <Icon className="h-4 w-4" style={{ color: "#374151" }} strokeWidth={1.5} />
                    <span className="text-center text-[10px] font-medium" style={{ color: "#9CA3AF" }}>
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </Mv>

            {/* Block 3 — Conversions */}
            <Mv className={cardCls} style={cardStyle}>
              <div className="mb-1 flex items-center gap-2">
                <GitMerge className="h-5 w-5" style={{ color: RED }} strokeWidth={1.5} />
                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#9CA3AF" }}>
                  Conversions
                </span>
              </div>
              <h3 className="mb-2 text-lg font-bold" style={{ color: TEXT }}>Flawless Conversions</h3>
              <p className="mb-4 text-xs leading-relaxed" style={{ color: MUTED }}>
                All essential conversions in one place without losing formatting.
              </p>
              <ul className="mb-4 space-y-2">
                {CONVERSIONS.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm font-medium" style={{ color: TEXT }}>
                    <span className="h-1 w-1 shrink-0 rounded-full" style={{ background: RED }} />
                    {item}
                  </li>
                ))}
              </ul>
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
                style={{ background: `${RED}10`, color: RED }}
              >
                ✦ No watermark on free exports
              </span>
            </Mv>

            {/* Block 4 — Sign & Protect (full-width strip) */}
            <Mv className={`${cardCls} lg:col-span-3`} style={cardStyle}>
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                    style={{ background: `${RED}10` }}
                  >
                    <Shield className="h-5 w-5" style={{ color: RED }} strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="font-bold" style={{ color: TEXT }}>Sign &amp; Protect</h3>
                    <p className="text-xs" style={{ color: MUTED }}>
                      Insert digital signatures and custom watermarks instantly.
                    </p>
                  </div>
                </div>
                <a
                  href="/dashboard/pdf"
                  className="shrink-0 rounded-lg border px-4 py-2 text-xs font-semibold transition-colors hover:bg-gray-50"
                  style={{ borderColor: "rgba(0,0,0,0.1)", color: MUTED }}
                >
                  Try it free →
                </a>
              </div>
            </Mv>
          </div>
        </FadeSection>
      </NSection>

      {/* ══ 4. EPUB HIGHLIGHT ════════════════════════════════ */}
      <NSection bg={BG_2} className="px-6 py-24">
        <FadeSection className="mx-auto max-w-5xl">
          <Mv
            className="overflow-hidden rounded-3xl border p-10 md:p-16"
            style={{
              background: `linear-gradient(135deg, ${RED}08 0%, rgba(255,255,255,0.6) 100%)`,
              borderColor: `${RED}22`,
              boxShadow: `0 0 0 1px ${RED}12, 0 4px 24px rgba(0,0,0,0.06)`,
            }}
          >
            <div className="flex flex-col gap-8 md:flex-row md:items-center">
              <div className="flex-1">
                <div
                  className="mb-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold"
                  style={{ background: `${RED}12`, color: RED }}
                >
                  <BookOpen className="h-4 w-4" strokeWidth={1.5} />
                  EPUB Export — Built for Writers
                </div>
                <h2 className="mb-4 text-3xl font-black tracking-tighter md:text-4xl">
                  <GradientHeadline>
                    Turn your document into<br />a published ebook.
                  </GradientHeadline>
                </h2>
                <p className="mb-6 text-sm leading-relaxed" style={{ color: MUTED }}>
                  Automatic chapter detection, clean file structure, and Kindle
                  compatibility. Export once and distribute anywhere.
                </p>
                <div className="flex flex-wrap gap-2">
                  {EPUB_AUDIENCES.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border px-4 py-1.5 text-xs font-medium"
                      style={{ borderColor: "rgba(0,0,0,0.1)", color: MUTED, background: "rgba(255,255,255,0.7)" }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* EPUB preview card */}
              <div
                className="shrink-0 overflow-hidden rounded-2xl md:w-64"
                style={{ ...cardStyle, borderColor: `${RED}20` }}
              >
                <div
                  className="border-b px-4 py-3 text-xs font-semibold"
                  style={{ borderColor: "rgba(0,0,0,0.06)", color: RED, background: "#FAFAFA" }}
                >
                  📚 my-book.epub
                </div>
                {["Chapter 1: Introduction", "Chapter 2: Core Concepts", "Chapter 3: Advanced Topics", "Chapter 4: Conclusion"].map((ch, i) => (
                  <div
                    key={i}
                    className="border-b px-4 py-2.5 text-xs"
                    style={{
                      borderColor: "rgba(0,0,0,0.04)",
                      color: i === 0 ? TEXT : "#9CA3AF",
                      background: i === 0 ? `${RED}06` : "#FFFFFF",
                      fontWeight: i === 0 ? 500 : 400,
                    }}
                  >
                    {ch}
                  </div>
                ))}
                <div className="bg-white px-4 py-3">
                  <div
                    className="rounded-lg py-1.5 text-center text-xs font-semibold text-white"
                    style={{ background: RED }}
                  >
                    Export to EPUB →
                  </div>
                </div>
              </div>
            </div>
          </Mv>
        </FadeSection>
      </NSection>

      {/* ══ 5. PRICING ═══════════════════════════════════════ */}
      <NSection id="pricing" bg={BG_1} className="px-6 py-24">
        <FadeSection className="mx-auto max-w-4xl">
          <Mv className="mb-2 text-center text-xs font-bold uppercase tracking-widest" style={{ color: RED }}>
            Pricing
          </Mv>
          <MvBlur className="mb-4 text-center text-3xl font-black tracking-tighter md:text-5xl">
            <GradientHeadline>Simple, transparent pricing.</GradientHeadline>
          </MvBlur>
          <Mv className="mx-auto mb-14 max-w-lg text-center text-sm" style={{ color: MUTED }}>
            Start free with no account. Upgrade when you need more.
          </Mv>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Free */}
            <Mv className={cardCls} style={cardStyle}>
              <p className="mb-1 text-xs font-bold uppercase tracking-widest" style={{ color: "#9CA3AF" }}>
                🆓 Free Plan
              </p>
              <p className="mb-1 text-4xl font-black" style={{ color: TEXT }}>
                {currency.isNGN ? "₦0" : "$0"}
                <span className="text-base font-normal" style={{ color: MUTED }}>/month</span>
              </p>
              <p className="mb-6 text-xs" style={{ color: "#9CA3AF" }}>No account needed · Limited by device</p>
              <ul className="mb-8 space-y-3">
                {FREE_FEATURES.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm" style={{ color: MUTED }}>
                    <div className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: "#D1D5DB" }} />
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href="/dashboard"
                className="block rounded-xl border py-3 text-center text-sm font-semibold transition-colors hover:bg-gray-50"
                style={{ borderColor: "rgba(0,0,0,0.1)", color: TEXT }}
              >
                Start for free
              </a>
            </Mv>

            {/* Pro — red glow border */}
            <Mv
              className={cardCls}
              style={{
                background: "rgba(255,255,255,0.9)",
                border: `1.5px solid ${RED}`,
                backdropFilter: "blur(12px)",
                boxShadow: `0 0 32px ${RED}22, 0 4px 24px rgba(0,0,0,0.06), inset 0 1px 0 ${RED}15`,
              }}
            >
              <div className="mb-1 flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-widest" style={{ color: RED }}>
                  🚀 Pro Plan
                </p>
                <span
                  className="flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold"
                  style={{ background: `${RED}12`, color: RED }}
                >
                  <Zap className="h-3 w-3" strokeWidth={1.5} />
                  Popular
                </span>
              </div>
              <div className="mb-1">
                <span className="text-4xl font-black" style={{ color: TEXT }}>{currency.monthly}</span>
                <span className="text-base font-normal" style={{ color: MUTED }}>/month</span>
              </div>
              <p className="mb-6 text-xs" style={{ color: "#9CA3AF" }}>
                or {currency.yearly}/yr · {currency.yearlyPerMonth} · save {currency.yearlySavings}
              </p>
              <ul className="mb-8 space-y-3">
                {PRO_FEATURES.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm" style={{ color: TEXT }}>
                    <CheckCircle2 className="h-4 w-4 shrink-0" style={{ color: RED }} strokeWidth={1.5} />
                    {f}
                  </li>
                ))}
              </ul>
              <motion.a
                href="/dashboard/upgrade"
                animate={{
                  boxShadow: [
                    `0 0 14px ${RED}55`,
                    `0 0 28px ${RED}99`,
                    `0 0 14px ${RED}55`,
                  ],
                }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                className="flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white"
                style={{ backgroundColor: RED }}
              >
                <Zap className="h-4 w-4" strokeWidth={1.5} />
                Upgrade to Pro
              </motion.a>
            </Mv>
          </div>
        </FadeSection>
      </NSection>

      {/* ══ FINAL CTA ════════════════════════════════════════ */}
      <NSection bg={BG_2} className="px-6 py-20 text-center">
        <FadeSection className="mx-auto max-w-2xl">
          <MvBlur className="mb-4 text-3xl font-black tracking-tighter md:text-5xl">
            <GradientHeadline>Ready to get focused?</GradientHeadline>
          </MvBlur>
          <Mv className="mb-8 text-base" style={{ color: MUTED }}>
            Join professionals who use docfocal every day.
          </Mv>
          <Mv>
            <motion.a
              href="/dashboard"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 rounded-xl px-8 py-3.5 text-sm font-bold text-white"
              style={{ backgroundColor: RED }}
            >
              Start for Free
              <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
            </motion.a>
          </Mv>
        </FadeSection>
      </NSection>

      {/* ══ FOOTER ═══════════════════════════════════════════ */}
      <footer
        className="px-6 py-8"
        style={{ borderTop: "1px solid rgba(0,0,0,0.06)", backgroundColor: BG_1 }}
      >
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-sm font-bold" style={{ color: TEXT }}>
            doc<span style={{ color: RED }}>focal</span>
          </p>
          <p className="text-xs" style={{ color: "#9CA3AF" }}>
            © {new Date().getFullYear()} docfocal. All rights reserved.
          </p>
          <div className="flex gap-6">
            {["Features", "Pricing"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-xs transition-colors hover:text-[#111111]"
                style={{ color: "#9CA3AF" }}
              >
                {item}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </main>
  );
}
