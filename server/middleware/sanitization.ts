import DOMPurify from "dompurify";
// Note: JSDOM import commented out for server environment
// import { JSDOM } from "jsdom";
import { Request, Response, NextFunction } from "express";

// Setup DOMPurify for server-side use - using simplified approach for now
const purify = {
  sanitize: (content: string, options: any) => {
    // Basic sanitization - remove script tags and dangerous attributes
    return content
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/on\w+="[^"]*"/g, '')
      .replace(/javascript:/g, '');
  }
};

export function sanitizeContent(content: string): string {
  if (!content || typeof content !== "string") return content;
  
  // Configure DOMPurify for safe HTML
  return purify.sanitize(content, {
    ALLOWED_TAGS: ["p", "br", "strong", "em", "u", "a", "ul", "ol", "li"],
    ALLOWED_ATTR: ["href", "title"],
    KEEP_CONTENT: true,
  });
}

export function sanitizeInput(req: Request, res: Response, next: NextFunction) {
  // Recursively sanitize request body
  function sanitizeObject(obj: any): any {
    if (typeof obj === "string") {
      return sanitizeContent(obj);
    } else if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    } else if (obj && typeof obj === "object") {
      const sanitized: any = {};
      for (const key in obj) {
        sanitized[key] = sanitizeObject(obj[key]);
      }
      return sanitized;
    }
    return obj;
  }

  if (req.body) {
    req.body = sanitizeObject(req.body);
  }

  next();
}