import { google } from 'googleapis';
import { googleAuthService } from './google-auth';

export class GoogleBigQueryService {
  private bigquery: any;

  constructor(authClient: any) {
    this.bigquery = google.bigquery({ version: 'v2', auth: authClient });
  }

  async createTrendAnalysisDataset(projectId: string, datasetId: string = 'strategic_intelligence') {
    try {
      // Create dataset for strategic intelligence data
      const dataset = await this.bigquery.datasets.insert({
        projectId,
        requestBody: {
          datasetReference: {
            datasetId,
            projectId
          },
          friendlyName: 'Strategic Intelligence Analysis',
          description: 'Historical trend analysis and strategic intelligence data'
        }
      });

      // Create tables for different data types
      await this.createTrendAnalysisTables(projectId, datasetId);

      return {
        datasetId,
        projectId,
        tablesCreated: ['trends', 'captures', 'strategic_scores', 'platform_analytics']
      };
    } catch (error) {
      console.error('Error creating BigQuery dataset:', error);
      throw new Error('Failed to create BigQuery dataset');
    }
  }

  private async createTrendAnalysisTables(projectId: string, datasetId: string) {
    const tables = [
      {
        tableId: 'trends',
        schema: {
          fields: [
            { name: 'trend_id', type: 'STRING', mode: 'REQUIRED' },
            { name: 'title', type: 'STRING', mode: 'REQUIRED' },
            { name: 'platform', type: 'STRING', mode: 'REQUIRED' },
            { name: 'content', type: 'STRING' },
            { name: 'engagement_score', type: 'FLOAT' },
            { name: 'viral_potential', type: 'FLOAT' },
            { name: 'strategic_value', type: 'FLOAT' },
            { name: 'timestamp', type: 'TIMESTAMP', mode: 'REQUIRED' },
            { name: 'keywords', type: 'STRING', mode: 'REPEATED' },
            { name: 'sentiment_score', type: 'FLOAT' },
            { name: 'category', type: 'STRING' }
          ]
        }
      },
      {
        tableId: 'captures',
        schema: {
          fields: [
            { name: 'capture_id', type: 'STRING', mode: 'REQUIRED' },
            { name: 'project_id', type: 'STRING', mode: 'REQUIRED' },
            { name: 'user_id', type: 'STRING', mode: 'REQUIRED' },
            { name: 'platform', type: 'STRING' },
            { name: 'content_type', type: 'STRING' },
            { name: 'strategic_score', type: 'FLOAT' },
            { name: 'viral_score', type: 'FLOAT' },
            { name: 'confidence', type: 'FLOAT' },
            { name: 'captured_at', type: 'TIMESTAMP', mode: 'REQUIRED' },
            { name: 'truth_analysis', type: 'JSON' },
            { name: 'google_analysis', type: 'JSON' }
          ]
        }
      },
      {
        tableId: 'strategic_scores',
        schema: {
          fields: [
            { name: 'date', type: 'DATE', mode: 'REQUIRED' },
            { name: 'platform', type: 'STRING', mode: 'REQUIRED' },
            { name: 'category', type: 'STRING' },
            { name: 'avg_strategic_value', type: 'FLOAT' },
            { name: 'avg_viral_potential', type: 'FLOAT' },
            { name: 'content_volume', type: 'INTEGER' },
            { name: 'trend_momentum', type: 'FLOAT' }
          ]
        }
      },
      {
        tableId: 'platform_analytics',
        schema: {
          fields: [
            { name: 'platform', type: 'STRING', mode: 'REQUIRED' },
            { name: 'date', type: 'DATE', mode: 'REQUIRED' },
            { name: 'total_captures', type: 'INTEGER' },
            { name: 'avg_engagement', type: 'FLOAT' },
            { name: 'top_categories', type: 'STRING', mode: 'REPEATED' },
            { name: 'performance_score', type: 'FLOAT' }
          ]
        }
      }
    ];

    const createTablePromises = tables.map(table =>
      this.bigquery.tables.insert({
        projectId,
        datasetId,
        requestBody: {
          tableReference: {
            tableId: table.tableId,
            projectId,
            datasetId
          },
          schema: table.schema
        }
      })
    );

    await Promise.all(createTablePromises);
  }

  async insertCaptureData(projectId: string, datasetId: string, captures: any[]) {
    try {
      const rows = captures.map(capture => ({
        insertId: capture.id,
        json: {
          capture_id: capture.id,
          project_id: capture.projectId,
          user_id: capture.userId,
          platform: capture.platform || 'web',
          content_type: capture.type,
          strategic_score: parseFloat(capture.strategicValue) || 0,
          viral_score: parseFloat(capture.viralPotential) || 0,
          confidence: parseFloat(capture.confidence) || 0,
          captured_at: capture.createdAt,
          truth_analysis: capture.truthAnalysis ? JSON.stringify(capture.truthAnalysis) : null,
          google_analysis: capture.googleAnalysis ? JSON.stringify(capture.googleAnalysis) : null
        }
      }));

      await this.bigquery.tabledata.insertAll({
        projectId,
        datasetId,
        tableId: 'captures',
        requestBody: {
          rows
        }
      });

      return { success: true, rowsInserted: rows.length };
    } catch (error) {
      console.error('Error inserting capture data:', error);
      throw new Error('Failed to insert capture data');
    }
  }

  async getTrendAnalysis(projectId: string, datasetId: string, options: {
    platform?: string;
    dateRange?: { start: string; end: string };
    category?: string;
  } = {}) {
    try {
      let query = `
        SELECT 
          platform,
          DATE(captured_at) as date,
          COUNT(*) as capture_count,
          AVG(strategic_score) as avg_strategic_score,
          AVG(viral_score) as avg_viral_score,
          AVG(confidence) as avg_confidence
        FROM \`${projectId}.${datasetId}.captures\`
      `;

      const conditions = [];
      if (options.platform) {
        conditions.push(`platform = '${options.platform}'`);
      }
      if (options.dateRange) {
        conditions.push(`captured_at BETWEEN '${options.dateRange.start}' AND '${options.dateRange.end}'`);
      }

      if (conditions.length > 0) {
        query += ` WHERE ${conditions.join(' AND ')}`;
      }

      query += `
        GROUP BY platform, DATE(captured_at)
        ORDER BY date DESC, avg_strategic_score DESC
        LIMIT 100
      `;

      const [job] = await this.bigquery.createQueryJob({
        query,
        location: 'US'
      });

      const [rows] = await job.getQueryResults();
      return rows;
    } catch (error) {
      console.error('Error getting trend analysis:', error);
      throw new Error('Failed to get trend analysis');
    }
  }

  async getStrategicInsights(projectId: string, datasetId: string) {
    try {
      const queries = {
        topPerformingPlatforms: `
          SELECT 
            platform,
            COUNT(*) as total_captures,
            AVG(strategic_score) as avg_strategic_score,
            AVG(viral_score) as avg_viral_score
          FROM \`${projectId}.${datasetId}.captures\`
          GROUP BY platform
          ORDER BY avg_strategic_score DESC
          LIMIT 10
        `,
        trendingCategories: `
          SELECT 
            JSON_EXTRACT_SCALAR(truth_analysis, '$.briefSectionSuggestion') as category,
            COUNT(*) as frequency,
            AVG(strategic_score) as avg_score
          FROM \`${projectId}.${datasetId}.captures\`
          WHERE truth_analysis IS NOT NULL
          GROUP BY category
          HAVING category IS NOT NULL
          ORDER BY frequency DESC
          LIMIT 10
        `,
        timeSeriesAnalysis: `
          SELECT 
            DATE(captured_at) as date,
            COUNT(*) as daily_captures,
            AVG(strategic_score) as daily_avg_strategic,
            AVG(viral_score) as daily_avg_viral
          FROM \`${projectId}.${datasetId}.captures\`
          WHERE captured_at >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)
          GROUP BY DATE(captured_at)
          ORDER BY date DESC
        `
      };

      const results: any = {};
      for (const [key, query] of Object.entries(queries)) {
        const [job] = await this.bigquery.createQueryJob({ query, location: 'US' });
        const [rows] = await job.getQueryResults();
        results[key] = rows;
      }

      return results;
    } catch (error) {
      console.error('Error getting strategic insights:', error);
      throw new Error('Failed to get strategic insights');
    }
  }
}

export async function createGoogleBigQueryService(tokens: any) {
  const authClient = googleAuthService.setTokens(tokens);
  return new GoogleBigQueryService(authClient);
}