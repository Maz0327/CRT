// client/src/ui-v2/services/projects.ts
import api from '@/lib/api';

export interface Project {
  id: string;
  name: string;
  created_at?: string;
  updated_at?: string;
  // add fields you actually use in the UI
}

export async function listProjects(): Promise<Project[]> {
  return api.get<Project[]>('/projects');
}

export async function createProject(input: { name: string }): Promise<Project> {
  return api.post<Project>('/projects', input);
}

export async function updateProject(projectId: string, input: Partial<Project>): Promise<Project> {
  return api.patch<Project>(`/projects/${projectId}`, input);
}

export async function deleteProject(projectId: string): Promise<{ success: true }> {
  return api.del<{ success: true }>(`/projects/${projectId}`);
}