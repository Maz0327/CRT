import { users, signals, sources, signalSources, userFeedSources, userTopicProfiles, feedItems, type User, type InsertUser, type Signal, type InsertSignal, type Source, type InsertSource, type SignalSource, type InsertSignalSource, type UserFeedSource, type InsertUserFeedSource, type UserTopicProfile, type InsertUserTopicProfile, type FeedItem, type InsertFeedItem } from "@shared/schema";
import { eq, desc, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL!);
const db = drizzle(sql);

export { sql };

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Signals
  getSignal(id: number): Promise<Signal | undefined>;
  getSignalsByUserId(userId: number): Promise<Signal[]>;
  createSignal(signal: InsertSignal): Promise<Signal>;
  updateSignal(id: number, updates: Partial<InsertSignal>): Promise<Signal | undefined>;
  deleteSignal(id: number): Promise<void>;
  
  // Sources
  getSource(id: number): Promise<Source | undefined>;
  getSourceByUrl(url: string, userId: number): Promise<Source | undefined>;
  getSourcesByUserId(userId: number): Promise<Source[]>;
  createSource(source: InsertSource): Promise<Source>;
  updateSource(id: number, updates: Partial<InsertSource>): Promise<Source | undefined>;
  deleteSource(id: number): Promise<void>;
  
  // Signal-Source relationships
  linkSignalToSource(signalId: number, sourceId: number): Promise<SignalSource>;
  getSourcesForSignal(signalId: number): Promise<Source[]>;
  getSignalsForSource(sourceId: number): Promise<Signal[]>;
  
  // User Feed Sources
  getUserFeedSources(userId: number): Promise<UserFeedSource[]>;
  createUserFeedSource(feedSource: InsertUserFeedSource): Promise<UserFeedSource>;
  updateUserFeedSource(id: number, updates: Partial<InsertUserFeedSource>): Promise<UserFeedSource | undefined>;
  deleteUserFeedSource(id: number): Promise<void>;
  
  // User Topic Profiles
  getUserTopicProfile(userId: number): Promise<UserTopicProfile | undefined>;
  createUserTopicProfile(profile: InsertUserTopicProfile): Promise<UserTopicProfile>;
  updateUserTopicProfile(userId: number, updates: Partial<InsertUserTopicProfile>): Promise<UserTopicProfile | undefined>;
  
  // Feed Items
  getFeedItems(userId: number, feedType?: string, limit?: number): Promise<FeedItem[]>;
  createFeedItem(feedItem: InsertFeedItem): Promise<FeedItem>;
  updateFeedItem(id: number, updates: Partial<InsertFeedItem>): Promise<FeedItem | undefined>;
  deleteFeedItem(id: number): Promise<void>;
}

export class DbStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }

  async getSignal(id: number): Promise<Signal | undefined> {
    const result = await db.select().from(signals).where(eq(signals.id, id)).limit(1);
    return result[0];
  }

  async getSignalsByUserId(userId: number): Promise<Signal[]> {
    return await db.select().from(signals)
      .where(eq(signals.userId, userId))
      .orderBy(desc(signals.createdAt));
  }

  async createSignal(signal: InsertSignal): Promise<Signal> {
    const result = await db.insert(signals).values(signal).returning();
    return result[0];
  }

  async updateSignal(id: number, updates: Partial<InsertSignal>): Promise<Signal | undefined> {
    const result = await db.update(signals)
      .set(updates)
      .where(eq(signals.id, id))
      .returning();
    return result[0];
  }

  async deleteSignal(id: number): Promise<void> {
    await db.delete(signals).where(eq(signals.id, id));
  }

  // Sources methods
  async getSource(id: number): Promise<Source | undefined> {
    const result = await db.select().from(sources).where(eq(sources.id, id)).limit(1);
    return result[0];
  }

  async getSourceByUrl(url: string, userId: number): Promise<Source | undefined> {
    const result = await db.select().from(sources)
      .where(and(eq(sources.url, url), eq(sources.userId, userId)))
      .limit(1);
    return result[0];
  }

  async getSourcesByUserId(userId: number): Promise<Source[]> {
    return await db.select().from(sources)
      .where(eq(sources.userId, userId))
      .orderBy(desc(sources.lastAccessed));
  }

  async createSource(source: InsertSource): Promise<Source> {
    const result = await db.insert(sources).values(source).returning();
    return result[0];
  }

  async updateSource(id: number, updates: Partial<InsertSource>): Promise<Source | undefined> {
    const result = await db.update(sources)
      .set({ ...updates, lastAccessed: new Date() })
      .where(eq(sources.id, id))
      .returning();
    return result[0];
  }

  async deleteSource(id: number): Promise<void> {
    await db.delete(sources).where(eq(sources.id, id));
  }

  // Signal-Source relationship methods
  async linkSignalToSource(signalId: number, sourceId: number): Promise<SignalSource> {
    const result = await db.insert(signalSources)
      .values({ signalId, sourceId })
      .returning();
    return result[0];
  }

  async getSourcesForSignal(signalId: number): Promise<Source[]> {
    const result = await db.select({
      id: sources.id,
      userId: sources.userId,
      url: sources.url,
      title: sources.title,
      domain: sources.domain,
      favicon: sources.favicon,
      description: sources.description,
      sourceType: sources.sourceType,
      reliability: sources.reliability,
      firstCaptured: sources.firstCaptured,
      lastAccessed: sources.lastAccessed,
      accessCount: sources.accessCount,
      isActive: sources.isActive,
      createdAt: sources.createdAt,
    })
    .from(sources)
    .innerJoin(signalSources, eq(signalSources.sourceId, sources.id))
    .where(eq(signalSources.signalId, signalId));
    
    return result;
  }

  async getSignalsForSource(sourceId: number): Promise<Signal[]> {
    const result = await db.select({
      id: signals.id,
      userId: signals.userId,
      title: signals.title,
      content: signals.content,
      url: signals.url,
      summary: signals.summary,
      sentiment: signals.sentiment,
      tone: signals.tone,
      keywords: signals.keywords,
      tags: signals.tags,
      confidence: signals.confidence,
      status: signals.status,
      truthFact: signals.truthFact,
      truthObservation: signals.truthObservation,
      truthInsight: signals.truthInsight,
      humanTruth: signals.humanTruth,
      culturalMoment: signals.culturalMoment,
      attentionValue: signals.attentionValue,
      platformContext: signals.platformContext,
      viralPotential: signals.viralPotential,
      cohortSuggestions: signals.cohortSuggestions,
      competitiveInsights: signals.competitiveInsights,
      nextActions: signals.nextActions,
      userNotes: signals.userNotes,
      promotionReason: signals.promotionReason,
      systemSuggestionReason: signals.systemSuggestionReason,
      flaggedAt: signals.flaggedAt,
      promotedAt: signals.promotedAt,
      createdAt: signals.createdAt,
      isDraft: signals.isDraft,
      capturedAt: signals.capturedAt,
      browserContext: signals.browserContext,
    })
    .from(signals)
    .innerJoin(signalSources, eq(signalSources.signalId, signals.id))
    .where(eq(signalSources.sourceId, sourceId));
    
    return result;
  }

  // User Feed Sources implementation
  async getUserFeedSources(userId: number): Promise<UserFeedSource[]> {
    const result = await db.select().from(userFeedSources)
      .where(eq(userFeedSources.userId, userId))
      .orderBy(desc(userFeedSources.createdAt));
    return result;
  }

  async createUserFeedSource(feedSource: InsertUserFeedSource): Promise<UserFeedSource> {
    const result = await db.insert(userFeedSources).values(feedSource).returning();
    return result[0];
  }

  async updateUserFeedSource(id: number, updates: Partial<InsertUserFeedSource>): Promise<UserFeedSource | undefined> {
    const result = await db.update(userFeedSources)
      .set(updates)
      .where(eq(userFeedSources.id, id))
      .returning();
    return result[0];
  }

  async deleteUserFeedSource(id: number): Promise<void> {
    await db.delete(userFeedSources).where(eq(userFeedSources.id, id));
  }

  // User Topic Profiles implementation
  async getUserTopicProfile(userId: number): Promise<UserTopicProfile | undefined> {
    const result = await db.select().from(userTopicProfiles)
      .where(eq(userTopicProfiles.userId, userId))
      .limit(1);
    return result[0];
  }

  async createUserTopicProfile(profile: InsertUserTopicProfile): Promise<UserTopicProfile> {
    const result = await db.insert(userTopicProfiles).values(profile).returning();
    return result[0];
  }

  async updateUserTopicProfile(userId: number, updates: Partial<InsertUserTopicProfile>): Promise<UserTopicProfile | undefined> {
    const result = await db.update(userTopicProfiles)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(userTopicProfiles.userId, userId))
      .returning();
    return result[0];
  }

  // Feed Items implementation
  async getFeedItems(userId: number, feedType?: string, limit: number = 50): Promise<FeedItem[]> {
    if (feedType) {
      // When filtering by feed type, we need to join with userFeedSources
      const result = await db.select({
        id: feedItems.id,
        userId: feedItems.userId,
        feedSourceId: feedItems.feedSourceId,
        title: feedItems.title,
        content: feedItems.content,
        url: feedItems.url,
        summary: feedItems.summary,
        publishedAt: feedItems.publishedAt,
        fetchedAt: feedItems.fetchedAt,
        relevanceScore: feedItems.relevanceScore,
        urgencyLevel: feedItems.urgencyLevel,
        tags: feedItems.tags,
        isRead: feedItems.isRead,
        isBookmarked: feedItems.isBookmarked,
        createdAt: feedItems.createdAt,
      })
      .from(feedItems)
      .innerJoin(userFeedSources, eq(feedItems.feedSourceId, userFeedSources.id))
      .where(
        and(
          eq(feedItems.userId, userId),
          eq(userFeedSources.feedType, feedType)
        )
      )
      .orderBy(desc(feedItems.publishedAt))
      .limit(limit);
      
      return result;
    } else {
      // When no feed type filter, return all feed items for user
      return await db.select().from(feedItems)
        .where(eq(feedItems.userId, userId))
        .orderBy(desc(feedItems.publishedAt))
        .limit(limit);
    }
  }

  async createFeedItem(feedItem: InsertFeedItem): Promise<FeedItem> {
    const result = await db.insert(feedItems).values(feedItem).returning();
    return result[0];
  }

  async updateFeedItem(id: number, updates: Partial<InsertFeedItem>): Promise<FeedItem | undefined> {
    const result = await db.update(feedItems)
      .set(updates)
      .where(eq(feedItems.id, id))
      .returning();
    return result[0];
  }

  async deleteFeedItem(id: number): Promise<void> {
    await db.delete(feedItems).where(eq(feedItems.id, id));
  }
}

export const storage = new DbStorage();
