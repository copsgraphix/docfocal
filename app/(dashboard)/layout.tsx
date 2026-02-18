import Sidebar from "@/components/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        {/* Top header */}
        <header className="flex h-16 shrink-0 items-center border-b border-border bg-bg-main px-6">
          <h1 className="text-lg font-semibold text-text-primary">Dashboard</h1>
        </header>

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto bg-bg-section p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
