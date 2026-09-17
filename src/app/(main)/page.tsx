import { getTodayMoment } from "@/lib/db/v3";
import { DynamicHome } from "@/components/v3/DynamicHome";

export default async function Home() {
  const moment = await getTodayMoment();
  return <DynamicHome id={moment.id} prompt={moment.prompt} participantCount={moment.participantCount} status={moment.status} myResultId={moment.myResultId} />;
}
