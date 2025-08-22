import axios from 'axios';

export interface ContentItem {
  title: string;
  url: string;
  content: string;
  platform: string;
  category: string;
  engagement?: number;
  metadata?: any;
}

export class ContentFetcher {
  private redditUserAgent = 'ContentRadarAgent/1.0';

  async fetchRedditTrends(subreddits: string[] = ['all', 'popular']): Promise<ContentItem[]> {
    const items: ContentItem[] = [];
    
    for (const subreddit of subreddits) {
      try {
        const response = await axios.get(`https://www.reddit.com/r/${subreddit}/hot.json?limit=25`, {
          headers: {
            'User-Agent': this.redditUserAgent
          }
        });

        const posts = response.data?.data?.children || [];
        
        for (const post of posts) {
          const data = post.data;
          if (data.selftext || data.url) {
            items.push({
              title: data.title,
              url: `https://reddit.com${data.permalink}`,
              content: data.selftext || data.title,
              platform: 'reddit',
              category: this.categorizeContent(data.title, data.selftext),
              engagement: data.ups + data.num_comments,
              metadata: {
                subreddit: data.subreddit,
                upvotes: data.ups,
                comments: data.num_comments,
                created: data.created_utc
              }
            });
          }
        }
      } catch (error) {
        console.error(`Error fetching from r/${subreddit}:`, error);
      }
    }
    
    return items;
  }

  async fetchYouTubeTrends(): Promise<ContentItem[]> {
    const apiKey = process.env.YOUTUBE_API_KEY || process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      console.warn('YouTube API key not found');
      return [];
    }

    try {
      const response = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
        params: {
          part: 'snippet,statistics',
          chart: 'mostPopular',
          regionCode: 'US',
          maxResults: 25,
          key: apiKey
        }
      });

      const videos = response.data.items || [];
      
      return videos.map((video: any) => ({
        title: video.snippet.title,
        url: `https://www.youtube.com/watch?v=${video.id}`,
        content: video.snippet.description || video.snippet.title,
        platform: 'youtube',
        category: this.categorizeContent(video.snippet.title, video.snippet.description),
        engagement: parseInt(video.statistics.viewCount || '0'),
        metadata: {
          channelTitle: video.snippet.channelTitle,
          publishedAt: video.snippet.publishedAt,
          viewCount: video.statistics.viewCount,
          likeCount: video.statistics.likeCount,
          commentCount: video.statistics.commentCount
        }
      }));
    } catch (error) {
      console.error('Error fetching YouTube trends:', error);
      return [];
    }
  }

  async fetchNewsTrends(): Promise<ContentItem[]> {
    const apiKey = process.env.NEWS_API_KEY || process.env.NEWSAPI_KEY;
    if (!apiKey) {
      console.warn('News API key not found');
      return [];
    }

    try {
      const response = await axios.get('https://newsapi.org/v2/top-headlines', {
        params: {
          country: 'us',
          pageSize: 25,
          apiKey: apiKey
        }
      });

      const articles = response.data.articles || [];
      
      return articles.map((article: any) => ({
        title: article.title,
        url: article.url,
        content: article.description || article.content || article.title,
        platform: 'news',
        category: this.categorizeContent(article.title, article.description),
        engagement: 0, // News API doesn't provide engagement metrics
        metadata: {
          source: article.source.name,
          author: article.author,
          publishedAt: article.publishedAt,
          urlToImage: article.urlToImage
        }
      }));
    } catch (error) {
      console.error('Error fetching news trends:', error);
      return [];
    }
  }

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

  async fetchAllTrends(): Promise<ContentItem[]> {
    const [redditItems, youtubeItems, newsItems] = await Promise.all([
      this.fetchRedditTrends(),
      this.fetchYouTubeTrends(),
      this.fetchNewsTrends()
    ]);
    
    return [...redditItems, ...youtubeItems, ...newsItems];
  }
}
