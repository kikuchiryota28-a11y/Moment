import { MomentHero } from "@/components/v3/MomentHero";
import { getTodayMoment } from "@/lib/db/v3";

export default async function Home() {
  const moment = await getTodayMoment();

  return (
    <main className="h-[100dvh] w-full overflow-hidden">
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
}
