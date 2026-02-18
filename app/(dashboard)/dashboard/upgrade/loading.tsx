export default function Loading() {
  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8 flex flex-col items-center gap-2">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-bg-section" />
        <div className="h-4 w-64 animate-pulse rounded-lg bg-bg-section" />
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="h-80 animate-pulse rounded-xl bg-bg-section" />
        <div className="h-80 animate-pulse rounded-xl border-2 border-brand-primary/20 bg-bg-section" />
      </div>
    </div>
  );
}
