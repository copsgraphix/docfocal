import Link from "next/link";
import { FileText, Plus, Trash2, Zap } from "lucide-react";
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
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const supabase = await createClient();
  const { data: cvs } = await supabase
    .from("cvs")
    .select("id, title, updated_at")
    .order("updated_at", { ascending: false });

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

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">CV Creator</h2>
          <p className="mt-1 text-text-secondary">
            {cvs?.length ?? 0} CV{cvs?.length !== 1 ? "s" : ""}
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

      {!cvs?.length ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center">
          <FileText className="mb-4 h-10 w-10 text-text-secondary/40" />
          <p className="font-medium text-text-primary">No CVs yet</p>
          <p className="mt-1 text-sm text-text-secondary">
            Create your first CV to get started.
          </p>
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
