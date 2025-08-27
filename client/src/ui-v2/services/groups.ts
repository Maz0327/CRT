import { api } from "../lib/api";
import type { TruthCheckRow } from "@/../../shared/truth-types";

export type Group = { id: string; name: string; projectId?: string | null };

export const groupsService = {
  async create(input: { name: string; projectId?: string | null }) {
    return api.post<Group>("/api/groups", input);
  },

  async addCapture(groupId: string, captureId: string) {
    return api.post(`/api/groups/${groupId}/items`, { captureId });
  },

  async analyze(groupId: string) {
    return api.post<{ status: string; checkId?: string }>(`/api/groups/${groupId}/analyze`, {});
  },

  async latestTruthCheck(groupId: string) {
    return api.get<TruthCheckRow>(`/api/truth/check?groupId=${encodeURIComponent(groupId)}`);
  },
};