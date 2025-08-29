import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { 
  listSignals, 
  createSignal, 
  confirmSignal, 
  needsEditSignal,
  type Signal,
  type CreateSignalInput
} from '../services/signals';

export function useSignals(projectId?: string, status?: 'unreviewed' | 'confirmed' | 'needs_edit', limit?: number) {
  return useQuery({
    queryKey: ['/api/signals', projectId, status, limit],
    queryFn: () => listSignals({ projectId, status, limit }),
    enabled: !!projectId
  });
}

export function useCreateSignal() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: createSignal,
    onSuccess: (newSignal) => {
      queryClient.invalidateQueries({
        queryKey: ['/api/signals']
      });
      toast({
        title: "Signal created",
        description: "Signal has been successfully created"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error creating signal",
        description: error.message || "Failed to create signal",
        variant: "destructive"
      });
    }
  });
}

export function useConfirmSignal() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: confirmSignal,
    onSuccess: (signal) => {
      queryClient.invalidateQueries({
        queryKey: ['/api/signals']
      });
      toast({
        title: "Signal confirmed",
        description: "Signal has been marked as confirmed"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error confirming signal",
        description: error.message || "Failed to confirm signal",
        variant: "destructive"
      });
    }
  });
}

export function useNeedsEditSignal() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) => 
      needsEditSignal(id, notes),
    onSuccess: (signal) => {
      queryClient.invalidateQueries({
        queryKey: ['/api/signals']
      });
      toast({
        title: "Signal marked for editing",
        description: "Signal has been marked as needs edit"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error updating signal",
        description: error.message || "Failed to mark signal as needs edit",
        variant: "destructive"
      });
    }
  });
}