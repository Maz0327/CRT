import { Request, Response, NextFunction } from 'express';

/**
 * Phase 5: Chrome Extension Security
 * 
 * Implements secure communication protocols, CSP validation,
 * and permission auditing for the Chrome extension integration.
 */

export interface ExtensionSecurityConfig {
  allowedOrigins: string[];
  requiredPermissions: string[];
  maxRequestSize: number;
  rateLimitWindow: number;
  rateLimitRequests: number;
}

export class ChromeExtensionSecurityManager {
  private config: ExtensionSecurityConfig;
  private requestCounts = new Map<string, { count: number; resetTime: number }>();

  constructor() {
    this.config = {
      allowedOrigins: [
        'chrome-extension://*', // All chrome extensions for now
        'moz-extension://*',    // Firefox support
        'https://localhost:*',  // Development
        'https://*.replit.dev', // Replit domains
        'https://*.replit.app'  // Replit app domains
      ],
      requiredPermissions: [
        'activeTab',
        'storage',
        'scripting'
      ],
      maxRequestSize: 5 * 1024 * 1024, // 5MB for captures with images
      rateLimitWindow: 60 * 1000,      // 1 minute
      rateLimitRequests: 100           // 100 requests per minute per extension
    };
  }

  /**
   * Validates extension origin and enforces CSP
   */
  validateExtensionOrigin = (req: Request, res: Response, next: NextFunction) => {
    const origin = req.headers.origin;
    const userAgent = req.headers['user-agent'];

    // Allow extension requests
    if (origin && this.isAllowedOrigin(origin)) {
      res.header('Access-Control-Allow-Origin', origin);
      res.header('Access-Control-Allow-Credentials', 'true');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Extension-Id, X-Extension-Version');
      return next();
    }

    // Block non-extension requests to extension endpoints
    if (req.path.startsWith('/api/extension/')) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Extension endpoints only accessible from authorized origins'
      });
    }

    next();
  };

  /**
   * Rate limiting specific to extension requests
   */
  extensionRateLimit = (req: Request, res: Response, next: NextFunction) => {
    const extensionId = req.headers['x-extension-id'] as string;
    const key = extensionId || req.ip || 'unknown';
    const now = Date.now();

    const clientData = this.requestCounts.get(key);

    if (!clientData || now > clientData.resetTime) {
      this.requestCounts.set(key, {
        count: 1,
        resetTime: now + this.config.rateLimitWindow
      });
      return next();
    }

    if (clientData.count >= this.config.rateLimitRequests) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        message: 'Too many extension requests',
        retryAfter: Math.ceil((clientData.resetTime - now) / 1000)
      });
    }

    clientData.count++;
    next();
  };

  /**
   * Validates request size for extension uploads
   */
  validateRequestSize = (req: Request, res: Response, next: NextFunction) => {
    const contentLength = parseInt(req.headers['content-length'] || '0');

    if (contentLength > this.config.maxRequestSize) {
      return res.status(413).json({
        error: 'Payload too large',
        message: `Maximum size is ${this.config.maxRequestSize / 1024 / 1024}MB`,
        maxSize: this.config.maxRequestSize
      });
    }

    next();
  };

  /**
   * Extension authentication middleware
   */
  authenticateExtension = (req: Request, res: Response, next: NextFunction) => {
    const extensionId = req.headers['x-extension-id'] as string;
    const extensionVersion = req.headers['x-extension-version'] as string;

    if (!extensionId) {
      return res.status(401).json({
        error: 'Extension authentication required',
        message: 'X-Extension-Id header missing'
      });
    }

    // Validate extension version (basic semver check)
    if (extensionVersion && !this.isValidVersion(extensionVersion)) {
      return res.status(400).json({
        error: 'Invalid extension version',
        message: 'Extension version must be valid semver'
      });
    }

    // Add extension info to request
    (req as any).extension = {
      id: extensionId,
      version: extensionVersion
    };

    next();
  };

  /**
   * Content Security Policy enforcement for extension responses
   */
  setExtensionCSP = (req: Request, res: Response, next: NextFunction) => {
    // Set strict CSP for extension API responses
    res.header('Content-Security-Policy', [
      "default-src 'none'",
      "script-src 'none'", 
      "style-src 'none'",
      "img-src 'none'",
      "connect-src 'self'",
      "font-src 'none'",
      "object-src 'none'",
      "media-src 'none'",
      "frame-src 'none'"
    ].join('; '));

    res.header('X-Content-Type-Options', 'nosniff');
    res.header('X-Frame-Options', 'DENY');
    res.header('X-XSS-Protection', '1; mode=block');

    next();
  };

  private isAllowedOrigin(origin: string): boolean {
    return this.config.allowedOrigins.some(allowed => {
      if (allowed.includes('*')) {
        const pattern = allowed.replace(/\*/g, '.*');
        return new RegExp('^' + pattern + '$').test(origin);
      }
      return allowed === origin;
    });
  }

  private isValidVersion(version: string): boolean {
    // Basic semver validation
    const semverPattern = /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/;
    return semverPattern.test(version);
  }

  /**
   * Log extension security events
   */
  logSecurityEvent(event: string, details: any, req: Request) {
    const securityLog = {
      timestamp: new Date().toISOString(),
      event,
      extensionId: req.headers['x-extension-id'],
      origin: req.headers.origin,
      userAgent: req.headers['user-agent'],
      ip: req.ip,
      details
    };

    console.log('🔒 Extension Security Event:', JSON.stringify(securityLog));
  }
}

export const extensionSecurity = new ChromeExtensionSecurityManager();