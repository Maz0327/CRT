import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, AlertCircle, Zap, Database, Brain, FileText, Globe, Puzzle } from "lucide-react";
import { FadeIn } from "@/components/ui/fade-in";

interface ServiceStatus {
  strategicIntelligence: string;
  truthAnalysis: string;
  tier2Platforms: string;
  briefGeneration: string;
  chromeExtension: string;
}

export default function SystemStatus() {
  const { data: systemStatus } = useQuery({
    queryKey: ['/api/system/status'],
    queryFn: async () => {
      // Mock system status for now - in real implementation this would call the API
      return {
        services: {
          strategicIntelligence: 'operational',
          truthAnalysis: 'operational',
          tier2Platforms: 'operational',
          briefGeneration: 'operational',
          chromeExtension: 'operational'
        },
        platforms: {
          tier1: { reddit: 'active', youtube: 'active', twitter: 'active' },
          tier2: { instagram: 'active', linkedin: 'active', tiktok: 'active' }
        },
        timestamp: new Date().toISOString()
      };
    },
    refetchInterval: 30000,
  });

  const services = [
    {
      name: "Strategic Intelligence",
      key: "strategicIntelligence",
      icon: Brain,
      description: "AI-powered content analysis",
    },
    {
      name: "Truth Analysis",
      key: "truthAnalysis",
      icon: Zap,
      description: "Four-layer framework processing",
    },
    {
      name: "Platform Integration",
      key: "tier2Platforms",
      icon: Globe,
      description: "6 active data sources",
    },
    {
      name: "Brief Generation",
      key: "briefGeneration",
      icon: FileText,
      description: "DSD methodology templates",
    },
    {
      name: "Chrome Extension",
      key: "chromeExtension",
      icon: Puzzle,
      description: "Browser integration active",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
        return 'text-green-600';
      case 'degraded':
        return 'text-yellow-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'degraded':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const operationalCount = systemStatus?.services
    ? Object.values(systemStatus.services).filter((s: any) => s === 'operational').length
    : 0;
  const totalServices = services.length;
  const healthPercentage = (operationalCount / totalServices) * 100;

  return (
    <FadeIn>
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>System Health</span>
            <Badge variant={healthPercentage === 100 ? "default" : "secondary"} className="animate-pulse">
              {healthPercentage.toFixed(0)}% Operational
            </Badge>
          </CardTitle>
          <CardDescription>Real-time status of all Strategic Intelligence services</CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={healthPercentage} className="mb-6 h-3" />
          
          <div className="space-y-3">
            {services.map((service) => {
              const Icon = service.icon;
              const status = systemStatus?.services?.[service.key as keyof ServiceStatus] || 'loading';
              
              return (
                <div key={service.key} className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                      <Icon className="h-4 w-4 text-gray-700 dark:text-gray-300" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{service.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{service.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(status)}
                    <span className={`text-sm font-medium capitalize ${getStatusColor(status)}`}>
                      {status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {systemStatus?.platforms && (
            <div className="mt-6 pt-6 border-t">
              <h4 className="text-sm font-medium mb-3">Platform Coverage</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Primary Platforms</p>
                  <p className="text-lg font-semibold text-blue-600">
                    {Object.keys(systemStatus.platforms.tier1 || {}).length}
                  </p>
                </div>
                <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Extended Reach</p>
                  <p className="text-lg font-semibold text-green-600">
                    {Object.keys(systemStatus.platforms.tier2 || {}).length}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
            Last updated: {systemStatus?.timestamp ? new Date(systemStatus.timestamp).toLocaleTimeString() : 'Loading...'}
          </div>
        </CardContent>
      </Card>
    </FadeIn>
  );
}