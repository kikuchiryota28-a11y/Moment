import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMyV3Results } from "@/lib/db/v3-journey";
import Link from "next/link";
import { Card } from "@/components/ui/Surface";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
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

  return (
    <main className="mx-auto max-w-[1440px] px-6 py-12 lg:px-12 lg:py-16">
      <section className="mb-12">
        <Card variant="default" className="p-6 sm:p-8">
          <div className="flex items-center justify-between gap-5">
            <div className="flex min-w-0 items-center gap-4">
              <Avatar src={profile?.avatar_url ?? null} name={name} size={64} />
              <div className="min-w-0">
                <Badge variant="accent" className="mb-1">YOU</Badge>
                <h1 className="text-3xl font-semibold tracking-[-0.04em] text-[var(--color-ink)] truncate">{name}</h1>
                <p className="mt-1 text-sm text-[var(--color-muted-ink)]">Your journey is what you experienced.</p>
              </div>
            </div>
            <Link href="/profile/edit">
              <Button variant="ghost" size="sm">EDIT</Button>
            </Link>
          </div>
        </Card>
      </section>

      <section>
        <div className="flex items-end justify-between gap-4 mb-6">
          <div>
            <Badge variant="accent" className="mb-2">YOUR JOURNEY</Badge>
            <h2 className="text-[clamp(1.75rem,3vw,2.5rem)] font-medium leading-none tracking-[-0.045em] font-[var(--font-display)] text-[var(--color-ink)]">
              Moments you actually lived.
            </h2>
          </div>
        </div>
        {results.length ? (
          <div className="space-y-4">
            {results.map((r: any) => (
              <Link key={r.id} href={`/moment/${r.daily_moment_id}/reveal`} className="block">
                <Card variant="interactive" className="p-6">
                  <div className="flex items-start justify-between gap-5">
                    <div>
                      <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--color-muted-ink)]">{r.daily_moments?.moment_date}</span>
                      <p className="mt-3 text-lg font-semibold tracking-[-0.02em] text-[var(--color-ink)]">{r.daily_moments?.prompt}</p>
                      <p className="mt-2 text-sm text-[var(--color-muted-ink)]">{r.result_type}{r.choice_value ? ` · ${r.choice_value}` : ""}</p>
                    </div>
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--color-line)] bg-[var(--color-surface)] text-[var(--color-muted-ink)]">→</span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card variant="default" className="p-10 text-center">
            <p className="text-xl font-semibold text-[var(--color-ink)]">Nothing here yet.</p>
            <p className="mt-2 max-w-md mx-auto text-sm leading-6 text-[var(--color-muted-ink)]">Today&apos;s question is your first chance to make one.</p>
            <Link href="/">
              <Button size="lg" className="mt-7">GO TO MOMENT</Button>
            </Link>
          </Card>
        )}
      </section>
    </main>
  );
}