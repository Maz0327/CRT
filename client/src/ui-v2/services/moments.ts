import { api } from './api';
import { IS_MOCK_MODE } from './http';
import { Moment } from '../types';

const mockMoments: Moment[] = [
  {
    id: 'mom-1',
    title: 'Sustainable Fashion Movement',
    description: 'Growing awareness and adoption of sustainable fashion practices',
    intensity: 78,
    tags: ['sustainability', 'fashion', 'environment'],
    platforms: ['tiktok', 'instagram', 'youtube'],
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-20T12:00:00Z',
  },
  {
    id: 'mom-2',
    title: 'AI Creative Tools Adoption',
    description: 'Rapid adoption of AI tools in creative workflows',
    intensity: 65,
    tags: ['ai', 'creativity', 'tools', 'productivity'],
    platforms: ['twitter', 'linkedin', 'youtube'],
    createdAt: '2024-01-12T00:00:00Z',
    updatedAt: '2024-01-19T15:30:00Z',
  },
];

export interface MomentsListParams {
  projectId?: string;
  tags?: string[];
  q?: string;
}

export const momentsService = {
  async list(params: MomentsListParams): Promise<Moment[]> {
    if (IS_MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 300));
      let filtered = [...mockMoments];
      if (params.q) {
        const query = params.q.toLowerCase();
        filtered = filtered.filter(m => 
          m.title.toLowerCase().includes(query) ||
          m.description.toLowerCase().includes(query)
        );
      }
      if (params.tags?.length) {
        filtered = filtered.filter(m => 
          params.tags!.some(tag => m.tags.includes(tag))
        );
      }
      return filtered;
    }

    const searchParams = new URLSearchParams();
    if (params.projectId) searchParams.set('projectId', params.projectId);
    if (params.tags?.length) searchParams.set('tags', params.tags.join(','));
    if (params.q) searchParams.set('q', params.q);

    return api.get<Moment[]>(`/moments?${searchParams}`);
  },

  async get(id: string): Promise<Moment> {
    if (IS_MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 200));
      const moment = mockMoments.find(m => m.id === id);
      if (!moment) throw new Error('Moment not found');
      return moment;
    }
    return api.get<Moment>(`/moments/${id}`);
  },

  async update(id: string, data: Partial<Moment>): Promise<Moment> {
    if (IS_MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const index = mockMoments.findIndex(m => m.id === id);
      if (index >= 0) {
        mockMoments[index] = { ...mockMoments[index], ...data, updatedAt: new Date().toISOString() };
        return mockMoments[index];
      }
      throw new Error('Moment not found');
    }
    return api.patch<Moment>(`/moments/${id}`, data);
  },
};