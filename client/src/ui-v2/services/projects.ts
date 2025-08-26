import { api } from "../lib/api";
import type { Project } from "../types";

function toArray(res: any): Project[] {
  if (Array.isArray(res)) return res as Project[];
  if (res?.rows && Array.isArray(res.rows)) return res.rows as Project[];
  if (res?.data && Array.isArray(res.data)) return res.data as Project[];
  return [];
}

export async function listProjects(): Promise<Project[]> {
  const res = await api.get<any>("/projects");
  return toArray(res);
}

export async function createProject(input: { name: string }): Promise<Project> {
  return api.post<Project>("/projects", input);
}

export async function updateProject(id: string, patch: Partial<Project>): Promise<Project> {
  return api.patch<Project>(`/projects/${id}`, patch);
}

export async function deleteProject(id: string): Promise<{ success: true }> {
  return api.delete<{ success: true }>(`/projects/${id}`);
}