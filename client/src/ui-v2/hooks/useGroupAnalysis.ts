import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { groupsService } from "../services/groups";
import type { TruthCheckRow } from "@/../../shared/truth-types";

export function useCreateGroup() {
  return useMutation({
    mutationFn: (input: { name: string; projectId?: string | null }) =>
      groupsService.create(input),
  });
}

export function useAddToGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: { groupId: string; captureId: string }) =>
      groupsService.addCapture(args.groupId, args.captureId),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["group", vars.groupId, "items"] });
    },
  });
}

export function useAnalyzeGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (groupId: string) => groupsService.analyze(groupId),
    onSuccess: (_data, groupId) => {
      qc.invalidateQueries({ queryKey: ["truth", "group", groupId, "latest"] });
    },
  });
}

export function useTruthCheck(groupId?: string) {
  return useQuery<TruthCheckRow>({
    queryKey: ["truth", "group", groupId, "latest"],
    queryFn: () => groupsService.latestTruthCheck(groupId!),
    enabled: !!groupId,
    refetchInterval: (q) => {
      const status = (q.state.data as TruthCheckRow | undefined)?.status;
      return status && (status === "pending" || status === "running") ? 2000 : false;
    },
  });
}