import { Request, Response } from 'express';
import { storage } from '../storage';

export interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  environment: string;
  uptime: number;
  checks: {
    database: HealthStatus;
    storage: HealthStatus;
    brightData: HealthStatus;
    memory: HealthStatus;
  };
}

interface HealthStatus {
  status: 'pass' | 'fail' | 'warn';
  message?: string;
  responseTime?: number;
  details?: any;
}

class HealthChecker {
  private startTime = Date.now();

  async checkDatabase(): Promise<HealthStatus> {
    const start = Date.now();
    try {
      // Test database connection with a simple query
      await storage.healthCheck();
      return {
        status: 'pass',
        responseTime: Date.now() - start,
        message: 'Database connection healthy'
      };
    } catch (error) {
      return {
        status: 'fail',
        responseTime: Date.now() - start,
        message: 'Database connection failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async checkStorage(): Promise<HealthStatus> {
    const start = Date.now();
    try {
      // Test storage operations
      const testResult = await storage.healthCheck();
      return {
        status: 'pass',
        responseTime: Date.now() - start,
        message: 'Storage operations healthy'
      };
    } catch (error) {
      return {
        status: 'fail',
        responseTime: Date.now() - start,
        message: 'Storage operations failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async checkBrightData(): Promise<HealthStatus> {
    const start = Date.now();
    try {
      // Check if Bright Data API token is configured
      const hasToken = !!process.env.BRIGHT_DATA_API_TOKEN;
      if (!hasToken) {
        return {
          status: 'warn',
          responseTime: Date.now() - start,
          message: 'Bright Data API token not configured'
        };
      }

      return {
        status: 'pass',
        responseTime: Date.now() - start,
        message: 'Bright Data configuration healthy'
      };
    } catch (error) {
      return {
        status: 'fail',
        responseTime: Date.now() - start,
        message: 'Bright Data check failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  checkMemory(): HealthStatus {
    const memUsage = process.memoryUsage();
    const totalMB = Math.round(memUsage.rss / 1024 / 1024);
    const heapUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
    const heapTotalMB = Math.round(memUsage.heapTotal / 1024 / 1024);
    
    // Warning if heap usage is over 80%
    const heapUsagePercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;
    
    if (heapUsagePercent > 90) {
      return {
        status: 'fail',
        message: 'High memory usage detected',
        details: { totalMB, heapUsedMB, heapTotalMB, heapUsagePercent: Math.round(heapUsagePercent) }
      };
    } else if (heapUsagePercent > 80) {
      return {
        status: 'warn',
        message: 'Elevated memory usage',
        details: { totalMB, heapUsedMB, heapTotalMB, heapUsagePercent: Math.round(heapUsagePercent) }
      };
    }

    return {
      status: 'pass',
      message: 'Memory usage normal',
      details: { totalMB, heapUsedMB, heapTotalMB, heapUsagePercent: Math.round(heapUsagePercent) }
    };
  }

  async performHealthCheck(): Promise<HealthCheckResult> {
    const [database, storage, brightData] = await Promise.all([
      this.checkDatabase(),
      this.checkStorage(),
      this.checkBrightData()
    ]);

    const memory = this.checkMemory();
    const checks = { database, storage, brightData, memory };

    // Determine overall status
    const hasFailures = Object.values(checks).some(check => check.status === 'fail');
    const hasWarnings = Object.values(checks).some(check => check.status === 'warn');
    
    let status: 'healthy' | 'degraded' | 'unhealthy';
    if (hasFailures) {
      status = 'unhealthy';
    } else if (hasWarnings) {
      status = 'degraded';
    } else {
      status = 'healthy';
    }

    return {
      status,
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: Math.round((Date.now() - this.startTime) / 1000),
      checks
    };
  }
}

const healthChecker = new HealthChecker();

export const healthCheckEndpoint = async (req: Request, res: Response) => {
  try {
    const result = await healthChecker.performHealthCheck();
    
    // Set appropriate HTTP status based on health
    let httpStatus = 200;
    if (result.status === 'degraded') {
      httpStatus = 200; // Still operational but with warnings
    } else if (result.status === 'unhealthy') {
      httpStatus = 503; // Service unavailable
    }

    res.status(httpStatus).json(result);
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const readinessCheck = async (req: Request, res: Response) => {
  try {
    // Quick readiness check - just database
    await storage.healthCheck();
    res.status(200).json({ status: 'ready' });
  } catch (error) {
    res.status(503).json({ status: 'not ready', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};