"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/Surface";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/shared/Avatar";
import { useCanvas3D } from "@/components/layout/CanvasProvider";

const branchLabels = ["SIMILAR", "SHIFT", "DIFFERENT", "UNEXPECTED"];

interface RevealPageClientProps {
  moment: any;
  allResults: any[];
  myResult: any;
  selectedOthers: any[];
  tomorrowMoment: any;
}

export function RevealPageClient({ moment, allResults, myResult, selectedOthers, tomorrowMoment }: RevealPageClientProps) {
  const { setPhase, setMomentData, setIntensity } = useCanvas3D();

  useEffect(() => {
    setPhase("branch");
    setMomentData({
      id: moment.id,
      prompt: moment.prompt,
      participantCount: allResults.length,
      status: moment.status,
      myResultId: myResult?.id ?? null,
    });
    setIntensity(0.15);
  }, [moment, allResults.length, myResult, setPhase, setMomentData, setIntensity]);

  return (
    <main className="relative min-h-[100dvh]">
      <div className="relative z-10 mx-auto max-w-[1440px] px-6 py-12 lg:px-12 lg:py-20">
        <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-ink)] hover:text-[var(--color-accent)] transition-colors">
          ← MOMENT
        </Link>

        <header className="mb-12">
          <Badge variant="accent" className="mb-4">WORLD REVEAL</Badge>
          <h1 className="text-[clamp(2.5rem,5vw,4.5rem)] font-medium leading-[0.9] tracking-[-0.04em] font-[var(--font-display)] text-[var(--color-ink)]">
            Same question.<br />Different reality.
          </h1>
          <p className="mt-4 max-w-xl text-[var(--color-muted-ink)]">{moment.prompt}</p>
        </header>

        {myResult && (
          <section className="mb-12" aria-labelledby="branch-heading">
            <h2 id="branch-heading" className="text-[11px] font-black uppercase tracking-[0.18em] text-[var(--color-accent)] mb-2">
              YOUR BRANCH
            </h2>
            <p className="text-sm text-[var(--color-muted-ink)] mb-6">This is the reality you created. It shapes what comes next.</p>
            <Card variant="default" className="p-6">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[var(--color-accent)]">YOUR ACTION</p>
                  <p className="mt-2 text-sm font-semibold text-[var(--color-ink)]">
                    You{myResult.countryCode ? ` · ${myResult.countryCode}` : ""}
                  </p>
                </div>
                <Avatar src={myResult.author?.avatarUrl ?? null} name={myResult.author?.displayName ?? "You"} size={40} />
              </div>
              {myResult.mediaUrl && (
                <div className="relative aspect-[4/3] overflow-hidden rounded-[16px] mb-4">
                  <Image src={myResult.mediaUrl} alt="Your Moment action" fill sizes="(max-width:768px) 100vw, 768px" className="object-cover" />
                </div>
              )}
              {myResult.choiceValue && <p className="text-2xl font-semibold text-[var(--color-ink)] mb-2">{myResult.choiceValue}</p>}
              {myResult.textContent && <p className="whitespace-pre-wrap text-base leading-7 text-[var(--color-ink)] mb-2">{myResult.textContent}</p>}
              {myResult.why && <p className="text-sm leading-6 text-[var(--color-muted-ink)]">"{myResult.why}"</p>}
            </Card>
          </section>
        )}

        <section className="mb-12" aria-labelledby="world-heading">
          <h2 id="world-heading" className="text-[11px] font-black uppercase tracking-[0.18em] text-[var(--color-accent)] mb-2">
            THE WORLD
          </h2>
          <p className="text-sm text-[var(--color-muted-ink)] mb-6">Others who entered this Moment. Each one a different branch.</p>
          <div className="space-y-5">
            {selectedOthers.length ? selectedOthers.map((r, i) => (
              <Card key={r.id} variant="default" className="p-5">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <Badge variant="outline" className="mb-2">{branchLabels[i]}</Badge>
                    <p className="text-sm font-semibold text-[var(--color-ink)]">
                      {r.author?.displayName ?? "Someone"}{r.countryCode ? ` · ${r.countryCode}` : ""}
                    </p>
                  </div>
                </div>
                {r.mediaUrl && (
                  <div className="relative aspect-[4/3] overflow-hidden rounded-[16px] mb-4">
                    <Image src={r.mediaUrl} alt="A Moment result" fill sizes="(max-width:768px) 100vw, 768px" className="object-cover" />
                  </div>
                )}
                {r.choiceValue && <p className="text-2xl font-semibold text-[var(--color-ink)] mb-2">{r.choiceValue}</p>}
                {r.textContent && <p className="whitespace-pre-wrap text-base leading-7 text-[var(--color-ink)] mb-2">{r.textContent}</p>}
                {r.why && <p className="text-sm leading-6 text-[var(--color-muted-ink)]">"{r.why}"</p>}
              </Card>
            )) : (
              <Card variant="outlined" className="p-8 text-center">
                <p className="font-semibold text-[var(--color-ink)]">The world is still forming.</p>
                <p className="mt-2 text-sm text-[var(--color-muted-ink)]">Come back after more people have entered this Moment.</p>
              </Card>
            )}
          </div>
        </section>

        <section aria-labelledby="next-heading">
          <h2 id="next-heading" className="text-[11px] font-black uppercase tracking-[0.18em] text-[var(--color-accent)] mb-4">
            WHAT'S NEXT
          </h2>
          {tomorrowMoment ? (
            <Link href={`/moment/${tomorrowMoment.id}`}>
              <Card variant="default" className="p-6 bg-[var(--color-ink)] text-[var(--color-overlay)]">
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[var(--color-overlay)]/60 mb-2">TOMORROW</p>
                <p className="text-2xl font-semibold mb-2">YOUR BRANCH REACHES FORWARD.</p>
                <p className="text-sm text-[var(--color-overlay)]/65 mb-4">The action you took today ripples into the next Moment.</p>
                <div className="pt-4 border-t border-white/15">
                  <p className="text-[11px] font-black uppercase tracking-[0.1em] text-[var(--color-overlay)]/50 mb-2">Tomorrow's prompt</p>
                  <p className="text-base font-semibold leading-6">{tomorrowMoment.prompt}</p>
                </div>
              </Card>
            </Link>
          ) : (
            <Card variant="default" className="p-6 bg-[var(--color-ink)] text-[var(--color-overlay)]">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[var(--color-overlay)]/60 mb-2">TOMORROW</p>
              <p className="text-2xl font-semibold mb-2">YOUR BRANCH REACHES FORWARD.</p>
              <p className="text-sm text-[var(--color-overlay)]/65 mb-6">The action you took today ripples into the next Moment.</p>
              <Link href="/">
                <Button variant="ghost" size="md">
                  CONTINUE TO TOMORROW
                </Button>
              </Link>
            </Card>
          )}
        </section>
      </div>
    </main>
  );
}