export type ID = string;
export type Tag = string;

export interface User {
  id: ID;
  email: string;
  name?: string | null;
  avatarUrl?: string | null;
}

export interface Project {
  id: ID;
  name: string;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Capture {
  id: ID;
  projectId: ID;
  userId: ID;
  title: string;
  content: string;
  platform?: string | null;
  url?: string | null;
  tags: Tag[];
  status: 'new' | 'keep' | 'trash';
  imageUrl?: string | null;
  videoUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Moment {
  id: ID;
  title: string;
  description: string;
  intensity: number;
  tags: Tag[];
  platforms: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Brief {
  id: ID;
  projectId: ID;
  title: string;
  status: 'draft' | 'in_review' | 'final';
  tags: Tag[];
  slideCount: number;
  updatedAt: string;
  createdAt: string;
}

export type BlockType = 'text' | 'image' | 'note';

export interface BaseBlock {
  id: ID;
  type: BlockType;
  x: number;
  y: number;
  w: number;
  h: number;
  rotation?: number;
}

export interface TextBlock extends BaseBlock {
  type: 'text';
  text: string;
  align?: 'left' | 'center' | 'right';
  fontSize?: number;
  weight?: number;
}

export interface ImageBlock extends BaseBlock {
  type: 'image';
  src: string;
  alt?: string | null;
  sourceCaptureId?: ID | null;
}

export interface NoteBlock extends BaseBlock {
  type: 'note';
  text: string;
}

export type Block = TextBlock | ImageBlock | NoteBlock;

export interface Slide {
  id: ID;
  title?: string | null;
  blocks: Block[];
  captureRefs?: ID[];
}

export interface BriefDetail extends Brief {
  slides: Slide[];
}

export interface Feed {
  id: ID;
  userId: ID;
  projectId?: ID | null;
  feedUrl: string;
  title?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Job {
  id: ID;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: any;
  error?: string;
}