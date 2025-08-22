import { z } from 'zod';

export const EvidenceSchema = z.object({
  frames: z.array(z.string()).optional(),     // storage paths or data URLs
  asr_excerpt: z.string().optional(),
  model_notes: z.string().optional()
});

export const ShotSchema = z.object({
  start: z.number().nonnegative().optional(),
  end: z.number().nonnegative().optional(),
  keyframes: z.array(z.number()).optional(),
  labels: z.object({
    objects: z.array(z.object({ name: z.string(), conf: z.number().optional() })).optional(),
    actions: z.array(z.object({ name: z.string(), conf: z.number().optional() })).optional(),
  }).optional(),
  ocr: z.array(z.object({ text: z.string(), bbox: z.any().optional() })).optional(),
  audio_events: z.array(z.object({ name: z.string(), conf: z.number().optional() })).optional(),
  description: z.string().optional(),
  evidence: EvidenceSchema.optional()
});

export const AnalysisResultSchema = z.object({
  summary: z.string().optional(),
  shots: z.array(ShotSchema),
  labels: z.array(z.object({ name: z.string(), kind: z.string().optional(), conf: z.number().optional() })).optional(),
  ocr: z.array(z.object({ text: z.string() })).optional(),
  asr: z.array(z.object({ text: z.string(), start: z.number().optional(), end: z.number().optional() })).optional(),
  meta: z.object({
    provider: z.string(),
    model: z.string().optional(),
    duration_ms: z.number().optional()
  }).optional()
});
export type AnalysisResult = z.infer<typeof AnalysisResultSchema>;