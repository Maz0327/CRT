import Parser from 'rss-parser';
import { pg } from '../lib/pg';

const parser = new Parser({
  timeout: 10000,
  headers: {
    'User-Agent': 'Content Radar RSS Reader/1.0'
  }
});

export interface CreateFeedParams {
  projectId: string;
  createdBy: string;
  feed_url: string;
  title?: string;
}

export interface ListFeedsParams {
  projectId: string;
}

export interface PullFeedParams {
  feedId: string;
  projectId: string;
}

export interface ListFeedItemsParams {
  feedId: string;
  projectId: string;
  limit?: number;
}

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

/**
 * Normalize URL for consistent storage and deduplication
 */
export function normalizeUrl(url: string): string {
  try {
    const parsedUrl = new URL(url.trim());
    // Convert hostname to lowercase
    parsedUrl.hostname = parsedUrl.hostname.toLowerCase();
    // Remove trailing slash from pathname unless it's the root
    if (parsedUrl.pathname !== '/' && parsedUrl.pathname.endsWith('/')) {
      parsedUrl.pathname = parsedUrl.pathname.slice(0, -1);
    }
    return parsedUrl.toString();
  } catch (error) {
    throw new Error('Invalid URL format');
  }
}

/**
 * Create a new feed, enforcing uniqueness within project
 */
export async function createFeed(params: CreateFeedParams): Promise<{ id: string; feed: FeedData }> {
  const { projectId, createdBy, feed_url, title } = params;
  
  const normalizedUrl = normalizeUrl(feed_url);
  
  // Check for existing feed in this project
  const existingCheck = await pg.query(
    'SELECT id FROM feeds WHERE workspace_id = $1 AND url = $2',
    [projectId, normalizedUrl]
  );
  
  if (existingCheck.rows.length > 0) {
    throw new Error('DUPLICATE_FEED');
  }
  
  // Insert new feed
  const result = await pg.query(`
    INSERT INTO feeds (workspace_id, user_id, name, url, type, status, is_active, created_at, updated_at)
    VALUES ($1, $2, $3, $4, 'rss', 'healthy', true, NOW(), NOW())
    RETURNING id, name as title, url as feed_url, is_active, status, last_pulled_at, last_error, created_at
  `, [projectId, createdBy, title || 'Untitled Feed', normalizedUrl]);
  
  const feed = result.rows[0] as FeedData;
  
  return { id: feed.id, feed };
}

/**
 * List all feeds for a project
 */
export async function listFeeds(params: ListFeedsParams): Promise<FeedData[]> {
  const { projectId } = params;
  
  const result = await pg.query(`
    SELECT 
      id,
      name as title,
      url as feed_url,
      is_active,
      status,
      last_pulled_at,
      last_error,
      created_at
    FROM feeds 
    WHERE workspace_id = $1 
    ORDER BY created_at DESC
  `, [projectId]);
  
  return result.rows as FeedData[];
}

/**
 * Pull and parse RSS/Atom feed, updating items
 */
export async function pullFeed(params: PullFeedParams): Promise<{ insertedCount: number; lastPulledAt: string; status: string }> {
  const { feedId, projectId } = params;
  
  // Get feed details
  const feedResult = await pg.query(
    'SELECT id, url, workspace_id FROM feeds WHERE id = $1 AND workspace_id = $2',
    [feedId, projectId]
  );
  
  if (feedResult.rows.length === 0) {
    throw new Error('Feed not found');
  }
  
  const feed = feedResult.rows[0];
  const feedUrl = feed.url;
  
  try {
    console.log(`[feeds] Fetching RSS from: ${feedUrl}`);
    const startTime = Date.now();
    
    // Parse RSS/Atom feed
    const parsedFeed = await parser.parseURL(feedUrl);
    
    const duration = Date.now() - startTime;
    console.log(`[feeds] RSS parsed in ${duration}ms, found ${parsedFeed.items.length} items`);
    
    let insertedCount = 0;
    const maxItems = 20; // Limit to newest N items
    
    // Process up to maxItems newest items
    const itemsToProcess = parsedFeed.items.slice(0, maxItems);
    
    for (const item of itemsToProcess) {
      if (!item.link || !item.title) continue; // Skip items without required fields
      
      const normalizedItemUrl = normalizeUrl(item.link);
      
      // Check if item already exists
      const existingItem = await pg.query(
        'SELECT id FROM feed_items WHERE feed_id = $1 AND url = $2',
        [feedId, normalizedItemUrl]
      );
      
      if (existingItem.rows.length === 0) {
        // Insert new item
        await pg.query(`
          INSERT INTO feed_items (
            feed_id, workspace_id, title, url, author, summary, content, published_at, raw, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
        `, [
          feedId,
          projectId,
          item.title,
          normalizedItemUrl,
          item.creator || item.author || null,
          item.contentSnippet || item.summary || null,
          item.content || null,
          item.pubDate ? new Date(item.pubDate) : null,
          JSON.stringify(item)
        ]);
        
        insertedCount++;
      }
    }
    
    // Update feed status (success)
    const lastPulledAt = new Date().toISOString();
    await pg.query(`
      UPDATE feeds 
      SET last_pulled_at = $1, last_error = NULL, status = 'healthy', updated_at = NOW()
      WHERE id = $2
    `, [lastPulledAt, feedId]);
    
    console.log(`[feeds] Successfully processed ${insertedCount} new items from feed ${feedId}`);
    
    return {
      insertedCount,
      lastPulledAt,
      status: 'healthy'
    };
    
  } catch (error: any) {
    console.error(`[feeds] Error pulling feed ${feedId}:`, error);
    
    // Update feed status (error)
    const errorMessage = error.message ? error.message.substring(0, 300) : 'Unknown error';
    await pg.query(`
      UPDATE feeds 
      SET last_error = $1, status = 'error', updated_at = NOW()
      WHERE id = $2
    `, [errorMessage, feedId]);
    
    return {
      insertedCount: 0,
      lastPulledAt: new Date().toISOString(),
      status: 'error'
    };
  }
}

/**
 * List recent items from a feed for preview
 */
export async function listFeedItems(params: ListFeedItemsParams): Promise<FeedItemData[]> {
  const { feedId, projectId, limit = 5 } = params;
  
  // Ensure limit is reasonable
  const actualLimit = Math.min(Math.max(limit, 1), 10);
  
  const result = await pg.query(`
    SELECT 
      id,
      title,
      url,
      author,
      summary,
      published_at
    FROM feed_items 
    WHERE feed_id = $1 AND workspace_id = $2
    ORDER BY published_at DESC, created_at DESC
    LIMIT $3
  `, [feedId, projectId, actualLimit]);
  
  return result.rows as FeedItemData[];
}