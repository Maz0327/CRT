import { pg } from '../lib/pg';

export interface SendToInboxParams {
  feedItemId: string;
  workspaceId: string;
  sentBy: string;
}

export interface FeedItemIngestionData {
  id: string;
  workspace_id: string;
  feed_item_id: string;
  sent_by: string;
  capture_id: string | null;
  sent_at: string;
}

export interface GetIngestionStatusParams {
  feedItemId: string;
  workspaceId: string;
}

export interface ListIngestionsParams {
  workspaceId: string;
  limit?: number;
}

/**
 * Send a feed item to inbox (capture system)
 * Creates an ingestion record to track which items have been sent
 */
export async function sendFeedItemToInbox(params: SendToInboxParams): Promise<{ id: string; ingestion: FeedItemIngestionData }> {
  const { feedItemId, workspaceId, sentBy } = params;
  
  // Check if item has already been sent to prevent duplicates
  const existingCheck = await pg.query(
    'SELECT id FROM feed_item_ingestions WHERE workspace_id = $1 AND feed_item_id = $2',
    [workspaceId, feedItemId]
  );
  
  if (existingCheck.rows.length > 0) {
    throw new Error('ALREADY_INGESTED');
  }
  
  // Verify the feed item exists and belongs to the workspace
  const feedItemCheck = await pg.query(
    'SELECT fi.id, fi.title, fi.url FROM feed_items fi JOIN feeds f ON fi.feed_id = f.id WHERE fi.id = $1 AND f.workspace_id = $2',
    [feedItemId, workspaceId]
  );
  
  if (feedItemCheck.rows.length === 0) {
    throw new Error('FEED_ITEM_NOT_FOUND');
  }
  
  const feedItem = feedItemCheck.rows[0];
  
  // Insert ingestion record
  const result = await pg.query(`
    INSERT INTO feed_item_ingestions (workspace_id, feed_item_id, sent_by, sent_at)
    VALUES ($1, $2, $3, NOW())
    RETURNING id, workspace_id, feed_item_id, sent_by, capture_id, sent_at
  `, [workspaceId, feedItemId, sentBy]);
  
  const ingestion = result.rows[0] as FeedItemIngestionData;
  
  console.log(`[feeds-ingest] Sent feed item ${feedItemId} to inbox for workspace ${workspaceId}`);
  
  return { id: ingestion.id, ingestion };
}

/**
 * Check if a feed item has already been sent to inbox
 */
export async function getIngestionStatus(params: GetIngestionStatusParams): Promise<{ isIngested: boolean; ingestedAt?: string }> {
  const { feedItemId, workspaceId } = params;
  
  const result = await pg.query(
    'SELECT sent_at FROM feed_item_ingestions WHERE workspace_id = $1 AND feed_item_id = $2',
    [workspaceId, feedItemId]
  );
  
  if (result.rows.length === 0) {
    return { isIngested: false };
  }
  
  return { 
    isIngested: true, 
    ingestedAt: result.rows[0].sent_at 
  };
}

/**
 * List recent ingestions for a workspace
 */
export async function listIngestions(params: ListIngestionsParams): Promise<Array<FeedItemIngestionData & { feedItem: { title: string; url: string; author?: string } }>> {
  const { workspaceId, limit = 10 } = params;
  
  // Ensure limit is reasonable
  const actualLimit = Math.min(Math.max(limit, 1), 50);
  
  const result = await pg.query(`
    SELECT 
      fii.id,
      fii.workspace_id,
      fii.feed_item_id,
      fii.sent_by,
      fii.capture_id,
      fii.sent_at,
      fi.title,
      fi.url,
      fi.author
    FROM feed_item_ingestions fii
    JOIN feed_items fi ON fii.feed_item_id = fi.id
    WHERE fii.workspace_id = $1
    ORDER BY fii.sent_at DESC
    LIMIT $2
  `, [workspaceId, actualLimit]);
  
  return result.rows.map(row => ({
    id: row.id,
    workspace_id: row.workspace_id,
    feed_item_id: row.feed_item_id,
    sent_by: row.sent_by,
    capture_id: row.capture_id,
    sent_at: row.sent_at,
    feedItem: {
      title: row.title,
      url: row.url,
      author: row.author
    }
  }));
}

/**
 * Get ingestion count for a workspace
 */
export async function getIngestionCount(workspaceId: string): Promise<number> {
  const result = await pg.query(
    'SELECT COUNT(*) as count FROM feed_item_ingestions WHERE workspace_id = $1',
    [workspaceId]
  );
  
  return parseInt(result.rows[0].count);
}