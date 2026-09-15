import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CreateMomentForm } from "@/components/create/CreateMomentForm";

export default function CreatePage() {
  return <div className="py-5 sm:py-10"><Link href="/" className="mb-7 inline-flex items-center gap-2 text-sm font-bold"><ArrowLeft size={17}/> Back</Link><div className="mb-8"><p className="text-xs font-black uppercase tracking-[0.2em] text-[#ef6b35]">Share an experience</p><h1 className="mt-2 text-4xl font-black tracking-[-0.05em]">Create a Moment.</h1><p className="mt-3 text-sm leading-6 text-[#777269]">Only share things you actually experienced. That is the whole point.</p></div><CreateMomentForm/></div>;
}
