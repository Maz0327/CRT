import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getBrief, updateBrief, exportBriefToSlides } from '../services/briefs';
import { BriefDetail } from '../types';

export function useBrief(id: string) {
  const queryClient = useQueryClient();

  const { data: brief, isLoading, error } = useQuery({
    queryKey: ['briefs', id],
    queryFn: () => getBrief(id),
    enabled: !!id,
    staleTime: 30 * 1000, // 30 seconds
  });

  const saveMutation = useMutation({
    mutationFn: (briefDetail: BriefDetail) => updateBrief(id, briefDetail),
    onSuccess: (updatedBrief) => {
      queryClient.setQueryData(['briefs', id], updatedBrief);
      // Also update the brief in the list
      queryClient.setQueriesData(
        { queryKey: ['briefs'] },
        (old: any) => {
          if (Array.isArray(old)) {
            return old.map((b: any) => 
              b.id === updatedBrief.id 
                ? { ...b, ...updatedBrief, slideCount: updatedBrief.slides.length }
                : b
            );
          }
          return old;
        }
      );
    },
  });

  const exportMutation = useMutation({
    mutationFn: () => exportBriefToSlides(id),
  });

  return {
    brief,
    isLoading,
    error,
    saveBrief: saveMutation.mutate,
    exportBrief: exportMutation.mutate,
    isSaving: saveMutation.isPending,
    isExporting: exportMutation.isPending,
    exportJobId: exportMutation.data?.jobId,
    saveError: saveMutation.error,
    exportError: exportMutation.error,
  };
}

export function useJob(jobId: string | undefined) {
  return useQuery({
    queryKey: ['jobs', jobId],
    queryFn: () => jobsService.get(jobId!),
    enabled: !!jobId,
    refetchInterval: (data) => {
      // Poll every 2 seconds if job is still running
      return data?.status === 'pending' || data?.status === 'running' ? 2000 : false;
    },
  });
}