import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getResults } from "@/lib/db/v3";
import { ResultSafetyMenu } from "@/components/v3/ResultSafetyMenu";
import { MotionCard } from "@/components/v3/MotionSystem";
import { WorldRevealMotion } from "@/components/v3/WorldRevealMotion";

const labels = ["YOU", "SOMEONE ELSE", "ANOTHER ANSWER", "ANOTHER ONE", "THE WORLD"];

export default async function RevealPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  const { data: moment } = await sb.from("daily_moments").select("id,prompt,status").eq("id", id).maybeSingle();
  if (!moment) notFound();
  const results = await getResults(id, user?.id);

  return (
    <WorldRevealMotion prompt={moment.prompt} empty={!results.length}>
      <div className="space-y-5">
        {results.map((r, i) => (
          <MotionCard key={r.id} className="overflow-hidden rounded-[30px] border border-[var(--line)] bg-white/55 dark:bg-white/[0.04]" interactive>
            <article className="p-5 sm:p-7">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[var(--accent)]">{labels[Math.min(i, labels.length - 1)]}</p>
                  <p className="mt-2 text-sm font-bold">{r.author?.displayName ?? "Someone"}{r.countryCode ? ` · ${r.countryCode}` : ""}</p>
                </div>
                <ResultSafetyMenu resultId={r.id} userId={r.userId} />
              </div>
              {r.mediaUrl && <div className="relative mt-5 aspect-[4/3] overflow-hidden rounded-[22px]"><Image src={r.mediaUrl} alt="A Moment result" fill sizes="(max-width:768px) 100vw, 768px" className="object-cover transition-transform duration-700 hover:scale-[1.02]" /></div>}
              {r.choiceValue && <p className="mt-5 text-3xl font-black tracking-[-0.05em]">{r.choiceValue}</p>}
              {r.textContent && <p className="mt-5 whitespace-pre-wrap text-base leading-7">{r.textContent}</p>}
              {r.why && <p className="mt-4 text-sm leading-6 text-[var(--muted)]">{r.why}</p>}
            </article>
          </MotionCard>
        ))}
      </div>
    </WorldRevealMotion>
  );
}
