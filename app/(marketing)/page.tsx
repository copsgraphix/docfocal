export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-bg-main py-24">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <h1 className="text-5xl font-bold leading-tight tracking-tight text-text-primary md:text-6xl">
            Document tools that{" "}
            <span className="text-brand-primary">actually work</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-text-secondary">
            Create, edit, and transform documents with speed and precision.
            Built for professionals who need more than the basics.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <a
              href="/dashboard"
              className="rounded-lg bg-brand-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-hover"
            >
              Get Started Free
            </a>
            <a
              href="#features"
              className="rounded-lg border border-border px-6 py-3 text-sm font-semibold text-text-primary transition-colors hover:bg-bg-section"
            >
              See Features
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-bg-section py-24">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center text-3xl font-bold text-text-primary">
            Everything you need
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-center text-text-secondary">
            A complete suite of document tools in one focused app.
          </p>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {[
              {
                title: "Document Editor",
                description:
                  "Write and format documents with a clean, distraction-free editor. Export to PDF, DOCX, and more.",
              },
              {
                title: "PDF Toolkit",
                description:
                  "Merge, split, compress, and convert PDFs with ease. No file size limits.",
              },
              {
                title: "CV Creator",
                description:
                  "Build professional CVs and resumes with beautiful templates that get noticed.",
              },
            ].map(({ title, description }) => (
              <div
                key={title}
                className="rounded-xl border border-border bg-bg-main p-6 shadow-sm"
              >
                <div className="h-1 w-10 rounded-full bg-brand-primary" />
                <h3 className="mt-4 text-lg font-semibold text-text-primary">
                  {title}
                </h3>
                <p className="mt-2 text-sm text-text-secondary">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dark CTA */}
      <section className="bg-text-primary py-24">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <h2 className="text-4xl font-bold text-white">
            Ready to get focused?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-white/70">
            Join thousands of professionals who use docfocal every day.
          </p>
          <a
            href="/dashboard"
            className="mt-8 inline-block rounded-lg bg-brand-primary px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-hover"
          >
            Start for Free
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-bg-main py-8">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <p className="text-sm text-text-secondary">
            © {new Date().getFullYear()} docfocal. All rights reserved.
          </p>
        </div>
      </footer>
    </>
  );
}
