import { EnhancedAIAnalyzer } from './enhancedAIAnalyzer';
import { TruthAnalysisFramework } from './truthAnalysisFramework';

/**
 * Chrome Extension Service
 * Handles content capture and real-time analysis from Chrome extension
 */

export interface CapturedContent {
  id: string;
  url: string;
  title: string;
  content: string;
  platform: string;
  timestamp: Date;
  metadata: {
    domain: string;
    contentType: 'article' | 'post' | 'video' | 'image' | 'other';
    engagement?: number;
    author?: string;
    tags?: string[];
    [key: string]: any; // index signature
  };
  [key: string]: any; // index signature
}

export interface ExtensionAnalysis {
  content: CapturedContent;
  truthAnalysis: any;
  viralPotential: number;
  culturalRelevance: number;
  strategicValue: 'high' | 'medium' | 'low';
  recommendations: string[];
}

export class ChromeExtensionService {
  private aiAnalyzer: EnhancedAIAnalyzer;
  private truthFramework: TruthAnalysisFramework;

  constructor() {
    this.aiAnalyzer = new EnhancedAIAnalyzer();
    this.truthFramework = new TruthAnalysisFramework();
  }

  /**
   * Process content captured from Chrome extension
   */
  async processCapturedContent(contentData: any): Promise<ExtensionAnalysis> {
    try {
      console.log(`[Chrome Extension] Processing content from ${contentData.url}`);

      // Create captured content object
      const content: CapturedContent = {
        id: `ext_${Date.now()}`,
        url: contentData.url,
        title: contentData.title || 'Untitled',
        content: contentData.content || contentData.text || '',
        platform: this.detectPlatform(contentData.url),
        timestamp: new Date(),
        metadata: {
          domain: new URL(contentData.url).hostname,
          contentType: this.detectContentType(contentData),
          engagement: contentData.engagement || 0,
          author: contentData.author,
          tags: contentData.tags || []
        }
      };

      // Perform truth analysis
      const truthAnalysis = await this.truthFramework.analyzeContent(
        content.content,
        content.platform,
        content.metadata
      );

      // Calculate viral potential
      const viralPotential = this.calculateViralPotential(content, truthAnalysis);

      // Assess cultural relevance
      const culturalRelevance = this.assessCulturalRelevance(content, truthAnalysis);

      // Determine strategic value
      const strategicValue = this.determineStrategicValue(viralPotential, culturalRelevance, truthAnalysis);

      // Generate recommendations
      const recommendations = await this.generateRecommendations(content, truthAnalysis, strategicValue);

      return {
        content,
        truthAnalysis,
        viralPotential,
        culturalRelevance,
        strategicValue,
        recommendations
      };

    } catch (error) {
      console.error('[Chrome Extension] Error processing content:', error);
      const msg = (error as Error)?.message ?? String(error);
      throw new Error(`Failed to process captured content: ${msg}`);
    }
  }

  /**
   * Detect platform from URL
   */
  private detectPlatform(url: string): string {
    const hostname = new URL(url).hostname.toLowerCase();
    
    if (hostname.includes('twitter.com') || hostname.includes('x.com')) return 'twitter';
    if (hostname.includes('linkedin.com')) return 'linkedin';
    if (hostname.includes('instagram.com')) return 'instagram';
    if (hostname.includes('tiktok.com')) return 'tiktok';
    if (hostname.includes('youtube.com')) return 'youtube';
    if (hostname.includes('reddit.com')) return 'reddit';
    if (hostname.includes('medium.com')) return 'medium';
    if (hostname.includes('substack.com')) return 'substack';
    if (hostname.includes('hackernews.com') || hostname.includes('news.ycombinator.com')) return 'hackernews';
    if (hostname.includes('producthunt.com')) return 'producthunt';
    if (hostname.includes('github.com')) return 'github';
    
    return 'web';
  }

  /**
   * Detect content type from content data
   */
  private detectContentType(contentData: any): 'article' | 'post' | 'video' | 'image' | 'other' {
    if (contentData.contentType) return contentData.contentType;
    
    const url = contentData.url.toLowerCase();
    const content = (contentData.content || contentData.text || '').toLowerCase();
    
    if (url.includes('youtube.com/watch') || url.includes('vimeo.com') || content.includes('video')) {
      return 'video';
    }
    
    if (url.includes('.jpg') || url.includes('.png') || url.includes('.gif') || content.includes('image')) {
      return 'image';
    }
    
    if (content.length > 1000 || url.includes('article') || url.includes('blog')) {
      return 'article';
    }
    
    return 'post';
  }

  /**
   * Calculate viral potential score
   */
  private calculateViralPotential(content: CapturedContent, truthAnalysis: any): number {
    let score = 0;
    
    // Base score from truth analysis confidence
    score += truthAnalysis.confidence * 0.4;
    
    // Platform multiplier
    const platformMultipliers: Record<string, number> = {
      twitter: 1.2,
      tiktok: 1.3,
      instagram: 1.1,
      linkedin: 0.9,
      youtube: 1.0,
      reddit: 1.1,
      web: 0.8
    };
    score *= platformMultipliers[content.platform] || 1.0;
    
    // Content type multiplier
    const contentMultipliers: Record<string, number> = {
      video: 1.3,
      image: 1.2,
      post: 1.1,
      article: 0.9,
      other: 1.0
    };
    score *= contentMultipliers[content.metadata?.contentType] || 1.0;
    
    // Engagement boost
    if (content.metadata.engagement && content.metadata.engagement > 1000) {
      score += Math.min(20, Math.log10(content.metadata.engagement) * 5);
    }
    
    // Content quality indicators
    const contentText = content.content.toLowerCase();
    const qualityKeywords = ['breakthrough', 'revolutionary', 'game-changing', 'exclusive', 'trending', 'viral'];
    const qualityScore = qualityKeywords.filter(keyword => contentText.includes(keyword)).length * 5;
    score += qualityScore;
    
    return Math.min(100, Math.max(0, score));
  }

  /**
   * Assess cultural relevance
   */
  private assessCulturalRelevance(content: CapturedContent, truthAnalysis: any): number {
    let relevance = 50; // Base relevance
    
    // Truth analysis human truth indicator
    const humanTruth = truthAnalysis.humanTruth?.toLowerCase() || '';
    const culturalKeywords = [
      'community', 'identity', 'belonging', 'status', 'recognition',
      'achievement', 'success', 'fear', 'hope', 'change', 'innovation',
      'tradition', 'future', 'technology', 'society'
    ];
    
    const culturalMatches = culturalKeywords.filter(keyword => humanTruth.includes(keyword)).length;
    relevance += culturalMatches * 8;
    
    // Platform cultural weight
    const platformWeights = {
      'twitter': 85,
      'tiktok': 90,
      'instagram': 80,
      'linkedin': 60,
      'reddit': 75
    };
    const platformWeight = platformWeights[content.platform as keyof typeof platformWeights] || 50;
    relevance = (relevance + platformWeight) / 2;
    
    // Recent content gets boost
    const hoursOld = (Date.now() - content.timestamp.getTime()) / (1000 * 60 * 60);
    if (hoursOld < 24) {
      relevance += Math.max(0, 15 - hoursOld);
    }
    
    return Math.min(100, Math.max(0, relevance));
  }

  /**
   * Determine strategic value
   */
  private determineStrategicValue(
    viralPotential: number,
    culturalRelevance: number,
    truthAnalysis: any
  ): 'high' | 'medium' | 'low' {
    const combinedScore = (viralPotential * 0.4) + (culturalRelevance * 0.4) + (truthAnalysis.confidence * 0.2);
    
    if (combinedScore >= 80) return 'high';
    if (combinedScore >= 60) return 'medium';
    return 'low';
  }

  /**
   * Generate recommendations for captured content
   */
  private async generateRecommendations(
    content: CapturedContent,
    truthAnalysis: any,
    strategicValue: 'high' | 'medium' | 'low'
  ): Promise<string[]> {
    const recommendations: string[] = [];
    
    // Strategic value based recommendations
    switch (strategicValue) {
      case 'high':
        recommendations.push('🚀 High strategic value - Consider immediate response or trend positioning');
        recommendations.push('📊 Monitor closely for viral development and audience reactions');
        recommendations.push('🎯 Develop content hooks around this cultural moment');
        break;
      
      case 'medium':
        recommendations.push('⚡ Moderate opportunity - Watch for trend development');
        recommendations.push('📝 Consider creating related content within 24-48 hours');
        break;
      
      case 'low':
        recommendations.push('📌 Archive for future reference and pattern analysis');
        break;
    }
    
    // Platform-specific recommendations
    switch (content.platform) {
      case 'twitter':
        recommendations.push('🐦 Twitter: Quick response window - act within 2-4 hours for maximum impact');
        break;
      case 'linkedin':
        recommendations.push('💼 LinkedIn: Professional angle - focus on business implications');
        break;
      case 'tiktok':
        recommendations.push('🎵 TikTok: Visual trend potential - consider creative video response');
        break;
      case 'instagram':
        recommendations.push('📸 Instagram: Visual storytelling opportunity');
        break;
    }
    
    // Content type recommendations
    if (content.metadata.contentType === 'video') {
      recommendations.push('🎬 Video content - high engagement potential, consider reaction or response video');
    }
    
    // Truth analysis based recommendations
    if (truthAnalysis.confidence > 80) {
      recommendations.push('✅ High confidence analysis - reliable insights for strategic decisions');
    }
    
    if (truthAnalysis.humanTruth.includes('community') || truthAnalysis.humanTruth.includes('belonging')) {
      recommendations.push('👥 Community resonance detected - potential for audience engagement');
    }
    
    return recommendations;
  }

  /**
   * Batch process multiple captured contents
   */
  async processBatchContent(contentArray: any[]): Promise<ExtensionAnalysis[]> {
    const results: ExtensionAnalysis[] = [];
    
    for (const contentData of contentArray) {
      try {
        const analysis = await this.processCapturedContent(contentData);
        results.push(analysis);
      } catch (error) {
        console.error(`[Chrome Extension] Error processing content ${contentData.url}:`, error);
        // Continue with other content
      }
    }
    
    return results;
  }

  /**
   * Get extension statistics
   */
  getExtensionStats(): any {
    return {
      supportedPlatforms: [
        'twitter', 'linkedin', 'instagram', 'tiktok', 'youtube',
        'reddit', 'medium', 'substack', 'hackernews', 'producthunt', 'github'
      ],
      contentTypes: ['article', 'post', 'video', 'image', 'other'],
      analysisFeatures: [
        'Truth Analysis Framework',
        'Viral Potential Scoring',
        'Cultural Relevance Assessment',
        'Strategic Value Determination',
        'Real-time Recommendations'
      ],
      version: '2.0.0'
    };
  }

  /**
   * Validate extension content data
   */
  validateContentData(contentData: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!contentData.url) {
      errors.push('URL is required');
    } else {
      try {
        new URL(contentData.url);
      } catch {
        errors.push('Invalid URL format');
      }
    }
    
    if (!contentData.content && !contentData.text) {
      errors.push('Content or text is required');
    }
    
    if (contentData.content && contentData.content.length > 50000) {
      errors.push('Content too long (max 50,000 characters)');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
}