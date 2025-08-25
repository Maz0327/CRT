import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import {
  Copy,
  Bookmark,
  Share2,
  ExternalLink,
  Wand2,
  Loader2,
  Brain,
  Target,
} from "lucide-react";
import { useToast } from "../hooks/use-toast";

interface StrategicModalProps {
  capture: any | null;
  isOpen: boolean;
  onClose: () => void;
}

const platformIcons: Record<string, string> = {
  reddit: "fab fa-reddit text-orange-500",
  youtube: "fab fa-youtube text-red-500",
  twitter: "fab fa-x-twitter text-gray-900",
  x: "fab fa-x-twitter text-gray-900",
  instagram: "fab fa-instagram text-pink-500",
  linkedin: "fab fa-linkedin text-blue-600",
  tiktok: "fab fa-tiktok text-black",
  web: "fas fa-globe text-gray-500",
};

const dsdTagColors: Record<string, string> = {
  "life-lens":
    "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300",
  "raw-behavior":
    "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300",
  "channel-vibes":
    "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300",
  "cultural-moment":
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300",
  "strategic-signal":
    "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300",
  "competitive-intel":
    "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300",
};

export default function StrategicModal({
  capture,
  isOpen,
  onClose,
}: StrategicModalProps) {
  const [additionalHooks, setAdditionalHooks] = useState<string[]>([]);
  const { toast } = useToast();

  const generateHooksMutation = useMutation({
    mutationFn: async (id: string) => {
      // Mock hook generation - in real implementation this would call the API
      return {
        hooks: [
          "Strategic insight: This content reveals emerging cultural patterns that could reshape brand positioning",
          "Market opportunity: Early signals suggest untapped audience segments with high engagement potential",
          "Competitive advantage: Content approach diverges from industry standards, creating differentiation opportunities",
        ],
      };
    },
    onSuccess: (data) => {
      setAdditionalHooks(data.hooks);
      toast({
        title: "Strategic hooks generated",
        description: `Generated ${data.hooks.length} strategic insights`,
      });
    },
    onError: () => {
      toast({
        title: "Generation failed",
        description: "Unable to generate strategic hooks",
        variant: "destructive",
      });
    },
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied to clipboard",
        description: "Strategic insight copied successfully",
      });
    });
  };

  if (!capture) return null;

  const viralScore = capture.viralScore || 0;
  // Derive cultural resonance from the new schema: use memePotential if present, otherwise 0.
  const culturalResonanceScore = capture.culturalResonance?.memePotential ?? 0;
  const timeAgo = capture.createdAt
    ? getTimeAgo(new Date(capture.createdAt))
    : "Unknown";

  const allHooks = [
    ...(capture.hook1
      ? [{ text: capture.hook1, label: "Strategic Hook 1", color: "blue" }]
      : []),
    ...(capture.hook2
      ? [{ text: capture.hook2, label: "Strategic Hook 2", color: "green" }]
      : []),
    ...additionalHooks.map((hook, i) => ({
      text: hook,
      label: `AI Insight ${i + 1}`,
      color: "purple",
    })),
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                {/* DSD Tags */}
                {capture.dsdTags && capture.dsdTags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {capture.dsdTags
                      .slice(0, 3)
                      .map((tag: string, index: number) => (
                        <Badge
                          key={index}
                          className={
                            dsdTagColors[tag] || "bg-gray-100 text-gray-800"
                          }
                          variant="secondary"
                        >
                          {tag.replace("-", " ")}
                        </Badge>
                      ))}
                  </div>
                )}

                <div className="flex items-center space-x-1">
                  <i
                    className={
                      platformIcons[capture.platform?.toLowerCase()] ||
                      platformIcons.web
                    }
                  ></i>
                  <span className="text-xs text-gray-500 capitalize">
                    {capture.platform}
                  </span>
                </div>
                <span className="text-xs text-gray-500">{timeAgo}</span>
              </div>
              <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100 pr-8">
                {capture.title}
              </DialogTitle>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="analysis" className="space-y-6">
          <TabsList>
            <TabsTrigger value="analysis">Strategic Analysis</TabsTrigger>
            <TabsTrigger value="truth">Truth Framework</TabsTrigger>
            <TabsTrigger value="hooks">Content Hooks</TabsTrigger>
            <TabsTrigger value="metrics">Intelligence Metrics</TabsTrigger>
          </TabsList>

          <TabsContent value="analysis" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                    Content Summary
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {capture.content?.slice(0, 500) ||
                      "No content summary available."}
                    {capture.content?.length > 500 && "..."}
                  </p>
                </div>

                {/* DSD Section Assignment */}
                {capture.dsdSection && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                      DSD Assignment
                    </h3>
                    <Badge
                      variant="outline"
                      className="text-sm p-2 bg-blue-50 dark:bg-blue-900/20 border-blue-200"
                    >
                      {capture.dsdSection.toUpperCase()} Section
                    </Badge>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    Intelligence Scores
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Viral Score
                      </span>
                      <div className="flex items-center space-x-2">
                        <Progress value={viralScore} className="w-20" />

                        <span className="text-sm font-medium">
                          {viralScore.toFixed(1)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Cultural Resonance
                      </span>
                      <div className="flex items-center space-x-2">
                        <Progress
                          value={culturalResonanceScore * 10}
                          className="w-20"
                        />

                        <span className="text-sm font-medium">
                          {culturalResonanceScore.toFixed(1)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Strategic Value
                      </span>
                      <span className="text-sm font-medium text-green-600">
                        High
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="truth" className="space-y-6">
            {capture.truthAnalysis ? (
              <div className="space-y-4">
                {[
                  { name: "Fact", icon: Target, color: "blue" },
                  { name: "Observation", icon: Target, color: "green" },
                  { name: "Insight", icon: Brain, color: "yellow" },
                  { name: "Human Truth", icon: Brain, color: "purple" },
                ].map((layer) => {
                  const Icon = layer.icon;
                  return (
                    <div
                      key={layer.name}
                      className={`p-4 rounded-lg bg-${layer.color}-50 dark:bg-${layer.color}-900/10`}
                    >
                      <div className="flex items-center space-x-2 mb-2">
                        <Icon className={`h-5 w-5 text-${layer.color}-600`} />
                        <span className="font-semibold">{layer.name}</span>
                      </div>
                      <p className="text-sm">
                        {capture.truthAnalysis?.[
                          layer.name.toLowerCase().replace(" ", "")
                        ] || "Analysis pending..."}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Brain className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">
                  No truth analysis available
                </p>
                <Button variant="outline">
                  <Brain className="h-4 w-4 mr-2" />
                  Run Truth Analysis
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="hooks" className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Strategic Content Hooks
                </h3>
                <Button
                  onClick={() => generateHooksMutation.mutate(capture.id)}
                  disabled={generateHooksMutation.isPending}
                  variant="outline"
                  size="sm"
                >
                  {generateHooksMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Wand2 className="h-4 w-4 mr-2" />
                  )}
                  Generate Strategic Hooks
                </Button>
              </div>

              <div className="space-y-4">
                {allHooks.length > 0 ? (
                  allHooks.map((hook, index) => {
                    const colorClasses = {
                      blue: "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/10 dark:border-blue-800 dark:text-blue-300",
                      green:
                        "bg-green-50 border-green-200 text-green-800 dark:bg-green-900/10 dark:border-green-800 dark:text-green-300",
                      purple:
                        "bg-purple-50 border-purple-200 text-purple-800 dark:bg-purple-900/10 dark:border-purple-800 dark:text-purple-300",
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
                        <p className="text-sm">{hook.text}</p>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                    No strategic hooks available. Click "Generate Strategic
                    Hooks" to create insights.
                  </p>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="metrics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Intelligence Metrics</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Viral Score
                    </span>
                    <span className="font-medium">
                      {viralScore.toFixed(1)}/10
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Cultural Resonance
                    </span>
                    <span className="font-medium">
                      {culturalResonanceScore.toFixed(1)}/10
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Platform
                    </span>
                    <span className="font-medium capitalize">
                      {capture.platform}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Source Information</h3>
                <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Original URL:
                  </p>
                  <a
                    href={capture.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline text-sm font-mono break-all flex items-center"
                  >
                    {capture.url}
                    <ExternalLink className="h-3 w-3 ml-1 flex-shrink-0" />
                  </a>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-3 pt-6 border-t">
          <Button variant="outline">
            <Bookmark className="h-4 w-4 mr-2" />
            Save Analysis
          </Button>
          <Button variant="outline">
            <Share2 className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button onClick={onClose}>Close</Button>
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
  return "Just now";
}
