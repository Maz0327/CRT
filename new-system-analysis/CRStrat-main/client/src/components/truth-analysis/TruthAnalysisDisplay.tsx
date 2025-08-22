import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Activity, 
  Brain, 
  Eye, 
  Heart, 
  TrendingUp,
  AlertCircle,
  Lightbulb,
  Users
} from "lucide-react";

interface TruthAnalysis {
  fact: {
    claims: string[];
    metrics: any;
    timestamp: string;
  };
  observation: {
    patterns: string[];
    behaviors: string[];
    context: string;
  };
  insight: {
    implications: string[];
    opportunities: string[];
    risks: string[];
  };
  humanTruth: {
    core: string;
    emotional: string;
    cultural: string;
    psychological: string;
  };
}

interface TruthAnalysisDisplayProps {
  analysis: TruthAnalysis | null;
  culturalRelevance?: number;
  strategicValue?: number;
  suggestedBriefSection?: string;
}

export default function TruthAnalysisDisplay({ 
  analysis, 
  culturalRelevance = 0, 
  strategicValue = 0,
  suggestedBriefSection 
}: TruthAnalysisDisplayProps) {
  if (!analysis) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Brain className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No analysis available yet</p>
        </CardContent>
      </Card>
    );
  }

  const getSectionIcon = (section: string) => {
    switch (section) {
      case 'fact':
        return <Eye className="h-5 w-5" />;
      case 'observation':
        return <Activity className="h-5 w-5" />;
      case 'insight':
        return <Lightbulb className="h-5 w-5" />;
      case 'humanTruth':
        return <Heart className="h-5 w-5" />;
      default:
        return <Brain className="h-5 w-5" />;
    }
  };

  const getSectionColor = (section: string) => {
    switch (section) {
      case 'fact':
        return "text-blue-600 dark:text-blue-400";
      case 'observation':
        return "text-green-600 dark:text-green-400";
      case 'insight':
        return "text-yellow-600 dark:text-yellow-400";
      case 'humanTruth':
        return "text-red-600 dark:text-red-400";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };

  const formatBriefSection = (section?: string) => {
    if (!section) return null;
    return section.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div className="space-y-4">
      {/* Strategic Scores */}
      <div className="flex gap-4">
        <Card className="flex-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Cultural Relevance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-2xl font-bold">{culturalRelevance.toFixed(1)}</span>
              <span className="text-sm text-muted-foreground">/ 10</span>
            </div>
          </CardContent>
        </Card>
        <Card className="flex-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Strategic Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-2xl font-bold">{strategicValue.toFixed(1)}</span>
              <span className="text-sm text-muted-foreground">/ 10</span>
            </div>
          </CardContent>
        </Card>
        {suggestedBriefSection && (
          <Card className="flex-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Brief Section</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant="outline">
                {formatBriefSection(suggestedBriefSection)}
              </Badge>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Truth Analysis Layers */}
      <Card>
        <CardHeader>
          <CardTitle>Truth Analysis Framework</CardTitle>
          <CardDescription>
            Strategic intelligence extracted through four-layer analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Fact Layer */}
          <div>
            <div className={`flex items-center gap-2 mb-3 ${getSectionColor('fact')}`}>
              {getSectionIcon('fact')}
              <h3 className="font-semibold">FACT</h3>
              <Badge variant="secondary" className="ml-auto">Layer 1</Badge>
            </div>
            <div className="space-y-2 ml-7">
              {analysis.fact.claims.map((claim, i) => (
                <p key={i} className="text-sm">{claim}</p>
              ))}
              {analysis.fact.timestamp && (
                <p className="text-xs text-muted-foreground">
                  Captured: {new Date(analysis.fact.timestamp).toLocaleString()}
                </p>
              )}
            </div>
          </div>

          <Separator />

          {/* Observation Layer */}
          <div>
            <div className={`flex items-center gap-2 mb-3 ${getSectionColor('observation')}`}>
              {getSectionIcon('observation')}
              <h3 className="font-semibold">OBSERVATION</h3>
              <Badge variant="secondary" className="ml-auto">Layer 2</Badge>
            </div>
            <div className="space-y-2 ml-7">
              {analysis.observation.patterns.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-1">Patterns:</p>
                  {analysis.observation.patterns.map((pattern, i) => (
                    <p key={i} className="text-sm ml-2">• {pattern}</p>
                  ))}
                </div>
              )}
              {analysis.observation.behaviors.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm font-medium mb-1">Behaviors:</p>
                  {analysis.observation.behaviors.map((behavior, i) => (
                    <p key={i} className="text-sm ml-2">• {behavior}</p>
                  ))}
                </div>
              )}
              {analysis.observation.context && (
                <p className="text-sm mt-2">
                  <span className="font-medium">Context:</span> {analysis.observation.context}
                </p>
              )}
            </div>
          </div>

          <Separator />

          {/* Insight Layer */}
          <div>
            <div className={`flex items-center gap-2 mb-3 ${getSectionColor('insight')}`}>
              {getSectionIcon('insight')}
              <h3 className="font-semibold">INSIGHT</h3>
              <Badge variant="secondary" className="ml-auto">Layer 3</Badge>
            </div>
            <div className="space-y-2 ml-7">
              {analysis.insight.implications.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-1">Strategic Implications:</p>
                  {analysis.insight.implications.map((implication, i) => (
                    <p key={i} className="text-sm ml-2">• {implication}</p>
                  ))}
                </div>
              )}
              {analysis.insight.opportunities.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm font-medium mb-1">Opportunities:</p>
                  {analysis.insight.opportunities.map((opportunity, i) => (
                    <p key={i} className="text-sm ml-2 text-green-600 dark:text-green-400">
                      <TrendingUp className="inline h-3 w-3 mr-1" />
                      {opportunity}
                    </p>
                  ))}
                </div>
              )}
              {analysis.insight.risks.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm font-medium mb-1">Risks:</p>
                  {analysis.insight.risks.map((risk, i) => (
                    <p key={i} className="text-sm ml-2 text-red-600 dark:text-red-400">
                      <AlertCircle className="inline h-3 w-3 mr-1" />
                      {risk}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Human Truth Layer */}
          <div>
            <div className={`flex items-center gap-2 mb-3 ${getSectionColor('humanTruth')}`}>
              {getSectionIcon('humanTruth')}
              <h3 className="font-semibold">HUMAN TRUTH</h3>
              <Badge variant="secondary" className="ml-auto">Layer 4</Badge>
            </div>
            <div className="space-y-3 ml-7">
              {analysis.humanTruth.core && (
                <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20">
                  <CardContent className="pt-4">
                    <p className="text-sm font-medium mb-1">Core Truth:</p>
                    <p className="text-sm">{analysis.humanTruth.core}</p>
                  </CardContent>
                </Card>
              )}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {analysis.humanTruth.emotional && (
                  <div>
                    <p className="text-sm font-medium mb-1">Emotional Driver:</p>
                    <p className="text-sm text-muted-foreground">{analysis.humanTruth.emotional}</p>
                  </div>
                )}
                {analysis.humanTruth.cultural && (
                  <div>
                    <p className="text-sm font-medium mb-1">Cultural Context:</p>
                    <p className="text-sm text-muted-foreground">{analysis.humanTruth.cultural}</p>
                  </div>
                )}
                {analysis.humanTruth.psychological && (
                  <div>
                    <p className="text-sm font-medium mb-1">Psychological Need:</p>
                    <p className="text-sm text-muted-foreground">{analysis.humanTruth.psychological}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}