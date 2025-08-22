import type { ID } from "../types";

export type BlockType =
  | "text"
  | "image"
  | "capture_ref"
  | "note"
  | "quote"
  | "shape"
  | "list"
  | "chart";

export interface BlockBase {
  id: ID;
  page_id: ID;
  type: BlockType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  zIndex?: number;
  locked?: boolean;
}

export interface TextBlock extends BlockBase {
  type: "text";
  text: string;
  align?: "left" | "center" | "right" | "justify";
  fontFamily?: string;
  fontSize?: number;
  weight?: string;
  color?: string; // CSS color or token
}

export interface ImageBlock extends BlockBase {
  type: "image";
  src: string;  // storage URL or signed URL
  alt?: string;
  fit?: "cover" | "contain";
  sourceCaptureId?: string;
}

export interface CaptureRefBlock extends BlockBase {
  type: "capture_ref";
  capture_id: ID;
}

export interface NoteBlock extends BlockBase {
  type: "note";
  text: string;
}

export interface QuoteBlock extends BlockBase {
  type: "quote";
  text: string;
  author?: string;
}

export interface ShapeBlock extends BlockBase {
  type: "shape";
  shape: "rect" | "circle" | "triangle" | "line";
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  radius?: number; // for rect corner radius
}

export interface ListBlock extends BlockBase {
  type: "list";
  items: string[];
  ordered?: boolean;
}

export interface ChartBlock extends BlockBase {
  type: "chart";
  config: unknown; // JSON blob used by chart renderer
}

export type Block =
  | TextBlock
  | ImageBlock
  | CaptureRefBlock
  | NoteBlock
  | QuoteBlock
  | ShapeBlock
  | ListBlock
  | ChartBlock;