import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listFeeds, createFeed, updateFeed, deleteFeed, pullFeed, listFeedItems, FeedData, FeedItemData } from '../services/feeds';
import { useProjectContext } from "../app/providers";

export function useFeeds(projectId?: string) {
  const { currentProjectId } = useProjectContext();
  const effectiveProjectId = projectId || currentProjectId;
  const queryClient = useQueryClient();

  const { data: feedsData, isLoading, error } = useQuery({
    queryKey: ['feeds', effectiveProjectId],
    queryFn: () => listFeeds(effectiveProjectId || ''),
    enabled: !!effectiveProjectId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const feeds = feedsData?.feeds || [];

  const createMutation = useMutation({
    mutationFn: createFeed,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feeds', effectiveProjectId] });
    },
  });

  const pullMutation = useMutation({
    mutationFn: ({ feedId, projectId }: { feedId: string, projectId: string }) => 
      pullFeed(feedId, projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feeds', effectiveProjectId] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: { id: string } & any) =>
      updateFeed(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feeds', effectiveProjectId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteFeed,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feeds', effectiveProjectId] });
    },
  });

  return {
    feeds,
    isLoading,
    error,
    createFeed: createMutation.mutateAsync,
    pullFeed: pullMutation.mutateAsync,
    updateFeed: updateMutation.mutateAsync,
    deleteFeed: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isPulling: pullMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

export function useFeedItems(feedId: string, projectId?: string, limit: number = 5) {
  const { currentProjectId } = useProjectContext();
  const effectiveProjectId = projectId || currentProjectId;

  const { data: itemsData, isLoading, error } = useQuery({
    queryKey: ['feed-items', feedId, effectiveProjectId, limit],
    queryFn: () => listFeedItems(feedId, effectiveProjectId || '', limit),
    enabled: !!feedId && !!effectiveProjectId,
    staleTime: 1 * 60 * 1000, // 1 minute
  });

  const items = itemsData?.items || [];

  return {
    items,
    isLoading,
    error,
  };
}