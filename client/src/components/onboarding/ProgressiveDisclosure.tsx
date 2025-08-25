import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../components/ui/dialog";
import { useAuth } from "../hooks/use-auth";
import {
  CheckCircle,
  Lock,
  Star,
  Trophy,
  Zap,
  Target,
  Chrome,
  FileText,
  Brain,
  Users,
  Sparkles
} from "lucide-react";

interface Feature {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  category: "core" | "advanced" | "premium";
  unlockCondition: {
    type: "projects" | "captures" | "briefs" | "time" | "manual";
    threshold: number;
    description: string;
  };
  badge?: {
    text: string;
    variant: "default" | "secondary" | "destructive" | "outline";
  };
}

interface UserProgress {
  projectsCreated: number;
  capturesMade: number;
  briefsGenerated: number;
  daysActive: number;
  unlockedFeatures: string[];
  newUnlocks: string[]; // Features unlocked since last visit
}

interface ProgressiveDisclosureContextType {
  userProgress: UserProgress;
  features: Feature[];
  isFeatureUnlocked: (featureId: string) => boolean;
  unlockFeature: (featureId: string) => void;
  markNewUnlocksSeen: () => void;
  hasNewUnlocks: boolean;
}

const ProgressiveDisclosureContext = createContext<ProgressiveDisclosureContextType | null>(null);

export function useProgressiveDisclosure() {
  const context = useContext(ProgressiveDisclosureContext);
  if (!context) {
    throw new Error("useProgressiveDisclosure must be used within a ProgressiveDisclosureProvider");
  }
  return context;
}

const platformFeatures: Feature[] = [
  // Core Features (unlocked from start)
  {
    id: "projects",
    name: "Project Management",
    description: "Create and organize strategic projects",
    icon: Target,
    category: "core",
    unlockCondition: {
      type: "manual",
      threshold: 0,
      description: "Available from start"
    }
  },
  {
    id: "chrome-extension",
    name: "Chrome Extension",
    description: "Capture content while browsing",
    icon: Chrome,
    category: "core",
    unlockCondition: {
      type: "projects",
      threshold: 1,
      description: "Create your first project"
    },
    badge: {
      text: "Essential",
      variant: "default"
    }
  },
  
  // Advanced Features (unlock through usage)
  {
    id: "truth-analysis",
    name: "Truth Analysis Framework",
    description: "Four-layer AI analysis for strategic depth",
    icon: Brain,
    category: "advanced",
    unlockCondition: {
      type: "captures",
      threshold: 3,
      description: "Capture 3 pieces of content"
    },
    badge: {
      text: "AI Powered",
      variant: "secondary"
    }
  },
  {
    id: "brief-builder",
    name: "Visual Brief Builder",
    description: "Drag-and-drop interface for professional briefs",
    icon: FileText,
    category: "advanced",
    unlockCondition: {
      type: "captures",
      threshold: 5,
      description: "Capture 5 pieces of content"
    }
  },
  {
    id: "batch-analysis",
    name: "Batch Content Analysis",
    description: "Analyze multiple captures simultaneously",
    icon: Zap,
    category: "advanced",
    unlockCondition: {
      type: "captures",
      threshold: 10,
      description: "Capture 10 pieces of content"
    },
    badge: {
      text: "Efficiency",
      variant: "outline"
    }
  },
  {
    id: "export-templates",
    name: "Export Templates",
    description: "Professional PDF and PowerPoint exports",
    icon: FileText,
    category: "advanced",
    unlockCondition: {
      type: "briefs",
      threshold: 1,
      description: "Generate your first brief"
    }
  },
  
  // Premium Features (unlock through sustained usage)
  {
    id: "collaboration",
    name: "Team Collaboration",
    description: "Share projects and collaborate with team members",
    icon: Users,
    category: "premium",
    unlockCondition: {
      type: "time",
      threshold: 7,
      description: "Active for 7 days"
    },
    badge: {
      text: "Coming Soon",
      variant: "outline"
    }
  },
  {
    id: "ai-insights",
    name: "Predictive Insights",
    description: "AI predictions for content performance",
    icon: Sparkles,
    category: "premium",
    unlockCondition: {
      type: "briefs",
      threshold: 3,
      description: "Generate 3 strategic briefs"
    },
    badge: {
      text: "Premium",
      variant: "destructive"
    }
  }
];

export function ProgressiveDisclosureProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [userProgress, setUserProgress] = useState<UserProgress>({
    projectsCreated: 0,
    capturesMade: 0,
    briefsGenerated: 0,
    daysActive: 0,
    unlockedFeatures: ["projects"], // Core features unlocked by default
    newUnlocks: []
  });

  // Load user progress from localStorage (would be API in production)
  useEffect(() => {
    if (user) {
      const savedProgress = localStorage.getItem(`user-progress-${user.id}`);
      if (savedProgress) {
        const progress = JSON.parse(savedProgress);
        setUserProgress(progress);
      } else {
        // Initialize new user with core features
        const initialProgress = {
          projectsCreated: 0,
          capturesMade: 0,
          briefsGenerated: 0,
          daysActive: 1,
          unlockedFeatures: ["projects"],
          newUnlocks: []
        };
        setUserProgress(initialProgress);
        localStorage.setItem(`user-progress-${user.id}`, JSON.stringify(initialProgress));
      }
    }
  }, [user]);

  // Save progress to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem(`user-progress-${user.id}`, JSON.stringify(userProgress));
    }
  }, [userProgress, user]);

  // Check for newly unlocked features
  useEffect(() => {
    const newlyUnlocked: string[] = [];
    
    platformFeatures.forEach(feature => {
      const isCurrentlyUnlocked = checkFeatureUnlock(feature, userProgress);
      const wasAlreadyUnlocked = userProgress.unlockedFeatures.includes(feature.id);
      
      if (isCurrentlyUnlocked && !wasAlreadyUnlocked) {
        newlyUnlocked.push(feature.id);
      }
    });

    if (newlyUnlocked.length > 0) {
      setUserProgress(prev => ({
        ...prev,
        unlockedFeatures: [...prev.unlockedFeatures, ...newlyUnlocked],
        newUnlocks: [...prev.newUnlocks, ...newlyUnlocked]
      }));
    }
  }, [userProgress.projectsCreated, userProgress.capturesMade, userProgress.briefsGenerated, userProgress.daysActive]);

  const checkFeatureUnlock = (feature: Feature, progress: UserProgress): boolean => {
    switch (feature.unlockCondition.type) {
      case "projects":
        return progress.projectsCreated >= feature.unlockCondition.threshold;
      case "captures":
        return progress.capturesMade >= feature.unlockCondition.threshold;
      case "briefs":
        return progress.briefsGenerated >= feature.unlockCondition.threshold;
      case "time":
        return progress.daysActive >= feature.unlockCondition.threshold;
      case "manual":
        return true;
      default:
        return false;
    }
  };

  const isFeatureUnlocked = (featureId: string): boolean => {
    return userProgress.unlockedFeatures.includes(featureId);
  };

  const unlockFeature = (featureId: string) => {
    if (!userProgress.unlockedFeatures.includes(featureId)) {
      setUserProgress(prev => ({
        ...prev,
        unlockedFeatures: [...prev.unlockedFeatures, featureId],
        newUnlocks: [...prev.newUnlocks, featureId]
      }));
    }
  };

  const markNewUnlocksSeen = () => {
    setUserProgress(prev => ({
      ...prev,
      newUnlocks: []
    }));
  };

  const contextValue: ProgressiveDisclosureContextType = {
    userProgress,
    features: platformFeatures,
    isFeatureUnlocked,
    unlockFeature,
    markNewUnlocksSeen,
    hasNewUnlocks: userProgress.newUnlocks.length > 0
  };

  return (
    <ProgressiveDisclosureContext.Provider value={contextValue}>
      {children}
      <FeatureUnlockNotifications />
    </ProgressiveDisclosureContext.Provider>
  );
}

function FeatureUnlockNotifications() {
  const { userProgress, features, markNewUnlocksSeen, hasNewUnlocks } = useProgressiveDisclosure();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (hasNewUnlocks) {
      setShowModal(true);
    }
  }, [hasNewUnlocks]);

  const handleClose = () => {
    setShowModal(false);
    markNewUnlocksSeen();
  };

  const newlyUnlockedFeatures = features.filter(feature => 
    userProgress.newUnlocks.includes(feature.id)
  );

  return (
    <Dialog open={showModal} onOpenChange={setShowModal}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center space-x-2">
            <Trophy className="h-6 w-6 text-yellow-500" />
            <DialogTitle>New Features Unlocked!</DialogTitle>
          </div>
          <DialogDescription>
            Great progress! You've unlocked new capabilities.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3">
          {newlyUnlockedFeatures.map((feature) => (
            <Card key={feature.id} className="border-green-200 bg-green-50">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <feature.icon className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-medium text-green-900">{feature.name}</h3>
                      {feature.badge && (
                        <Badge variant={feature.badge.variant} className="text-xs">
                          {feature.badge.text}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-green-700">{feature.description}</p>
                  </div>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <DialogFooter>
          <Button onClick={handleClose}>
            <Star className="h-4 w-4 mr-2" />
            Awesome!
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Component to show feature availability in UI
export function FeatureBadge({ featureId, children }: { featureId: string; children: ReactNode }) {
  const { isFeatureUnlocked } = useProgressiveDisclosure();
  
  if (!isFeatureUnlocked(featureId)) {
    return (
      <div className="relative opacity-60">
        {children}
        <div className="absolute inset-0 bg-gray-100/80 backdrop-blur-sm rounded-lg flex items-center justify-center">
          <div className="text-center">
            <Lock className="h-5 w-5 text-gray-500 mx-auto mb-1" />
            <span className="text-xs text-gray-600 font-medium">Locked</span>
          </div>
        </div>
      </div>
    );
  }
  
  return <>{children}</>;
}

// Progress tracking functions (to be called when user performs actions)
export function useProgressTracking() {
  const { userProgress, unlockFeature } = useProgressiveDisclosure();
  const { user } = useAuth();

  const trackProjectCreated = () => {
    if (user) {
      const newProgress = {
        ...userProgress,
        projectsCreated: userProgress.projectsCreated + 1
      };
      localStorage.setItem(`user-progress-${user.id}`, JSON.stringify(newProgress));
    }
  };

  const trackCapturesMade = (count: number = 1) => {
    if (user) {
      const newProgress = {
        ...userProgress,
        capturesMade: userProgress.capturesMade + count
      };
      localStorage.setItem(`user-progress-${user.id}`, JSON.stringify(newProgress));
    }
  };

  const trackBriefGenerated = () => {
    if (user) {
      const newProgress = {
        ...userProgress,
        briefsGenerated: userProgress.briefsGenerated + 1
      };
      localStorage.setItem(`user-progress-${user.id}`, JSON.stringify(newProgress));
    }
  };

  return {
    trackProjectCreated,
    trackCapturesMade,
    trackBriefGenerated
  };
}