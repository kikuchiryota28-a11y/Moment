export type ThemePreference = "system" | "light" | "dark";
export type Visibility = "public" | "private";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: { id: string; username: string; display_name: string; avatar_url: string | null; bio: string | null; website_url: string | null; instagram_url: string | null; x_url: string | null; created_at: string; updated_at: string };
        Insert: Partial<Database["public"]["Tables"]["profiles"]["Row"]> & Pick<Database["public"]["Tables"]["profiles"]["Row"], "id" | "display_name" | "username">;
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
      };
      user_settings: {
        Row: { user_id: string; theme: ThemePreference; notifications_enabled: boolean; try_notifications: boolean; reminder_notifications: boolean; activity_visibility: Visibility; experience_visibility: Visibility; created_at: string; updated_at: string };
        Insert: Partial<Database["public"]["Tables"]["user_settings"]["Row"]> & Pick<Database["public"]["Tables"]["user_settings"]["Row"], "user_id">;
        Update: Partial<Database["public"]["Tables"]["user_settings"]["Row"]>;
      };
      moments: {
        Row: { id: string; user_id: string; title: string; description: string; why: string | null; category: string; location_name: string | null; latitude: number | null; longitude: number | null; duration_minutes: number | null; estimated_cost: number | null; rating: number; would_do_again: boolean; created_at: string; updated_at: string };
        Insert: never; Update: never;
      };
      journeys: { Row: { id: string; user_id: string; moment_id: string; status: "PLANNED" | "TRYING" | "COMPLETED"; planned_at: string | null; started_at: string | null; completed_at: string | null; created_at: string; updated_at: string }; Insert: never; Update: never };
      moment_media: { Row: { id: string; moment_id: string; media_url: string; media_type: "image" | "video"; sort_order: number; created_at: string }; Insert: never; Update: never };
      likes: { Row: { user_id: string; moment_id: string; created_at: string }; Insert: never; Update: never };
      comments: { Row: { id: string; user_id: string; moment_id: string; body: string; created_at: string; updated_at: string }; Insert: never; Update: never };
      follows: { Row: { follower_id: string; following_id: string; created_at: string }; Insert: never; Update: never };
    };
    Functions: { delete_my_account: { Args: Record<string, never>; Returns: undefined } };
  };
}

export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
export type UserSettingsRow = Database["public"]["Tables"]["user_settings"]["Row"];
