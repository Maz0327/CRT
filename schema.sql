-- Complete Supabase Database Schema Export
-- Generated: August 11, 2025
-- Database: Content Radar Strategic Intelligence Platform

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- TABLE DEFINITIONS
-- ============================================================================

-- Analysis Results Table
CREATE TABLE public.analysis_results (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    capture_id uuid NOT NULL,
    fact text,
    observation text,
    insight text,
    human_truth text,
    cultural_moment text,
    tier text NOT NULL,
    model text,
    processing_time integer,
    created_at timestamp with time zone DEFAULT now(),
    PRIMARY KEY (id)
);

-- Analytics Data Table
CREATE TABLE public.analytics_data (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    project_id uuid,
    metric_type text NOT NULL,
    metric_value numeric NOT NULL,
    recorded_at timestamp with time zone DEFAULT now(),
    timeframe text DEFAULT 'daily'::text,
    dimensions jsonb DEFAULT '{}'::jsonb,
    aggregated_data jsonb DEFAULT '{}'::jsonb,
    PRIMARY KEY (id)
);

-- Annotations Table
CREATE TABLE public.annotations (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    capture_id uuid NOT NULL,
    user_id uuid NOT NULL,
    canvas_data jsonb NOT NULL,
    annotation_type text DEFAULT 'canvas'::text,
    coordinates jsonb,
    version integer DEFAULT 1,
    parent_id uuid,
    is_shared boolean DEFAULT false,
    collaborators jsonb DEFAULT '[]'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    PRIMARY KEY (id)
);

-- Brief Captures Table
CREATE TABLE public.brief_captures (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    brief_id uuid NOT NULL,
    capture_id uuid NOT NULL,
    section text,
    order_index integer DEFAULT 0,
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    PRIMARY KEY (id)
);

-- Briefs Table
CREATE TABLE public.briefs (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    project_id uuid NOT NULL,
    title text NOT NULL,
    template_type text DEFAULT 'jimmy-johns'::text,
    description text,
    status text DEFAULT 'draft'::text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    user_id uuid,
    PRIMARY KEY (id)
);

-- Captures Table (Core Content Storage)
CREATE TABLE public.captures (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    title text NOT NULL,
    content text NOT NULL,
    platform text,
    url text,
    tags text[],
    viral_score integer,
    ai_analysis jsonb,
    dsd_tags text[],
    dsd_section text,
    predicted_virality numeric,
    actual_virality numeric,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    PRIMARY KEY (id)
);

-- Client Profiles Table
CREATE TABLE public.client_profiles (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    name text NOT NULL,
    brand_voice text,
    target_audience jsonb DEFAULT '{}'::jsonb,
    channel_preferences jsonb DEFAULT '{}'::jsonb,
    no_go_zones jsonb DEFAULT '[]'::jsonb,
    competitive_landscape jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    PRIMARY KEY (id)
);

-- Collective Patterns Table
CREATE TABLE public.collective_patterns (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    pattern_type text NOT NULL,
    confidence numeric DEFAULT 0.00,
    contributing_users integer DEFAULT 0,
    contributing_captures jsonb DEFAULT '[]'::jsonb,
    first_detected timestamp with time zone DEFAULT now(),
    last_updated timestamp with time zone DEFAULT now(),
    validation_count integer DEFAULT 0,
    pattern_data jsonb DEFAULT '{}'::jsonb,
    is_active boolean DEFAULT true,
    PRIMARY KEY (id)
);

-- Content Radar Table
CREATE TABLE public.content_radar (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    title text NOT NULL,
    url text NOT NULL,
    content text,
    summary text,
    hook1 text,
    hook2 text,
    category text NOT NULL,
    platform text NOT NULL,
    viral_score numeric DEFAULT 0.0,
    engagement integer DEFAULT 0,
    growth_rate numeric DEFAULT 0.0,
    metadata jsonb DEFAULT '{}'::jsonb,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    PRIMARY KEY (id)
);

-- Cultural Moments Table
CREATE TABLE public.cultural_moments (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    title text NOT NULL,
    description text NOT NULL,
    intensity integer NOT NULL,
    platforms text[],
    demographics text[],
    duration text,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    PRIMARY KEY (id)
);

-- DSD Briefs Table (Define-Shift-Deliver)
CREATE TABLE public.dsd_briefs (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    client_profile_id uuid,
    title text NOT NULL,
    status text,
    define_section jsonb,
    shift_section jsonb,
    deliver_section jsonb,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    PRIMARY KEY (id)
);

-- Hypothesis Validations Table
CREATE TABLE public.hypothesis_validations (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    original_capture_id uuid NOT NULL,
    validating_user_id uuid NOT NULL,
    original_prediction jsonb NOT NULL,
    actual_outcome jsonb NOT NULL,
    accuracy_score numeric DEFAULT 0.00,
    supporting_evidence text,
    validated_at timestamp with time zone DEFAULT now(),
    PRIMARY KEY (id)
);

-- Jobs Table (Job Queue System)
CREATE TABLE public.jobs (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    type text NOT NULL,
    payload jsonb NOT NULL,
    status text NOT NULL DEFAULT 'queued'::text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    result jsonb,
    error text,
    attempts integer DEFAULT 0,
    max_attempts integer DEFAULT 3,
    started_at timestamp with time zone,
    finished_at timestamp with time zone,
    user_id uuid,
    PRIMARY KEY (id)
);

-- Projects Table
CREATE TABLE public.projects (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL,
    name text NOT NULL,
    description text,
    brief_template text DEFAULT 'jimmy-johns'::text,
    status text DEFAULT 'active'::text,
    client text,
    deadline timestamp with time zone,
    tags jsonb DEFAULT '[]'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    settings jsonb DEFAULT '{}'::jsonb,
    PRIMARY KEY (id)
);

-- Scan History Table
CREATE TABLE public.scan_history (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    platform text NOT NULL,
    items_found integer DEFAULT 0,
    error_message text,
    scan_duration integer,
    created_at timestamp with time zone DEFAULT now(),
    PRIMARY KEY (id)
);

-- Session Tables (Authentication)
CREATE TABLE public.session (
    sid character varying NOT NULL,
    sess json NOT NULL,
    expire timestamp without time zone NOT NULL,
    PRIMARY KEY (sid)
);

CREATE TABLE public.user_sessions (
    sid character varying NOT NULL,
    sess json NOT NULL,
    expire timestamp without time zone NOT NULL,
    PRIMARY KEY (sid)
);

-- User Settings Table
CREATE TABLE public.user_settings (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    extension_settings jsonb DEFAULT '{}'::jsonb,
    dashboard_settings jsonb DEFAULT '{}'::jsonb,
    search_settings jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    PRIMARY KEY (id)
);

-- Users Table (Authentication & User Data)
CREATE TABLE public.users (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    instance_id uuid,
    email text NOT NULL,
    username text,
    aud character varying(255),
    password text NOT NULL,
    role character varying(255) DEFAULT 'user'::text,
    encrypted_password character varying(255),
    onboarding_completed boolean DEFAULT false,
    email_confirmed_at timestamp with time zone,
    tour_completed boolean DEFAULT false,
    progress_data jsonb DEFAULT '{}'::jsonb,
    invited_at timestamp with time zone,
    google_tokens jsonb,
    confirmation_token character varying(255),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    confirmation_sent_at timestamp with time zone,
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    recovery_token character varying(255),
    recovery_sent_at timestamp with time zone,
    email_change_token_new character varying(255),
    email_change character varying(255),
    email_change_sent_at timestamp with time zone,
    last_sign_in_at timestamp with time zone,
    raw_app_meta_data jsonb,
    raw_user_meta_data jsonb,
    is_super_admin boolean,
    phone text DEFAULT NULL,
    phone_confirmed_at timestamp with time zone,
    phone_change text DEFAULT ''::character varying,
    phone_change_token character varying(255) DEFAULT ''::character varying,
    phone_change_sent_at timestamp with time zone,
    confirmed_at timestamp with time zone,
    email_change_token_current character varying(255) DEFAULT ''::character varying,
    email_change_confirm_status smallint DEFAULT 0,
    banned_until timestamp with time zone,
    reauthentication_token character varying(255) DEFAULT ''::character varying,
    reauthentication_sent_at timestamp with time zone,
    is_sso_user boolean NOT NULL DEFAULT false,
    deleted_at timestamp with time zone,
    is_anonymous boolean NOT NULL DEFAULT false,
    PRIMARY KEY (id)
);

-- ============================================================================
-- FOREIGN KEY CONSTRAINTS
-- ============================================================================

-- Analysis Results Foreign Keys
ALTER TABLE ONLY public.analysis_results 
    ADD CONSTRAINT analysis_results_capture_id_fkey 
    FOREIGN KEY (capture_id) REFERENCES public.captures(id) ON DELETE CASCADE;

-- Analytics Data Foreign Keys
ALTER TABLE ONLY public.analytics_data 
    ADD CONSTRAINT analytics_data_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.analytics_data 
    ADD CONSTRAINT analytics_data_project_id_fkey 
    FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;

-- Annotations Foreign Keys
ALTER TABLE ONLY public.annotations 
    ADD CONSTRAINT annotations_capture_id_fkey 
    FOREIGN KEY (capture_id) REFERENCES public.captures(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.annotations 
    ADD CONSTRAINT annotations_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- Brief Captures Foreign Keys
ALTER TABLE ONLY public.brief_captures 
    ADD CONSTRAINT brief_captures_brief_id_fkey 
    FOREIGN KEY (brief_id) REFERENCES public.briefs(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.brief_captures 
    ADD CONSTRAINT brief_captures_capture_id_fkey 
    FOREIGN KEY (capture_id) REFERENCES public.captures(id) ON DELETE CASCADE;

-- Briefs Foreign Keys
ALTER TABLE ONLY public.briefs 
    ADD CONSTRAINT briefs_project_id_fkey 
    FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.briefs 
    ADD CONSTRAINT briefs_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;

-- Captures Foreign Keys
ALTER TABLE ONLY public.captures 
    ADD CONSTRAINT captures_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- Client Profiles Foreign Keys
ALTER TABLE ONLY public.client_profiles 
    ADD CONSTRAINT client_profiles_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- DSD Briefs Foreign Keys
ALTER TABLE ONLY public.dsd_briefs 
    ADD CONSTRAINT dsd_briefs_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.dsd_briefs 
    ADD CONSTRAINT dsd_briefs_client_profile_id_fkey 
    FOREIGN KEY (client_profile_id) REFERENCES public.client_profiles(id) ON DELETE SET NULL;

-- Hypothesis Validations Foreign Keys
ALTER TABLE ONLY public.hypothesis_validations 
    ADD CONSTRAINT hypothesis_validations_original_capture_id_fkey 
    FOREIGN KEY (original_capture_id) REFERENCES public.captures(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.hypothesis_validations 
    ADD CONSTRAINT hypothesis_validations_validating_user_id_fkey 
    FOREIGN KEY (validating_user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- Jobs Foreign Keys
ALTER TABLE ONLY public.jobs 
    ADD CONSTRAINT jobs_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;

-- Projects Foreign Keys
ALTER TABLE ONLY public.projects 
    ADD CONSTRAINT projects_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- User Settings Foreign Keys
ALTER TABLE ONLY public.user_settings 
    ADD CONSTRAINT user_settings_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Primary Key Indexes (automatically created, listed for completeness)
CREATE UNIQUE INDEX analysis_results_pkey ON public.analysis_results USING btree (id);
CREATE UNIQUE INDEX analytics_data_pkey ON public.analytics_data USING btree (id);
CREATE UNIQUE INDEX annotations_pkey ON public.annotations USING btree (id);
CREATE UNIQUE INDEX brief_captures_pkey ON public.brief_captures USING btree (id);
CREATE UNIQUE INDEX briefs_pkey ON public.briefs USING btree (id);
CREATE UNIQUE INDEX captures_pkey ON public.captures USING btree (id);
CREATE UNIQUE INDEX client_profiles_pkey ON public.client_profiles USING btree (id);
CREATE UNIQUE INDEX collective_patterns_pkey ON public.collective_patterns USING btree (id);
CREATE UNIQUE INDEX content_radar_pkey ON public.content_radar USING btree (id);
CREATE UNIQUE INDEX cultural_moments_pkey ON public.cultural_moments USING btree (id);
CREATE UNIQUE INDEX dsd_briefs_pkey ON public.dsd_briefs USING btree (id);
CREATE UNIQUE INDEX hypothesis_validations_pkey ON public.hypothesis_validations USING btree (id);
CREATE UNIQUE INDEX jobs_pkey ON public.jobs USING btree (id);
CREATE UNIQUE INDEX projects_pkey ON public.projects USING btree (id);
CREATE UNIQUE INDEX scan_history_pkey ON public.scan_history USING btree (id);
CREATE UNIQUE INDEX session_pkey ON public.session USING btree (sid);
CREATE UNIQUE INDEX user_sessions_pkey ON public.user_sessions USING btree (sid);
CREATE UNIQUE INDEX user_settings_pkey ON public.user_settings USING btree (id);
CREATE UNIQUE INDEX users_pkey ON public.users USING btree (id);

-- Performance Indexes
CREATE INDEX idx_captures_user_id ON public.captures USING btree (user_id);
CREATE INDEX idx_captures_platform ON public.captures USING btree (platform);
CREATE INDEX idx_captures_created_at ON public.captures USING btree (created_at DESC);
CREATE INDEX idx_captures_viral_score ON public.captures USING btree (viral_score DESC);

CREATE INDEX idx_cultural_moments_intensity ON public.cultural_moments USING btree (intensity DESC);
CREATE INDEX idx_cultural_moments_created_at ON public.cultural_moments USING btree (created_at DESC);

CREATE INDEX idx_dsd_briefs_user_id ON public.dsd_briefs USING btree (user_id);
CREATE INDEX idx_dsd_briefs_status ON public.dsd_briefs USING btree (status);
CREATE INDEX idx_dsd_briefs_created_at ON public.dsd_briefs USING btree (created_at DESC);

CREATE INDEX idx_jobs_status ON public.jobs USING btree (status);
CREATE INDEX idx_jobs_type ON public.jobs USING btree (type);
CREATE INDEX idx_jobs_created_at ON public.jobs USING btree (created_at);
CREATE INDEX idx_jobs_user_id ON public.jobs USING btree (user_id);

CREATE INDEX idx_projects_user_id ON public.projects USING btree (user_id);
CREATE INDEX idx_projects_status ON public.projects USING btree (status);

CREATE INDEX idx_analytics_data_user_id ON public.analytics_data USING btree (user_id);
CREATE INDEX idx_analytics_data_recorded_at ON public.analytics_data USING btree (recorded_at DESC);

CREATE INDEX idx_session_expire ON public.session USING btree (expire);
CREATE INDEX idx_user_sessions_expire ON public.user_sessions USING btree (expire);

-- ============================================================================
-- UNIQUE CONSTRAINTS
-- ============================================================================

ALTER TABLE ONLY public.users 
    ADD CONSTRAINT users_email_unique UNIQUE (email);

ALTER TABLE ONLY public.user_settings 
    ADD CONSTRAINT user_settings_user_id_unique UNIQUE (user_id);

-- ============================================================================
-- CHECK CONSTRAINTS
-- ============================================================================

ALTER TABLE ONLY public.cultural_moments 
    ADD CONSTRAINT cultural_moments_intensity_check 
    CHECK (intensity >= 1 AND intensity <= 10);

ALTER TABLE ONLY public.captures 
    ADD CONSTRAINT captures_viral_score_check 
    CHECK (viral_score >= 0 AND viral_score <= 100);

ALTER TABLE ONLY public.collective_patterns 
    ADD CONSTRAINT collective_patterns_confidence_check 
    CHECK (confidence >= 0.00 AND confidence <= 1.00);

ALTER TABLE ONLY public.hypothesis_validations 
    ADD CONSTRAINT hypothesis_validations_accuracy_score_check 
    CHECK (accuracy_score >= 0.00 AND accuracy_score <= 1.00);

ALTER TABLE ONLY public.jobs 
    ADD CONSTRAINT jobs_attempts_check 
    CHECK (attempts >= 0);

ALTER TABLE ONLY public.jobs 
    ADD CONSTRAINT jobs_max_attempts_check 
    CHECK (max_attempts > 0);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Updated At Trigger Function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
    RETURNS trigger
    LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- Apply Updated At Triggers
CREATE TRIGGER update_captures_updated_at 
    BEFORE UPDATE ON public.captures 
    FOR EACH ROW 
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cultural_moments_updated_at 
    BEFORE UPDATE ON public.cultural_moments 
    FOR EACH ROW 
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_dsd_briefs_updated_at 
    BEFORE UPDATE ON public.dsd_briefs 
    FOR EACH ROW 
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_briefs_updated_at 
    BEFORE UPDATE ON public.briefs 
    FOR EACH ROW 
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_projects_updated_at 
    BEFORE UPDATE ON public.projects 
    FOR EACH ROW 
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_client_profiles_updated_at 
    BEFORE UPDATE ON public.client_profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at 
    BEFORE UPDATE ON public.user_settings 
    FOR EACH ROW 
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON public.users 
    FOR EACH ROW 
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_annotations_updated_at 
    BEFORE UPDATE ON public.annotations 
    FOR EACH ROW 
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_content_radar_updated_at 
    BEFORE UPDATE ON public.content_radar 
    FOR EACH ROW 
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_collective_patterns_last_updated 
    BEFORE UPDATE ON public.collective_patterns 
    FOR EACH ROW 
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at 
    BEFORE UPDATE ON public.jobs 
    FOR EACH ROW 
    EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.captures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cultural_moments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dsd_briefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.briefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_profiles ENABLE row level security;
ALTER TABLE public.analytics_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.annotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hypothesis_validations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- User-specific RLS policies (users can only access their own data)
CREATE POLICY "Users can view own captures" ON public.captures 
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own captures" ON public.captures 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own captures" ON public.captures 
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own captures" ON public.captures 
    FOR DELETE USING (auth.uid() = user_id);

-- Similar policies for other user-specific tables
CREATE POLICY "Users can view own briefs" ON public.dsd_briefs 
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own briefs" ON public.dsd_briefs 
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own projects" ON public.projects 
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own projects" ON public.projects 
    FOR ALL USING (auth.uid() = user_id);

-- Public read access for cultural moments (shared intelligence)
CREATE POLICY "Cultural moments are publicly readable" ON public.cultural_moments 
    FOR SELECT TO authenticated USING (true);

-- ============================================================================
-- COMMENTS (Documentation)
-- ============================================================================

COMMENT ON TABLE public.captures IS 'Core content storage with DSD tagging and viral analysis';
COMMENT ON TABLE public.cultural_moments IS 'Detected cultural trends and moments with intensity scoring';
COMMENT ON TABLE public.dsd_briefs IS 'Strategic briefs using Define-Shift-Deliver methodology';
COMMENT ON TABLE public.jobs IS 'Persistent job queue for background processing';
COMMENT ON TABLE public.analysis_results IS 'AI-powered truth analysis framework results';
COMMENT ON TABLE public.collective_patterns IS 'Anonymized pattern recognition across user base';
COMMENT ON TABLE public.hypothesis_validations IS 'Tracking and validation of predictions';

COMMENT ON COLUMN public.captures.dsd_tags IS 'Tags for Define-Shift-Deliver brief assembly';
COMMENT ON COLUMN public.captures.viral_score IS 'AI-predicted viral potential (0-100)';
COMMENT ON COLUMN public.cultural_moments.intensity IS 'Cultural moment intensity scale (1-10)';
COMMENT ON COLUMN public.dsd_briefs.define_section IS 'JSONB structure for Define section content';
COMMENT ON COLUMN public.dsd_briefs.shift_section IS 'JSONB structure for Shift section content';
COMMENT ON COLUMN public.dsd_briefs.deliver_section IS 'JSONB structure for Deliver section content';

-- ============================================================================
-- FUNCTIONS (Custom Business Logic)
-- ============================================================================

-- Function to calculate viral trend score
CREATE OR REPLACE FUNCTION public.calculate_viral_trend_score(
    viral_scores integer[],
    time_window interval DEFAULT '7 days'::interval
) RETURNS numeric
    LANGUAGE plpgsql
    STABLE
AS $$
DECLARE
    avg_score numeric;
    trend_factor numeric;
BEGIN
    -- Calculate average viral score
    SELECT AVG(score) INTO avg_score 
    FROM unnest(viral_scores) AS score;
    
    -- Apply trend multiplier based on recency
    trend_factor := CASE 
        WHEN time_window <= '1 day'::interval THEN 1.5
        WHEN time_window <= '3 days'::interval THEN 1.2
        WHEN time_window <= '7 days'::interval THEN 1.0
        ELSE 0.8
    END;
    
    RETURN ROUND(avg_score * trend_factor, 2);
END;
$$;

-- Function to get user's trending captures
CREATE OR REPLACE FUNCTION public.get_trending_captures(
    p_user_id uuid,
    p_limit integer DEFAULT 10
) RETURNS TABLE (
    id uuid,
    title text,
    viral_score integer,
    platform text,
    created_at timestamp with time zone
)
    LANGUAGE plpgsql
    SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.title,
        c.viral_score,
        c.platform,
        c.created_at
    FROM public.captures c
    WHERE c.user_id = p_user_id 
        AND c.viral_score IS NOT NULL
    ORDER BY c.viral_score DESC, c.created_at DESC
    LIMIT p_limit;
END;
$$;

-- ============================================================================
-- VIEWS (Aggregated Data)
-- ============================================================================

-- View for dashboard statistics
CREATE VIEW public.dashboard_stats AS
SELECT 
    u.id as user_id,
    COUNT(DISTINCT c.id) as total_captures,
    COUNT(DISTINCT db.id) as total_briefs,
    AVG(c.viral_score) as avg_viral_score,
    COUNT(DISTINCT p.id) as active_projects,
    COUNT(DISTINCT CASE WHEN c.created_at >= NOW() - INTERVAL '7 days' THEN c.id END) as recent_captures
FROM public.users u
LEFT JOIN public.captures c ON c.user_id = u.id
LEFT JOIN public.dsd_briefs db ON db.user_id = u.id
LEFT JOIN public.projects p ON p.user_id = u.id AND p.status = 'active'
GROUP BY u.id;

-- View for cultural trend analysis
CREATE VIEW public.cultural_trend_analysis AS
SELECT 
    cm.id,
    cm.title,
    cm.intensity,
    cm.platforms,
    cm.demographics,
    COUNT(c.id) as related_captures,
    AVG(c.viral_score) as avg_viral_score
FROM public.cultural_moments cm
LEFT JOIN public.captures c ON c.ai_analysis @> jsonb_build_object('cultural_moment', cm.title)
GROUP BY cm.id, cm.title, cm.intensity, cm.platforms, cm.demographics;

-- ============================================================================
-- FINAL GRANTS AND PERMISSIONS
-- ============================================================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO authenticated, anon;

-- Grant permissions on tables
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

-- Grant permissions on sequences
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant execute permissions on functions
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================