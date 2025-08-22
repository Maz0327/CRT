import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/use-auth";
import { queryClient } from "@/lib/queryClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Download,
  FileText,
  FolderOpen,
  Sparkles,
  CheckCircle,
  Clock,
  Target,
  Chrome,
  Brain,
  Coffee
} from "lucide-react";

interface SampleProject {
  id: string;
  name: string;
  description: string;
  captureCount: number;
  briefCount: number;
  industry: string;
  status: "available" | "installing" | "installed";
}

interface SampleContentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const sampleProjects: SampleProject[] = [
  {
    id: "jimmy-johns-demo",
    name: "Jimmy John's PAC Drop #8",
    description: "Real-world brief example showcasing complete workflow from content capture to strategic brief generation.",
    captureCount: 12,
    briefCount: 1,
    industry: "Food & Beverage",
    status: "available"
  },
  {
    id: "tiktok-trends-demo",
    name: "TikTok Spring Trends 2025",
    description: "Demonstration of social media trend analysis with Truth Analysis Framework applied to viral content.",
    captureCount: 8,
    briefCount: 1,
    industry: "Social Media",
    status: "available"
  },
  {
    id: "nike-campaign-demo",
    name: "Nike Mother's Day Strategy",
    description: "Strategic intelligence gathering for seasonal campaign development with competitor analysis.",
    captureCount: 15,
    briefCount: 2,
    industry: "Sports & Fashion",
    status: "available"
  }
];

const sampleCaptures = [
  {
    id: "sample-1",
    title: "TikTok Viral Dance Trend",
    platform: "tiktok",
    type: "video",
    truthAnalysis: {
      fact: {
        claims: ["Dance trend has 2.3M views in 48 hours", "Started by @creator with 500K followers"],
        metrics: { views: 2300000, engagement: 0.12 },
        timestamp: "2025-01-29T10:00:00Z"
      },
      observation: {
        patterns: ["Gen Z adoption rate accelerating", "Cross-platform spread to Instagram Reels"],
        behaviors: ["User-generated variations increasing", "Brand attempts at participation"],
        context: "Spring season content uptick"
      },
      insight: {
        implications: ["Opportunity for music-sync partnerships", "Potential for brand integration"],
        opportunities: ["User-generated campaign potential", "Influencer collaboration openings"],
        risks: ["Trend may fade quickly", "Inauthentic brand participation backlash"]
      },
      humanTruth: {
        core: "Desire for collective joy and shared experience",
        emotional: "Nostalgia mixed with optimism for spring",
        cultural: "Digital nativity and creativity expression",
        psychological: "Belonging through participation"
      }
    }
  },
  {
    id: "sample-2",
    title: "Instagram Mother's Day Campaign",
    platform: "instagram",
    type: "post",
    truthAnalysis: {
      fact: {
        claims: ["Nike's Mother's Day post received 250K likes", "Comments show strong emotional resonance"],
        metrics: { likes: 250000, comments: 3200, shares: 890 },
        timestamp: "2025-01-28T14:30:00Z"
      },
      observation: {
        patterns: ["Authentic family storytelling resonates", "Multigenerational appeal evident"],
        behaviors: ["Users sharing personal stories", "Tagged family members increasing"],
        context: "Mother's Day seasonal content preparation"
      },
      insight: {
        implications: ["Authenticity over production value", "Family-centered messaging wins"],
        opportunities: ["User story amplification", "Intergenerational marketing"],
        risks: ["Generic messaging falls flat", "Cultural insensitivity potential"]
      },
      humanTruth: {
        core: "Unconditional love and gratitude expression",
        emotional: "Pride, nostalgia, and appreciation",
        cultural: "Celebrating maternal figures across cultures",
        psychological: "Connection through shared experiences"
      }
    }
  }
];

export function SampleContentProvider({ children }: { children: React.ReactNode }) {
  const [showModal, setShowModal] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const hasSeenSamples = localStorage.getItem(`sample-content-seen-${user.id}`);
      if (!hasSeenSamples) {
        // Show sample content modal after tour completion or initial login
        const timer = setTimeout(() => {
          setShowModal(true);
        }, 2000);
        return () => clearTimeout(timer);
      }
    }
  }, [user]);

  const handleClose = () => {
    setShowModal(false);
    if (user) {
      localStorage.setItem(`sample-content-seen-${user.id}`, "true");
    }
  };

  return (
    <>
      {children}
      <SampleContentModal isOpen={showModal} onClose={handleClose} />
    </>
  );
}

function SampleContentModal({ isOpen, onClose }: SampleContentModalProps) {
  const [installingProjects, setInstallingProjects] = useState<Set<string>>(new Set());
  const [installedProjects, setInstalledProjects] = useState<Set<string>>(new Set());
  const queryClient = useQueryClient();

  const createSampleProjectMutation = useMutation({
    mutationFn: async (projectData: any) => {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(projectData),
      });
      if (!response.ok) {
        throw new Error("Failed to create project");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
    },
  });

  const createSampleCaptureMutation = useMutation({
    mutationFn: async (captureData: any) => {
      const response = await fetch("/api/captures", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(captureData),
      });
      if (!response.ok) {
        throw new Error("Failed to create capture");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/captures"] });
    },
  });

  const installSampleProject = async (project: SampleProject) => {
    setInstallingProjects(prev => new Set(prev).add(project.id));

    try {
      // Create the project
      const projectResponse = await createSampleProjectMutation.mutateAsync({
        name: project.name,
        description: project.description,
        briefTemplate: "jimmy-johns",
        client: project.industry,
        tags: ["sample", "demo", project.industry.toLowerCase().replace(/\s+/g, '-')]
      });

      const projectId = projectResponse.id;

      // Create sample captures for this project
      const capturePromises = sampleCaptures.map(capture => 
        createSampleCaptureMutation.mutateAsync({
          projectId,
          type: capture.type,
          platform: capture.platform,
          title: capture.title,
          content: `Sample ${capture.type} content for ${capture.title}`,
          truthAnalysis: capture.truthAnalysis,
          userNote: "Sample content - generated for demonstration purposes",
          tags: ["sample", "demo"],
          status: "analyzed"
        })
      );

      await Promise.all(capturePromises);

      setInstalledProjects(prev => new Set(prev).add(project.id));
    } catch (error) {
      console.error("Failed to install sample project:", error);
    } finally {
      setInstallingProjects(prev => {
        const next = new Set(prev);
        next.delete(project.id);
        return next;
      });
    }
  };

  const getProjectStatus = (project: SampleProject) => {
    if (installedProjects.has(project.id)) return "installed";
    if (installingProjects.has(project.id)) return "installing";
    return "available";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center space-x-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <DialogTitle>Sample Content & Templates</DialogTitle>
          </div>
          <DialogDescription>
            Explore real-world examples to understand the platform's capabilities. Install sample projects to see the complete workflow in action.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Sample Projects */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <FolderOpen className="h-5 w-5 mr-2" />
              Sample Projects
            </h3>
            <div className="grid gap-4">
              {sampleProjects.map((project) => {
                const status = getProjectStatus(project);
                return (
                  <Card key={project.id} className="relative">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <CardTitle className="text-base">{project.name}</CardTitle>
                            <Badge variant="outline" className="text-xs">
                              {project.industry}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{project.description}</p>
                        </div>
                        <div className="ml-4">
                          {status === "installed" ? (
                            <Button disabled size="sm" className="bg-green-100 text-green-700">
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Installed
                            </Button>
                          ) : status === "installing" ? (
                            <Button disabled size="sm">
                              <Clock className="h-4 w-4 mr-2 animate-spin" />
                              Installing...
                            </Button>
                          ) : (
                            <Button 
                              size="sm" 
                              onClick={() => installSampleProject(project)}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Install
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Target className="h-4 w-4" />
                          <span>{project.captureCount} captures</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <FileText className="h-4 w-4" />
                          <span>{project.briefCount} brief{project.briefCount > 1 ? 's' : ''}</span>
                        </div>
                      </div>
                      {status === "installing" && (
                        <div className="mt-3">
                          <Progress value={50} className="h-2" />
                          <p className="text-xs text-muted-foreground mt-1">Creating sample content...</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Quick Start Guide */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <Coffee className="h-5 w-5 mr-2" />
              What's Included
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Chrome className="h-5 w-5 text-blue-600" />
                    <h4 className="font-medium text-blue-900">Chrome Extension Demo</h4>
                  </div>
                  <p className="text-sm text-blue-700">
                    See how content capture works with real screenshots and metadata
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-purple-200 bg-purple-50">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Brain className="h-5 w-5 text-purple-600" />
                    <h4 className="font-medium text-purple-900">Truth Analysis Examples</h4>
                  </div>
                  <p className="text-sm text-purple-700">
                    Four-layer analysis applied to real viral content and campaigns
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-green-200 bg-green-50">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <FileText className="h-5 w-5 text-green-600" />
                    <h4 className="font-medium text-green-900">Brief Templates</h4>
                  </div>
                  <p className="text-sm text-green-700">
                    Professional briefs in Jimmy John's format ready for export
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-orange-200 bg-orange-50">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Target className="h-5 w-5 text-orange-600" />
                    <h4 className="font-medium text-orange-900">Workflow Examples</h4>
                  </div>
                  <p className="text-sm text-orange-700">
                    Complete capture-to-brief workflows across different industries
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <DialogFooter>
          <p className="text-xs text-muted-foreground mr-auto">
            Sample projects help you understand the platform without affecting your real work
          </p>
          <Button variant="outline" onClick={onClose}>
            Explore Later
          </Button>
          <Button onClick={onClose}>
            <CheckCircle className="h-4 w-4 mr-2" />
            Got it!
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}