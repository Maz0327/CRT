// Supabase Schema - Clean database design for Content Radar Platform
// Strategic Intelligence and Truth Analysis Framework
// Fixed: snake_case columns mapped to camelCase TypeScript properties
import { pgTable, varchar, text, timestamp, jsonb, boolean, integer, decimal, index, uuid } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// 1. Users table - Supabase Auth integration
export const users = pgTable("users", {
  id: uuid("id").primaryKey().default(sql`uuid_generate_v4()`),
  email: text("email").notNull().unique(),
  username: text("username").unique(),
  password: text("password").notNull(),
  role: text("role").default("user"),
  onboardingCompleted: boolean("onboarding_completed").default(false),
  tourCompleted: boolean("tour_completed").default(false),
  progressData: jsonb("progress_data").default('{}'),
  googleTokens: jsonb("google_tokens"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
}, (table) => ({
  emailIdx: index("idx_users_email").on(table.email),
}));

// 2. Projects table - Strategic campaigns and initiatives
export const projects = pgTable("projects", {
  id: uuid("id").primaryKey().default(sql`uuid_generate_v4()`),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  briefTemplate: text("brief_template").default("jimmy-johns"),
  status: text("status").default("active"),
  client: text("client"),
  deadline: timestamp("deadline", { withTimezone: true }),
  tags: jsonb("tags").default('[]'),
  settings: jsonb("settings").default('{}'), // Project-specific settings
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
}, (table) => ({
  userIdx: index("idx_projects_user_id").on(table.userId),
  statusIdx: index("idx_projects_status").on(table.status),
}));

// 3. Captures table - Content captured via Chrome Extension
export const captures = pgTable("captures", {
  id: uuid("id").primaryKey().default(sql`uuid_generate_v4()`),
  projectId: uuid("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull().references(() => users.id),
  
  // Capture metadata
  type: text("type").notNull(),
  title: text("title"),
  content: text("content"),
  url: text("url"),
  platform: text("platform"),
  
  // Enhanced content fields
  screenshotUrl: text("screenshot_url"),
  summary: text("summary"),
  tags: jsonb("tags").default('[]'),
  metadata: jsonb("metadata").default('{}'),
  
  // Truth Analysis Framework
  truthAnalysis: jsonb("truth_analysis").$type<{
    fact: { claims: string[]; sources: string[]; verificationStatus: string; confidence: number };
    observation: { behaviorPatterns: string[]; audienceSignals: any; contextualFactors: string[] };
    insight: { strategicImplications: string[]; opportunityMapping: any; riskAssessment: any };
    humanTruth: { emotionalUndercurrent: any; culturalContext: any; psychologicalDrivers: any };
  }>(),
  analysisStatus: text("analysis_status").default("pending"),
  
  // Google AI Analysis
  googleAnalysis: jsonb("google_analysis").$type<{
    vision?: {
      brandElements: any[];
      objectsDetected: any[];
      textContent: string[];
      dominantColors: any[];
      faces: any[];
      safetyAnalysis: any;
      strategicInsights: string[];
    };
    nlp?: {
      sentiment: {
        score: number;
        magnitude: number;
        label: string;
        confidence: number;
      };
      entities: any[];
      keyPhrases: any[];
      strategicInsights: string[];
    };
  }>(),
  
  // DSD Signal Drop Integration
  dsdTags: jsonb("dsd_tags").default('{}').$type<{
    lifeLens?: boolean;
    rawBehavior?: boolean;
    channelVibes?: boolean;
    strategicIntelligence?: boolean;
    humanTruth?: boolean;
    culturalMoment?: boolean;
    creativeTerritory?: boolean;
    executionIdea?: boolean;
    attentionValue?: boolean;
  }>(),
  dsdSection: text("dsd_section"), // 'define' | 'shift' | 'deliver'
  
  // Strategic Intelligence Features
  viralScore: integer("viral_score").default(0), // 0-100 viral potential
  culturalResonance: jsonb("cultural_resonance").default('{}').$type<{
    crossGenerational?: boolean;
    memePotential?: number; // 0-100
    counterNarrative?: string;
    tribalSignificance?: string;
  }>(),
  prediction: jsonb("prediction").$type<{
    willGoViral?: boolean;
    expectedReach?: number;
    campaignAngle?: string;
    confidence?: number;
  }>(),
  outcome: jsonb("outcome").$type<{
    wentViral?: boolean;
    actualReach?: number;
    successMetric?: number;
    recordedAt?: string;
  }>(),
  
  // Additional capture fields from database
  autoTags: jsonb("auto_tags").default('[]'),
  signalScore: decimal("signal_score", { precision: 10, scale: 2 }).default('0.0'),
  viralPotential: decimal("viral_potential", { precision: 10, scale: 2 }).default('0.0'),
  promotionReason: text("promotion_reason"),
  workspaceNotes: text("workspace_notes"),
  briefSectionAssignment: text("brief_section_assignment"),
  batchQueueStatus: boolean("batch_queue_status").default(false),
  workspacePriority: integer("workspace_priority").default(0),
  voiceNoteUrl: text("voice_note_url"),
  voiceNoteDuration: integer("voice_note_duration"),
  transcription: text("transcription"),
  analysisMode: text("analysis_mode").default('quick'),
  visualAnalysis: text("visual_analysis"),
  isDraft: boolean("is_draft").default(false),
  
  // Status and timestamps
  status: text("status").default("active"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
}, (table) => ({
  projectIdx: index("idx_captures_project_id").on(table.projectId),
  userIdx: index("idx_captures_user_id").on(table.userId),
  statusIdx: index("idx_captures_status").on(table.status),
  analysisStatusIdx: index("idx_captures_analysis_status").on(table.analysisStatus),
}));

// 4. Content Radar table - Trending content from platforms
export const contentRadar = pgTable("content_radar", {
  id: uuid("id").primaryKey().default(sql`uuid_generate_v4()`),
  title: text("title").notNull(),
  url: text("url").notNull(),
  content: text("content"),
  summary: text("summary"),
  hook1: text("hook1"),
  hook2: text("hook2"),
  category: text("category").notNull(),
  platform: text("platform").notNull(),
  viralScore: text("viral_score").default('0.0'),
  engagement: integer("engagement").default(0),
  growthRate: text("growth_rate").default('0.0'),
  metadata: jsonb("metadata").default('{}'),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
}, (table) => ({
  categoryIdx: index("idx_content_radar_category").on(table.category),
  platformIdx: index("idx_content_radar_platform").on(table.platform),
  viralScoreIdx: index("idx_content_radar_viral_score").on(table.viralScore),
  createdAtIdx: index("idx_content_radar_created_at").on(table.createdAt),
}));

// 5. Briefs table - Generated strategic briefs
export const briefs = pgTable("briefs", {
  id: uuid("id").primaryKey().default(sql`uuid_generate_v4()`),
  projectId: uuid("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  templateType: text("template_type").default("jimmy-johns"),
  description: text("description"),
  status: text("status").default("draft"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
}, (table) => ({
  projectIdx: index("idx_briefs_project_id").on(table.projectId),
}));

// 6. Brief Captures junction table
export const briefCaptures = pgTable("brief_captures", {
  id: uuid("id").primaryKey().default(sql`uuid_generate_v4()`),
  briefId: uuid("brief_id").notNull().references(() => briefs.id, { onDelete: "cascade" }),
  captureId: uuid("capture_id").notNull().references(() => captures.id, { onDelete: "cascade" }),
  section: text("section"),
  orderIndex: integer("order_index").default(0),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCaptureSchema = createInsertSchema(captures).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertContentRadarSchema = createInsertSchema(contentRadar).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBriefSchema = createInsertSchema(briefs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBriefCaptureSchema = createInsertSchema(briefCaptures).omit({
  id: true,
  createdAt: true,
});

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;

export type Capture = typeof captures.$inferSelect;
export type InsertCapture = z.infer<typeof insertCaptureSchema>;

export type ContentRadar = typeof contentRadar.$inferSelect;
export type InsertContentRadar = z.infer<typeof insertContentRadarSchema>;

export type Brief = typeof briefs.$inferSelect;
export type InsertBrief = z.infer<typeof insertBriefSchema>;

export type BriefCapture = typeof briefCaptures.$inferSelect;
export type InsertBriefCapture = z.infer<typeof insertBriefCaptureSchema>;

// 7. Client Profiles table - Brand voice and strategic alignment
export const clientProfiles = pgTable("client_profiles", {
  id: uuid("id").primaryKey().default(sql`uuid_generate_v4()`),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  brandVoice: text("brand_voice"),
  targetAudience: jsonb("target_audience").default('{}').$type<{
    demographics?: string[];
    psychographics?: string[];
    behaviors?: string[];
    painPoints?: string[];
  }>(),
  channelPreferences: jsonb("channel_preferences").default('{}').$type<{
    twitter?: { tone: string; frequency: string };
    instagram?: { tone: string; frequency: string };
    tiktok?: { tone: string; frequency: string };
    linkedin?: { tone: string; frequency: string };
  }>(),
  noGoZones: jsonb("no_go_zones").default('[]'), // Topics to avoid
  competitiveLandscape: jsonb("competitive_landscape").default('{}'),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
}, (table) => ({
  userIdx: index("idx_client_profiles_user_id").on(table.userId),
}));

// 8. DSD Briefs table - Assembled strategic briefs
export const dsdBriefs = pgTable("dsd_briefs", {
  id: uuid("id").primaryKey().default(sql`uuid_generate_v4()`),
  projectId: uuid("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  clientId: uuid("client_id").references(() => clientProfiles.id),
  title: text("title").notNull(),
  
  // DSD Signal Drop Structure
  defineContent: jsonb("define_content").default('{}').$type<{
    lifeLens?: string;
    rawBehavior?: string;
    channelVibes?: Record<string, string>;
  }>(),
  shiftContent: jsonb("shift_content").default('{}').$type<{
    strategicIntelligence?: string;
    humanTruth?: string;
    culturalMoment?: string;
  }>(),
  deliverContent: jsonb("deliver_content").default('{}').$type<{
    creativeTerritory?: string[];
    executionIdeas?: string[];
    attentionValue?: number;
    viralPotential?: number;
  }>(),
  
  googleSlidesUrl: text("google_slides_url"),
  status: text("status").default("draft"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
}, (table) => ({
  projectIdx: index("idx_dsd_briefs_project_id").on(table.projectId),
  clientIdx: index("idx_dsd_briefs_client_id").on(table.clientId),
}));

// 9. Collective Patterns table - Network intelligence
export const collectivePatterns = pgTable("collective_patterns", {
  id: uuid("id").primaryKey().default(sql`uuid_generate_v4()`),
  patternType: text("pattern_type").notNull(), // 'cultural_moment' | 'viral_trend' | 'audience_shift'
  confidence: decimal("confidence", { precision: 3, scale: 2 }).default('0.00'), // 0.00-1.00
  contributingUsers: integer("contributing_users").default(0),
  contributingCaptures: jsonb("contributing_captures").default('[]'), // Array of capture IDs
  firstDetected: timestamp("first_detected", { withTimezone: true }).defaultNow(),
  lastUpdated: timestamp("last_updated", { withTimezone: true }).defaultNow(),
  validationCount: integer("validation_count").default(0),
  patternData: jsonb("pattern_data").default('{}'),
  isActive: boolean("is_active").default(true),
}, (table) => ({
  typeIdx: index("idx_collective_patterns_type").on(table.patternType),
  confidenceIdx: index("idx_collective_patterns_confidence").on(table.confidence),
}));

// 10. Cultural Moments table - Detected cultural shifts
export const culturalMoments = pgTable("cultural_moments", {
  id: uuid("id").primaryKey().default(sql`uuid_generate_v4()`),
  momentType: text("moment_type").notNull(),
  description: text("description"),
  emergenceDate: timestamp("emergence_date", { withTimezone: true }).defaultNow(),
  peakDate: timestamp("peak_date", { withTimezone: true }),
  contributingCaptures: jsonb("contributing_captures").default('[]'),
  globalConfidence: decimal("global_confidence", { precision: 3, scale: 2 }).default('0.00'),
  culturalContext: jsonb("cultural_context").default('{}'),
  strategicImplications: text("strategic_implications"),
  status: text("status").default("emerging"), // 'emerging' | 'active' | 'declining' | 'archived'
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
}, (table) => ({
  statusIdx: index("idx_cultural_moments_status").on(table.status),
  emergenceIdx: index("idx_cultural_moments_emergence").on(table.emergenceDate),
}));

// 11. Hypothesis Validations table - Track prediction accuracy
export const hypothesisValidations = pgTable("hypothesis_validations", {
  id: uuid("id").primaryKey().default(sql`uuid_generate_v4()`),
  originalCaptureId: uuid("original_capture_id").notNull().references(() => captures.id),
  validatingUserId: uuid("validating_user_id").notNull().references(() => users.id),
  originalPrediction: jsonb("original_prediction").notNull(),
  actualOutcome: jsonb("actual_outcome").notNull(),
  accuracyScore: decimal("accuracy_score", { precision: 3, scale: 2 }).default('0.00'),
  supportingEvidence: text("supporting_evidence"),
  validatedAt: timestamp("validated_at", { withTimezone: true }).defaultNow(),
}, (table) => ({
  captureIdx: index("idx_hypothesis_capture_id").on(table.originalCaptureId),
  userIdx: index("idx_hypothesis_user_id").on(table.validatingUserId),
}));

// Add schemas for new tables
export const insertClientProfileSchema = createInsertSchema(clientProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDsdBriefSchema = createInsertSchema(dsdBriefs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCollectivePatternSchema = createInsertSchema(collectivePatterns).omit({
  id: true,
  firstDetected: true,
  lastUpdated: true,
});

export const insertCulturalMomentSchema = createInsertSchema(culturalMoments).omit({
  id: true,
  createdAt: true,
});

export const insertHypothesisValidationSchema = createInsertSchema(hypothesisValidations).omit({
  id: true,
  validatedAt: true,
});

// Type exports for new tables
export type ClientProfile = typeof clientProfiles.$inferSelect;
export type InsertClientProfile = z.infer<typeof insertClientProfileSchema>;

export type DsdBrief = typeof dsdBriefs.$inferSelect;
export type InsertDsdBrief = z.infer<typeof insertDsdBriefSchema>;

export type CollectivePattern = typeof collectivePatterns.$inferSelect;
export type InsertCollectivePattern = z.infer<typeof insertCollectivePatternSchema>;

export type CulturalMoment = typeof culturalMoments.$inferSelect;
export type InsertCulturalMoment = z.infer<typeof insertCulturalMomentSchema>;

export type HypothesisValidation = typeof hypothesisValidations.$inferSelect;
export type InsertHypothesisValidation = z.infer<typeof insertHypothesisValidationSchema>;

// 12. User Settings table - Extension and UI preferences
export const userSettings = pgTable("user_settings", {
  id: uuid("id").primaryKey().default(sql`uuid_generate_v4()`),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  // Extension preferences
  extensionSettings: jsonb("extension_settings").default('{}').$type<{
    keyboardShortcut?: string;
    enableShortcut?: boolean;
    autoTag?: boolean;
    showOverlayHints?: boolean;
    autoSummarize?: boolean;
    addToProject?: boolean;
  }>(),
  
  // Dashboard preferences
  dashboardSettings: jsonb("dashboard_settings").default('{}').$type<{
    defaultView?: string;
    metricsVisible?: string[];
    chartPreferences?: Record<string, any>;
    layoutConfiguration?: Record<string, any>;
  }>(),
  
  // Search preferences
  searchSettings: jsonb("search_settings").default('{}').$type<{
    savedSearches?: Array<{
      name: string;
      query: string;
      filters: Record<string, any>;
    }>;
    defaultFilters?: Record<string, any>;
    resultsPerPage?: number;
  }>(),
  
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
}, (table) => ({
  userIdx: index("idx_user_settings_user_id").on(table.userId),
}));

// 13. Annotations table - Visual markup and canvas data
export const annotations = pgTable("annotations", {
  id: uuid("id").primaryKey().default(sql`uuid_generate_v4()`),
  captureId: uuid("capture_id").notNull().references(() => captures.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull().references(() => users.id),
  
  // Canvas/Annotation data
  canvasData: jsonb("canvas_data").notNull().$type<{
    version: string;
    objects: any[];
    background?: string;
    overlay?: any;
  }>(),
  
  // Annotation metadata
  annotationType: text("annotation_type").default("canvas"), // 'canvas' | 'highlight' | 'comment'
  coordinates: jsonb("coordinates").$type<{
    x?: number;
    y?: number;
    width?: number;
    height?: number;
  }>(),
  
  // Version control
  version: integer("version").default(1),
  parentId: uuid("parent_id"),
  
  // Collaborative features
  isShared: boolean("is_shared").default(false),
  collaborators: jsonb("collaborators").default('[]'), // Array of user IDs
  
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
}, (table) => ({
  captureIdx: index("idx_annotations_capture_id").on(table.captureId),
  userIdx: index("idx_annotations_user_id").on(table.userId),
  typeIdx: index("idx_annotations_type").on(table.annotationType),
}));

// 14. Analytics Data table - Dashboard metrics and trends  
export const analyticsData = pgTable("analytics_data", {
  id: uuid("id").primaryKey().default(sql`uuid_generate_v4()`),
  userId: uuid("user_id").notNull().references(() => users.id),
  projectId: uuid("project_id").references(() => projects.id),
  
  // Metric data
  metricType: text("metric_type").notNull(), // 'capture_volume' | 'viral_score' | 'engagement' | 'trend'
  metricValue: decimal("metric_value", { precision: 10, scale: 2 }).notNull(),
  
  // Time series data
  recordedAt: timestamp("recorded_at", { withTimezone: true }).defaultNow(),
  timeframe: text("timeframe").default("daily"), // 'hourly' | 'daily' | 'weekly' | 'monthly'
  
  // Additional context
  dimensions: jsonb("dimensions").default('{}').$type<{
    platform?: string;
    contentType?: string;
    audience?: string;
    campaign?: string;
  }>(),
  
  // Aggregated data
  aggregatedData: jsonb("aggregated_data").default('{}').$type<{
    total?: number;
    average?: number;
    trend?: string;
    comparison?: Record<string, number>;
  }>(),
  
}, (table) => ({
  userIdx: index("idx_analytics_user_id").on(table.userId),
  projectIdx: index("idx_analytics_project_id").on(table.projectId),
  typeIdx: index("idx_analytics_type").on(table.metricType),
  recordedIdx: index("idx_analytics_recorded").on(table.recordedAt),
}));

// Add schemas for new tables
export const insertUserSettingsSchema = createInsertSchema(userSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAnnotationSchema = createInsertSchema(annotations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAnalyticsDataSchema = createInsertSchema(analyticsData).omit({
  id: true,
  recordedAt: true,
});

// Type exports for new tables
export type UserSettings = typeof userSettings.$inferSelect;
export type InsertUserSettings = z.infer<typeof insertUserSettingsSchema>;

export type Annotation = typeof annotations.$inferSelect;
export type InsertAnnotation = z.infer<typeof insertAnnotationSchema>;

export type AnalyticsData = typeof analyticsData.$inferSelect;
export type InsertAnalyticsData = z.infer<typeof insertAnalyticsDataSchema>;

// 15. Analysis Results table - Store AI analysis results
export const analysisResults = pgTable("analysis_results", {
  id: uuid("id").primaryKey().default(sql`uuid_generate_v4()`),
  captureId: uuid("capture_id").notNull().references(() => captures.id, { onDelete: "cascade" }),
  fact: text("fact"),
  observation: text("observation"),
  insight: text("insight"),
  humanTruth: text("human_truth"),
  culturalMoment: text("cultural_moment"),
  tier: text("tier").notNull().default("tier1"),
  model: text("model"),
  processingTime: integer("processing_time"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
}, (table) => ({
  captureIdx: index("idx_analysis_results_capture_id").on(table.captureId),
}));

// 16. Scan History table - Track platform scans
export const scanHistory = pgTable("scan_history", {
  id: uuid("id").primaryKey().default(sql`uuid_generate_v4()`),
  platform: text("platform").notNull(),
  itemsFound: integer("items_found").default(0),
  errorMessage: text("error_message"),
  scanDuration: integer("scan_duration"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
}, (table) => ({
  platformIdx: index("idx_scan_history_platform").on(table.platform),
  createdIdx: index("idx_scan_history_created").on(table.createdAt),
}));

// 17. User Sessions table - Session management
export const userSessions = pgTable("user_sessions", {
  sid: varchar("sid", { length: 255 }).primaryKey(),
  sess: jsonb("sess").notNull(),
  expire: timestamp("expire", { withTimezone: false }).notNull(),
}, (table) => ({
  expireIdx: index("idx_user_sessions_expire").on(table.expire),
}));

// Add schemas for system tables
export const insertAnalysisResultSchema = createInsertSchema(analysisResults).omit({
  id: true,
  createdAt: true,
});

export const insertScanHistorySchema = createInsertSchema(scanHistory).omit({
  id: true,
  createdAt: true,
});

// Type exports for system tables
export type AnalysisResult = typeof analysisResults.$inferSelect;
export type InsertAnalysisResult = z.infer<typeof insertAnalysisResultSchema>;

export type ScanHistory = typeof scanHistory.$inferSelect;
export type InsertScanHistory = z.infer<typeof insertScanHistorySchema>;

export type UserSession = typeof userSessions.$inferSelect;

// 18. Capture Analyses table - Store per-capture analysis snapshots
export const captureAnalyses = pgTable("capture_analyses", {
  id: uuid("id").primaryKey().default(sql`uuid_generate_v4()`),
  captureId: uuid("capture_id").notNull().references(() => captures.id, { onDelete: "cascade" }),
  provider: text("provider").notNull(), // 'google' | 'openai' | 'mock'
  mode: text("mode").notNull(), // 'sync' | 'deep'
  status: text("status").notNull().default("completed"), // 'queued' | 'processing' | 'completed' | 'failed'
  summary: text("summary"),
  labels: jsonb("labels").default('[]').$type<Array<{ name: string; conf?: number; source?: string }>>(),
  ocr: jsonb("ocr").default('[]').$type<Array<{ text: string; bbox?: any; conf?: number }>>(),
  transcript: text("transcript"), // for videos (ASR)
  keyframes: jsonb("keyframes").default('[]').$type<Array<{ ts: number; url: string }>>(),
  raw: jsonb("raw"), // raw provider response (trimmed)
  error: text("error"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
}, (table) => ({
  captureIdx: index("idx_capture_analyses_capture_id").on(table.captureId),
  createdAtIdx: index("idx_capture_analyses_created_at").on(table.createdAt),
  statusIdx: index("idx_capture_analyses_status").on(table.status),
  providerIdx: index("idx_capture_analyses_provider").on(table.provider),
}));

// Schema and type exports for capture analyses
export const insertCaptureAnalysisSchema = createInsertSchema(captureAnalyses).omit({
  id: true,
  createdAt: true,
});

export type CaptureAnalysis = typeof captureAnalyses.$inferSelect;
export type InsertCaptureAnalysis = z.infer<typeof insertCaptureAnalysisSchema>;