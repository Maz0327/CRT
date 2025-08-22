import { api } from "../lib/api";

export type DailyBriefing = {
  broadFeed: Array<any>;
  watchlist: Array<any>;
  recentAnalyses: Array<any>;
  alerts: Array<{ metric_type: string; total: number }>;
};

export function getDailyBriefing() {
  return api.get<DailyBriefing>("/daily-briefing");
}