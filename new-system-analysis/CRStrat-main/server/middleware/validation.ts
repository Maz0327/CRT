import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

export interface StandardError {
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

export function createErrorResponse(code: string, message: string, details?: any): StandardError {
  return {
    error: {
      code,
      message,
      details
    }
  };
}

export function validateBody<T>(schema: z.ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json(createErrorResponse(
          'VALIDATION_ERROR',
          'Request body validation failed',
          error.errors
        ));
      }
      next(error);
    }
  };
}

export function validateQuery<T>(schema: z.ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.query = schema.parse(req.query);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json(createErrorResponse(
          'VALIDATION_ERROR',
          'Query parameters validation failed',
          error.errors
        ));
      }
      next(error);
    }
  };
}

export function validateParams<T>(schema: z.ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.params = schema.parse(req.params);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json(createErrorResponse(
          'VALIDATION_ERROR',
          'Path parameters validation failed',
          error.errors
        ));
      }
      next(error);
    }
  };
}