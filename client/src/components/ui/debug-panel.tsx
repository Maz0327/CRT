import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, Activity, Terminal, BarChart3, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';

interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  details?: any;
}

interface LogsResponse {
  success: boolean;
  data: {
    logs: LogEntry[];
    count: number;
    level?: string;
    limit: number;
  };
}

interface ErrorSummary {
  success: boolean;
  data: {
    totalErrors: number;
    errorsByCategory: Record<string, number>;
    recentErrors: Array<{
      timestamp: string;
      message: string;
      details?: { stack?: string };
    }>;
  };
}

interface PerfMetric {
  method: string;
  endpoint: string;
  avgDuration: number;
  minDuration: number;
  maxDuration: number;
  count: number;
  errors: number;
}

interface HealthData {
  success: boolean;
  data: {
    healthy: boolean;
    activeUsers?: number;
    issues?: string[];
  };
}

interface RequestStats {
  success: boolean;
  data: {
    total: number;
    errorRate: number;
    avgResponseTime: number;
  };
}

export function DebugPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [logLevel, setLogLevel] = useState<string>('all');
  const [autoRefresh, setAutoRefresh] = useState(false);

  // Fetch debug logs
  const { data: logsData, refetch: refetchLogs } = useQuery<LogsResponse>({
    queryKey: ['/api/debug/logs', logLevel],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set('limit', '100');
      if (logLevel !== 'all') params.set('level', logLevel);
      const response = await fetch(`/api/debug/logs?${params}`);
      return response.json();
    },
    refetchInterval: autoRefresh ? 5000 : false
  });

  // Fetch error summary
  const { data: errorsData, refetch: refetchErrors } = useQuery<ErrorSummary>({
    queryKey: ['/api/debug/errors'],
    refetchInterval: autoRefresh ? 10000 : false
  });

  // Fetch performance metrics
  const { data: perfData, refetch: refetchPerf } = useQuery<{ success: boolean; data: { metrics: PerfMetric[] } }>({
    queryKey: ['/api/debug/performance'],
    refetchInterval: autoRefresh ? 10000 : false
  });

  // Fetch system health
  const { data: healthData, refetch: refetchHealth } = useQuery<HealthData>({
    queryKey: ['/api/system/health'],
    refetchInterval: autoRefresh ? 5000 : false
  });

  // Fetch system metrics
  const { data: metricsData, refetch: refetchMetrics } = useQuery({
    queryKey: ['/api/system/metrics'],
    refetchInterval: autoRefresh ? 30000 : false
  });

  // Fetch request stats
  const { data: requestsData, refetch: refetchRequests } = useQuery<RequestStats>({
    queryKey: ['/api/system/requests'],
    refetchInterval: autoRefresh ? 5000 : false
  });

  const refetchAll = () => {
    refetchLogs();
    refetchErrors();
    refetchPerf();
    refetchHealth();
    refetchMetrics();
    refetchRequests();
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'text-red-500';
      case 'warn': return 'text-yellow-500';
      case 'info': return 'text-blue-500';
      case 'debug': return 'text-gray-500';
      default: return 'text-gray-400';
    }
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50"
        size="sm"
        variant="outline"
      >
        <Terminal className="w-4 h-4 mr-2" />
        Debug Panel
      </Button>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t shadow-lg" style={{ height: '400px' }}>
      <div className="flex items-center justify-between p-2 border-b">
        <div className="flex items-center gap-4">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Terminal className="w-4 h-4" />
            Debug Panel
          </h3>
          
          {healthData?.data && (
            <Badge variant={healthData.data.healthy ? 'default' : 'destructive'}>
              {healthData.data.healthy ? 'Healthy' : 'Issues Detected'}
            </Badge>
          )}
          
          {healthData?.data?.activeUsers !== undefined && (
            <span className="text-xs text-muted-foreground">
              Active Users: {healthData.data.activeUsers}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} />
          </Button>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={refetchAll}
          >
            Refresh
          </Button>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsOpen(false)}
          >
            <ChevronDown className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="logs" className="h-full">
        <TabsList className="px-2">
          <TabsTrigger value="logs">
            <Terminal className="w-4 h-4 mr-1" />
            Logs
          </TabsTrigger>
          <TabsTrigger value="errors">
            <AlertCircle className="w-4 h-4 mr-1" />
            Errors
          </TabsTrigger>
          <TabsTrigger value="performance">
            <Activity className="w-4 h-4 mr-1" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="metrics">
            <BarChart3 className="w-4 h-4 mr-1" />
            Metrics
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="logs" className="px-2" style={{ height: 'calc(100% - 100px)' }}>
          <div className="flex items-center gap-2 mb-2">
            <Select value={logLevel} onValueChange={setLogLevel}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="error">Errors</SelectItem>
                <SelectItem value="warn">Warnings</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="debug">Debug</SelectItem>
              </SelectContent>
            </Select>
            
            <span className="text-xs text-muted-foreground">
              Showing {logsData?.data?.count || 0} logs
            </span>
          </div>
          
          <ScrollArea className="h-full">
            <div className="font-mono text-xs space-y-1">
              {logsData?.data?.logs?.map((log, idx) => (
                <div key={idx} className="flex items-start gap-2 p-1 hover:bg-muted/50">
                  <span className="text-muted-foreground">
                    {formatTimestamp(log.timestamp)}
                  </span>
                  <Badge variant="outline" className={`${getLevelColor(log.level)} text-xs`}>
                    {log.level}
                  </Badge>
                  <span className="flex-1">{log.message}</span>
                  {log.details && (
                    <span className="text-muted-foreground">
                      {JSON.stringify(log.details)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="errors" className="px-2" style={{ height: 'calc(100% - 100px)' }}>
          {errorsData?.data && (
            <div className="space-y-4">
              <div className="flex gap-4">
                <Card className="flex-1">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Total Errors</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{errorsData.data.totalErrors}</div>
                  </CardContent>
                </Card>
                
                <Card className="flex-1">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Error Categories</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1">
                      {Object.entries(errorsData.data.errorsByCategory || {}).map(([cat, count]) => (
                        <div key={cat} className="flex justify-between text-sm">
                          <span>{cat}</span>
                          <span className="font-semibold">{count as number}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <ScrollArea className="h-48">
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">Recent Errors</h4>
                  {errorsData.data.recentErrors?.map((error, idx) => (
                    <div key={idx} className="p-2 bg-destructive/10 rounded text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">
                          {formatTimestamp(error.timestamp)}
                        </span>
                        <span className="font-semibold">{error.message}</span>
                      </div>
                      {error.details?.stack && (
                        <pre className="mt-1 text-muted-foreground overflow-x-auto">
                          {error.details.stack}
                        </pre>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="performance" className="px-2" style={{ height: 'calc(100% - 100px)' }}>
          <ScrollArea className="h-full">
            <div className="space-y-2">
              {perfData?.data?.metrics?.map((metric, idx) => (
                <Card key={idx}>
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{metric.method}</Badge>
                        <span className="text-sm font-mono">{metric.endpoint}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span>
                          Avg: <strong>{formatDuration(metric.avgDuration)}</strong>
                        </span>
                        <span>
                          Min: <strong>{formatDuration(metric.minDuration)}</strong>
                        </span>
                        <span>
                          Max: <strong>{formatDuration(metric.maxDuration)}</strong>
                        </span>
                        <span>
                          Calls: <strong>{metric.count}</strong>
                        </span>
                        {metric.errors > 0 && (
                          <Badge variant="destructive">
                            {metric.errors} errors
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="metrics" className="px-2" style={{ height: 'calc(100% - 100px)' }}>
          {requestsData?.data && (
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-2">
                <Card>
                  <CardContent className="p-3">
                    <div className="text-xs text-muted-foreground">Total Requests (5m)</div>
                    <div className="text-xl font-bold">{requestsData.data.total}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-3">
                    <div className="text-xs text-muted-foreground">Error Rate</div>
                    <div className="text-xl font-bold">
                      {(requestsData.data.errorRate * 100).toFixed(1)}%
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-3">
                    <div className="text-xs text-muted-foreground">Avg Response</div>
                    <div className="text-xl font-bold">
                      {formatDuration(requestsData.data.avgResponseTime)}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-3">
                    <div className="text-xs text-muted-foreground">Health Status</div>
                    <div className="text-xl font-bold">
                      {healthData?.data?.issues?.length ? (
                        <Badge variant="destructive">Issues</Badge>
                      ) : (
                        <Badge variant="default">OK</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {healthData?.data?.issues && healthData.data.issues.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">System Issues</h4>
                  {healthData.data.issues.map((issue, idx) => (
                    <Badge key={idx} variant="destructive" className="block">
                      {issue}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}