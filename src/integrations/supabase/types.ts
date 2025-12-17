export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      activity_log: {
        Row: {
          actor_name: string | null
          actor_role: string
          created_at: string
          description: string
          event_type: Database["public"]["Enums"]["activity_event_type"]
          id: string
          metadata: Json | null
          target_id: string | null
          target_name: string | null
          target_type: string | null
        }
        Insert: {
          actor_name?: string | null
          actor_role: string
          created_at?: string
          description: string
          event_type: Database["public"]["Enums"]["activity_event_type"]
          id?: string
          metadata?: Json | null
          target_id?: string | null
          target_name?: string | null
          target_type?: string | null
        }
        Update: {
          actor_name?: string | null
          actor_role?: string
          created_at?: string
          description?: string
          event_type?: Database["public"]["Enums"]["activity_event_type"]
          id?: string
          metadata?: Json | null
          target_id?: string | null
          target_name?: string | null
          target_type?: string | null
        }
        Relationships: []
      }
      batches: {
        Row: {
          action_type: string | null
          age_max: number | null
          age_min: number | null
          avg_weight: number | null
          batch_number: string
          breed: string | null
          created_at: string
          gender: string | null
          grade: string
          heads: number
          id: string
          mpk_interest: string | null
          notes: string | null
          region: string
          requires_action: boolean | null
          standard_status: string | null
          status: Database["public"]["Enums"]["batch_status"]
          target_week: string
          updated_at: string
          user_id: string
          weight_max: number | null
          weight_min: number | null
        }
        Insert: {
          action_type?: string | null
          age_max?: number | null
          age_min?: number | null
          avg_weight?: number | null
          batch_number: string
          breed?: string | null
          created_at?: string
          gender?: string | null
          grade: string
          heads: number
          id?: string
          mpk_interest?: string | null
          notes?: string | null
          region: string
          requires_action?: boolean | null
          standard_status?: string | null
          status?: Database["public"]["Enums"]["batch_status"]
          target_week: string
          updated_at?: string
          user_id: string
          weight_max?: number | null
          weight_min?: number | null
        }
        Update: {
          action_type?: string | null
          age_max?: number | null
          age_min?: number | null
          avg_weight?: number | null
          batch_number?: string
          breed?: string | null
          created_at?: string
          gender?: string | null
          grade?: string
          heads?: number
          id?: string
          mpk_interest?: string | null
          notes?: string | null
          region?: string
          requires_action?: boolean | null
          standard_status?: string | null
          status?: Database["public"]["Enums"]["batch_status"]
          target_week?: string
          updated_at?: string
          user_id?: string
          weight_max?: number | null
          weight_min?: number | null
        }
        Relationships: []
      }
      farmer_activity_log: {
        Row: {
          action_type: string
          created_at: string
          farmer_id: string
          id: string
          new_value: string | null
          note: string | null
          performed_by: string | null
          previous_value: string | null
        }
        Insert: {
          action_type: string
          created_at?: string
          farmer_id: string
          id?: string
          new_value?: string | null
          note?: string | null
          performed_by?: string | null
          previous_value?: string | null
        }
        Update: {
          action_type?: string
          created_at?: string
          farmer_id?: string
          id?: string
          new_value?: string | null
          note?: string | null
          performed_by?: string | null
          previous_value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "farmer_activity_log_farmer_id_fkey"
            columns: ["farmer_id"]
            isOneToOne: false
            referencedRelation: "farmers"
            referencedColumns: ["id"]
          },
        ]
      }
      farmers: {
        Row: {
          contact_name: string | null
          created_at: string
          district: string | null
          email: string | null
          farm_type: string | null
          farmer_id: string
          grading: Database["public"]["Enums"]["farmer_grading"]
          id: string
          is_restricted: boolean
          last_activity_at: string | null
          missed_updates: number
          name: string
          phone: string | null
          region: string
          reliability: Database["public"]["Enums"]["farmer_reliability"]
          restriction_reason: string | null
          total_confirmations: number
          total_declines: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          contact_name?: string | null
          created_at?: string
          district?: string | null
          email?: string | null
          farm_type?: string | null
          farmer_id: string
          grading?: Database["public"]["Enums"]["farmer_grading"]
          id?: string
          is_restricted?: boolean
          last_activity_at?: string | null
          missed_updates?: number
          name: string
          phone?: string | null
          region: string
          reliability?: Database["public"]["Enums"]["farmer_reliability"]
          restriction_reason?: string | null
          total_confirmations?: number
          total_declines?: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          contact_name?: string | null
          created_at?: string
          district?: string | null
          email?: string | null
          farm_type?: string | null
          farmer_id?: string
          grading?: Database["public"]["Enums"]["farmer_grading"]
          id?: string
          is_restricted?: boolean
          last_activity_at?: string | null
          missed_updates?: number
          name?: string
          phone?: string | null
          region?: string
          reliability?: Database["public"]["Enums"]["farmer_reliability"]
          restriction_reason?: string | null
          total_confirmations?: number
          total_declines?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      mpk_activity_log: {
        Row: {
          action_type: string
          created_at: string
          id: string
          mpk_id: string
          new_value: string | null
          note: string | null
          performed_by: string | null
          previous_value: string | null
        }
        Insert: {
          action_type: string
          created_at?: string
          id?: string
          mpk_id: string
          new_value?: string | null
          note?: string | null
          performed_by?: string | null
          previous_value?: string | null
        }
        Update: {
          action_type?: string
          created_at?: string
          id?: string
          mpk_id?: string
          new_value?: string | null
          note?: string | null
          performed_by?: string | null
          previous_value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mpk_activity_log_mpk_id_fkey"
            columns: ["mpk_id"]
            isOneToOne: false
            referencedRelation: "mpks"
            referencedColumns: ["id"]
          },
        ]
      }
      mpks: {
        Row: {
          cancelled_requests: number
          common_target_weeks: string[] | null
          created_at: string
          default_accepted_breeds: string[] | null
          default_accepted_genders: string[] | null
          default_age_range_max: number | null
          default_age_range_min: number | null
          default_weight_range_max: number | null
          default_weight_range_min: number | null
          fulfilled_requests: number
          id: string
          intake_regions: string[]
          is_request_restricted: boolean
          last_activity_at: string | null
          max_active_requests: number | null
          mpk_id: string
          name: string
          partial_requests: number
          request_changes_count: number
          restriction_reason: string | null
          status: Database["public"]["Enums"]["mpk_status"]
          total_requests: number
          typical_volume_max: number | null
          typical_volume_min: number | null
          updated_at: string
        }
        Insert: {
          cancelled_requests?: number
          common_target_weeks?: string[] | null
          created_at?: string
          default_accepted_breeds?: string[] | null
          default_accepted_genders?: string[] | null
          default_age_range_max?: number | null
          default_age_range_min?: number | null
          default_weight_range_max?: number | null
          default_weight_range_min?: number | null
          fulfilled_requests?: number
          id?: string
          intake_regions?: string[]
          is_request_restricted?: boolean
          last_activity_at?: string | null
          max_active_requests?: number | null
          mpk_id: string
          name: string
          partial_requests?: number
          request_changes_count?: number
          restriction_reason?: string | null
          status?: Database["public"]["Enums"]["mpk_status"]
          total_requests?: number
          typical_volume_max?: number | null
          typical_volume_min?: number | null
          updated_at?: string
        }
        Update: {
          cancelled_requests?: number
          common_target_weeks?: string[] | null
          created_at?: string
          default_accepted_breeds?: string[] | null
          default_accepted_genders?: string[] | null
          default_age_range_max?: number | null
          default_age_range_min?: number | null
          default_weight_range_max?: number | null
          default_weight_range_min?: number | null
          fulfilled_requests?: number
          id?: string
          intake_regions?: string[]
          is_request_restricted?: boolean
          last_activity_at?: string | null
          max_active_requests?: number | null
          mpk_id?: string
          name?: string
          partial_requests?: number
          request_changes_count?: number
          restriction_reason?: string | null
          status?: Database["public"]["Enums"]["mpk_status"]
          total_requests?: number
          typical_volume_max?: number | null
          typical_volume_min?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          description: string
          id: string
          is_read: boolean
          is_urgent: boolean
          link_to: string | null
          notification_type: Database["public"]["Enums"]["notification_type"]
          target_id: string | null
          title: string
          user_role: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          is_read?: boolean
          is_urgent?: boolean
          link_to?: string | null
          notification_type: Database["public"]["Enums"]["notification_type"]
          target_id?: string | null
          title: string
          user_role: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          is_read?: boolean
          is_urgent?: boolean
          link_to?: string | null
          notification_type?: Database["public"]["Enums"]["notification_type"]
          target_id?: string | null
          title?: string
          user_role?: string
        }
        Relationships: []
      }
      pool_matches: {
        Row: {
          batch_id: string
          created_at: string
          heads_matched: number
          id: string
          request_id: string
          status: string
        }
        Insert: {
          batch_id: string
          created_at?: string
          heads_matched: number
          id?: string
          request_id: string
          status?: string
        }
        Update: {
          batch_id?: string
          created_at?: string
          heads_matched?: number
          id?: string
          request_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "pool_matches_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pool_matches_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "purchase_pool_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      premium_change_log: {
        Row: {
          change_reason: string | null
          changed_by: string | null
          created_at: string
          id: string
          new_value: number | null
          premium_setting_id: string | null
          previous_value: number | null
        }
        Insert: {
          change_reason?: string | null
          changed_by?: string | null
          created_at?: string
          id?: string
          new_value?: number | null
          premium_setting_id?: string | null
          previous_value?: number | null
        }
        Update: {
          change_reason?: string | null
          changed_by?: string | null
          created_at?: string
          id?: string
          new_value?: number | null
          premium_setting_id?: string | null
          previous_value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "premium_change_log_premium_setting_id_fkey"
            columns: ["premium_setting_id"]
            isOneToOne: false
            referencedRelation: "premium_settings"
            referencedColumns: ["id"]
          },
        ]
      }
      premium_settings: {
        Row: {
          created_at: string
          criteria: string[] | null
          description: string | null
          id: string
          is_active: boolean
          level_key: string
          level_name: string
          premium_type: string
          premium_value: number
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          criteria?: string[] | null
          description?: string | null
          id?: string
          is_active?: boolean
          level_key: string
          level_name: string
          premium_type: string
          premium_value?: number
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          criteria?: string[] | null
          description?: string | null
          id?: string
          is_active?: boolean
          level_key?: string
          level_name?: string
          premium_type?: string
          premium_value?: number
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      purchase_pool_requests: {
        Row: {
          accepted_breeds: string[] | null
          accepted_genders: string[] | null
          age_range_max: number | null
          age_range_min: number | null
          created_at: string
          id: string
          matched_volume: number
          mpk_id: string
          mpk_name: string
          notes: string | null
          regions: string[]
          request_number: string
          required_grade: string
          required_volume: number
          status: Database["public"]["Enums"]["pool_request_status"]
          target_week: string
          updated_at: string
          weight_range_max: number | null
          weight_range_min: number | null
        }
        Insert: {
          accepted_breeds?: string[] | null
          accepted_genders?: string[] | null
          age_range_max?: number | null
          age_range_min?: number | null
          created_at?: string
          id?: string
          matched_volume?: number
          mpk_id: string
          mpk_name: string
          notes?: string | null
          regions?: string[]
          request_number: string
          required_grade: string
          required_volume: number
          status?: Database["public"]["Enums"]["pool_request_status"]
          target_week: string
          updated_at?: string
          weight_range_max?: number | null
          weight_range_min?: number | null
        }
        Update: {
          accepted_breeds?: string[] | null
          accepted_genders?: string[] | null
          age_range_max?: number | null
          age_range_min?: number | null
          created_at?: string
          id?: string
          matched_volume?: number
          mpk_id?: string
          mpk_name?: string
          notes?: string | null
          regions?: string[]
          request_number?: string
          required_grade?: string
          required_volume?: number
          status?: Database["public"]["Enums"]["pool_request_status"]
          target_week?: string
          updated_at?: string
          weight_range_max?: number | null
          weight_range_min?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      activity_event_type:
        | "farmer_onboarded"
        | "farmer_grading_changed"
        | "farmer_restricted"
        | "farmer_unrestricted"
        | "mpk_onboarded"
        | "mpk_status_changed"
        | "mpk_restricted"
        | "mpk_unrestricted"
        | "pool_request_created"
        | "pool_request_updated"
        | "pool_request_cancelled"
        | "pool_match_proposed"
        | "pool_match_confirmed"
        | "batch_confirmed"
        | "batch_declined"
        | "invitation_sent"
        | "invitation_accepted"
        | "invitation_declined"
      batch_status: "forecast" | "soft_committed" | "confirmed" | "delivered"
      farmer_grading: "observer" | "declared_supplier" | "standard_supplier"
      farmer_reliability: "high" | "medium" | "low"
      mpk_status: "active" | "restricted" | "inactive"
      notification_type:
        | "pool_invitation"
        | "batch_action_required"
        | "batch_status_changed"
        | "grading_updated"
        | "request_status_changed"
        | "watchlist_supply_added"
        | "matching_window_approaching"
        | "request_at_risk"
        | "farmer_declined"
        | "request_stalled"
        | "reliability_dropped"
      pool_request_status: "pending" | "partial" | "fulfilled" | "cancelled"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      activity_event_type: [
        "farmer_onboarded",
        "farmer_grading_changed",
        "farmer_restricted",
        "farmer_unrestricted",
        "mpk_onboarded",
        "mpk_status_changed",
        "mpk_restricted",
        "mpk_unrestricted",
        "pool_request_created",
        "pool_request_updated",
        "pool_request_cancelled",
        "pool_match_proposed",
        "pool_match_confirmed",
        "batch_confirmed",
        "batch_declined",
        "invitation_sent",
        "invitation_accepted",
        "invitation_declined",
      ],
      batch_status: ["forecast", "soft_committed", "confirmed", "delivered"],
      farmer_grading: ["observer", "declared_supplier", "standard_supplier"],
      farmer_reliability: ["high", "medium", "low"],
      mpk_status: ["active", "restricted", "inactive"],
      notification_type: [
        "pool_invitation",
        "batch_action_required",
        "batch_status_changed",
        "grading_updated",
        "request_status_changed",
        "watchlist_supply_added",
        "matching_window_approaching",
        "request_at_risk",
        "farmer_declined",
        "request_stalled",
        "reliability_dropped",
      ],
      pool_request_status: ["pending", "partial", "fulfilled", "cancelled"],
    },
  },
} as const
