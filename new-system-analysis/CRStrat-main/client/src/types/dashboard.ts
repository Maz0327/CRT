export type DashboardStats = {
  // core
  totalTrends?: number;
  viralPotential?: number;
  activeSources?: number;
  avgScore?: number;

  // extra used across pages
  truthAnalyzed?: number;
  hypothesesTracked?: number;

  // fields used in lovable-api mapping
  totalCaptures?: number;
  avgViralScore?: number;
  engagementRate?: number;
  responseTime?: string;
};

export type IntelligenceSummary = {
  totalSignals: number;
  tier1Signals: number;
  tier2Signals: number;
  trends: number;
};