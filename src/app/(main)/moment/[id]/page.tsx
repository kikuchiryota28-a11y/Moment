import { notFound } from "next/navigation";
import { getTodayMoment, getResults } from "@/lib/db/v3";
import { MomentDetailPageClient } from "./MomentDetailClient";

type MomentPhase = "enter" | "action" | "result" | "branch";

function getPhase(moment: { status: string; myResultId: string | null }): MomentPhase {
  if (moment.myResultId) return "result";
  if (["FIRST_MOVER", "LIVE", "ENDING"].includes(moment.status)) return "action";
  return "enter";
}

export default async function MomentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let moment;
  try {
    moment = await getTodayMoment();
  } catch {
    return notFound();
  }
  if (moment.id !== id) return notFound();
  const results = await getResults(id);
  const phase = getPhase(moment);

  return (
    <MomentDetailPageClient
      initialMoment={{
        id: moment.id,
        prompt: moment.prompt,
        participantCount: moment.participantCount,
        status: moment.status,
        myResultId: moment.myResultId,
      }}
      initialResults={results}
      initialPhase={phase}
    />
  );
}