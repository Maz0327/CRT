import axios from 'axios';

export interface BrightDataResponse {
  data: any[];
  status: string;
  total_items: number;
}

export interface BrightDataConfig {
  apiToken: string;
  baseUrl: string;
}

export class BrightDataService {
  private config: BrightDataConfig;

  constructor() {
    this.config = {
      apiToken: process.env.BRIGHT_DATA_API_TOKEN || '',
      // Primary Bright Data API endpoint - this is now the main data source
      baseUrl: 'https://api.brightdata.com/datasets/v3'
    };
  }

  private async makeRequest(datasetId: string, urls: string[], format: string = 'json'): Promise<any> {
    if (!this.config.apiToken) {
      throw new Error('Bright Data API token not configured');
    }

    const headers = {
      'Authorization': `Bearer ${this.config.apiToken}`,
      'Content-Type': 'application/json'
    };

    const requestData = urls.map(url => ({ url }));

    try {
      // Step 1: Trigger the collection job
      const triggerResponse = await axios.post(
        `${this.config.baseUrl}/trigger?dataset_id=${datasetId}&format=${format}`,
        requestData,
        { headers, timeout: 30000 }
      );

      const { snapshot_id } = triggerResponse.data;
      if (!snapshot_id) {
        throw new Error('No snapshot_id returned from trigger');
      }

      // Step 2: Poll for completion with exponential backoff
      let status = 'processing';
      let attempts = 0;
      const maxAttempts = 30; // 5 minutes max wait time
      
      while (status !== 'succeeded' && attempts < maxAttempts) {
        attempts++;
        const waitTime = Math.min(2000 + (attempts * 500), 10000); // Cap at 10s
        await new Promise(resolve => setTimeout(resolve, waitTime));
        
        const statusResponse = await axios.get(
          `${this.config.baseUrl}/snapshots/${snapshot_id}`,
          { headers, timeout: 15000 }
        );
        
        status = statusResponse.data.status;
        
        if (status === 'failed') {
          throw new Error(`Collection job failed: ${statusResponse.data.error || 'Unknown error'}`);
        }
      }

      if (status !== 'succeeded') {
        throw new Error(`Collection job timed out after ${maxAttempts} attempts`);
      }

      // Step 3: Fetch the actual results
      const resultsResponse = await axios.get(
        `${this.config.baseUrl}/snapshots/${snapshot_id}/items?format=${format}`,
        { headers, timeout: 30000 }
      );

      return resultsResponse.data;
    } catch (error: any) {
      console.error(`Bright Data API error for dataset ${datasetId}:`, error.response?.data || error.message);
      throw error;
    }
  }

  // Reddit trending posts
  async fetchRedditTrending(subreddits: string[] = ['all', 'popular', 'technology', 'worldnews']): Promise<any[]> {
    const datasetId = process.env.BRIGHT_DATA_REDDIT_COLLECTOR || 'gd_lwnyao9z6jl91hi0di'; // Reddit posts dataset ID
    const urls = subreddits.map(sub => `https://www.reddit.com/r/${sub}/hot/.json`);

    try {
      const response = await this.makeRequest(datasetId, urls);
      
      // Process Reddit data to extract trending posts
      const posts = [];
      if (response.data && Array.isArray(response.data)) {
        for (const item of response.data) {
          if (item.title && item.url) {
            posts.push({
              title: item.title,
              url: item.url,
              content: item.selftext || item.title,
              platform: 'reddit',
              category: this.categorizeContent(item.title, item.selftext),
              engagement: (item.ups || 0) + (item.num_comments || 0),
              metadata: {
                subreddit: item.subreddit,
                upvotes: item.ups || 0,
                comments: item.num_comments || 0,
                created: item.created_utc,
                author: item.author
              }
            });
          }
        }
      }
      
      return posts;
    } catch (error) {
      console.error('Error fetching Reddit data from Bright Data:', error);
      return [];
    }
  }

  // Instagram trending posts
  async fetchInstagramTrending(hashtags: string[] = ['trending', 'viral', 'tech', 'news']): Promise<any[]> {
    const datasetId = process.env.BRIGHT_DATA_INSTAGRAM_COLLECTOR || 'gd_ltppn085pokosxh13'; // Instagram posts dataset ID
    const urls = hashtags.map(tag => `https://www.instagram.com/explore/tags/${tag}/`);

    try {
      const response = await this.makeRequest(datasetId, urls);
      
      const posts = [];
      if (response.data && Array.isArray(response.data)) {
        for (const item of response.data) {
          if (item.description || item.caption) {
            posts.push({
              title: this.extractTitle(item.description || item.caption),
              url: item.post_url || `https://www.instagram.com/p/${item.post_id}/`,
              content: item.description || item.caption,
              platform: 'instagram',
              category: this.categorizeContent(item.description, item.caption),
              engagement: (item.likes || 0) + (item.comments_count || 0),
              metadata: {
                hashtags: item.hashtags || [],
                likes: item.likes || 0,
                comments: item.comments_count || 0,
                posted_at: item.date_posted,
                user: item.user_name
              }
            });
          }
        }
      }
      
      return posts;
    } catch (error) {
      console.error('Error fetching Instagram data from Bright Data:', error);
      return [];
    }
  }

  // YouTube trending videos
  async fetchYouTubeTrending(categories: string[] = ['trending', 'technology', 'news', 'entertainment']): Promise<any[]> {
    const datasetId = process.env.BRIGHT_DATA_YOUTUBE_COLLECTOR || 'gd_ly9m6la02qd59kqkt'; // YouTube videos dataset ID
    const urls = categories.map(cat => `https://www.youtube.com/results?search_query=${cat}&sp=CAMSAhAB`);

    try {
      const response = await this.makeRequest(datasetId, urls);
      
      const videos = [];
      if (response.data && Array.isArray(response.data)) {
        for (const item of response.data) {
          if (item.title && item.video_url) {
            videos.push({
              title: item.title,
              url: item.video_url,
              content: item.description || item.title,
              platform: 'youtube',
              category: this.categorizeContent(item.title, item.description),
              engagement: parseInt(item.view_count || '0'),
              metadata: {
                channel: item.channel_name,
                views: item.view_count,
                likes: item.likes,
                duration: item.duration,
                published_at: item.published_at,
                thumbnail: item.thumbnail_url
              }
            });
          }
        }
      }
      
      return videos;
    } catch (error) {
      console.error('Error fetching YouTube data from Bright Data:', error);
      return [];
    }
  }

  // TikTok trending videos
  async fetchTikTokTrending(hashtags: string[] = ['fyp', 'trending', 'viral', 'tech']): Promise<any[]> {
    const datasetId = process.env.BRIGHT_DATA_TIKTOK_COLLECTOR || 'gd_lyclm20il4r5helnj'; // TikTok videos dataset ID
    const urls = hashtags.map(tag => `https://www.tiktok.com/tag/${tag}`);

    try {
      const response = await this.makeRequest(datasetId, urls);
      
      const videos = [];
      if (response.data && Array.isArray(response.data)) {
        for (const item of response.data) {
          if (item.description && item.video_url) {
            videos.push({
              title: this.extractTitle(item.description),
              url: item.video_url,
              content: item.description,
              platform: 'tiktok',
              category: this.categorizeContent(item.description),
              engagement: (item.likes || 0) + (item.shares || 0) + (item.comments || 0),
              metadata: {
                hashtags: item.hashtags || [],
                likes: item.likes || 0,
                shares: item.shares || 0,
                comments: item.comments || 0,
                views: item.views || 0,
                user: item.user_name,
                posted_at: item.posted_at
              }
            });
          }
        }
      }
      
      return videos;
    } catch (error) {
      console.error('Error fetching TikTok data from Bright Data:', error);
      return [];
    }
  }

  // Twitter/X trending posts
  async fetchTwitterTrending(hashtags: string[] = ['trending', 'breaking', 'viral', 'tech']): Promise<any[]> {
    const datasetId = process.env.BRIGHT_DATA_TWITTER_COLLECTOR || 'gd_lx8n5kz91pc48jpis'; // Twitter posts dataset ID
    const urls = hashtags.map(tag => `https://twitter.com/hashtag/${tag}`);

    try {
      const response = await this.makeRequest(datasetId, urls);
      
      const tweets = [];
      if (response.data && Array.isArray(response.data)) {
        for (const item of response.data) {
          if (item.text && item.tweet_url) {
            tweets.push({
              title: this.extractTitle(item.text),
              url: item.tweet_url,
              content: item.text,
              platform: 'twitter',
              category: this.categorizeContent(item.text),
              engagement: (item.likes || 0) + (item.retweets || 0) + (item.replies || 0),
              metadata: {
                hashtags: item.hashtags || [],
                likes: item.likes || 0,
                retweets: item.retweets || 0,
                replies: item.replies || 0,
                user: item.user_name,
                posted_at: item.posted_at
              }
            });
          }
        }
      }
      
      return tweets;
    } catch (error) {
      console.error('Error fetching Twitter data from Bright Data:', error);
      return [];
    }
  }

  // Fetch all trending content from multiple platforms
  async fetchAllTrendingContent(): Promise<any[]> {
    try {
      const [redditPosts, instagramPosts, youtubeVideos, tiktokVideos, twitterPosts] = await Promise.all([
        this.fetchRedditTrending(),
        this.fetchInstagramTrending(),
        this.fetchYouTubeTrending(),
        this.fetchTikTokTrending(),
        this.fetchTwitterTrending()
      ]);

      const allContent = [
        ...redditPosts,
        ...instagramPosts,
        ...youtubeVideos,
        ...tiktokVideos,
        ...twitterPosts
      ];

      return allContent;
    } catch (error) {
      console.error('Error fetching all trending content:', error);
      return [];
    }
  }

  // Helper method to extract a title from content
  private extractTitle(content: string): string {
    if (!content) return 'Untitled';
    
    // Extract first sentence or first 100 characters
    const sentences = content.split(/[.!?]+/);
    const firstSentence = sentences[0]?.trim();
    
    if (firstSentence && firstSentence.length > 10) {
      return firstSentence.length > 100 ? firstSentence.slice(0, 100) + '...' : firstSentence;
    }
    
    return content.length > 100 ? content.slice(0, 100) + '...' : content;
  }

  // Helper method to categorize content
  private categorizeContent(title: string, content?: string): string {
    const text = `${title} ${content || ''}`.toLowerCase();
    
    // Technology keywords
    if (text.match(/\b(ai|artificial intelligence|tech|technology|software|app|startup|crypto|bitcoin|ethereum|nft|metaverse|vr|ar|apple|google|microsoft|tesla|spacex|openai|chatgpt)\b/)) {
      return 'technology';
    }
    
    // Pop culture keywords
    if (text.match(/\b(celebrity|music|movie|tv|show|netflix|disney|marvel|actor|actress|singer|rapper|kardashian|taylor swift|drake|kanye|beyonce|rihanna|justin|ariana)\b/)) {
      return 'pop-culture';
    }
    
    // Sports keywords
    if (text.match(/\b(sports|football|basketball|baseball|soccer|nfl|nba|mlb|fifa|olympics|lebron|curry|mahomes|brady|messi|ronaldo)\b/)) {
      return 'sports';
    }
    
    // Business keywords
    if (text.match(/\b(business|finance|stock|market|economy|wall street|nasdaq|dow|s&p|earnings|revenue|profit|investment|banking|recession|inflation)\b/)) {
      return 'business';
    }
    
    // Politics keywords
    if (text.match(/\b(politics|president|congress|senate|election|vote|democratic|republican|biden|trump|government|policy|law)\b/)) {
      return 'politics';
    }
    
    // Default to general
    return 'general';
  }
}