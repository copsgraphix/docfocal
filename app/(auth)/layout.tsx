export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-section">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <span className="text-2xl font-bold text-text-primary">
            doc<span className="text-brand-primary">focal</span>
          </span>
        </div>
        <div className="rounded-xl border border-border bg-bg-main p-8 shadow-sm">
          {children}
        </div>
      </div>
    </div>
  );
}
