import type { Project as DBProject, Capture as DBCapture, CulturalMoment as DBMoment, DsdBrief as DBBrief, Brief } from '@shared/supabase-schema';
import type * as DTO from '../types/dto';

export function mapProject(row: DBProject): DTO.Project {
  return {
    id: row.id,
    name: row.name,
    description: row.description || null,
    createdAt: row.createdAt?.toISOString() || new Date().toISOString(),
    updatedAt: row.updatedAt?.toISOString() || new Date().toISOString()
  };
}

export function mapCapture(row: DBCapture): DTO.Capture {
  return {
    id: row.id,
    projectId: row.projectId,
    userId: row.userId,
    title: row.title || '',
    content: row.content || '',
    platform: row.platform,
    url: row.url,
    tags: Array.isArray(row.tags) ? row.tags : [],
    status: 'new' as const,
    imageUrl: row.screenshotUrl,
    videoUrl: null,
    createdAt: row.createdAt?.toISOString() || new Date().toISOString(),
    updatedAt: row.updatedAt?.toISOString() || new Date().toISOString()
  };
}

export function mapMoment(row: DBMoment): DTO.Moment {
  return {
    id: row.id,
    title: row.momentType || 'Unknown Moment',
    description: row.description || '',
    intensity: 50, // Default intensity since it's not in the actual schema
    tags: [],
    platforms: [],
    createdAt: row.createdAt?.toISOString() || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

export function mapBrief(row: Brief): DTO.Brief {
  return {
    id: row.id,
    projectId: row.projectId,
    title: row.title,
    status: (row.status as any) || 'draft',
    tags: [],
    slideCount: 0,
    createdAt: row.createdAt?.toISOString() || new Date().toISOString(),
    updatedAt: row.updatedAt?.toISOString() || new Date().toISOString()
  };
}

export function mapBriefDetail(row: Brief & { slides?: any }): DTO.BriefDetail {
  const brief = mapBrief(row);
  let slides: DTO.Slide[] = [];
  
  try {
    if (Array.isArray(row.slides)) {
      slides = row.slides.map((slide: any, index: number) => ({
        id: slide.id || `slide-${index}`,
        title: slide.title || null,
        blocks: Array.isArray(slide.blocks) ? slide.blocks : [],
        captureRefs: Array.isArray(slide.captureRefs) ? slide.captureRefs : []
      }));
    }
  } catch (error) {
    console.warn('Failed to parse slides JSON:', error);
    slides = [];
  }
  
  return {
    ...brief,
    slides
  };
}

// Removed mapFeed function as DBFeed type doesn't exist in current schema

// Helper function to ensure valid slides JSON
export function validateSlidesJson(slides: any): DTO.Slide[] {
  if (!Array.isArray(slides)) {
    return [];
  }
  
  return slides.map((slide: any, index: number) => ({
    id: slide.id || `slide-${index}`,
    title: slide.title || null,
    blocks: Array.isArray(slide.blocks) ? slide.blocks : [],
    captureRefs: Array.isArray(slide.captureRefs) ? slide.captureRefs : []
  }));
}