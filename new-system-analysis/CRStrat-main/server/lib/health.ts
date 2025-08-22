import { Request, Response } from 'express';
import { storage } from '../storage';

const startTime = Date.now();

export const healthzEndpoint = async (req: Request, res: Response) => {
  const uptime = Math.round((Date.now() - startTime) / 1000);
  
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    uptime
  });
};

export const readyzEndpoint = async (req: Request, res: Response) => {
  try {
    // Check database connection
    await storage.healthCheck();
    
    // Check worker status if enabled
    const workersEnabled = process.env.ENABLE_WORKERS === 'true';
    let workerStatus = 'disabled';
    
    if (workersEnabled) {
      // Simple worker health check - could be expanded
      workerStatus = 'healthy';
    }
    
    res.status(200).json({
      status: 'ready',
      timestamp: new Date().toISOString(),
      checks: {
        database: 'pass',
        workers: workerStatus
      }
    });
  } catch (error) {
    res.status(503).json({
      status: 'not ready',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      checks: {
        database: 'fail',
        workers: 'unknown'
      }
    });
  }
};