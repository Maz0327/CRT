import { api, IS_MOCK_MODE } from "../lib/api";
import type { ID, UserFeed, Paginated } from "../types";

export function listFeeds(params?: { page?: number; pageSize?: number; q?: string; projectId?: ID }) {
  if (IS_MOCK_MODE) {
    return Promise.resolve<Paginated<UserFeed>>({
      data: [{ id: "f1", feed_url: "https://example.com/rss", is_active: true }],
      page: 1, pageSize: 20, total: 1,
    });
  }
  return api.get<Paginated<UserFeed>>("/user-feeds", params);
}

export function createFeed(payload: { feed_url: string; title?: string | null; project_id?: ID | null }) {
  // user_id is injected on server from JWT
  return api.post<UserFeed>("/user-feeds", payload);
}

export function updateFeed(id: ID, patch: Partial<UserFeed>) {
  return api.patch<UserFeed>(`/user-feeds/${id}`, patch);
}

// Provide deletes under both names in case of import variance
export function deleteFeed(id: ID) {
  return api.del<{ ok: true }>(`/user-feeds/${id}`);
}
export const removeFeed = deleteFeed;