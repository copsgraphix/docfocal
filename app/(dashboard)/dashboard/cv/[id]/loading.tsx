export default function Loading() {
  return (
    <div className="-m-6 flex h-[calc(100vh-4rem)] flex-col">
      {/* Sub-header skeleton */}
      <div className="flex h-12 shrink-0 items-center gap-3 border-b border-border bg-bg-main px-5">
        <div className="h-4 w-16 animate-pulse rounded bg-bg-section" />
        <div className="flex-1" />
        <div className="h-4 w-12 animate-pulse rounded bg-bg-section" />
        <div className="h-7 w-28 animate-pulse rounded-lg bg-bg-section" />
      </div>
      {/* Body skeleton */}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <div className="w-80 shrink-0 space-y-4 border-r border-border bg-bg-section p-5">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 animate-pulse rounded-lg bg-bg-main" />
          ))}
        </div>
        <div className="flex-1 bg-gray-100 p-8">
          <div className="mx-auto max-w-[800px] animate-pulse rounded-lg bg-white shadow-md" style={{ height: 600 }} />
        </div>
      </div>
    </div>
  );
}
