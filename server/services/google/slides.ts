import { GoogleOAuthService } from './oauth';
import { GoogleDriveService } from './drive';

// Dynamic import helper for googleapis
async function getGoogleApi() {
  try {
    const { google } = await import('googleapis');
    return google;
  } catch (error) {
    console.log('Using mock googleapis for development');
    const { google } = await import('./mock-googleapis');
    return google;
  }
}

interface CanvasBlock {
  id: string;
  type: 'text' | 'image' | 'sticky' | 'source';
  content: string;
  position?: { x: number; y: number };
  size?: { width: number; height: number };
}

interface CanvasSlide {
  id: string;
  blocks: CanvasBlock[];
}

interface CanvasJson {
  slides: CanvasSlide[];
  title?: string;
}

export class GoogleSlidesService {
  private oauthService: GoogleOAuthService;
  private driveService: GoogleDriveService;

  constructor() {
    this.oauthService = new GoogleOAuthService();
    this.driveService = new GoogleDriveService();
  }

  async createBriefFromCanvas(params: {
    userId: string;
    projectId: string;
    projectName?: string;
    title: string;
    canvasJson: CanvasJson;
    templateId?: string;
  }): Promise<{ fileId: string; slidesUrl: string; driveFileId: string }> {
    try {
      const { userId, projectId, projectName, title, canvasJson } = params;

      // Ensure project folder exists
      const folderId = await this.driveService.ensureProjectFolder(userId, projectId, projectName);
      
      // Get OAuth client and Google API
      const google = await getGoogleApi();
      const oauth2Client = await this.oauthService.getOAuth2Client(userId);
      const slides = google.slides({ version: 'v1', auth: oauth2Client });

      // Create new presentation
      const presentation = await (slides.presentations.create as any)({
        requestBody: {
          title: title,
        },
      });

      const presentationId = (presentation as any).data.presentationId!;
      console.log(`Created presentation: ${title} (${presentationId})`);

      // Move to project folder
      const drive = google.drive({ version: 'v3', auth: oauth2Client });
      await (drive.files.update as any)({
        fileId: presentationId,
        addParents: folderId,
        fields: 'id, parents',
      });

      // Process canvas slides
      const requests: any[] = [];
      const slideIds: string[] = [];

      // If we have slides in canvas, replace the default slide
      if (canvasJson.slides && canvasJson.slides.length > 0) {
        // Get the default slide ID to replace it
        const presentationData = await slides.presentations.get({
          presentationId: presentationId,
        });
        
        const defaultSlideId = (presentationData as any).data.slides?.[0]?.objectId;

        for (let i = 0; i < canvasJson.slides.length; i++) {
          const slide = canvasJson.slides[i];
          let slideId: string;

          if (i === 0 && defaultSlideId) {
            // Use the existing default slide for the first canvas slide
            slideId = defaultSlideId;
          } else {
            // Create new slide for additional canvas slides
            slideId = `slide_${Date.now()}_${i}`;
            slideIds.push(slideId);
            requests.push({
              createSlide: {
                objectId: slideId,
                slideLayoutReference: {
                  predefinedLayout: 'BLANK',
                },
              },
            });
          }

          // Add blocks from canvas to slide
          slide.blocks.forEach((block, blockIndex) => {
            const elementId = `element_${slideId}_${blockIndex}`;
            
            switch (block.type) {
              case 'text':
              case 'sticky':
                requests.push({
                  createShape: {
                    objectId: elementId,
                    shapeType: 'TEXT_BOX',
                    elementProperties: {
                      pageObjectId: slideId,
                      size: {
                        width: { magnitude: block.size?.width || 400, unit: 'PT' },
                        height: { magnitude: block.size?.height || 100, unit: 'PT' },
                      },
                      transform: {
                        scaleX: 1,
                        scaleY: 1,
                        translateX: block.position?.x || 50,
                        translateY: block.position?.y || 50,
                        unit: 'PT',
                      },
                    },
                  },
                });
                
                requests.push({
                  insertText: {
                    objectId: elementId,
                    text: block.content,
                  },
                });
                break;

              case 'image':
                // For now, just create a placeholder text for images
                // TODO: Implement actual image insertion
                requests.push({
                  createShape: {
                    objectId: elementId,
                    shapeType: 'TEXT_BOX',
                    elementProperties: {
                      pageObjectId: slideId,
                      size: {
                        width: { magnitude: 300, unit: 'PT' },
                        height: { magnitude: 200, unit: 'PT' },
                      },
                      transform: {
                        scaleX: 1,
                        scaleY: 1,
                        translateX: block.position?.x || 100,
                        translateY: block.position?.y || 100,
                        unit: 'PT',
                      },
                    },
                  },
                });
                
                requests.push({
                  insertText: {
                    objectId: elementId,
                    text: `[Image: ${block.content}]`,
                  },
                });
                break;

              case 'source':
                requests.push({
                  createShape: {
                    objectId: elementId,
                    shapeType: 'TEXT_BOX',
                    elementProperties: {
                      pageObjectId: slideId,
                      size: {
                        width: { magnitude: 350, unit: 'PT' },
                        height: { magnitude: 50, unit: 'PT' },
                      },
                      transform: {
                        scaleX: 1,
                        scaleY: 1,
                        translateX: block.position?.x || 50,
                        translateY: block.position?.y || 400,
                        unit: 'PT',
                      },
                    },
                  },
                });
                
                requests.push({
                  insertText: {
                    objectId: elementId,
                    text: `Source: ${block.content}`,
                  },
                });
                break;
            }
          });
        }
      }

      // Execute batch update if we have requests
      if (requests.length > 0) {
        console.log(`Executing ${requests.length} slide operations...`);
        await (slides.presentations.batchUpdate as any)({
          presentationId: presentationId,
          requestBody: {
            requests: requests,
          },
        });
      }

      // Get the final presentation URL
      const fileInfo = await this.driveService.getFileInfo(userId, presentationId);

      return {
        fileId: presentationId,
        slidesUrl: fileInfo.webViewLink!,
        driveFileId: presentationId,
      };
    } catch (error) {
      console.error('Error creating brief from canvas:', error);
      throw new Error('Failed to create Google Slides presentation from canvas');
    }
  }

  async getBriefUrl(userId: string, fileId: string): Promise<string> {
    try {
      const fileInfo = await this.driveService.getFileInfo(userId, fileId);
      return fileInfo.webViewLink!;
    } catch (error) {
      console.error('Error getting brief URL:', error);
      throw new Error('Failed to get presentation URL');
    }
  }
}