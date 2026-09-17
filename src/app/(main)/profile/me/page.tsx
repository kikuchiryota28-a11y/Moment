import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMyV3Results } from "@/lib/db/v3-journey";
import Link from "next/link";
import { Avatar } from "@/components/shared/Avatar";

const glassCard = "rounded-[32px] border border-white/70 bg-white/35 shadow-[0_30px_70px_rgba(0,0,0,0.06),0_10px_20px_rgba(0,0,0,0.04),inset_0_1px_1px_rgba(255,255,255,0.9)] backdrop-blur-xl";

export default async function YouPage() {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/login");
  const [{ data: profile }, results] = await Promise.all([
    sb.from("profiles").select("username,display_name,avatar_url").eq("id", user.id).maybeSingle(),
    getMyV3Results(),
  ]);
  const name = profile?.display_name ?? "You";

  return (
    <main className="mx-auto max-w-5xl py-10 sm:py-16">
      <section className={`p-6 sm:p-8 ${glassCard}`}>
        <div className="flex items-center justify-between gap-5">
          <div className="flex min-w-0 items-center gap-4">
            <Avatar src={profile?.avatar_url ?? null} name={name} size={64} />
            <div className="min-w-0">
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#EF6B35]">YOU</p>
              <h1 className="mt-1 truncate text-3xl font-black tracking-[-0.04em] text-neutral-900">{name}</h1>
              <p className="mt-1 text-sm text-neutral-600">Your journey is what you experienced.</p>
            </div>
          </div>
          <Link href="/profile/edit" className="shrink-0 rounded-full border border-white/70 bg-white/45 px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.12em] text-neutral-900 shadow-sm backdrop-blur-xl transition-transform active:scale-[0.98]">EDIT</Link>
        </div>
      </section>

      <section className="mt-12">
        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#EF6B35]">YOUR JOURNEY</p>
        <h2 className="mt-3 text-[clamp(30px,4vw,46px)] font-black leading-none tracking-[-0.045em] text-neutral-900">Moments you actually lived.</h2>
        {results.length ? (
          <div className="mt-7 space-y-4">
            {results.map((r: any) => (
              <Link key={r.id} href={`/moment/${r.daily_moment_id}/reveal`} className={`group block p-6 transition-transform duration-300 hover:-translate-y-0.5 ${glassCard}`}>
                <div className="flex items-start justify-between gap-5">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-neutral-500">{r.daily_moments?.moment_date}</p>
                    <p className="mt-3 text-lg font-black tracking-[-0.02em] text-neutral-900">{r.daily_moments?.prompt}</p>
                    <p className="mt-2 text-sm text-neutral-600">{r.result_type}{r.choice_value ? ` · ${r.choice_value}` : ""}</p>
                  </div>
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/70 bg-white/45 text-neutral-700 shadow-sm transition-transform group-hover:translate-x-1">→</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className={`mt-7 p-10 ${glassCard}`}>
            <p className="text-xl font-black text-neutral-900">Nothing here yet.</p>
            <p className="mt-2 max-w-md text-sm leading-6 text-neutral-600">Today&apos;s question is your first chance to make one.</p>
            <Link href="/" className="mt-7 inline-flex h-14 items-center rounded-[18px] bg-neutral-900 px-6 text-[11px] font-black uppercase tracking-[0.14em] text-white shadow-lg transition-transform active:scale-[0.98]">GO TO MOMENT</Link>
          </div>
        )}
      </section>
    </main>
  );
}
