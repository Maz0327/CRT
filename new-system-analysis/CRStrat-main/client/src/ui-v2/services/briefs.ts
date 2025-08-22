import { api, IS_MOCK_MODE } from "../lib/api";
import { toCamel, toSnake } from "../lib/shape";
import type { ID, Brief, Paginated } from "../types";

export function listBriefs(params?: { page?: number; pageSize?: number; q?: string; projectId?: ID }) {
  if (IS_MOCK_MODE) {
    return Promise.resolve<Paginated<Brief>>({
      data: [{ id: "b1", title: "Sample Brief", status: "draft" }],
      page: 1, pageSize: 20, total: 1,
    });
  }
  const q = new URLSearchParams();
  if (params?.projectId) q.set("projectId", params.projectId);
  if (params?.page) q.set("page", String(params.page));
  if (params?.pageSize) q.set("pageSize", String(params.pageSize));
  if (params?.q) q.set("q", params.q);
  return api.get(`/briefs?${q}`).then(toCamel);
}

export function getBrief(id: ID) {
  return api.get(`/briefs/${id}`).then(toCamel);
}

export function createBrief(payload: Partial<Brief>) {
  // server injects user_id; client does not send it
  return api.post("/briefs", toSnake(payload)).then(toCamel);
}

export function updateBrief(id: ID, patch: Partial<Brief>) {
  return api.patch(`/briefs/${id}`, toSnake(patch)).then(toCamel);
}

export function exportBriefToSlides(id: ID) {
  return api.post(`/briefs/${id}/export/slides`).then(toCamel);
}

// Some pages may import deleteBrief or removeBrief — provide both
export function deleteBrief(id: ID) {
  return api.del(`/briefs/${id}`).then(toCamel);
}
export const removeBrief = deleteBrief;