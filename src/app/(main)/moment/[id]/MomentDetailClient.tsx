"use client";

import { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { StartMomentButton } from "@/components/v3/StartMomentButton";
import { ResultComposer } from "@/components/v3/ResultComposer";
import { Card } from "@/components/ui/Surface";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useCanvas3D } from "@/components/layout/CanvasProvider";

type MomentPhase = "enter" | "action" | "result" | "branch";

interface MomentData {
  id: string;
  prompt: string;
  participantCount: number;
  status: string;
  myResultId: string | null;
}

function getPhase(moment: { status: string; myResultId: string | null }): MomentPhase {
  if (moment.myResultId) return "result";
  if (["FIRST_MOVER", "LIVE", "ENDING"].includes(moment.status)) return "action";
  return "enter";
}

interface MomentDetailClientProps {
  initialMoment: MomentData;
  initialResults: any[];
  initialPhase: MomentPhase;
}

export function MomentDetailPageClient({ initialMoment, initialResults, initialPhase }: MomentDetailClientProps) {
  const { setPhase, setMomentData, setIntensity } = useCanvas3D();
  const [moment, setMoment] = useState<MomentData>(initialMoment);
  const [results] = useState<any[]>(initialResults);
  const [phase] = useState<MomentPhase>(initialPhase);

  useEffect(() => {
    setPhase(phase);
    setMomentData({
      id: moment.id,
      prompt: moment.prompt,
      participantCount: moment.participantCount,
      status: moment.status,
      myResultId: moment.myResultId,
    });
    setIntensity(phase === "enter" || phase === "action" ? 1 : 0.15);
  }, [moment, phase, setPhase, setMomentData, setIntensity]);

  return (
    <main className="relative min-h-[100dvh]">
      <div className="relative z-10 mx-auto max-w-[1440px] px-6 py-12 lg:px-12 lg:py-20">
        <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-ink)] hover:text-[var(--color-accent)] transition-colors">
          ← MOMENT
        </Link>

        <section className="max-w-3xl">
          <Badge variant="accent" className="mb-4">Today's Moment</Badge>
          <h1 className="text-[clamp(2.5rem,5vw,4.5rem)] font-medium leading-tight tracking-[-0.04em] font-[var(--font-display)] text-[var(--color-ink)]">
            {moment.prompt}
          </h1>
          <p className="mt-5 text-base text-[var(--color-muted-ink)]">
            {moment.participantCount.toLocaleString()} people are in this Moment.
          </p>

          {phase === "enter" && (
            <div className="mt-10 max-w-xl">
              <StartMomentButton id={moment.id} />
            </div>
          )}

          {phase === "action" && (
            <div className="mt-10">
              <ResultComposer dailyMomentId={moment.id} />
            </div>
          )}

          {phase === "result" && (
            <Card variant="default" className="mt-10 max-w-xl p-6">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[var(--color-accent)] mb-4">
                YOU MADE A MOMENT.
              </p>
              <Link href={`/moment/${moment.id}/reveal`}>
                <Button fullWidth size="lg">
                  SEE WHAT THE WORLD FOUND
                </Button>
              </Link>
            </Card>
          )}

          {results.length > 0 && (
            <Link href={`/moment/${moment.id}/reveal`} className="mt-6 block text-center text-sm font-semibold underline underline-offset-2 text-[var(--color-muted-ink)] hover:text-[var(--color-accent)]">
              WORLD REVEAL →
            </Link>
          )}
        </section>
      </div>
    </main>
  );
}