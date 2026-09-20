import { MomentHero } from "@/components/v3/MomentHero";
import { getTodayMoment } from "@/lib/db/v3";

export default async function Home() {
  try {
    const moment = await getTodayMoment();

    return (
      <main className="min-h-[100dvh]">
        <MomentHero
          moment={{
            id: moment.id,
            prompt: moment.prompt,
            participantCount: moment.participantCount,
            status: moment.status,
            myResultId: moment.myResultId,
          }}
        />
      </main>
    );
  } catch (error) {
    const unavailable = error instanceof Error && error.message === "Today's Moment is not available yet.";

    return (
      <main className="min-h-[100dvh]">
        <MomentHero state={unavailable ? "empty" : "error"} />
      </main>
    );
  }
}