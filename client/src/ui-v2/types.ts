export type ID = string;

export interface Paginated<T> {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
}

export interface Project {
  id: ID;
  name: string;
  created_at?: string;
}

export interface Capture {
  id: ID;
  project_id?: ID | null;
  user_id?: ID;
  title: string;
  content?: string | null;
  platform?: string | null;
  url?: string | null;
  file_path?: string | null;
  file_size?: number | null;
  file_type?: string | null;
  imageUrl?: string | null;
  videoUrl?: string | null;
  status?: 'new' | 'keep' | 'trash';
  tags?: string[];
  created_at?: string;
  updated_at?: string;
  analysis?: any; // expanded by read-model API
}

export interface Brief {
  id: ID;
  project_id?: ID | null;
  title: string;
  status?: string | null;
  created_at?: string;
  updated_at?: string;
  slides?: any[];
}

export interface BriefDetail extends Brief {
  slides: any[];
}

export interface Slide {
  id: string;
  brief_id: string;
  title?: string;
  order_index: number;
  blocks: any[];
}

export interface UserFeed {
  id: ID;
  project_id?: ID | null;
  // user_id is injected on the server; not required in client payloads
  feed_url: string;
  title?: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface TruthCheckInput {
  kind: "url" | "text" | "image";
  url?: string;
  text?: string;
  imageFileId?: string; // storage/file ref if uploaded
  project_id?: ID | null;
}

export interface TruthCheckResult {
  id: ID;
  verdict: "true" | "false" | "uncertain";
  confidence: number; // 0..1
  summary: string;
  evidence: Array<{ type: "link" | "quote" | "image"; value: string }>;
  created_at: string;
}

export interface Block {
  id: ID;
  type: string;
  content: any;
  position?: { x: number; y: number };
  x?: number;
  y?: number;
  src?: string;
  alt?: string;
  text?: string;
  fontSize?: number;
  weight?: string | number;
  align?: string;
  w?: number;
  h?: number;
  sourceCaptureId?: string;
}

export interface Moment {
  id: ID;
  title: string;
  description: string;
  intensity: number;
  tags: string[];
  platforms: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Moment {
  id: ID;
  title: string;
  description: string;
  intensity: number;
  tags: string[];
  platforms: string[];
  createdAt: string;
  updatedAt: string;
}