import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getMomentEditor } from "@/lib/db/moments";
import { MomentForm } from "@/components/moments/MomentForm";

export default async function EditMomentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getMomentEditor(id);
  if (!data) notFound();
  return <div className="py-5 sm:py-10">
    <Link href={`/moment/${id}`} className="mb-7 inline-flex items-center gap-2 text-sm font-bold"><ArrowLeft size={17}/> Back to Moment</Link>
    <div className="mb-8"><p className="text-xs font-black uppercase tracking-[0.2em] text-[#ef6b35]">Improve your experience entry</p><h1 className="mt-2 text-4xl font-black tracking-[-0.05em]">Edit Moment.</h1><p className="mt-3 text-sm leading-6 text-[#777269]">Add the details that make this experience more useful to the next person.</p></div>
    <MomentForm mode="edit" moment={data.moment} media={data.media}/>
  </div>;
}
