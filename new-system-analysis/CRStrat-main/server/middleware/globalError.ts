import { Request, Response, NextFunction } from 'express';
import { logger } from '../logger';
import { createErrorResponse } from './validation';

export function globalErrorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Log the error (server-side only)
  logger.error({
    error: error.message,
    stack: error.stack,
    requestId: (req as any).requestId,
    method: req.method,
    url: req.url,
    userId: (req as any).userId || 'anonymous'
  }, 'Unhandled error');

  // Don't expose internal errors in production
  const isDev = process.env.NODE_ENV !== 'production';
  
  // Send clean JSON response to client
  if (error.name === 'ValidationError' || error.message.includes('validation')) {
    return res.status(400).json(createErrorResponse(
      'VALIDATION_ERROR',
      'Request validation failed',
      isDev ? error.message : undefined
    ));
  }

  if (error.name === 'UnauthorizedError' || error.message.includes('Unauthorized')) {
    return res.status(401).json(createErrorResponse(
      'UNAUTHORIZED',
      'Authentication required'
    ));
  }

  if (error.name === 'ForbiddenError' || error.message.includes('Forbidden')) {
    return res.status(403).json(createErrorResponse(
      'FORBIDDEN',
      'Access denied'
    ));
  }

  if (error.name === 'NotFoundError' || error.message.includes('Not found')) {
    return res.status(404).json(createErrorResponse(
      'NOT_FOUND',
      'Resource not found'
    ));
  }

  // Default server error
  res.status(500).json(createErrorResponse(
    'INTERNAL_SERVER_ERROR',
    'An unexpected error occurred',
    isDev ? error.message : undefined
  ));
}

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json(createErrorResponse(
    'NOT_FOUND',
    `Route ${req.method} ${req.path} not found`
  ));
}