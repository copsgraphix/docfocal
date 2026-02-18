import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import TiptapEditor from "@/components/editor/tiptap-editor";

export default async function EditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: document } = await supabase
    .from("documents")
    .select("*")
    .eq("id", id)
    .single();

  if (!document) notFound();

  return <TiptapEditor document={document} />;
}
