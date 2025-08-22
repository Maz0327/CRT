import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listFeeds, createFeed, updateFeed, deleteFeed } from '../services/feeds';
import { useProjectContext } from "../app/providers";
import { UserFeed } from '../types';

export function useFeeds(params?: { projectId?: string; active?: boolean }) {
  const { currentProjectId } = useProjectContext();
  const withScope = { ...(params || {}), projectId: (params?.projectId ?? currentProjectId) || undefined };
  const queryClient = useQueryClient();

  const { data: feeds = [], isLoading, error } = useQuery({
    queryKey: ['feeds', withScope],
    queryFn: () => listFeeds(withScope),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const createMutation = useMutation({
    mutationFn: createFeed,
    onSuccess: (newFeed) => {
      queryClient.setQueryData(['feeds'], (old: UserFeed[] = []) => [newFeed, ...old]);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Partial<UserFeed>) =>
      updateFeed(id, data),
    onSuccess: (updatedFeed) => {
      queryClient.setQueryData(['feeds'], (old: UserFeed[] = []) =>
        old.map((f) => (f.id === updatedFeed.id ? updatedFeed : f))
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteFeed,
    onSuccess: (_, deletedId) => {
      queryClient.setQueryData(['feeds'], (old: UserFeed[] = []) =>
        old.filter((f) => f.id !== deletedId)
      );
    },
  });

  return {
    feeds,
    isLoading,
    error,
    createFeed: createMutation.mutateAsync,
    updateFeed: updateMutation.mutateAsync,
    deleteFeed: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}