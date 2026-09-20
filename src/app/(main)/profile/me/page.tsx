import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowUpRight, Settings2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getMyV3Results } from "@/lib/db/v3-journey";
import { Avatar } from "@/components/shared/Avatar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Surface";

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
    <main className="moment-container py-8 pb-28 md:py-12 md:pb-16">
      <header className="flex items-center justify-between border-b border-[var(--color-line-value)] pb-7">
        <div className="flex items-center gap-4">
          <Avatar src={profile?.avatar_url ?? null} name={name} size={56} />
          <div><p className="moment-eyebrow text-[var(--color-primary-value)]">You</p><h1 className="text-2xl font-semibold tracking-[-0.03em]">{name}</h1></div>
        </div>
        <Link href="/settings"><Button variant="ghost" size="sm" icon={<Settings2 size={17} />}>Settings</Button></Link>
      </header>
      <section className="py-8">
        <div className="mb-5"><p className="moment-eyebrow text-[var(--color-muted-ink-value)]">Your record</p><h2 className="moment-display mt-2 max-w-2xl text-4xl md:text-6xl">What you lived.</h2></div>
        {results.length ? (
          <div className="divide-y divide-[var(--color-line-value)] border-y border-[var(--color-line-value)]">
            {results.map((r: any) => (
              <Link key={r.id} href={`/moment/${r.daily_moment_id}/reveal`} className="group flex min-h-24 items-center justify-between gap-5 py-4">
                <div className="min-w-0"><p className="text-xs text-[var(--color-muted-ink-value)]">{r.daily_moments?.moment_date}</p><p className="mt-1 truncate text-lg font-semibold group-hover:text-[var(--color-primary-value)]">{r.daily_moments?.prompt}</p><p className="mt-1 text-sm text-[var(--color-muted-ink-value)]">{r.result_type}{r.choice_value ? ` · ${r.choice_value}` : ""}</p></div>
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-[var(--color-surface-container-value)]"><ArrowUpRight size={18} /></span>
              </Link>
            ))}
          </div>
        ) : (
          <Card variant="outlined" className="p-10 text-center"><h3 className="moment-display text-4xl">Nothing yet.</h3><Link href="/" className="mt-6 inline-flex"><Button size="lg">Open Moment</Button></Link></Card>
        )}
      </section>
    </main>
  );
}