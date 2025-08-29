import { api, IS_MOCK_MODE } from "../lib/api";
import type { ID } from "../types";

// Types for Feeds API responses
export interface FeedData {
  id: string;
  title: string;
  feed_url: string;
  is_active: boolean;
  status: string;
  last_pulled_at: string | null;
  last_error: string | null;
  created_at: string;
}

export interface FeedItemData {
  id: string;
  title: string;
  url: string;
  author: string | null;
  summary: string | null;
  published_at: string | null;
}

export interface PullFeedResult {
  success: boolean;
  insertedCount: number;
  lastPulledAt: string;
  status: string;
}

// Create a new feed
export function createFeed(payload: { 
  projectId: string; 
  feed_url: string; 
  title?: string;
}) {
  if (IS_MOCK_MODE) {
    return Promise.resolve<{ success: boolean; feed: FeedData }>({
      success: true,
      feed: {
        id: "mock-feed-" + Date.now(),
        title: payload.title || "Mock Feed",
        feed_url: payload.feed_url,
        is_active: true,
        status: "healthy",
        last_pulled_at: null,
        last_error: null,
        created_at: new Date().toISOString()
      }
    });
  }
  
  return api.post<{ success: boolean; feed: FeedData }>("/feeds", payload);
}

// List feeds for a project
export function listFeeds(projectId: string) {
  if (IS_MOCK_MODE) {
    return Promise.resolve<{ success: boolean; feeds: FeedData[] }>({
      success: true,
      feeds: [
        {
          id: "mock-feed-1",
          title: "Example RSS Feed",
          feed_url: "https://example.com/rss",
          is_active: true,
          status: "healthy",
          last_pulled_at: "2025-08-29T08:00:00Z",
          last_error: null,
          created_at: "2025-08-28T08:00:00Z"
        }
      ]
    });
  }
  
  return api.get<{ success: boolean; feeds: FeedData[] }>("/feeds", { projectId });
}

// Pull a feed now (fetch new content)
export function pullFeed(feedId: string, projectId: string) {
  if (IS_MOCK_MODE) {
    return Promise.resolve<PullFeedResult>({
      success: true,
      insertedCount: 3,
      lastPulledAt: new Date().toISOString(),
      status: "healthy"
    });
  }
  
  return api.post<PullFeedResult>(`/feeds/${feedId}/pull?projectId=${projectId}`, {});
}

// List feed items (preview)
export function listFeedItems(feedId: string, projectId: string, limit: number = 5) {
  if (IS_MOCK_MODE) {
    return Promise.resolve<{ success: boolean; items: FeedItemData[] }>({
      success: true,
      items: [
        {
          id: "mock-item-1",
          title: "Sample Article Title",
          url: "https://example.com/article-1",
          author: "Jane Doe",
          summary: "This is a sample article summary that would appear in the RSS feed...",
          published_at: "2025-08-29T06:30:00Z"
        },
        {
          id: "mock-item-2", 
          title: "Another Article",
          url: "https://example.com/article-2",
          author: null,
          summary: "Another sample article for testing purposes...",
          published_at: "2025-08-29T05:15:00Z"
        }
      ]
    });
  }
  
  return api.get<{ success: boolean; items: FeedItemData[] }>(`/feeds/${feedId}/items?projectId=${projectId}&limit=${limit}`);
}

// Update feed (status, title, etc.) - placeholder for compatibility
export function updateFeed(id: string, patch: any) {
  // Currently not implemented in new feeds API
  // Would need to be added to backend if needed
  if (IS_MOCK_MODE) {
    return Promise.resolve({ id, ...patch });
  }
  throw new Error("updateFeed not implemented in new feeds API");
}

// Delete feed - placeholder for compatibility  
export function deleteFeed(id: string) {
  // Currently not implemented in new feeds API
  // Would need to be added to backend if needed
  if (IS_MOCK_MODE) {
    return Promise.resolve({ ok: true });
  }
  throw new Error("deleteFeed not implemented in new feeds API");
}