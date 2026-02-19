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

// ── Animation variants (no inline transitions — avoids TS type issues) ──
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
};

const blurIn = {
  hidden: { opacity: 0, filter: "blur(10px)" },
  visible: { opacity: 1, filter: "blur(0px)" },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09 } },
};

// ── Shared styles ──────────────────────────────────────────────
const glassCard = "rounded-2xl border backdrop-blur-xl p-6";
const glassStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.02)",
  borderColor: "rgba(255,255,255,0.08)",
};

const smoothTransition = { duration: 0.6, ease: "easeOut" as const };
const blurTransition  = { duration: 0.7, ease: "easeOut" as const };

// ── Animated section wrapper ───────────────────────────────────
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

function Mv({ children, className = "", style }: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <motion.div variants={fadeUp} transition={smoothTransition} className={className} style={style}>
      {children}
    </motion.div>
  );
}

function MvBlur({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div variants={blurIn} transition={blurTransition} className={className}>
      {children}
    </motion.div>
  );
}

function GradientHeadline({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        background: "linear-gradient(160deg, #ffffff 30%, rgba(255,255,255,0.5) 100%)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
      }}
    >
      {children}
    </span>
  );
}

// ── 3D Hero Mockup ─────────────────────────────────────────────
function HeroMockup() {
  return (
    <div className="relative mx-auto mt-16 max-w-4xl px-4" style={{ perspective: "1200px" }}>
      <motion.div
        initial={{ opacity: 0, rotateX: 22, y: 48 }}
        animate={{ opacity: 1, rotateX: 6, y: 0 }}
        transition={{ duration: 1.1, ease: "easeOut", delay: 0.5 }}
        className="overflow-hidden rounded-2xl border"
        style={{
          transformStyle: "preserve-3d",
          boxShadow: "0 60px 120px rgba(225,6,0,0.18), 0 20px 60px rgba(0,0,0,0.6)",
          background: "rgba(255,255,255,0.02)",
          borderColor: "rgba(255,255,255,0.08)",
        }}
      >
        {/* Browser chrome */}
        <div
          className="flex items-center gap-3 border-b px-5 py-3.5"
          style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.03)" }}
        >
          <div className="flex gap-1.5">
            <div className="h-3 w-3 rounded-full" style={{ background: "rgba(255,95,87,0.7)" }} />
            <div className="h-3 w-3 rounded-full" style={{ background: "rgba(255,189,68,0.7)" }} />
            <div className="h-3 w-3 rounded-full" style={{ background: "rgba(40,200,64,0.7)" }} />
          </div>
          <div
            className="mx-auto rounded-md px-16 py-1.5 text-xs"
            style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.25)" }}
          >
            docfocal.com/dashboard/editor
          </div>
        </div>

        {/* Fake editor layout */}
        <div className="flex" style={{ minHeight: 260 }}>
          {/* Sidebar */}
          <div
            className="hidden w-48 shrink-0 border-r p-4 md:block"
            style={{ borderColor: "rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.01)" }}
          >
            <div className="mb-4 h-3 w-20 rounded-full" style={{ background: "rgba(225,6,0,0.5)" }} />
            {[75, 60, 70].map((w, i) => (
              <div
                key={i}
                className="mb-2 h-2.5 rounded-full"
                style={{ width: `${w}%`, background: i === 0 ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.07)" }}
              />
            ))}
          </div>

          {/* Editor area */}
          <div className="flex-1 p-8">
            <div className="mb-6 flex gap-2">
              {["B", "I", "U", "H1", "H2", "≡"].map((btn, i) => (
                <div
                  key={i}
                  className="rounded px-2 py-1 text-xs"
                  style={{
                    background: i === 0 ? "rgba(225,6,0,0.6)" : "rgba(255,255,255,0.06)",
                    color: i === 0 ? "#fff" : "rgba(255,255,255,0.4)",
                  }}
                >
                  {btn}
                </div>
              ))}
            </div>
            <div className="mb-5 h-6 w-56 rounded-md" style={{ background: "rgba(255,255,255,0.12)" }} />
            {[100, 88, 94, 72, 80, 60].map((w, i) => (
              <div
                key={i}
                className="mb-3 h-2.5 rounded-full"
                style={{ width: `${w}%`, background: "rgba(255,255,255,0.06)" }}
              />
            ))}
          </div>
        </div>
      </motion.div>

      {/* Glow beneath */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-8 rounded-full"
        style={{ width: "60%", height: 60, background: "rgba(225,6,0,0.25)", filter: "blur(40px)" }}
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

// ── Main component ─────────────────────────────────────────────
export default function LandingPage() {
  return (
    <main style={{ backgroundColor: "#0A0A0A" }}>

      {/* ══ 1. HERO ════════════════════════════════════════════ */}
      <section className="relative overflow-hidden px-6 pb-0 pt-28 text-center">
        {/* Ambient glow */}
        <div
          className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2"
          style={{
            width: 700, height: 500,
            background: "radial-gradient(ellipse at 50% 0%, rgba(225,6,0,0.22) 0%, transparent 70%)",
            filter: "blur(40px)",
          }}
        />

        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="relative z-10 mx-auto max-w-4xl"
        >
          {/* Badge */}
          <motion.div variants={fadeUp} transition={smoothTransition} className="mb-4 flex justify-center">
            <span
              className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium"
              style={{ borderColor: "rgba(225,6,0,0.35)", color: "rgba(255,255,255,0.6)", background: "rgba(225,6,0,0.08)" }}
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: "#E10600" }} />
              Document workspace for everyone
            </span>
          </motion.div>

          {/* Headline */}
          <MvBlur className="mb-6 text-5xl font-black leading-[1.05] tracking-tighter md:text-7xl">
            <GradientHeadline>Create. Edit.</GradientHeadline>
            <br />
            <GradientHeadline>Convert. Publish.</GradientHeadline>
          </MvBlur>

          {/* Subheadline */}
          <Mv className="mb-3 text-lg md:text-xl" style={{ color: "rgba(255,255,255,0.55)" }}>
            Your complete document workspace — no login required.
          </Mv>

          {/* Body */}
          <Mv
            className="mx-auto mb-10 max-w-2xl text-sm leading-relaxed md:text-base"
            style={{ color: "rgba(255,255,255,0.38)" }}
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
                  "0 0 20px rgba(225,6,0,0.4)",
                  "0 0 44px rgba(225,6,0,0.75)",
                  "0 0 20px rgba(225,6,0,0.4)",
                ],
              }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              className="flex items-center gap-2 rounded-xl px-7 py-3.5 text-sm font-bold text-white"
              style={{ backgroundColor: "#E10600" }}
            >
              Start Free — No Sign Up
              <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
            </motion.a>

            <a
              href="/dashboard/upgrade"
              className="flex items-center gap-2 rounded-xl border px-7 py-3.5 text-sm font-semibold transition-colors hover:bg-white/5"
              style={{ borderColor: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.7)" }}
            >
              <Zap className="h-4 w-4" style={{ color: "#E10600" }} strokeWidth={1.5} />
              Upgrade to Pro
            </a>
          </Mv>

          <Mv className="mt-4 text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>
            Free usage. Limited by device. No account needed.
          </Mv>
        </motion.div>

        <HeroMockup />

        {/* Fade to next section */}
        <div
          className="pointer-events-none absolute bottom-0 left-0 right-0 h-32"
          style={{ background: "linear-gradient(to bottom, transparent, #0A0A0A)" }}
        />
      </section>

      {/* ══ 2. WHY DOCFOCAL ════════════════════════════════════ */}
      <section id="features" style={{ backgroundColor: "#111111" }} className="px-6 py-24">
        <FadeSection className="mx-auto max-w-5xl">
          <Mv className="mb-3 text-center text-xs font-semibold uppercase tracking-widest" style={{ color: "#E10600" }}>
            Why Docfocal
          </Mv>
          <MvBlur className="mb-4 text-center text-3xl font-black tracking-tighter md:text-5xl">
            <GradientHeadline>Finally, more than just a PDF tool.</GradientHeadline>
          </MvBlur>
          <Mv
            className="mx-auto mb-14 max-w-xl text-center text-base"
            style={{ color: "rgba(255,255,255,0.45)" }}
          >
            Unlike basic converters, Docfocal gives you a full document editor + publishing tools.
          </Mv>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {WHY_CHECKS.map((item) => (
              <Mv
                key={item}
                className={`${glassCard} flex items-start gap-3`}
                style={glassStyle}
              >
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" style={{ color: "#E10600" }} strokeWidth={1.5} />
                <span className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.8)" }}>
                  {item}
                </span>
              </Mv>
            ))}
          </div>
        </FadeSection>
      </section>

      {/* ══ 3. BENTO FEATURE GRID ══════════════════════════════ */}
      <section style={{ backgroundColor: "#0A0A0A" }} className="px-6 py-24">
        <FadeSection className="mx-auto max-w-6xl">
          <Mv className="mb-3 text-center text-xs font-semibold uppercase tracking-widest" style={{ color: "#E10600" }}>
            Full Toolkit
          </Mv>
          <MvBlur className="mb-14 text-center text-3xl font-black tracking-tighter md:text-5xl">
            <GradientHeadline>Everything in one workspace.</GradientHeadline>
          </MvBlur>

          {/* Asymmetric Bento: lg = 3-col, Block 1 spans col 1-2 and row 1-2 */}
          <div className="grid gap-4 lg:grid-cols-3">

            {/* Block 1 — large */}
            <Mv
              className={`${glassCard} lg:col-span-2 lg:row-span-2`}
              style={{ ...glassStyle, borderColor: "rgba(225,6,0,0.2)" }}
            >
              <div
                className="mb-4 inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold"
                style={{ background: "rgba(225,6,0,0.12)", color: "#E10600" }}
              >
                <FileOutput className="h-3.5 w-3.5" strokeWidth={1.5} />
                Creator Suite
              </div>
              <h3 className="mb-3 text-2xl font-black tracking-tight text-white">
                Smart Document Creator<br className="hidden sm:block" /> &amp; CV Builder
              </h3>
              <p className="mb-6 text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>
                Write like a pro. Publish like an author. Create Word documents or
                ATS-friendly CV templates right in your browser.
              </p>
              <div className="flex flex-wrap gap-2">
                {["A4 & Letter layouts", "Rich text editor", "Headers & Footers", "Export PDF/DOCX", "CV templates"].map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border px-3 py-1 text-xs"
                    style={{ borderColor: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.45)" }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
              {/* Decorative doc preview */}
              <div
                className="mt-8 overflow-hidden rounded-xl border p-5"
                style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}
              >
                <div className="mb-4 h-4 w-40 rounded-full" style={{ background: "rgba(255,255,255,0.15)" }} />
                {[88, 74, 92, 68].map((w, i) => (
                  <div key={i} className="mb-2.5 h-2 rounded-full" style={{ width: `${w}%`, background: "rgba(255,255,255,0.06)" }} />
                ))}
                <div className="mt-5 flex gap-2">
                  <div className="h-7 w-20 rounded-lg" style={{ background: "rgba(225,6,0,0.4)" }} />
                  <div className="h-7 w-20 rounded-lg" style={{ background: "rgba(255,255,255,0.06)" }} />
                </div>
              </div>
            </Mv>

            {/* Block 2 — PDF Editor */}
            <Mv className={glassCard} style={glassStyle}>
              <div className="mb-1 flex items-center gap-2">
                <FilePen className="h-5 w-5" style={{ color: "#E10600" }} strokeWidth={1.5} />
                <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.35)" }}>
                  PDF Editor
                </span>
              </div>
              <h3 className="mb-2 text-lg font-bold text-white">Total PDF Control</h3>
              <p className="mb-5 text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>
                Edit PDFs without installing heavy software. Fast. Browser-based. Secure.
              </p>
              <div className="grid grid-cols-3 gap-2">
                {PDF_TOOLS.map(({ icon: Icon, label }) => (
                  <div
                    key={label}
                    className="flex flex-col items-center gap-1.5 rounded-xl p-3"
                    style={{ background: "rgba(255,255,255,0.04)" }}
                  >
                    <Icon className="h-4 w-4" style={{ color: "rgba(255,255,255,0.6)" }} strokeWidth={1.5} />
                    <span className="text-center text-[10px]" style={{ color: "rgba(255,255,255,0.35)" }}>
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </Mv>

            {/* Block 3 — Conversions */}
            <Mv className={glassCard} style={glassStyle}>
              <div className="mb-1 flex items-center gap-2">
                <GitMerge className="h-5 w-5" style={{ color: "#E10600" }} strokeWidth={1.5} />
                <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.35)" }}>
                  Conversions
                </span>
              </div>
              <h3 className="mb-2 text-lg font-bold text-white">Flawless Conversions</h3>
              <p className="mb-4 text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>
                All essential conversions in one place without losing formatting.
              </p>
              <ul className="mb-4 space-y-2">
                {CONVERSIONS.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm font-medium" style={{ color: "rgba(255,255,255,0.7)" }}>
                    <span className="h-1 w-1 shrink-0 rounded-full" style={{ background: "#E10600" }} />
                    {item}
                  </li>
                ))}
              </ul>
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
                style={{ background: "rgba(225,6,0,0.12)", color: "#E10600" }}
              >
                ✦ No watermark on free exports
              </span>
            </Mv>

            {/* Block 4 — Sign & Protect (full width) */}
            <Mv className={`${glassCard} lg:col-span-3`} style={glassStyle}>
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                    style={{ background: "rgba(225,6,0,0.12)" }}
                  >
                    <Shield className="h-6 w-6" style={{ color: "#E10600" }} strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">Sign &amp; Protect</h3>
                    <p className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>
                      Insert digital signatures and custom watermarks instantly.
                    </p>
                  </div>
                </div>
                <a
                  href="/dashboard/pdf"
                  className="shrink-0 rounded-lg border px-4 py-2 text-xs font-semibold transition-colors hover:bg-white/5"
                  style={{ borderColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)" }}
                >
                  Try it free →
                </a>
              </div>
            </Mv>
          </div>
        </FadeSection>
      </section>

      {/* ══ 4. EPUB EXPORT HIGHLIGHT ═══════════════════════════ */}
      <section style={{ backgroundColor: "#111111" }} className="px-6 py-24">
        <FadeSection className="mx-auto max-w-5xl">
          <Mv
            className="overflow-hidden rounded-3xl border p-10 md:p-16"
            style={{
              background: "linear-gradient(135deg, rgba(225,6,0,0.08) 0%, rgba(255,255,255,0.01) 100%)",
              borderColor: "rgba(225,6,0,0.25)",
            }}
          >
            <div className="flex flex-col gap-8 md:flex-row md:items-center">
              <div className="flex-1">
                <div
                  className="mb-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold"
                  style={{ background: "rgba(225,6,0,0.15)", color: "#E10600" }}
                >
                  <BookOpen className="h-4 w-4" strokeWidth={1.5} />
                  EPUB Export — Built for Writers
                </div>
                <h2 className="mb-4 text-3xl font-black tracking-tighter md:text-4xl">
                  <GradientHeadline>
                    Turn your document into<br />a published ebook.
                  </GradientHeadline>
                </h2>
                <p className="mb-6 text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>
                  Automatic chapter detection, clean file structure, and Kindle
                  compatibility. Export once and distribute anywhere.
                </p>
                <div className="flex flex-wrap gap-2">
                  {EPUB_AUDIENCES.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border px-4 py-1.5 text-xs font-medium"
                      style={{ borderColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.55)" }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Decorative EPUB card */}
              <div
                className="shrink-0 overflow-hidden rounded-2xl border md:w-64"
                style={{ borderColor: "rgba(225,6,0,0.2)", background: "rgba(255,255,255,0.02)" }}
              >
                <div
                  className="border-b px-4 py-3 text-xs font-semibold"
                  style={{ borderColor: "rgba(255,255,255,0.06)", color: "#E10600" }}
                >
                  📚 my-book.epub
                </div>
                {["Chapter 1: Introduction", "Chapter 2: Core Concepts", "Chapter 3: Advanced Topics", "Chapter 4: Conclusion"].map((ch, i) => (
                  <div
                    key={i}
                    className="border-b px-4 py-2.5 text-xs"
                    style={{
                      borderColor: "rgba(255,255,255,0.04)",
                      color: i === 0 ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.35)",
                      background: i === 0 ? "rgba(225,6,0,0.08)" : "transparent",
                    }}
                  >
                    {ch}
                  </div>
                ))}
                <div className="px-4 py-3">
                  <div
                    className="rounded-lg py-1.5 text-center text-xs font-semibold"
                    style={{ background: "rgba(225,6,0,0.6)", color: "#fff" }}
                  >
                    Export to EPUB →
                  </div>
                </div>
              </div>
            </div>
          </Mv>
        </FadeSection>
      </section>

      {/* ══ 5. PRICING ═════════════════════════════════════════ */}
      <section id="pricing" style={{ backgroundColor: "#0A0A0A" }} className="px-6 py-24">
        <FadeSection className="mx-auto max-w-4xl">
          <Mv className="mb-3 text-center text-xs font-semibold uppercase tracking-widest" style={{ color: "#E10600" }}>
            Pricing
          </Mv>
          <MvBlur className="mb-4 text-center text-3xl font-black tracking-tighter md:text-5xl">
            <GradientHeadline>Simple, transparent pricing.</GradientHeadline>
          </MvBlur>
          <Mv
            className="mx-auto mb-14 max-w-lg text-center text-sm"
            style={{ color: "rgba(255,255,255,0.4)" }}
          >
            Start free with no account. Upgrade when you need more.
          </Mv>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Free card */}
            <Mv className={glassCard} style={glassStyle}>
              <p className="mb-1 text-xs font-semibold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.4)" }}>
                🆓 Free Plan
              </p>
              <p className="mb-1 text-4xl font-black text-white">
                ₦0<span className="text-base font-normal" style={{ color: "rgba(255,255,255,0.35)" }}>/month</span>
              </p>
              <p className="mb-6 text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>No account needed · Limited by device</p>
              <ul className="mb-8 space-y-3">
                {FREE_FEATURES.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
                    <div className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: "rgba(255,255,255,0.3)" }} />
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href="/dashboard"
                className="block rounded-xl border py-3 text-center text-sm font-semibold transition-colors hover:bg-white/5"
                style={{ borderColor: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.6)" }}
              >
                Start for free
              </a>
            </Mv>

            {/* Pro card — glowing red border */}
            <Mv
              className={glassCard}
              style={{
                background: "rgba(225,6,0,0.05)",
                borderColor: "#E10600",
                boxShadow: "0 0 40px rgba(225,6,0,0.18), inset 0 1px 0 rgba(225,6,0,0.15)",
              }}
            >
              <div className="mb-1 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#E10600" }}>
                  🚀 Pro Plan
                </p>
                <span
                  className="flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold"
                  style={{ background: "rgba(225,6,0,0.2)", color: "#E10600" }}
                >
                  <Zap className="h-3 w-3" strokeWidth={1.5} />
                  Popular
                </span>
              </div>
              <div className="mb-1">
                <span className="text-4xl font-black text-white">₦900</span>
                <span className="text-base font-normal" style={{ color: "rgba(255,255,255,0.35)" }}>/month</span>
              </div>
              <p className="mb-6 text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>$1/month · International pricing</p>
              <ul className="mb-8 space-y-3">
                {PRO_FEATURES.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm" style={{ color: "rgba(255,255,255,0.8)" }}>
                    <CheckCircle2 className="h-4 w-4 shrink-0" style={{ color: "#E10600" }} strokeWidth={1.5} />
                    {f}
                  </li>
                ))}
              </ul>
              <motion.a
                href="/dashboard/upgrade"
                animate={{
                  boxShadow: [
                    "0 0 16px rgba(225,6,0,0.4)",
                    "0 0 32px rgba(225,6,0,0.7)",
                    "0 0 16px rgba(225,6,0,0.4)",
                  ],
                }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                className="flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white"
                style={{ backgroundColor: "#E10600" }}
              >
                <Zap className="h-4 w-4" strokeWidth={1.5} />
                Upgrade to Pro
              </motion.a>
            </Mv>
          </div>
        </FadeSection>
      </section>

      {/* ══ FINAL CTA BANNER ═══════════════════════════════════ */}
      <section
        className="px-6 py-20 text-center"
        style={{
          background: "linear-gradient(180deg, #0A0A0A 0%, #111111 100%)",
          borderTop: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <FadeSection className="mx-auto max-w-2xl">
          <MvBlur className="mb-4 text-3xl font-black tracking-tighter md:text-5xl">
            <GradientHeadline>Ready to get focused?</GradientHeadline>
          </MvBlur>
          <Mv className="mb-8 text-base" style={{ color: "rgba(255,255,255,0.4)" }}>
            Join professionals who use docfocal every day.
          </Mv>
          <Mv>
            <motion.a
              href="/dashboard"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 rounded-xl px-8 py-3.5 text-sm font-bold text-white"
              style={{ backgroundColor: "#E10600" }}
            >
              Start for Free
              <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
            </motion.a>
          </Mv>
        </FadeSection>
      </section>

      {/* ══ FOOTER ═════════════════════════════════════════════ */}
      <footer
        className="px-6 py-8"
        style={{ borderTop: "1px solid rgba(255,255,255,0.05)", backgroundColor: "#0A0A0A" }}
      >
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-sm font-bold text-white">
            doc<span style={{ color: "#E10600" }}>focal</span>
          </p>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>
            © {new Date().getFullYear()} docfocal. All rights reserved.
          </p>
          <div className="flex gap-6">
            {["Features", "Pricing"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-xs transition-colors hover:text-white"
                style={{ color: "rgba(255,255,255,0.3)" }}
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
