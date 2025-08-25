import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  Flame,
  MessageCircle,
  Eye,
  ExternalLink,
  Brain,
  TrendingUp,
} from "lucide-react";

interface StrategicCardProps {
  capture: {
    id: string;
    title: string;
    content: string;
    url: string;
    platform: string;
    createdAt: string;
    dsdTags?: string[];
    viralScore?: number;
    truthAnalysis?: any;
    culturalResonance?: {
      crossGenerational?: boolean;
      memePotential?: number;
      counterNarrative?: string;
      tribalSignificance?: string;
    };
  };
  onClick: () => void;
  variant?: "capture" | "moment" | "hypothesis";
}

const platformIcons: Record<string, string> = {
  reddit: "fab fa-reddit text-orange-500",
  youtube: "fab fa-youtube text-red-500",
  twitter: "fab fa-x-twitter text-gray-900",
  x: "fab fa-x-twitter text-gray-900",
  instagram: "fab fa-instagram text-pink-500",
  linkedin: "fab fa-linkedin text-blue-600",
  tiktok: "fab fa-tiktok text-black",
  facebook: "fab fa-facebook text-blue-600",
  web: "fas fa-globe text-gray-500",
};

const dsdTagColors: Record<string, string> = {
  "life-lens": "bg-blue-100 text-blue-800",
  "raw-behavior": "bg-green-100 text-green-800",
  "channel-vibes": "bg-purple-100 text-purple-800",
  "cultural-moment": "bg-yellow-100 text-yellow-800",
  "strategic-signal": "bg-red-100 text-red-800",
  "competitive-intel": "bg-indigo-100 text-indigo-800",
};

export default function StrategicCard({
  capture,
  onClick,
  variant = "capture",
}: StrategicCardProps) {
  const viralScore = capture.viralScore || 0;
  const culturalResonanceScore = capture.culturalResonance?.memePotential ?? 0;

  const timeAgo = getTimeAgo(new Date(capture.createdAt));

  return (
    <Card
      className="hover-lift cursor-pointer transition-all duration-200 group hover:shadow-lg hover:border-blue-200"
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-2 flex-wrap">
            {/* DSD Tags */}
            {capture.dsdTags && capture.dsdTags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {capture.dsdTags.slice(0, 2).map((tag, index) =>
                  tag ? (
                    <Badge
                      key={index}
                      className={
                        dsdTagColors[tag?.toLowerCase?.() || ""] ||
                        "bg-gray-100 text-gray-800"
                      }
                      variant="secondary"
                    >
                      {tag.replace("-", " ")}
                    </Badge>
                  ) : null,
                )}
                {capture.dsdTags.length > 2 && (
                  <Badge variant="outline" className="text-xs">
                    +{capture.dsdTags.length - 2}
                  </Badge>
                )}
              </div>
            )}

            {/* Platform Icon */}
            <div className="flex items-center space-x-1">
              <i
                className={
                  platformIcons[capture.platform?.toLowerCase()] ||
                  platformIcons.web
                }
              ></i>
              <span className="text-xs text-gray-500 capitalize">
                {capture.platform || "unknown"}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-gray-500">{timeAgo}</span>
          </div>
        </div>

        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 min-h-[3.5rem] group-hover:text-blue-600 transition-colors">
          {capture.title}
        </h3>

        <p className="text-sm text-gray-600 mb-4 line-clamp-3 min-h-[4.5rem]">
          {capture.content.slice(0, 200)}...
        </p>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            {/* Viral Score */}
            <div className="flex items-center space-x-1">
              <Flame className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium text-gray-900">
                {viralScore.toFixed(1)}
              </span>
            </div>

            {/* Cultural Relevance */}
            <div className="flex items-center space-x-1">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              <span className="text-sm text-gray-600">
                {culturalResonanceScore.toFixed(1)}
              </span>
            </div>

            {/* Truth Analysis Indicator */}
            {capture.truthAnalysis && (
              <div className="flex items-center space-x-1">
                <Brain className="h-4 w-4 text-purple-500" />
                <span className="text-sm text-gray-600">Analyzed</span>
              </div>
            )}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              window.open(capture.url, "_blank");
            }}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>

        {/* Truth Analysis Preview */}
        {capture.truthAnalysis && (
          <div className="border-t border-gray-200 pt-4">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-3 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Brain className="h-4 w-4 text-purple-600" />
                <span className="text-xs font-medium text-purple-700">
                  Truth Analysis
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fact:</span>
                    <span className="font-medium text-blue-600">✓</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Observation:</span>
                    <span className="font-medium text-green-600">✓</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Insight:</span>
                    <span className="font-medium text-yellow-600">✓</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Human Truth:</span>
                    <span className="font-medium text-purple-600">✓</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Variant-specific content */}
        {variant === "hypothesis" && (
          <div className="border-t border-gray-200 pt-4 mt-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">
                Prediction Confidence
              </span>
              <div className="flex items-center space-x-2">
                <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-yellow-400 to-green-500"
                    style={{ width: `${Math.min(viralScore * 10, 100)}%` }}
                  ></div>
                </div>
                <span className="text-xs font-medium">
                  {Math.min(viralScore * 10, 100).toFixed(0)}%
                </span>
              </div>
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
  return "Just now";
}
