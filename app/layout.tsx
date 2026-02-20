import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "docfocal — Document Tools That Work",
    template: "%s | docfocal",
  },
  description:
    "Create, edit, and transform documents with speed and precision. Document editor, CV creator, PDF editor, and full PDF toolkit in one focused app.",
  metadataBase: new URL("https://docfocal.com"),
  openGraph: {
    siteName: "docfocal",
    type: "website",
    title: "docfocal — Document Tools That Work",
    description:
      "Write documents, edit PDFs, build CVs, and convert files — all in one browser-based workspace.",
    url: "https://docfocal.com",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "docfocal — Document Tools That Work",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "docfocal — Document Tools That Work",
    description:
      "Write documents, edit PDFs, build CVs, and convert files — all in one browser-based workspace.",
    images: ["/og-image.png"],
  },
  other: {
    "google-adsense-account": "ca-pub-6561075503765256",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        {children}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6561075503765256"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
