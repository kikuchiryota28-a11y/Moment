import { MomentPhysicsScene } from "@/components/v3/MomentPhysicsScene";
import { getTodayMoment } from "@/lib/db/v3";

export default async function Home() {
  const moment = await getTodayMoment();

  return (
    <main className="relative min-h-[100dvh] overflow-hidden">
      <MomentPhysicsScene
        moment={{
          id: moment.id,
          prompt: moment.prompt,
          participantCount: moment.participantCount,
          status: moment.status,
          myResultId: moment.myResultId,
        }}
      />
      <div className="sr-only">
        <h1>MOMENT — SAME QUESTION. DIFFERENT REALITY.</h1>
        <p>Today&apos;s Moment: {moment.prompt}</p>
        <p>{moment.participantCount.toLocaleString()} people are in this Moment.</p>
      </div>
    </main>
  );
}
