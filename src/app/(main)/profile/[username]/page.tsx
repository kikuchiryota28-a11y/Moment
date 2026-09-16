import Link from "next/link";
import { notFound } from "next/navigation";
import { Settings, Pencil, Globe, Instagram } from "lucide-react";
import { signOut } from "@/actions/auth";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/db/profiles";
import { Avatar } from "@/components/shared/Avatar";
import Image from "next/image";

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  let { username } = await params;
  if (username === "me") {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) notFound();
    const { data: profile } = await supabase.from("profiles").select("username").eq("id", user.id).maybeSingle();
    username = profile?.username ?? "";
  }
  const data = await getProfile(username);
  if (!data) notFound();
  const { profile, moments, experiences, stats } = data;
  const isOwnProfile = username === profile.username;
  return <div className="py-5 sm:py-10">
    <div className="flex items-start justify-between gap-4"><div className="flex items-center gap-4"><Avatar src={profile.avatarUrl} name={profile.displayName} size={72}/><div><h1 className="text-2xl font-black">{profile.displayName}</h1><p className="text-sm text-[#777269]">@{profile.username}</p></div></div>{isOwnProfile && <div className="flex items-center gap-1"><Link href="/profile/edit" aria-label="Edit profile" className="rounded-full p-2 hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-[#ef6b35]"><Pencil size={18}/></Link><Link href="/settings" aria-label="Settings" className="rounded-full p-2 hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-[#ef6b35]"><Settings size={19}/></Link><form action={signOut}><button className="px-2 text-xs font-bold underline">Log out</button></form></div>}</div>
    <p className="mt-5 max-w-xl text-sm leading-6 text-[#5f5a52]">{profile.bio ?? "No bio yet."}</p>
    {(profile.websiteUrl || profile.instagramUrl || profile.xUrl) && <div className="mt-4 flex flex-wrap gap-2">{profile.websiteUrl && <a href={profile.websiteUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-full border border-[#ded8ce] px-3 py-1.5 text-xs font-bold"><Globe size={13}/>Website</a>}{profile.instagramUrl && <a href={profile.instagramUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-full border border-[#ded8ce] px-3 py-1.5 text-xs font-bold"><Instagram size={13}/>Instagram</a>}{profile.xUrl && <a href={profile.xUrl} target="_blank" rel="noreferrer" className="rounded-full border border-[#ded8ce] px-3 py-1.5 text-xs font-bold">X</a>}</div>}
    <div className="mt-7 grid grid-cols-3 rounded-3xl border border-[#ded8ce] bg-white/60 p-5 text-center"><Stat n={stats.momentCount} label="Moments"/><Stat n={stats.experienceCount} label="Experiences"/><Stat n={stats.placeCount} label="Places"/></div>
    <section className="mt-8"><div className="mb-4 flex items-end justify-between gap-4"><div><p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#ef6b35]">Your experience identity</p><h2 className="mt-1 text-xl font-black">Experiences</h2></div>{stats.experienceCount > experiences.length && <Link href="/journey?status=COMPLETED" className="text-xs font-black underline">See all</Link>}</div>{experiences.length ? <div className="grid gap-3 sm:grid-cols-2">{experiences.map((experience) => <ExperienceCard key={experience.id} experience={experience}/>)}</div> : <div className="rounded-2xl border border-dashed border-[#cfc7bb] p-6"><p className="font-bold">Your experiences will appear here.</p><p className="mt-1 text-sm text-[#777269]">TRY something, do it, then record what it meant to you.</p></div>}</section>
    <section className="mt-10"><h2 className="mb-4 text-xl font-black">Moments</h2>{moments.length ? <div className="grid grid-cols-2 gap-3">{moments.map((m) => <Link key={m.id} href={`/moment/${m.id}`} className="rounded-2xl border border-[#ded8ce] bg-white/60 p-4"><p className="text-xs font-bold capitalize text-[#ef6b35]">{m.category}</p><h3 className="mt-2 font-black">{m.title}</h3><p className="mt-1 line-clamp-2 text-xs leading-5 text-[#777269]">{m.description}</p></Link>)}</div> : <p className="text-sm text-[#777269]">No Moments yet.</p>}</section>
  </div>;
}
function ExperienceCard({ experience }: { experience: { id: string; momentId: string | null; momentTitle?: string | null; experienceMediaUrl: string | null; experienceNote: string | null; experienceLocationName: string | null } }) { return <article className="overflow-hidden rounded-2xl border border-[#ded8ce] bg-white/60">{experience.experienceMediaUrl && <div className="relative aspect-[4/3] bg-[#e9e2d7]"><Image src={experience.experienceMediaUrl} alt="" fill sizes="(max-width: 640px) 100vw, 50vw" className="object-cover"/></div>}<div className="p-4">{experience.momentId ? <Link href={`/moment/${experience.momentId}`} className="font-black hover:underline">{experience.momentTitle}</Link> : <p className="font-black">{experience.momentTitle}</p>}{experience.experienceNote && <p className="mt-2 line-clamp-3 text-sm leading-6 text-[#5f5a52]">{experience.experienceNote}</p>}{experience.experienceLocationName && <p className="mt-3 text-xs font-bold text-[#777269]">{experience.experienceLocationName}</p>}</div></article>; }
function Stat({ n, label }: { n: number; label: string }) { return <div><p className="text-2xl font-black">{n}</p><p className="mt-1 text-xs text-[#777269]">{label}</p></div>; }
