// Strategic Intelligence Service - Clean Supabase Implementation
import { BrightDataService } from './brightDataService';
import { EnhancedAIAnalyzer, AnalysisContext } from './enhancedAIAnalyzer';
import { ContentRadar, Capture, Project, InsertContentRadar } from '@shared/supabase-schema';
import { IStorage } from '../storage';

export class StrategicIntelligenceService {
  private brightData: BrightDataService;
  private aiAnalyzer: EnhancedAIAnalyzer;
  private storage: IStorage;

  constructor(storage: IStorage) {
    this.brightData = new BrightDataService();
    this.aiAnalyzer = new EnhancedAIAnalyzer();
    this.storage = storage;
  }

  async analyzeContentTrends(keywords: string[], timeframe = '24h'): Promise<ContentRadar[]> {
    try {
      // Simplified implementation - return existing content
      const results = await this.storage.getContentItems({});
      return results.slice(0, 10);
    } catch (error) {
      console.error('Strategic Intelligence analysis failed:', error);
      return [];
    }
  }

  async generateStrategicInsights(project: Project, captures: Capture[]): Promise<any> {
    // Simplified strategic insights generation
    return {
      insights: `Strategic analysis for ${project.name} with ${captures.length} captures`,
      recommendations: ['Continue monitoring trends', 'Enhance content strategy'],
      riskFactors: ['Market volatility', 'Competitor activity']
    };
  }

  // Additional methods for routes.ts compatibility
  async fetchMultiPlatformIntelligence(params: any): Promise<any[]> {
    try {
      const content = await this.storage.getContentItems({
        platform: params.platform,
        limit: params.limit || 10
      });
      return content.map(item => ({
        ...item,
        platform: item.platform,
        title: item.title,
        content: item.content,
        engagement: item.engagement,
        url: item.url
      }));
    } catch (error) {
      console.error('Error fetching multi-platform intelligence:', error);
      return [];
    }
  }

  async detectEmergingTrends(params: any): Promise<any> {
    try {
      const content = await this.storage.getContentItems({
        sortBy: 'growth',
        limit: 20
      });
      
      const trends = content.map(item => ({
        topic: item.title,
        momentum: item.growthRate,
        platforms: [item.platform],
        examples: [item]
      }));

      return {
        trends: trends.slice(0, 5),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error detecting trends:', error);
      return { trends: [], timestamp: new Date().toISOString() };
    }
  }

  async correlateCulturalMoments(data: any[]): Promise<any> {
    // Simple cultural moment correlation
    return {
      moments: data.slice(0, 3).map(item => ({
        theme: item.title || 'Trending Topic',
        signals: [item],
        impact: 'Medium',
        opportunity: 'Monitor for engagement'
      }))
    };
  }

  private calculateViralScore(item: any): number {
    const engagement = (item.upvotes || 0) + (item.comments || 0) * 2;
    const recency = this.getRecencyScore(item.created_at);
    return Math.min(10, Math.round((engagement / 100) * recency));
  }

  private getRecencyScore(timestamp: string): number {
    const now = Date.now();
    const posted = new Date(timestamp).getTime();
    const hoursAgo = (now - posted) / (1000 * 60 * 60);
    
    if (hoursAgo < 1) return 1.0;
    if (hoursAgo < 6) return 0.8;
    if (hoursAgo < 24) return 0.6;
    return 0.3;
  }

  private categorizeContent(title: string, content: string): string {
    const text = `${title} ${content}`.toLowerCase();
    
    if (text.includes('tech') || text.includes('ai') || text.includes('startup')) return 'technology';
    if (text.includes('business') || text.includes('marketing') || text.includes('strategy')) return 'business';
    if (text.includes('trend') || text.includes('viral') || text.includes('culture')) return 'culture';
    if (text.includes('politics') || text.includes('election') || text.includes('government')) return 'politics';
    
    return 'general';
  }
}