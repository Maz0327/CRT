import { pg } from '../lib/pg';
import { storage } from '../storage';
import type { InsertCapture } from '@shared/supabase-schema';

export interface MaterializeFeedItemParams {
  projectId: string;
  feedItemId: string;
  userId: string;
}

export interface MaterializationResult {
  status: 'created' | 'already_materialized';
  captureId: string;
}

/**
 * Convert a feed item that has been "sent to inbox" into a real capture
 * Updates the ingestion record with the new capture ID
 */
export async function materializeFeedItemToCapture(params: MaterializeFeedItemParams): Promise<MaterializationResult> {
  const { projectId, feedItemId, userId } = params;
  
  // First, check if there's an ingestion record and if it's already materialized
  const ingestionCheck = await pg.query(
    'SELECT id, capture_id FROM feed_item_ingestions WHERE workspace_id = $1 AND feed_item_id = $2',
    [projectId, feedItemId]
  );
  
  if (ingestionCheck.rows.length === 0) {
    throw new Error('ITEM_NOT_INGESTED');
  }
  
  const ingestion = ingestionCheck.rows[0];
  
  // If already materialized, return existing capture ID
  if (ingestion.capture_id) {
    return {
      status: 'already_materialized',
      captureId: ingestion.capture_id
    };
  }
  
  // Get the feed item data
  const feedItemResult = await pg.query(`
    SELECT 
      fi.id,
      fi.title,
      fi.url,
      fi.author,
      fi.summary,
      fi.content,
      fi.published_at,
      fi.raw,
      f.title as feed_title,
      f.url as feed_url
    FROM feed_items fi
    JOIN feeds f ON fi.feed_id = f.id
    WHERE fi.id = $1 AND f.workspace_id = $2
  `, [feedItemId, projectId]);
  
  if (feedItemResult.rows.length === 0) {
    throw new Error('FEED_ITEM_NOT_FOUND');
  }
  
  const feedItem = feedItemResult.rows[0];
  
  // Create the capture data from feed item
  const captureData: InsertCapture = {
    projectId: projectId,
    userId: userId,
    type: 'feed',
    title: feedItem.title || 'Untitled Feed Item',
    content: feedItem.content || feedItem.summary || '',
    url: feedItem.url,
    platform: 'rss-feed',
    metadata: {
      feedTitle: feedItem.feed_title,
      feedUrl: feedItem.feed_url,
      author: feedItem.author,
      publishedAt: feedItem.published_at,
      rawFeedData: feedItem.raw,
      materializedFrom: 'feed_item',
      feedItemId: feedItemId
    },
    status: 'new',
    analysisStatus: 'pending'
  };
  
  // Create the capture using storage service
  const newCapture = await storage.createCapture(captureData);
  
  // Update the ingestion record with the new capture ID
  await pg.query(
    'UPDATE feed_item_ingestions SET capture_id = $1 WHERE id = $2',
    [newCapture.id, ingestion.id]
  );
  
  console.log(`[capture-materializer] Created capture ${newCapture.id} from feed item ${feedItemId} for project ${projectId}`);
  
  return {
    status: 'created',
    captureId: newCapture.id
  };
}

/**
 * Enqueue Truth Lab analysis for a single capture
 * Makes HTTP call to internal truth analysis API
 */
export async function enqueueTruthAnalysisForCapture(captureId: string, projectId: string): Promise<void> {
  try {
    // For now, we'll use a simple approach: just log that we would enqueue truth analysis
    // In a real implementation, you would call the truth analysis service or API
    console.log(`[capture-materializer] Would enqueue Truth Lab analysis for capture ${captureId} in project ${projectId}`);
    
    // TODO: When truth analysis API is ready for single captures, call it here
    // Example: await truthAnalysisService.enqueueSingle(captureId, projectId);
    
  } catch (error: any) {
    console.error(`[capture-materializer] Failed to enqueue truth analysis for capture ${captureId}:`, error);
    // Don't throw here - materialization succeeded, truth analysis is optional
  }
}