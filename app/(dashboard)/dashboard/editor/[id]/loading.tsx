export default function Loading() {
  return (
    <div className="-m-6 flex h-[calc(100vh-4rem)] flex-col">
      {/* Sub-header skeleton */}
      <div className="flex h-12 shrink-0 items-center gap-3 border-b border-border bg-bg-main px-5">
        <div className="h-4 w-24 animate-pulse rounded bg-bg-section" />
        <div className="flex-1" />
        <div className="h-4 w-12 animate-pulse rounded bg-bg-section" />
      </div>
      {/* Toolbar skeleton */}
      <div className="flex h-11 shrink-0 items-center gap-1 border-b border-border bg-bg-main px-3">
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="h-7 w-7 animate-pulse rounded bg-bg-section" />
        ))}
      </div>
      {/* Content skeleton */}
      <div className="flex-1 overflow-hidden bg-bg-section p-8">
        <div className="mx-auto max-w-3xl space-y-4">
          <div className="h-10 w-3/4 animate-pulse rounded-lg bg-bg-main" />
          <div className="mt-8 space-y-3">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-4 animate-pulse rounded bg-bg-main"
                style={{ width: `${75 + (i % 3) * 10}%` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
