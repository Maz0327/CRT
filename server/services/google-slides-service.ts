import { google } from 'googleapis';
import { googleAuthService } from './google-auth';

export class GoogleSlidesService {
  private slides: any;
  private drive: any;

  constructor(authClient: any) {
    this.slides = google.slides({ version: 'v1', auth: authClient });
    this.drive = google.drive({ version: 'v3', auth: authClient });
  }

  async createPresentationFromBrief(briefData: {
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
      };
    }>;
  }) {
    try {
      // Create presentation
      const presentation = await this.slides.presentations.create({
        requestBody: {
          title: briefData.title || 'Strategic Intelligence Brief'
        }
      });

      const presentationId = presentation.data.presentationId;

      // Build slide requests
      const requests = this.buildSlideRequests(briefData, presentation.data.slides[0].objectId);

      // Execute batch update
      if (requests.length > 0) {
        await this.slides.presentations.batchUpdate({
          presentationId,
          requestBody: { requests }
        });
      }

      return {
        presentationId,
        url: `https://docs.google.com/presentation/d/${presentationId}/edit`,
        title: briefData.title
      };
    } catch (error) {
      console.error('Error creating Google Slides presentation:', error);
      throw new Error('Failed to create presentation');
    }
  }

  private buildSlideRequests(briefData: any, titleSlideId: string) {
    const requests: any[] = [];

    // Title slide content
    requests.push({
      insertText: {
        objectId: titleSlideId,
        text: briefData.title,
        insertionIndex: 0
      }
    });

    // Define section slide
    if (briefData.content.define?.length > 0) {
      const defineSlideId = this.generateId();
      requests.push({
        createSlide: {
          objectId: defineSlideId,
          slideLayoutReference: { predefinedLayout: 'TITLE_AND_BODY' }
        }
      });

      requests.push({
        insertText: {
          objectId: defineSlideId,
          text: 'DEFINE: Current Reality',
          insertionIndex: 0
        }
      });

      const defineContent = briefData.content.define.join('\n\n• ');
      requests.push({
        insertText: {
          objectId: defineSlideId,
          text: `• ${defineContent}`,
          insertionIndex: 1
        }
      });
    }

    // Shift section slide
    if (briefData.content.shift?.length > 0) {
      const shiftSlideId = this.generateId();
      requests.push({
        createSlide: {
          objectId: shiftSlideId,
          slideLayoutReference: { predefinedLayout: 'TITLE_AND_BODY' }
        }
      });

      requests.push({
        insertText: {
          objectId: shiftSlideId,
          text: 'SHIFT: Strategic Opportunities',
          insertionIndex: 0
        }
      });

      const shiftContent = briefData.content.shift.join('\n\n• ');
      requests.push({
        insertText: {
          objectId: shiftSlideId,
          text: `• ${shiftContent}`,
          insertionIndex: 1
        }
      });
    }

    // Deliver section slide
    if (briefData.content.deliver?.length > 0) {
      const deliverSlideId = this.generateId();
      requests.push({
        createSlide: {
          objectId: deliverSlideId,
          slideLayoutReference: { predefinedLayout: 'TITLE_AND_BODY' }
        }
      });

      requests.push({
        insertText: {
          objectId: deliverSlideId,
          text: 'DELIVER: Action Plan',
          insertionIndex: 0
        }
      });

      const deliverContent = briefData.content.deliver.join('\n\n• ');
      requests.push({
        insertText: {
          objectId: deliverSlideId,
          text: `• ${deliverContent}`,
          insertionIndex: 1
        }
      });
    }

    // Strategic insights slide from captures
    if (briefData.captures?.length > 0) {
      const insightsSlideId = this.generateId();
      requests.push({
        createSlide: {
          objectId: insightsSlideId,
          slideLayoutReference: { predefinedLayout: 'TITLE_AND_BODY' }
        }
      });

      requests.push({
        insertText: {
          objectId: insightsSlideId,
          text: 'Strategic Intelligence Insights',
          insertionIndex: 0
        }
      });

      const insights = briefData.captures
        .filter((c: any) => c.truthAnalysis)
        .map((c: any) => `${c.title}: ${c.truthAnalysis.humanTruth}`)
        .join('\n\n• ');

      if (insights) {
        requests.push({
          insertText: {
            objectId: insightsSlideId,
            text: `• ${insights}`,
            insertionIndex: 1
          }
        });
      }
    }

    return requests;
  }

  private generateId(): string {
    return 'slide_' + Math.random().toString(36).substr(2, 9);
  }
}

export async function createGoogleSlidesService(tokens: any) {
  const authClient = googleAuthService.setTokens(tokens);
  return new GoogleSlidesService(authClient);
}