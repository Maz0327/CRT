import "express-serve-static-core";

declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
      metadata?: any;
      role?: string;
    }
    interface Request {
      user?: User;
      session?: {
        // Relaxed shape for Google integrations/settings; narrow later as needed
        google?: {
          accessToken?: string;
          refreshToken?: string;
          expiryDate?: number;
          [k: string]: any;
        };
        [k: string]: any;
      };
    }
  }
}
export {};