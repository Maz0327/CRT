export interface ContentRadarItem {
  id: string;
  title: string;
  url: string;
  content?: string;
  summary?: string;
  hook1?: string;
  hook2?: string;
  category: string;
  platform: string;
  viralScore?: string;
  engagement?: number;
  growthRate?: string;
  metadata?: any;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface DashboardStats {
  totalTrends: number;
  viralPotential: number;
  activeSources: number;
  avgScore: number;
}

export interface ScanHistory {
  id: string;
  platform: string;
  status: string;
  itemsFound: number;
  errorMessage?: string;
  scanDuration?: number;
  createdAt?: Date;
}

export interface ContentFilters {
  category?: string;
  platform?: string;
  timeRange?: string;
  sortBy?: string;
  searchQuery?: string;
}

export interface ScanResult {
  success: boolean;
  itemsProcessed: number;
  errors: string[];
}
