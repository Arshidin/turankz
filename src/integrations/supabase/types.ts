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
      admin_overrides: {
        Row: {
          created_at: string
          id: string
          metadata: Json | null
          new_value: string | null
          override_type: string
          performed_by: string
          previous_value: string | null
          reason: string
          target_id: string
          target_name: string | null
          target_type: string
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json | null
          new_value?: string | null
          override_type: string
          performed_by: string
          previous_value?: string | null
          reason: string
          target_id: string
          target_name?: string | null
          target_type: string
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json | null
          new_value?: string | null
          override_type?: string
          performed_by?: string
          previous_value?: string | null
          reason?: string
          target_id?: string
          target_name?: string | null
          target_type?: string
        }
        Relationships: []
      }
      batches: {
        Row: {
          action_type: string | null
          admin_unlock_reason: string | null
          admin_unlocked: boolean
          admin_unlocked_at: string | null
          admin_unlocked_by: string | null
          age_max: number | null
          age_min: number | null
          avg_weight: number | null
          batch_number: string
          breed: string | null
          created_at: string
          delivery_period: Database["public"]["Enums"]["delivery_period"] | null
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
          admin_unlock_reason?: string | null
          admin_unlocked?: boolean
          admin_unlocked_at?: string | null
          admin_unlocked_by?: string | null
          age_max?: number | null
          age_min?: number | null
          avg_weight?: number | null
          batch_number: string
          breed?: string | null
          created_at?: string
          delivery_period?:
            | Database["public"]["Enums"]["delivery_period"]
            | null
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
          admin_unlock_reason?: string | null
          admin_unlocked?: boolean
          admin_unlocked_at?: string | null
          admin_unlocked_by?: string | null
          age_max?: number | null
          age_min?: number | null
          avg_weight?: number | null
          batch_number?: string
          breed?: string | null
          created_at?: string
          delivery_period?:
            | Database["public"]["Enums"]["delivery_period"]
            | null
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
      execution_activity_log: {
        Row: {
          action_type: string
          created_at: string
          execution_id: string
          id: string
          metadata: Json | null
          new_status: Database["public"]["Enums"]["execution_status"] | null
          notes: string | null
          performed_by: string
          previous_status:
            | Database["public"]["Enums"]["execution_status"]
            | null
        }
        Insert: {
          action_type: string
          created_at?: string
          execution_id: string
          id?: string
          metadata?: Json | null
          new_status?: Database["public"]["Enums"]["execution_status"] | null
          notes?: string | null
          performed_by: string
          previous_status?:
            | Database["public"]["Enums"]["execution_status"]
            | null
        }
        Update: {
          action_type?: string
          created_at?: string
          execution_id?: string
          id?: string
          metadata?: Json | null
          new_status?: Database["public"]["Enums"]["execution_status"] | null
          notes?: string | null
          performed_by?: string
          previous_status?:
            | Database["public"]["Enums"]["execution_status"]
            | null
        }
        Relationships: [
          {
            foreignKeyName: "execution_activity_log_execution_id_fkey"
            columns: ["execution_id"]
            isOneToOne: false
            referencedRelation: "offtake_executions"
            referencedColumns: ["id"]
          },
        ]
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
          admin_notes: string | null
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
          registration_status: string
          reliability: Database["public"]["Enums"]["farmer_reliability"]
          restriction_reason: string | null
          total_confirmations: number
          total_declines: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          admin_notes?: string | null
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
          registration_status?: string
          reliability?: Database["public"]["Enums"]["farmer_reliability"]
          restriction_reason?: string | null
          total_confirmations?: number
          total_declines?: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          admin_notes?: string | null
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
          registration_status?: string
          reliability?: Database["public"]["Enums"]["farmer_reliability"]
          restriction_reason?: string | null
          total_confirmations?: number
          total_declines?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      forecast_reference_coefficients: {
        Row: {
          coefficient_key: string
          coefficient_type: string
          coefficient_value: number
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          updated_at: string
        }
        Insert: {
          coefficient_key: string
          coefficient_type: string
          coefficient_value: number
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          updated_at?: string
        }
        Update: {
          coefficient_key?: string
          coefficient_type?: string
          coefficient_value?: number
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      herd_structure_snapshots: {
        Row: {
          breed: string
          category: Database["public"]["Enums"]["livestock_category"]
          count: number
          created_at: string
          data_confidence_level: Database["public"]["Enums"]["data_confidence_level"]
          farmer_id: string
          id: string
          notes: string | null
          reporting_period_type: Database["public"]["Enums"]["reporting_period_type"]
          reporting_quarter: number | null
          reporting_year: number
        }
        Insert: {
          breed: string
          category: Database["public"]["Enums"]["livestock_category"]
          count: number
          created_at?: string
          data_confidence_level?: Database["public"]["Enums"]["data_confidence_level"]
          farmer_id: string
          id?: string
          notes?: string | null
          reporting_period_type: Database["public"]["Enums"]["reporting_period_type"]
          reporting_quarter?: number | null
          reporting_year: number
        }
        Update: {
          breed?: string
          category?: Database["public"]["Enums"]["livestock_category"]
          count?: number
          created_at?: string
          data_confidence_level?: Database["public"]["Enums"]["data_confidence_level"]
          farmer_id?: string
          id?: string
          notes?: string | null
          reporting_period_type?: Database["public"]["Enums"]["reporting_period_type"]
          reporting_quarter?: number | null
          reporting_year?: number
        }
        Relationships: [
          {
            foreignKeyName: "herd_structure_snapshots_farmer_id_fkey"
            columns: ["farmer_id"]
            isOneToOne: false
            referencedRelation: "farmers"
            referencedColumns: ["id"]
          },
        ]
      }
      market_availability_intents: {
        Row: {
          breed: string
          confidence_level: Database["public"]["Enums"]["intent_confidence_level"]
          created_at: string
          estimated_heads: number
          farmer_id: string
          horizon: Database["public"]["Enums"]["market_intent_horizon"]
          id: string
          non_binding: boolean
          notes: string | null
          verification_status: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          breed: string
          confidence_level?: Database["public"]["Enums"]["intent_confidence_level"]
          created_at?: string
          estimated_heads: number
          farmer_id: string
          horizon: Database["public"]["Enums"]["market_intent_horizon"]
          id?: string
          non_binding?: boolean
          notes?: string | null
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          breed?: string
          confidence_level?: Database["public"]["Enums"]["intent_confidence_level"]
          created_at?: string
          estimated_heads?: number
          farmer_id?: string
          horizon?: Database["public"]["Enums"]["market_intent_horizon"]
          id?: string
          non_binding?: boolean
          notes?: string | null
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "market_availability_intents_farmer_id_fkey"
            columns: ["farmer_id"]
            isOneToOne: false
            referencedRelation: "farmers"
            referencedColumns: ["id"]
          },
        ]
      }
      matching_activity_log: {
        Row: {
          action_type: string
          created_at: string
          id: string
          match_id: string
          new_value: string | null
          note: string | null
          performed_by: string
          previous_value: string | null
        }
        Insert: {
          action_type: string
          created_at?: string
          id?: string
          match_id: string
          new_value?: string | null
          note?: string | null
          performed_by: string
          previous_value?: string | null
        }
        Update: {
          action_type?: string
          created_at?: string
          id?: string
          match_id?: string
          new_value?: string | null
          note?: string | null
          performed_by?: string
          previous_value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "matching_activity_log_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "pool_matches"
            referencedColumns: ["id"]
          },
        ]
      }
      matching_windows: {
        Row: {
          close_date: string
          created_at: string
          created_by: string | null
          eligible_delivery_periods:
            | Database["public"]["Enums"]["delivery_period"][]
            | null
          id: string
          lock_date: string
          name: string
          notes: string | null
          start_date: string
          status: Database["public"]["Enums"]["matching_window_status"]
          target_week: string
          updated_at: string
        }
        Insert: {
          close_date: string
          created_at?: string
          created_by?: string | null
          eligible_delivery_periods?:
            | Database["public"]["Enums"]["delivery_period"][]
            | null
          id?: string
          lock_date: string
          name: string
          notes?: string | null
          start_date: string
          status?: Database["public"]["Enums"]["matching_window_status"]
          target_week: string
          updated_at?: string
        }
        Update: {
          close_date?: string
          created_at?: string
          created_by?: string | null
          eligible_delivery_periods?:
            | Database["public"]["Enums"]["delivery_period"][]
            | null
          id?: string
          lock_date?: string
          name?: string
          notes?: string | null
          start_date?: string
          status?: Database["public"]["Enums"]["matching_window_status"]
          target_week?: string
          updated_at?: string
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
      mpk_watchlist: {
        Row: {
          created_at: string
          id: string
          last_viewed_at: string | null
          min_volume: number | null
          mpk_id: string
          notes: string | null
          region: string
          target_month: string | null
          target_week: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_viewed_at?: string | null
          min_volume?: number | null
          mpk_id: string
          notes?: string | null
          region: string
          target_month?: string | null
          target_week: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          last_viewed_at?: string | null
          min_volume?: number | null
          mpk_id?: string
          notes?: string | null
          region?: string
          target_month?: string | null
          target_week?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mpk_watchlist_mpk_id_fkey"
            columns: ["mpk_id"]
            isOneToOne: false
            referencedRelation: "mpks"
            referencedColumns: ["id"]
          },
        ]
      }
      mpks: {
        Row: {
          admin_notes: string | null
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
          registration_status: string
          request_changes_count: number
          restriction_reason: string | null
          status: Database["public"]["Enums"]["mpk_status"]
          total_requests: number
          typical_volume_max: number | null
          typical_volume_min: number | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          admin_notes?: string | null
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
          registration_status?: string
          request_changes_count?: number
          restriction_reason?: string | null
          status?: Database["public"]["Enums"]["mpk_status"]
          total_requests?: number
          typical_volume_max?: number | null
          typical_volume_min?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          admin_notes?: string | null
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
          registration_status?: string
          request_changes_count?: number
          restriction_reason?: string | null
          status?: Database["public"]["Enums"]["mpk_status"]
          total_requests?: number
          typical_volume_max?: number | null
          typical_volume_min?: number | null
          updated_at?: string
          user_id?: string | null
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
      offtake_executions: {
        Row: {
          actual_delivery_date: string | null
          admin_compliance_notes: string | null
          admin_confirmed_at: string | null
          admin_confirmed_by: string | null
          batch_id: string
          closed_at: string | null
          closed_by: string | null
          closure_notes: string | null
          created_at: string
          delivered_volume: number | null
          delivery_condition: string | null
          delivery_location: string | null
          delivery_period: Database["public"]["Enums"]["delivery_period"]
          expected_delivery_end: string | null
          expected_delivery_start: string | null
          id: string
          match_id: string
          matched_volume: number
          mpk_confirmed_at: string | null
          mpk_confirmed_by: string | null
          mpk_delivery_notes: string | null
          pricing_formula_reference: string | null
          reference_price_at_match: number | null
          request_id: string
          scheduled_at: string | null
          scheduled_by: string | null
          scheduling_notes: string | null
          settlement_calculated_at: string | null
          settlement_indicative_total: number | null
          settlement_notes: string | null
          settlement_premiums_applied: number | null
          settlement_reference_price: number | null
          status: Database["public"]["Enums"]["execution_status"]
          updated_at: string
        }
        Insert: {
          actual_delivery_date?: string | null
          admin_compliance_notes?: string | null
          admin_confirmed_at?: string | null
          admin_confirmed_by?: string | null
          batch_id: string
          closed_at?: string | null
          closed_by?: string | null
          closure_notes?: string | null
          created_at?: string
          delivered_volume?: number | null
          delivery_condition?: string | null
          delivery_location?: string | null
          delivery_period?: Database["public"]["Enums"]["delivery_period"]
          expected_delivery_end?: string | null
          expected_delivery_start?: string | null
          id?: string
          match_id: string
          matched_volume: number
          mpk_confirmed_at?: string | null
          mpk_confirmed_by?: string | null
          mpk_delivery_notes?: string | null
          pricing_formula_reference?: string | null
          reference_price_at_match?: number | null
          request_id: string
          scheduled_at?: string | null
          scheduled_by?: string | null
          scheduling_notes?: string | null
          settlement_calculated_at?: string | null
          settlement_indicative_total?: number | null
          settlement_notes?: string | null
          settlement_premiums_applied?: number | null
          settlement_reference_price?: number | null
          status?: Database["public"]["Enums"]["execution_status"]
          updated_at?: string
        }
        Update: {
          actual_delivery_date?: string | null
          admin_compliance_notes?: string | null
          admin_confirmed_at?: string | null
          admin_confirmed_by?: string | null
          batch_id?: string
          closed_at?: string | null
          closed_by?: string | null
          closure_notes?: string | null
          created_at?: string
          delivered_volume?: number | null
          delivery_condition?: string | null
          delivery_location?: string | null
          delivery_period?: Database["public"]["Enums"]["delivery_period"]
          expected_delivery_end?: string | null
          expected_delivery_start?: string | null
          id?: string
          match_id?: string
          matched_volume?: number
          mpk_confirmed_at?: string | null
          mpk_confirmed_by?: string | null
          mpk_delivery_notes?: string | null
          pricing_formula_reference?: string | null
          reference_price_at_match?: number | null
          request_id?: string
          scheduled_at?: string | null
          scheduled_by?: string | null
          scheduling_notes?: string | null
          settlement_calculated_at?: string | null
          settlement_indicative_total?: number | null
          settlement_notes?: string | null
          settlement_premiums_applied?: number | null
          settlement_reference_price?: number | null
          status?: Database["public"]["Enums"]["execution_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "offtake_executions_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offtake_executions_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "pool_matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offtake_executions_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "purchase_pool_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      pool_matches: {
        Row: {
          base_price_per_kg: number | null
          batch_id: string
          cancellation_reason: string | null
          cancelled_at: string | null
          created_at: string
          created_by: string | null
          expected_delivery_end: string | null
          expected_delivery_start: string | null
          finalized_at: string | null
          heads_matched: number
          id: string
          matching_date: string
          matching_window_id: string | null
          notes: string | null
          predictability_premium: number | null
          premium_breakdown: Json | null
          premium_locked: boolean | null
          premium_locked_at: string | null
          reliability_premium: number | null
          request_id: string
          standard_premium: number | null
          status: Database["public"]["Enums"]["matching_status"]
          total_premium: number | null
          total_price_per_kg: number | null
          volume_consistency_premium: number | null
        }
        Insert: {
          base_price_per_kg?: number | null
          batch_id: string
          cancellation_reason?: string | null
          cancelled_at?: string | null
          created_at?: string
          created_by?: string | null
          expected_delivery_end?: string | null
          expected_delivery_start?: string | null
          finalized_at?: string | null
          heads_matched: number
          id?: string
          matching_date?: string
          matching_window_id?: string | null
          notes?: string | null
          predictability_premium?: number | null
          premium_breakdown?: Json | null
          premium_locked?: boolean | null
          premium_locked_at?: string | null
          reliability_premium?: number | null
          request_id: string
          standard_premium?: number | null
          status?: Database["public"]["Enums"]["matching_status"]
          total_premium?: number | null
          total_price_per_kg?: number | null
          volume_consistency_premium?: number | null
        }
        Update: {
          base_price_per_kg?: number | null
          batch_id?: string
          cancellation_reason?: string | null
          cancelled_at?: string | null
          created_at?: string
          created_by?: string | null
          expected_delivery_end?: string | null
          expected_delivery_start?: string | null
          finalized_at?: string | null
          heads_matched?: number
          id?: string
          matching_date?: string
          matching_window_id?: string | null
          notes?: string | null
          predictability_premium?: number | null
          premium_breakdown?: Json | null
          premium_locked?: boolean | null
          premium_locked_at?: string | null
          reliability_premium?: number | null
          request_id?: string
          standard_premium?: number | null
          status?: Database["public"]["Enums"]["matching_status"]
          total_premium?: number | null
          total_price_per_kg?: number | null
          volume_consistency_premium?: number | null
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
            foreignKeyName: "pool_matches_matching_window_id_fkey"
            columns: ["matching_window_id"]
            isOneToOne: false
            referencedRelation: "matching_windows"
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
      pool_request_activity_log: {
        Row: {
          action_type: string
          created_at: string
          id: string
          is_admin_override: boolean
          metadata: Json | null
          new_value: string | null
          note: string | null
          override_reason: string | null
          performed_by: string
          previous_value: string | null
          request_id: string
        }
        Insert: {
          action_type: string
          created_at?: string
          id?: string
          is_admin_override?: boolean
          metadata?: Json | null
          new_value?: string | null
          note?: string | null
          override_reason?: string | null
          performed_by: string
          previous_value?: string | null
          request_id: string
        }
        Update: {
          action_type?: string
          created_at?: string
          id?: string
          is_admin_override?: boolean
          metadata?: Json | null
          new_value?: string | null
          note?: string | null
          override_reason?: string | null
          performed_by?: string
          previous_value?: string | null
          request_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pool_request_activity_log_request_id_fkey"
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
      price_grid_cells: {
        Row: {
          age_category: string
          base_price: number
          breed_group: string | null
          created_at: string
          id: string
          notes: string | null
          sex: string
          updated_at: string
          version_id: string
          weight_max: number
          weight_min: number
        }
        Insert: {
          age_category: string
          base_price: number
          breed_group?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          sex: string
          updated_at?: string
          version_id: string
          weight_max: number
          weight_min: number
        }
        Update: {
          age_category?: string
          base_price?: number
          breed_group?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          sex?: string
          updated_at?: string
          version_id?: string
          weight_max?: number
          weight_min?: number
        }
        Relationships: [
          {
            foreignKeyName: "price_grid_cells_version_id_fkey"
            columns: ["version_id"]
            isOneToOne: false
            referencedRelation: "price_grid_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      price_grid_change_log: {
        Row: {
          action_type: string
          change_reason: string | null
          changed_by: string
          created_at: string
          id: string
          new_value: string | null
          previous_value: string | null
          version_id: string | null
        }
        Insert: {
          action_type: string
          change_reason?: string | null
          changed_by: string
          created_at?: string
          id?: string
          new_value?: string | null
          previous_value?: string | null
          version_id?: string | null
        }
        Update: {
          action_type?: string
          change_reason?: string | null
          changed_by?: string
          created_at?: string
          id?: string
          new_value?: string | null
          previous_value?: string | null
          version_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "price_grid_change_log_version_id_fkey"
            columns: ["version_id"]
            isOneToOne: false
            referencedRelation: "price_grid_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      price_grid_versions: {
        Row: {
          activated_at: string | null
          activated_by: string | null
          created_at: string
          created_by: string | null
          description: string | null
          effective_date: string
          id: string
          is_active: boolean
          updated_at: string
          version_name: string
        }
        Insert: {
          activated_at?: string | null
          activated_by?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          effective_date: string
          id?: string
          is_active?: boolean
          updated_at?: string
          version_name: string
        }
        Update: {
          activated_at?: string | null
          activated_by?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          effective_date?: string
          id?: string
          is_active?: boolean
          updated_at?: string
          version_name?: string
        }
        Relationships: []
      }
      purchase_pool_requests: {
        Row: {
          accepted_breeds: string[] | null
          accepted_genders: string[] | null
          admin_modification_reason: string | null
          admin_modified: boolean
          admin_modified_at: string | null
          admin_modified_by: string | null
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
          target_delivery_period:
            | Database["public"]["Enums"]["delivery_period"]
            | null
          target_week: string
          updated_at: string
          weight_range_max: number | null
          weight_range_min: number | null
        }
        Insert: {
          accepted_breeds?: string[] | null
          accepted_genders?: string[] | null
          admin_modification_reason?: string | null
          admin_modified?: boolean
          admin_modified_at?: string | null
          admin_modified_by?: string | null
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
          target_delivery_period?:
            | Database["public"]["Enums"]["delivery_period"]
            | null
          target_week: string
          updated_at?: string
          weight_range_max?: number | null
          weight_range_min?: number | null
        }
        Update: {
          accepted_breeds?: string[] | null
          accepted_genders?: string[] | null
          admin_modification_reason?: string | null
          admin_modified?: boolean
          admin_modified_at?: string | null
          admin_modified_by?: string | null
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
          target_delivery_period?:
            | Database["public"]["Enums"]["delivery_period"]
            | null
          target_week?: string
          updated_at?: string
          weight_range_max?: number | null
          weight_range_min?: number | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_aggregated_demand: {
        Args: never
        Returns: {
          age_max: number
          age_min: number
          regions: string[]
          request_count: number
          required_grade: string
          target_week: string
          total_matched: number
          total_volume: number
          weight_max: number
          weight_min: number
        }[]
      }
      get_aggregated_herd_structure: {
        Args: { p_quarter?: number; p_year?: number }
        Returns: {
          avg_confidence: Database["public"]["Enums"]["data_confidence_level"]
          breed: string
          category: Database["public"]["Enums"]["livestock_category"]
          farmer_count: number
          region: string
          total_count: number
        }[]
      }
      get_aggregated_market_intent: {
        Args: {
          p_horizon?: Database["public"]["Enums"]["market_intent_horizon"]
        }
        Returns: {
          avg_confidence: Database["public"]["Enums"]["intent_confidence_level"]
          breed: string
          horizon: Database["public"]["Enums"]["market_intent_horizon"]
          intent_count: number
          region: string
          total_estimated_heads: number
        }[]
      }
      get_all_herd_snapshots_for_admin: {
        Args: never
        Returns: {
          breed: string
          category: Database["public"]["Enums"]["livestock_category"]
          count: number
          created_at: string
          data_confidence_level: Database["public"]["Enums"]["data_confidence_level"]
          farmer_id: string
          farmer_name: string
          farmer_region: string
          id: string
          notes: string
          reporting_period_type: Database["public"]["Enums"]["reporting_period_type"]
          reporting_quarter: number
          reporting_year: number
        }[]
      }
      get_all_market_intents_for_admin: {
        Args: never
        Returns: {
          breed: string
          confidence_level: Database["public"]["Enums"]["intent_confidence_level"]
          created_at: string
          estimated_heads: number
          farmer_id: string
          farmer_name: string
          farmer_region: string
          horizon: Database["public"]["Enums"]["market_intent_horizon"]
          id: string
          non_binding: boolean
          notes: string
          verification_status: string
          verified_at: string
          verified_by: string
        }[]
      }
      get_farmer_indicative_forecast: {
        Args: { p_farmer_id: string }
        Returns: {
          calving_rate: number
          category: string
          current_count: number
          estimated_offspring: number
          reporting_quarter: number
          reporting_year: number
        }[]
      }
      get_indicative_forecast_by_region: {
        Args: { p_quarter?: number; p_year?: number }
        Returns: {
          breeding_cows_count: number
          calving_rate: number
          data_confidence: string
          estimated_calves: number
          farmer_count: number
          region: string
        }[]
      }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
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
      app_role: "admin" | "farmer" | "mpk"
      batch_status: "draft" | "available" | "committed" | "completed"
      data_confidence_level: "self_declared" | "reviewed" | "verified"
      delivery_period: "short_term" | "mid_term" | "long_term"
      execution_status:
        | "matched"
        | "scheduled"
        | "delivered"
        | "confirmed"
        | "settled"
        | "closed"
      farmer_grading: "observer" | "declared_supplier" | "standard_supplier"
      farmer_reliability: "high" | "medium" | "low"
      intent_confidence_level: "low" | "medium" | "high"
      livestock_category:
        | "breeding_cows"
        | "replacement_heifers"
        | "bulls"
        | "calves"
      market_intent_horizon: "3m" | "6m" | "12m"
      matching_status: "active" | "finalized" | "cancelled"
      matching_window_status: "upcoming" | "active" | "locked" | "closed"
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
      pool_request_status:
        | "draft"
        | "submitted"
        | "matching"
        | "partial"
        | "fulfilled"
        | "closed"
        | "cancelled"
      reporting_period_type: "annual" | "quarterly"
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
      app_role: ["admin", "farmer", "mpk"],
      batch_status: ["draft", "available", "committed", "completed"],
      data_confidence_level: ["self_declared", "reviewed", "verified"],
      delivery_period: ["short_term", "mid_term", "long_term"],
      execution_status: [
        "matched",
        "scheduled",
        "delivered",
        "confirmed",
        "settled",
        "closed",
      ],
      farmer_grading: ["observer", "declared_supplier", "standard_supplier"],
      farmer_reliability: ["high", "medium", "low"],
      intent_confidence_level: ["low", "medium", "high"],
      livestock_category: [
        "breeding_cows",
        "replacement_heifers",
        "bulls",
        "calves",
      ],
      market_intent_horizon: ["3m", "6m", "12m"],
      matching_status: ["active", "finalized", "cancelled"],
      matching_window_status: ["upcoming", "active", "locked", "closed"],
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
      pool_request_status: [
        "draft",
        "submitted",
        "matching",
        "partial",
        "fulfilled",
        "closed",
        "cancelled",
      ],
      reporting_period_type: ["annual", "quarterly"],
    },
  },
} as const
