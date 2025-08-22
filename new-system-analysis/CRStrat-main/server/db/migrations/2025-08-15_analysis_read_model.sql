-- Enable pgvector (safe on Supabase & Postgres 15+)
CREATE EXTENSION IF NOT EXISTS vector;

-- Shots per capture
CREATE TABLE IF NOT EXISTS media_shots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  capture_id UUID NOT NULL REFERENCES captures(id) ON DELETE CASCADE,
  start_ms INT NOT NULL,
  end_ms INT NOT NULL,
  score NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_media_shots_capture ON media_shots(capture_id);
CREATE INDEX IF NOT EXISTS idx_media_shots_range ON media_shots(capture_id, start_ms, end_ms);

-- Keyframes sampled per shot
CREATE TABLE IF NOT EXISTS media_keyframes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  capture_id UUID NOT NULL REFERENCES captures(id) ON DELETE CASCADE,
  shot_id UUID NOT NULL REFERENCES media_shots(id) ON DELETE CASCADE,
  ts_ms INT NOT NULL,
  storage_path TEXT NOT NULL,
  blur_score NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_media_keyframes_shot ON media_keyframes(shot_id);

-- Transcript segments (from existing pipeline or provider)
CREATE TABLE IF NOT EXISTS media_transcripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  capture_id UUID NOT NULL REFERENCES captures(id) ON DELETE CASCADE,
  start_ms INT,
  end_ms INT,
  text TEXT NOT NULL,
  speaker TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_media_transcripts_capture ON media_transcripts(capture_id);

-- OCR per keyframe (optional – may be empty until future step)
CREATE TABLE IF NOT EXISTS media_ocr (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  capture_id UUID NOT NULL REFERENCES captures(id) ON DELETE CASCADE,
  keyframe_id UUID REFERENCES media_keyframes(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  bbox JSONB,
  conf NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Simple detections per keyframe (optional – may be empty initially)
CREATE TABLE IF NOT EXISTS media_detections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  capture_id UUID NOT NULL REFERENCES captures(id) ON DELETE CASCADE,
  keyframe_id UUID REFERENCES media_keyframes(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  conf NUMERIC,
  bbox JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Grounded captions per shot (built from transcript + frames evidence)
CREATE TABLE IF NOT EXISTS media_captions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  capture_id UUID NOT NULL REFERENCES captures(id) ON DELETE CASCADE,
  shot_id UUID REFERENCES media_shots(id) ON DELETE CASCADE,
  summary TEXT NOT NULL,
  evidence JSONB,               -- references to keyframes, transcript ranges, detections used
  model TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_media_captions_shot ON media_captions(shot_id);

-- Text embeddings for similarity search (v1: text-only, image embeddings later)
-- Use vector(1536) if using OpenAI text-embedding-3-small; adjust if different model
CREATE TABLE IF NOT EXISTS media_text_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  capture_id UUID NOT NULL REFERENCES captures(id) ON DELETE CASCADE,
  model TEXT NOT NULL,
  dim INT NOT NULL,
  embedding vector(1536) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- Build an IVFFLAT index when there are enough rows; safe to create anyway
-- Note: requires ANALYZE; lists=100 is a sane default
CREATE INDEX IF NOT EXISTS idx_media_text_embeddings_ivfflat
ON media_text_embeddings
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);