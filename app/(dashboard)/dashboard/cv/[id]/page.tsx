import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CVEditor from "@/components/cv/cv-editor";

export default async function CVPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: cv } = await supabase
    .from("cvs")
    .select("*")
    .eq("id", id)
    .single();

  if (!cv) notFound();

  return <CVEditor cv={cv} />;
}
