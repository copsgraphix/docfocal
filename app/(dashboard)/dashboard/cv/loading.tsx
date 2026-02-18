export default function Loading() {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-36 animate-pulse rounded-lg bg-bg-section" />
          <div className="h-4 w-16 animate-pulse rounded-lg bg-bg-section" />
        </div>
        <div className="h-9 w-28 animate-pulse rounded-lg bg-bg-section" />
      </div>
      <div className="space-y-2">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-14 animate-pulse rounded-xl bg-bg-section" />
        ))}
      </div>
    </div>
  );
}
