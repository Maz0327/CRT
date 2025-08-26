import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as projectsService from "../services/projects";
import type { Project } from "../types";

export function useProjects() {
  const qc = useQueryClient();

  const { data = [], isLoading, error } = useQuery<Project[], Error>({
    queryKey: ["projects"],
    queryFn: projectsService.listProjects,
  });

  const createProject = useMutation({
    mutationFn: projectsService.createProject,
    onSuccess: (newProj) => {
      qc.setQueryData<Project[]>(["projects"], (old = []) => [...old, newProj]);
    },
  });

  const updateProject = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<Project> }) =>
      projectsService.updateProject(id, patch),
    onSuccess: (updated) => {
      qc.setQueryData<Project[]>(["projects"], (old = []) =>
        old.map((p) => (p.id === updated.id ? updated : p))
      );
    },
  });

  const deleteProject = useMutation({
    mutationFn: (id: string) => projectsService.deleteProject(id),
    onSuccess: (_res, id) => {
      qc.setQueryData<Project[]>(["projects"], (old = []) =>
        old.filter((p) => p.id !== id)
      );
    },
  });

  return {
    projects: data,
    isLoading,
    error: error ?? null,
    createProject: createProject.mutateAsync,
    updateProject: ({ id, patch }: { id: string; patch: Partial<Project> }) =>
      updateProject.mutateAsync({ id, patch }),
    deleteProject: deleteProject.mutateAsync,
    isCreating: createProject.isPending,
    isUpdating: updateProject.isPending,
    isDeleting: deleteProject.isPending,
  };
}