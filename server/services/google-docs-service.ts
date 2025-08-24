import { google } from 'googleapis';
import { googleAuthService } from './google-auth';

export class GoogleDocsService {
  private docs: any;
  private drive: any;

  constructor(authClient: any) {
    this.docs = google.docs({ version: 'v1', auth: authClient });
    this.drive = google.drive({ version: 'v3', auth: authClient });
  }

  async createDetailedBriefDocument(briefData: {
    title: string;
    content: {
      define: string[];
      shift: string[];
      deliver: string[];
    };
    captures: Array<{
      title: string;
      content: string;
      truthAnalysis?: {
        fact: string;
        observation: string;
        insight: string;
        humanTruth: string;
        strategicValue: number;
        viralPotential: number;
        keywords: string[];
        confidence: number;
      };
      visualAnalysis?: {
        brandElements: string[];
        culturalMoments: string[];
        competitiveInsights: string[];
        strategicRecommendations: string[];
      };
    }>;
  }) {
    try {
      // Create document
      const doc = await this.docs.documents.create({
        requestBody: {
          title: `${briefData.title} - Detailed Strategic Analysis`
        }
      });

      const documentId = doc.data.documentId;

      // Build document content
      const requests = this.buildDocumentRequests(briefData);

      // Execute batch update
      if (requests.length > 0) {
        await this.docs.documents.batchUpdate({
          documentId,
          requestBody: { requests }
        });
      }

      return {
        documentId,
        url: `https://docs.google.com/document/d/${documentId}/edit`,
        title: briefData.title
      };
    } catch (error) {
      console.error('Error creating Google Docs document:', error);
      throw new Error('Failed to create document');
    }
  }

  private buildDocumentRequests(briefData: any) {
    const requests: any[] = [];
    let index = 1;

    // Title
    requests.push({
      insertText: {
        location: { index },
        text: `${briefData.title}\n\n`
      }
    });
    index += briefData.title.length + 2;

    // Executive Summary
    requests.push({
      insertText: {
        location: { index },
        text: 'EXECUTIVE SUMMARY\n\n'
      }
    });
    index += 'EXECUTIVE SUMMARY\n\n'.length;

    // Define Section
    if (briefData.content.define?.length > 0) {
      requests.push({
        insertText: {
          location: { index },
          text: 'DEFINE: Current Reality\n\n'
        }
      });
      index += 'DEFINE: Current Reality\n\n'.length;

      briefData.content.define.forEach((item: string) => {
        requests.push({
          insertText: {
            location: { index },
            text: `• ${item}\n\n`
          }
        });
        index += item.length + 4;
      });
    }

    // Shift Section
    if (briefData.content.shift?.length > 0) {
      requests.push({
        insertText: {
          location: { index },
          text: 'SHIFT: Strategic Opportunities\n\n'
        }
      });
      index += 'SHIFT: Strategic Opportunities\n\n'.length;

      briefData.content.shift.forEach((item: string) => {
        requests.push({
          insertText: {
            location: { index },
            text: `• ${item}\n\n`
          }
        });
        index += item.length + 4;
      });
    }

    // Deliver Section
    if (briefData.content.deliver?.length > 0) {
      requests.push({
        insertText: {
          location: { index },
          text: 'DELIVER: Action Plan\n\n'
        }
      });
      index += 'DELIVER: Action Plan\n\n'.length;

      briefData.content.deliver.forEach((item: string) => {
        requests.push({
          insertText: {
            location: { index },
            text: `• ${item}\n\n`
          }
        });
        index += item.length + 4;
      });
    }

    // Strategic Intelligence Analysis
    if (briefData.captures?.length > 0) {
      requests.push({
        insertText: {
          location: { index },
          text: 'STRATEGIC INTELLIGENCE ANALYSIS\n\n'
        }
      });
      index += 'STRATEGIC INTELLIGENCE ANALYSIS\n\n'.length;

      briefData.captures.forEach((capture: any) => {
        if (capture.truthAnalysis) {
          requests.push({
            insertText: {
              location: { index },
              text: `${capture.title}\n`
            }
          });
          index += capture.title.length + 1;

          requests.push({
            insertText: {
              location: { index },
              text: `Strategic Value: ${capture.truthAnalysis.strategicValue}/10 | Viral Potential: ${capture.truthAnalysis.viralPotential}/10 | Confidence: ${capture.truthAnalysis.confidence}%\n\n`
            }
          });
          index += `Strategic Value: ${capture.truthAnalysis.strategicValue}/10 | Viral Potential: ${capture.truthAnalysis.viralPotential}/10 | Confidence: ${capture.truthAnalysis.confidence}%\n\n`.length;

          requests.push({
            insertText: {
              location: { index },
              text: `FACT: ${capture.truthAnalysis.fact}\n\n`
            }
          });
          index += `FACT: ${capture.truthAnalysis.fact}\n\n`.length;

          requests.push({
            insertText: {
              location: { index },
              text: `OBSERVATION: ${capture.truthAnalysis.observation}\n\n`
            }
          });
          index += `OBSERVATION: ${capture.truthAnalysis.observation}\n\n`.length;

          requests.push({
            insertText: {
              location: { index },
              text: `INSIGHT: ${capture.truthAnalysis.insight}\n\n`
            }
          });
          index += `INSIGHT: ${capture.truthAnalysis.insight}\n\n`.length;

          requests.push({
            insertText: {
              location: { index },
              text: `HUMAN TRUTH: ${capture.truthAnalysis.humanTruth}\n\n`
            }
          });
          index += `HUMAN TRUTH: ${capture.truthAnalysis.humanTruth}\n\n`.length;

          if (capture.truthAnalysis.keywords?.length > 0) {
            requests.push({
              insertText: {
                location: { index },
                text: `Keywords: ${capture.truthAnalysis.keywords.join(', ')}\n\n`
              }
            });
            index += `Keywords: ${capture.truthAnalysis.keywords.join(', ')}\n\n`.length;
          }

          requests.push({
            insertText: {
              location: { index },
              text: '---\n\n'
            }
          });
          index += '---\n\n'.length;
        }
      });
    }

    return requests;
  }
}

export async function createGoogleDocsService(tokens: any) {
  const authClient = googleAuthService.setTokens(tokens);
  return new GoogleDocsService(authClient);
}