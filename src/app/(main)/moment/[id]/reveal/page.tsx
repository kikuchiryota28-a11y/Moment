import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getResults, getTomorrowMoment } from "@/lib/db/v3";
import { RevealPageClient } from "./RevealClient";

const branchLabels = ["SIMILAR", "SHIFT", "DIFFERENT", "UNEXPECTED"];

export default async function RevealPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();

  const { data: moment } = await sb
    .from("daily_moments")
    .select("id,prompt,status,moment_date")
    .eq("id", id)
    .maybeSingle();

  if (!moment) notFound();

  const allResults = await getResults(id);
  const myResult = user ? allResults.find((r) => r.userId === user.id) : null;
  const otherResults = allResults.filter((r) => r.userId !== user?.id);
  const tomorrowMoment = await getTomorrowMoment();

  const selectedOthers = selectReveal(otherResults);

  return (
    <RevealPageClient
      moment={moment}
      allResults={allResults}
      myResult={myResult}
      selectedOthers={selectedOthers}
      tomorrowMoment={tomorrowMoment}
    />
  );
}

function selectReveal(rows: any[]) {
  const picked: any[] = [];
  const usedTypes = new Set<string>();
  const usedCountries = new Set<string>();

  const take = (p: (r: any) => boolean) => {
    const i = rows.findIndex((r) => !picked.includes(r) && p(r));
    if (i >= 0) {
      const row = rows[i];
      picked.push(row);
      usedTypes.add(row.resultType);
      const country = row.countryCode ?? "";
      if (country.length > 0) usedCountries.add(country);
    }
  };

  take((r) => r.resultType === "choice");
  take((r) => !usedTypes.has(r.resultType));
  take((r) => {
    const country = r.countryCode;
    return typeof country === "string" && country.length > 0 && !usedCountries.has(country);
  });
  take((r) => r.resultType === "photo" || r.resultType === "video");
  take((r) => r.resultType === "text" || r.resultType === "combination");

  for (const r of rows) {
    if (picked.length >= 4) break;
    if (!picked.includes(r)) picked.push(r);
  }
  return picked.slice(0, 4);
}