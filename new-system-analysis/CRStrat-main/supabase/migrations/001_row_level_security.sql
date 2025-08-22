-- Enable Row Level Security for all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE captures ENABLE ROW LEVEL SECURITY;
ALTER TABLE cultural_moments ENABLE ROW LEVEL SECURITY;
ALTER TABLE dsd_briefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE hypothesis_validations ENABLE ROW LEVEL SECURITY;
ALTER TABLE collective_patterns ENABLE ROW LEVEL SECURITY;

-- Users can only see and update their own profile
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Captures: Users can manage their own captures
CREATE POLICY "Users can view own captures" ON captures
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own captures" ON captures
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own captures" ON captures
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own captures" ON captures
  FOR DELETE USING (auth.uid() = user_id);

-- Cultural Moments: Public read for authenticated users, admin write
CREATE POLICY "Public read cultural moments" ON cultural_moments
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admin can manage cultural moments" ON cultural_moments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- DSD Briefs: Users can manage their own briefs
CREATE POLICY "Users can view own briefs" ON dsd_briefs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own briefs" ON dsd_briefs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own briefs" ON dsd_briefs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own briefs" ON dsd_briefs
  FOR DELETE USING (auth.uid() = user_id);

-- Client Profiles: Users can manage their own client profiles
CREATE POLICY "Users can view own client profiles" ON client_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own client profiles" ON client_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own client profiles" ON client_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own client profiles" ON client_profiles
  FOR DELETE USING (auth.uid() = user_id);

-- Projects: Users can manage their own projects
CREATE POLICY "Users can view own projects" ON projects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own projects" ON projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects" ON projects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects" ON projects
  FOR DELETE USING (auth.uid() = user_id);

-- Hypothesis Validations: Users can manage their own hypotheses
CREATE POLICY "Users can view own hypotheses" ON hypothesis_validations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own hypotheses" ON hypothesis_validations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own hypotheses" ON hypothesis_validations
  FOR UPDATE USING (auth.uid() = user_id);

-- Collective Patterns: Public read for authenticated users
CREATE POLICY "Public read collective patterns" ON collective_patterns
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "System can insert collective patterns" ON collective_patterns
  FOR INSERT TO service_role WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_captures_user_id ON captures(user_id);
CREATE INDEX IF NOT EXISTS idx_captures_created_at ON captures(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_captures_viral_score ON captures(viral_score DESC);
CREATE INDEX IF NOT EXISTS idx_cultural_moments_intensity ON cultural_moments(intensity DESC);
CREATE INDEX IF NOT EXISTS idx_dsd_briefs_user_id ON dsd_briefs(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);