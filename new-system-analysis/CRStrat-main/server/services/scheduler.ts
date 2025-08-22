import * as cron from 'node-cron';
import { ContentFetcher } from './contentFetcher';
import { BrightDataService } from './brightDataService';
import { BrightDataBrowserService } from './brightDataBrowser';
import { AIAnalyzer } from './aiAnalyzer';
import { storage } from '../storage';

export class ContentScheduler {
  private fetcher: ContentFetcher;
  private brightData: BrightDataService;
  private brightDataBrowser: BrightDataBrowserService;
  private analyzer: AIAnalyzer;
  private isRunning = false;
  private scheduledTask: cron.ScheduledTask | null = null;

  constructor() {
    this.fetcher = new ContentFetcher();
    this.brightData = new BrightDataService();
    this.brightDataBrowser = new BrightDataBrowserService();
    this.analyzer = new AIAnalyzer();
  }

  async runScan(): Promise<{
    success: boolean;
    itemsProcessed: number;
    errors: string[];
  }> {
    if (this.isRunning) {
      return {
        success: false,
        itemsProcessed: 0,
        errors: ['Scan already in progress']
      };
    }

    this.isRunning = true;
    const startTime = Date.now();
    const errors: string[] = [];
    let itemsProcessed = 0;

    try {
      console.log('Starting content scan with Bright Data...');
      
      // Try Bright Data first, fallback to original fetcher if needed
      let allItems: any[] = [];
      
      try {
        console.log('🔥 BRIGHT DATA PRIMARY SCAN: Fetching content from Bright Data APIs and Browser...');
        
        // BRIGHT DATA IS THE PRIMARY SOURCE - Try both API and browser-based scraping in parallel
        const [apiItems, browserItems] = await Promise.all([
          this.brightData.fetchAllTrendingContent().catch(err => {
            console.log('Bright Data API status:', err.message);
            return [];
          }),
          this.brightDataBrowser.fetchAllTrendingContentBrowser().catch(err => {
            console.log('Bright Data Browser status:', err.message);
            return [];
          })
        ]);
        
        allItems = [...apiItems, ...browserItems];
        console.log(`✅ Bright Data APIs returned ${apiItems.length} items`);
        console.log(`✅ Bright Data Browser returned ${browserItems.length} items`);
        console.log(`🎯 TOTAL BRIGHT DATA ITEMS: ${allItems.length}`);
        
        // Only use fallback if Bright Data returns absolutely no results
        if (allItems.length === 0) {
          console.log('⚠️ Bright Data returned 0 items - using limited fallback sources...');
          const [redditItems, youtubeItems, newsItems] = await Promise.all([
            this.fetcher.fetchRedditTrends(),
            this.fetcher.fetchYouTubeTrends(),
            this.fetcher.fetchNewsTrends()
          ]);
          allItems = [...redditItems, ...youtubeItems, ...newsItems];
        } else {
          console.log('✨ BRIGHT DATA SUCCESS: Using primary data source only');
        }
      } catch (brightDataError) {
        console.log('❌ Bright Data primary source error:', (brightDataError as Error).message);
        // Emergency fallback only
        const [redditItems, youtubeItems, newsItems] = await Promise.all([
          this.fetcher.fetchRedditTrends(),
          this.fetcher.fetchYouTubeTrends(),
          this.fetcher.fetchNewsTrends()
        ]);
        allItems = [...redditItems, ...youtubeItems, ...newsItems];
      }

      if (allItems.length > 0) {
        // Group items by platform for tracking
        const platformGroups = allItems.reduce((acc, item) => {
          if (!acc[item.platform]) acc[item.platform] = [];
          acc[item.platform].push(item);
          return acc;
        }, {} as Record<string, any[]>);

        for (const [platform, platformItems] of Object.entries(platformGroups)) {
          try {
            const items = platformItems as any[];

            // Analyze items in batches
            const analysisResults = await this.analyzer.batchAnalyze(
              items.map((item: any) => ({
                title: item.title,
                content: item.content,
                platform: item.platform
              }))
            );

            // Save to storage
            for (let i = 0; i < items.length; i++) {
              const item = items[i];
              const analysis = analysisResults[i];
              
              try {
                await storage.createContentItem({
                  title: item.title,
                  url: item.url,
                  content: item.content,
                  summary: analysis.summary,
                  hook1: analysis.hook1,
                  hook2: analysis.hook2,
                  category: analysis.category || item.category,
                  platform: item.platform,
                  viralScore: analysis.viralScore.toString(),
                  engagement: item.engagement || 0,
                  growthRate: '0.00',
                  metadata: item.metadata,
                  isActive: true
                });
                
                itemsProcessed++;
              } catch (error) {
                errors.push(`Failed to save item: ${item.title}`);
              }
            }

            // Log scan completion
            console.log(`✅ Completed ${platform} scan: ${items.length} items processed`);

          } catch (error) {
            const errorMsg = `${platform} scan failed: ${error}`;
            errors.push(errorMsg);
            console.error(`❌ ${errorMsg}`);
          }
        }
      } else {
        // Log that no content was found across all platforms
        console.log('⚠️ No content found from any source');
      }

      console.log(`Scan completed. Processed ${itemsProcessed} items with ${errors.length} errors.`);
      
      return {
        success: errors.length === 0,
        itemsProcessed,
        errors
      };

    } catch (error) {
      errors.push(`Scan failed: ${error}`);
      return {
        success: false,
        itemsProcessed,
        errors
      };
    } finally {
      this.isRunning = false;
    }
  }

  // Manual scanning only - no automated scheduling
  manualScan(): Promise<{
    success: boolean;
    itemsProcessed: number;
    errors: string[];
  }> {
    console.log('🔄 Manual scan triggered by user');
    return this.runScan();
  }

  // Legacy methods for API compatibility (always return false for automated scanning)
  startScheduledScans(intervalMinutes = 15): void {
    console.log('⚠️ Automated scanning is disabled - use manual scan instead');
  }

  stopScheduledScans(): void {
    console.log('⚠️ No scheduled scans to stop - automated scanning is disabled');
  }

  isScheduledScanActive(): boolean {
    return false; // Automated scanning permanently disabled
  }
}

export const scheduler = new ContentScheduler();
