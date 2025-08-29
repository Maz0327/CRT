// System Monitoring Service from transferred code
import os from 'os';

interface SystemMetrics {
  timestamp: Date;
  cpu: {
    usage: number;
    loadAverage: number[];
  };
  memory: {
    used: number;
    free: number;
    total: number;
    percentage: number;
  };
  requests: {
    total: number;
    successful: number;
    failed: number;
    avgDuration: number;
  };
  activeUsers: number;
  uptime: number;
}

interface RequestMetric {
  method: string;
  path: string;
  statusCode: number;
  duration: number;
  timestamp: Date;
  userId?: string;
  userAgent?: string;
  error?: string;
}

class SystemMonitor {
  private metrics: SystemMetrics[] = [];
  private requests: RequestMetric[] = [];
  private activeUsers = new Set<string>();
  private requestCounts = { total: 0, successful: 0, failed: 0 };
  private totalDuration = 0;
  private startTime = Date.now();

  constructor() {
    // Collect system metrics every 5 minutes (reduced from 1 minute)
    setInterval(() => this.collectMetrics(), 5 * 60 * 1000);
    
    // Cleanup old data every 30 minutes (increased frequency)
    setInterval(() => this.cleanup(), 30 * 60 * 1000);
    
    // Initial collection
    this.collectMetrics();
  }

  private collectMetrics() {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    
    const metric: SystemMetrics = {
      timestamp: new Date(),
      cpu: {
        usage: os.loadavg()[0], // 1 minute load average
        loadAverage: os.loadavg()
      },
      memory: {
        used: usedMem,
        free: freeMem,
        total: totalMem,
        percentage: (usedMem / totalMem) * 100
      },
      requests: {
        total: this.requestCounts.total,
        successful: this.requestCounts.successful,
        failed: this.requestCounts.failed,
        avgDuration: this.requestCounts.total > 0 
          ? this.totalDuration / this.requestCounts.total 
          : 0
      },
      activeUsers: this.activeUsers.size,
      uptime: Date.now() - this.startTime
    };

    this.metrics.push(metric);
    
    // Keep only last 24 hours of metrics
    if (this.metrics.length > 1440) { // 24 hours * 60 minutes
      this.metrics = this.metrics.slice(-1440);
    }
  }

  private cleanup() {
    // Remove requests older than 1 hour (reduced from 24 hours)
    const cutoff = new Date(Date.now() - 60 * 60 * 1000);
    this.requests = this.requests.filter(req => req.timestamp > cutoff);
    
    // Keep only last 100 requests (reduced from 1000)
    if (this.requests.length > 100) {
      this.requests = this.requests.slice(-100);
    }
    
    // Keep only last 50 active users (reduced from 100)
    if (this.activeUsers.size > 50) {
      const usersArray = Array.from(this.activeUsers);
      this.activeUsers.clear();
      // Keep most recent 25 users
      usersArray.slice(-25).forEach(user => this.activeUsers.add(user));
    }
    
    // Keep only last 6 hours of metrics (reduced from 24 hours)
    if (this.metrics.length > 72) {
      this.metrics = this.metrics.slice(-72);
    }
  }

  recordRequest(
    method: string,
    path: string,
    statusCode: number,
    duration: number,
    userId?: string,
    userAgent?: string,
    error?: string
  ) {
    const request: RequestMetric = {
      method,
      path,
      statusCode,
      duration,
      timestamp: new Date(),
      userId,
      userAgent,
      error
    };

    this.requests.push(request);
    
    // Update counters
    this.requestCounts.total++;
    if (statusCode < 400) {
      this.requestCounts.successful++;
    } else {
      this.requestCounts.failed++;
    }
    this.totalDuration += duration;

    // Track active users
    if (userId) {
      this.activeUsers.add(userId);
    }

    // Keep only last 1000 requests in memory
    if (this.requests.length > 1000) {
      this.requests = this.requests.slice(-1000);
    }
  }

  getLatestMetrics(): SystemMetrics | null {
    return this.metrics[this.metrics.length - 1] || null;
  }

  getMetricsHistory(hours: number = 1): SystemMetrics[] {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    return this.metrics.filter(m => m.timestamp > cutoff);
  }

  getRequestStats() {
    const last5Minutes = new Date(Date.now() - 5 * 60 * 1000);
    const recentRequests = this.requests.filter(r => r.timestamp > last5Minutes);
    
    const byEndpoint: Record<string, { count: number; avgDuration: number; errors: number }> = {};
    
    recentRequests.forEach(req => {
      const key = `${req.method} ${req.path}`;
      if (!byEndpoint[key]) {
        byEndpoint[key] = { count: 0, avgDuration: 0, errors: 0 };
      }
      byEndpoint[key].count++;
      byEndpoint[key].avgDuration = 
        (byEndpoint[key].avgDuration * (byEndpoint[key].count - 1) + req.duration) / 
        byEndpoint[key].count;
      if (req.statusCode >= 400) {
        byEndpoint[key].errors++;
      }
    });

    return {
      total: recentRequests.length,
      byEndpoint,
      errorRate: recentRequests.length > 0 
        ? recentRequests.filter(r => r.statusCode >= 400).length / recentRequests.length 
        : 0,
      avgResponseTime: recentRequests.length > 0
        ? recentRequests.reduce((sum, r) => sum + r.duration, 0) / recentRequests.length
        : 0
    };
  }

  getHealthStatus() {
    const latest = this.getLatestMetrics();
    if (!latest) return { healthy: true, issues: [] };

    const issues: string[] = [];
    
    // Check CPU usage
    if (latest.cpu.usage > 0.8) {
      issues.push(`High CPU usage: ${(latest.cpu.usage * 100).toFixed(1)}%`);
    }
    
    // Check memory usage
    if (latest.memory.percentage > 90) {
      issues.push(`High memory usage: ${latest.memory.percentage.toFixed(1)}%`);
    }
    
    // Check error rate
    const errorRate = latest.requests.failed / (latest.requests.total || 1);
    if (errorRate > 0.1) {
      issues.push(`High error rate: ${(errorRate * 100).toFixed(1)}%`);
    }
    
    // Check response time
    if (latest.requests.avgDuration > 1000) {
      issues.push(`Slow response time: ${latest.requests.avgDuration.toFixed(0)}ms`);
    }

    return {
      healthy: issues.length === 0,
      issues,
      uptime: latest.uptime,
      activeUsers: latest.activeUsers
    };
  }
}

export const systemMonitor = new SystemMonitor();