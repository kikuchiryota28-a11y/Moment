export type ThemePreference = "system" | "light" | "dark";
export type Visibility = "public" | "private";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          display_name: string;
          avatar_url: string | null;
          bio: string | null;
          website_url: string | null;
          instagram_url: string | null;
          x_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["profiles"]["Row"]> & Pick<Database["public"]["Tables"]["profiles"]["Row"], "id" | "display_name" | "username">;
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
      };
      user_settings: {
        Row: {
          user_id: string;
          theme: ThemePreference;
          notifications_enabled: boolean;
          try_notifications: boolean;
          reminder_notifications: boolean;
          activity_visibility: Visibility;
          experience_visibility: Visibility;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["user_settings"]["Row"]> & Pick<Database["public"]["Tables"]["user_settings"]["Row"], "user_id">;
        Update: Partial<Database["public"]["Tables"]["user_settings"]["Row"]>;
      };
      daily_moments: {
        Row: {
          id: string;
          moment_date: string;
          prompt: string;
          status: "PREPARED" | "FIRST_MOVER" | "LIVE" | "ENDING" | "ENDED" | "ARCHIVE";
          first_mover_id: string | null;
          started_at: string | null;
          ends_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["daily_moments"]["Row"]> & Pick<Database["public"]["Tables"]["daily_moments"]["Row"], "id" | "moment_date" | "prompt" | "status" | "ends_at">;
        Update: Partial<Database["public"]["Tables"]["daily_moments"]["Row"]>;
      };
      results: {
        Row: {
          id: string;
          daily_moment_id: string;
          user_id: string;
          result_type: "photo" | "video" | "text" | "choice" | "combination";
          text_content: string | null;
          choice_value: string | null;
          why: string | null;
          country_code: string | null;
          city: string | null;
          moderation_status: "VISIBLE" | "HIDDEN" | "PENDING";
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["results"]["Row"]> & Pick<Database["public"]["Tables"]["results"]["Row"], "daily_moment_id" | "user_id" | "result_type">;
        Update: Partial<Database["public"]["Tables"]["results"]["Row"]>;
      };
      result_media: {
        Row: {
          id: string;
          result_id: string;
          media_url: string;
          media_type: "image" | "video";
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["result_media"]["Row"]> & Pick<Database["public"]["Tables"]["result_media"]["Row"], "result_id" | "media_url" | "media_type">;
        Update: Partial<Database["public"]["Tables"]["result_media"]["Row"]>;
      };
      journeys: {
        Row: {
          id: string;
          user_id: string;
          daily_moment_id: string | null;
          phase: "PLANNED" | "TRYING" | "COMPLETED";
          experience_note: string | null;
          experience_media_url: string | null;
          experience_location_name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["journeys"]["Row"]> & Pick<Database["public"]["Tables"]["journeys"]["Row"], "user_id" | "daily_moment_id">;
        Update: Partial<Database["public"]["Tables"]["journeys"]["Row"]>;
      };
    };
    Functions: {
      ensure_today_moment: { Args: Record<string, never>; Returns: Database["public"]["Tables"]["daily_moments"]["Row"] };
      start_v3_journey: { Args: { p_daily_moment_id: string }; Returns: void };
      complete_v3_journey: { Args: { p_daily_moment_id: string; p_experience_note: string | null; p_experience_media_url: string | null; p_experience_location_name: string | null }; Returns: void };
      delete_my_account: { Args: Record<string, never>; Returns: void };
    };
  };
}

export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
export type UserSettingsRow = Database["public"]["Tables"]["user_settings"]["Row"];
export type DailyMomentRow = Database["public"]["Tables"]["daily_moments"]["Row"];
export type ResultRow = Database["public"]["Tables"]["results"]["Row"];
export type JourneyRow = Database["public"]["Tables"]["journeys"]["Row"];