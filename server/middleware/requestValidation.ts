import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
// Rate limiting functionality (install express-rate-limit if needed)

// Request size limits
export const requestSizeLimit = (req: Request, res: Response, next: NextFunction) => {
  const contentLength = parseInt(req.headers['content-length'] || '0');
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (contentLength > maxSize) {
    return res.status(413).json({
      error: 'Request too large',
      maxSize: '10MB'
    });
  }

  next();
};

// Content-Type validation
export const validateContentType = (allowedTypes: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
      const contentType = req.headers['content-type']?.split(';')[0];
      
      if (!contentType || !allowedTypes.includes(contentType)) {
        return res.status(415).json({
          error: 'Unsupported media type',
          allowed: allowedTypes
        });
      }
    }
    
    next();
  };
};

// Schema validation middleware
export const validateSchema = (schema: z.ZodSchema, target: 'body' | 'query' | 'params' = 'body') => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req[target];
      const validated = schema.parse(data);
      req[target] = validated;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        });
      }
      next(error);
    }
  };
};

// Simple rate limiting (can be enhanced with express-rate-limit)
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export const simpleRateLimit = (windowMs: number, max: number) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = req.ip || 'unknown';
    const now = Date.now();
    
    const clientData = requestCounts.get(key);
    
    if (!clientData || now > clientData.resetTime) {
      requestCounts.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }
    
    if (clientData.count >= max) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        retryAfter: Math.ceil((clientData.resetTime - now) / 1000)
      });
    }
    
    clientData.count++;
    next();
  };
};

// API rate limits
export const apiRateLimit = simpleRateLimit(15 * 60 * 1000, 100); // 100 requests per 15 minutes
export const authRateLimit = simpleRateLimit(15 * 60 * 1000, 5); // 5 auth attempts per 15 minutes
export const uploadRateLimit = simpleRateLimit(60 * 60 * 1000, 10); // 10 uploads per hour

// Request timeout
export const requestTimeout = (timeoutMs: number = 30000) => {
  return (req: Request, res: Response, next: NextFunction) => {
    req.setTimeout(timeoutMs, () => {
      if (!res.headersSent) {
        res.status(408).json({
          error: 'Request timeout',
          timeout: `${timeoutMs}ms`
        });
      }
    });
    
    next();
  };
};