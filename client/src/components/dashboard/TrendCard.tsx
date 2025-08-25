import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Flame, MessageCircle, Eye, ExternalLink } from "lucide-react";
import type { ContentRadarItem } from "@/types";

interface TrendCardProps {
  trend: ContentRadarItem;
  onClick: () => void;
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

export default function TrendCard({ trend, onClick }: TrendCardProps) {
  const viralScore = parseFloat(trend.viralScore || '0');
  const timeAgo = trend.createdAt ? getTimeAgo(new Date(trend.createdAt)) : 'Unknown';
  
  return (
    <Card className="hover-lift cursor-pointer transition-all duration-200 group" onClick={onClick}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Badge className={categoryColors[trend.category] || categoryColors.general}>
              {trend.category.replace('-', ' ')}
            </Badge>
            <div className="flex items-center space-x-1">
              <i className={platformIcons[trend.platform] || "fas fa-globe text-gray-500"}></i>
              <span className="text-xs text-gray-500 capitalize">{trend.platform}</span>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-xs text-gray-500">{timeAgo}</span>
          </div>
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 min-h-[3.5rem]">
          {trend.title}
        </h3>
        
        <p className="text-sm text-gray-600 mb-4 line-clamp-3 min-h-[4.5rem]">
          {trend.summary || trend.content || 'No summary available'}
        </p>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Flame className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium text-gray-900">{viralScore.toFixed(1)}</span>
            </div>
            <div className="flex items-center space-x-1">
              {trend.platform === 'youtube' ? (
                <Eye className="h-4 w-4 text-gray-400" />
              ) : (
                <MessageCircle className="h-4 w-4 text-gray-400" />
              )}
              <span className="text-sm text-gray-600">
                {trend.engagement ? formatNumber(trend.engagement) : '0'}
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              window.open(trend.url, '_blank');
            }}
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
        
        {(trend.hook1 || trend.hook2) && (
          <div className="border-t border-gray-200 pt-4">
            <div className="space-y-2">
              {trend.hook1 && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Hook 1:</p>
                  <p className="text-sm text-gray-900">{trend.hook1}</p>
                </div>
              )}
              {trend.hook2 && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Hook 2:</p>
                  <p className="text-sm text-gray-900">{trend.hook2}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
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
