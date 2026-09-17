import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMyV3Results } from "@/lib/db/v3-journey";
import Link from "next/link";
import { Avatar } from "@/components/shared/Avatar";

export default async function YouPage() {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/login");
  const [{ data: profile }, results] = await Promise.all([
    sb.from("profiles").select("username,display_name,avatar_url").eq("id", user.id).maybeSingle(),
    getMyV3Results(),
  ]);
  const name = profile?.display_name ?? "You";
  return <main className="py-10 sm:py-16">
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-4"><Avatar src={profile?.avatar_url ?? null} name={name} size={64}/><div><p className="text-xs font-black uppercase tracking-[.18em] text-[#ef6b35]">YOU</p><h1 className="mt-1 text-3xl font-black tracking-[-.04em]">{name}</h1><p className="text-sm text-[#777269]">Your journey is what you experienced.</p></div></div>
      <Link href="/profile/edit" className="rounded-full border border-[#ded8ce] bg-white/70 px-4 py-2 text-xs font-black">EDIT</Link>
    </div>
    <section className="mt-10"><p className="text-xs font-black uppercase tracking-[.18em] text-[#ef6b35]">YOUR JOURNEY</p><h2 className="mt-2 text-2xl font-black">Moments you actually lived.</h2>
      {results.length ? <div className="mt-6 space-y-3">{results.map((r:any)=><Link key={r.id} href={`/moment/${r.daily_moment_id}/reveal`} className="block rounded-[24px] border border-[#ded8ce] bg-white/70 p-5"><p className="text-xs font-bold text-[#777269]">{r.daily_moments?.moment_date}</p><p className="mt-2 font-black">{r.daily_moments?.prompt}</p><p className="mt-2 text-sm text-[#777269]">{r.result_type}{r.choice_value ? ` · ${r.choice_value}` : ""}</p></Link>)}</div> : <div className="mt-6 rounded-[26px] border border-dashed border-[#cfc7bb] p-8"><p className="font-black">Nothing here yet.</p><p className="mt-2 text-sm text-[#777269]">Today's question is your first chance to make one.</p><Link href="/" className="mt-5 inline-block rounded-2xl bg-[#171614] px-5 py-4 text-sm font-black text-white">GO TO MOMENT</Link></div>}
    </section>
  </main>;
}
