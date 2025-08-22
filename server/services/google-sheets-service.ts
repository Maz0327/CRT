import { google } from 'googleapis';
import { googleAuthService } from './google-auth';

export class GoogleSheetsService {
  private sheets: any;
  private drive: any;

  constructor(authClient: any) {
    this.sheets = google.sheets({ version: 'v4', auth: authClient });
    this.drive = google.drive({ version: 'v3', auth: authClient });
  }

  async createAnalysisSpreadsheet(briefData: {
    title: string;
    captures: Array<{
      title: string;
      content: string;
      type: string;
      sourceUrl?: string;
      platform?: string;
      truthAnalysis?: {
        fact: string;
        observation: string;
        insight: string;
        humanTruth: string;
        strategicValue: number;
        viralPotential: number;
        keywords: string[];
        confidence: number;
        briefSectionSuggestion: string;
      };
      visualAnalysis?: {
        brandElements: string[];
        culturalMoments: string[];
        competitiveInsights: string[];
        strategicRecommendations: string[];
        visualScore: number;
        confidenceScore: number;
      };
      createdAt: string;
    }>;
  }) {
    try {
      // Create spreadsheet
      const spreadsheet = await this.sheets.spreadsheets.create({
        requestBody: {
          properties: {
            title: `${briefData.title} - Strategic Analysis Data`
          },
          sheets: [
            {
              properties: {
                title: 'Strategic Overview',
                gridProperties: {
                  rowCount: 1000,
                  columnCount: 20
                }
              }
            },
            {
              properties: {
                title: 'Detailed Analysis',
                gridProperties: {
                  rowCount: 1000,
                  columnCount: 15
                }
              }
            },
            {
              properties: {
                title: 'Keywords & Insights',
                gridProperties: {
                  rowCount: 1000,
                  columnCount: 10
                }
              }
            }
          ]
        }
      });

      const spreadsheetId = spreadsheet.data.spreadsheetId;

      // Populate sheets with data
      await this.populateOverviewSheet(spreadsheetId, briefData);
      await this.populateDetailedAnalysisSheet(spreadsheetId, briefData);
      await this.populateKeywordsSheet(spreadsheetId, briefData);

      return {
        spreadsheetId,
        url: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`,
        title: briefData.title
      };
    } catch (error) {
      console.error('Error creating Google Sheets spreadsheet:', error);
      throw new Error('Failed to create spreadsheet');
    }
  }

  private async populateOverviewSheet(spreadsheetId: string, briefData: any) {
    const headers = [
      'Content Title',
      'Type',
      'Platform',
      'Strategic Value',
      'Viral Potential',
      'Confidence %',
      'Brief Section',
      'Source URL',
      'Created Date'
    ];

    const data = briefData.captures.map((capture: any) => [
      capture.title,
      capture.type,
      capture.platform || 'Web',
      capture.truthAnalysis?.strategicValue || 0,
      capture.truthAnalysis?.viralPotential || 0,
      capture.truthAnalysis?.confidence || 0,
      capture.truthAnalysis?.briefSectionSuggestion || '',
      capture.sourceUrl || '',
      new Date(capture.createdAt).toLocaleDateString()
    ]);

    await this.sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'Strategic Overview!A1:I1',
      valueInputOption: 'RAW',
      requestBody: {
        values: [headers]
      }
    });

    if (data.length > 0) {
      await this.sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `Strategic Overview!A2:I${data.length + 1}`,
        valueInputOption: 'RAW',
        requestBody: {
          values: data
        }
      });
    }
  }

  private async populateDetailedAnalysisSheet(spreadsheetId: string, briefData: any) {
    const headers = [
      'Content Title',
      'Fact',
      'Observation',
      'Insight',
      'Human Truth',
      'Strategic Value',
      'Viral Potential',
      'Confidence',
      'Brand Elements Count',
      'Cultural Moments Count',
      'Competitive Insights Count',
      'Strategic Recommendations Count',
      'Visual Score',
      'Visual Confidence',
      'Content Preview'
    ];

    const data = briefData.captures
      .filter((capture: any) => capture.truthAnalysis)
      .map((capture: any) => [
        capture.title,
        capture.truthAnalysis?.fact || '',
        capture.truthAnalysis?.observation || '',
        capture.truthAnalysis?.insight || '',
        capture.truthAnalysis?.humanTruth || '',
        capture.truthAnalysis?.strategicValue || 0,
        capture.truthAnalysis?.viralPotential || 0,
        capture.truthAnalysis?.confidence || 0,
        capture.visualAnalysis?.brandElements?.length || 0,
        capture.visualAnalysis?.culturalMoments?.length || 0,
        capture.visualAnalysis?.competitiveInsights?.length || 0,
        capture.visualAnalysis?.strategicRecommendations?.length || 0,
        capture.visualAnalysis?.visualScore || 0,
        capture.visualAnalysis?.confidenceScore || 0,
        capture.content.substring(0, 100) + '...'
      ]);

    await this.sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'Detailed Analysis!A1:O1',
      valueInputOption: 'RAW',
      requestBody: {
        values: [headers]
      }
    });

    if (data.length > 0) {
      await this.sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `Detailed Analysis!A2:O${data.length + 1}`,
        valueInputOption: 'RAW',
        requestBody: {
          values: data
        }
      });
    }
  }

  private async populateKeywordsSheet(spreadsheetId: string, briefData: any) {
    const headers = [
      'Content Title',
      'Keywords',
      'Keyword Count',
      'Strategic Value',
      'Viral Potential',
      'Brief Section',
      'Platform',
      'Created Date'
    ];

    const data = briefData.captures
      .filter((capture: any) => capture.truthAnalysis?.keywords?.length > 0)
      .map((capture: any) => [
        capture.title,
        capture.truthAnalysis.keywords.join(', '),
        capture.truthAnalysis.keywords.length,
        capture.truthAnalysis.strategicValue,
        capture.truthAnalysis.viralPotential,
        capture.truthAnalysis.briefSectionSuggestion,
        capture.platform || 'Web',
        new Date(capture.createdAt).toLocaleDateString()
      ]);

    await this.sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'Keywords & Insights!A1:H1',
      valueInputOption: 'RAW',
      requestBody: {
        values: [headers]
      }
    });

    if (data.length > 0) {
      await this.sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `Keywords & Insights!A2:H${data.length + 1}`,
        valueInputOption: 'RAW',
        requestBody: {
          values: data
        }
      });
    }
  }
}

export async function createGoogleSheetsService(tokens: any) {
  const authClient = googleAuthService.setTokens(tokens);
  return new GoogleSheetsService(authClient);
}