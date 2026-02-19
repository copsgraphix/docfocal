import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { PHProvider } from "@/components/posthog-provider";

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
    "Create, edit, and transform documents with speed and precision. Document editor, CV creator, and PDF toolkit in one focused app.",
  openGraph: {
    siteName: "docfocal",
    type: "website",
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
        <PHProvider>{children}</PHProvider>
      </body>
    </html>
  );
}
