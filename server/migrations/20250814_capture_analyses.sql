-- Migration: Add capture_analyses table for Task Block #5
-- Date: 2025-08-14
-- Description: Table to store per-capture analysis snapshots with proper RLS

-- Table to store per-capture analysis snapshots
CREATE TABLE IF NOT EXISTS public.capture_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  capture_id UUID NOT NULL REFERENCES public.captures(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('google','openai','mock')),
  mode TEXT NOT NULL CHECK (mode IN ('sync','deep')),
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('queued','processing','completed','failed')),
  summary TEXT,
  labels JSONB DEFAULT '[]'::jsonb,        -- normalized tags/labels [{name, conf, source}], can be empty array
  ocr JSONB DEFAULT '[]'::jsonb,           -- text blocks w/ positions
  transcript TEXT,                         -- for videos (ASR)
  keyframes JSONB DEFAULT '[]'::jsonb,     -- [{ts, url}] if we extract thumbnails
  raw JSONB,                               -- raw provider response (trimmed)
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_capture_analyses_capture_id ON public.capture_analyses(capture_id);
CREATE INDEX IF NOT EXISTS idx_capture_analyses_created_at ON public.capture_analyses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_capture_analyses_status ON public.capture_analyses(status);
CREATE INDEX IF NOT EXISTS idx_capture_analyses_provider ON public.capture_analyses(provider);

-- Enable Row Level Security
ALTER TABLE public.capture_analyses ENABLE ROW LEVEL SECURITY;

-- Policies: user can see only analyses for their own captures
DROP POLICY IF EXISTS "read own capture analyses" ON public.capture_analyses;
CREATE POLICY "read own capture analyses"
ON public.capture_analyses FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.captures c
    WHERE c.id = capture_id AND c.user_id = auth.uid()
  )
);

-- Only server-side service role writes; no direct client writes
DROP POLICY IF EXISTS "no client writes to capture_analyses" ON public.capture_analyses;
CREATE POLICY "no client writes to capture_analyses"
ON public.capture_analyses FOR ALL
TO authenticated
USING (FALSE) WITH CHECK (FALSE);

-- Grant access to service role for server operations
GRANT ALL ON public.capture_analyses TO service_role;