export default function Loading() {
  return (
    <div>
      <div className="mb-8 space-y-2">
        <div className="h-8 w-44 animate-pulse rounded-lg bg-bg-section" />
        <div className="h-4 w-52 animate-pulse rounded-lg bg-bg-section" />
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-36 animate-pulse rounded-xl bg-bg-section" />
        ))}
      </div>
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl bg-bg-section" />
        ))}
      </div>
    </div>
  );
}
