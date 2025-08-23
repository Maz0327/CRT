import { api } from './api';
import { IS_MOCK_MODE } from '../lib/api';
import type { ID, Project } from '../types';

export function listProjects() {
  if (IS_MOCK_MODE) {
    return Promise.resolve([
      { id: 'proj-1', name: 'Sample Project', created_at: '2024-01-01T00:00:00Z' }
    ]);
  }
  return api.get<any>('/projects').then((res: any) => res.rows || res.data || []);
}

export function getProject(id: ID) {
  if (IS_MOCK_MODE) {
    return Promise.resolve({ id, name: 'Sample Project', created_at: '2024-01-01T00:00:00Z' });
  }
  return api.get(`/projects/${id}`);
}

export function createProject(payload: { name: string }) {
  if (IS_MOCK_MODE) {
    return Promise.resolve({ 
      id: `proj-${Date.now()}`, 
      name: payload.name, 
      created_at: new Date().toISOString() 
    });
  }
  return api.post('/projects', payload);
}

export function updateProject(id: ID, patch: Partial<Project>) {
  if (IS_MOCK_MODE) {
    return Promise.resolve({ id, ...patch, created_at: '2024-01-01T00:00:00Z' });
  }
  return api.patch(`/projects/${id}`, patch);
}

export function deleteProject(id: ID) {
  if (IS_MOCK_MODE) {
    return Promise.resolve({ success: true });
  }
  return api.delete(`/projects/${id}`);
}