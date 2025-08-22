import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { FadeIn } from '@/components/ui/fade-in';
import { Loader2, Eye, Brain, Sparkles, TrendingUp, Target, Zap } from 'lucide-react';

interface EnhancedAnalysisPanelProps {
  captureId: string;
  captureType: string;
  hasImageData?: boolean;
  existingAnalysis?: any;
  onAnalysisComplete?: (analysis: any) => void;
}

export function EnhancedAnalysisPanel({ 
  captureId, 
  captureType, 
  hasImageData, 
  existingAnalysis,
  onAnalysisComplete 
}: EnhancedAnalysisPanelProps) {
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(existingAnalysis?.enhancedAnalysis || null);
  const { toast } = useToast();

  const handleEnhancedAnalysis = async () => {
    setAnalyzing(true);
    try {
      // Mock enhanced analysis - in real implementation this would call the API
      const mockAnalysis = {
        strategicIntelligence: {
          viralPotential: Math.random() * 10,
          culturalRelevance: Math.random() * 10,
          brandAlignment: Math.random() * 10,
          strategicInsights: [
            "Content demonstrates high engagement patterns typical of viral content",
            "Cross-generational appeal detected across multiple demographic segments",
            "Strategic opportunity for brand positioning in emerging cultural moment"
          ]
        },
        truthFramework: {
          fact: "Content shows measurable engagement metrics and verifiable data points",
          observation: "Audience behavior patterns indicate strong emotional resonance",
          insight: "Cultural timing aligns with broader societal trends and movements",
          humanTruth: "Represents deeper desire for authentic connection and meaningful content"
        },
        nlp: {
          sentiment: {
            score: (Math.random() - 0.5) * 2, // -1 to 1
            magnitude: Math.random()
          },
          entities: [
            { name: "Technology", type: "CATEGORY", salience: 0.8 },
            { name: "Innovation", type: "CONCEPT", salience: 0.6 },
            { name: "Future", type: "CONCEPT", salience: 0.4 }
          ]
        }
      };

      setAnalysis(mockAnalysis);
      onAnalysisComplete?.(mockAnalysis);
      
      toast({
        title: "Enhanced Analysis Complete",
        description: "Strategic Intelligence analysis has been generated",
      });
    } catch (error: any) {
      console.error('Error performing enhanced analysis:', error);
      toast({
        title: "Analysis Error",
        description: error.message || "Failed to perform enhanced analysis",
        variant: "destructive",
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const getSentimentColor = (score: number) => {
    if (score > 0.6) return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300';
    if (score > 0.2) return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300';
    if (score > -0.2) return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300';
    if (score > -0.6) return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300';
    return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300';
  };

  const getSentimentLabel = (score: number) => {
    if (score > 0.6) return 'Very Positive';
    if (score > 0.2) return 'Positive';
    if (score > -0.2) return 'Neutral';
    if (score > -0.6) return 'Negative';
    return 'Very Negative';
  };

  return (
    <FadeIn>
      <Card className="w-full hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            Enhanced Strategic Analysis
          </CardTitle>
          <CardDescription>
            Advanced AI analysis using Strategic Intelligence framework with Truth Analysis layers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!analysis ? (
            <div className="text-center">
              <div className="mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Available Analysis:
                </p>
                <div className="flex justify-center gap-2 flex-wrap">
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Brain className="h-3 w-3" />
                    Truth Framework
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Target className="h-3 w-3" />
                    Strategic Intelligence
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Zap className="h-3 w-3" />
                    Cultural Analysis
                  </Badge>
                  {hasImageData && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      Visual Analysis
                    </Badge>
                  )}
                </div>
              </div>
              
              <Button 
                onClick={handleEnhancedAnalysis}
                disabled={analyzing}
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing with Strategic Intelligence...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Run Enhanced Analysis
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Strategic Intelligence Analysis */}
              {analysis.strategicIntelligence && (
                <div className="space-y-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <Target className="h-4 w-4 text-blue-500" />
                    Strategic Intelligence
                  </h4>
                  
                  {/* Intelligence Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="text-sm text-blue-600 dark:text-blue-400 mb-1">Viral Potential</div>
                      <div className="text-lg font-semibold text-blue-800 dark:text-blue-300">
                        {analysis.strategicIntelligence.viralPotential.toFixed(1)}/10
                      </div>
                      <Progress value={analysis.strategicIntelligence.viralPotential * 10} className="mt-1 h-1" />
                    </div>
                    <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <div className="text-sm text-purple-600 dark:text-purple-400 mb-1">Cultural Relevance</div>
                      <div className="text-lg font-semibold text-purple-800 dark:text-purple-300">
                        {analysis.strategicIntelligence.culturalRelevance.toFixed(1)}/10
                      </div>
                      <Progress value={analysis.strategicIntelligence.culturalRelevance * 10} className="mt-1 h-1" />
                    </div>
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="text-sm text-green-600 dark:text-green-400 mb-1">Brand Alignment</div>
                      <div className="text-lg font-semibold text-green-800 dark:text-green-300">
                        {analysis.strategicIntelligence.brandAlignment.toFixed(1)}/10
                      </div>
                      <Progress value={analysis.strategicIntelligence.brandAlignment * 10} className="mt-1 h-1" />
                    </div>
                  </div>

                  {/* Strategic Insights */}
                  {analysis.strategicIntelligence.strategicInsights?.length > 0 && (
                    <div>
                      <h5 className="text-sm font-medium mb-2">Strategic Insights</h5>
                      <ul className="text-sm space-y-1">
                        {analysis.strategicIntelligence.strategicInsights.map((insight: string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <TrendingUp className="h-3 w-3 mt-0.5 text-blue-500 flex-shrink-0" />
                            {insight}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Truth Framework Analysis */}
              {analysis.truthFramework && (
                <div className="space-y-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <Brain className="h-4 w-4 text-purple-500" />
                    Truth Framework Analysis
                  </h4>
                  
                  <div className="space-y-3">
                    {[
                      { key: 'fact', label: 'Fact', color: 'blue', icon: Eye },
                      { key: 'observation', label: 'Observation', color: 'green', icon: Target },
                      { key: 'insight', label: 'Insight', color: 'yellow', icon: TrendingUp },
                      { key: 'humanTruth', label: 'Human Truth', color: 'purple', icon: Brain }
                    ].map(layer => {
                      const Icon = layer.icon;
                      return (
                        <div key={layer.key} className={`p-3 rounded-lg bg-${layer.color}-50 dark:bg-${layer.color}-900/10 border border-${layer.color}-200 dark:border-${layer.color}-800`}>
                          <div className="flex items-center space-x-2 mb-2">
                            <Icon className={`h-4 w-4 text-${layer.color}-600`} />
                            <span className="font-medium text-sm">{layer.label}</span>
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {analysis.truthFramework[layer.key] || "Analysis pending..."}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* NLP Analysis */}
              {analysis.nlp && (
                <div className="space-y-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <Brain className="h-4 w-4 text-purple-500" />
                    Language Intelligence
                  </h4>

                  {/* Sentiment Analysis */}
                  {analysis.nlp.sentiment && (
                    <div>
                      <h5 className="text-sm font-medium mb-2">Sentiment Analysis</h5>
                      <div className="flex items-center gap-4">
                        <Badge 
                          className={getSentimentColor(analysis.nlp.sentiment.score)}
                          variant="outline"
                        >
                          {getSentimentLabel(analysis.nlp.sentiment.score)}
                        </Badge>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Score: {analysis.nlp.sentiment.score.toFixed(2)} | 
                          Magnitude: {analysis.nlp.sentiment.magnitude.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Key Entities */}
                  {analysis.nlp.entities?.length > 0 && (
                    <div>
                      <h5 className="text-sm font-medium mb-2">Key Entities</h5>
                      <div className="space-y-2">
                        {analysis.nlp.entities.slice(0, 5).map((entity: any, index: number) => (
                          <div key={index} className="flex items-center justify-between text-sm p-2 bg-gray-50 dark:bg-gray-800 rounded">
                            <span className="font-medium">{entity.name}</span>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {entity.type}
                              </Badge>
                              <span className="text-gray-500">
                                {Math.round(entity.salience * 100)}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Re-analyze Button */}
              <div className="pt-4 border-t">
                <Button 
                  onClick={handleEnhancedAnalysis}
                  disabled={analyzing}
                  variant="outline"
                  size="sm"
                >
                  {analyzing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Re-analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Re-analyze
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </FadeIn>
  );
}