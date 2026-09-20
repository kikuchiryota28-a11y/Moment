import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CreateMomentForm } from "@/components/create/CreateMomentForm";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export default function CreatePage() {
  return (
    <div className="mx-auto max-w-[1440px] px-6 py-12 lg:px-12 lg:py-16">
      <Link href="/" className="mb-7 inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-ink)] hover:text-[var(--color-accent)] transition-colors">
        <ArrowLeft size={17} /> Back
      </Link>
      <div className="mb-8">
        <Badge variant="accent" className="mb-2">Share an experience</Badge>
        <h1 className="text-[clamp(2.5rem,5vw,4.5rem)] font-medium leading-[0.9] tracking-[-0.04em] font-[var(--font-display)] text-[var(--color-ink)]">
          Create a Moment.
        </h1>
        <p className="mt-3 text-sm leading-6 text-[var(--color-muted-ink)]">
          Only share things you actually experienced. That is the whole point.
        </p>
      </div>
      <CreateMomentForm />
    </div>
  );
}