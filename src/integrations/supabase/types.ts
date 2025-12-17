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
      batches: {
        Row: {
          action_type: string | null
          avg_weight: number | null
          batch_number: string
          created_at: string
          grade: string
          heads: number
          id: string
          mpk_interest: string | null
          notes: string | null
          region: string
          requires_action: boolean | null
          status: Database["public"]["Enums"]["batch_status"]
          target_week: string
          updated_at: string
          user_id: string
        }
        Insert: {
          action_type?: string | null
          avg_weight?: number | null
          batch_number: string
          created_at?: string
          grade: string
          heads: number
          id?: string
          mpk_interest?: string | null
          notes?: string | null
          region: string
          requires_action?: boolean | null
          status?: Database["public"]["Enums"]["batch_status"]
          target_week: string
          updated_at?: string
          user_id: string
        }
        Update: {
          action_type?: string | null
          avg_weight?: number | null
          batch_number?: string
          created_at?: string
          grade?: string
          heads?: number
          id?: string
          mpk_interest?: string | null
          notes?: string | null
          region?: string
          requires_action?: boolean | null
          status?: Database["public"]["Enums"]["batch_status"]
          target_week?: string
          updated_at?: string
          user_id?: string
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
          created_at: string
          farmer_id: string
          grading: Database["public"]["Enums"]["farmer_grading"]
          id: string
          is_restricted: boolean
          last_activity_at: string | null
          missed_updates: number
          name: string
          region: string
          reliability: Database["public"]["Enums"]["farmer_reliability"]
          restriction_reason: string | null
          total_confirmations: number
          total_declines: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          farmer_id: string
          grading?: Database["public"]["Enums"]["farmer_grading"]
          id?: string
          is_restricted?: boolean
          last_activity_at?: string | null
          missed_updates?: number
          name: string
          region: string
          reliability?: Database["public"]["Enums"]["farmer_reliability"]
          restriction_reason?: string | null
          total_confirmations?: number
          total_declines?: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          farmer_id?: string
          grading?: Database["public"]["Enums"]["farmer_grading"]
          id?: string
          is_restricted?: boolean
          last_activity_at?: string | null
          missed_updates?: number
          name?: string
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
      purchase_pool_requests: {
        Row: {
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
        }
        Insert: {
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
        }
        Update: {
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
      batch_status: "forecast" | "soft_committed" | "confirmed" | "delivered"
      farmer_grading: "observer" | "declared_supplier" | "standard_supplier"
      farmer_reliability: "high" | "medium" | "low"
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
      batch_status: ["forecast", "soft_committed", "confirmed", "delivered"],
      farmer_grading: ["observer", "declared_supplier", "standard_supplier"],
      farmer_reliability: ["high", "medium", "low"],
      pool_request_status: ["pending", "partial", "fulfilled", "cancelled"],
    },
  },
} as const
