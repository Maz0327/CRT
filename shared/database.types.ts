// Database types for Supabase - auto-generated types would go here
// For now, we'll define the essential types based on your schema

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
          project_id: string | null
          image_url: string | null
          image_thumb_url: string | null
          selection_rect: Json | null
          ocr_text: string | null
          source_author: string | null
          source_posted_at: string | null
          source_metrics: Json | null
          analysis_status: string | null
          analysis_run_id: string | null
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
          project_id?: string | null
          image_url?: string | null
          image_thumb_url?: string | null
          selection_rect?: Json | null
          ocr_text?: string | null
          source_author?: string | null
          source_posted_at?: string | null
          source_metrics?: Json | null
          analysis_status?: string | null
          analysis_run_id?: string | null
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
          project_id?: string | null
          image_url?: string | null
          image_thumb_url?: string | null
          selection_rect?: Json | null
          ocr_text?: string | null
          source_author?: string | null
          source_posted_at?: string | null
          source_metrics?: Json | null
          analysis_status?: string | null
          analysis_run_id?: string | null
          created_at?: string
          updated_at?: string
        }
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
      }
      projects: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          brief_template: string | null
          status: string | null
          client: string | null
          deadline: string | null
          tags: Json | null
          settings: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          brief_template?: string | null
          status?: string | null
          client?: string | null
          deadline?: string | null
          tags?: Json | null
          settings?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          brief_template?: string | null
          status?: string | null
          client?: string | null
          deadline?: string | null
          tags?: Json | null
          settings?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      user_feeds: {
        Row: {
          id: string
          user_id: string
          project_id: string | null
          feed_url: string
          title: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          project_id?: string | null
          feed_url: string
          title?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          project_id?: string | null
          feed_url?: string
          title?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      jobs: {
        Row: {
          id: string
          type: string
          payload: Json
          status: string
          created_at: string
          updated_at: string
          result: Json | null
          error: string | null
          attempts: number
          max_attempts: number
          started_at: string | null
          finished_at: string | null
          user_id: string | null
        }
        Insert: {
          id?: string
          type: string
          payload: Json
          status?: string
          created_at?: string
          updated_at?: string
          result?: Json | null
          error?: string | null
          attempts?: number
          max_attempts?: number
          started_at?: string | null
          finished_at?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          type?: string
          payload?: Json
          status?: string
          created_at?: string
          updated_at?: string
          result?: Json | null
          error?: string | null
          attempts?: number
          max_attempts?: number
          started_at?: string | null
          finished_at?: string | null
          user_id?: string | null
        }
      }
      client_profiles: {
        Row: {
          id: string
          user_id: string
          name: string
          brand_voice: string | null
          target_audience: Json
          channel_preferences: Json
          no_go_zones: Json
          competitive_landscape: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          brand_voice?: string | null
          target_audience?: Json
          channel_preferences?: Json
          no_go_zones?: Json
          competitive_landscape?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          brand_voice?: string | null
          target_audience?: Json
          channel_preferences?: Json
          no_go_zones?: Json
          competitive_landscape?: Json
          created_at?: string
          updated_at?: string
        }
      }
      content_radar: {
        Row: {
          id: string
          title: string
          url: string
          content: string | null
          summary: string | null
          hook1: string | null
          hook2: string | null
          category: string
          platform: string
          viral_score: number
          engagement: number
          growth_rate: number
          metadata: Json
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          url: string
          content?: string | null
          summary?: string | null
          hook1?: string | null
          hook2?: string | null
          category: string
          platform: string
          viral_score?: number
          engagement?: number
          growth_rate?: number
          metadata?: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          url?: string
          content?: string | null
          summary?: string | null
          hook1?: string | null
          hook2?: string | null
          category?: string
          platform?: string
          viral_score?: number
          engagement?: number
          growth_rate?: number
          metadata?: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      analytics_data: {
        Row: {
          id: string
          user_id: string
          project_id: string | null
          metric_type: string
          metric_value: number
          recorded_at: string
          timeframe: string
          dimensions: Json
          aggregated_data: Json
        }
        Insert: {
          id?: string
          user_id: string
          project_id?: string | null
          metric_type: string
          metric_value: number
          recorded_at?: string
          timeframe?: string
          dimensions?: Json
          aggregated_data?: Json
        }
        Update: {
          id?: string
          user_id?: string
          project_id?: string | null
          metric_type?: string
          metric_value?: number
          recorded_at?: string
          timeframe?: string
          dimensions?: Json
          aggregated_data?: Json
        }
      }
      extension_tokens: {
        Row: {
          id: string
          user_id: string
          name: string
          token_hash: string
          created_at: string
          last_used_at: string | null
          revoked: boolean
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          token_hash: string
          created_at?: string
          last_used_at?: string | null
          revoked?: boolean
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          token_hash?: string
          created_at?: string
          last_used_at?: string | null
          revoked?: boolean
        }
      }
      analysis_jobs: {
        Row: {
          id: string
          capture_id: string
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          capture_id: string
          status: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          capture_id?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
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
  }
}

// Export commonly used types
export type CaptureRow = Database['public']['Tables']['captures']['Row'];
export type CaptureInsert = Database['public']['Tables']['captures']['Insert'];
export type CaptureUpdate = Database['public']['Tables']['captures']['Update'];

export type ProjectRow = Database['public']['Tables']['projects']['Row'];
export type ProjectInsert = Database['public']['Tables']['projects']['Insert'];
export type ProjectUpdate = Database['public']['Tables']['projects']['Update'];

export type BriefRow = Database['public']['Tables']['dsd_briefs']['Row'];
export type BriefInsert = Database['public']['Tables']['dsd_briefs']['Insert'];
export type BriefUpdate = Database['public']['Tables']['dsd_briefs']['Update'];

export type MomentRow = Database['public']['Tables']['cultural_moments']['Row'];
export type MomentInsert = Database['public']['Tables']['cultural_moments']['Insert'];
export type MomentUpdate = Database['public']['Tables']['cultural_moments']['Update'];

export type ExtensionTokenRow = Database['public']['Tables']['extension_tokens']['Row'];
export type ExtensionTokenInsert = Database['public']['Tables']['extension_tokens']['Insert'];
export type ExtensionTokenUpdate = Database['public']['Tables']['extension_tokens']['Update'];

export type AnalysisJobRow = Database['public']['Tables']['analysis_jobs']['Row'];
export type AnalysisJobInsert = Database['public']['Tables']['analysis_jobs']['Insert'];
export type AnalysisJobUpdate = Database['public']['Tables']['analysis_jobs']['Update'];