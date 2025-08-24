import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

interface CacheOptions {
  maxAge?: number;
  private?: boolean;
}

const DEFAULT_MAX_AGE = parseInt(process.env.CACHE_MAX_AGE || '30'); // 30 seconds

export function etag(options: CacheOptions = {}) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const originalSend = res.send;
    
    res.send = function(body: any): Response {
      // Generate ETag from response body
      const bodyString = typeof body === 'string' ? body : JSON.stringify(body);
      const hash = crypto.createHash('md5').update(bodyString).digest('hex');
      const etag = `"${hash}"`;
      
      // Set ETag header
      res.setHeader('ETag', etag);
      
      // Set Cache-Control header
      const maxAge = options.maxAge || DEFAULT_MAX_AGE;
      const cacheControl = options.private ? 'private' : 'public';
      res.setHeader('Cache-Control', `${cacheControl}, max-age=${maxAge}`);
      
      // Check If-None-Match header
      const clientEtag = req.headers['if-none-match'];
      if (clientEtag === etag) {
        return res.status(304).end();
      }
      
      // Call original send
      return originalSend.call(this as any, body);
    } as any;
    
    next();
  };
}

export const cacheableResponse = etag({ maxAge: DEFAULT_MAX_AGE, private: true });
export const publicCacheableResponse = etag({ maxAge: DEFAULT_MAX_AGE, private: false });