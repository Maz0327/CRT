import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listCaptures, getCapture, updateCapture, uploadCapture } from "../services/captures";
import { useProjectContext } from "../app/providers";
import type { Capture, Paginated, ID } from "../types";

export function useCaptures(params?: { page?: number; pageSize?: number; q?: string; tags?: string[]; projectId?: ID; platform?: string }) {
  const { currentProjectId } = useProjectContext();
  const withScope = { ...(params || {}), projectId: (params?.projectId ?? currentProjectId) || undefined };

  return useQuery({
    queryKey: ["captures", withScope],
    queryFn: () => listCaptures(withScope),
  });
}

export function useCapture(id: ID) {
  return useQuery({
    queryKey: ["capture", id],
    queryFn: () => getCapture(id),
    enabled: !!id,
  });
}

export function useUpdateCapture(id: ID) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (patch: Partial<Capture>) => updateCapture(id, patch),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["captures"] });
      qc.invalidateQueries({ queryKey: ["capture", id] });
    },
  });
}

export function useUploadCaptures() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { files: File[]; project_id?: ID | null; notes?: string }) =>
      uploadCapture(input.files, { project_id: input.project_id, notes: input.notes }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["captures"] });
    },
  });
}