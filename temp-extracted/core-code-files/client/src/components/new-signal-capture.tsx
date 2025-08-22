import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ContentInput } from "@/components/content-input";
import { Button } from "@/components/ui/button";
import { Plus, FileText, Link, Target, ArrowRight } from "lucide-react";
import { AnalysisSkeleton } from "@/components/ui/analysis-skeleton";
import { EnhancedAnalysisResults } from "@/components/enhanced-analysis-results";
import { FloatingActionButton } from "@/components/ui/floating-action-button";
import { ProgressBreadcrumb } from "@/components/ui/progress-breadcrumb";

interface NewSignalCaptureProps {
  activeSubTab?: string;
  onNavigateToExplore?: () => void;
  onNavigateToBrief?: () => void;
}

export function NewSignalCapture({ activeSubTab, onNavigateToExplore, onNavigateToBrief }: NewSignalCaptureProps) {
  const [activeTab, setActiveTab] = useState(activeSubTab || "capture");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [originalContent, setOriginalContent] = useState<any>(null);
  
  const handleAnalysisStart = () => {
    setIsAnalyzing(true);
    setAnalysisResult(null);
  };
  
  const handleAnalysisComplete = (result: any, content?: any) => {
    setAnalysisResult(result);
    setOriginalContent(content);
    setIsAnalyzing(false);
    
    // Scroll to results
    setTimeout(() => {
      document.getElementById('analysis-results')?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }, 100);
  };
  
  const breadcrumbSteps = [
    { label: "Capture", completed: !!analysisResult, active: !analysisResult },
    { label: "Analyze", completed: !!analysisResult, active: isAnalyzing },
    { label: "Brief", active: false }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">New Signal Capture</h2>
          <p className="text-gray-600 mt-1">Analyze content and discover strategic insights</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onNavigateToExplore}>
            <Target className="h-4 w-4 mr-2" />
            Explore Trending
          </Button>
          <Button variant="outline" size="sm" onClick={onNavigateToBrief}>
            <FileText className="h-4 w-4 mr-2" />
            Brief Lab
          </Button>
        </div>
      </div>
      
      {/* Progress Breadcrumb */}
      <ProgressBreadcrumb steps={breadcrumbSteps} className="mb-6" />

      {/* Capture Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="capture" className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Content Analysis</span>
          </TabsTrigger>
          <TabsTrigger value="batch" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Batch Processing</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="capture" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Capture & Analyze Content
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div data-tutorial="content-input">
                <ContentInput 
                  onAnalysisStart={handleAnalysisStart} 
                  onAnalysisComplete={handleAnalysisComplete}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="batch" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Batch Processing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h4 className="font-medium text-gray-900 mb-2">Batch Processing</h4>
                <p className="text-gray-600 mb-4">Process multiple URLs or text blocks at once</p>
                <Button disabled>
                  Coming Soon
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Analysis Results */}
      {(isAnalyzing || analysisResult) && (
        <Card id="analysis-results">
          <CardHeader>
            <CardTitle>Analysis Results</CardTitle>
          </CardHeader>
          <CardContent>
            {isAnalyzing ? (
              <AnalysisSkeleton />
            ) : analysisResult ? (
              <EnhancedAnalysisResults 
                analysis={analysisResult} 
                originalContent={originalContent}
              />
            ) : null}
          </CardContent>
        </Card>
      )}

      {/* Floating Action Button */}
      <FloatingActionButton 
        onNewSignal={() => setActiveTab("capture")}
        onQuickAnalysis={() => setActiveTab("capture")}
        onNewBrief={() => onNavigateToBrief?.()}
      />

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onNavigateToExplore}>
          <CardContent className="p-6 text-center">
            <Target className="h-8 w-8 text-blue-500 mx-auto mb-3" />
            <h4 className="font-medium text-gray-900 mb-2">Explore Trends</h4>
            <p className="text-sm text-gray-600">Discover trending topics to analyze</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center">
            <Link className="h-8 w-8 text-green-500 mx-auto mb-3" />
            <h4 className="font-medium text-gray-900 mb-2">URL Library</h4>
            <p className="text-sm text-gray-600">Saved URLs for quick analysis</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onNavigateToBrief}>
          <CardContent className="p-6 text-center">
            <ArrowRight className="h-8 w-8 text-purple-500 mx-auto mb-3" />
            <h4 className="font-medium text-gray-900 mb-2">Create Brief</h4>
            <p className="text-sm text-gray-600">Turn signals into strategic briefs</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}