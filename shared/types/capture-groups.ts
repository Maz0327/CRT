export type GroupStatus = 'draft' | 'analyzing' | 'complete' | 'error';

export interface CaptureGroup {
  id: string;
  project_id: string;
  user_id: string;
  name: string;
  status: GroupStatus;
  created_at: string;
  updated_at: string;
}

export interface CaptureGroupItem {
  group_id: string;
  capture_id: string;
  position: number;
  added_at: string;
}