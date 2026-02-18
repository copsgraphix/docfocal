export default function Loading() {
  return (
    <div className="mx-auto max-w-xl space-y-8">
      <div className="space-y-2">
        <div className="h-8 w-28 animate-pulse rounded-lg bg-bg-section" />
        <div className="h-4 w-48 animate-pulse rounded-lg bg-bg-section" />
      </div>
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-40 animate-pulse rounded-xl bg-bg-section" />
      ))}
    </div>
  );
}
