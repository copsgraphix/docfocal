import Sidebar from "@/components/sidebar";
import PageHeader from "@/components/dashboard/page-header";
import { SidebarProvider } from "@/components/dashboard/sidebar-context";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims ?? null;

  const email = claims?.email ?? "";
  const displayName =
    (claims?.user_metadata?.full_name as string) ??
    email.split("@")[0] ??
    "User";


  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden">
        <Sidebar user={{ name: displayName, email }} />
        <div className="flex min-w-0 flex-1 flex-col">
          <PageHeader />
          <main className="flex-1 overflow-y-auto bg-bg-section p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
