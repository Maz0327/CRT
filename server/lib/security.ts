import helmet from 'helmet';

// Enable helmet only in production to avoid development crashes
export const securityMiddleware = process.env.NODE_ENV === 'production' 
  ? helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "chrome-extension:"],
          styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
          imgSrc: ["'self'", "data:", "https:", "chrome-extension:"],
          connectSrc: ["'self'", "https:", "chrome-extension:"],
          fontSrc: ["'self'", "https://fonts.gstatic.com", "https://fonts.googleapis.com", "data:"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
        },
      },
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: { policy: "cross-origin" },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
      },
      hidePoweredBy: true,
      referrerPolicy: { policy: "strict-origin-when-cross-origin" }
    })
  : (req: any, res: any, next: any) => next(); // No-op middleware in development