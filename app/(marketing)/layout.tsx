import MarketingHeader from "@/components/marketing/marketing-header";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: "#FFFFFF", color: "#111111" }}>
      <MarketingHeader />
      {children}
    </div>
  );
}
