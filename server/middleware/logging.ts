import { Request, Response, NextFunction } from 'express';

export interface LogContext {
  requestId: string;
  method: string;
  url: string;
  userAgent?: string;
  ip: string;
  userId?: string;
  timestamp: string;
  duration?: number;
  statusCode?: number;
  error?: any;
}

class Logger {
  private generateRequestId(): string {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }

  private formatLog(level: string, message: string, context?: Partial<LogContext>): void {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      ...context
    };

    // Structured logging for production
    if (process.env.NODE_ENV === 'production') {
      console.log(JSON.stringify(logEntry));
    } else {
      // Readable format for development
      const contextStr = context ? ` | ${JSON.stringify(context)}` : '';
      console.log(`[${timestamp}] ${level.toUpperCase()}: ${message}${contextStr}`);
    }
  }

  info(message: string, context?: Partial<LogContext>): void {
    this.formatLog('info', message, context);
  }

  warn(message: string, context?: Partial<LogContext>): void {
    this.formatLog('warn', message, context);
  }

  error(message: string, context?: Partial<LogContext>): void {
    this.formatLog('error', message, context);
  }

  debug(message: string, context?: Partial<LogContext>): void {
    if (process.env.NODE_ENV === 'development' || process.env.ENABLE_DEBUG_LOGGING === 'true') {
      this.formatLog('debug', message, context);
    }
  }
}

export const logger = new Logger();

// Request logging middleware
export const requestLogger = (req: Request & { requestId?: string }, res: Response, next: NextFunction) => {
  const requestId = req.headers['x-request-id'] as string || Math.random().toString(36).substr(2, 9);
  req.requestId = requestId;
  
  const startTime = Date.now();
  const context: LogContext = {
    requestId,
    method: req.method,
    url: req.url,
    userAgent: req.headers['user-agent'],
    ip: req.ip || req.connection.remoteAddress || 'unknown',
    userId: (req as any).session?.user?.id,
    timestamp: new Date().toISOString()
  };

  // Log incoming request
  logger.info('Incoming request', context);

  // Override res.end to capture response details
  const originalEnd = res.end.bind(res);
  res.end = function(chunk?: any, encoding?: any) {
    const duration = Date.now() - startTime;
    const responseContext = {
      ...context,
      duration,
      statusCode: res.statusCode
    };

    if (res.statusCode >= 400) {
      logger.warn('Request completed with error', responseContext);
    } else {
      logger.info('Request completed successfully', responseContext);
    }

    return originalEnd(chunk, encoding);
  };

  next();
};

// Error logging middleware
export const errorLogger = (error: Error, req: Request & { requestId?: string }, res: Response, next: NextFunction) => {
  const context: LogContext = {
    requestId: req.requestId || 'unknown',
    method: req.method,
    url: req.url,
    ip: req.ip || 'unknown',
    userId: (req as any).session?.user?.id,
    timestamp: new Date().toISOString(),
    error: {
      message: error.message,
      stack: error.stack,
      name: error.name
    }
  };

  logger.error('Request error', context);
  next(error);
};