import type { Metadata } from "next";
import LandingPage from "@/components/marketing/landing-page";

export const metadata: Metadata = {
  title: "docfocal — Create, Edit, Convert, Publish",
  description:
    "Your complete document workspace. Write documents, edit PDFs, convert files, and export to EPUB — all in one place. No login required to start.",
};

export default function HomePage() {
  return <LandingPage />;
}
