import { google } from 'googleapis';
import { googleAuthService } from './google-auth';

export class GoogleDriveService {
  private drive: any;

  constructor(authClient: any) {
    this.drive = google.drive({ version: 'v3', auth: authClient });
  }

  async createProjectFolder(projectName: string) {
    try {
      const folderMetadata = {
        name: `Strategic Intelligence - ${projectName}`,
        mimeType: 'application/vnd.google-apps.folder'
      };

      const folder = await this.drive.files.create({
        requestBody: folderMetadata,
        fields: 'id, name, webViewLink'
      });

      return {
        folderId: folder.data.id,
        name: folder.data.name,
        url: folder.data.webViewLink
      };
    } catch (error) {
      console.error('Error creating Google Drive folder:', error);
      throw new Error('Failed to create project folder');
    }
  }

  async organizeProjectAssets(folderId: string, assets: {
    slides?: { id: string; title: string };
    docs?: { id: string; title: string };
    sheets?: { id: string; title: string };
  }) {
    try {
      const movePromises = [];

      // Move slides to folder
      if (assets.slides) {
        movePromises.push(
          this.drive.files.update({
            fileId: assets.slides.id,
            addParents: folderId,
            fields: 'id, parents'
          })
        );
      }

      // Move docs to folder
      if (assets.docs) {
        movePromises.push(
          this.drive.files.update({
            fileId: assets.docs.id,
            addParents: folderId,
            fields: 'id, parents'
          })
        );
      }

      // Move sheets to folder
      if (assets.sheets) {
        movePromises.push(
          this.drive.files.update({
            fileId: assets.sheets.id,
            addParents: folderId,
            fields: 'id, parents'
          })
        );
      }

      await Promise.all(movePromises);

      return {
        success: true,
        folderId,
        organizedAssets: Object.keys(assets).length
      };
    } catch (error) {
      console.error('Error organizing Google Drive assets:', error);
      throw new Error('Failed to organize project assets');
    }
  }

  async shareProjectFolder(folderId: string, emailAddresses: string[], role: 'reader' | 'writer' | 'commenter' = 'reader') {
    try {
      const sharePromises = emailAddresses.map(email => 
        this.drive.permissions.create({
          fileId: folderId,
          requestBody: {
            role,
            type: 'user',
            emailAddress: email
          }
        })
      );

      await Promise.all(sharePromises);

      return {
        success: true,
        sharedWith: emailAddresses.length,
        role
      };
    } catch (error) {
      console.error('Error sharing Google Drive folder:', error);
      throw new Error('Failed to share project folder');
    }
  }

  async uploadCaptureAssets(folderId: string, captures: Array<{
    title: string;
    content: string;
    type: string;
    imageData?: string;
  }>) {
    try {
      const uploadPromises = captures
        .filter(capture => capture.imageData) // Only upload captures with images
        .map(async (capture, index) => {
          const fileName = `${capture.title.replace(/[^a-zA-Z0-9]/g, '_')}_${index + 1}.jpg`;
          
          const fileMetadata = {
            name: fileName,
            parents: [folderId]
          };

          const media = {
            mimeType: 'image/jpeg',
            body: Buffer.from(capture.imageData!, 'base64')
          };

          const file = await this.drive.files.create({
            requestBody: fileMetadata,
            media,
            fields: 'id, name, webViewLink'
          });

          return {
            captureTitle: capture.title,
            fileId: file.data.id,
            fileName: file.data.name,
            url: file.data.webViewLink
          };
        });

      const uploadedFiles = await Promise.all(uploadPromises);

      return {
        success: true,
        uploadedCount: uploadedFiles.length,
        files: uploadedFiles
      };
    } catch (error) {
      console.error('Error uploading capture assets:', error);
      throw new Error('Failed to upload capture assets');
    }
  }

  async createProjectSummaryDoc(folderId: string, projectData: {
    name: string;
    description: string;
    captureCount: number;
    totalStrategicValue: number;
    topInsights: string[];
    exportedAssets: {
      slides?: string;
      docs?: string;
      sheets?: string;
    };
  }) {
    try {
      const summaryContent = this.generateProjectSummary(projectData);
      
      const fileMetadata = {
        name: `${projectData.name} - Project Summary`,
        parents: [folderId],
        mimeType: 'application/vnd.google-apps.document'
      };

      const doc = await this.drive.files.create({
        requestBody: fileMetadata,
        fields: 'id, name, webViewLink'
      });

      // TODO: Use Google Docs API to add content to the document
      // For now, we create an empty doc that can be manually populated

      return {
        documentId: doc.data.id,
        name: doc.data.name,
        url: doc.data.webViewLink
      };
    } catch (error) {
      console.error('Error creating project summary:', error);
      throw new Error('Failed to create project summary');
    }
  }

  private generateProjectSummary(projectData: any): string {
    return `
# ${projectData.name} - Strategic Intelligence Summary

## Project Overview
${projectData.description}

## Key Metrics
- Total Captures: ${projectData.captureCount}
- Average Strategic Value: ${projectData.totalStrategicValue}
- Analysis Complete: ${new Date().toLocaleDateString()}

## Top Strategic Insights
${projectData.topInsights.map((insight: string, index: number) => `${index + 1}. ${insight}`).join('\n')}

## Exported Assets
${projectData.exportedAssets.slides ? `- Presentation: ${projectData.exportedAssets.slides}` : ''}
${projectData.exportedAssets.docs ? `- Detailed Report: ${projectData.exportedAssets.docs}` : ''}
${projectData.exportedAssets.sheets ? `- Data Analysis: ${projectData.exportedAssets.sheets}` : ''}

## Generated on: ${new Date().toISOString()}
    `.trim();
  }
}

export async function createGoogleDriveService(tokens: any) {
  const authClient = googleAuthService.setTokens(tokens);
  return new GoogleDriveService(authClient);
}