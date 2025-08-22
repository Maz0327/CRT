// Professional Debug Infrastructure from transferred code
import { Request, Response } from 'express';

interface LogEntry {
  timestamp: Date;
  level: 'error' | 'warn' | 'info' | 'debug';
  message: string;
  details?: any;
  category?: string;
  userId?: string;
  requestId?: string;
}

interface ErrorSummary {
  totalErrors: number;
  errorsByCategory: Record<string, number>;
  recentErrors: LogEntry[];
  criticalErrors: LogEntry[];
}

interface PerformanceMetric {
  endpoint: string;
  method: string;
  avgDuration: number;
  minDuration: number;
  maxDuration: number;
  count: number;
  errors: number;
}

class DebugLogger {
  private logs: LogEntry[] = [];
  private maxLogs = 1000;
  private performanceMetrics: Map<string, PerformanceMetric> = new Map();

  constructor() {
    // Cleanup old logs every hour
    setInterval(() => this.cleanup(), 60 * 60 * 1000);
  }

  private cleanup() {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours
    this.logs = this.logs.filter(log => log.timestamp > cutoff);
  }

  log(level: LogEntry['level'], message: string, details?: any, category?: string) {
    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      message,
      details,
      category,
      requestId: Math.random().toString(36).substring(7)
    };

    this.logs.unshift(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }

    // Console output for development
    const color = level === 'error' ? '\x1b[31m' : 
                  level === 'warn' ? '\x1b[33m' : 
                  level === 'info' ? '\x1b[36m' : '\x1b[90m';
    console.log(`${color}[${level.toUpperCase()}] ${message}\x1b[0m`, details || '');
  }

  error(message: string, error?: Error | any, category?: string) {
    this.log('error', message, {
      error: error?.message || error,
      stack: error?.stack,
      ...error
    }, category);
  }

  warn(message: string, details?: any) {
    this.log('warn', message, details);
  }

  info(message: string, details?: any) {
    this.log('info', message, details);
  }

  debug(message: string, details?: any) {
    this.log('debug', message, details);
  }

  apiCall(req: Request, res: Response, duration: number, error?: Error) {
    const key = `${req.method}:${req.path}`;
    
    if (!this.performanceMetrics.has(key)) {
      this.performanceMetrics.set(key, {
        endpoint: req.path,
        method: req.method,
        avgDuration: duration,
        minDuration: duration,
        maxDuration: duration,
        count: 1,
        errors: error ? 1 : 0
      });
    } else {
      const metric = this.performanceMetrics.get(key)!;
      metric.count++;
      metric.minDuration = Math.min(metric.minDuration, duration);
      metric.maxDuration = Math.max(metric.maxDuration, duration);
      metric.avgDuration = (metric.avgDuration * (metric.count - 1) + duration) / metric.count;
      if (error) metric.errors++;
    }

    if (error) {
      this.error(`API Error: ${req.method} ${req.path}`, error, 'api');
    }
  }

  getRecentLogs(limit: number = 50, level?: LogEntry['level']): LogEntry[] {
    let filtered = this.logs;
    if (level) {
      filtered = filtered.filter(log => log.level === level);
    }
    return filtered.slice(0, limit);
  }

  getErrorSummary(): ErrorSummary {
    const errors = this.logs.filter(log => log.level === 'error');
    const errorsByCategory: Record<string, number> = {};
    
    errors.forEach(error => {
      const category = error.category || 'uncategorized';
      errorsByCategory[category] = (errorsByCategory[category] || 0) + 1;
    });

    return {
      totalErrors: errors.length,
      errorsByCategory,
      recentErrors: errors.slice(0, 10),
      criticalErrors: errors.filter(e => 
        e.message.toLowerCase().includes('critical') || 
        e.message.toLowerCase().includes('fatal')
      ).slice(0, 5)
    };
  }

  getPerformanceMetrics(): PerformanceMetric[] {
    return Array.from(this.performanceMetrics.values())
      .sort((a, b) => b.avgDuration - a.avgDuration);
  }

  clearLogs() {
    this.logs = [];
    this.performanceMetrics.clear();
  }
}

export const debugLogger = new DebugLogger();

// Error handler middleware
export function errorHandler(err: Error, req: Request, res: Response, next: any) {
  debugLogger.error(`Unhandled Error: ${req.method} ${req.path}`, err, 'unhandled');
  
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message,
    requestId: Math.random().toString(36).substring(7)
  });
}