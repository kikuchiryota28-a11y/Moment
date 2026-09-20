import {redirect} from "next/navigation";
import Link from "next/link";
import {ArrowUpRight,Settings2} from "lucide-react";
import {createClient} from "@/lib/supabase/server";
import {getMyV3Results} from "@/lib/db/v3-journey";
import {Avatar} from "@/components/shared/Avatar";
import {Button} from "@/components/ui/Button";
export default async function YouPage(){
 const sb=await createClient();const{data:{user}}=await sb.auth.getUser();if(!user)redirect("/login");
 const[{data:profile},results]=await Promise.all([sb.from("profiles").select("username,display_name,avatar_url").eq("id",user.id).maybeSingle(),getMyV3Results()]);
 const name=profile?.display_name??"You";
 return <main className="moment-container py-8 pb-28 md:py-10">
  <header className="flex items-center justify-between border-b border-[var(--color-line)] py-8 md:py-12"><div className="flex items-center gap-4"><Avatar src={profile?.avatar_url??null} name={name} size={48}/><div><p className="moment-eyebrow text-[var(--color-accent)]">You</p><h1 className="text-2xl font-semibold tracking-tight">{name}</h1></div></div><Link href="/settings" aria-label="Settings"><Button variant="ghost" size="sm" icon={<Settings2 size={18}/>}/></Link></header>
  <section><div className="divide-y divide-[var(--color-line)] border-b border-[var(--color-line)]">{results.length?results.map((r:any)=><Link key={r.id} href={"/moment/"+r.daily_moment_id+"/reveal"} className="flex min-h-20 items-center justify-between gap-5 py-4"><div className="min-w-0"><p className="text-xs text-[var(--color-muted-ink)]">{r.daily_moments?.moment_date}</p><p className="mt-1 truncate font-medium">{r.daily_moments?.prompt}</p></div><ArrowUpRight size={17} className="shrink-0 text-[var(--color-muted-ink)]"/></Link>):<div className="py-16 text-center"><h2 className="text-xl font-semibold">Nothing yet.</h2><Link href="/" className="mt-5 inline-flex"><Button size="md">Open Moment</Button></Link></div>}</div></section>
 </main>;
}
