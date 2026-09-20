import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getResults, getTomorrowMoment } from "@/lib/db/v3";
import { ResultSafetyMenu } from "@/components/v3/ResultSafetyMenu";
import { MomentPhysicsScene } from "@/components/v3/MomentPhysicsScene";

const labels = ["YOUR BRANCH", "SIMILAR", "SHIFT", "DIFFERENT", "UNEXPECTED"];

export default async function RevealPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();

  const { data: moment } = await sb.from("daily_moments").select("id,prompt,status,moment_date").eq("id", id).maybeSingle();
  if (!moment) notFound();

  const allResults = await getResults(id);
  const myResult = user ? allResults.find(r => r.userId === user.id) : null;
  const otherResults = allResults.filter(r => r.userId !== user?.id);
  const tomorrowMoment = await getTomorrowMoment();

  const branchLabels = ["SIMILAR", "SHIFT", "DIFFERENT", "UNEXPECTED"];
  const selectedOthers = selectReveal(otherResults);

  return (
    <main className="relative isolate min-h-[100vh] py-6 sm:py-10">
      <MomentPhysicsScene
        moment={{
          id: moment.id,
          prompt: moment.prompt,
          participantCount: allResults.length,
          status: moment.status,
          myResultId: myResult?.id ?? null,
        }}
        phase="branch"
      />

      <div className="relative z-10 max-w-4xl mx-auto px-5">
        <Link href="/" className="text-sm font-bold">← MOMENT</Link>

        <header className="mt-8">
          <p className="text-xs font-black uppercase tracking-[.2em] text-[#ef6b35]">WORLD REVEAL</p>
          <h1 className="mt-2 text-4xl font-black tracking-[-.05em] sm:text-6xl">Same question.<br/>Different reality.</h1>
          <p className="mt-4 max-w-xl text-[#777269]">{moment.prompt}</p>
        </header>

        {myResult && (
          <section className="mt-10" aria-labelledby="branch-heading">
            <h2 id="branch-heading" className="text-xs font-black uppercase tracking-[.18em] text-[#ef6b35]">YOUR BRANCH</h2>
            <p className="mt-2 text-sm text-[#777269]">This is the reality you created. It shapes what comes next.</p>
            <article className="mt-6 overflow-hidden rounded-[28px] border-2 border-[#ef6b35]/40 bg-white/80 shadow-lg">
              <div className="p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[.16em] text-[#ef6b35]">YOUR ACTION</p>
                    <p className="mt-2 text-sm font-bold">You{myResult.countryCode ? ` · ${myResult.countryCode}` : ""}</p>
                  </div>
                </div>
                {myResult.mediaUrl && (
                  <div className="relative mt-4 aspect-[4/3] overflow-hidden rounded-2xl">
                    <Image src={myResult.mediaUrl} alt="Your Moment action" fill sizes="(max-width:768px) 100vw, 768px" className="object-cover" />
                  </div>
                )}
                {myResult.choiceValue && <p className="mt-4 text-2xl font-black">{myResult.choiceValue}</p>}
                {myResult.textContent && <p className="mt-4 whitespace-pre-wrap text-base leading-7">{myResult.textContent}</p>}
                {myResult.why && <p className="mt-3 text-sm leading-6 text-[#777269]">“{myResult.why}”</p>}
              </div>
            </article>
          </section>
        )}

        <section className="mt-10" aria-labelledby="world-heading">
          <h2 id="world-heading" className="text-xs font-black uppercase tracking-[.18em] text-[#ef6b35]">THE WORLD</h2>
          <p className="mt-2 text-sm text-[#777269]">Others who entered this Moment. Each one a different branch.</p>
          <div className="mt-6 space-y-5">
            {selectedOthers.length ? selectedOthers.map((r, i) => (
              <article key={r.id} className="overflow-hidden rounded-[28px] border border-[#ded8ce] bg-white/70">
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-[.16em] text-[#777269]">{branchLabels[i]}</p>
                      <p className="mt-2 text-sm font-bold">{r.author?.displayName ?? "Someone"}{r.countryCode ? ` · ${r.countryCode}` : ""}</p>
                    </div>
                    <ResultSafetyMenu resultId={r.id} userId={r.userId} />
                  </div>
                  {r.mediaUrl && (
                    <div className="relative mt-4 aspect-[4/3] overflow-hidden rounded-2xl">
                      <Image src={r.mediaUrl} alt="A Moment result" fill sizes="(max-width:768px) 100vw, 768px" className="object-cover" />
                    </div>
                  )}
                  {r.choiceValue && <p className="mt-4 text-2xl font-black">{r.choiceValue}</p>}
                  {r.textContent && <p className="mt-4 whitespace-pre-wrap text-base leading-7">{r.textContent}</p>}
                  {r.why && <p className="mt-3 text-sm leading-6 text-[#777269]">“{r.why}”</p>}
                </div>
              </article>
            )) : (
              <div className="rounded-[28px] border border-dashed border-[#cfc7bb] p-8">
                <p className="font-black">The world is still forming.</p>
                <p className="mt-2 text-sm text-[#777269]">Come back after more people have entered this Moment.</p>
              </div>
            )}
          </div>
        </section>

        <section className="mt-10" aria-labelledby="next-heading">
          <h2 id="next-heading" className="text-xs font-black uppercase tracking-[.18em] text-[#ef6b35]">WHAT&apos;S NEXT</h2>
          {tomorrowMoment ? (
            <Link href={`/moment/${tomorrowMoment.id}`} className="mt-4 block rounded-[28px] bg-[#171614] p-6 text-white hover:bg-[#171614]/90 transition">
              <p className="text-xs font-black uppercase tracking-[.18em] text-white/60">TOMORROW</p>
              <p className="mt-2 text-2xl font-black">YOUR BRANCH REACHES FORWARD.</p>
              <p className="mt-2 text-sm text-white/65">The action you took today ripples into the next Moment.</p>
              <div className="mt-4 pt-4 border-t border-white/15">
                <p className="text-xs font-black uppercase tracking-[.1em] text-white/50">Tomorrow's prompt</p>
                <p className="mt-2 text-base font-bold leading-6">{tomorrowMoment.prompt}</p>
              </div>
            </Link>
          ) : (
            <div className="mt-4 rounded-[28px] bg-[#171614] p-6 text-white">
              <p className="text-xs font-black uppercase tracking-[.18em] text-white/60">TOMORROW</p>
              <p className="mt-2 text-2xl font-black">YOUR BRANCH REACHES FORWARD.</p>
              <p className="mt-2 text-sm text-white/65">The action you took today ripples into the next Moment.</p>
              <Link href="/" className="mt-6 inline-block rounded-2xl bg-white/15 px-5 py-3 text-sm font-black text-white hover:bg-white/25 transition">
                CONTINUE TO TOMORROW
              </Link>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function selectReveal(rows: any[]) {
  const picked: any[] = [];
  const usedTypes = new Set<string>();
  const usedCountries = new Set<string>();
  const take = (p: (r: any) => boolean) => {
    const i = rows.findIndex(r => !picked.includes(r) && p(r));
    if (i >= 0) {
      const row = rows[i];
      picked.push(row);
      usedTypes.add(row.resultType);
      const country = row.countryCode ?? "";
      if (country.length > 0) usedCountries.add(country);
    }
  };
  take(r => r.resultType === "choice");
  take(r => !usedTypes.has(r.resultType));
  take(r => { const country = r.countryCode; return typeof country === "string" && country.length > 0 && !usedCountries.has(country); });
  take(r => r.resultType === "photo" || r.resultType === "video");
  take(r => r.resultType === "text" || r.resultType === "combination");
  for (const r of rows) {
    if (picked.length >= 4) break;
    if (!picked.includes(r)) picked.push(r);
  }
  return picked.slice(0, 4);
}
