import { EnhancedBrightDataService } from './enhancedBrightDataService';
import { EnhancedAIAnalyzer } from './enhancedAIAnalyzer';

/**
 * Tier 2 Platform Service
 * Handles secondary platforms for comprehensive intelligence coverage
 */

export interface Tier2Source {
  name: string;
  displayName: string;
  category: string;
  tier: number;
  dataCollectionMethod: 'api' | 'scraping' | 'rss' | 'webhook';
  isActive: boolean;
  priority: number;
}

export class Tier2PlatformService {
  private brightDataService: EnhancedBrightDataService;
  private aiAnalyzer: EnhancedAIAnalyzer;

  // Tier 2 platforms for comprehensive coverage
  private tier2Sources: Tier2Source[] = [
    // Content Publishing Platforms
    {
      name: 'reddit',
      displayName: 'Reddit',
      category: 'community_intelligence',
      tier: 2,
      dataCollectionMethod: 'api',
      isActive: true,
      priority: 90
    },
    {
      name: 'youtube',
      displayName: 'YouTube',
      category: 'video_content',
      tier: 2,
      dataCollectionMethod: 'scraping',
      isActive: true,
      priority: 85
    },
    {
      name: 'substack',
      displayName: 'Substack',
      category: 'thought_leadership',
      tier: 2,
      dataCollectionMethod: 'rss',
      isActive: true,
      priority: 80
    },
    {
      name: 'hackernews',
      displayName: 'Hacker News',
      category: 'tech_intelligence',
      tier: 2,
      dataCollectionMethod: 'api',
      isActive: true,
      priority: 75
    },

    // Business Intelligence Platforms
    {
      name: 'producthunt',
      displayName: 'Product Hunt',
      category: 'product_intelligence',
      tier: 2,
      dataCollectionMethod: 'api',
      isActive: true,
      priority: 70
    },
    {
      name: 'angellist',
      displayName: 'AngelList',
      category: 'startup_intelligence',
      tier: 2,
      dataCollectionMethod: 'scraping',
      isActive: true,
      priority: 65
    },
    {
      name: 'crunchbase',
      displayName: 'Crunchbase',
      category: 'funding_intelligence',
      tier: 2,
      dataCollectionMethod: 'api',
      isActive: false, // Requires premium API
      priority: 60
    },

    // Media & Entertainment
    {
      name: 'spotify',
      displayName: 'Spotify',
      category: 'music_trends',
      tier: 2,
      dataCollectionMethod: 'api',
      isActive: true,
      priority: 55
    },
    {
      name: 'twitch',
      displayName: 'Twitch',
      category: 'gaming_culture',
      tier: 2,
      dataCollectionMethod: 'scraping',
      isActive: true,
      priority: 50
    },
    {
      name: 'pinterest',
      displayName: 'Pinterest',
      category: 'visual_trends',
      tier: 2,
      dataCollectionMethod: 'scraping',
      isActive: true,
      priority: 45
    },

    // Professional Networks
    {
      name: 'github',
      displayName: 'GitHub',
      category: 'developer_trends',
      tier: 2,
      dataCollectionMethod: 'api',
      isActive: true,
      priority: 70
    },
    {
      name: 'dribbble',
      displayName: 'Dribbble',
      category: 'design_trends',
      tier: 2,
      dataCollectionMethod: 'scraping',
      isActive: true,
      priority: 40
    },
    {
      name: 'behance',
      displayName: 'Behance',
      category: 'creative_trends',
      tier: 2,
      dataCollectionMethod: 'scraping',
      isActive: true,
      priority: 35
    }
  ];

  constructor() {
    this.brightDataService = new EnhancedBrightDataService();
    this.aiAnalyzer = new EnhancedAIAnalyzer();
  }

  /**
   * Get all Tier 2 sources
   */
  getTier2Sources(): Tier2Source[] {
    return this.tier2Sources.filter(source => source.isActive)
      .sort((a, b) => b.priority - a.priority);
  }

  /**
   * Fetch data from specific Tier 2 platform
   */
  async fetchPlatformData(platform: string, keywords: string[] = [], limit: number = 20): Promise<any[]> {
    const source = this.tier2Sources.find(s => s.name === platform);
    if (!source || !source.isActive) {
      console.warn(`[Tier 2] Platform ${platform} not available or inactive`);
      return [];
    }

    console.log(`[Tier 2] Fetching from ${platform} (${source.dataCollectionMethod})`);

    try {
      switch (platform) {
        case 'reddit':
          return this.fetchRedditContent(keywords, limit);
        
        case 'youtube':
          return this.fetchYouTubeContent(keywords, limit);
        
        case 'hackernews':
          return this.fetchHackerNewsContent(limit);
        
        case 'producthunt':
          return this.fetchProductHuntContent(limit);
        
        case 'github':
          return this.fetchGitHubTrends(keywords, limit);
        
        case 'substack':
          return this.fetchSubstackContent(keywords, limit);
        
        case 'spotify':
          return this.fetchSpotifyTrends(limit);
        
        default:
          console.log(`[Tier 2] ${platform} data collection not yet implemented`);
          return this.generateDemoData(platform, keywords, limit);
      }
    } catch (error) {
      console.error(`[Tier 2] Error fetching from ${platform}:`, error);
      return [];
    }
  }

  /**
   * Fetch Reddit trending content
   */
  private async fetchRedditContent(keywords: string[], limit: number): Promise<any[]> {
    // Use subreddits relevant to keywords or default trending subreddits
    const subreddits = keywords.length > 0 
      ? this.mapKeywordsToSubreddits(keywords)
      : ['technology', 'business', 'startup', 'marketing', 'futurology'];

    const content = [];
    
    for (const subreddit of subreddits.slice(0, 3)) {
      try {
        // This would use Reddit API or Bright Data Reddit scraper
        const demoData = this.generateRedditDemo(subreddit, limit / subreddits.length);
        content.push(...demoData);
      } catch (error) {
        console.error(`Error fetching r/${subreddit}:`, error);
      }
    }

    return content.slice(0, limit);
  }

  /**
   * Fetch YouTube trending content
   */
  private async fetchYouTubeContent(keywords: string[], limit: number): Promise<any[]> {
    // YouTube trending videos related to keywords
    const searchTerms = keywords.length > 0 ? keywords : ['tech trends', 'business innovation', 'startup'];
    
    return this.generateDemoData('youtube', searchTerms, limit);
  }

  /**
   * Fetch Hacker News trending content
   */
  private async fetchHackerNewsContent(limit: number): Promise<any[]> {
    // Hacker News top stories - can use their API
    return this.generateDemoData('hackernews', ['technology', 'startups'], limit);
  }

  /**
   * Fetch Product Hunt trending products
   */
  private async fetchProductHuntContent(limit: number): Promise<any[]> {
    // Product Hunt trending products
    return this.generateDemoData('producthunt', ['new products', 'innovation'], limit);
  }

  /**
   * Fetch GitHub trending repositories
   */
  private async fetchGitHubTrends(keywords: string[], limit: number): Promise<any[]> {
    // GitHub trending repos by language/topic
    return this.generateDemoData('github', keywords, limit);
  }

  /**
   * Fetch Substack trending newsletters
   */
  private async fetchSubstackContent(keywords: string[], limit: number): Promise<any[]> {
    // Substack trending posts and newsletters
    return this.generateDemoData('substack', keywords, limit);
  }

  /**
   * Fetch Spotify music trends
   */
  private async fetchSpotifyTrends(limit: number): Promise<any[]> {
    // Spotify trending tracks and playlists
    return this.generateDemoData('spotify', ['music trends'], limit);
  }

  /**
   * Map keywords to relevant subreddits
   */
  private mapKeywordsToSubreddits(keywords: string[]): string[] {
    const subredditMap: Record<string, string[]> = {
      'ai': ['MachineLearning', 'artificial', 'singularity'],
      'crypto': ['CryptoCurrency', 'Bitcoin', 'ethereum'],
      'startup': ['startups', 'entrepreneur', 'smallbusiness'],
      'tech': ['technology', 'programming', 'futurology'],
      'business': ['business', 'investing', 'economy'],
      'marketing': ['marketing', 'socialmedia', 'advertising']
    };

    const subreddits = new Set<string>();
    
    for (const keyword of keywords) {
      const lowerKeyword = keyword.toLowerCase();
      for (const [key, subs] of Object.entries(subredditMap)) {
        if (lowerKeyword.includes(key)) {
          subs.forEach(sub => subreddits.add(sub));
        }
      }
    }

    return Array.from(subreddits).slice(0, 5);
  }

  /**
   * Generate Reddit demo data
   */
  private generateRedditDemo(subreddit: string, limit: number): any[] {
    const posts = [
      { title: `[${subreddit}] Revolutionary AI breakthrough changes everything`, score: 2847 },
      { title: `[${subreddit}] This startup just raised $50M for innovative solution`, score: 1923 },
      { title: `[${subreddit}] Industry analysis: What's next for tech in 2025`, score: 1456 },
      { title: `[${subreddit}] Breaking: Major platform announces new features`, score: 1234 },
      { title: `[${subreddit}] Deep dive into emerging market trends`, score: 987 }
    ];

    return posts.slice(0, Math.ceil(limit)).map((post, i) => ({
      title: post.title,
      content: `Detailed discussion about ${post.title.toLowerCase()}`,
      url: `https://reddit.com/r/${subreddit}/post-${i}`,
      platform: 'reddit',
      category: this.categorizeContent(post.title),
      engagement: post.score,
      metadata: {
        subreddit,
        upvotes: post.score,
        comments: Math.floor(post.score * 0.1),
        demo: true
      }
    }));
  }

  /**
   * Generate demo data for Tier 2 platforms
   */
  private generateDemoData(platform: string, keywords: string[], limit: number): any[] {
    const demoContent: Record<string, any[]> = {
      youtube: [
        { title: 'The Future of AI in Business (2025 Predictions)', views: '1.2M', channel: 'TechInsights' },
        { title: 'Startup Success Stories: From Idea to IPO', views: '856K', channel: 'BusinessDaily' },
        { title: 'Web3 Revolution: What Every Entrepreneur Needs to Know', views: '634K', channel: 'CryptoStrategy' }
      ],
      hackernews: [
        { title: 'Show HN: Revolutionary new framework for AI development', points: 847 },
        { title: 'Startup raises $100M Series B for quantum computing breakthrough', points: 623 },
        { title: 'Analysis: The changing landscape of remote work technology', points: 456 }
      ],
      producthunt: [
        { title: 'AIWriter Pro - Generate content with advanced AI', votes: 1234 },
        { title: 'TeamSync - Revolutionize remote team collaboration', votes: 987 },
        { title: 'DataViz Studio - Beautiful charts and analytics', votes: 756 }
      ],
      github: [
        { title: 'trending-ai-framework', stars: 15678, language: 'Python' },
        { title: 'next-gen-web-tools', stars: 12345, language: 'JavaScript' },
        { title: 'blockchain-development-kit', stars: 9876, language: 'Solidity' }
      ],
      substack: [
        { title: 'The Weekly Tech Digest: AI, Startups, and Innovation', subscribers: '50K' },
        { title: 'Business Strategy Insights for Modern Entrepreneurs', subscribers: '35K' },
        { title: 'Future of Work: Remote, Hybrid, and Beyond', subscribers: '28K' }
      ],
      spotify: [
        { title: 'Focus Music for Programmers', streams: '2.3M' },
        { title: 'Startup Motivation Playlist', streams: '1.8M' },
        { title: 'Innovation Podcast Weekly', streams: '1.2M' }
      ]
    };

    const platformContent = demoContent[platform] || [];
    
    return platformContent.slice(0, limit).map((item, i) => ({
      title: item.title,
      content: `Content from ${platform}: ${item.title}`,
      url: `https://${platform}.com/content-${i}`,
      platform,
      category: this.categorizeContent(item.title),
      engagement: item.votes || item.stars || item.points || parseInt(item.views?.replace(/[^\d]/g, '') || '1000'),
      metadata: {
        ...item,
        demo: true,
        tier: 2,
        fetchedAt: new Date().toISOString()
      }
    }));
  }

  /**
   * Categorize content based on title and platform
   */
  private categorizeContent(title: string): string {
    const lowerTitle = title.toLowerCase();
    
    if (lowerTitle.includes('ai') || lowerTitle.includes('machine learning')) return 'ai_ml';
    if (lowerTitle.includes('startup') || lowerTitle.includes('entrepreneur')) return 'startup';
    if (lowerTitle.includes('crypto') || lowerTitle.includes('blockchain')) return 'crypto';
    if (lowerTitle.includes('tech') || lowerTitle.includes('programming')) return 'technology';
    if (lowerTitle.includes('business') || lowerTitle.includes('strategy')) return 'business';
    if (lowerTitle.includes('design') || lowerTitle.includes('creative')) return 'design';
    if (lowerTitle.includes('music') || lowerTitle.includes('entertainment')) return 'entertainment';
    
    return 'general';
  }

  /**
   * Get platform priority for intelligence gathering
   */
  getPlatformPriority(platform: string): number {
    const source = this.tier2Sources.find(s => s.name === platform);
    return source?.priority || 0;
  }

  /**
   * Check if platform supports real-time data
   */
  supportsRealTime(platform: string): boolean {
    const realTimePlatforms = ['reddit', 'hackernews', 'github', 'spotify'];
    return realTimePlatforms.includes(platform);
  }
}