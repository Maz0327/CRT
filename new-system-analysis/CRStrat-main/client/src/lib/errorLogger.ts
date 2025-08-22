// Global error logging service
class ErrorLogger {
  private static instance: ErrorLogger;
  private errors: Array<{
    id: string;
    type: 'frontend' | 'backend' | 'api' | 'network';
    level: 'error' | 'warning' | 'info';
    message: string;
    stack?: string;
    timestamp: string;
    url?: string;
    userAgent?: string;
  }> = [];

  private constructor() {
    this.setupGlobalErrorHandlers();
  }

  static getInstance(): ErrorLogger {
    if (!ErrorLogger.instance) {
      ErrorLogger.instance = new ErrorLogger();
    }
    return ErrorLogger.instance;
  }

  private setupGlobalErrorHandlers() {
    // Capture JavaScript errors
    window.addEventListener('error', (event) => {
      this.logError({
        type: 'frontend',
        level: 'error',
        message: event.message,
        stack: event.error?.stack,
        url: event.filename,
      });
    });

    // Capture unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.logError({
        type: 'frontend',
        level: 'error',
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack,
      });
    });

    // Capture console errors
    const originalError = console.error;
    console.error = (...args) => {
      this.logError({
        type: 'frontend',
        level: 'error',
        message: args.join(' '),
      });
      originalError.apply(console, args);
    };

    // Capture console warnings
    const originalWarn = console.warn;
    console.warn = (...args) => {
      this.logError({
        type: 'frontend',
        level: 'warning',
        message: args.join(' '),
      });
      originalWarn.apply(console, args);
    };
  }

  logError(error: {
    type: 'frontend' | 'backend' | 'api' | 'network';
    level: 'error' | 'warning' | 'info';
    message: string;
    stack?: string;
    url?: string;
  }) {
    const errorEntry = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      ...error,
    };

    this.errors.unshift(errorEntry);
    
    // Keep only last 100 errors
    if (this.errors.length > 100) {
      this.errors = this.errors.slice(0, 100);
    }

    // Send to backend for centralized logging
    this.sendToBackend(errorEntry);

    return errorEntry.id;
  }

  private async sendToBackend(error: any) {
    try {
      await fetch('/api/system/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(error),
      });
    } catch (networkError) {
      // Don't create infinite loops - just store locally
      console.warn('Failed to send error to backend:', networkError);
    }
  }

  getErrors() {
    return [...this.errors];
  }

  clearErrors() {
    this.errors = [];
  }

  logApiError(endpoint: string, status: number, message: string) {
    return this.logError({
      type: 'api',
      level: 'error',
      message: `API Error ${status}: ${message} (${endpoint})`,
      url: endpoint,
    });
  }

  logNetworkError(endpoint: string, error: Error) {
    return this.logError({
      type: 'network',
      level: 'error',
      message: `Network Error: ${error.message} (${endpoint})`,
      stack: error.stack,
      url: endpoint,
    });
  }

  logWarning(message: string, details?: any) {
    return this.logError({
      type: 'frontend',
      level: 'warning',
      message: `${message}${details ? `: ${JSON.stringify(details)}` : ''}`,
    });
  }

  logInfo(message: string, details?: any) {
    return this.logError({
      type: 'frontend',
      level: 'info',
      message: `${message}${details ? `: ${JSON.stringify(details)}` : ''}`,
    });
  }
}

// Export singleton instance
export const errorLogger = ErrorLogger.getInstance();

// Hook for React components
import { useState, useEffect } from 'react';

export function useErrorLogger() {
  const [errors, setErrors] = useState(errorLogger.getErrors());

  useEffect(() => {
    const interval = setInterval(() => {
      setErrors(errorLogger.getErrors());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return {
    errors,
    logError: (error: Parameters<typeof errorLogger.logError>[0]) => errorLogger.logError(error),
    clearErrors: () => {
      errorLogger.clearErrors();
      setErrors([]);
    },
    logApiError: errorLogger.logApiError.bind(errorLogger),
    logNetworkError: errorLogger.logNetworkError.bind(errorLogger),
    logWarning: errorLogger.logWarning.bind(errorLogger),
    logInfo: errorLogger.logInfo.bind(errorLogger),
  };
}