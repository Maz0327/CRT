// Mock googleapis for development when package installation fails
// This provides the minimal interface needed for our Google services to compile

export const google = {
  auth: {
    OAuth2: class MockOAuth2Client {
      constructor(clientId?: string, clientSecret?: string, redirectUri?: string) {}
      
      setCredentials(tokens: any) {}
      
      generateAuthUrl(options: any) {
        return `https://accounts.google.com/oauth/authorize?mock=true`;
      }
      
      async getToken(code: string) {
        return {
          tokens: {
            access_token: 'mock_access_token',
            refresh_token: 'mock_refresh_token',
            expiry_date: Date.now() + 3600000
          }
        };
      }
      
      async refreshAccessToken() {
        return {
          credentials: {
            access_token: 'mock_refreshed_token',
            expiry_date: Date.now() + 3600000
          }
        };
      }
    }
  },
  
  drive: (options: any) => ({
    files: {
      async list(params: any) {
        return {
          data: {
            files: [] // Mock empty results for now
          }
        };
      },
      
      async create(params: any) {
        return {
          data: {
            id: `mock_file_${Date.now()}`,
            webViewLink: 'https://drive.google.com/mock-file'
          }
        };
      },
      
      async get(params: any) {
        return {
          data: {
            id: params.fileId,
            name: 'Mock File',
            webViewLink: 'https://drive.google.com/mock-file',
            exportLinks: {}
          }
        };
      },
      
      async update(params: any) {
        return {
          data: {
            id: params.fileId
          }
        };
      }
    }
  }),
  
  slides: (options: any) => ({
    presentations: {
      async create(params: any) {
        return {
          data: {
            presentationId: `mock_presentation_${Date.now()}`,
            title: params.requestBody?.title || 'Mock Presentation'
          }
        };
      },
      
      async get(params: any) {
        return {
          data: {
            presentationId: params.presentationId,
            slides: [
              {
                objectId: 'mock_slide_1'
              }
            ]
          }
        };
      },
      
      async batchUpdate(params: any) {
        return {
          data: {
            presentationId: params.presentationId,
            replies: []
          }
        };
      }
    }
  })
};

export const googleapis = google;