import { google } from 'googleapis';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/auth/google/callback'
);

export class GoogleAuthService {
  generateAuthUrl(scopes: string[] = [
    'https://www.googleapis.com/auth/presentations',
    'https://www.googleapis.com/auth/documents',
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/bigquery'
  ]) {
    return oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent'
    });
  }
  
  async exchangeCodeForTokens(code: string) {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    return tokens;
  }

  setTokens(tokens: any) {
    oauth2Client.setCredentials(tokens);
    return oauth2Client;
  }

  getAuthClient() {
    return oauth2Client;
  }
}

export const googleAuthService = new GoogleAuthService();