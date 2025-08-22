import { GoogleOAuthService } from './oauth';

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

export class GoogleDriveService {
  private oauthService: GoogleOAuthService;

  constructor() {
    this.oauthService = new GoogleOAuthService();
  }

  async ensureProjectFolder(userId: string, projectId: string, projectName?: string): Promise<string> {
    try {
      const google = await getGoogleApi();
      const oauth2Client = await this.oauthService.getOAuth2Client(userId);
      const drive = google.drive({ version: 'v3', auth: oauth2Client });

      const folderName = `Content Radar – ${projectName || projectId}`;
      
      // Search for existing folder
      const searchResponse = await drive.files.list({
        q: `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
        fields: 'files(id, name)',
      });

      if (searchResponse.data.files && searchResponse.data.files.length > 0) {
        console.log(`Found existing project folder: ${folderName}`);
        return searchResponse.data.files[0].id!;
      }

      // Create new folder
      console.log(`Creating new project folder: ${folderName}`);
      const createResponse = await drive.files.create({
        requestBody: {
          name: folderName,
          mimeType: 'application/vnd.google-apps.folder',
        },
        fields: 'id',
      });

      return createResponse.data.id!;
    } catch (error) {
      console.error('Error ensuring project folder:', error);
      throw new Error('Failed to create or find project folder in Google Drive');
    }
  }

  async createFileInFolder(userId: string, folderId: string, fileName: string, mimeType: string): Promise<{ fileId: string; webViewLink: string }> {
    try {
      const google = await getGoogleApi();
      const oauth2Client = await this.oauthService.getOAuth2Client(userId);
      const drive = google.drive({ version: 'v3', auth: oauth2Client });

      const response = await drive.files.create({
        requestBody: {
          name: fileName,
          mimeType: mimeType,
          parents: [folderId],
        },
        fields: 'id, webViewLink',
      });

      return {
        fileId: response.data.id!,
        webViewLink: response.data.webViewLink!,
      };
    } catch (error) {
      console.error('Error creating file in folder:', error);
      throw new Error('Failed to create file in Google Drive folder');
    }
  }

  async getFileInfo(userId: string, fileId: string) {
    try {
      const google = await getGoogleApi();
      const oauth2Client = await this.oauthService.getOAuth2Client(userId);
      const drive = google.drive({ version: 'v3', auth: oauth2Client });

      const response = await drive.files.get({
        fileId: fileId,
        fields: 'id, name, webViewLink, exportLinks',
      });

      return response.data;
    } catch (error) {
      console.error('Error getting file info:', error);
      throw new Error('Failed to get file information from Google Drive');
    }
  }
}