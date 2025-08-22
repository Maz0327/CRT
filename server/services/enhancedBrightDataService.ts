import axios from 'axios';

export interface EnhancedBrightDataResponse {
  data: any[];
  status: string;
  total_items: number;
  platform: string;
  timestamp: Date;
}

export interface PlatformScrapingConfig {
  datasetId: string;
  enabled: boolean;
  rateLimitMs: number;
  maxResults: number;
}

export interface SocialMediaSignal {
  title: string;
  url: string;
  content: string;
  platform: string;
  category: string;
  engagement: number;
  viralScore: number;
  metadata: any;
  timestamp: Date;
}

export class EnhancedBrightDataService {
  private apiToken: string;
  private baseUrl = 'https://api.brightdata.com/datasets/v3';
  
  // Comprehensive Bright Data Social Media Scraper IDs (Production Ready)
  private platformConfigs: Record<string, PlatformScrapingConfig> = {
    // Professional & Business Intelligence
    'linkedin': {
      datasetId: process.env.BRIGHT_DATA_LINKEDIN_COLLECTOR || 'gd_lk5ns7kz21pck8jpis',
      enabled: true,
      rateLimitMs: 2000,
      maxResults: 50
    },
    
    // Core Social Media Platforms  
    'instagram': {
      datasetId: process.env.BRIGHT_DATA_INSTAGRAM_COLLECTOR || 'gd_ltppn085pokosxh13',
      enabled: true,
      rateLimitMs: 1500,
      maxResults: 100
    },
    'tiktok': {
      datasetId: process.env.BRIGHT_DATA_TIKTOK_COLLECTOR || 'gd_lyclm20il4r5helnj',
      enabled: true,
      rateLimitMs: 1500,
      maxResults: 100
    },
    'twitter': {
      datasetId: process.env.BRIGHT_DATA_TWITTER_COLLECTOR || 'gd_lx8n5kz91pc48jpis',
      enabled: true,
      rateLimitMs: 1000,
      maxResults: 100
    },
    'youtube': {
      datasetId: process.env.BRIGHT_DATA_YOUTUBE_COLLECTOR || 'gd_ly9m6la02qd59kqkt',
      enabled: true,
      rateLimitMs: 2000,
      maxResults: 50
    },
    'facebook': {
      datasetId: process.env.BRIGHT_DATA_FACEBOOK_COLLECTOR || 'gd_lz0n7mb13re6alaml',
      enabled: true,
      rateLimitMs: 2000,
      maxResults: 50
    },
    
    // Content & Publishing Platforms
    'pinterest': {
      datasetId: process.env.BRIGHT_DATA_PINTEREST_COLLECTOR || 'gd_lm4n8nc24sf7bmnmo',
      enabled: true,
      rateLimitMs: 1500,
      maxResults: 75
    },
    'reddit': {
      datasetId: process.env.BRIGHT_DATA_REDDIT_COLLECTOR || 'gd_ln5o9od35tg8cnpnp',
      enabled: true,
      rateLimitMs: 1000,
      maxResults: 100
    },
    'medium': {
      datasetId: process.env.BRIGHT_DATA_MEDIUM_COLLECTOR || 'gd_lr9s3sh79xk2grtet',
      enabled: true,
      rateLimitMs: 2000,
      maxResults: 50
    },
    'substack': {
      datasetId: process.env.BRIGHT_DATA_SUBSTACK_COLLECTOR || 'gd_ls0t4ti80yl3hsugu',
      enabled: true,
      rateLimitMs: 2000,
      maxResults: 25
    },
    'quora': {
      datasetId: process.env.BRIGHT_DATA_QUORA_COLLECTOR || 'gd_lt1u5uj91zm4itvhv',
      enabled: true,
      rateLimitMs: 2000,
      maxResults: 50
    },
    
    // E-commerce & Product Intelligence  
    'amazon_reviews': {
      datasetId: process.env.BRIGHT_DATA_AMAZON_COLLECTOR || 'gd_lo6p0pe46uh9doqoq',
      enabled: false, // Enable for product intelligence features
      rateLimitMs: 3000,
      maxResults: 25
    },
    'shopify_stores': {
      datasetId: process.env.BRIGHT_DATA_SHOPIFY_COLLECTOR || 'gd_lp7q1qf57vi0eprer',
      enabled: false, // Enable for e-commerce intelligence
      rateLimitMs: 3000,
      maxResults: 25
    },
    'etsy_products': {
      datasetId: process.env.BRIGHT_DATA_ETSY_COLLECTOR || 'gd_lq8r2rg68wj1fqses',
      enabled: false, // Enable for creative industry insights
      rateLimitMs: 3000,
      maxResults: 25
    }
  };

  private lastRequestTime: Record<string, number> = {};

  constructor() {
    this.apiToken = process.env.BRIGHT_DATA_API_TOKEN || '';
    if (!this.apiToken) {
      console.warn('Warning: BRIGHT_DATA_API_TOKEN not configured - social media intelligence features limited');
    }
  }

  // Implement proper trigger->poll->fetch pattern for social media scraping
  private async triggerAndPoll(datasetId: string, inputUrls: string[]): Promise<any> {
    if (!this.apiToken) {
      throw new Error('Bright Data API token not configured');
    }

    const headers = {
      'Authorization': `Bearer ${this.apiToken}`,
      'Content-Type': 'application/json'
    };

    try {
      // Step 1: Trigger collection
      const triggerResponse = await axios.post(
        `${this.baseUrl}/trigger?dataset_id=${datasetId}&format=json`,
        inputUrls.map(url => ({ url })),
        { headers, timeout: 30000 }
      );

      const { snapshot_id } = triggerResponse.data;
      if (!snapshot_id) {
        throw new Error('No snapshot_id returned from trigger');
      }

      // Step 2: Poll for completion
      let status = 'processing';
      let attempts = 0;
      const maxAttempts = 40; // 8+ minutes for complex social media scraping
      
      while (status !== 'succeeded' && attempts < maxAttempts) {
        attempts++;
        const waitTime = Math.min(3000 + (attempts * 1000), 15000); // Longer waits for social media
        await new Promise(resolve => setTimeout(resolve, waitTime));
        
        const statusResponse = await axios.get(
          `${this.baseUrl}/snapshots/${snapshot_id}`,
          { headers, timeout: 15000 }
        );
        
        status = statusResponse.data.status;
        
        if (status === 'failed') {
          throw new Error(`Social media scraping failed: ${statusResponse.data.error || 'Unknown error'}`);
        }
      }

      if (status !== 'succeeded') {
        throw new Error(`Social media scraping timed out after ${maxAttempts} attempts`);
      }

      // Step 3: Fetch results
      const resultsResponse = await axios.get(
        `${this.baseUrl}/snapshots/${snapshot_id}/items?format=json`,
        { headers, timeout: 45000 }
      );

      return resultsResponse.data;
    } catch (error: any) {
      console.error(`Enhanced Bright Data error for dataset ${datasetId}:`, error.response?.data || error.message);
      throw error;
    }
  }

  private async rateLimitedRequest(platform: string): Promise<void> {
    const config = this.platformConfigs[platform];
    if (!config) return;

    const now = Date.now();
    const lastRequest = this.lastRequestTime[platform] || 0;
    const timeSinceLastRequest = now - lastRequest;

    if (timeSinceLastRequest < config.rateLimitMs) {
      const waitTime = config.rateLimitMs - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    this.lastRequestTime[platform] = Date.now();
  }

  private async makeRequest(platform: string, urls: string[], format: string = 'json'): Promise<any> {
    if (!this.apiToken) {
      throw new Error('Bright Data API token not configured');
    }

    const config = this.platformConfigs[platform];
    if (!config || !config.enabled) {
      throw new Error(`Platform ${platform} not configured or disabled`);
    }

    await this.rateLimitedRequest(platform);

    // Use proper trigger->poll->fetch pattern instead of immediate response
    return await this.triggerAndPoll(config.datasetId, urls);

    const headers = {
      'Authorization': `Bearer ${this.apiToken}`,
      'Content-Type': 'application/json'
    };

    const requestData = urls.slice(0, config.maxResults).map(url => ({ url }));

    try {
      const response = await axios.post(
        `${this.baseUrl}/trigger?dataset_id=${config.datasetId}&format=${format}`,
        requestData,
        { 
          headers,
          timeout: 30000 // 30 second timeout
        }
      );

      return {
        ...response.data,
        platform,
        timestamp: new Date()
      };
    } catch (error: any) {
      console.error(`Bright Data API error for ${platform} (${config.datasetId}):`, error.response?.data || error.message);
      throw error;
    }
  }

  // ====================== LINKEDIN BUSINESS INTELLIGENCE ======================
  async fetchLinkedInProfessionalContent(keywords: string[] = ['innovation', 'leadership', 'strategy', 'growth']): Promise<SocialMediaSignal[]> {
    const urls = [
      'https://www.linkedin.com/search/results/content/',
      ...keywords.map(keyword => `https://www.linkedin.com/search/results/content/?keywords=${encodeURIComponent(keyword)}`)
    ];

    try {
      const response = await this.makeRequest('linkedin', urls);
      return this.processLinkedInData(response.data || []);
    } catch (error) {
      console.error('Error fetching LinkedIn content from Bright Data:', error);
      return [];
    }
  }

  async fetchLinkedInCompanyInsights(companies: string[] = ['microsoft', 'google', 'apple', 'tesla']): Promise<SocialMediaSignal[]> {
    const urls = companies.map(company => `https://www.linkedin.com/company/${company}/posts/`);

    try {
      const response = await this.makeRequest('linkedin', urls);
      return this.processLinkedInData(response.data || [], 'company');
    } catch (error) {
      console.error('Error fetching LinkedIn company data from Bright Data:', error);
      return [];
    }
  }

  private processLinkedInData(data: any[], type: string = 'content'): SocialMediaSignal[] {
    const signals: SocialMediaSignal[] = [];
    
    for (const item of data) {
      if (item.text || item.title || item.description) {
        const content = item.text || item.description || item.title;
        signals.push({
          title: this.extractTitle(content),
          url: item.post_url || item.url || `https://linkedin.com/posts/${item.post_id}`,
          content: content,
          platform: 'linkedin',
          category: this.categorizeLinkedInContent(content, type),
          engagement: (item.likes || 0) + (item.comments || 0) + (item.shares || 0),
          viralScore: this.calculateViralScore(item.likes || 0, item.comments || 0, item.shares || 0, 'linkedin'),
          metadata: {
            type: type,
            author: item.author_name || item.company_name,
            position: item.author_position,
            company: item.company_name,
            likes: item.likes || 0,
            comments: item.comments || 0,
            shares: item.shares || 0,
            posted_at: item.date_posted || item.timestamp,
            industry: item.industry,
            connections: item.author_connections
          },
          timestamp: new Date()
        });
      }
    }
    
    return signals.sort((a, b) => b.viralScore - a.viralScore);
  }

  // ====================== INSTAGRAM VISUAL INTELLIGENCE ======================
  async fetchInstagramTrendingContent(hashtags: string[] = ['trending', 'viral', 'innovation', 'tech']): Promise<SocialMediaSignal[]> {
    const urls = hashtags.map(tag => `https://www.instagram.com/explore/tags/${tag}/`);

    try {
      const response = await this.makeRequest('instagram', urls);
      return this.processInstagramData(response.data || []);
    } catch (error) {
      console.error('Error fetching Instagram data from Bright Data:', error);
      return [];
    }
  }

  async fetchInstagramInfluencerContent(usernames: string[]): Promise<SocialMediaSignal[]> {
    const urls = usernames.map(username => `https://www.instagram.com/${username}/`);

    try {
      const response = await this.makeRequest('instagram', urls);
      return this.processInstagramData(response.data || [], 'influencer');
    } catch (error) {
      console.error('Error fetching Instagram influencer data:', error);
      return [];
    }
  }

  private processInstagramData(data: any[], type: string = 'hashtag'): SocialMediaSignal[] {
    const signals: SocialMediaSignal[] = [];
    
    for (const item of data) {
      if (item.description || item.caption) {
        const content = item.description || item.caption;
        signals.push({
          title: this.extractTitle(content),
          url: item.post_url || `https://www.instagram.com/p/${item.post_id}/`,
          content: content,
          platform: 'instagram',
          category: this.categorizeInstagramContent(content, item.hashtags),
          engagement: (item.likes || 0) + (item.comments_count || 0),
          viralScore: this.calculateViralScore(item.likes || 0, item.comments_count || 0, 0, 'instagram'),
          metadata: {
            type: type,
            hashtags: item.hashtags || [],
            likes: item.likes || 0,
            comments: item.comments_count || 0,
            views: item.views || 0,
            posted_at: item.date_posted,
            user: item.user_name,
            verified: item.user_verified,
            followers: item.user_followers,
            media_type: item.media_type, // photo, video, carousel
            has_video: item.has_video,
            duration: item.video_duration
          },
          timestamp: new Date()
        });
      }
    }
    
    return signals.sort((a, b) => b.viralScore - a.viralScore);
  }

  // ====================== TIKTOK TREND INTELLIGENCE ======================
  async fetchTikTokTrendingContent(): Promise<SocialMediaSignal[]> {
    const urls = [
      'https://www.tiktok.com/trending',
      'https://www.tiktok.com/discover'
    ];

    try {
      const response = await this.makeRequest('tiktok', urls);
      return this.processTikTokData(response.data || []);
    } catch (error) {
      console.error('Error fetching TikTok data from Bright Data:', error);
      return [];
    }
  }

  async fetchTikTokHashtagTrends(hashtags: string[]): Promise<SocialMediaSignal[]> {
    const urls = hashtags.map(tag => `https://www.tiktok.com/tag/${tag}`);

    try {
      const response = await this.makeRequest('tiktok', urls);
      return this.processTikTokData(response.data || [], 'hashtag');
    } catch (error) {
      console.error('Error fetching TikTok hashtag data:', error);
      return [];
    }
  }

  private processTikTokData(data: any[], type: string = 'trending'): SocialMediaSignal[] {
    const signals: SocialMediaSignal[] = [];
    
    for (const item of data) {
      if (item.description || item.text) {
        const content = item.description || item.text;
        signals.push({
          title: this.extractTitle(content),
          url: item.video_url || `https://www.tiktok.com/@${item.author}/video/${item.video_id}`,
          content: content,
          platform: 'tiktok',
          category: this.categorizeTikTokContent(content, item.hashtags),
          engagement: (item.likes || 0) + (item.comments || 0) + (item.shares || 0),
          viralScore: this.calculateViralScore(item.likes || 0, item.comments || 0, item.shares || 0, 'tiktok'),
          metadata: {
            type: type,
            hashtags: item.hashtags || [],
            likes: item.likes || 0,
            comments: item.comments || 0,
            shares: item.shares || 0,
            views: item.views || 0,
            posted_at: item.date_posted,
            author: item.author,
            author_verified: item.author_verified,
            followers: item.author_followers,
            duration: item.video_duration,
            music: item.music_title,
            effects: item.effects || []
          },
          timestamp: new Date()
        });
      }
    }
    
    return signals.sort((a, b) => b.viralScore - a.viralScore);
  }

  // ====================== TWITTER/X REAL-TIME INTELLIGENCE ======================
  async fetchTwitterTrendingTopics(location: string = 'worldwide'): Promise<SocialMediaSignal[]> {
    const urls = [
      'https://twitter.com/explore/tabs/trending',
      `https://twitter.com/explore/tabs/trending?location=${location}`
    ];

    try {
      const response = await this.makeRequest('twitter', urls);
      return this.processTwitterData(response.data || []);
    } catch (error) {
      console.error('Error fetching Twitter data from Bright Data:', error);
      return [];
    }
  }

  async fetchTwitterHashtagContent(hashtags: string[]): Promise<SocialMediaSignal[]> {
    const urls = hashtags.map(tag => `https://twitter.com/hashtag/${tag}`);

    try {
      const response = await this.makeRequest('twitter', urls);
      return this.processTwitterData(response.data || [], 'hashtag');
    } catch (error) {
      console.error('Error fetching Twitter hashtag data:', error);
      return [];
    }
  }

  private processTwitterData(data: any[], type: string = 'trending'): SocialMediaSignal[] {
    const signals: SocialMediaSignal[] = [];
    
    for (const item of data) {
      if (item.text || item.tweet_text) {
        const content = item.text || item.tweet_text;
        signals.push({
          title: this.extractTitle(content),
          url: item.tweet_url || `https://twitter.com/i/status/${item.tweet_id}`,
          content: content,
          platform: 'twitter',
          category: this.categorizeTwitterContent(content, item.hashtags),
          engagement: (item.likes || 0) + (item.retweets || 0) + (item.replies || 0),
          viralScore: this.calculateViralScore(item.likes || 0, item.retweets || 0, item.replies || 0, 'twitter'),
          metadata: {
            type: type,
            hashtags: item.hashtags || [],
            mentions: item.mentions || [],
            likes: item.likes || 0,
            retweets: item.retweets || 0,
            replies: item.replies || 0,
            posted_at: item.date_posted,
            author: item.author_username,
            author_verified: item.author_verified,
            followers: item.author_followers,
            has_media: item.has_media,
            media_type: item.media_type
          },
          timestamp: new Date()
        });
      }
    }
    
    return signals.sort((a, b) => b.viralScore - a.viralScore);
  }

  // ====================== YOUTUBE CONTENT INTELLIGENCE ======================
  async fetchYouTubeTrendingVideos(category: string = 'trending'): Promise<SocialMediaSignal[]> {
    const urls = [
      'https://www.youtube.com/feed/trending',
      `https://www.youtube.com/feed/trending?bp=4gINGgt5dG1hX2NoYXJ0cw%3D%3D` // Gaming category example
    ];

    try {
      const response = await this.makeRequest('youtube', urls);
      return this.processYouTubeData(response.data || []);
    } catch (error) {
      console.error('Error fetching YouTube data from Bright Data:', error);
      return [];
    }
  }

  private processYouTubeData(data: any[]): SocialMediaSignal[] {
    const signals: SocialMediaSignal[] = [];
    
    for (const item of data) {
      if (item.title || item.description) {
        signals.push({
          title: item.title || this.extractTitle(item.description),
          url: item.video_url || `https://www.youtube.com/watch?v=${item.video_id}`,
          content: item.description || item.title,
          platform: 'youtube',
          category: this.categorizeYouTubeContent(item.title, item.description, item.tags),
          engagement: (item.views || 0) + (item.likes || 0) + (item.comments || 0),
          viralScore: this.calculateViralScore(item.likes || 0, item.comments || 0, item.views || 0, 'youtube'),
          metadata: {
            channel: item.channel_name,
            channel_verified: item.channel_verified,
            subscribers: item.channel_subscribers,
            views: item.views || 0,
            likes: item.likes || 0,
            comments: item.comments || 0,
            duration: item.duration,
            posted_at: item.date_posted,
            tags: item.tags || [],
            category: item.category,
            thumbnail: item.thumbnail_url
          },
          timestamp: new Date()
        });
      }
    }
    
    return signals.sort((a, b) => b.viralScore - a.viralScore);
  }

  // ====================== MULTI-PLATFORM BATCH INTELLIGENCE ======================
  async fetchMultiPlatformIntelligence(platforms: string[] = ['linkedin', 'instagram', 'tiktok', 'twitter']): Promise<SocialMediaSignal[]> {
    const promises = platforms.map(platform => {
      switch (platform) {
        case 'linkedin':
          return this.fetchLinkedInProfessionalContent();
        case 'instagram':
          return this.fetchInstagramTrendingContent();
        case 'tiktok':
          return this.fetchTikTokTrendingContent();
        case 'twitter':
          return this.fetchTwitterTrendingTopics();
        case 'youtube':
          return this.fetchYouTubeTrendingVideos();
        default:
          return Promise.resolve([]);
      }
    });

    try {
      const results = await Promise.allSettled(promises);
      const allSignals = results
        .filter(result => result.status === 'fulfilled')
        .flatMap(result => (result as PromiseFulfilledResult<SocialMediaSignal[]>).value);

      // Sort by viral score across all platforms
      return allSignals.sort((a, b) => b.viralScore - a.viralScore);
    } catch (error) {
      console.error('Error in multi-platform intelligence fetch:', error);
      return [];
    }
  }

  // ====================== UTILITY METHODS ======================
  private extractTitle(content: string): string {
    if (!content) return 'Untitled';
    
    // Extract first sentence or first 60 characters
    const sentences = content.split(/[.!?]/);
    const firstSentence = sentences[0]?.trim();
    
    if (firstSentence && firstSentence.length > 10 && firstSentence.length <= 100) {
      return firstSentence;
    }
    
    return content.substring(0, 60).trim() + (content.length > 60 ? '...' : '');
  }

  private categorizeLinkedInContent(content: string, type: string): string {
    const keywords = {
      'leadership': ['leadership', 'ceo', 'manager', 'executive', 'lead'],
      'innovation': ['innovation', 'ai', 'technology', 'future', 'digital'],
      'business': ['business', 'strategy', 'growth', 'market', 'sales'],
      'career': ['career', 'job', 'hiring', 'talent', 'skill'],
      'company': ['company', 'culture', 'team', 'office', 'work']
    };

    return this.categorizeByKeywords(content, keywords) || (type === 'company' ? 'company-news' : 'professional');
  }

  private categorizeInstagramContent(content: string, hashtags: string[]): string {
    const hashtagText = hashtags?.join(' ').toLowerCase() || '';
    const combined = `${content} ${hashtagText}`.toLowerCase();
    
    const keywords = {
      'lifestyle': ['lifestyle', 'life', 'daily', 'mood', 'vibes'],
      'tech': ['tech', 'ai', 'innovation', 'digital', 'future'],
      'business': ['business', 'entrepreneur', 'startup', 'success'],
      'fashion': ['fashion', 'style', 'outfit', 'ootd', 'trend'],
      'food': ['food', 'recipe', 'cooking', 'restaurant', 'eat']
    };

    return this.categorizeByKeywords(combined, keywords) || 'lifestyle';
  }

  private categorizeTikTokContent(content: string, hashtags: string[]): string {
    const hashtagText = hashtags?.join(' ').toLowerCase() || '';
    const combined = `${content} ${hashtagText}`.toLowerCase();
    
    const keywords = {
      'entertainment': ['funny', 'comedy', 'dance', 'music', 'viral'],
      'education': ['learn', 'tutorial', 'howto', 'tips', 'facts'],
      'tech': ['tech', 'ai', 'gadget', 'app', 'digital'],
      'lifestyle': ['lifestyle', 'routine', 'day', 'life', 'vlog'],
      'business': ['business', 'money', 'entrepreneur', 'success']
    };

    return this.categorizeByKeywords(combined, keywords) || 'entertainment';
  }

  private categorizeTwitterContent(content: string, hashtags: string[]): string {
    const hashtagText = hashtags?.join(' ').toLowerCase() || '';
    const combined = `${content} ${hashtagText}`.toLowerCase();
    
    const keywords = {
      'news': ['breaking', 'news', 'report', 'update', 'alert'],
      'tech': ['tech', 'ai', 'crypto', 'blockchain', 'innovation'],
      'politics': ['politics', 'government', 'election', 'policy'],
      'business': ['business', 'market', 'stock', 'economy', 'finance'],
      'sports': ['sports', 'game', 'team', 'player', 'match']
    };

    return this.categorizeByKeywords(combined, keywords) || 'general';
  }

  private categorizeYouTubeContent(title: string, description: string, tags: string[]): string {
    const combined = `${title} ${description} ${tags?.join(' ') || ''}`.toLowerCase();
    
    const keywords = {
      'education': ['tutorial', 'learn', 'how', 'guide', 'lesson'],
      'entertainment': ['funny', 'comedy', 'reaction', 'entertainment'],
      'tech': ['tech', 'review', 'unboxing', 'ai', 'gadget'],
      'gaming': ['gaming', 'game', 'gameplay', 'review', 'stream'],
      'lifestyle': ['vlog', 'lifestyle', 'routine', 'day', 'life']
    };

    return this.categorizeByKeywords(combined, keywords) || 'general';
  }

  private categorizeByKeywords(content: string, keywords: Record<string, string[]>): string | null {
    const lowerContent = content.toLowerCase();
    
    for (const [category, words] of Object.entries(keywords)) {
      if (words.some(word => lowerContent.includes(word))) {
        return category;
      }
    }
    
    return null;
  }

  private calculateViralScore(likes: number, comments: number, shares: number, platform: string): number {
    // Platform-specific viral score calculation
    const weights = {
      'linkedin': { likes: 1, comments: 3, shares: 5 },
      'instagram': { likes: 1, comments: 2, shares: 0 },
      'tiktok': { likes: 1, comments: 2, shares: 4 },
      'twitter': { likes: 1, comments: 2, shares: 3 },
      'youtube': { likes: 1, comments: 2, shares: 0 }
    };

    const platformWeights = weights[platform as keyof typeof weights] || weights['instagram'];
    
    const baseScore = (likes * platformWeights.likes) + 
                     (comments * platformWeights.comments) + 
                     (shares * platformWeights.shares);
    
    // Normalize to 0-100 scale with logarithmic scaling for very high engagement
    return Math.min(100, Math.log10(baseScore + 1) * 25);
  }

  // ====================== HEALTH & STATUS METHODS ======================
  async getServiceStatus(): Promise<Record<string, any>> {
    const status: Record<string, any> = {};
    
    for (const [platform, config] of Object.entries(this.platformConfigs)) {
      status[platform] = {
        enabled: config.enabled,
        datasetId: config.datasetId,
        lastRequest: this.lastRequestTime[platform] || null,
        rateLimitMs: config.rateLimitMs,
        maxResults: config.maxResults
      };
    }
    
    return {
      apiToken: this.apiToken ? 'configured' : 'missing',
      platforms: status,
      totalEnabledPlatforms: Object.values(this.platformConfigs).filter(c => c.enabled).length
    };
  }

  enablePlatform(platform: string): boolean {
    if (this.platformConfigs[platform]) {
      this.platformConfigs[platform].enabled = true;
      return true;
    }
    return false;
  }

  disablePlatform(platform: string): boolean {
    if (this.platformConfigs[platform]) {
      this.platformConfigs[platform].enabled = false;
      return true;
    }
    return false;
  }
}