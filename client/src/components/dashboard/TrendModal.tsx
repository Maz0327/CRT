import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Copy, Bookmark, Share2, ExternalLink, Wand2, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type { ContentRadarItem } from "@/types";

interface TrendModalProps {
  trend: ContentRadarItem | null;
  isOpen: boolean;
  onClose: () => void;
}

const platformIcons: Record<string, string> = {
  reddit: "fab fa-reddit text-orange-500",
  youtube: "fab fa-youtube text-red-500",
  news: "fas fa-newspaper text-gray-500",
  twitter: "fab fa-x-twitter text-gray-900",
};

const categoryColors: Record<string, string> = {
  'pop-culture': "bg-blue-100 text-blue-800",
  'technology': "bg-green-100 text-green-800", 
  'business': "bg-purple-100 text-purple-800",
  'sports': "bg-yellow-100 text-yellow-800",
  'politics': "bg-red-100 text-red-800",
  'general': "bg-gray-100 text-gray-800",
};

export default function TrendModal({ trend, isOpen, onClose }: TrendModalProps) {
  const [additionalHooks, setAdditionalHooks] = useState<string[]>([]);
  const { toast } = useToast();

  const generateHooksMutation = useMutation({
    mutationFn: (id: string) => api.post<string[]>(`/api/captures/${id}/hooks`),
    onSuccess: (data) => {
      setAdditionalHooks(data);
      toast({
        title: "New hooks generated",
        description: `Generated ${data.length} additional hooks`,
      });
    },
    onError: () => {
      toast({
        title: "Generation failed",
        description: "Unable to generate additional hooks",
        variant: "destructive",
      });
    },
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied to clipboard",
        description: "Hook copied successfully",
      });
    });
  };

  if (!trend) return null;

  const viralScore = parseFloat(trend.viralScore || '0');
  const timeAgo = trend.createdAt ? getTimeAgo(new Date(trend.createdAt)) : 'Unknown';
  const allHooks = [
    ...(trend.hook1 ? [{ text: trend.hook1, label: "Hook 1", color: "blue" }] : []),
    ...(trend.hook2 ? [{ text: trend.hook2, label: "Hook 2", color: "green" }] : []),
    ...additionalHooks.map((hook, i) => ({ 
      text: hook, 
      label: `Hook ${3 + i}`, 
      color: "purple" 
    })),
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Badge className={categoryColors[trend.category] || categoryColors.general}>
                  {trend.category.replace('-', ' ')}
                </Badge>
                <div className="flex items-center space-x-1">
                  <i className={platformIcons[trend.platform] || "fas fa-globe text-gray-500"}></i>
                  <span className="text-xs text-gray-500 capitalize">{trend.platform}</span>
                </div>
                <span className="text-xs text-gray-500">{timeAgo}</span>
              </div>
              <DialogTitle className="text-2xl font-bold text-gray-900 pr-8">
                {trend.title}
              </DialogTitle>
            </div>
          </div>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Summary</h3>
              <p className="text-gray-700 leading-relaxed">
                {trend.summary || trend.content || 'No summary available for this content.'}
              </p>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900">Generated Content Hooks</h3>
                <Button
                  onClick={() => generateHooksMutation.mutate(trend.id)}
                  disabled={generateHooksMutation.isPending}
                  variant="outline"
                  size="sm"
                >
                  {generateHooksMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Wand2 className="h-4 w-4 mr-2" />
                  )}
                  Generate More Hooks
                </Button>
              </div>
              
              <div className="space-y-4">
                {allHooks.length > 0 ? (
                  allHooks.map((hook, index) => {
                    const colorClasses = {
                      blue: "bg-blue-50 border-blue-200 text-blue-800",
                      green: "bg-green-50 border-green-200 text-green-800", 
                      purple: "bg-purple-50 border-purple-200 text-purple-800",
                    };
                    
                    return (
                      <div 
                        key={index}
                        className={`border rounded-lg p-4 ${colorClasses[hook.color as keyof typeof colorClasses]}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{hook.label}</h4>
                          <Button
                            onClick={() => copyToClipboard(hook.text)}
                            variant="ghost"
                            size="sm"
                          >
                            <Copy className="h-4 w-4 mr-1" />
                            Copy
                          </Button>
                        </div>
                        <p>{hook.text}</p>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    No hooks available. Click "Generate More Hooks" to create some.
                  </p>
                )}
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Source Content</h3>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-2">Original URL:</p>
                <a
                  href={trend.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline text-sm font-mono break-all flex items-center"
                >
                  {trend.url}
                  <ExternalLink className="h-3 w-3 ml-1 flex-shrink-0" />
                </a>
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Trend Metrics</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Viral Score</span>
                  <div className="flex items-center space-x-2">
                    <Progress value={viralScore * 10} className="w-20" />
                    <span className="text-sm font-medium">{viralScore.toFixed(1)}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Engagement</span>
                  <span className="text-sm font-medium">
                    {trend.engagement ? formatNumber(trend.engagement) : '0'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Growth Rate</span>
                  <span className="text-sm font-medium text-green-600">
                    +{trend.growthRate || '0'}%
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Peak Time</span>
                  <span className="text-sm font-medium">
                    {trend.createdAt ? new Date(trend.createdAt).toLocaleTimeString() : 'Unknown'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Related Trends</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 cursor-pointer hover:bg-gray-100 p-2 rounded">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Similar topics</span>
                </div>
                <div className="flex items-center space-x-3 cursor-pointer hover:bg-gray-100 p-2 rounded">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-sm text-gray-700">Trending keywords</span>
                </div>
                <div className="flex items-center space-x-3 cursor-pointer hover:bg-gray-100 p-2 rounded">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Platform activity</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <Button className="w-full">
                <Bookmark className="h-4 w-4 mr-2" />
                Save to Favorites
              </Button>
              <Button variant="outline" className="w-full">
                <Share2 className="h-4 w-4 mr-2" />
                Share Trend
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'Just now';
}

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
  return num.toString();
}
