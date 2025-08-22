import { pgTable, text, serial, timestamp, jsonb, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").default("user"), // user, admin
  createdAt: timestamp("created_at").defaultNow(),
});

export const signals = pgTable("signals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title"),
  content: text("content").notNull(),
  url: text("url"),
  summary: text("summary"),
  sentiment: text("sentiment"),
  tone: text("tone"),
  keywords: text("keywords").array(),
  tags: text("tags").array(),
  confidence: text("confidence"),
  status: text("status").default("capture"), // capture -> potential_signal -> signal
  // Enhanced analysis fields
  truthFact: text("truth_fact"),
  truthObservation: text("truth_observation"),
  truthInsight: text("truth_insight"),
  humanTruth: text("human_truth"),
  culturalMoment: text("cultural_moment"),
  attentionValue: text("attention_value"),
  platformContext: text("platform_context"),
  viralPotential: text("viral_potential"),
  cohortSuggestions: text("cohort_suggestions").array(),
  competitiveInsights: text("competitive_insights").array(),
  nextActions: text("next_actions").array(),
  // User-driven workflow enhancements
  userNotes: text("user_notes"),
  promotionReason: text("promotion_reason"),
  systemSuggestionReason: text("system_suggestion_reason"),
  flaggedAt: timestamp("flagged_at"),
  promotedAt: timestamp("promoted_at"),
  // Chrome extension draft fields
  isDraft: boolean("is_draft").default(false),
  capturedAt: timestamp("captured_at"),
  browserContext: jsonb("browser_context"), // JSON for domain, meta description, etc.
  createdAt: timestamp("created_at").defaultNow(),
});

export const sources = pgTable("sources", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  url: text("url").notNull(),
  title: text("title").notNull(),
  domain: text("domain").notNull(),
  favicon: text("favicon"),
  description: text("description"),
  sourceType: text("source_type").default("article"), // article, social, research, news, etc.
  reliability: text("reliability").default("unknown"), // high, medium, low, unknown
  firstCaptured: timestamp("first_captured").defaultNow(),
  lastAccessed: timestamp("last_accessed").defaultNow(),
  accessCount: integer("access_count").default(1),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const signalSources = pgTable("signal_sources", {
  id: serial("id").primaryKey(),
  signalId: integer("signal_id").notNull().references(() => signals.id),
  sourceId: integer("source_id").notNull().references(() => sources.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// User feed configuration tables
export const userFeedSources = pgTable("user_feed_sources", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(), // "Client Social Media", "Industry News", etc.
  feedType: text("feed_type").notNull(), // "project_data", "custom_feed", "intelligence_feed"
  sourceType: text("source_type").notNull(), // "rss", "social_api", "analytics", "reddit", "website"
  sourceUrl: text("source_url").notNull(),
  sourceConfig: jsonb("source_config"), // API keys, filters, etc.
  isActive: boolean("is_active").default(true),
  updateFrequency: text("update_frequency").default("4h"), // "1h", "4h", "12h", "24h"
  lastFetched: timestamp("last_fetched"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userTopicProfiles = pgTable("user_topic_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  industries: text("industries").array().default([]), // ["healthcare", "tech", "finance"]
  interests: text("interests").array().default([]), // ["AI", "sustainability", "consumer_behavior"]
  keywords: text("keywords").array().default([]), // user-defined terms
  geographicFocus: text("geographic_focus").array().default([]), // regions of interest
  excludedTopics: text("excluded_topics").array().default([]), // noise reduction
  preferredSources: text("preferred_sources").array().default([]), // platform preferences
  urgencyLevels: jsonb("urgency_levels"), // custom urgency scoring
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const feedItems = pgTable("feed_items", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  feedSourceId: integer("feed_source_id").notNull().references(() => userFeedSources.id),
  title: text("title").notNull(),
  content: text("content"),
  url: text("url"),
  summary: text("summary"),
  publishedAt: timestamp("published_at"),
  fetchedAt: timestamp("fetched_at").defaultNow(),
  relevanceScore: text("relevance_score"), // AI-calculated relevance
  urgencyLevel: text("urgency_level").default("medium"), // "low", "medium", "high", "critical"
  tags: text("tags").array().default([]),
  isRead: boolean("is_read").default(false),
  isBookmarked: boolean("is_bookmarked").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertSignalSchema = createInsertSchema(signals).omit({
  id: true,
  createdAt: true,
});

export const insertSourceSchema = createInsertSchema(sources).omit({
  id: true,
  createdAt: true,
});

export const insertSignalSourceSchema = createInsertSchema(signalSources).omit({
  id: true,
  createdAt: true,
});

export const insertUserFeedSourceSchema = createInsertSchema(userFeedSources).omit({
  id: true,
  createdAt: true,
  lastFetched: true,
});

export const insertUserTopicProfileSchema = createInsertSchema(userTopicProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFeedItemSchema = createInsertSchema(feedItems).omit({
  id: true,
  createdAt: true,
  fetchedAt: true,
});

// Admin Analytics Tables
export const userAnalytics = pgTable("user_analytics", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  sessionId: text("session_id"),
  action: text("action").notNull(), // 'page_view', 'button_click', 'feature_usage', 'api_call'
  feature: text("feature"), // 'content_analysis', 'brief_builder', 'signal_mining', etc.
  details: jsonb("details"), // Additional context data
  timestamp: timestamp("timestamp").defaultNow(),
  duration: integer("duration"), // Time spent on action in milliseconds
  userAgent: text("user_agent"),
  ipAddress: text("ip_address"),
});

export const userFeedback = pgTable("user_feedback", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  type: text("type").notNull(), // 'bug', 'feature_request', 'general', 'rating'
  category: text("category"), // 'ui', 'performance', 'functionality', 'content'
  rating: integer("rating"), // 1-5 star rating
  title: text("title"),
  description: text("description"),
  screenshot: text("screenshot"), // Base64 or URL
  status: text("status").default("open"), // 'open', 'in_progress', 'resolved', 'closed'
  adminResponse: text("admin_response"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const featureUsage = pgTable("feature_usage", {
  id: serial("id").primaryKey(),
  feature: text("feature").notNull(),
  userId: integer("user_id").references(() => users.id),
  usageCount: integer("usage_count").default(1),
  lastUsed: timestamp("last_used").defaultNow(),
  avgSessionDuration: integer("avg_session_duration"), // in milliseconds
  successRate: integer("success_rate"), // percentage
  date: timestamp("date").defaultNow(),
});

export const systemPerformance = pgTable("system_performance", {
  id: serial("id").primaryKey(),
  metric: text("metric").notNull(), // 'response_time', 'error_rate', 'active_users'
  value: integer("value").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
  details: jsonb("details"),
});

export const abTestResults = pgTable("ab_test_results", {
  id: serial("id").primaryKey(),
  testName: text("test_name").notNull(),
  userId: integer("user_id").references(() => users.id),
  variant: text("variant").notNull(), // 'A', 'B', 'control'
  outcome: text("outcome"), // 'conversion', 'bounce', 'engagement'
  value: integer("value"), // numeric outcome value
  timestamp: timestamp("timestamp").defaultNow(),
});

// Admin schemas
export const insertUserAnalyticsSchema = createInsertSchema(userAnalytics).omit({
  id: true,
  timestamp: true,
});

export const insertUserFeedbackSchema = createInsertSchema(userFeedback).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFeatureUsageSchema = createInsertSchema(featureUsage).omit({
  id: true,
  lastUsed: true,
  date: true,
});

export const insertSystemPerformanceSchema = createInsertSchema(systemPerformance).omit({
  id: true,
  timestamp: true,
});

export const insertAbTestResultsSchema = createInsertSchema(abTestResults).omit({
  id: true,
  timestamp: true,
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const registerSchema = loginSchema.extend({
  confirmPassword: z.string().min(8),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
}).refine((data) => {
  // Check for at least one uppercase letter
  if (!/[A-Z]/.test(data.password)) {
    return false;
  }
  // Check for at least one lowercase letter
  if (!/[a-z]/.test(data.password)) {
    return false;
  }
  // Check for at least one number
  if (!/[0-9]/.test(data.password)) {
    return false;
  }
  // Check for at least one special character
  if (!/[!@#$%^&*(),.?":{}|<>.]/.test(data.password)) {
    return false;
  }
  return true;
}, {
  message: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
  path: ["password"],
});

export const analyzeContentSchema = z.object({
  content: z.string().min(1, "Content is required"),
  url: z.union([z.string().url(), z.literal("")]).optional(),
  title: z.string().optional(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertSignal = z.infer<typeof insertSignalSchema>;
export type Signal = typeof signals.$inferSelect;
export type InsertSource = z.infer<typeof insertSourceSchema>;
export type Source = typeof sources.$inferSelect;
export type InsertSignalSource = z.infer<typeof insertSignalSourceSchema>;
export type SignalSource = typeof signalSources.$inferSelect;
export type InsertUserFeedSource = z.infer<typeof insertUserFeedSourceSchema>;
export type UserFeedSource = typeof userFeedSources.$inferSelect;
export type InsertUserTopicProfile = z.infer<typeof insertUserTopicProfileSchema>;
export type UserTopicProfile = typeof userTopicProfiles.$inferSelect;
export type InsertFeedItem = z.infer<typeof insertFeedItemSchema>;
export type FeedItem = typeof feedItems.$inferSelect;
export type LoginData = z.infer<typeof loginSchema>;
export type RegisterData = z.infer<typeof registerSchema>;
export type AnalyzeContentData = z.infer<typeof analyzeContentSchema>;

// Admin types
export type UserAnalytics = typeof userAnalytics.$inferSelect;
export type InsertUserAnalytics = z.infer<typeof insertUserAnalyticsSchema>;
export type UserFeedback = typeof userFeedback.$inferSelect;
export type InsertUserFeedback = z.infer<typeof insertUserFeedbackSchema>;
export type FeatureUsage = typeof featureUsage.$inferSelect;
export type InsertFeatureUsage = z.infer<typeof insertFeatureUsageSchema>;
export type SystemPerformance = typeof systemPerformance.$inferSelect;
export type InsertSystemPerformance = z.infer<typeof insertSystemPerformanceSchema>;
export type AbTestResults = typeof abTestResults.$inferSelect;
export type InsertAbTestResults = z.infer<typeof insertAbTestResultsSchema>;
