// client/src/ui-v2/hooks/useProjects.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createProject as svcCreate, deleteProject as svcDelete, listProjects, updateProject as svcUpdate, Project } from '../services/projects';

export function useProjects() {
  const qc = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['projects'],
    queryFn: listProjects,
  });

  const createProject = useMutation({
    mutationFn: (input: { name: string }) => svcCreate(input),
    onSuccess: (created) => {
      qc.setQueryData<Project[] | undefined>(['projects'], (old = []) => [...old, created]);
    },
  });

  const updateProject = useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<Project> }) => svcUpdate(id, input),
    onSuccess: (updated) => {
      qc.setQueryData<Project[] | undefined>(['projects'], (old = []) =>
        old.map((p) => (p.id === updated.id ? updated : p)),
      );
    },
  });

  const deleteProject = useMutation({
    mutationFn: (id: string) => svcDelete(id),
    onSuccess: (_res, id) => {
      qc.setQueryData<Project[] | undefined>(['projects'], (old = []) => old.filter((p) => p.id !== id));
    },
  });

  return {
    projects: data ?? [],
    isLoading,
    error: (error as Error) || null,
    createProject: createProject.mutateAsync,
    updateProject: updateProject.mutateAsync,
    deleteProject: deleteProject.mutateAsync,
    isCreating: createProject.isPending,
  };
}