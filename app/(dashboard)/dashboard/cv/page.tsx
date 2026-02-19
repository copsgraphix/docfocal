import Link from "next/link";
import { FileText, Plus, Search, Trash2, X, Zap } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createCV, deleteCV } from "@/app/actions/cvs";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function CVListPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; q?: string }>;
}) {
  const { error, q } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("cvs")
    .select("id, title, updated_at")
    .order("updated_at", { ascending: false });

  if (q?.trim()) {
    query = query.ilike("title", `%${q.trim()}%`);
  }

  const { data: cvs } = await query;

  return (
    <div>
      {error === "limit" && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4">
          <Zap className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
          <div className="flex-1 text-sm">
            <p className="font-semibold text-amber-800">Free plan limit reached</p>
            <p className="mt-0.5 text-amber-700">
              You&apos;ve used all 5 free CVs.{" "}
              <Link href="/dashboard/upgrade" className="font-semibold underline">
                Upgrade to Pro
              </Link>{" "}
              for unlimited CVs.
            </p>
          </div>
        </div>
      )}

      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">CV Creator</h2>
          <p className="mt-1 text-text-secondary">
            {cvs?.length ?? 0} CV{cvs?.length !== 1 ? "s" : ""}
            {q?.trim() ? ` matching "${q.trim()}"` : ""}
          </p>
        </div>
        <form action={createCV}>
          <button
            type="submit"
            className="flex items-center gap-2 rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            New CV
          </button>
        </form>
      </div>

      {/* Search */}
      <form method="GET" className="mb-5 flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary/50" />
          <input
            name="q"
            type="search"
            defaultValue={q ?? ""}
            placeholder="Search CVs…"
            className="w-full rounded-lg border border-border bg-bg-section py-2 pl-9 pr-3 text-sm text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:ring-2 focus:ring-brand-primary"
          />
        </div>
        {q?.trim() && (
          <Link
            href="/dashboard/cv"
            className="flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-xs text-text-secondary transition-colors hover:bg-bg-section"
          >
            <X className="h-3.5 w-3.5" />
            Clear
          </Link>
        )}
      </form>

      {!cvs?.length ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center">
          <FileText className="mb-4 h-10 w-10 text-text-secondary/40" />
          {q?.trim() ? (
            <>
              <p className="font-medium text-text-primary">No results found</p>
              <p className="mt-1 text-sm text-text-secondary">
                Try a different search term.
              </p>
            </>
          ) : (
            <>
              <p className="font-medium text-text-primary">No CVs yet</p>
              <p className="mt-1 text-sm text-text-secondary">
                Create your first CV to get started.
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {cvs.map((cv) => (
            <div
              key={cv.id}
              className="flex items-center gap-4 rounded-xl border border-border bg-bg-main px-5 py-4 shadow-sm transition-shadow hover:shadow-md"
            >
              <FileText className="h-4 w-4 shrink-0 text-brand-primary" />
              <Link
                href={`/dashboard/cv/${cv.id}`}
                className="flex-1 truncate text-sm font-medium text-text-primary hover:text-brand-primary"
              >
                {cv.title}
              </Link>
              <span className="shrink-0 text-xs text-text-secondary">
                {formatDate(cv.updated_at)}
              </span>
              <form action={deleteCV}>
                <input type="hidden" name="id" value={cv.id} />
                <button
                  type="submit"
                  className="rounded p-1 text-text-secondary transition-colors hover:bg-red-50 hover:text-red-600"
                  title="Delete CV"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
