import { storage } from '../../storage';

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

export class GoogleOAuthService {
  private oauth2Client: any;

  async initialize() {
    if (!this.oauth2Client) {
      const google = await getGoogleApi();
      this.oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
      );
    }
    return this.oauth2Client;
  }

  async getOAuth2Client(userId: string) {
    try {
      await this.initialize();
      
      // Load tokens from database
      const user = await storage.getUser(userId);
      if (!user?.googleTokens) {
        throw new Error('No Google tokens found for user. Please re-authenticate.');
      }

      const tokens = user.googleTokens as any;
      this.oauth2Client.setCredentials(tokens);

      // Check if token needs refresh
      if (tokens.expiry_date && Date.now() >= tokens.expiry_date) {
        console.log('Refreshing Google OAuth token...');
        const { credentials } = await this.oauth2Client.refreshAccessToken();
        
        // Update database with new tokens
        await storage.updateUser(userId, {
          googleTokens: credentials
        });

        this.oauth2Client.setCredentials(credentials);
      }

      return this.oauth2Client;
    } catch (error) {
      console.error('Error getting OAuth2 client:', error);
      throw new Error('Failed to authenticate with Google. Please re-authenticate.');
    }
  }

  async saveTokens(userId: string, tokens: any) {
    try {
      await storage.updateUser(userId, {
        googleTokens: tokens
      });
    } catch (error) {
      console.error('Error saving Google tokens:', error);
      throw error;
    }
  }

  async getAuthUrl(scopes: string[] = [
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/presentations'
  ]) {
    await this.initialize();
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent'
    });
  }

  async getTokensFromCode(code: string) {
    try {
      await this.initialize();
      const { tokens } = await this.oauth2Client.getToken(code);
      return tokens;
    } catch (error) {
      console.error('Error getting tokens from code:', error);
      throw error;
    }
  }
}