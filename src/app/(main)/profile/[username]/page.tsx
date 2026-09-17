import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/db/profiles";
import { Avatar } from "@/components/shared/Avatar";
import { getMyV3Results } from "@/lib/db/v3-journey";

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  let { username } = await params;
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) notFound();
  if (username === "me") {
    const { data: own } = await sb.from("profiles").select("username").eq("id", user.id).maybeSingle();
    username = own?.username ?? "";
  }
  const data = await getProfile(username);
  if (!data) notFound();
  const { profile } = data;
  const isOwn = profile.id === user.id;
  const ownResults = isOwn ? await getMyV3Results() : [];
  return <main className="py-10 sm:py-16">
    <div className="flex items-center justify-between gap-4"><div className="flex items-center gap-4"><Avatar src={profile.avatarUrl} name={profile.displayName} size={68}/><div><p className="text-xs font-black uppercase tracking-[.18em] text-[#ef6b35]">{isOwn ? "YOU" : "EXPERIENCE"}</p><h1 className="mt-1 text-3xl font-black tracking-[-.04em]">{profile.displayName}</h1><p className="text-sm text-[#777269]">@{profile.username}</p></div></div>{isOwn && <Link href="/profile/edit" className="rounded-full border border-[#ded8ce] bg-white/70 px-4 py-2 text-xs font-black">EDIT</Link>}</div>
    <section className="mt-10"><p className="text-xs font-black uppercase tracking-[.18em] text-[#ef6b35]">{isOwn ? "YOUR JOURNEY" : "THEIR JOURNEY"}</p><h2 className="mt-2 text-2xl font-black">{isOwn ? "Moments you actually lived." : "What this person experienced."}</h2>
      {isOwn ? (ownResults.length ? <div className="mt-6 space-y-3">{ownResults.map((r:any)=><Link key={r.id} href={`/moment/${r.daily_moment_id}/reveal`} className="block rounded-[24px] border border-[#ded8ce] bg-white/70 p-5"><p className="text-xs font-bold text-[#777269]">{r.daily_moments?.moment_date}</p><p className="mt-2 font-black">{r.daily_moments?.prompt}</p><p className="mt-2 text-sm text-[#777269]">{r.result_type}{r.choice_value ? ` · ${r.choice_value}` : ""}</p></Link>)}</div> : <div className="mt-6 rounded-[26px] border border-dashed border-[#cfc7bb] p-8"><p className="font-black">Your first Moment is waiting.</p><Link href="/" className="mt-5 inline-block rounded-2xl bg-[#171614] px-5 py-4 text-sm font-black text-white">GO TO MOMENT</Link></div>) : <div className="mt-6 rounded-[26px] border border-[#ded8ce] bg-white/70 p-8"><p className="font-black">Results define this person.</p><p className="mt-2 text-sm leading-6 text-[#777269]">Open a shared Moment to see what different realities looked like.</p><Link href="/world" className="mt-5 inline-block rounded-2xl bg-[#171614] px-5 py-4 text-sm font-black text-white">EXPLORE WORLD</Link></div>}
    </section>
  </main>;
}
