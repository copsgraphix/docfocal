import type { Metadata } from "next";
import LandingPage from "@/components/marketing/landing-page";
import { getCurrencyConfig } from "@/lib/geo";

export const metadata: Metadata = {
  title: "docfocal — Create, Edit, Convert, Publish",
  description:
    "Your complete document workspace. Write documents, edit PDFs, convert files, and export to EPUB — all in one place. No login required to start.",
};

export default async function HomePage() {
  const currency = await getCurrencyConfig();
  return <LandingPage currency={currency} />;
}
