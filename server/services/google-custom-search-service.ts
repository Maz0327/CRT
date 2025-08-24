import { google } from 'googleapis';

export class GoogleCustomSearchService {
  private customsearch: any;
  private apiKey: string;
  private searchEngineId: string;
  [key: string]: any; // index signature

  constructor() {
    this.customsearch = google.customsearch('v1');
    this.apiKey = process.env.GOOGLE_API_KEY!;
    this.searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID || ''; // Programmable Search Engine ID
  }

  async searchTrendingContent(query: string, options: {
    platform?: string;
    dateRestrict?: string; // 'd1' = past day, 'w1' = past week, 'm1' = past month
    num?: number; // Number of results (1-10)
    siteSearch?: string; // Restrict to specific site
  } = {}) {
    try {
      const searchParams: any = {
        auth: this.apiKey,
        cx: this.searchEngineId,
        q: query,
        num: options.num || 10
      };

      // Add platform-specific site search
      if (options.platform) {
        const siteMap: Record<string, string> = {
          reddit: 'site:reddit.com',
          twitter: 'site:twitter.com OR site:x.com',
          tiktok: 'site:tiktok.com',
          instagram: 'site:instagram.com',
          youtube: 'site:youtube.com',
          linkedin: 'site:linkedin.com'
        };
        
        if (options.platform && siteMap[options.platform]) {
          searchParams.q += ` ${siteMap[options.platform]}`;
        }
      }

      if (options.siteSearch) {
        searchParams.siteSearch = options.siteSearch;
      }

      if (options.dateRestrict) {
        searchParams.dateRestrict = options.dateRestrict;
      }

      const response = await this.customsearch.cse.list(searchParams);
      
      return this.processSearchResults(response.data);
    } catch (error) {
      console.error('Google Custom Search error:', error);
      throw new Error('Failed to search trending content');
    }
  }

  async discoverEmergingTrends(categories: string[] = [
    'technology', 'business', 'culture', 'marketing', 'social media'
  ]) {
    try {
      const trendQueries = [
        'viral trending now',
        'breaking news today',
        'trending hashtags',
        'viral content 2025',
        'emerging trends',
        'cultural moments',
        'social media buzz'
      ];

      const searchPromises: Promise<any>[] = trendQueries.map(async (baseQuery) => {
        const results = await Promise.all(
          categories.map(category => 
            this.searchTrendingContent(`${baseQuery} ${category}`, {
              dateRestrict: 'd1', // Past day
              num: 5
            })
          )
        );
        
        return {
          query: baseQuery,
          categoryResults: results.flat()
        };
      });

      const allResults = await Promise.all(searchPromises);
      
      return this.consolidateTrendDiscovery(allResults);
    } catch (error) {
      console.error('Error discovering emerging trends:', error);
      throw new Error('Failed to discover emerging trends');
    }
  }

  async validateTrendRelevance(trendKeywords: string[], context?: string) {
    try {
      const validationQueries = trendKeywords.map(keyword => {
        let query = `"${keyword}" trending`;
        if (context) {
          query += ` ${context}`;
        }
        return query;
      });

      const validationResults = await Promise.all(
        validationQueries.map(query => 
          this.searchTrendingContent(query, {
            dateRestrict: 'w1', // Past week
            num: 5
          })
        )
      );

      return this.processValidationResults(trendKeywords, validationResults);
    } catch (error) {
      console.error('Error validating trend relevance:', error);
      throw new Error('Failed to validate trend relevance');
    }
  }

  async findCompetitorContent(brandName: string, competitors: string[] = []) {
    try {
      const competitorQueries = [
        `"${brandName}" campaign analysis`,
        `"${brandName}" marketing strategy`,
        `"${brandName}" viral content`,
        ...competitors.map(comp => `"${comp}" vs "${brandName}"`)
      ];

      const competitorResults = await Promise.all(
        competitorQueries.map(query =>
          this.searchTrendingContent(query, {
            dateRestrict: 'm1', // Past month
            num: 8
          })
        )
      );

      return this.analyzeCompetitorIntelligence(brandName, competitorResults.flat());
    } catch (error) {
      console.error('Error finding competitor content:', error);
      throw new Error('Failed to find competitor content');
    }
  }

  private processSearchResults(data: any) {
    if (!data.items) return [];

    return data.items.map((item: any) => ({
      title: item.title,
      url: item.link,
      snippet: item.snippet,
      displayLink: item.displayLink,
      formattedUrl: item.formattedUrl,
      
      // Extract strategic intelligence
      platform: this.extractPlatform(item.displayLink),
      relevanceScore: this.calculateRelevanceScore(item),
      contentType: this.detectContentType(item),
      
      // Search metadata
      searchRank: data.items.indexOf(item) + 1,
      cacheId: item.cacheId,
      
      // Strategic analysis
      strategicInsights: this.generateSearchInsights(item)
    }));
  }

  private consolidateTrendDiscovery(allResults: any[]) {
    const trends = new Map();
    
    allResults.forEach(result => {
      result.categoryResults.forEach((item: any) => {
        const key = item.title.toLowerCase();
        if (trends.has(key)) {
          trends.get(key).mentions++;
          trends.get(key).sources.push(item.platform);
        } else {
          trends.set(key, {
            title: item.title,
            url: item.url,
            mentions: 1,
            sources: [item.platform],
            relevanceScore: item.relevanceScore,
            snippet: item.snippet,
            discoveredAt: new Date().toISOString()
          });
        }
      });
    });

    return Array.from(trends.values())
      .filter(trend => trend.mentions >= 2) // Must appear in multiple searches
      .sort((a, b) => b.mentions - a.mentions)
      .slice(0, 20);
  }

  private processValidationResults(keywords: string[], results: any[][]) {
    return keywords.map((keyword, index) => {
      const searchResults = results[index] || [];
      
      return {
        keyword,
        validationScore: this.calculateValidationScore(searchResults),
        resultCount: searchResults.length,
        topSources: searchResults.slice(0, 3).map(r => ({
          title: r.title,
          url: r.url,
          platform: r.platform
        })),
        isValidTrend: searchResults.length >= 3,
        momentum: this.assessTrendMomentum(searchResults)
      };
    });
  }

  private analyzeCompetitorIntelligence(brandName: string, results: any[]) {
    const intelligence = {
      brand: brandName,
      competitorMentions: new Map(),
      campaignInsights: [] as any[],
      strategicGaps: [] as any[],
      opportunityAreas: [] as any[]
    };

    results.forEach(result => {
      // Extract competitor mentions
      const competitors = this.extractCompetitorMentions(result.snippet);
      competitors.forEach(comp => {
        const count = intelligence.competitorMentions.get(comp) || 0;
        intelligence.competitorMentions.set(comp, count + 1);
      });

      // Identify campaign insights
      if (this.isCampaignContent(result)) {
        intelligence.campaignInsights.push({
          title: result.title,
          url: result.url,
          platform: result.platform,
          insights: this.extractCampaignInsights(result.snippet)
        });
      }
    });

    return {
      ...intelligence,
      competitorMentions: Object.fromEntries(intelligence.competitorMentions),
      analysisDate: new Date().toISOString()
    };
  }

  private extractPlatform(displayLink: string): string {
    const platformMap = {
      'reddit.com': 'reddit',
      'twitter.com': 'twitter',
      'x.com': 'twitter',
      'tiktok.com': 'tiktok',
      'instagram.com': 'instagram',
      'youtube.com': 'youtube',
      'linkedin.com': 'linkedin',
      'medium.com': 'medium'
    };

    for (const [domain, platform] of Object.entries(platformMap)) {
      if (displayLink.includes(domain)) {
        return platform;
      }
    }
    
    return 'web';
  }

  private calculateRelevanceScore(item: any): number {
    let score = 0.5; // Base score
    
    // Higher score for social media platforms
    if (['reddit', 'twitter', 'tiktok', 'instagram'].includes(this.extractPlatform(item.displayLink))) {
      score += 0.3;
    }
    
    // Bonus for recent content indicators
    const recentIndicators = ['trending', 'viral', 'breaking', 'now', '2025'];
    const hasRecentIndicators = recentIndicators.some(indicator => 
      item.title.toLowerCase().includes(indicator) || 
      item.snippet.toLowerCase().includes(indicator)
    );
    
    if (hasRecentIndicators) {
      score += 0.2;
    }
    
    return Math.min(score, 1.0);
  }

  private detectContentType(item: any): string {
    const title = item.title.toLowerCase();
    const snippet = item.snippet.toLowerCase();
    
    if (title.includes('video') || snippet.includes('watch')) return 'video';
    if (title.includes('image') || title.includes('photo')) return 'image';
    if (title.includes('thread') || snippet.includes('thread')) return 'thread';
    if (title.includes('campaign') || snippet.includes('campaign')) return 'campaign';
    
    return 'article';
  }

  private generateSearchInsights(item: any): string[] {
    const insights: string[] = [];
    const content = `${item.title} ${item.snippet}`.toLowerCase();
    
    if (content.includes('viral') || content.includes('trending')) {
      insights.push('High viral potential detected');
    }
    
    if (content.includes('campaign') || content.includes('strategy')) {
      insights.push('Strategic campaign content');
    }
    
    if (content.includes('breaking') || content.includes('news')) {
      insights.push('Breaking news relevance');
    }
    
    return insights;
  }

  private calculateValidationScore(results: any[]): number {
    if (results.length === 0) return 0;
    
    const avgRelevance = results.reduce((sum, r) => sum + r.relevanceScore, 0) / results.length;
    const platformDiversity = new Set(results.map(r => r.platform)).size;
    
    return (avgRelevance * 0.7) + (Math.min(platformDiversity / 5, 1) * 0.3);
  }

  private assessTrendMomentum(results: any[]): 'high' | 'medium' | 'low' {
    const recentIndicators = results.filter(r => 
      r.title.toLowerCase().includes('trending') || 
      r.snippet.toLowerCase().includes('viral')
    ).length;
    
    if (recentIndicators >= 3) return 'high';
    if (recentIndicators >= 1) return 'medium';
    return 'low';
  }

  private extractCompetitorMentions(text: string): string[] {
    // Simple competitor extraction - could be enhanced with ML
    const commonBrands = ['nike', 'adidas', 'apple', 'google', 'microsoft', 'amazon', 'meta', 'tesla'];
    return commonBrands.filter(brand => 
      text.toLowerCase().includes(brand)
    );
  }

  private isCampaignContent(result: any): boolean {
    const campaignKeywords = ['campaign', 'marketing', 'strategy', 'launch', 'brand'];
    const content = `${result.title} ${result.snippet}`.toLowerCase();
    
    return campaignKeywords.some(keyword => content.includes(keyword));
  }

  private extractCampaignInsights(snippet: string): string[] {
    const insights: string[] = [];
    const content = snippet.toLowerCase();
    
    if (content.includes('launch')) insights.push('Product/campaign launch detected');
    if (content.includes('success')) insights.push('Successful campaign case study');
    if (content.includes('viral')) insights.push('Viral marketing strategy');
    if (content.includes('engagement')) insights.push('High engagement campaign');
    
    return insights;
  }
}

export const googleCustomSearchService = new GoogleCustomSearchService();