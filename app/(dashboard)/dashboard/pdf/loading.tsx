export default function Loading() {
  return (
    <div>
      <div className="mb-6 space-y-2">
        <div className="h-8 w-36 animate-pulse rounded-lg bg-bg-section" />
        <div className="h-4 w-80 animate-pulse rounded-lg bg-bg-section" />
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="h-80 animate-pulse rounded-xl bg-bg-section" />
        <div className="h-80 animate-pulse rounded-xl bg-bg-section" />
      </div>
    </div>
  );
}
