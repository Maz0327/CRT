import { api } from '../lib/api';

export interface MaterializeItemOptions {
  runTruth?: boolean;
}

export interface MaterializationResponse {
  success: boolean;
  status: 'created' | 'already_materialized';
  captureId: string;
  truthRequested: boolean;
}

/**
 * Materialize a feed item into a capture
 */
export async function materializeItem(
  itemId: string, 
  options: MaterializeItemOptions = {}
): Promise<MaterializationResponse> {
  const { runTruth = true } = options;
  
  return api.post<MaterializationResponse>(`/feeds/items/${itemId}/materialize`, { runTruth });
}