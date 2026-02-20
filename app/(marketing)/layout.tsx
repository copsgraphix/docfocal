import Script from "next/script";
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
      <Script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6561075503765256"
        crossOrigin="anonymous"
        strategy="afterInteractive"
      />
    </div>
  );
}
