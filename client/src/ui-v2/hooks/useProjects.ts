import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listProjects, createProject as createProjectAPI } from '../services/projects';
import { Project } from '../types';

export function useProjects() {
  const queryClient = useQueryClient();

  const { data: projects = [], isLoading, error } = useQuery({
    queryKey: ['projects'],
    queryFn: () => listProjects(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const createMutation = useMutation({
    mutationFn: createProjectAPI,
    onSuccess: (newProject) => {
      queryClient.setQueriesData(
        { queryKey: ['projects'] },
        (old: Project[] = []) => [...old, newProject]
      );
    },
  });

  return {
    projects,
    isLoading,
    error,
    createProject: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
  };
}