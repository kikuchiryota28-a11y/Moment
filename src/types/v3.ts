export type DailyMomentStatus = "PREPARED" | "FIRST_MOVER" | "LIVE" | "ENDING" | "ENDED" | "ARCHIVE";
export type ResultType = "photo" | "video" | "text" | "choice" | "combination";

export interface DailyMoment {
  id: string;
  momentDate: string;
  prompt: string;
  status: DailyMomentStatus;
  firstMoverId: string | null;
  startedAt: string | null;
  endsAt: string;
  participantCount: number;
  myResultId: string | null;
}

export interface Result {
  id: string;
  dailyMomentId: string;
  userId: string;
  resultType: ResultType;
  textContent: string | null;
  choiceValue: string | null;
  why: string | null;
  countryCode: string | null;
  city: string | null;
  mediaUrl: string | null;
  createdAt: string;
  author: { username: string; displayName: string; avatarUrl: string | null } | null;
}