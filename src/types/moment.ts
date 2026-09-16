export type MomentCategory = "explore" | "eat" | "watch" | "move" | "create" | "social" | "travel";
export type JourneyStatus = "PLANNED" | "TRYING" | "COMPLETED";
export type MediaType = "image" | "video";
export interface Profile { id: string; username: string; displayName: string; avatarUrl: string | null; bio: string | null; websiteUrl?: string | null; instagramUrl?: string | null; xUrl?: string | null; createdAt: string; updatedAt: string; }
export interface Moment { id: string; userId: string; title: string; description: string; why: string | null; category: MomentCategory; locationName: string | null; latitude: number | null; longitude: number | null; durationMinutes: number | null; estimatedCost: number | null; experienceNote: string | null; rating: number; wouldDoAgain: boolean; createdAt: string; updatedAt: string; }
export interface MomentMedia { id: string; momentId: string; mediaUrl: string; mediaType: MediaType; sortOrder: number; }
export interface Journey { id: string; userId: string; momentId: string | null; status: JourneyStatus; plannedAt: string | null; startedAt: string | null; completedAt: string | null; createdAt: string; updatedAt: string; moment?: Moment; momentTitle?: string | null; momentCategory?: string | null; mediaUrl?: string | null; }
export interface Comment { id: string; userId: string; momentId: string; body: string; createdAt: string; updatedAt: string; author?: Profile; }
export interface UserStats { momentCount: number; experienceCount: number; placeCount: number; }
export interface MomentDetail { moment: Moment; author: Profile; isOwner: boolean; media: MomentMedia[]; social: { likeCount: number; commentCount: number; isLiked: boolean; isFollowingAuthor: boolean }; journey: { status: JourneyStatus | null }; comments: Comment[]; }
