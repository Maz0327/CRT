import { api } from "../lib/api";
import type { Project } from "../types";

function toArray(res: any): Project[] {
  // Handle direct array response
  if (Array.isArray(res)) return res as Project[];
  // Handle wrapped responses
  if (res && typeof res === 'object' && !Array.isArray(res)) {
    if (Array.isArray(res.rows)) return res.rows as Project[];
    if (Array.isArray(res.data)) return res.data as Project[];
    if (Array.isArray(res.projects)) return res.projects as Project[];
  }
  // Default to empty array for any other case
  return [];
}

export async function listProjects(): Promise<Project[]> {
  try {
    const res = await api.get<any>("/projects");
    return toArray(res);
  } catch (error) {
    console.error("Failed to fetch projects:", error);
    return []; // Return empty array on error
  }
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