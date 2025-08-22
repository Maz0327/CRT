// Database types for Supabase - Updated to match actual reconciled schema 2025-08-11

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          username: string | null
          password: string
          role: string | null
          onboarding_completed: boolean | null
          tour_completed: boolean | null
          progress_data: Json | null
          google_tokens: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          username?: string | null
          password: string
          role?: string | null
          onboarding_completed?: boolean | null
          tour_completed?: boolean | null
          progress_data?: Json | null
          google_tokens?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          username?: string | null
          password?: string
          role?: string | null
          onboarding_completed?: boolean | null
          tour_completed?: boolean | null
          progress_data?: Json | null
          google_tokens?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      captures: {
        Row: {
          id: string
          user_id: string
          title: string
          content: string
          platform: string | null
          url: string | null
          tags: string[] | null
          viral_score: number | null
          ai_analysis: Json | null
          dsd_tags: string[] | null
          dsd_section: string | null
          predicted_virality: number | null
          actual_virality: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          content: string
          platform?: string | null
          url?: string | null
          tags?: string[] | null
          viral_score?: number | null
          ai_analysis?: Json | null
          dsd_tags?: string[] | null
          dsd_section?: string | null
          predicted_virality?: number | null
          actual_virality?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          content?: string
          platform?: string | null
          url?: string | null
          tags?: string[] | null
          viral_score?: number | null
          ai_analysis?: Json | null
          dsd_tags?: string[] | null
          dsd_section?: string | null
          predicted_virality?: number | null
          actual_virality?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "captures_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      cultural_moments: {
        Row: {
          id: string
          title: string
          description: string
          intensity: number
          platforms: string[] | null
          demographics: string[] | null
          duration: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          intensity: number
          platforms?: string[] | null
          demographics?: string[] | null
          duration?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          intensity?: number
          platforms?: string[] | null
          demographics?: string[] | null
          duration?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      dsd_briefs: {
        Row: {
          id: string
          user_id: string
          client_profile_id: string | null
          title: string
          status: string | null
          define_section: Json | null
          shift_section: Json | null
          deliver_section: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          client_profile_id?: string | null
          title: string
          status?: string | null
          define_section?: Json | null
          shift_section?: Json | null
          deliver_section?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          client_profile_id?: string | null
          title?: string
          status?: string | null
          define_section?: Json | null
          shift_section?: Json | null
          deliver_section?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "dsd_briefs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Convenience type exports
export type User = Database['public']['Tables']['users']['Row']
export type UserInsert = Database['public']['Tables']['users']['Insert']
export type UserUpdate = Database['public']['Tables']['users']['Update']

export type Capture = Database['public']['Tables']['captures']['Row']
export type CaptureInsert = Database['public']['Tables']['captures']['Insert']
export type CaptureUpdate = Database['public']['Tables']['captures']['Update']

export type CulturalMoment = Database['public']['Tables']['cultural_moments']['Row']
export type CulturalMomentInsert = Database['public']['Tables']['cultural_moments']['Insert']
export type CulturalMomentUpdate = Database['public']['Tables']['cultural_moments']['Update']

export type DsdBrief = Database['public']['Tables']['dsd_briefs']['Row']
export type DsdBriefInsert = Database['public']['Tables']['dsd_briefs']['Insert']
export type DsdBriefUpdate = Database['public']['Tables']['dsd_briefs']['Update']